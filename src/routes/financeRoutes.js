const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');

router.post('/withdraw', financeController.requestWithdrawal);
router.post('/tax', financeController.applyDailyTax);
router.post('/verify-purchase', financeController.verifyPurchase);

module.exports = router;
