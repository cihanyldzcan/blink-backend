const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Erkeklerin buzlu fotoğrafın kilidini açtığı (ve kadının %20 kazandığı) API
router.post('/unlock', transactionController.unlockCapsule);

module.exports = router;
