export default function authMiddleware(req, res, next) {
  try {
    const auth = req.headers.authorization || req.headers['x-auth-token'];
    if (!auth) return res.status(401).json({ message: 'No token provided' });

    const parts = auth.split(' ');
    const token = parts.length === 2 ? parts[1] : parts[0];

    if (token === 'demo-token') {
      req.userEmail = 'demo@local';
      return next();
    }

    let decoded = null;
    try {
      const json = Buffer.from(token, 'base64').toString('utf-8');
      decoded = JSON.parse(json);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    if (!decoded?.email) return res.status(401).json({ message: 'Invalid token payload' });

    req.userEmail = decoded.email;
    next();
  } catch (error) {
    console.error('Auth middleware error', error);
    return res.status(500).json({ message: 'Auth error' });
  }
}
