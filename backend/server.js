const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRouter = require('./routes/auth');
const expensesRouter = require('./routes/expenses');
const categoriesRouter = require('./routes/categories');
const summaryRouter = require('./routes/summary');

const app = express();
const PORT = process.env.PORT || 4000;

// Security Middleware: Set HTTP headers to protect against common web vulnerabilities
app.use(helmet());

// Security Middleware: CORS
// In production, restrict to VITE_API_URL or a specific domain. For now, allow all if not set.
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL 
    : '*',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10kb' })); // Security: Limit body size

// Security Middleware: General Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes)
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', globalLimiter);

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
