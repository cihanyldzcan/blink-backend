const db = require('../config/db');

exports.register = async (req, res) => {
  try {
    const { phone_number, gender } = req.body;

    if (!phone_number || !gender) {
      return res.status(400).json({ error: 'Telefon numarası ve cinsiyet zorunludur.' });
    }

    if (gender !== 'Male' && gender !== 'Female') {
      return res.status(400).json({ error: 'Cinsiyet sadece Male veya Female olabilir.' });
    }

    // KURAL 1: Erkeklere 50 Jeton hediye (Hoş geldin bonusu)
    let initialCoins = 0;
    if (gender === 'Male') {
      initialCoins = 50;
    }

    // Kullanıcıyı veritabanına ekle
    const result = await db.query(
      `INSERT INTO users (phone_number, gender, coins) 
       VALUES ($1, $2, $3) RETURNING *`,
      [phone_number, gender, initialCoins]
    );

    const newUser = result.rows[0];

    res.status(201).json({
      message: 'Kullanıcı başarıyla kaydedildi.',
      user: newUser
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    // Unique constraint violation (Aynı numara zaten var)
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Bu telefon numarası zaten kayıtlı.' });
    }
    res.status(500).json({ error: 'Sunucu hatası oluştu.' });
  }
};
