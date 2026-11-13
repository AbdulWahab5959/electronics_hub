import axios from 'axios';

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/+$/, '');
const API_ROOT = API_URL.replace(/\/api$/, '');
const timeout = Number.parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10);
const credentials = {
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  timeout,
};
const api = axios.create({
  ...credentials,
  baseURL: API_URL,
  headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
});

// Never log request bodies: authentication payloads contain passwords.
export const refreshCSRF = () => axios.get(`${API_ROOT}/sanctum/csrf-cookie`, credentials);
export const checkSession = async () => {
  try { await api.get('/user'); return true; } catch { return false; }
};
export const getCancelToken = () => axios.CancelToken.source();
export default api;
