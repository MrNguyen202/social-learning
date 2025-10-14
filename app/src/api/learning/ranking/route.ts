import api from '../../../../lib/api';

export const getLeaderBoardByType = async (leaderboard_type: string) => {
  const response = await api.get(
    `/api/learning/ranking/leaderboard/${leaderboard_type}`,
  );
  return response.data;
};

export const getUserRank = async (userId: string) => {
  const response = await api.get(`/api/learning/ranking/userRank/${userId}`);
  return response.data;
};
