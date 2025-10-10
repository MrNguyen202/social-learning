import api from "@/lib/api";

// Get score user by user_id
export const getScoreUserByUserId = async (user_id: string) => {
  try {
    const response = await api.get(`/api/learning/score-user/score/${user_id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching score user by user_id:", error);
    throw error;
  }
};

// Add skill score to user
export const addSkillScore = async (
  userId: string,
  skill: string,
  scoreToAdd: number
) => {
  const response = await api.post(`/api/learning/score-user/addSkillScore`, {
    userId,
    skill: skill,
    scoreToAdd: scoreToAdd,
  });
  return response.data;
};
