// src/services/auth.js
import api, { refreshCSRF } from "./api";

const withCsrf = async (requestFn) => {
  await refreshCSRF();
  return requestFn();
};

// ========== REGISTRATION & LOGIN ==========
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

// ========== PASSWORD RESET ==========
export const forgotPassword = async (email) => {
  return withCsrf(() => api.post("/forgot-password", { email }));
};

export const resetPassword = async (data) => {
  return withCsrf(() => api.post("/reset-password", data));
};

// ========== EMAIL VERIFICATION ==========
export const verifyEmail = async (id, hash, expires, signature) => {
  return api.get(`/email/verify/${id}/${hash}`, {
    params: { expires, signature }
  });
};

export const resendVerification = async () => {
  return api.post("/email/resend");
};