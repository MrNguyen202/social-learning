import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getUserData = async (userId: string) => {
  try {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const getUsersData = async () => {
  try {
    const response = await api.get("/api/users");
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const updateUserData = async (userId: string, data: any) => {
  try {
    const response = await api.put(`/api/users/${userId}`, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};
