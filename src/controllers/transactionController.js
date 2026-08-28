const db = require('../config/db');

exports.unlockCapsule = async (req, res) => {
  const { male_user_id, capsule_id } = req.body;
  const CAPSULE_PRICE = 50;
  const FEMALE_COMMISSION = 0.20; // %20 Komisyon

  try {
    await db.query('BEGIN');

    // 1. Kapsülü bul ve sahibini (kadın) tespit et
    const capsuleRes = await db.query('SELECT user_id FROM capsules WHERE id = $1', [capsule_id]);
    if (capsuleRes.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ error: 'Kapsül bulunamadı.' });
    }
    const female_user_id = capsuleRes.rows[0].user_id;

    // 2. Erkek kullanıcının jetonunu kontrol et
    const maleUserRes = await db.query('SELECT coins FROM users WHERE id = $1', [male_user_id]);
    if (maleUserRes.rows.length === 0 || maleUserRes.rows[0].coins < CAPSULE_PRICE) {
      await db.query('ROLLBACK');
      return res.status(400).json({ error: 'Yetersiz Jeton.' });
    }

    // 3. Erkekten jetonu düş
    await db.query(
      'UPDATE users SET coins = coins - $1 WHERE id = $2',
      [CAPSULE_PRICE, male_user_id]
    );

    // 4. Kadına %20 komisyonu (elmas olarak) ekle
    const commissionAmount = Math.floor(CAPSULE_PRICE * FEMALE_COMMISSION); 
    await db.query(
      'UPDATE users SET diamonds = diamonds + $1 WHERE id = $2',
      [commissionAmount, female_user_id]
    );

    // 5. Log kaydı oluştur (transactions tablosu)
    await db.query(
      `INSERT INTO transactions (sender_user_id, receiver_user_id, action_type, coins_spent, diamonds_earned, created_at) 
       VALUES ($1, $2, 'capsule_unlock', $3, $4, NOW())`,
      [male_user_id, female_user_id, CAPSULE_PRICE, commissionAmount]
    );

    // 6. EŞLEŞME (Match) OLUŞTUR VEYA GÜNCELLE
    // Eğer daha önce eşleşmişlerse hata vermesin, ON CONFLICT DO NOTHING
    await db.query(
      `INSERT INTO matches (male_user_id, female_user_id, created_at) 
       VALUES ($1, $2, NOW()) 
       ON CONFLICT (male_user_id, female_user_id) DO UPDATE SET last_message_at = NOW()`,
      [male_user_id, female_user_id]
    );

    await db.query('COMMIT');

    res.json({
      success: true,
      message: `Kapsül açıldı ve eşleşme sağlandı. Erkekten ${CAPSULE_PRICE} jeton düştü. Kadına ${commissionAmount} elmas eklendi.`
    });

  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Kapsül açma hatası:', error);
    res.status(500).json({ error: 'İşlem başarısız oldu.' });
  }
};
