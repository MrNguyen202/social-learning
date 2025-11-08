import api from "../../../../lib/api";

// Hàm để lấy danh sách cuộc trò chuyện của người dùng
export async function fetchConversations(userId: string) {
    try {
        const response = await api.get(`/api/conversations/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return [];
    }
}

// Hàm để đếm số tin nhắn chưa đọc trong một cuộc trò chuyện
export async function fetchUnreadCount(conversationId: string, userId: string) {
    try {
        const response = await api.get(`/api/conversations/${conversationId}/unread/${userId}`);
        return response.data.count;
    } catch (error) {
        console.error("Error fetching unread count:", error);
        return 0;
    }
}

// Hàm để tìm cuộc trò chuyện giữa hai người dùng
export async function findConversationBetweenUsers(userId1:any, userId2:any) {
    try {
        const response = await api.get(`/api/conversations/between/${userId1}/${userId2}`);
        return response.data;
    } catch (error:any) {
        if (error.response && error.response.status === 404) {
            return error.response;
        }
        console.error("Error finding conversation between users:", error);
        throw error;
    }
}

// Hàm để tạo cuộc trò chuyện mới
export async function createConversation(consversationData:any) {
    try {
        const response = await api.post(`/api/conversations/create`, consversationData);
        return response.data;
    } catch (error) {
        console.error("Error creating conversation:", error);
        throw error;
    }
}

// Hàm đếm tổng số tin nhắn chưa đọc của người dùng trong tất cả cuộc trò chuyện
export async function fetchTotalUnreadMessages(userId:any) {
    try {
        const response = await api.get(`/api/conversations/totalUnread/${userId}`);
        return response.data.totalUnread;
    } catch (error) {
        console.error("Error fetching total unread messages:", error);
        return 0;
    }
}
