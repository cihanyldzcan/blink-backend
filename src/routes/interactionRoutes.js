const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactionController');
const chatController = require('../controllers/chatController');

router.post('/unlock', interactionController.unlockCapsule);
router.post('/gift', interactionController.sendGift);

router.get('/matches', chatController.getMatches);
router.get('/messages', chatController.getMessages);

module.exports = router;
