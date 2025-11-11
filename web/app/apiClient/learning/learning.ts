import api from "@/lib/api";

// Get type exercises by slug
export const getTypeExercisesBySlug = async (slug: string) => {
  try {
    const response = await api.get(`/api/learning/type-exercises/${slug}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching type exercises by slug:", error);
    throw error;
  }
};

//Get all levels
export const getAllLevels = async () => {
  try {
    const response = await api.get(`/api/learning/levels`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all levels:", error);
    throw error;
  }
};

//Get all type paragraphs
export const getAllTypeParagraphs = async () => {
  try {
    const response = await api.get(`/api/learning/type-paragraphs`);
    return response.data;
  }
  catch (error) {
    console.error("Error fetching all type paragraphs:", error);
    throw error;
  }
};

//Get all topics
export const getAllTopics = async () => {
  try {
    const response = await api.get(`/api/learning/topics`);
    return response.data;
  }
  catch (error) {
    console.error("Error fetching all topics:", error);
    throw error;
  }
};

// Get level by slug
export const getLevelBySlug = async (slug: string) => {
  try {
    const response = await api.get(`/api/learning/level/slug/${slug}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching level by slug:", error);
    throw error;
  }
};

// Get topic by slug
export const getTopicBySlug = async (slug: string) => {
  try {
    const response = await api.get(`/api/learning/topic/slug/${slug}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching topic by slug:", error);
    throw error;
  }
};

// Get type paragraph by slug
export const getTypeParagraphBySlug = async (slug: string) => {
  try {
    const response = await api.get(`/api/learning/type-paragraph/slug/${slug}`);
    return response.data;
  }
  catch (error) {
    console.error("Error fetching type paragraph by slug:", error);
    throw error;
  }
};

// Get levels by name_vi
export const getLevelsByNameVi = async (name_vi: string) => {
  try {
    const response = await api.get(`/api/learning/levels/name_vi/${name_vi}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching levels by name_vi:", error);
    throw error;
  }
};

// Get topics by name_vi
export const getTopicsByNameVi = async (name_vi: string) => {
  try {
    const response = await api.get(`/api/learning/topics/name_vi/${name_vi}`);
    return response.data;
  }
  catch (error) {
    console.error("Error fetching topics by name_vi:", error);
    throw error;
  }
};

// Get type paragraphs by name_vi
export const getTypeParagraphsByNameVi = async (name_vi: string) => {
  try {
    const response = await api.get(`/api/learning/type-paragraphs/name_vi/${name_vi}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching type paragraphs by name_vi:", error);
    throw error;
  }
};
