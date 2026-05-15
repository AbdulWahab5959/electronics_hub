// src/services/cart.js
import api from './api';

// Get user's cart
export const getCart = () => api.get('/cart');

// Add product to cart
export const addToCart = (productId, quantity = 1) => {
  return api.post('/cart', { product_id: productId, quantity });
};

// Update cart item quantity
export const updateCartItem = (cartItemId, quantity) => {
  return api.put(`/cart/${cartItemId}`, { quantity });
};

// Remove item from cart
export const removeCartItem = (cartItemId) => {
  return api.delete(`/cart/${cartItemId}`);
};

// Clear entire cart
export const clearCart = () => api.delete('/cart');