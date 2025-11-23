import { useState, useCallback } from "react";
import { sendMessage as apiSendMessage, deleteMessageForUser, revokeMessage } from "@/app/apiClient/chat/message/message";
import { toast } from "react-toastify";

// Định nghĩa type mở rộng cho tin nhắn local
export type MessageStatus = "sending" | "sent" | "error";

export interface LocalMessage {
    _id: string;
    conversationId: string;
    senderId: string;
    content: {
        type: string;
        text: string;
        images: { url: string; filename: string }[];
        file: any;
    };
    sender: {
        id: string;
        name: string;
        avatar: string;
    };
    createdAt: string;
    seens: any[];

    // Các trường bổ sung cho logic client
    status?: MessageStatus;
    filesData?: File[]; // Lưu file gốc để gửi lại nếu lỗi,
    replyTo?: any;
}

export const useChat = (conversationId: string | undefined, user: any) => {
    const [messages, setMessages] = useState<LocalMessage[]>([]);

    // 1. Hàm thêm tin nhắn (dùng cho Socket hoặc load trang đầu)
    const addMessage = useCallback((newMessage: any) => {
        setMessages((prev) => {
            // Kiểm tra trùng lặp: Nếu tin nhắn đã tồn tại thì không thêm nữa
            if (prev.some((msg) => msg._id === newMessage._id)) {
                return prev;
            }
            return [newMessage, ...prev];
        });
    }, []);

    // 2. Hàm set danh sách tin nhắn ban đầu (khi fetch API)
    const setInitialMessages = useCallback((msgs: any[]) => {
        setMessages(msgs);
    }, []);

    // 3. Hàm Gửi tin nhắn (Optimistic UI)
    const sendMessage = async (text: string, files: File[], replyTo: any = null) => {
        if (!user || !conversationId) return;

        // A. Tạo ID tạm và URL preview cho file
        const tempId = `temp-${Date.now()}`;

        // Tạo preview ảnh ngay lập tức dùng URL.createObjectURL
        const tempImages = files
            .filter((f) => f.type.startsWith("image/"))
            .map((f) => ({
                url: URL.createObjectURL(f),
                filename: f.name,
            }));

        // Tạo preview file thường
        const tempFile = files.find((f) => !f.type.startsWith("image/"));
        const tempFileData = tempFile
            ? {
                url: URL.createObjectURL(tempFile), // URL blob cục bộ
                filename: tempFile.name,
                mimeType: tempFile.type,
                size: tempFile.size,
            }
            : null;

        // B. Tạo message giả lập
        const optimisticMessage: LocalMessage = {
            _id: tempId,
            conversationId,
            senderId: user.id,
            content: {
                type: files.length > 0 ? (tempImages.length > 0 ? "image" : "file") : "text",
                text: text,
                images: tempImages,
                file: tempFileData,
            },
            sender: {
                id: user.id,
                name: user.name,
                avatar: user.avatar || "",
            },
            createdAt: new Date().toISOString(),
            seens: [],
            status: "sending", // Đánh dấu đang gửi
            filesData: files,  // Lưu file gốc để dùng nếu cần retry
            replyTo: replyTo,
        };

        // C. Update UI ngay lập tức (đẩy tin nhắn lên đầu)
        setMessages((prev) => [optimisticMessage, ...prev]);

        try {
            // D. Gửi API gửi thật
            const responseMessage = await apiSendMessage({
                conversationId,
                senderId: user.id,
                text,
                files,
                replyTo: replyTo?._id
            });

            // E. Thành công: Thay thế tin nhắn tạm bằng tin thật
            setMessages((prev) =>
                prev.map((msg) => {
                    if (msg._id === tempId) {
                        return {
                            ...responseMessage,
                            replyTo: msg.replyTo,
                            status: "sent"
                        };
                    }
                    return msg;
                })
            );
        } catch (error) {
            console.error("Gửi thất bại:", error);
            // F. Thất bại: Đánh dấu lỗi để hiện nút Retry
            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === tempId ? { ...msg, status: "error" } : msg
                )
            );
            toast.error("Gửi tin nhắn thất bại");
        }
    };

    // 4. Hàm Gửi lại (Retry)
    const retryMessage = async (tempId: string) => {
        const msgToRetry = messages.find((m) => m._id === tempId);
        if (!msgToRetry) return;

        // Chuyển trạng thái lại thành "sending"
        setMessages((prev) =>
            prev.map((m) => (m._id === tempId ? { ...m, status: "sending" } : m))
        );

        try {
            // Gửi lại API với file gốc đã lưu trong filesData
            const responseMessage = await apiSendMessage({
                conversationId,
                senderId: user.id,
                text: msgToRetry.content.text,
                files: msgToRetry.filesData || [],
            });

            // Update thành công
            setMessages((prev) =>
                prev.map((m) =>
                    m._id === tempId ? { ...responseMessage, status: "sent" } : m
                )
            );
        } catch (error) {
            // Vẫn lỗi -> giữ nguyên status error
            setMessages((prev) =>
                prev.map((m) => (m._id === tempId ? { ...m, status: "error" } : m))
            );
            toast.error("Gửi lại thất bại");
        }
    };

    // 5. Hàm Thu hồi tin nhắn (Thêm mới)
    const handleRevokeMessage = async (messageId: string) => {
        if (!user) return;

        try {
            await revokeMessage(messageId, user.id);

            // Update UI Optimistic (Cập nhật ngay lập tức trước khi socket trả về để mượt hơn)
            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === messageId
                        ? {
                            ...msg,
                            revoked: true, // Cần thêm field này vào type LocalMessage
                            content: { ...msg.content, text: "Tin nhắn đã bị thu hồi", images: [], file: null }
                        }
                        : msg
                )
            );
        } catch (error) {
            console.error("Thu hồi thất bại:", error);
            toast.error("Không thể thu hồi tin nhắn");
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!user) return;

        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));

        try {
            await deleteMessageForUser(messageId);
        } catch (error) {
            console.error("Xóa thất bại:", error);
            toast.error("Không thể xóa tin nhắn");
        }
    };

    return {
        messages,
        addMessage,
        setInitialMessages,
        sendMessage,
        retryMessage,
        setMessages,
        handleRevokeMessage,
        handleDeleteMessage
    };
};