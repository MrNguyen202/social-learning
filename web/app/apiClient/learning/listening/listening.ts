import api from "@/lib/api";

export const listeningService = {
    // Get listening exercise by id
    getListeningExerciseById: async (id: string) => {
        const response = await api.get(`/api/learning/listening/listening-exercises/${id}`);
        return response.data;
    },

    // Generate listening exercise by AI
    generateListeningExerciseByAI: async (level_slug: string, topic_slug: string) => {
        const response = await api.post(`/api/bot-cover-learning/generate-listening-exercise`, {
            level_slug,
            topic_slug
        });
        return response.data;
    }
};
