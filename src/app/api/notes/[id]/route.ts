import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Note from '@/models/Note';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

async function getUser(request: Request) {
  const cookieStore = await cookies();
  let token = cookieStore.get('token')?.value;
  
  if (!token) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }
  
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
  } catch (err) {
    return null;
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { id } = await params;
    
    // Ensure the note belongs to the user
    const deletedNote = await Note.findOneAndDelete({ _id: id, owner: user.email });
    
    if (!deletedNote) {
      return NextResponse.json({ success: false, error: 'Note not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    await connectToDatabase();
    const { id } = await params;
    
    const note = await Note.findOneAndUpdate({ _id: id, owner: user.email }, body, {
      new: true,
      runValidators: true,
    });

    if (!note) {
      return NextResponse.json({ success: false, error: 'Note not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: note });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server Error' }, { status: 500 });
  }
}
