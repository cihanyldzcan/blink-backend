const db = require('../config/db');

exports.unlockCapsule = async (req, res) => {
  const { male_user_id, capsule_id } = req.body;
  const CAPSULE_PRICE = 50;
  const FEMALE_COMMISSION = 0.20;

  try {
    await db.query('BEGIN');

    const capsuleRes = await db.query('SELECT user_id FROM capsules WHERE id = $1', [capsule_id]);
    if (capsuleRes.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ error: 'Kapsül bulunamadı.' });
    }
    const female_user_id = capsuleRes.rows[0].user_id;

    const maleUserRes = await db.query('SELECT coins FROM users WHERE id = $1', [male_user_id]);
    if (maleUserRes.rows.length === 0 || maleUserRes.rows[0].coins < CAPSULE_PRICE) {
      await db.query('ROLLBACK');
      return res.status(400).json({ error: 'Yetersiz Jeton.' });
    }

    await db.query('UPDATE users SET coins = coins - $1 WHERE id = $2', [CAPSULE_PRICE, male_user_id]);
    const commissionAmount = Math.floor(CAPSULE_PRICE * FEMALE_COMMISSION); 
    await db.query('UPDATE users SET diamonds = diamonds + $1 WHERE id = $2', [commissionAmount, female_user_id]);

    await db.query(
      "INSERT INTO transactions (sender_user_id, receiver_user_id, action_type, coins_spent, diamonds_earned, created_at) VALUES ($1, $2, 'capsule_unlock', $3, $4, NOW())",
      [male_user_id, female_user_id, CAPSULE_PRICE, commissionAmount]
    );

    await db.query(
      "INSERT INTO matches (male_user_id, female_user_id, created_at) VALUES ($1, $2, NOW()) ON CONFLICT (male_user_id, female_user_id) DO UPDATE SET last_message_at = NOW()",
      [male_user_id, female_user_id]
    );

    await db.query('COMMIT');
    res.json({ success: true, message: 'Kapsül açıldı ve eşleşme sağlandı.' });

  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Kapsül açma hatası:', error);
    res.status(500).json({ error: 'İşlem başarısız oldu.' });
  }
};

exports.sendGift = async (req, res) => {
  const { sender_id, match_id, gift_type, cost } = req.body;
  const FEMALE_COMMISSION = 0.20; 
  
  try {
    await db.query('BEGIN');
    const matchRes = await db.query('SELECT female_user_id, male_user_id FROM matches WHERE id = $1', [match_id]);
    if (matchRes.rows.length === 0) throw new Error('Match not found');
    const match = matchRes.rows[0];
    
    const receiver_id = sender_id == match.male_user_id ? match.female_user_id : match.male_user_id;

    const senderRes = await db.query('SELECT coins FROM users WHERE id = $1', [sender_id]);
    if (senderRes.rows[0].coins < cost) {
      await db.query('ROLLBACK');
      return res.status(400).json({ error: 'Yetersiz Jeton. Lütfen mağazadan satın alın.' });
    }

    await db.query('UPDATE users SET coins = coins - $1 WHERE id = $2', [cost, sender_id]);
    const earnedDiamonds = Math.floor(cost * FEMALE_COMMISSION);
    await db.query('UPDATE users SET diamonds = diamonds + $1 WHERE id = $2', [earnedDiamonds, receiver_id]);

    await db.query(
      "INSERT INTO messages (match_id, sender_id, content, created_at) VALUES ($1, $2, $3, NOW())",
      [match_id, sender_id, "🎁 Hediye Gönderdi! (" + gift_type + ")"]
    );

    await db.query('COMMIT');
    res.json({ success: true, message: 'Hediye gönderildi' });
  } catch(e) {
    await db.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'Hediye gönderilemedi' });
  }
};
