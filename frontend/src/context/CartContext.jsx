/* eslint-disable react-refresh/only-export-components -- context is shared with useCart */
import { createContext, useCallback, useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const owner = isAuthenticated ? user.id : null;
  const [state, setState] = useState({ owner: null, items: [], total: 0, count: 0, error: '' });
  const pending = useRef(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchCart = useCallback(async (signal) => {
    if (!owner) return;
    try {
      const response = await api.get('/cart', { signal });
      if (!signal?.aborted) setState({ owner, ...response.data.data, error: '' });
      return !signal?.aborted;
    } catch (error) {
      if (!signal?.aborted) {
        setState(previous => ({ ...(previous.owner === owner ? previous : { items: [], total: 0, count: 0 }), owner, error: error.response?.data?.message || 'Could not load your cart.' }));
      }
    }
    return false;
  }, [owner]);

  useEffect(() => {
    const controller = new AbortController();
    if (owner) void fetchCart(controller.signal);
    return () => controller.abort();
  }, [owner, fetchCart]);

  const mutate = async request => {
    if (!owner || pending.current) return false;
    pending.current = true;
    setIsUpdating(true);
    try {
      await request();
      return await fetchCart();
    } catch (error) {
      setState(previous => ({
        ...previous, owner, error: error.response?.data?.message || 'Cart update failed. Please retry.',
      }));
      return false;
    } finally {
      pending.current = false;
      setIsUpdating(false);
    }
  };
  const visible = owner && state.owner === owner;
  return <CartContext.Provider value={{
    cartItems: visible ? state.items : [],
    cartCount: visible ? state.count : 0,
    cartTotal: visible ? Number(state.total) : 0,
    isLoading: authLoading || Boolean(owner && state.owner !== owner),
    error: visible ? state.error : '',
    fetchCart,
    isUpdating,
    addToCart: (product, quantity = 1) => mutate(() => api.post('/cart', { product_id: product.id, quantity })),
    updateQuantity: (id, quantity) => mutate(() => api.put(`/cart/${id}`, { quantity })),
    removeFromCart: id => mutate(() => api.delete(`/cart/${id}`)),
    clearCart: () => mutate(() => api.delete('/cart')),
  }}>{children}</CartContext.Provider>;
}
