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
    },

    // Get all listening exercises by level_slug and topic_slug
    getListeningExercises: async (level_slug: string, topic_slug: string) => {
        const response = await api.get(`/api/learning/listening/listening-exercises/level/${level_slug}/topic/${topic_slug}`);
        return response.data;
    },

    // Submit listening exercise results
    submitListeningResults: async (user_id: string, ex_listen_id: number, wordAnswers: any[]) => {
        console.log("Submitting listening results:", { user_id, ex_listen_id, wordAnswers });
        const response = await api.post(`/api/learning/listening/listening-exercises/submit`, {
            user_id,
            ex_listen_id,
            wordAnswers
        });
        return response.data;
    },

    // Get progress of a user for a specific listening exercise
    getUserProgress: async (user_id: string, listen_para_id: string) => {
        const response = await api.get(`/api/learning/listening/listening-exercises/progress/${user_id}/${listen_para_id}`);
        return response.data;
    },
};
