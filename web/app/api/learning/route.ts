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
