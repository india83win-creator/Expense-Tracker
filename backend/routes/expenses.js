const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// GET expenses with optional filters: startDate, endDate, categoryId, search
router.get('/', async (req, res) => {
  const { startDate, endDate, categoryId, search } = req.query;

  let query = `
    SELECT e.*, c.name as category_name, c.color as category_color, c.icon as category_icon
    FROM expenses e
    LEFT JOIN categories c ON c.id = e.category_id
    WHERE e.user_id = $1
  `;
  const params = [req.userId];
  let paramCount = 1;

  if (startDate) {
    paramCount++;
    query += ` AND e.date >= $${paramCount}`;
    params.push(startDate);
  }
  if (endDate) {
    paramCount++;
    query += ` AND e.date <= $${paramCount}`;
    params.push(endDate);
  }
  if (categoryId) {
    paramCount++;
    query += ` AND e.category_id = $${paramCount}`;
    params.push(categoryId);
  }
  if (search) {
    paramCount++;
    query += ` AND e.description ILIKE $${paramCount}`; // ILIKE for case-insensitive Postgres search
    params.push(`%${search}%`);
  }

  query += ' ORDER BY e.date DESC, e.id DESC';

  try {
    const expensesResult = await db.query(query, params);
    // Format date objects to strings for the frontend
    const expenses = expensesResult.rows.map(e => ({
      ...e,
      date: typeof e.date === 'string' ? e.date : e.date.toISOString().split('T')[0]
    }));
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expenses.' });
  }
});

// GET single expense
router.get('/:id', async (req, res) => {
  try {
    const expenseResult = await db.query(
      `SELECT e.*, c.name as category_name, c.color as category_color, c.icon as category_icon
       FROM expenses e LEFT JOIN categories c ON c.id = e.category_id
       WHERE e.id = $1 AND e.user_id = $2`,
      [req.params.id, req.userId]
    );
    if (expenseResult.rows.length === 0) return res.status(404).json({ error: 'Expense not found.' });
    const expense = expenseResult.rows[0];
    expense.date = typeof expense.date === 'string' ? expense.date : expense.date.toISOString().split('T')[0];
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expense.' });
  }
});

// POST create expense
router.post('/', async (req, res) => {
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

  try {
    const categoryResult = await db.query('SELECT id FROM categories WHERE id = $1 AND user_id = $2', [categoryId, req.userId]);
    if (categoryResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid category.' });
    }

    const insertResult = await db.query(
      'INSERT INTO expenses (user_id, amount, description, category_id, date) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [req.userId, parseFloat(amount), description?.trim() || '', categoryId, date]
    );

    const createdResult = await db.query(
      `SELECT e.*, c.name as category_name, c.color as category_color, c.icon as category_icon
       FROM expenses e LEFT JOIN categories c ON c.id = e.category_id WHERE e.id = $1`,
      [insertResult.rows[0].id]
    );
    
    const created = createdResult.rows[0];
    created.date = typeof created.date === 'string' ? created.date : created.date.toISOString().split('T')[0];
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Could not create expense.' });
  }
});

// PUT update expense
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const existingResult = await db.query('SELECT * FROM expenses WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (existingResult.rows.length === 0) return res.status(404).json({ error: 'Expense not found.' });
    const existing = existingResult.rows[0];

    const { amount, description, categoryId, date } = req.body;

    if (amount !== undefined && (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)) {
      return res.status(400).json({ error: 'Amount must be a valid positive number.' });
    }

    if (categoryId) {
      const categoryResult = await db.query('SELECT id FROM categories WHERE id = $1 AND user_id = $2', [categoryId, req.userId]);
      if (categoryResult.rows.length === 0) return res.status(400).json({ error: 'Invalid category.' });
    }

    await db.query(
      'UPDATE expenses SET amount = $1, description = $2, category_id = $3, date = $4 WHERE id = $5',
      [
        amount !== undefined ? parseFloat(amount) : existing.amount,
        description !== undefined ? description.trim() : existing.description,
        categoryId || existing.category_id,
        date || existing.date,
        id
      ]
    );

    const updatedResult = await db.query(
      `SELECT e.*, c.name as category_name, c.color as category_color, c.icon as category_icon
       FROM expenses e LEFT JOIN categories c ON c.id = e.category_id WHERE e.id = $1`,
      [id]
    );

    const updated = updatedResult.rows[0];
    updated.date = typeof updated.date === 'string' ? updated.date : updated.date.toISOString().split('T')[0];
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Could not update expense.' });
  }
});

// DELETE expense
router.delete('/:id', async (req, res) => {
  try {
    const existingResult = await db.query('SELECT id FROM expenses WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (existingResult.rows.length === 0) return res.status(404).json({ error: 'Expense not found.' });

    await db.query('DELETE FROM expenses WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Could not delete expense.' });
  }
});

module.exports = router;
