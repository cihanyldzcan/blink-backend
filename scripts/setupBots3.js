const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  try {
    const res = await pool.query("SELECT id FROM users WHERE gender = 'Female'");
    console.log('Females found:', res.rows.length);

    await pool.query("UPDATE users SET is_bot = TRUE WHERE gender = 'Female'");
    await pool.query("DELETE FROM matches");
    await pool.query("DELETE FROM messages");
    await pool.query("DELETE FROM capsules");

    for (let i = 0; i < res.rows.length; i++) {
        let id = res.rows[i].id;
        await pool.query("INSERT INTO capsules (user_id, image_url, caption) VALUES (, , )", 
          [id, 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'Selam!']
        );
    }
    console.log('Capsules created!');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
