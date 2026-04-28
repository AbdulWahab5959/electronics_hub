// src/services/api.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const API_ROOT = API_URL.replace("/api", "");
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || "30000");

// Global axios settings for Laravel Sanctum
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

api.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: new Date() };

    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV && response.config.metadata) {
      const duration = new Date() - response.config.metadata.startTime;
      console.log(`[API Response] ${response.config.url} - ${duration}ms`);
    }

    return response;
  },
  async (error) => {
    if (!error.response) {
      console.error("[Network Error]", error.message);
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    if (status === 401) {
      console.warn("[Auth] 401 Unauthorized - user is not logged in");
    } else if (status === 419) {
      console.warn("[Auth] 419 CSRF mismatch");
    } else if (status === 422) {
      console.debug("[Validation Error]", data.errors);
    } else {
      console.error(`[API Error] ${status}`, data);
    }

    return Promise.reject(error);
  }
);

export const checkSession = async () => {
  try {
    await api.get("/user");
    return true;
  } catch {
    return false;
  }
};

export const refreshCSRF = () => {
  return axios.get(`${API_ROOT}/sanctum/csrf-cookie`, {
    withCredentials: true,
    withXSRFToken: true,
  });
};

export const getCancelToken = () => axios.CancelToken.source();

export default api;