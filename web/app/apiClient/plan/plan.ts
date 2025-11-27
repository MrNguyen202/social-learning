import api from "@/lib/api";

// Get all available plans
export const getPlans = async () => {
    const response = await api.get("/api/plans");
    return response.data;
};