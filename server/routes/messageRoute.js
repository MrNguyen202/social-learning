const express = require('express');
const multer = require('multer');
const messageController = require('../controllers/messageController');

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Gửi tin nhắn, có thể text + file
router.post('/save', upload.array("files"), messageController.saveMessage);

// Lấy danh sách tin nhắn trong cuộc trò chuyện với phân trang
router.get('/conversation/:conversationId', messageController.getMessagesByConversationId);

// Đánh dấu đã đọc tin nhắn trong cuộc trò chuyện
router.post('/conversation/:conversationId/read', messageController.markMessagesAsRead);

module.exports = router;
