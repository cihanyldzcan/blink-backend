const db = require('../config/db');

exports.sendGift = async (req, res) => {
  const { sender_id, match_id, gift_type, cost } = req.body;
  const FEMALE_COMMISSION = 0.20; // %20
  
  try {
    await db.query('BEGIN');
    
    // Find receiver from match
    const matchRes = await db.query('SELECT female_user_id, male_user_id FROM matches WHERE id = \', [match_id]);
    if (matchRes.rows.length === 0) throw new Error('Match not found');
    const match = matchRes.rows[0];
    
    // In our app, men send gifts to women. Let's assume sender is male.
    const receiver_id = sender_id == match.male_user_id ? match.female_user_id : match.male_user_id;

    // Check sender coins
    const senderRes = await db.query('SELECT coins FROM users WHERE id = \', [sender_id]);
    if (senderRes.rows[0].coins < cost) {
      await db.query('ROLLBACK');
      return res.status(400).json({ error: 'Yetersiz Jeton. Lütfen mağazadan jeton satın alın.' });
    }

    // Deduct coins
    await db.query('UPDATE users SET coins = coins - \ WHERE id = \', [cost, sender_id]);
    
    // Add diamonds
    const earnedDiamonds = Math.floor(cost * FEMALE_COMMISSION);
    await db.query('UPDATE users SET diamonds = diamonds + \ WHERE id = \', [earnedDiamonds, receiver_id]);

    // Send a system message in chat
    const messageContent = "\ gönderdi!"; 
    await db.query(
      "INSERT INTO messages (match_id, sender_id, content, created_at) VALUES (\, \, \, NOW())",
      [match_id, sender_id, "\ Hediye Gönderdi! (" + gift_type + ")"]
    );

    await db.query('COMMIT');
    res.json({ success: true, message: 'Hediye gönderildi' });
  } catch(e) {
    await db.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: 'Hediye gönderilemedi' });
  }
};
