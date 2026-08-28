const db = require('../config/db');

// Kullanıcının mesajlaştığı (eşleştiği) kişileri getirir
exports.getMatches = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'user_id gerekli' });

    // Kullanıcının cinsiyetini bulalım
    const userRes = await db.query('SELECT gender FROM users WHERE id = $1', [user_id]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    const gender = userRes.rows[0].gender;

    let matchesQuery;
    if (gender === 'Male') {
      matchesQuery = `
        SELECT m.id as match_id, m.is_video_call_unlocked, u.id as partner_id, c.image_url as partner_avatar
        FROM matches m
        JOIN users u ON m.female_user_id = u.id
        LEFT JOIN capsules c ON c.user_id = u.id
        WHERE m.male_user_id = $1
        ORDER BY m.last_message_at DESC
      `;
    } else {
      matchesQuery = `
        SELECT m.id as match_id, m.is_video_call_unlocked, u.id as partner_id, c.image_url as partner_avatar
        FROM matches m
        JOIN users u ON m.male_user_id = u.id
        LEFT JOIN capsules c ON c.user_id = u.id
        WHERE m.female_user_id = $1
        ORDER BY m.last_message_at DESC
      `;
    }

    const matchesRes = await db.query(matchesQuery, [user_id]);
    
    // Her kullanıcı için sadece en güncel kapsülü (avatarı) almak adına gruplama yapabiliriz, 
    // ama basitlik için ilk satırı alıyoruz.
    res.json({ matches: matchesRes.rows });
  } catch (error) {
    console.error('getMatches error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

// Eşleşmeye ait eski mesajları getirir
exports.getMessages = async (req, res) => {
  try {
    const { match_id } = req.params;
    
    const messagesRes = await db.query(
      `SELECT * FROM messages WHERE match_id = $1 ORDER BY created_at ASC`,
      [match_id]
    );

    res.json({ messages: messagesRes.rows });
  } catch (error) {
    console.error('getMessages error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};
