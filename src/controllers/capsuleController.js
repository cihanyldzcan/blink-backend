const db = require('../config/db');

// Fotoğraf Yükleme (Kapsül)
exports.uploadCapsule = async (req, res) => {
  try {
    const { user_id } = req.body;
    
    // multer dosyamızı req.file içerisine atar
    if (!req.file || !user_id) {
      return res.status(400).json({ error: 'Kullanıcı ID ve Resim dosyası zorunludur.' });
    }

    // Geliştirme ortamında (Android emülatör vs) erişim için IP'yi alıyoruz (gerçekte CDN url'i olur)
    const host = req.get('host');
    const image_url = `http://${host}/uploads/${req.file.filename}`;

    const result = await db.query(
      `INSERT INTO capsules (user_id, image_url) 
       VALUES ($1, $2) RETURNING *`,
      [user_id, image_url]
    );

    res.status(201).json({
      message: 'Kapsül başarıyla yüklendi.',
      capsule: result.rows[0]
    });
  } catch (error) {
    console.error('Kapsül yükleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası oluştu.' });
  }
};

// Keşfet (Vitrin) Akışını Getirme
exports.getDiscoveryFeed = async (req, res) => {
  try {
    // Mobil uygulama, isteği yapan kullanıcının ID'sini gönderir
    const viewerId = req.query.user_id;

    if (!viewerId) {
      return res.status(400).json({ error: 'Görüntüleyen kullanıcı ID (user_id) gereklidir.' });
    }

    // İstek yapan kullanıcının cinsiyetini bul
    const viewerResult = await db.query('SELECT gender FROM users WHERE id = $1', [viewerId]);
    if (viewerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }
    
    const viewerGender = viewerResult.rows[0].gender;

    // KURAL 2: Erkekler sadece kadınları görür, Kadınlar sadece erkekleri.
    const targetGender = viewerGender === 'Male' ? 'Female' : 'Male';

    // O günkü (son 24 saat) Kapsülleri getir
    const feedResult = await db.query(
      `SELECT c.id, c.image_url, c.is_blurred, c.created_at, u.id as owner_id, u.gender 
       FROM capsules c
       JOIN users u ON c.user_id = u.id
       WHERE u.gender = $1 
         AND c.created_at >= NOW() - INTERVAL '24 HOURS'
       ORDER BY c.created_at DESC`,
      [targetGender]
    );

    let feed = feedResult.rows;

    // KURAL 3: Erkeklere tüm kadın fotoğrafları "Bulanık (is_blurred: true)" olarak gider.
    // (Veritabanında default true, ama güvenli tarafta kalmak için kodla da eziyoruz)
    if (viewerGender === 'Male') {
      feed = feed.map(capsule => ({
        ...capsule,
        is_blurred: true // Front-end bu bayrağı görüp resmi blurlayacak
      }));
    }

    res.status(200).json({
      message: 'Keşfet akışı başarıyla getirildi.',
      target_gender: targetGender,
      capsules: feed
    });

  } catch (error) {
    console.error('Keşfet akışı getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası oluştu.' });
  }
};
