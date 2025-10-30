import api from "@/lib/api";

export const loadAchievement = async ({ type, skill }: any) => {
  const response = await api.get("/api/admin/achievements", {
    params: {
      type,
      skill,
    },
  });
  return response.data;
};
export const createAchievement = async (data: any) => {
  const response = await api.post("/api/admin/achievements", data);
  return response.data;
};

export const updateAchievement = async (achievementId: string, data: any) => {
  const response = await api.put(
    `/api/admin/achievements/${achievementId}`,
    data
  );
  return response.data;
};