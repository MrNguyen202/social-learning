import api from "../../../../lib/api";

// Hàm để lấy danh sách cuộc trò chuyện của người dùng
export async function fetchConversations() {
    try {
        const response = await api.get(`/api/conversations/user`);
        return response.data;
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return [];
    }
}

// Hàm để đếm số tin nhắn chưa đọc trong một cuộc trò chuyện
export async function fetchUnreadCount(conversationId: string) {
    try {
        const response = await api.get(`/api/conversations/${conversationId}/unread`);
        return response.data.count;
    } catch (error) {
        console.error("Error fetching unread count:", error);
        return 0;
    }
}

// Hàm để tìm cuộc trò chuyện giữa hai người dùng
export async function findConversationBetweenUsers(userId2: any) {
    try {
        const response = await api.get(`/api/conversations/between/${userId2}`);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            return error.response;
        }
        console.error("Error finding conversation between users:", error);
        throw error;
    }
}

// Hàm để tạo cuộc trò chuyện mới
export async function createConversation(consversationData: any) {
    try {
        const response = await api.post(`/api/conversations/create`, consversationData);
        return response.data;
    } catch (error) {
        console.error("Error creating conversation:", error);
        throw error;
    }
}

// Hàm đếm tổng số tin nhắn chưa đọc của người dùng trong tất cả cuộc trò chuyện
export async function fetchTotalUnreadMessages() {
    try {
        const response = await api.get(`/api/conversations/totalUnread`);
        return response.data.totalUnread;
    } catch (error) {
        console.error("Error fetching total unread messages:", error);
        return 0;
    }
}

// Hàm để thêm thành viên vào cuộc trò chuyện nhóm
export const addMembersToGroup = async (conversationId: string, memberIds: string[]) => {
    try {
        const response = await api.post(`/api/conversations/${conversationId}/members`, { memberIds });
        return response.data;
    } catch (error) {
        console.error("Error adding members to group:", error);
        throw error;
    }
};

// Hàm để xoá thành viên khỏi cuộc trò chuyện nhóm
export async function removeMemberFromGroup(conversationId: any, memberId: any) {
    try {
        const response = await api.delete(`/api/conversations/${conversationId}/members/${memberId}`);
        return response.data;
    } catch (error) {
        console.error("Error removing member from group:", error);
        throw error;
    }
}

// Hàm để cấp quyền quản trị viên cho thành viên trong cuộc trò chuyện nhóm
export async function grantAdminInGroup(conversationId: any, memberId: any) {
    try {
        const response = await api.put(`/api/conversations/${conversationId}/admins`, { memberId });
        return response.data;
    } catch (error) {
        console.error("Error granting admin in group:", error);
        throw error;
    }
}

// Hàm để rời khỏi cuộc trò chuyện nhóm
export async function leaveGroupConversation(conversationId: any) {
    const response = await api.post(`/api/conversations/${conversationId}/leave`);
    return response.data;
}

// Hàm để giải tán cuộc trò chuyện nhóm
export async function dissolveGroupConversation(conversationId: any) {
    try {
        const response = await api.delete(`/api/conversations/${conversationId}/dissolve`);
        return response.data;
    } catch (error) {
        console.error("Error dissolving group conversation:", error);
        throw error;
    }
}

// Hàm để xoá lịch sử cuộc trò chuyện
export async function deleteConversationHistory(conversationId: any) {
    try {
        const response = await api.delete(`/api/conversations/${conversationId}/history`);
        return response.data;
    } catch (error) {
        console.error("Error deleting conversation history:", error);
        throw error;
    }
}

// Đổi tên nhóm
export const renameGroup = async (conversationId: string, newName: string) => {
    return api.put(`/api/conversations/${conversationId}/rename`, { newName });
};

// Đổi avatar nhóm
export const updateGroupAvatar = async (conversationId: string, file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);

    return api.put(`/api/conversations/${conversationId}/avatar`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};