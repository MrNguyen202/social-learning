import axios from 'axios';
import { supabase } from './supabase';
import { BASE_URL_API } from '@env';

const api = axios.create({
  baseURL: "http://192.168.1.185:5000",
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async config => {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    return Promise.reject(error.response?.data || error);
  },
);

export default api;
