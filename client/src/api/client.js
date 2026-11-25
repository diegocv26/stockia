import axios from 'axios';

const TOKEN_KEY = 'stockia-token';
export const UNAUTHORIZED_EVENT = 'stockia:unauthorized';

export const tokenStorage = {
  get: () => {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set: (token) => {
    try { localStorage.setItem(TOKEN_KEY, token); } catch { /* sin almacenamiento */ }
  },
  clear: () => {
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* sin almacenamiento */ }
  },
};

// 401 que significan "tu sesión ya no sirve". Un login fallido (INVALID_CREDENTIALS) NO cierra nada.
const SESSION_ERRORS = ['NO_TOKEN', 'TOKEN_EXPIRED', 'INVALID_TOKEN', 'USER_INACTIVE'];

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  timeout: 70_000, // el plan gratis de Render puede tardar ~1 minuto en despertar
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const code = error.response?.data?.error?.code;
    if (error.response?.status === 401 && SESSION_ERRORS.includes(code)) {
      tokenStorage.clear();
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    return Promise.reject(error);
  }
);
