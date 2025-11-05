const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const conversationService = {
    // Tao cuộc trò chuyện mới (riêng tư hoặc nhóm)
    async createConversation({ name, type, members, avatar, admin }) {
        const conversation = new Conversation({ name, type, members, avatar, admin });
        await conversation.save();
        return conversation;
    },

    // Lấy danh sách cuộc trò chuyện của người dùng
    async getUserConversations(userId) {
        const conversations = await Conversation.find({
            "members.userId": userId,
        }).sort({ updatedAt: -1 });

        return conversations;
    },

    // Đếm số tin nhắn chưa đọc trong một cuộc trò chuyện của user
    async countUnreadMessages(conversationId, userId) {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) throw new Error("Conversation not found");

        const unreadCount = await Message.countDocuments({
            conversationId,
            senderId: { $ne: userId },
            $or: [
                { seens: { $exists: false } },
                { seens: { $size: 0 } },
                { seens: { $not: { $elemMatch: { userId } } } }
            ]
        });

        return unreadCount;
    },

    // Lấy thành viên của cuộc trò chuyện
    async getConversationMembers(conversationId) {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) throw new Error("Conversation not found");
        return conversation.members;
    },

    // Kiểm tra xem cuộc trò chuyện có tồn tại không dựa vào userId1 và userId2 
    async findConversationBetweenUsers(userId1, userId2) {
        const conversation = await Conversation.findOne({
            type: "private",
            members: {
                $all: [
                    { $elemMatch: { userId: userId1 } },
                    { $elemMatch: { userId: userId2 } }
                ]
            }
        });
        return conversation;
    },
};

module.exports = conversationService;