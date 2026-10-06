// src/services/product.js
import api from './api';

// Get all products with filters, sorting, pagination
export const getProducts = (params = {}) => {
  return api.get('/products', { params });
};

// Get single product by ID
export const getProduct = (id) => api.get(`/products/${id}`);

// Get product categories with counts
export const getCategories = () => api.get('/categories');

// Get brands with counts
export const getBrands = () => api.get('/brands');

// Get featured products
export const getFeaturedProducts = () => api.get('/products/featured');

// Get new arrivals
export const getNewArrivals = () => api.get('/products/new-arrivals');

// Get best selling products
export const getBestSelling = () => api.get('/products/best-selling');

// Search products by keyword
export const searchProducts = (query) => api.get('/products/search', { params: { q: query } });