// src/services/wishlist.js
import api from './api';

// Get user's wishlist
export const getWishlist = () => api.get('/wishlist');

// Add product to wishlist
export const addToWishlist = (productId) => {
  return api.post('/wishlist', { product_id: productId });
};

// Remove item from wishlist by wishlist item ID
export const removeFromWishlist = (wishlistItemId) => {
  return api.delete(`/wishlist/${wishlistItemId}`);
};

// Check if product is in wishlist
export const checkInWishlist = (productId) => {
  return api.get(`/wishlist/check/${productId}`);
};