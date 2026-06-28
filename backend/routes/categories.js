const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// GET all categories for the signed-in user (with expense counts)
router.get('/', async (req, res) => {
  try {
    const categoriesResult = await db.query(
      `SELECT c.*, COUNT(e.id)::int as expense_count, COALESCE(SUM(e.amount), 0)::float as total_spent
       FROM categories c
       LEFT JOIN expenses e ON e.category_id = c.id AND e.user_id = c.user_id
       WHERE c.user_id = $1
       GROUP BY c.id
       ORDER BY c.is_default DESC, c.name ASC`,
      [req.userId]
    );
    res.json(categoriesResult.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

// POST create category
router.post('/', async (req, res) => {
  const { name, color, icon } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required.' });
  }
  try {
    const insertResult = await db.query(
      'INSERT INTO categories (user_id, name, color, icon, is_default) VALUES ($1, $2, $3, $4, 0) RETURNING *',
      [req.userId, name.trim(), color || '#34D399', icon || '✨']
    );
    res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Postgres unique violation
      return res.status(409).json({ error: 'A category with this name already exists.' });
    }
    res.status(500).json({ error: 'Could not create category.' });
  }
});

// PUT update category
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, color, icon } = req.body;
  
  try {
    const existingResult = await db.query('SELECT * FROM categories WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (existingResult.rows.length === 0) return res.status(404).json({ error: 'Category not found.' });
    const existing = existingResult.rows[0];

    const updatedResult = await db.query(
      'UPDATE categories SET name = $1, color = $2, icon = $3 WHERE id = $4 RETURNING *',
      [name?.trim() || existing.name, color || existing.color, icon || existing.icon, id]
    );
    res.json(updatedResult.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Could not update category.' });
  }
});

// DELETE category
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const existingResult = await db.query('SELECT * FROM categories WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (existingResult.rows.length === 0) return res.status(404).json({ error: 'Category not found.' });

    const inUseResult = await db.query('SELECT COUNT(*)::int as c FROM expenses WHERE category_id = $1', [id]);
    const inUse = inUseResult.rows[0].c;
    
    if (inUse > 0) {
      return res.status(409).json({
        error: `This category is used by ${inUse} expense${inUse > 1 ? 's' : ''}. Reassign or delete those first.`,
      });
    }

    await db.query('DELETE FROM categories WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Could not delete category.' });
  }
});

module.exports = router;
