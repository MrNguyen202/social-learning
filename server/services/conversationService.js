const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const messageService = require("./messageService");

const conversationService = {
    // Tao cuộc trò chuyện mới (riêng tư hoặc nhóm)
    async createConversation({ name, type, members, avatar, admin }) {
        const conversation = new Conversation({ name, type, members, avatar, admin });
        await conversation.save();
        return conversation;
    },

    // Lấy danh sách cuộc trò chuyện của người dùng
    async getUserConversations(userId) {
        const conversations = await Conversation.aggregate([
            // 1. Lọc conversation mà user tham gia
            {
                $match: {
                    "members.userId": userId,
                    isDeleted: { $ne: true }
                }
            },

            // 2. Join với bảng messages để lấy thông tin lastMessage
            {
                $lookup: {
                    from: "messages",          // Tên collection trong DB (thường là số nhiều)
                    localField: "lastMessage", // Trường bên Conversation
                    foreignField: "_id",       // Trường bên Message
                    as: "lastMessageData"      // Tên field tạm để lưu kết quả
                }
            },

            // 3. Unwind để biến mảng lastMessageData thành object (vì lookup trả về mảng)
            {
                $unwind: {
                    path: "$lastMessageData",
                    preserveNullAndEmptyArrays: true // Giữ lại conversation chưa có tin nhắn
                }
            },

            // 4. Tính toán mốc thời gian xóa (Delete Checkpoint) của user
            {
                $addFields: {
                    // Lấy phần tử lịch sử của user hiện tại
                    currentUserHistory: {
                        $filter: {
                            input: "$delete_history",
                            as: "history",
                            cond: { $eq: ["$$history.userId", userId] }
                        }
                    }
                }
            },
            {
                $addFields: {
                    // Lấy deletedAt từ mảng vừa lọc, nếu không có thì mặc định là năm 1970 (coi như chưa xóa)
                    deleteCheckpoint: {
                        $ifNull: [{ $first: "$currentUserHistory.deletedAt" }, new Date(0)]
                    }
                }
            },

            // 5. Lọc kết quả: lastMessage.createdAt >= deleteCheckpoint
            {
                $match: {
                    $expr: {
                        $or: [
                            // Case A: Chưa có tin nhắn nào (nhóm mới) -> Lấy
                            { $not: ["$lastMessageData"] },
                            // Case B: Có tin nhắn và ngày tạo >= ngày xóa -> Lấy
                            { $gte: ["$lastMessageData.createdAt", "$deleteCheckpoint"] }
                        ]
                    }
                }
            },

            // 6. Sắp xếp tin mới nhất lên đầu
            { $sort: { "lastMessageData.createdAt": -1 } },

            // 7. (Optional) Dọn dẹp các field tạm nếu không muốn trả về client
            {
                $project: {
                    lastMessageData: 0,
                    currentUserHistory: 0,
                    deleteCheckpoint: 0
                }
            }
        ]);

        return conversations.map(c => {
            if (c.lastMessageData) {
                c.lastMessage = c.lastMessageData;
                delete c.lastMessageData;
            }
            return c;
        });
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

    // Đếm tổng số tin nhắn chưa đọc của người dùng trong tất cả cuộc trò chuyện
    async countTotalUnreadMessages(userId) {
        const conversations = await this.getUserConversations(userId);
        let totalUnread = 0;
        for (const convo of conversations) {
            const unreadCount = await this.countUnreadMessages(convo._id, userId);
            totalUnread += unreadCount;
        }
        return totalUnread;
    },

    // Lấy tin nhắn cuối cùng mà user có thể thấy trong cuộc trò chuyện (không bao gồm tin đã xóa với user đó)
    async getLastVisibleMessage(conversationId, userId) {
        const message = await Message.findOne({
            conversationId: conversationId,
            "removed.userId": { $ne: userId }
        }).sort({ createdAt: -1 });
        return message;
    },

    // QUẢN LÝ NHÓM TRÒ CHUYỆN
    // 1. Thêm thành viên vào nhóm
    async addMembersToGroup(conversationId, actorId, newMemberIds) {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) throw new Error("Conversation not found");
        if (conversation.type !== 'group') throw new Error("Not a group conversation");

        // Lọc những user đã có trong nhóm để tránh trùng
        const existingIds = conversation.members.map(m => m.userId);
        const membersToAdd = newMemberIds.filter(id => !existingIds.includes(id));

        if (membersToAdd.length === 0) {
            // Nếu không có ai mới, trả về nguyên trạng
            return { conversation, message: null };
        }

        const newMembers = membersToAdd.map(userId => ({
            userId,
            role: "member",
            addBy: actorId,
            joinedAt: new Date()
        }));

        conversation.members.push(...newMembers);
        conversation.markModified("members"); // Báo cho mongoose biết mảng đã thay đổi
        await conversation.save();

        // Tạo tin nhắn hệ thống
        const message = await messageService.createSystemMessage(conversationId, actorId, "member_added", membersToAdd);

        return { conversation, message };
    },

    // 2. Xóa thành viên (Kick)
    async removeMemberFromGroup(conversationId, actorId, memberIdToRemove) {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) throw new Error("Conversation not found");

        const actor = conversation.members.find(m => m.userId === actorId);
        const target = conversation.members.find(m => m.userId === memberIdToRemove);

        if (!target) throw new Error("Member not in group");

        // Chỉ admin mới được kick, và không thể kick admin khác (tùy logic)
        if (actor.role !== 'admin') throw new Error("Only admin can remove members");

        conversation.members = conversation.members.filter(m => m.userId !== memberIdToRemove);
        await conversation.save();

        const message = await messageService.createSystemMessage(conversationId, actorId, "member_removed", [memberIdToRemove]);

        return { conversation, message };
    },

    // 3. Trao quyền Admin
    async promoteMemberToAdmin(conversationId, actorId, memberIdToPromote) {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) throw new Error("Conversation not found");

        // 1. Tìm người thực hiện (Current Admin)
        const actorIndex = conversation.members.findIndex(m => m.userId === actorId);
        const actor = conversation.members[actorIndex];

        // Check quyền: Phải là admin hiện tại mới được chuyển
        // Lưu ý: check cả role lẫn field admin gốc để chắc chắn là chủ nhóm
        if (actor.role !== 'admin' && conversation.admin !== actorId) {
            throw new Error("Only the group owner can transfer admin rights");
        }

        // 2. Tìm người được chỉ định (Target)
        const targetIndex = conversation.members.findIndex(m => m.userId === memberIdToPromote);
        if (targetIndex === -1) throw new Error("Member not found");

        // THỰC HIỆN CHUYỂN QUYỀN

        // Bước A: Người được chọn lên làm Admin
        conversation.members[targetIndex].role = "admin";

        // Bước B: Người cũ xuống làm Member
        conversation.members[actorIndex].role = "member";

        // Bước C: Cập nhật chủ sở hữu (root admin field)
        conversation.admin = memberIdToPromote;

        // Lưu vào DB
        await conversation.save();

        // Bước D: Tạo tin nhắn hệ thống thông báo
        // (Giả sử bạn đã import messageService ở trên cùng)
        const message = await messageService.createSystemMessage(
            conversationId,
            actorId,
            "admin_transferred", // Action mới: Chuyển quyền
            [memberIdToPromote]
        );

        return { conversation, message };
    },

    // 4. Rời nhóm
    async leaveConversation(conversationId, userId) {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) throw new Error("Conversation not found");

        const member = conversation.members.find(m => m.userId === userId);
        if (!member) throw new Error("You are not in this conversation");

        // Logic check Admin cuối cùng
        if (member.role === 'admin') {
            const adminCount = conversation.members.filter(m => m.role === 'admin').length;
            // Nếu là admin duy nhất và nhóm còn người khác -> Bắt buộc chuyển quyền
            if (adminCount === 1 && conversation.members.length > 1) {
                throw new Error("ADMIN_TRANSFER_REQUIRED"); // Controller sẽ bắt lỗi này để FE hiển thị popup chọn admin mới
            }
        }

        // Xóa user khỏi members
        conversation.members = conversation.members.filter(m => m.userId !== userId);

        // Nếu không còn ai trong nhóm -> Xóa nhóm luôn (hoặc giữ xác để restore)
        if (conversation.members.length === 0) {
            conversation.isDeleted = true;
        }

        await conversation.save();

        if (!conversation.isDeleted) {
            const message = await messageService.createSystemMessage(conversationId, userId, "user_left", []);
            return { conversation, message };
        }

        return { conversation, message: null };
    },

    // 5. Giải tán nhóm (Chỉ Admin)
    async dissolveGroup(conversationId, actorId) {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) throw new Error("Conversation not found");

        const actor = conversation.members.find(m => m.userId === actorId);
        if (actor.role !== 'admin') throw new Error("Permission denied");

        conversation.isDeleted = true; // Soft delete
        await conversation.save();

        return conversation;
    },

    // 6. Xóa lịch sử trò chuyện (Phía User)
    async deleteConversationHistory(conversationId, userId) {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) throw new Error("Conversation not found");

        // Cập nhật delete_history
        // Logic: Nếu user đã từng xóa, update lại thời gian. Nếu chưa, push mới.
        const historyIndex = conversation.delete_history.findIndex(h => h.userId === userId);

        if (historyIndex > -1) {
            conversation.delete_history[historyIndex].deletedAt = new Date();
        } else {
            conversation.delete_history.push({ userId, deletedAt: new Date() });
        }

        await conversation.save();
        return conversation;
    },

    // 7. Đổi tên nhóm
    async renameGroup(conversationId, actorId, newName) {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) throw new Error("Conversation not found");
        conversation.name = newName;
        await conversation.save();
        const message = await messageService.createSystemMessage(conversationId, actorId, "conversation_renamed", [], newName);
        return { conversation, message };
    },

    // 8. Cập nhật ảnh đại diện nhóm
    async updateGroupAvatar(conversationId, actorId, newAvatar) {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) throw new Error("Conversation not found");
        conversation.avatar = newAvatar;
        await conversation.save();
        const message = await messageService.createSystemMessage(conversationId, actorId, "conversation_avatar_updated", [], null);
        return { conversation, message };
    }

};

module.exports = conversationService;