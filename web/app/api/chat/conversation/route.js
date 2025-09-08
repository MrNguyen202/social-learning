import api from "@/lib/api";

// Hàm để lấy danh sách cuộc trò chuyện của người dùng
export async function fetchConversations(userId) {
    try {
        const response = await api.get(`/api/conversations/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return [];
    }
}

// Hàm để đếm số tin nhắn chưa đọc trong một cuộc trò chuyện
export async function fetchUnreadCount(conversationId, userId) {
    try {
        const response = await api.get(`/api/conversations/${conversationId}/unread/${userId}`);
        return response.data.count;
    } catch (error) {
        console.error("Error fetching unread count:", error);
        return 0;
    }
}
