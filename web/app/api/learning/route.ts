import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000",
    headers: {
        "Content-Type": "application/json",
    },
});

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
