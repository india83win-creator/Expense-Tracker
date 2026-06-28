const { Pool } = require('pg');

// UseDATABASE_URL from environment if available, else a placeholder
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres',
});

// We need a helper to run queries since we use pool.query a lot
// In pg, pool.query is async. All our routes will be updated to async.
const db = {
  query: (text, params) => pool.query(text, params),
};

const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      monthly_budget DOUBLE PRECISION NOT NULL DEFAULT 30000,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      name VARCHAR(255) NOT NULL,
      color VARCHAR(50) NOT NULL DEFAULT '#34D399',
      icon VARCHAR(50) NOT NULL DEFAULT '✨',
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE (user_id, name)
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      amount DOUBLE PRECISION NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      category_id INTEGER,
      date DATE NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
    CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
    CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id);
    CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);
  `);
};

const DEFAULT_CATEGORIES = [
  ['Food & Dining', '#FBBF24', '🍽️'],
  ['Transport', '#60A5FA', '🚗'],
  ['Shopping', '#F472B6', '🛍️'],
  ['Bills & Utilities', '#A78BFA', '🧾'],
  ['Entertainment', '#34D399', '🎬'],
  ['Health', '#FB7185', '🩻'],
  ['Travel', '#22D3EE', '✈️'],
  ['Other', '#94A3B8', '📦'],
];

async function seedDefaultCategoriesForUser(userId) {
  const query = 'INSERT INTO categories (user_id, name, color, icon, is_default) VALUES ($1, $2, $3, $4, 1)';
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const row of DEFAULT_CATEGORIES) {
      await client.query(query, [userId, ...row]);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = db;
module.exports.initDb = initDb;
module.exports.seedDefaultCategoriesForUser = seedDefaultCategoriesForUser;
