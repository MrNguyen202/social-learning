const express = require('express');
const transactionController = require('../controllers/transactionController');
const authSePayMiddleware = require('../middlewares/authSePayMiddleware');

const router = express.Router();

// Webhook từ Sepay để tạo giao dịch mới
router.post('/sepay-webhook', authSePayMiddleware, transactionController.sepayWebhook);

module.exports = router;