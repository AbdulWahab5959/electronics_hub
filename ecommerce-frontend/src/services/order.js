// src/services/order.js
import api from './api';

// Get all orders for the authenticated user
export const getOrders = () => api.get('/orders');

// Get single order by ID
export const getOrder = (orderId) => api.get(`/orders/${orderId}`);

// Create a new order (checkout)
export const createOrder = (orderData) => api.post('/orders', orderData);

// Cancel a pending order
export const cancelOrder = (orderId) => api.post(`/orders/${orderId}/cancel`);

// Track order by order number (public)
export const trackOrder = (orderNumber) => api.get(`/orders/track/${orderNumber}`);