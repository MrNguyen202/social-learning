import api from "@/lib/api";

export const createRoadMapForUser = async (userId: string, input: any) => {
    const response = await api.post(`/api/learning/roadmap/createRoadMapForUser`, {
        userId,
        input
    });
    return response.data;
};