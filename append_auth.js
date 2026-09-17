exports.buyCoins = async (req, res) => {
  const { user_id, amount } = req.body;
  try {
    const db = require('../config/db');
    await db.query('UPDATE users SET coins = coins + \ WHERE id = \', [amount, user_id]);
    res.json({ success: true, message: amount + ' Jeton eklendi' });
  } catch (err) {
    res.status(500).json({ error: 'Satın alma başarısız' });
  }
};
