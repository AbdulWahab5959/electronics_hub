/* eslint-disable react-refresh/only-export-components -- context is shared with useAuth */
import { createContext, useState, useEffect, useRef } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getUser } from '../services/auth';

export const AuthContext = createContext();

const errorMessage = (error, fallback) =>
  Object.values(error.response?.data?.errors || {}).flat()[0] || error.response?.data?.message || fallback;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const revision = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    const version = revision.current;
    getUser({ signal: controller.signal })
      .then(response => {
        if (!controller.signal.aborted && version === revision.current) setUser(response.data.user);
      })
      .catch(() => {
        if (!controller.signal.aborted && version === revision.current) setUser(null);
      })
      .finally(() => {
        if (!controller.signal.aborted && version === revision.current) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  const loadUser = async () => {
    revision.current += 1;
    try {
      const response = await getUser();
      setUser(response.data.user);
      return response.data.user;
    } catch {
      setUser(null);
      return null;
    } finally { setIsLoading(false); }
  };

  const login = async credentials => {
    revision.current += 1;
    setIsLoading(true);
    try {
      const response = await apiLogin(credentials);
      setUser(response.data.user);
      return { success: true, data: response.data };
    } catch (error) {
      setUser(null);
      return {
        success: false,
        requires_verification: Boolean(error.response?.data?.requires_verification),
        error: errorMessage(error, 'Login failed. Please try again.'),
      };
    } finally { setIsLoading(false); }
  };

  const register = async values => {
    revision.current += 1;
    setIsLoading(true);
    try {
      const response = await apiRegister(values);
      setUser(null); // The server created a limited verification session, not a customer login.
      return { success: true, data: response.data, requires_verification: true };
    } catch (error) {
      setUser(null);
      return { success: false, error: errorMessage(error, 'Registration failed. Please try again.') };
    } finally { setIsLoading(false); }
  };

  const logout = async () => {
    revision.current += 1;
    setIsLoading(true);
    try {
      await apiLogout();
      setUser(null);
      return { success: true };
    } catch (error) {
      if (error.response?.status === 401) {
        setUser(null);
        return { success: true };
      }
      return { success: false, error: 'Logout could not be confirmed. Please retry.' };
    } finally { setIsLoading(false); }
  };

  return <AuthContext.Provider value={{
    user, isLoading, isAuthenticated: Boolean(user?.email_verified_at),
    login, register, logout, loadUser,
  }}>{children}</AuthContext.Provider>;
}
