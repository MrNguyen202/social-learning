const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const userService = require("./userService");
const cloudinary = require("../config/cloudinaryConfig");
const fs = require("fs");

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
    async getMessagesByConversationId(conversationId, { page = 1, limit = 20 }) {
        const skip = (page - 1) * limit;

        // B1: Lấy messages trong MongoDB
        const messages = await Message.find({ conversationId })
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
    }
};

module.exports = messageService;
