const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function spawnBots() {
  try {
    const maleRes = await pool.query("SELECT id FROM users WHERE gender = 'Male' LIMIT 1");
    if (maleRes.rows.length === 0) return;
    const maleId = maleRes.rows[0].id;

    const bots = [
      { username: 'Buse', phone: '+905001112233', age: 24, avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800' },
      { username: 'Selin', phone: '+905001112244', age: 26, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800' },
      { username: 'Aylin', phone: '+905001112255', age: 23, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800' }
    ];

    for (let b of bots) {
      const existRes = await pool.query('SELECT id FROM users WHERE phone_number = $1', [b.phone]);
      let botId;
      if (existRes.rows.length === 0) {
        const ins = await pool.query(
          "INSERT INTO users (phone_number, gender, username, age, avatar_url, coins, diamonds, is_verified_human) VALUES ($1, 'Female', $2, $3, $4, 0, 0, false) RETURNING id",
          [b.phone, b.username, b.age, b.avatar]
        );
        botId = ins.rows[0].id;
      } else {
        botId = existRes.rows[0].id;
      }

      const matchRes = await pool.query(
        'SELECT id FROM matches WHERE male_user_id = $1 AND female_user_id = $2',
        [maleId, botId]
      );
      let matchId;
      if (matchRes.rows.length === 0) {
        const mIns = await pool.query(
          'INSERT INTO matches (male_user_id, female_user_id) VALUES ($1, $2) RETURNING id',
          [maleId, botId]
        );
        matchId = mIns.rows[0].id;
      } else {
        matchId = matchRes.rows[0].id;
      }

      const messages = ["Selam, tanışalım mı?", "Profilini çok beğendim :)", "Nasılsın, buralarda mısın?"];
      const randMsg = messages[Math.floor(Math.random() * messages.length)];
      await pool.query(
        'INSERT INTO messages (match_id, sender_id, content) VALUES ($1, $2, $3)',
        [matchId, botId, randMsg]
      );
    }
    console.log('Botlar başarıyla yaratıldı!');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
spawnBots();
