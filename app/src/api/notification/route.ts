import api from "../../../lib/api";

export const createNotification = async (data: any) => {
  const response = await api.post("/api/notifications", data);
  return response.data;
};

export const markNotificationAsRead = async (notificationId: string) => {
  const response = await api.put(`/api/notifications/${notificationId}/read`);
  return response.data;
};

export const fetchNotifications = async (receiverId: string) => {
  const response = await api.get(`/api/notifications/${receiverId}`);
  return response.data;
};

export const markNotificationLearningAsRead = async (notificationLearningId: string) => {
  const response = await api.put(`/api/notifications/learning/${notificationLearningId}/read`);
  return response.data;
};

export const fetchNotificationsLearning = async (userId: string) => {
  const response = await api.get(`/api/notifications/learning/${userId}`);
  return response.data;
};
