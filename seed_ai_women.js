require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const AI_WOMEN = [
  { id: 10, phone: '+905550000010', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400' },
  { id: 11, phone: '+905550000011', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400' },
  { id: 12, phone: '+905550000012', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' },
  { id: 13, phone: '+905550000013', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400' },
  { id: 14, phone: '+905550000014', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400' },
];

async function seed() {
  try {
    for (const woman of AI_WOMEN) {
      await pool.query(
        "INSERT INTO users (id, phone_number, gender, coins, diamonds) VALUES ($1, $2, 'Female', 0, 100) ON CONFLICT (id) DO NOTHING;",
        [woman.id, woman.phone]
      );
      
      // Her kadın için 1 Kapsül oluştur
      await pool.query(
        "INSERT INTO capsules (user_id, image_url, is_blurred) VALUES ($1, $2, true) ON CONFLICT DO NOTHING;",
        [woman.id, woman.image]
      );
    }
    
    // Test kullanıcısına (Erkek) Kilit açabilmesi için 1000 Jeton yükleyelim
    await pool.query("UPDATE users SET coins = 1000 WHERE id = 1");

    console.log('5 AI women ve Kapsülleri eklendi!');
    process.exit(0);
  } catch(e) {
    console.log(e);
    process.exit(1);
  }
}
seed();
