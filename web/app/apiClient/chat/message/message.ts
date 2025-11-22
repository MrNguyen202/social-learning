import api from "@/lib/api";

// Hàm để lấy danh sách tin nhắn trong một cuộc trò chuyện
export async function fetchMessages(conversationId: any, page = 1, limit = 20) {
  try {
    const response = await api.get(
      `/api/messages/conversation/${conversationId}`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

// Hàm để gửi tin nhắn dạng text mới
export async function sendMessage({
  conversationId,
  senderId,
  text,
  files,
  replyTo,
}: any) {
  try {
    const formData = new FormData();
    formData.append("conversationId", conversationId);
    formData.append("senderId", senderId);
    if (text) formData.append("text", text);
    if (replyTo) formData.append("replyTo", replyTo);
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
    }
    const response = await api.post("/api/messages/save", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

// Hàm để đánh dấu tin nhắn đã đọc
export async function markMessagesAsRead(conversationId: any, userId: any) {
  try {
    const response = await api.post(
      `/api/messages/markAsRead/${conversationId}`,
      { userId }
    );
    return response.data;
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
}
