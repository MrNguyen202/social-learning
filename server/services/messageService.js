const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const userService = require("./userService");
const cloudinary = require("../config/cloudinaryConfig");
const fs = require("fs");

const REVOKE_TIME_LIMIT = 60 * 60 * 1000;

const messageService = {
    // Lưu tin nhắn mới
    async saveMessage({ conversationId, senderId, text, files, replyTo }) {
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
            // Dùng Promise.all để upload nhiều file cùng lúc cho nhanh
            const uploadPromises = files.map(async (f) => {
                try {
                    // Upload lên Cloudinary
                    // f.path là đường dẫn tạm do Multer tạo ra
                    const result = await cloudinary.uploader.upload(f.path, {
                        folder: "social-learning/message_uploads", // Tên folder trên Cloudinary
                        resource_type: "auto"      // Tự động nhận diện ảnh/video/raw file
                    });

                    // Xóa file tạm trên server sau khi upload thành công để tiết kiệm dung lượng
                    if (fs.existsSync(f.path)) {
                        fs.unlinkSync(f.path);
                    }

                    return {
                        originalFile: f,
                        cloudinaryResult: result
                    };
                } catch (err) {
                    console.error("Cloudinary upload error:", err);
                    throw err;
                }
            });

            const uploadedFiles = await Promise.all(uploadPromises);

            // Phân loại file sau khi có kết quả từ Cloudinary
            uploadedFiles.forEach(({ originalFile, cloudinaryResult }) => {
                if (originalFile.mimetype.startsWith("image/")) {
                    images.push({
                        url: cloudinaryResult.secure_url, // URL từ Cloudinary
                        filename: originalFile.originalname
                    });
                } else {
                    file = {
                        url: cloudinaryResult.secure_url, // URL từ Cloudinary
                        filename: originalFile.originalname,
                        size: originalFile.size,
                        mimeType: originalFile.mimetype
                    };
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
            },
            replyTo: replyTo || null
        });

        await message.save();

        if (replyTo) {
            await message.populate({
                path: 'replyTo',
                select: 'senderId content', // Chỉ lấy thông tin cần thiết
            });
        }

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
    async getMessagesByConversationId(conversationId, userId, { page = 1, limit = 20 }) {
        const skip = (page - 1) * limit;

        // Điều kiện: mảng 'removed' KHÔNG chứa userId
        const query = {
            conversationId,
            "removed.userId": { $ne: userId } // $ne: not equal (không tồn tại trong mảng)
        };

        // B1: Lấy messages trong MongoDB
        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'replyTo',
                select: 'senderId content' // Lấy nội dung tin gốc
            })
            .lean();
        // B2: Lấy danh sách unique senderId
        const senderIds = new Set(messages.map(m => m.senderId));
        messages.forEach(m => {
            if (m.replyTo && m.replyTo.senderId) {
                senderIds.add(m.replyTo.senderId);
            }
        });

        const { data: users, error } = await userService.getUsersByIds([...senderIds]);
        if (error) throw new Error("Failed to fetch user data");

        const userMap = {};
        users.forEach(u => userMap[u.id] = u);

        const messagesWithSender = messages.map(m => {
            // Map sender cho tin nhắn chính
            const msg = {
                ...m,
                sender: userMap[m.senderId] || null,
            };

            // Map sender cho tin nhắn được reply (nếu có)
            if (msg.replyTo) {
                msg.replyTo.sender = userMap[msg.replyTo.senderId] || null;
            }

            return msg;
        });

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
    },

    // Thu hồi tin nhắn
    async revokeMessage(messageId, userId) {
        const message = await Message.findById(messageId);
        if (!message) throw new Error("Tin nhắn không tồn tại");

        // 1. Kiểm tra tin nhắn đã bị thu hồi chưa
        if (message.revoked) {
            throw new Error("Tin nhắn đã bị thu hồi trước đó");
        }

        // 2. Kiểm tra quyền: Chỉ người gửi mới được thu hồi
        if (message.senderId.toString() !== userId) {
            throw new Error("Bạn không có quyền thu hồi tin nhắn này");
        }

        // 3. [MỚI] Kiểm tra thời gian giới hạn
        const now = new Date();
        const messageTime = new Date(message.createdAt);
        const timeDiff = now.getTime() - messageTime.getTime();

        if (timeDiff > REVOKE_TIME_LIMIT) {
            throw new Error("Đã quá thời gian cho phép thu hồi tin nhắn (1 giờ)");
        }

        // Logic cập nhật (Giữ nguyên như bạn đã sửa: Chỉ đổi cờ revoked)
        message.revoked = true;

        // Lưu ý: KHÔNG sửa content ở đây (như thảo luận trước)
        await message.save();
        return message;
    },

    // Xóa tin nhắn (nếu cần)
    async deleteMessageForUser(messageId, userId) {
        const message = await Message.findByIdAndUpdate(
            messageId,
            {
                $addToSet: {
                    removed: {
                        userId: userId,
                        removedAt: new Date()
                    }
                }
            },
            { new: true }
        );
        return message;
    }
};

module.exports = messageService;
