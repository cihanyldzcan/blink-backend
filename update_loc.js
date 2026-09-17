require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const BASE_LAT = 41.0082;
const BASE_LNG = 28.9784;
const AI_WOMEN = [
  { id: 10, lat: BASE_LAT + 0.01, lng: BASE_LNG + 0.02 },
  { id: 11, lat: BASE_LAT - 0.03, lng: BASE_LNG - 0.01 },
  { id: 12, lat: BASE_LAT + 0.05, lng: BASE_LNG + 0.05 },
  { id: 13, lat: BASE_LAT - 0.02, lng: BASE_LNG + 0.08 },
  { id: 14, lat: BASE_LAT + 0.1, lng: BASE_LNG - 0.05 },
];
async function update() {
  try {
    for (const woman of AI_WOMEN) {
      await pool.query('UPDATE users SET latitude = $1, longitude = $2 WHERE id = $3', [woman.lat, woman.lng, woman.id]);
    }
    console.log('updated');
    process.exit(0);
  } catch(e) { console.log(e); process.exit(1); }
}
update();
