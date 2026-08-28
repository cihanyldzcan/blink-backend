const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

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
const transactionRoutes = require('./src/routes/transactionRoutes');
const chatRoutes = require('./src/routes/chatRoutes');

// API Rotaları
app.use('/api/auth', authRoutes);
app.use('/api/capsules', capsuleRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/chat', chatRoutes);

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
