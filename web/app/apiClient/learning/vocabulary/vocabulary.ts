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