import api from "@/lib/api";

export const getDashboardMetrics = async () => {
  const response = await api.get("/api/admin/dashboard/stats");
  return response.data;
};

export const getRecentActivities = async (userId:string) => {
  const response = await api.get(`/api/admin/dashboard/recent-activities/${userId}`);
  return response.data;
};

export const getPendingModeration = async () => {
  const response = await api.get("/api/admin/dashboard/pending-moderation");
  return response.data;
};

export const getLearningFrequencyStats = async () => {
  const response = await api.get("/api/admin/dashboard/learning-frequency-stats");
  return response.data;
}
