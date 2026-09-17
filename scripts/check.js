const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
async function run() {
  const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'capsules'");
  console.log(res.rows);
  process.exit(0);
}
run();
