// src/services/auth.js
import api, { refreshCSRF } from "./api";

const withCsrf = async (requestFn) => {
  await refreshCSRF();
  return requestFn();
};

export const register = async (userData) => {
  return withCsrf(() => api.post("/register", userData));
};

export const login = async (credentials) => {
  return withCsrf(() => api.post("/login", credentials));
};

export const logout = async () => {
  await refreshCSRF();
  return api.post("/logout");
};

export const getUser = () => api.get("/user");