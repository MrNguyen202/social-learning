const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require("../middlewares/uploadMiddleware");

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

// Quản lý thành viên và quyền trong cuộc trò chuyện nhóm
router.post('/:conversationId/members', authMiddleware, conversationController.addMembers);

// Xoá thành viên khỏi cuộc trò chuyện nhóm
router.delete('/:conversationId/members/:memberId', authMiddleware, conversationController.removeMember);
router.put('/:conversationId/admins', authMiddleware, conversationController.grantAdmin);
router.post('/:conversationId/leave', authMiddleware, conversationController.leaveGroup);
router.delete('/:conversationId/dissolve', authMiddleware, conversationController.dissolveGroup);
router.delete('/:conversationId/history', authMiddleware, conversationController.deleteHistory);
router.put('/:conversationId/rename', authMiddleware, conversationController.renameGroup);
router.put('/:conversationId/avatar', authMiddleware, upload.single('avatar'), conversationController.updateGroupAvatar);

module.exports = router;