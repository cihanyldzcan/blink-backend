const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function migrate() {
  try {
    await pool.query("CREATE TABLE IF NOT EXISTS blocks (id SERIAL PRIMARY KEY, blocker_id INTEGER REFERENCES users(id) ON DELETE CASCADE, blocked_id INTEGER REFERENCES users(id) ON DELETE CASCADE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(blocker_id, blocked_id));");
    await pool.query("CREATE TABLE IF NOT EXISTS reports (id SERIAL PRIMARY KEY, reporter_id INTEGER REFERENCES users(id) ON DELETE CASCADE, reported_id INTEGER REFERENCES users(id) ON DELETE CASCADE, reason TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);");
    console.log('Tables blocks and reports created successfully.');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
migrate();
