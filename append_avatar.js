exports.uploadAvatar = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!req.file || !user_id) {
      return res.status(400).json({ error: 'Kullanıcı ID ve Resim zorunludur.' });
    }
    const host = req.get('host');
    const avatar_url = "http:// + host + /uploads/ + req.file.filename + "; // Using quotes to avoid issues with template literals in script
    // Note: PowerShell string interpolation is annoying. Let's just use string concat.
    
    // Using string concat in JS
    const imgUrl = "http://" + host + "/uploads/" + req.file.filename;

    const db = require('../config/db');
    await db.query('UPDATE users SET avatar_url =  WHERE id = ', [imgUrl, user_id]);

    res.json({ message: 'Avatar yüklendi', avatar_url: imgUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
