const express = require('express');
const cors = require('cors');

const authRouter = require('./routes/auth');
const expensesRouter = require('./routes/expenses');
const categoriesRouter = require('./routes/categories');
const summaryRouter = require('./routes/summary');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/summary', summaryRouter);

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

const { initDb } = require('./db');

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Midnight Ledger API running at http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
