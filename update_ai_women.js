require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const AI_WOMEN = [
  { id: 10, username: 'Ecem', age: 26 },
  { id: 11, username: 'Aylin', age: 24 },
  { id: 12, username: 'Buse', age: 22 },
  { id: 13, username: 'Ceren', age: 27 },
  { id: 14, username: 'Derya', age: 25 },
];

async function update() {
  try {
    for (const woman of AI_WOMEN) {
      await pool.query(
        "UPDATE users SET username = $1, age = $2 WHERE id = $3",
        [woman.username, woman.age, woman.id]
      );
    }
    
    console.log('AI women güncellendi!');
    process.exit(0);
  } catch(e) {
    console.log(e);
    process.exit(1);
  }
}
update();
