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

// Get all levels by type_exercise
export const getAllLevelsByTypeExercise = async (type_exercise_id: string) => {
  try {
    const response = await api.get(`/api/learning/levels/${type_exercise_id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching levels by type exercise:", error);
    throw error;
  }
};

// Get all topics by type_exercise
export const getAllTopicsByTypeExercise = async (type_exercise_id: string) => {
  try {
    const response = await api.get(`/api/learning/topics/${type_exercise_id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching topics by type exercise:", error);
    throw error;
  }
};

// Get list writing-exercises by type_exercise, level and topic
export const getListWritingExercisesByTypeLevelTopic = async (
  type_exercise_slug: string,
  level_slug: string,
  topic_slug: string
) => {
  try {
    const response = await api.get(
      `/api/learning/writing-exercises/${type_exercise_slug}/${level_slug}/${topic_slug}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching writing exercises by type, level and topic:",
      error
    );
    throw error;
  }
};

// Get writing-exercise by id
export const getWritingExerciseById = async (id: number) => {
  try {
    const response = await api.get(`/api/learning/writing-exercises/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching writing exercise by id:", error);
    throw error;
  }
};
