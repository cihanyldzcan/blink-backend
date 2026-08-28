const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.get('/matches', chatController.getMatches);
router.get('/messages/:match_id', chatController.getMessages);

module.exports = router;
