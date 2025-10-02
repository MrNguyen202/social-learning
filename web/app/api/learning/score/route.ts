import api from "@/lib/api";

// Get score user by user_id
export const getScoreUserByUserId = async (user_id: string) => {
    try {
        const response = await api.get(`/api/learning/score-user/score/${user_id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching score user by user_id:", error);
        throw error;
    }
};