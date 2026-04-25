import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Note from '@/models/Note';
import nodemailer from 'nodemailer';

export async function GET(request: Request) {
  try {
    // Authenticate CRON Job (Vercel standard pattern).
    // Allow local bypassing during development testing via a query parameter or just skip for now if testing, but secure in prod.
    const authHeader = request.headers.get('authorization');
    if (
      process.env.NODE_ENV === 'production' &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ success: false, error: 'Unauthorized CRON.' }, { status: 401 });
    }

    await connectToDatabase();

    // Compute Current Day Boundaries (Midnight to Midnight)
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setUTCHours(23, 59, 59, 999);

    // Find all notes with reminders set for today.
    const notesToRemind = await Note.find({
      reminder: {
        $gte: startOfToday,
        $lte: endOfToday,
      },
    });

    if (notesToRemind.length === 0) {
      return NextResponse.json({ success: true, message: 'No reminders for today.' });
    }

    let transporter;
    let isTestAccount = false;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      // Generate test SMTP service account from ethereal.email
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, 
        auth: {
          user: testAccount.user, 
          pass: testAccount.pass, 
        },
      });
      isTestAccount = true;
    }

    let emailsSent = 0;
    let testUrls: string[] = [];

    for (const note of notesToRemind) {
      // The `owner` field stores the user's email explicitly.
      const userEmail = note.owner;

      const mailOptions = {
        from: `"Kurripu Notes" <${process.env.EMAIL_USER || 'test@ethereal.email'}>`,
        to: userEmail,
        subject: `Reminder: ${note.title} (Kurripu)`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #9C88FF; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Kurripu Reminder</h2>
            <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 20px 0;" />
            <h3 style="color: #333; font-size: 24px;">${note.title}</h3>
            <p style="color: #666; line-height: 1.6; font-size: 16px; white-space: pre-wrap;">${note.content}</p>
            <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #999; text-align: center;">This is an automated reminder from your Kurripu Dashboard.</p>
          </div>
        `,
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        emailsSent++;
        if (isTestAccount) {
          const url = nodemailer.getTestMessageUrl(info);
          if (url) testUrls.push(url);
        }
      } catch (err) {
        console.error(`Failed to send email to ${userEmail}`, err);
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: notesToRemind.length, 
      sent: emailsSent,
      testUrls: testUrls.length > 0 ? testUrls : undefined
    });
  } catch (error: any) {
    console.error('CRON Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Server Error' }, { status: 500 });
  }
}
