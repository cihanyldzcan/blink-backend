const db = require('../config/db');

exports.requestWithdrawal = async (req, res) => {
  const { user_id, amount_diamonds, iban } = req.body;
  
  try {
    await db.query('BEGIN');
    
    // Check balance
    const userRes = await db.query('SELECT diamonds FROM users WHERE id = $1', [user_id]);
    if (userRes.rows.length === 0 || userRes.rows[0].diamonds < amount_diamonds) {
      await db.query('ROLLBACK');
      return res.status(400).json({ error: 'Yetersiz elmas bakiyesi.' });
    }
    
    // Deduct diamonds
    await db.query('UPDATE users SET diamonds = diamonds - $1 WHERE id = $2', [amount_diamonds, user_id]);
    
    // Create request
    await db.query(
      "INSERT INTO withdrawals (user_id, amount_diamonds, iban) VALUES ($1, $2, $3)",
      [user_id, amount_diamonds, iban]
    );

    await db.query('COMMIT');
    res.json({ success: true, message: 'Para çekme talebiniz alındı. (Bakiye güncellendi)' });
  } catch (error) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: 'İşlem başarısız oldu.' });
  }
};

exports.applyDailyTax = async (req, res) => {
  try {
    // Tüm açık erkek maçları için jeton düş (günde 5)
    // Sadece bakiyesi 5 ve üzeri olanları update ediyoruz, altına inenler ne olacak? İleride maçı silebilriz.
    const result = await db.query(`
      UPDATE users 
      SET coins = GREATEST(coins - tax.total_tax, 0)
      FROM (
        SELECT male_user_id, COUNT(*) * 5 as total_tax 
        FROM matches 
        GROUP BY male_user_id
      ) as tax
      WHERE users.id = tax.male_user_id AND users.gender = 'Male'
    `);
    
    res.json({ success: true, message: 'Günlük jeton vergisi kesildi.' });
  } catch (error) {
    res.status(500).json({ error: 'Vergi işlemi başarısız.' });
  }
};

exports.verifyPurchase = async (req, res) => {
  const { user_id, transaction_id, product_id, is_mock } = req.body;
  
  try {
    // 1. RevenueCat makbuz kontrolü (Gelecekte RC API'sine istek atılacak yer burası)
    // Şimdilik gelen paketin isminden (Örn: "coins_100") jeton miktarını çıkarıyoruz.
    let amountToAdd = 0;
    if (product_id === 'coins_100') amountToAdd = 100;
    else if (product_id === 'coins_500') amountToAdd = 500;
    else if (product_id === 'coins_1000') amountToAdd = 1000;
    
    if (amountToAdd === 0) return res.status(400).json({ error: 'Bilinmeyen paket.' });

    // 2. Transaction'ın daha önce işlenip işlenmediği kontrol edilir (Güvenlik)
    // Bunun için veritabanında "purchases" tablosu olmalı ama şimdilik doğrudan veriyoruz.
    
    // 3. Jetonu hesaba yükle
    await db.query('UPDATE users SET coins = coins + $1 WHERE id = $2', [amountToAdd, user_id]);
    
    res.json({ success: true, addedCoins: amountToAdd });
  } catch (error) {
    console.error('verifyPurchase error:', error);
    res.status(500).json({ error: 'Ödeme onayı sırasında sunucu hatası.' });
  }
};
