require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  try {
    await pool.query("INSERT INTO users (id, phone_number, gender, coins, diamonds) VALUES (1, '+905550000001', 'Male', 50, 0) ON CONFLICT (id) DO NOTHING;");
    await pool.query("INSERT INTO users (id, phone_number, gender, coins, diamonds) VALUES (2, '+905550000002', 'Female', 0, 100) ON CONFLICT (id) DO NOTHING;");
    await pool.query("INSERT INTO capsules (user_id, image_url, is_blurred) VALUES (2, 'https://picsum.photos/400/600', true) ON CONFLICT DO NOTHING;");
    console.log('Seeded');
    process.exit(0);
  } catch(e) {
    console.log(e);
    process.exit(1);
  }
}
seed();
