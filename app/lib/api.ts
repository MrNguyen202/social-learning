import axios from 'axios';
import { supabase } from './supabase';
import { base_url_api } from '../constants';

const api = axios.create({
  baseURL: base_url_api,
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
