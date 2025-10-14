import api from '../../../../lib/api';

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

export const statisticsScoreSpeaking = async (
  userId: string,
  period: string
) => {
  const response = await api.get(
    `/api/learning/score-user/scoreStatisticsSpeaking`,
    {
      params: { userId, period },
    }
  );
  return response.data;
};

export const statisticsScoreListening = async (
  userId: string,
  period: string
) => {
  const response = await api.get(
    `/api/learning/score-user/scoreStatisticsListening`,
    {
      params: { userId, period },
    }
  );
  return response.data;
};

export const statisticsScoreWriting = async (
  userId: string,
  period: string
) => {
  const response = await api.get(
    `/api/learning/score-user/scoreStatisticsWriting`,
    {
      params: { userId, period },
    }
  );
  return response.data;
};

export const getActivityHeatmap = async (userId: string) => {
  const response = await api.get(
    `/api/learning/score-user/getActivityHeatmap`,
    { params: { userId } }
  );
  return response.data;
};
