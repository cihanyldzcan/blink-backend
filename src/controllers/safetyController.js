const db = require('../config/db');

exports.blockUser = async (req, res) => {
  const { blocker_id, blocked_id } = req.body;
  try {
    await db.query('BEGIN');
    
    // Insert into blocks
    await db.query(
      "INSERT INTO blocks (blocker_id, blocked_id) VALUES (\, \) ON CONFLICT DO NOTHING",
      [blocker_id, blocked_id]
    );
    
    // Delete match if exists
    await db.query(
      "DELETE FROM matches WHERE (male_user_id = \ AND female_user_id = \) OR (male_user_id = \ AND female_user_id = \)",
      [blocker_id, blocked_id]
    );

    await db.query('COMMIT');
    res.json({ success: true, message: 'Kullanıcı engellendi.' });
  } catch (error) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: 'İşlem başarısız oldu.' });
  }
};

exports.reportUser = async (req, res) => {
  const { reporter_id, reported_id, reason } = req.body;
  try {
    await db.query(
      "INSERT INTO reports (reporter_id, reported_id, reason) VALUES (\, \, \)",
      [reporter_id, reported_id, reason]
    );
    res.json({ success: true, message: 'Şikayetiniz alındı ve incelenecektir.' });
  } catch (error) {
    res.status(500).json({ error: 'Şikayet iletilemedi.' });
  }
};
