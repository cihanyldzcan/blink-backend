const db = require('../config/db');

exports.register = async (req, res) => {
  // existing register code...
};

exports.getMe = async (req, res) => {
  try {
    const user_id = req.query.user_id;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });
    
    const result = await db.query('SELECT id, phone_number, gender, coins, diamonds FROM users WHERE id = ', [user_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
