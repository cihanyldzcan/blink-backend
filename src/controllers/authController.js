const db = require('../config/db');

exports.register = async (req, res) => {
  try {
    const { phone_number, gender, username, age } = req.body;
    if (!phone_number || !gender || !username || !age) {
      return res.status(400).json({ error: 'Tüm alanlar zorunludur.' });
    }

    // Check if phone already exists
    const existing = await db.query('SELECT id FROM users WHERE phone_number = $1', [phone_number]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Bu telefon numarası ile daha önce kayıt olunmuş.' });
    }

    let initialCoins = gender === 'Male' ? 50 : 0;
    let initialStatus = gender === 'Female' ? 'pending' : 'active';
    
    const result = await db.query(
      "INSERT INTO users (phone_number, gender, coins, username, age, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [phone_number, gender, initialCoins, username, age, initialStatus]
    );
    res.status(201).json({ message: 'Kayıt başarılı', user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Kayıt hatası' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user_id = req.query.user_id;
    const result = await db.query('SELECT * FROM users WHERE id = $1', [user_id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone_number } = req.body;
    const result = await db.query('SELECT * FROM users WHERE phone_number = $1', [phone_number]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    res.json({ message: 'Giriş başarılı', user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    const { user_id } = req.body;
    const host = req.get('host');
    const imgUrl = "http://" + host + "/uploads/" + req.file.filename;
    await db.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [imgUrl, user_id]);
    res.json({ message: 'Avatar yüklendi', avatar_url: imgUrl });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.buyCoins = async (req, res) => {
  try {
    const { user_id, amount } = req.body;
    await db.query('UPDATE users SET coins = coins + $1 WHERE id = $2', [amount, user_id]);
    res.json({ success: true, message: amount + ' Jeton eklendi' });
  } catch (error) {
    res.status(500).json({ error: 'Satın alma başarısız' });
  }
};

exports.updatePushToken = async (req, res) => {
  try {
    const { user_id, token } = req.body;
    await db.query('UPDATE users SET expo_push_token = $1 WHERE id = $2', [token, user_id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Push token güncellenemedi' });
  }
};
