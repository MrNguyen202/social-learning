import api from "@/lib/api";

interface VocabularyData {
  word: string;
  error_type: string;
  skill: string;
}

// Insert vocabulary errors of user
export const insertOrUpdateVocabularyErrors = async ({ userId, vocabData }: { userId: string; vocabData: VocabularyData }) => {
  const response = await api.post(`/api/learning/vocabulary/insert`, {
    userId,
    vocabData
  });
  return response.data;
};


export const generateVocabByAI = async ({ userId, word }: { userId: string; word: string }) => {
  const response = await api.post(`/api/bot-cover-learning/generate-personal-word-by-AI`, {
    userId,
    word
  });
  return response.data;
};

// Get personal vocabulary list by user ID and created word
export const getListPersonalVocabByUserIdAndCreated = async ({ userId }: { userId: string }) => {
  const response = await api.get(`/api/learning/vocabulary/created/${userId}`);
  return response.data;
};


export const getPersonalVocabById = async ({ personalVocabId }: { personalVocabId: string }) => {
  const response = await api.get(`/api/learning/vocabulary/${personalVocabId}`);
  return response.data;
}

export const getSumPersonalVocabByMasteryScore = async ({ userId, from, to }: { userId: string; from: number; to: number }) => {
  const response = await api.get(`/api/learning/vocabulary/mastery_score/${userId}/${from}/${to}`);
  return response.data;
}

export const getPersonalAllTopics = async ({ userId }: { userId: string }) => {
  const response = await api.get(`/api/learning/vocabulary/topics/all/${userId}`);
  return response.data;
}

export const getPersonalVocabByTopic = async ( {userId, topic}:any) => {
  const response = await api.get(`/api/learning/vocabulary/topics/${userId}/${topic}`);
  return response.data;
}

export const generateTopicsForUser = async ({ userId }: { userId: string }) => {
  const response = await api.post(`/api/bot-cover-learning/generate-topics`, {
    userId
  });
  return response.data;
}

export const getUserTopics = async ({ userId }: { userId: string }) => {
  const response = await api.get(`/api/learning/vocabulary/user_topics/${userId}`);
  return response.data;
}

export const getVocabByTopic = async ({ userId, topicId }: { userId: string; topicId: any }) => {
  const response = await api.get(`/api/learning/vocabulary/vocab_topic/${userId}/${topicId}`);
  return response.data;
}

// Tạo bài tập theo danh sách từ vựng
export const generateExerciseByVocabList = async ({ userId, words }: { userId: string; words: string[] }) => {
  const response = await api.post(`/api/bot-cover-learning/generate-words-practice-by-AI`, {
    userId,
    words
  });
  return response.data;
}

export const updateMasteryScoreRPC = async ({ userId, word }: { userId: string; word: string }) => {
  const response = await api.post(`/api/learning/vocabulary/update_mastery_score_rpc`, {
    userId,
    word
  });
  return response.data;
}