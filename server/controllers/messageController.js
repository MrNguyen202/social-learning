const messageService = require("../services/messageService");
const userService = require("../services/userService");
const conversationService = require("../services/conversationService");
const { getIO } = require("../socket/socket");

const messageController = {
    // Lưu tin nhắn mới
    saveMessage: async (req, res) => {
        try {
            const { conversationId, senderId, text, replyTo } = req.body;
            const files = req.files || []; // từ multer

            const message = await messageService.saveMessage({ conversationId, senderId, text, files, replyTo });

            // custom message với sender info
            const { data: user } = await userService.getUserData(senderId);

            // Custom format
            const customMessage = {
                _id: message._id,
                conversationId: message.conversationId,
                senderId: message.senderId,
                content: {
                    type: message.content.type,
                    text: message.content.text,
                    images: message.content.images || [],
                    file: message.content.file || null,
                    system: message.content.system || { target: [] }
                },
                revoked: message.revoked || false,
                seens: message.seens || [],
                likes: message.likes || [],
                removed: message.removed || [],
                createdAt: message.createdAt,
                updatedAt: message.updatedAt,
                __v: message.__v,
                sender: user ? {
                    id: user.id,
                    name: user.name,
                    avatar: user.avatar
                } : null,
                replyTo: message.replyTo
            };

            // Gửi socket tới các thành viên trong conversation (nếu có)
            const io = getIO();
            io.to(conversationId).emit("newMessage", customMessage);

            const conversationMembers = await conversationService.getConversationMembers(conversationId);
            for (const member of conversationMembers) {
                const userSocket = io.userSockets.get(member.userId);
                if (userSocket) {
                    io.to(userSocket.id).emit("notificationNewMessage", {
                        type: "newMessage",
                        conversationId,
                        message: customMessage
                    });
                }
            }

            res.status(201).json(message);
        } catch (error) {
            console.error("Error saving message:", error);
            res.status(500).json({ error: error.message });
        }
    },

    // Lấy danh sách tin nhắn trong cuộc trò chuyện với phân trang
    getMessagesByConversationId: async (req, res) => {
        try {
            const { conversationId } = req.params;
            const { page, limit } = req.query;

            // Nếu bạn chưa có middleware auth, có thể tạm lấy từ query params: req.query.userId
            const userId = req.user.id;

            if (!userId) {
                return res.status(401).json({ error: "Unauthorized: User ID required" });
            }

            // Truyền userId vào service
            const messages = await messageService.getMessagesByConversationId(
                conversationId,
                userId,
                { page: parseInt(page) || 1, limit: parseInt(limit) || 20 }
            );

            // [LOGIC CHE NỘI DUNG THU HỒI - Như đã làm ở bước trước]
            const safeMessages = messages.map(msg => {
                if (msg.revoked) {
                    return {
                        ...msg,
                        content: { type: "text", text: null, images: [], file: null },
                        replyTo: msg.replyTo
                    };
                }
                return msg;
            });

            res.status(200).json(safeMessages);
        } catch (error) {
            console.error("Error fetching messages:", error);
            res.status(500).json({ error: error.message });
        }
    },

    // Đánh dấu đã đọc tin nhắn trong cuộc trò chuyện
    markMessagesAsRead: async (req, res) => {
        try {
            const { conversationId } = req.params;
            const { userId } = req.body;



            const result = await messageService.markMessagesAsRead(conversationId, userId);

            // Gửi socket cập nhật seens cho các thành viên trong conversation (nếu có)
            if (result.modifiedCount > 0) {
                const io = getIO();
                io.to(conversationId).emit("messagesMarkedAsRead", {
                    conversationId,
                    userId,
                    seenAt: result.seenAt,
                    messageIds: result.data.map(m => m._id)
                });

                // Gửi thông báo cập nhật số tin nhắn chưa đọc
                const userSocket = io.userSockets.get(userId);
                if (userSocket) {
                    io.to(userSocket.id).emit("notificationMessagesRead", {
                        type: "messagesRead",
                        conversationId,
                        userId,
                    });
                }
            }
            res.status(200).json(result);
        } catch (error) {
            console.error("Error marking messages as read:", error);
            res.status(500).json({ error: error.message });
        }
    },

    // Thu hồi tin nhắn
    revokeMessage: async (req, res) => {
        try {
            const { messageId } = req.params;
            const { userId } = req.body; // Lấy từ middleware auth hoặc req.body

            const updatedMessage = await messageService.revokeMessage(messageId, userId);

            // Masking: Tạo object trả về cho client đã bị che nội dung
            const safeMessage = {
                ...updatedMessage.toObject(),
                content: {
                    type: "text",
                    text: null, // Che nội dung gốc
                    images: [],
                    file: null
                }
            };

            // Gửi Socket thông báo cho tất cả thành viên trong room
            const io = getIO();
            io.to(safeMessage.conversationId.toString()).emit("messageRevoked", {
                messageId: safeMessage._id,
                conversationId: safeMessage.conversationId
            });

            res.status(200).json(safeMessage);
        } catch (error) {
            console.error("Error revoking message:", error);
            res.status(500).json({ error: error.message });
        }
    },

    // Xóa tin nhắn (nếu cần)
    deleteMessageForUser: async (req, res) => {
        try {
            const { messageId } = req.params;

            const userId = req.user.id;

            await messageService.deleteMessageForUser(messageId, userId);

            // Trả về success, không cần gửi socket cho người khác 
            // vì hành động này chỉ ảnh hưởng cá nhân
            res.status(200).json({ message: "Deleted successfully", messageId });
        } catch (error) {
            console.error("Error deleting message:", error);
            res.status(500).json({ error: error.message });
        }
    },

    // Thích/ bỏ thích tin nhắn
    toggleLikeMessage: async (req, res) => {
        try {
            const { messageId } = req.params;
            // Lấy userId từ middleware auth
            const userId = req.user.id; 

            // 1. Gọi Service để xử lý Logic DB
            const updatedMessage = await messageService.toggleLikeMessage(messageId, userId);

            // 2. Gửi Socket update cho các thành viên trong room
            const io = getIO();
            io.to(updatedMessage.conversationId.toString()).emit("messageReactionUpdated", {
                messageId: updatedMessage._id,
                conversationId: updatedMessage.conversationId,
                likes: updatedMessage.likes
            });

            // 3. Phản hồi API
            res.status(200).json(updatedMessage);
        } catch (error) {
            console.error("Error toggling like:", error);
            res.status(500).json({ error: error.message });
        }
    },
};

module.exports = messageController;
