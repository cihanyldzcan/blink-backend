exports.login = async (req, res) => {
  try {
    const { phone_number } = req.body;
    if (!phone_number) return res.status(400).json({ error: 'Telefon numarası zorunludur.' });
    
    const result = await require('../config/db').query('SELECT * FROM users WHERE phone_number = ', [phone_number]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    
    res.json({ message: 'Giriş başarılı', user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
