const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
async function run() {
  await pool.query("UPDATE users SET is_bot = TRUE WHERE gender = 'Female'");
  console.log('Updated bots');
  process.exit(0);
}
run();
