const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  try {
    const bots = await pool.query('SELECT id, username FROM users WHERE is_bot = TRUE');
    await pool.query('DELETE FROM capsules WHERE user_id IN (SELECT id FROM users WHERE is_bot = TRUE)');
    
    for (const bot of bots.rows) {
      await pool.query(
        "INSERT INTO capsules (user_id, image_url, caption) VALUES (, 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'Merhaba, tanışalım mı?')",
        [bot.id]
      );
      console.log('Created capsule for', bot.username);
    }
    console.log('Done!');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
