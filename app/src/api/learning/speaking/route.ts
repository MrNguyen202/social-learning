import api from '../../../../lib/api';

// Generate speaking exercise
export const getSpeakingByTopicAndLevel = async (
  levelId: number,
  topicId: number,
) => {
  const response = await api.get(
    `/api/learning/speaking/${levelId}/${topicId}`,
  );
  return response.data;
};

export const speechToText = async (audioFileBase64: string) => {
  const response = await api.post(
    `/api/learning/speaking/recognize`,
    {
      audioContent: audioFileBase64,
      // Cấu hình dành riêng cho Mobile (WAV 16-bit)
      encoding: 'LINEAR16',
      sampleRate: 16000,
    },
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
  return response.data;
};

// Generate speaking exercise by AI
export const generateSpeakingExerciseByAI = async (
  level_slug: string,
  topic_slug: string,
) => {
  const response = await api.post(
    `/api/bot-cover-learning/generate-speaking-exercise`,
    {
      level_slug,
      topic_slug,
    },
  );
  return response.data;
};
