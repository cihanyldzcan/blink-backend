const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
async function run() {
  try {
    const res = await pool.query("SELECT id FROM users WHERE gender = 'Female' LIMIT 3");
    for (let i = 0; i < res.rows.length; i++) {
        let id = res.rows[i].id;
        const q = "INSERT INTO capsules (user_id, image_url, caption) VALUES (" + id + ", 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e', 'Selam!')";
        await pool.query(q);
    }
    console.log('Capsules created!');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
