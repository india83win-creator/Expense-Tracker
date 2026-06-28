const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

const TOKEN_EXPIRY = '7d';

// Security: stricter rate limit for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 login/signup requests per `window`
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
}

// POST /api/auth/signup
router.post('/signup', authLimiter, async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Please enter your name.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const existingResult = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existingResult.rows.length > 0) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const insertResult = await db.query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
    [name.trim(), email.toLowerCase(), passwordHash]
  );
  
  const newUserId = insertResult.rows[0].id;

  await db.seedDefaultCategoriesForUser(newUserId);

  const token = jwt.sign({ userId: newUserId }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });

  res.status(201).json({
    token,
    user: { id: newUserId, name: name.trim(), email: email.toLowerCase() },
  });
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!isValidEmail(email) || !password) {
    return res.status(400).json({ error: 'Enter a valid email and password.' });
  }

  const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  if (userResult.rows.length === 0) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }
  
  const user = userResult.rows[0];

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// GET /api/auth/me — used to restore the session on app load
router.get('/me', requireAuth, async (req, res) => {
  const userResult = await db.query('SELECT id, name, email FROM users WHERE id = $1', [req.userId]);
  if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: userResult.rows[0] });
});

// PUT /api/auth/budget - update monthly budget
router.put('/budget', requireAuth, async (req, res) => {
  const { amount } = req.body;
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Invalid budget amount.' });
  }
  await db.query('UPDATE users SET monthly_budget = $1 WHERE id = $2', [amount, req.userId]);
  res.json({ message: 'Budget updated successfully.', monthly_budget: amount });
});

module.exports = router;
