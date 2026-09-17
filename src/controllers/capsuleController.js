const db = require('../config/db');

exports.uploadCapsule = async (req, res) => {
  try {
    const { user_id, caption } = req.body;
    if (!req.file || !user_id) return res.status(400).json({ error: 'Eksik alan' });
    const host = req.get('host');
    const image_url = "http://" + host + "/uploads/" + req.file.filename;
    const result = await db.query(
      "INSERT INTO capsules (user_id, image_url, caption) VALUES ($1, $2, $3) RETURNING *",
      [user_id, image_url, caption || '']
    );
    res.status(201).json({ capsule: result.rows[0] });
  } catch (error) { res.status(500).json({ error: 'Hata' }); }
};

exports.getDiscoveryFeed = async (req, res) => {
  try {
    const viewerId = req.query.user_id;
    if (!viewerId) return res.status(400).json({ error: 'user_id required' });

    const viewerResult = await db.query('SELECT gender, latitude, longitude FROM users WHERE id = $1', [viewerId]);
    if (viewerResult.rows.length === 0) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    
    const viewerGender = viewerResult.rows[0].gender;
    const vLat = viewerResult.rows[0].latitude || 41.0082;
    const vLng = viewerResult.rows[0].longitude || 28.9784;

    const targetGender = viewerGender === 'Male' ? 'Female' : 'Male';

    const feedResult = await db.query(
      `SELECT c.id, c.image_url, c.caption, c.created_at, u.id as owner_id, u.gender, u.username, u.age,
       COALESCE(
         6371 * acos(
           cos(radians($2)) * cos(radians(u.latitude)) * cos(radians(u.longitude) - radians($3)) + 
           sin(radians($2)) * sin(radians(u.latitude))
         ), 0
       ) AS distance_km
       FROM capsules c
       JOIN users u ON c.user_id = u.id
       WHERE u.gender = $1 
         AND c.created_at >= NOW() - INTERVAL '24 HOURS'
         AND u.id NOT IN (SELECT blocked_id FROM blocks WHERE blocker_id = $4)
       ORDER BY c.created_at DESC`,
      [targetGender, vLat, vLng, viewerId]
    );

    let feed = feedResult.rows;

    if (viewerGender === 'Male') {
      const matchesRes = await db.query('SELECT female_user_id FROM matches WHERE male_user_id = $1', [viewerId]);
      const unlockedIds = matchesRes.rows.map(m => m.female_user_id);
      
      feed = feed.map(capsule => ({
        ...capsule,
        is_blurred: !unlockedIds.includes(capsule.owner_id)
      }));
    } else {
      feed = feed.map(c => ({...c, is_blurred: false}));
    }

    res.status(200).json({ capsules: feed });

  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};
