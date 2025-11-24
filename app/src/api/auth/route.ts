import api from '../../../lib/api';

export const register = async ({ email, password, name }: any) => {
  const response = await api.post('/api/auth/register', {
    email,
    password,
    name,
  });
  return response.data;
};

export const verifyOtp = async ({ email, otp }: any) => {
  const response = await api.post('/api/auth/verify', {
    email,
    otp,
  });
  return response.data;
};

export const resendOtp = async ({ email }: any) => {
  const response = await api.post('/api/auth/resend-otp', {
    email,
  });
  return response.data;
};

export const login = async ({ email, password }: any) => {
  const response = await api.post('/api/auth/login', {
    email,
    password,
  });
  return response.data;
};

export const sendResetOtp = async ({ email }: any) => {
  const response = await api.post('/api/auth/send-reset-otp', {
    email,
  });
  return response.data;
};

export const verifyResetOtp = async ({ email, otp }: any) => {
  const response = await api.post('/api/auth/verify-reset-otp', {
    email,
    otp,
  });
  return response.data;
};

export const forgotPassword = async ({ session, newPassword }: any) => {
  const response = await api.post('/api/auth/new-password', {
    session,
    newPassword,
  });
  return response.data;
};
