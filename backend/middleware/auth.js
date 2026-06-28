const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'midnight-ledger-dev-secret-change-me';

if (JWT_SECRET === 'midnight-ledger-dev-secret-change-me' && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ SECURITY WARNING: You are using the default JWT_SECRET in production. This is highly insecure. Please set the JWT_SECRET environment variable.');
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'You need to sign in to do that.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
  }
}

module.exports = { requireAuth, JWT_SECRET };
