import axios from 'axios';
import { supabase } from '../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to add Supabase JWT to requests
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Profile Endpoints
export const getProfile = () => api.get('/api/profiles/me');
export const updateProfile = (data: any) => api.put('/api/profiles/me', data);

// PDF Endpoints
export const getPdfs = () => api.get('/api/pdfs');
export const uploadPdfMetadata = (data: any) => api.post('/api/pdfs', data);
export const deletePdf = (id: string) => api.delete(`/api/pdfs/${id}`);

// Leaderboard & Stats
export const getLeaderboard = () => api.get('/api/stats/leaderboard');
export const getMyStats = () => api.get('/api/stats/me');
export const updateStats = (data: any) => api.put('/api/stats/me', data);

// News
export const getNews = () => api.get('/api/news');

// Research
export const getResearch = () => api.get('/api/research');
export const saveResearch = (data: any) => api.post('/api/research', data);

// GPA
export const getGpaRecords = () => api.get('/api/gpa');
export const saveGpaRecord = (data: any) => api.post('/api/gpa', data);

export default api;
