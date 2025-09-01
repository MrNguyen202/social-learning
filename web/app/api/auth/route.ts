import api from "@/lib/api";

export const register = async ({ email, password, name }: any) => {
  try {
    const response = await api.post("/api/auth/register", {
      email,
      password,
      name,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const verifyOtp = async ({ email, otp }: any) => {
  try {
    const response = await api.post("/api/auth/verify", {
      email,
      otp,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const login = async ({ email, password }: any) => {
  try {
    const response = await api.post("/api/auth/login", {
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};