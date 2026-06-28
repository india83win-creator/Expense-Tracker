const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

const TOKEN_EXPIRY = '7d';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
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

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = db
    .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
    .run(name.trim(), email.toLowerCase(), passwordHash);

  db.seedDefaultCategoriesForUser(result.lastInsertRowid);

  const token = jwt.sign({ userId: result.lastInsertRowid }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });

  res.status(201).json({
    token,
    user: { id: result.lastInsertRowid, name: name.trim(), email: email.toLowerCase() },
  });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!isValidEmail(email) || !password) {
    return res.status(400).json({ error: 'Enter a valid email and password.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// GET /api/auth/me — used to restore the session on app load
router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user });
});

// PUT /api/auth/budget - update monthly budget
router.put('/budget', requireAuth, (req, res) => {
  const { amount } = req.body;
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Invalid budget amount.' });
  }
  db.prepare('UPDATE users SET monthly_budget = ? WHERE id = ?').run(amount, req.userId);
  res.json({ message: 'Budget updated successfully.', monthly_budget: amount });
});

module.exports = router;
