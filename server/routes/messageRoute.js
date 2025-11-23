const express = require('express');
const messageController = require('../controllers/messageController');

const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const authMiddleware = require('../middlewares/authMiddleware');

// Gửi tin nhắn, có thể text + file
router.post('/save', upload.array("files", 10), messageController.saveMessage);

// Lấy danh sách tin nhắn trong cuộc trò chuyện với phân trang
router.get('/conversation/:conversationId', authMiddleware, messageController.getMessagesByConversationId);

// Đánh dấu đã đọc tin nhắn trong cuộc trò chuyện
router.post('/markAsRead/:conversationId', messageController.markMessagesAsRead);

// Thu hồi tin nhắn
router.post('/revoke/:messageId', messageController.revokeMessage);

// Xóa tin nhắn đối với người dùng
router.post('/remove/:messageId', authMiddleware, messageController.deleteMessageForUser);

// Thích / bỏ thích tin nhắn
router.post('/like/:messageId', authMiddleware, messageController.toggleLikeMessage);

module.exports = router;
