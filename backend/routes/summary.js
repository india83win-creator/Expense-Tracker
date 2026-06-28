const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// GET /api/summary -> overview stats for the dashboard, scoped to the signed-in user
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const today = now.toISOString().slice(0, 10);

    const totalAllResult = await db.query('SELECT COALESCE(SUM(amount), 0)::float as total FROM expenses WHERE user_id = $1', [userId]);
    const totalAll = totalAllResult.rows[0].total;

    const totalThisMonthResult = await db.query('SELECT COALESCE(SUM(amount), 0)::float as total FROM expenses WHERE user_id = $1 AND date >= $2', [userId, monthStart]);
    const totalThisMonth = totalThisMonthResult.rows[0].total;

    const totalTodayResult = await db.query('SELECT COALESCE(SUM(amount), 0)::float as total FROM expenses WHERE user_id = $1 AND date = $2', [userId, today]);
    const totalToday = totalTodayResult.rows[0].total;

    const expenseCountResult = await db.query('SELECT COUNT(*)::int as c FROM expenses WHERE user_id = $1', [userId]);
    const expenseCount = expenseCountResult.rows[0].c;

    const userResult = await db.query('SELECT monthly_budget FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];
    const monthlyBudget = user ? user.monthly_budget : 30000;

    const byCategoryResult = await db.query(
        `SELECT c.id, c.name, c.color, c.icon, COALESCE(SUM(e.amount), 0)::float as total
         FROM categories c
         LEFT JOIN expenses e ON e.category_id = c.id AND e.date >= $1 AND e.user_id = $2
         WHERE c.user_id = $3
         GROUP BY c.id
         HAVING COALESCE(SUM(e.amount), 0) > 0
         ORDER BY total DESC`,
        [monthStart, userId, userId]
    );
    const byCategory = byCategoryResult.rows;

    // Last 6 months trend
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = d.toISOString().slice(0, 10);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
      
      const totalResult = await db.query('SELECT COALESCE(SUM(amount), 0)::float as total FROM expenses WHERE user_id = $1 AND date >= $2 AND date <= $3', [userId, start, end]);
      const total = totalResult.rows[0].total;
      
      monthlyTrend.push({
        month: d.toLocaleString('en-US', { month: 'short' }),
        total: Math.round(total * 100) / 100,
      });
    }

    const topCategory = byCategory[0] || null;

    const recentResult = await db.query(
        `SELECT e.*, c.name as category_name, c.color as category_color, c.icon as category_icon
         FROM expenses e LEFT JOIN categories c ON c.id = e.category_id
         WHERE e.user_id = $1
         ORDER BY e.date DESC, e.id DESC LIMIT 6`,
        [userId]
    );
    const recent = recentResult.rows.map(e => ({
      ...e,
      date: typeof e.date === 'string' ? e.date : e.date.toISOString().split('T')[0]
    }));

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
  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ error: 'Failed to fetch summary data.' });
  }
});

module.exports = router;
