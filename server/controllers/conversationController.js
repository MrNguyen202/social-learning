const conversationService = require("../services/conversationService");
const { getMessageById } = require("../services/messageService");
const userService = require("../services/userService");

const conversationController = {
    // Tạo cuộc trò chuyện mới (riêng tư hoặc nhóm)
    createConversation: async (req, res) => {
        const { name, type, members, avatar, admin } = req.body;

        try {
            // Tạo conversation
            const conversation = await conversationService.createConversation({
                name,
                type,
                members,
                avatar,
                admin,
            });

            // Lấy thông tin từng member (như findConversationBetweenUsers)
            const memberDetails = await Promise.all(
                conversation.members.map(async (member) => {
                    const user = await userService.getUserData(member.userId);
                    return {
                        id: user ? user.data.id : member.userId,
                        name: user ? user.data.name : "Unknown",
                        avatarUrl: user?.data.avatar || "/default-avatar-profile-icon.jpg",
                        role: member.role,
                        addBy: member.addBy,
                        joinedAt: member.joinedAt,
                    };
                })
            );

            // Format dữ liệu trả về
            const formattedConversation = {
                id: conversation._id.toString(),
                name: conversation.name || "",
                avatarUrl: conversation.avatar || "/default-avatar-profile-icon.jpg",
                members: memberDetails,
                lastMessage: null, // vì mới tạo, chưa có tin nhắn
                type: conversation.type,
            };

            // Trả về 201 + dữ liệu đã format
            res.status(201).json(formattedConversation);

        } catch (error) {
            console.error("Error creating conversation:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Lấy danh sách cuộc trò chuyện của người dùng
    getUserConversations: async (req, res) => {
        // Lấy userId từ req.user (đã được authMiddleware thêm vào)
        const userId = req.user.id;
        try {
            const conversations = await conversationService.getUserConversations(userId);
            const formattedConversations = await Promise.all(
                conversations.map(async (conversation) => {
                    // ... Logic lấy members giữ nguyên ...
                    const members = await Promise.all(
                        conversation.members.map(async (member) => {
                            const user = await userService.getUserData(member.userId);
                            return {
                                id: user ? user.data.id : member.userId,
                                name: user ? user.data.name : "Unknown",
                                avatarUrl: user?.data.avatar || "/default-avatar-profile-icon.jpg",
                                role: member.role,
                                addBy: member.addBy,
                                joinedAt: member.joinedAt,
                            };
                        })
                    );

                    // [LOGIC MỚI] Xử lý Last Message
                    let lastMessage = null;

                    // 1. Lấy lastMessage gốc được lưu trong Conversation
                    const rawLastMessage = await getMessageById(conversation.lastMessage);

                    // 2. Kiểm tra xem tin nhắn này có tồn tại và User có xóa nó không?
                    if (rawLastMessage) {
                        const isDeletedByMe = rawLastMessage.removed && rawLastMessage.removed.some(r => r.userId === userId);

                        if (isDeletedByMe) {
                            // 3. Nếu đã xóa, tìm tin nhắn gần nhất chưa bị xóa
                            lastMessage = await conversationService.getLastVisibleMessage(conversation._id, userId);
                        } else {
                            // 4. Nếu chưa xóa, dùng luôn tin nhắn này
                            lastMessage = rawLastMessage;
                        }
                    }

                    return {
                        id: conversation._id.toString(),
                        name: conversation.name || "",
                        avatarUrl: conversation.avatar || "/default-avatar-profile-icon.jpg",
                        members,
                        lastMessage: lastMessage, // Trả về tin nhắn đã xử lý
                        type: conversation.type
                    };
                })
            );

            res.status(200).json(formattedConversations);
        } catch (error) {
            console.error("Error fetching user conversations:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Đếm số tin nhắn chưa đọc trong một cuộc trò chuyện của user
    countUnreadMessages: async (req, res) => {
        const { conversationId } = req.params;
        // Lấy userId từ req.user (đã được authMiddleware thêm vào)
        const userId = req.user.id;
        try {
            const count = await conversationService.countUnreadMessages(conversationId, userId);
            res.status(200).json({ count });
        } catch (error) {
            console.error("Error counting unread messages:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Kiểm tra xem cuộc trò chuyện có tồn tại không dựa vào userId1 và userId2 
    findConversationBetweenUsers: async (req, res) => {
        const { userId2 } = req.params;
        // Lấy userId hiện tại từ req.user để kiểm tra quyền truy cập nếu cần
        const currentUserId = req.user.id;
        try {
            const conversation = await conversationService.findConversationBetweenUsers(currentUserId, userId2);
            if (!conversation) {
                return res.status(200).json({ message: "No" });
            }

            // ---- Giống logic của getUserConversations ----
            const members = await Promise.all(
                conversation.members.map(async (member) => {
                    const user = await userService.getUserData(member.userId);
                    return {
                        id: user ? user.data.id : member.userId,
                        name: user ? user.data.name : "Unknown",
                        avatarUrl: user?.data.avatar || "/default-avatar-profile-icon.jpg",
                        role: member.role,
                        addBy: member.addBy,
                        joinedAt: member.joinedAt,
                    };
                })
            );

            let lastMessage = null;

            // Lấy tin nhắn cuối cùng gốc được lưu trong Conversation
            const rawLastMessage = await getMessageById(conversation.lastMessage);

            // Kiểm tra logic
            if (rawLastMessage) {
                // Kiểm tra xem user hiện tại có trong mảng `removed` không
                const isDeletedByMe = rawLastMessage.removed && rawLastMessage.removed.some(r => r.userId === currentUserId);

                if (isDeletedByMe) {
                    // Nếu đã xóa, gọi service để tìm tin nhắn hợp lệ kế tiếp
                    // (Đảm bảo bạn đã thêm hàm getLastVisibleMessage vào conversationService như hướng dẫn trước)
                    lastMessage = await conversationService.getLastVisibleMessage(conversation._id, currentUserId);
                } else {
                    // Nếu chưa xóa, hiển thị bình thường
                    lastMessage = rawLastMessage;
                }
            }

            const formattedConversation = {
                id: conversation._id.toString(),
                name: conversation.name || "",
                avatarUrl: conversation.avatar || "/default-avatar-profile-icon.jpg",
                members,
                lastMessage: lastMessage,
                type: conversation.type,
            };

            res.status(200).json({ message: "Yes", conversation: formattedConversation });
        } catch (error) {
            console.error("Error finding conversation between users:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },

    // Đếm tổng số tin nhắn chưa đọc của người dùng trong tất cả cuộc trò chuyện
    countTotalUnreadMessages: async (req, res) => {
        // Lấy userId từ req.user (đã được authMiddleware thêm vào)
        const userId = req.user.id;
        try {
            const totalUnread = await conversationService.countTotalUnreadMessages(userId);
            res.status(200).json({ totalUnread });
        } catch (error) {
            console.error("Error counting total unread messages:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
};

module.exports = conversationController;