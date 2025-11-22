const express = require('express');
const messageController = require('../controllers/messageController');

const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");

// Gửi tin nhắn, có thể text + file
router.post('/save', upload.array("files", 10), messageController.saveMessage);

// Lấy danh sách tin nhắn trong cuộc trò chuyện với phân trang
router.get('/conversation/:conversationId', messageController.getMessagesByConversationId);

// Đánh dấu đã đọc tin nhắn trong cuộc trò chuyện
router.post('/markAsRead/:conversationId', messageController.markMessagesAsRead);

module.exports = router;
