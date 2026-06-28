const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'expenses.db');
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL;');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    monthly_budget REAL NOT NULL DEFAULT 30000,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#34D399',
    icon TEXT NOT NULL DEFAULT '\u2728',
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, name)
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
  CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
  CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id);
  CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);
`);

try {
  db.exec('ALTER TABLE users ADD COLUMN monthly_budget REAL NOT NULL DEFAULT 30000;');
} catch (e) {
  // Ignore error if column already exists
}

const DEFAULT_CATEGORIES = [
  ['Food & Dining', '#FBBF24', '\ud83c\udf7d\ufe0f'],
  ['Transport', '#60A5FA', '\ud83d\ude97'],
  ['Shopping', '#F472B6', '\ud83d\udecd\ufe0f'],
  ['Bills & Utilities', '#A78BFA', '\ud83e\uddfe'],
  ['Entertainment', '#34D399', '\ud83c\udfac'],
  ['Health', '#FB7185', '\ud83e\udea1'],
  ['Travel', '#22D3EE', '\u2708\ufe0f'],
  ['Other', '#94A3B8', '\ud83d\udce6'],
];

// Called once when a new user signs up — gives them a starter set of categories
function seedDefaultCategoriesForUser(userId) {
  const insert = db.prepare(
    'INSERT INTO categories (user_id, name, color, icon, is_default) VALUES (?, ?, ?, ?, 1)'
  );
  db.exec('BEGIN TRANSACTION');
  try {
    for (const row of DEFAULT_CATEGORIES) insert.run(userId, ...row);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

module.exports = db;
module.exports.seedDefaultCategoriesForUser = seedDefaultCategoriesForUser;
