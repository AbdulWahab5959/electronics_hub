// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load cart from backend when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCartItems([]);
      setCartCount(0);
      setCartTotal(0);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/cart');
      setCartItems(response.data.data.items);
      setCartCount(response.data.data.count);
      setCartTotal(response.data.data.total);
    } catch (error) {
      console.error('Failed to fetch cart', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      // Optionally redirect to login or show toast
      return;
    }
    try {
      await api.post('/cart', { product_id: product.id, quantity });
      await fetchCart(); // refresh
      return true;
    } catch (error) {
      console.error('Failed to add to cart', error);
      return false;
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      await api.put(`/cart/${cartItemId}`, { quantity });
      await fetchCart();
    } catch (error) {
      console.error('Failed to update quantity', error);
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await api.delete(`/cart/${cartItemId}`);
      await fetchCart();
    } catch (error) {
      console.error('Failed to remove item', error);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      await fetchCart();
    } catch (error) {
      console.error('Failed to clear cart', error);
    }
  };

  const value = {
    cartItems,
    cartCount,
    cartTotal,
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};