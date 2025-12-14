// Simple in-memory auth controller for local development
const users = [];

export function signup(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const exists = users.find((u) => u.email === email.toLowerCase());
    if (exists) return res.status(409).json({ message: 'User already exists' });

    users.push({ email: email.toLowerCase(), password });
    // return a demo token (base64 of email + timestamp)
    const token = Buffer.from(JSON.stringify({ email: email.toLowerCase(), ts: Date.now() })).toString('base64');
    return res.status(201).json({ message: 'User created', token });
  } catch (error) {
    console.error('Signup error', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = users.find((u) => u.email === email.toLowerCase());
    if (!user || user.password !== password) return res.status(401).json({ message: 'Invalid credentials' });

    const token = Buffer.from(JSON.stringify({ email: user.email, ts: Date.now() })).toString('base64');
    return res.status(200).json({ message: 'Logged in', token });
  } catch (error) {
    console.error('Login error', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
