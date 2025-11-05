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
        const userId = req.params.userId;
        try {
            const conversations = await conversationService.getUserConversations(userId);
            const formattedConversations = await Promise.all(
                conversations.map(async (conversation) => {
                    // Lấy thông tin members
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

                    // Tim last message
                    const lastMessage = await getMessageById(conversation.lastMessage);

                    return {
                        id: conversation._id.toString(),
                        name: conversation.name || "", // có thể để fallback từ member nếu là private
                        avatarUrl: conversation.avatar || "/default-avatar-profile-icon.jpg",
                        members,
                        lastMessage: lastMessage,
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
        const { conversationId, userId } = req.params;
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
        const { userId1, userId2 } = req.params;
        try {
            const conversation = await conversationService.findConversationBetweenUsers(userId1, userId2);

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

            const lastMessage = await getMessageById(conversation.lastMessage);

            const formattedConversation = {
                id: conversation._id.toString(),
                name: conversation.name || "", // có thể fallback từ member nếu là private
                avatarUrl: conversation.avatar || "/default-avatar-profile-icon.jpg",
                members,
                lastMessage,
                type: conversation.type,
            };

            res.status(200).json({ message: "Yes", conversation: formattedConversation });
        } catch (error) {
            console.error("Error finding conversation between users:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    },
};

module.exports = conversationController;