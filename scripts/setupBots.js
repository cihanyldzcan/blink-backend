const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  try {
    console.log('Adding is_bot column...');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT FALSE;');
    
    console.log('Setting existing bots to true...');
    await pool.query("UPDATE users SET is_bot = TRUE WHERE username IN ('Aslı', 'Melis', 'Buse', 'Ceren', 'Ece');");

    console.log('Deleting all matches and messages...');
    await pool.query('DELETE FROM messages;');
    await pool.query('DELETE FROM matches;');

    console.log('Checking for bots...');
    const bots = await pool.query('SELECT id, username FROM users WHERE is_bot = TRUE');
    
    if (bots.rows.length === 0) {
      console.log('No bots found! Creating one...');
      const newBot = await pool.query(
        "INSERT INTO users (phone_number, gender, username, age, is_bot) VALUES ('+905550001122', 'Female', 'Ceren', 22, TRUE) RETURNING id"
      );
      bots.rows.push({ id: newBot.rows[0].id, username: 'Ceren' });
    }

    console.log('Creating capsules for bots...');
    await pool.query('DELETE FROM capsules WHERE user_id IN (SELECT id FROM users WHERE is_bot = TRUE)');
    
    for (const bot of bots.rows) {
      await pool.query(
        "INSERT INTO capsules (user_id, media_url, media_type, unlock_price) VALUES (, 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', 'image', 50)",
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
