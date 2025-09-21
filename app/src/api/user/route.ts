import api from "../../../lib/api";


export const getUserData = async (userId: string) => {
  const response = await api.get(`/api/users/${userId}`);
  return response.data;
};

export const getUsersData = async () => {
  const response = await api.get("/api/users");
  return response.data;
};

export const updateUserData = async (userId: string, data: any) => {
  const response = await api.put(`/api/users/${userId}`, data);
  return response.data;
};

export const searchUsers = async (keyword: string) => {
  const response = await api.get(`/api/users/search?keyword=${keyword}`);
  return response.data;
};

export const getUserByNickName = async (nickname: string) => {
  const response = await api.get(`/api/users/nickname/${nickname}`);
  return response.data;
};
