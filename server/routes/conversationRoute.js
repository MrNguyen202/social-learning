const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');

// Tạo cuộc trò chuyện mới (riêng tư hoặc nhóm)
router.post('/create', conversationController.createConversation);

// Lấy danh sách cuộc trò chuyện của người dùng
router.get('/user/:userId', conversationController.getUserConversations);

// Đếm số tin nhắn chưa đọc trong một cuộc trò chuyện của user
router.get('/:conversationId/unread/:userId', conversationController.countUnreadMessages);

// Kiểm tra xem cuộc trò chuyện có tồn tại không dựa vào userId1 và userId2
router.get('/between/:userId1/:userId2', conversationController.findConversationBetweenUsers);

module.exports = router;