const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  try {
    console.log('Veritabanına bağlanılıyor...');
    const sqlPath = path.join(__dirname, 'src', 'db', 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Tablolar oluşturuluyor...');
    await pool.query(sql);
    
    console.log('Başarılı! Supabase tabloları başarıyla oluşturuldu.');
    process.exit(0);
  } catch (error) {
    console.error('Veritabanı kurulum hatası:', error);
    process.exit(1);
  }
}

runMigration();
