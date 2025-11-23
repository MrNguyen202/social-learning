const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');
const authMiddleware = require('../middlewares/authMiddleware');

// Tạo cuộc trò chuyện mới (riêng tư hoặc nhóm)
router.post('/create', conversationController.createConversation);

// Lấy danh sách cuộc trò chuyện của người dùng
router.get('/user', authMiddleware, conversationController.getUserConversations);

// Đếm số tin nhắn chưa đọc trong một cuộc trò chuyện của user
router.get('/:conversationId/unread', authMiddleware, conversationController.countUnreadMessages);

// Kiểm tra xem cuộc trò chuyện có tồn tại không dựa vào userId1 và userId2
router.get('/between/:userId2', authMiddleware, conversationController.findConversationBetweenUsers);

// Đếm tổng số tin nhắn chưa đọc của người dùng trong tất cả cuộc trò chuyện
router.get('/totalUnread', authMiddleware, conversationController.countTotalUnreadMessages);

module.exports = router;