import api from "@/lib/api";

export const loadUsers = async ({ search, level, fromDate, toDate }: any) => {
  const response = await api.get("/api/admin/users", {
    params: {
      search,
      level,
      fromDate,
      toDate,
    },
  });
  return response.data;
};

export const loadUserDetail = async (userId: string) => {
  const response = await api.get(`/api/admin/users/${userId}`);
  return response.data;
};

export const loadUserPosts = async (userId: string) => {
  const response = await api.get(`/api/admin/users/${userId}/posts`);
  return response.data;
};

export const loadUserAchievements = async (userId: string) => {
  const response = await api.get(`/api/admin/users/${userId}/achievements`);
  return response.data;
};

export const loadUserErrors = async (userId: string) => {
  const response = await api.get(`/api/admin/users/${userId}/errors`);
  return response.data;
};

export const loadUserScores = async (userId: string) => {
  const response = await api.get(`/api/admin/users/${userId}/scores`);
  return response.data;
};

export const loadUserVocabularies = async (userId: string) => {
  const response = await api.get(`/api/admin/users/${userId}/vocabulary`);
  return response.data;
};

export const loadUserGrowthChart = async () => {
  const response = await api.get(
    `/api/admin/users/stats/get-user-growth-chart`
  );
  return response.data;
};

export const loadDailyActiveUsers = async () => {
  const response = await api.get(`/api/admin/users/stats/daily-active-users`);
  return response.data;
};
