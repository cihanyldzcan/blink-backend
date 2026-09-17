const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
// const { sendPush } = require('./src/services/pushService');

const db = require('./src/config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Yüklenen fotoğraflara dışarıdan erişim

// Import Routes
const authRoutes = require('./src/routes/authRoutes');
const capsuleRoutes = require('./src/routes/capsuleRoutes');
const interactionRoutes = require('./src/routes/interactionRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const safetyRoutes = require('./src/routes/safetyRoutes');
const financeRoutes = require('./src/routes/financeRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// API Rotaları
app.use('/api/auth', authRoutes);
app.use('/api/capsules', capsuleRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/admin', adminRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Blink Backend is running' });
});

// WebSocket (Gerçek Zamanlı Mesajlaşma)
io.on('connection', (socket) => {
    console.log('Yeni bir kullanıcı bağlandı:', socket.id);

    // Kullanıcı bir sohbet odasına (match_id) katılır
    socket.on('join_match', (match_id) => {
        socket.join(`match_${match_id}`);
        console.log(`Kullanıcı match_${match_id} odasına katıldı.`);
    });

    // Yeni mesaj gönderildiğinde
    socket.on('send_message', async (data) => {
        const { match_id, sender_id, content } = data;
        try {
            // 1. Veritabanına kaydet
            const result = await db.query(
                `INSERT INTO messages (match_id, sender_id, content, created_at) 
                 VALUES ($1, $2, $3, NOW()) RETURNING *`,
                [match_id, sender_id, content]
            );
            
            const newMessage = result.rows[0];

            // 2. Eşleşmenin son mesaj tarihini güncelle
            await db.query(`UPDATE matches SET last_message_at = NOW() WHERE id = $1`, [match_id]);

            // 3. Odadaki diğer kişiye ilet (kendisi dahil)
            io.to(`match_${match_id}`).emit('receive_message', newMessage);

            // 4. Push Notification Gönder
            const matchRes = await db.query('SELECT male_user_id, female_user_id FROM matches WHERE id = $1', [match_id]);
            if (matchRes.rows.length > 0) {
                const receiverId = sender_id == matchRes.rows[0].male_user_id ? matchRes.rows[0].female_user_id : matchRes.rows[0].male_user_id;
                const receiverRes = await db.query('SELECT expo_push_token FROM users WHERE id = $1', [receiverId]);
                const senderRes = await db.query('SELECT username FROM users WHERE id = $1', [sender_id]);
                  if (receiverRes.rows.length > 0 && receiverRes.rows[0].expo_push_token) {
                      // sendPush(
                      //     receiverRes.rows[0].expo_push_token,
                      //     `${senderRes.rows[0].username} sana mesaj gönderdi`,
                      //     content,
                      //     { match_id }
                      // );
                  }
            }

            // 5. Bot Auto-Responder (Eğer alıcı bot ise)
            if (matchRes.rows.length > 0) {
              const receiverId = sender_id == matchRes.rows[0].male_user_id ? matchRes.rows[0].female_user_id : matchRes.rows[0].male_user_id;
              const botCheckRes = await db.query('SELECT is_bot FROM users WHERE id = $1', [receiverId]);
              if (botCheckRes.rows.length > 0 && botCheckRes.rows[0].is_bot) {
                setTimeout(async () => {
                  try {
                    const replies = [
                      "Haha inanılmazsın! 😍",
                      "Çok tatlısın gerçekten, biraz daha anlatsana?",
                      "Şu an kahve içiyorum, sen napıyorsun? ☕",
                      "Ben de tam seni düşünüyordum biliyor musun... 🙈",
                      "Hmm, buna ne cevap verilir bilemedim şimdi haha 😂"
                    ];
                    const randomReply = replies[Math.floor(Math.random() * replies.length)];
                    
                    const botRes = await db.query(
                        `INSERT INTO messages (match_id, sender_id, content, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *`,
                        [match_id, receiverId, randomReply]
                    );
                    
                    await db.query(`UPDATE matches SET last_message_at = NOW() WHERE id = $1`, [match_id]);
                    io.to(`match_${match_id}`).emit('receive_message', botRes.rows[0]);
                  } catch (e) {
                    console.log('Bot reply error:', e);
                  }
                }, 4000); // 4 saniye sonra cevap versin
              }
            }
        } catch (error) {
            console.error('Mesaj gönderme hatası:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Kullanıcı ayrıldı:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} portunda başlatıldı.`);
});
