const conversationService = require("../services/conversationService");
const { getMessageById } = require("../services/messageService");
const userService = require("../services/userService");
const { getIO } = require("../socket/socket");
const fs = require("fs");
const cloudinary = require("../config/cloudinaryConfig");

const notifyGroupUpdate = (io, conversation) => {
    if (!conversation) return;

    // Gửi cho ListConversation (User Map)
    if (conversation.members && conversation.members.length > 0) {
        conversation.members.forEach(member => {
            if (io.userSockets) {
                const rawId = member.userId || member.id;
                const memberIdStr = rawId ? rawId.toString() : null;

                if (memberIdStr) {
                    const userSocket = io.userSockets.get(memberIdStr);
                    if (userSocket) {
                        // --- ĐỔI Ở ĐÂY ---
                        // Thay vì emit "groupUpdated", ta emit "notificationNewMessage"
                        // Frontend nghe thấy sự kiện này sẽ tự reload lại list
                        io.to(userSocket.id).emit("notificationNewMessage");
                    }
                }
            }
        });
    }
};

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
                avatar: conversation.avatar || "/default-avatar-profile-icon.jpg",
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
                    // Logic lấy members giữ nguyên 
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

                    // Xử lý Last Message
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
                        avatar: conversation.avatar || "/default-avatar-profile-icon.jpg",
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
                avatar: conversation.avatar || "/default-avatar-profile-icon.jpg",
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

    // POST /conversations/:id/members
    addMembers: async (req, res) => {
        try {
            const { conversationId } = req.params;
            const { memberIds } = req.body;
            const actorId = req.user.id;

            const { conversation, message } = await conversationService.addMembersToGroup(conversationId, actorId, memberIds);

            if (!message) {
                return res.status(200).json(conversation); // Không có ai mới được thêm
            }

            // Populate thông tin User (Tên, Avatar) cho toàn bộ thành viên
            const membersWithInfo = await Promise.all(
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

            // Format data trả về
            const formattedConversation = {
                ...conversation.toObject(),
                id: conversation._id.toString(),
                members: membersWithInfo, // Data xịn đã có tên/avatar
                type: conversation.type
            };

            const io = getIO();

            // 1. Gửi socket update nhóm cho những người ĐANG trong nhóm
            io.to(conversationId).emit("groupUpdated", formattedConversation);

            // 2. Gửi socket tin nhắn hệ thống
            io.to(conversationId).emit("newMessage", message);

            // 3. Gửi socket update nhóm cho những người MỚI được thêm vào
            notifyGroupUpdate(io, formattedConversation);

            res.status(200).json(formattedConversation);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    // DELETE /conversations/:id/members/:memberId
    removeMember: async (req, res) => {
        try {
            const { conversationId, memberId } = req.params;
            const actorId = req.user.id;

            const { conversation, message } = await conversationService.removeMemberFromGroup(conversationId, actorId, memberId);

            const io = getIO();
            // Update cho người ở lại
            io.to(conversationId).emit("groupUpdated", conversation);

            // Thông báo tin nhắn hệ thống
            io.to(conversationId).emit("newMessage", message);

            // Update cho người bị remove
            notifyGroupUpdate(io, conversation);

            res.status(200).json(conversation);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // PUT /conversations/:id/admins
    grantAdmin: async (req, res) => {
        try {
            const { conversationId } = req.params;
            const { memberId } = req.body;
            const actorId = req.user.id;

            const { conversation, message } = await conversationService.promoteMemberToAdmin(conversationId, actorId, memberId);
            const io = getIO();
            io.to(conversationId).emit("groupUpdated", conversation);
            io.to(conversationId).emit("newMessage", message);
            notifyGroupUpdate(io, conversation);

            res.status(200).json(conversation);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // POST /conversations/:id/leave
    leaveGroup: async (req, res) => {
        try {
            const { conversationId } = req.params;
            const userId = req.user.id;

            const { conversation, message } = await conversationService.leaveConversation(conversationId, userId);

            const io = getIO();
            io.to(conversationId).emit("groupUpdated", conversation);
            io.to(conversationId).emit("newMessage", message);
            notifyGroupUpdate(io, conversation);

            res.status(200).json({ message: "Left group successfully" });
        } catch (error) {
            if (error.message === "ADMIN_TRANSFER_REQUIRED") {
                return res.status(403).json({ error: "ADMIN_TRANSFER_REQUIRED", message: "Please assign a new admin before leaving." });
            }
            res.status(500).json({ error: error.message });
        }
    },

    // DELETE /conversations/:id/dissolve
    dissolveGroup: async (req, res) => {
        try {
            const { conversationId } = req.params;
            const userId = req.user.id;

            await conversationService.dissolveGroup(conversationId, userId);

            const io = getIO();
            io.to(conversationId).emit("groupDissolved", { conversationId });

            res.status(200).json({ message: "Group dissolved" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // DELETE /conversations/:id/history
    deleteHistory: async (req, res) => {
        try {
            const { conversationId } = req.params;
            const userId = req.user.id;

            await conversationService.deleteConversationHistory(conversationId, userId);

            // Không cần socket emit cho người khác, chỉ client mình cần reset list tin nhắn
            res.status(200).json({ message: "History deleted" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // PUT /conversations/:id/avatar
    updateGroupAvatar: async (req, res) => {
        try {
            const { conversationId } = req.params;
            const actorId = req.user.id;

            // 1. Kiểm tra có file gửi lên không
            if (!req.file) {
                return res.status(400).json({ error: "No image file provided" });
            }

            // 2. Upload ảnh lên Cloudinary
            let newAvatarUrl = "";
            try {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: "social-learning/group_avatars", // Folder chứa ảnh nhóm
                    resource_type: "image"
                });
                newAvatarUrl = result.secure_url;

                // 3. Xóa file tạm trên server sau khi upload xong
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
            } catch (uploadError) {
                // Nếu lỗi upload, nhớ xóa file tạm để không rác server
                if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
                throw new Error("Cloudinary upload failed: " + uploadError.message);
            }

            // 4. Gọi Service lưu URL mới vào DB
            const { conversation, message } = await conversationService.updateGroupAvatar(conversationId, actorId, newAvatarUrl);

            // 5. Emit Socket Real-time
            const io = getIO();
            // Emit conversation mới (có avatar mới) để cập nhật Sidebar/Header
            io.to(conversationId).emit("groupUpdated", conversation);
            // Emit tin nhắn hệ thống ("A đã đổi ảnh nhóm")
            io.to(conversationId).emit("newMessage", message);
            // Cập nhật cho tất cả thành viên
            notifyGroupUpdate(io, conversation);

            res.status(200).json(conversation);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    },

    renameGroup: async (req, res) => {
        try {
            const { conversationId } = req.params;
            const { newName } = req.body;
            const actorId = req.user.id;
            const { conversation, message } = await conversationService.renameGroup(conversationId, actorId, newName);

            const io = getIO();
            io.to(conversationId).emit("groupUpdated", conversation);
            io.to(conversationId).emit("newMessage", message);
            notifyGroupUpdate(io, conversation);
            res.status(200).json(conversation);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};

module.exports = conversationController;