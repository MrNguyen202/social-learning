import api from "@/lib/api";

export const loadAnalyticOverview = async ({ fromDate, toDate }: any) => {
  const response = await api.get("/api/admin/analytics/overview", {
    params: { fromDate, toDate },
  });
  return response.data;
};

export const loadDifficultWords = async ({ skill, errorType }: any) => {
  const response = await api.get("/api/admin/analytics/difficult-words", {
    params: { skill, errorType },
  });
  return response.data;
};

export const loadLeaderboard = async () => {
  const response = await api.get("/api/admin/analytics/leaderboard");
  return response.data;
};

export const loadSkillBreakdown = async () => {
  const response = await api.get("/api/admin/analytics/skill-breakdown");
  return response.data;
};

export const loadVocabularyOverview = async () => {
  const response = await api.get("/api/admin/analytics/vocabulary-overview");
  return response.data;
};

export const loadVocabularyTopics = async () => {
  const response = await api.get("/api/admin/analytics/vocabulary-topics");
  return response.data;
};

export const loadRevenueTrends = async ({ fromDate, toDate }: any) => {
  const response = await api.get("/api/admin/analytics/revenue-trends", {
    params: { fromDate, toDate },
  });
  return response.data;
}