const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function updateDb() {
  try {
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_photo_url TEXT");
    console.log('Database updated successfully');
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
updateDb();
