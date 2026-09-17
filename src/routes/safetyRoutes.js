const express = require('express');
const router = express.Router();
const safetyController = require('../controllers/safetyController');

router.post('/block', safetyController.blockUser);
router.post('/report', safetyController.reportUser);

module.exports = router;
