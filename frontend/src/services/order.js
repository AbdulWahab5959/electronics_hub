// src/services/order.js
import api from './api';

// Get all orders for the authenticated user
export const getOrders = (config = {}) => api.get('/orders', config);

// Get single order by ID
export const getOrder = (orderId) => api.get(`/orders/${orderId}`);
export const getOrderByNumber = (number, config = {}) => api.get(`/orders/number/${encodeURIComponent(number)}`, config);
export const getCheckoutQuote = () => api.post('/checkout/quote');

// Create a new order (checkout)
export const createOrder = (orderData) => api.post('/orders', orderData);

// Cancel a pending order
export const cancelOrder = (orderId) => api.post(`/orders/${orderId}/cancel`);

// Tracking is restricted to the signed-in order owner.
export const trackOrder = (orderNumber, config = {}) => api.get(`/orders/track/${encodeURIComponent(orderNumber)}`, config);
