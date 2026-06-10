import api from './api';

const ADMIN_TOKEN_KEY = 'orbit-admin-token';
export const ADMIN_SESSION_EVENT = 'orbit-admin-session-change';

export interface AdminIdentity {
  username: string;
  role: 'admin';
}

export interface AdminSession {
  authenticated: boolean;
  admin: AdminIdentity;
}

export const getStoredAdminToken = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(ADMIN_TOKEN_KEY) || '';
};

export const hasStoredAdminToken = () => Boolean(getStoredAdminToken());

const emitAdminSessionChange = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(ADMIN_SESSION_EVENT));
};

export const storeAdminToken = (token: string) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  emitAdminSessionChange();
};

export const clearAdminToken = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  emitAdminSessionChange();
};

export const adminLogin = async (username: string, password: string) => {
  const { data } = await api.post('/api/admin/login', { username, password });
  if (data?.token) storeAdminToken(data.token);
  return data as { token: string; admin: AdminIdentity; expires_in: number };
};

export const getAdminSession = async () => {
  const token = getStoredAdminToken();
  if (!token) return null;
  const { data } = await api.get('/api/admin/session', {
    headers: { 'X-Admin-Token': token },
  });
  return data as AdminSession;
};

export const getAdminOverview = async () => {
  const { data } = await api.get('/api/admin/overview');
  return data;
};

export const getAdminUsers = async (query = '') => {
  const { data } = await api.get('/api/admin/users', { params: query ? { q: query } : undefined });
  return data as { users: any[] };
};

export const getAdminBilling = async () => {
  const { data } = await api.get('/api/admin/billing');
  return data as { plans: any[]; subscriptions: any[]; payments: any[]; invoices: any[] };
};

export const getAdminAiUsage = async () => {
  const { data } = await api.get('/api/admin/ai-usage');
  return data;
};

export const getAdminChats = async () => {
  const { data } = await api.get('/api/admin/chats');
  return data as { messages: any[] };
};

export const getAdminNews = async () => {
  const { data } = await api.get('/api/admin/news');
  return data as { news: any[] };
};

export const createAdminNews = async (payload: { title: string; content: string; category?: string }) => {
  const { data } = await api.post('/api/admin/news', payload);
  return data;
};

export const updateAdminNews = async (id: string, payload: { title?: string; content?: string; category?: string }) => {
  const { data } = await api.put(`/api/admin/news/${id}`, payload);
  return data;
};

export const deleteAdminNews = async (id: string) => {
  await api.delete(`/api/admin/news/${id}`);
};
