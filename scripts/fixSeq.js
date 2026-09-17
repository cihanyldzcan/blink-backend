const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function fixSequence() {
  try {
    await pool.query("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))");
    console.log('Sequence fixed');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
fixSequence();
