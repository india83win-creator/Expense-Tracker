const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// GET /api/summary -> overview stats for the dashboard, scoped to the signed-in user
router.get('/', (req, res) => {
  const userId = req.userId;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const today = now.toISOString().slice(0, 10);

  const totalAll = db
    .prepare('SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE user_id = ?')
    .get(userId).total;

  const totalThisMonth = db
    .prepare('SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE user_id = ? AND date >= ?')
    .get(userId, monthStart).total;

  const totalToday = db
    .prepare('SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE user_id = ? AND date = ?')
    .get(userId, today).total;

  const expenseCount = db.prepare('SELECT COUNT(*) as c FROM expenses WHERE user_id = ?').get(userId).c;

  const user = db.prepare('SELECT monthly_budget FROM users WHERE id = ?').get(userId);
  const monthlyBudget = user ? user.monthly_budget : 30000;

  const byCategory = db
    .prepare(
      `SELECT c.id, c.name, c.color, c.icon, COALESCE(SUM(e.amount),0) as total
       FROM categories c
       LEFT JOIN expenses e ON e.category_id = c.id AND e.date >= ? AND e.user_id = ?
       WHERE c.user_id = ?
       GROUP BY c.id
       HAVING total > 0
       ORDER BY total DESC`
    )
    .all(monthStart, userId, userId);

  // Last 6 months trend
  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = d.toISOString().slice(0, 10);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
    const total = db
      .prepare('SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE user_id = ? AND date >= ? AND date <= ?')
      .get(userId, start, end).total;
    monthlyTrend.push({
      month: d.toLocaleString('en-US', { month: 'short' }),
      total: Math.round(total * 100) / 100,
    });
  }

  const topCategory = byCategory[0] || null;

  const recent = db
    .prepare(
      `SELECT e.*, c.name as category_name, c.color as category_color, c.icon as category_icon
       FROM expenses e LEFT JOIN categories c ON c.id = e.category_id
       WHERE e.user_id = ?
       ORDER BY e.date DESC, e.id DESC LIMIT 6`
    )
    .all(userId);

  res.json({
    totalAll,
    totalThisMonth,
    totalToday,
    expenseCount,
    byCategory,
    monthlyTrend,
    topCategory,
    recent,
    monthlyBudget,
  });
});

module.exports = router;
