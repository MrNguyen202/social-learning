const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const userService = require("./userService");

const messageService = {
    // Lưu tin nhắn mới
    async saveMessage({ conversationId, senderId, text, files }) {
        // Kiểm tra conversation tồn tại
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) throw new Error("Conversation not found");
        if (!conversation.members.some(m => m.userId.toString() === senderId)) {
            throw new Error("Sender not in conversation");
        }

        // Xử lý content
        let type = "text";
        let images = [];
        let file = null;

        if (files && files.length > 0) {
            files.forEach(f => {
                if (f.mimetype.startsWith("image/")) {
                    images.push({ url: `/uploads/${f.filename}`, filename: f.originalname });
                } else {
                    file = { url: `/uploads/${f.filename}`, filename: f.originalname, size: f.size, mimeType: f.mimetype };
                }
            });
            if (images.length > 0 && text) type = "image"; // caption + ảnh
            else if (images.length > 0) type = "image";
            else type = "file";
        } else if (text) {
            type = "text";
        } else {
            throw new Error("Message must have text or file");
        }

        const message = new Message({
            conversationId,
            senderId,
            content: {
                type,
                text: text || "",
                images,
                file
            }
        });

        await message.save();

        // Cập nhật lại lastMessage
        conversation.lastMessage = message._id;
        await conversation.save();

        return message;
    },

    // Lấy tin nhắn theo id
    async getMessageById(messageId) {
        return await Message.findById(messageId);
    },

    // Lấy danh sách tin nhắn trong cuộc trò chuyện với phân trang
    async getMessagesByConversationId(conversationId, { page = 1, limit = 20 }) {
        const skip = (page - 1) * limit;

        // B1: Lấy messages trong MongoDB
        const messages = await Message.find({ conversationId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // B2: Lấy danh sách unique senderId
        const senderIds = [...new Set(messages.map(m => m.senderId))];

        if (senderIds.length === 0) return messages;

        // B3: Lấy thông tin user từ Supabase (dùng in)
        const { data: users, error } = await userService.getUsersByIds(senderIds);

        if (error) throw new Error("Failed to fetch user data");

        // B4: Merge thông tin sender vào message
        const userMap = {};
        users.forEach(u => {
            userMap[u.id] = u;
        });

        const messagesWithSender = messages.map(m => ({
            ...m,
            sender: userMap[m.senderId] || null,
        }));

        return messagesWithSender;
    },

    // Đánh dấu đã đọc cho các tin nhắn trong cuộc trò chuyện mà chưa đọc(không bao gồm tin nhắn do chính user gửi)
    async markMessagesAsRead(conversationId, userId) {
        // Lấy danh sách message chưa đọc (user chưa nằm trong seens)
        const messages = await Message.find({
            conversationId,
            senderId: { $ne: userId },
            "seens.userId": { $ne: userId } // check userId chưa tồn tại trong mảng
        }).select("_id");

        if (!messages.length) {
            return { modifiedCount: 0, data: [] };
        }

        let seenAtTime = new Date();

        // Update đồng loạt
        const result = await Message.updateMany(
            {
                conversationId,
                senderId: { $ne: userId },
                "seens.userId": { $ne: userId }
            },
            {
                $addToSet: { seens: { userId, seenAt: seenAtTime } }
            },
            { runValidators: true }
        );

        return { modifiedCount: result.modifiedCount, data: messages, seenAt: seenAtTime };
    }
};

module.exports = messageService;
