const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function setupFinance() {
  try {
    await pool.query("CREATE TABLE IF NOT EXISTS withdrawals (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, amount_diamonds INTEGER NOT NULL, iban VARCHAR(50) NOT NULL, status VARCHAR(20) DEFAULT 'pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);");
    console.log('success');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
setupFinance();
