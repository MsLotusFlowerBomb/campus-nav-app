//const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = 'https://campus-nav-app.onrender.com';
const TOKEN_KEY = 'ul_nav_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function apiFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) clearToken();
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  register: (body) => apiFetch('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  guest: (body) => apiFetch('/api/v1/auth/guest', { 
    method: 'POST', 
    body: JSON.stringify(body) 
  }),
  login: (body) => apiFetch('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  me: () => apiFetch('/api/v1/auth/me'),
  logout: () => apiFetch('/api/v1/auth/logout', { method: 'POST' }),
};