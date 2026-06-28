const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// GET all categories for the signed-in user (with expense counts)
router.get('/', (req, res) => {
  const categories = db
    .prepare(
      `SELECT c.*, COUNT(e.id) as expense_count, COALESCE(SUM(e.amount), 0) as total_spent
       FROM categories c
       LEFT JOIN expenses e ON e.category_id = c.id AND e.user_id = c.user_id
       WHERE c.user_id = ?
       GROUP BY c.id
       ORDER BY c.is_default DESC, c.name ASC`
    )
    .all(req.userId);
  res.json(categories);
});

// POST create category
router.post('/', (req, res) => {
  const { name, color, icon } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required.' });
  }
  try {
    const stmt = db.prepare(
      'INSERT INTO categories (user_id, name, color, icon, is_default) VALUES (?, ?, ?, ?, 0)'
    );
    const result = stmt.run(req.userId, name.trim(), color || '#34D399', icon || '\u2728');
    const created = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(created);
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'A category with this name already exists.' });
    }
    res.status(500).json({ error: 'Could not create category.' });
  }
});

// PUT update category
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, color, icon } = req.body;
  const existing = db.prepare('SELECT * FROM categories WHERE id = ? AND user_id = ?').get(id, req.userId);
  if (!existing) return res.status(404).json({ error: 'Category not found.' });

  try {
    db.prepare('UPDATE categories SET name = ?, color = ?, icon = ? WHERE id = ?').run(
      name?.trim() || existing.name,
      color || existing.color,
      icon || existing.icon,
      id
    );
    const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Could not update category.' });
  }
});

// DELETE category
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM categories WHERE id = ? AND user_id = ?').get(id, req.userId);
  if (!existing) return res.status(404).json({ error: 'Category not found.' });

  const inUse = db.prepare('SELECT COUNT(*) as c FROM expenses WHERE category_id = ?').get(id).c;
  if (inUse > 0) {
    return res.status(409).json({
      error: `This category is used by ${inUse} expense${inUse > 1 ? 's' : ''}. Reassign or delete those first.`,
    });
  }

  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  res.status(204).send();
});

module.exports = router;
