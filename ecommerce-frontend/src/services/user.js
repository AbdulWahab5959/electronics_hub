// src/services/user.js
import api from './api';

// ========== PROFILE ==========
export const getProfile = () => api.get('/profile');
export const updateProfile = (data) => api.put('/profile', data);
export const changePassword = (data) => api.post('/change-password', data);

// ========== ADDRESSES ==========
export const getAddresses = () => api.get('/addresses');
export const getAddress = (id) => api.get(`/addresses/${id}`);
export const createAddress = (data) => api.post('/addresses', data);
export const updateAddress = (id, data) => api.put(`/addresses/${id}`, data);
export const deleteAddress = (id) => api.delete(`/addresses/${id}`);
export const setDefaultAddress = (id) => api.post(`/addresses/${id}/set-default`);
export const uploadAvatar = (formData) => {
  return api.post('/user/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};