import api from "@/lib/api";

export const getSpeakingByTopicAndLevel = async (
  levelId: number,
  topicId: number
) => {
  const response = await api.get(
    `/api/learning/speaking/${levelId}/${topicId}`
  );
  return response.data;
};

// Generate speaking exercise by AI
export const generateSpeakingExerciseByAI = async (
  level_slug: string,
  topic_slug: string
) => {
  const response = await api.post(
    `/api/bot-cover-learning/generate-speaking-exercise`,
    {
      level_slug,
      topic_slug,
    }
  );
  return response.data;
};

// Generate conversation practice exercise by AI
export const generateConversationPracticeByAI = async (
  level_slug: string,
  topic_slug: string
) => {
  const response = await api.post(
    `/api/bot-cover-learning/generate-conversation-practice-by-AI`,
    {
      level_slug,
      topic_slug,
    }
  );
  return response.data;
};
