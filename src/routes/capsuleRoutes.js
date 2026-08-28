const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const capsuleController = require('../controllers/capsuleController');

// Multer Ayarları (Dosyaları uploads klasörüne kaydet)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Rotalar
router.post('/upload', upload.single('photo'), capsuleController.uploadCapsule);
router.get('/feed', capsuleController.getDiscoveryFeed);

module.exports = router;
