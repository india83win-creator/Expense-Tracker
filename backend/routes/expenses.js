const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// GET expenses with optional filters: startDate, endDate, categoryId, search
router.get('/', (req, res) => {
  const { startDate, endDate, categoryId, search } = req.query;

  let query = `
    SELECT e.*, c.name as category_name, c.color as category_color, c.icon as category_icon
    FROM expenses e
    LEFT JOIN categories c ON c.id = e.category_id
    WHERE e.user_id = ?
  `;
  const params = [req.userId];

  if (startDate) {
    query += ' AND e.date >= ?';
    params.push(startDate);
  }
  if (endDate) {
    query += ' AND e.date <= ?';
    params.push(endDate);
  }
  if (categoryId) {
    query += ' AND e.category_id = ?';
    params.push(categoryId);
  }
  if (search) {
    query += ' AND e.description LIKE ?';
    params.push(`%${search}%`);
  }

  query += ' ORDER BY e.date DESC, e.id DESC';

  const expenses = db.prepare(query).all(...params);
  res.json(expenses);
});

// GET single expense
router.get('/:id', (req, res) => {
  const expense = db
    .prepare(
      `SELECT e.*, c.name as category_name, c.color as category_color, c.icon as category_icon
       FROM expenses e LEFT JOIN categories c ON c.id = e.category_id
       WHERE e.id = ? AND e.user_id = ?`
    )
    .get(req.params.id, req.userId);
  if (!expense) return res.status(404).json({ error: 'Expense not found.' });
  res.json(expense);
});

// POST create expense
router.post('/', (req, res) => {
  const { amount, description, categoryId, date } = req.body;

  if (amount === undefined || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
    return res.status(400).json({ error: 'A valid positive amount is required.' });
  }
  if (!categoryId) {
    return res.status(400).json({ error: 'A category is required.' });
  }
  if (!date) {
    return res.status(400).json({ error: 'A date is required.' });
  }

  // Make sure the category actually belongs to this user
  const category = db.prepare('SELECT id FROM categories WHERE id = ? AND user_id = ?').get(categoryId, req.userId);
  if (!category) {
    return res.status(400).json({ error: 'Invalid category.' });
  }

  const stmt = db.prepare(
    'INSERT INTO expenses (user_id, amount, description, category_id, date) VALUES (?, ?, ?, ?, ?)'
  );
  const result = stmt.run(req.userId, parseFloat(amount), description?.trim() || '', categoryId, date);

  const created = db
    .prepare(
      `SELECT e.*, c.name as category_name, c.color as category_color, c.icon as category_icon
       FROM expenses e LEFT JOIN categories c ON c.id = e.category_id WHERE e.id = ?`
    )
    .get(result.lastInsertRowid);

  res.status(201).json(created);
});

// PUT update expense
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM expenses WHERE id = ? AND user_id = ?').get(id, req.userId);
  if (!existing) return res.status(404).json({ error: 'Expense not found.' });

  const { amount, description, categoryId, date } = req.body;

  if (amount !== undefined && (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)) {
    return res.status(400).json({ error: 'Amount must be a valid positive number.' });
  }

  if (categoryId) {
    const category = db.prepare('SELECT id FROM categories WHERE id = ? AND user_id = ?').get(categoryId, req.userId);
    if (!category) return res.status(400).json({ error: 'Invalid category.' });
  }

  db.prepare(
    'UPDATE expenses SET amount = ?, description = ?, category_id = ?, date = ? WHERE id = ?'
  ).run(
    amount !== undefined ? parseFloat(amount) : existing.amount,
    description !== undefined ? description.trim() : existing.description,
    categoryId || existing.category_id,
    date || existing.date,
    id
  );

  const updated = db
    .prepare(
      `SELECT e.*, c.name as category_name, c.color as category_color, c.icon as category_icon
       FROM expenses e LEFT JOIN categories c ON c.id = e.category_id WHERE e.id = ?`
    )
    .get(id);

  res.json(updated);
});

// DELETE expense
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM expenses WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!existing) return res.status(404).json({ error: 'Expense not found.' });

  db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

module.exports = router;
