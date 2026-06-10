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
