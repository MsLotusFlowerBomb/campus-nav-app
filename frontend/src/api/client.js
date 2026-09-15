const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
//const API_URL = 'https://campus-nav-app.onrender.com';
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

// Profile field mapper 
// Converts backend snake_case to frontend camelCase
function mapProfileFromApi(p) {
  if (!p) return null;
  return {
    id: p.id,
    role: p.role,
    studentNumber: p.student_number,
    fullName: p.full_name,
    email: p.email,
    phone: p.phone,
    faculty: p.faculty,
    yearOfStudy: p.year_of_study,
    department: p.department,
    avatarUrl: p.avatar_url,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    lastLoginAt: p.last_login_at,
  };
}

export const api = {
  // Auth — map profile in the response
  register: (body) => apiFetch('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => apiFetch('/api/v1/auth/login', { method: 'POST', body: JSON.stringify(body) })
    .then((res) => ({
      ...res,
      data: { ...res.data, profile: mapProfileFromApi(res.data.profile) },
    })),
  guest: (body) => apiFetch('/api/v1/auth/guest', { method: 'POST', body: JSON.stringify(body) })
    .then((res) => ({
      ...res,
      data: { ...res.data, profile: mapProfileFromApi(res.data.profile) },
    })),
  me: () => apiFetch('/api/v1/auth/me').then((res) => ({
    ...res,
    data: mapProfileFromApi(res.data),
  })),
  logout: () => apiFetch('/api/v1/auth/logout', { method: 'POST' }),

  // Profile — same treatment
  getProfile: () => apiFetch('/api/v1/profile').then((res) => ({
    ...res,
    data: mapProfileFromApi(res.data),
  })),
  updateProfile: (body) => apiFetch('/api/v1/profile', {
    method: 'PUT',
    body: JSON.stringify(body),
  }).then((res) => ({
    ...res,
    data: mapProfileFromApi(res.data),
  })),

  // Favourites
  getFavourites: () => apiFetch('/api/v1/profile/favourites'),
  addFavourite: (placeId) => apiFetch(`/api/v1/profile/favourites/${placeId}`, { method: 'POST' }),
  removeFavourite: (placeId) => apiFetch(`/api/v1/profile/favourites/${placeId}`, { method: 'DELETE' }),
};

export {mapProfileFromApi};