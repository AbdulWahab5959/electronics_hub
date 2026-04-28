// src/context/AuthContext.jsx - COMPLETE PERMANENT VERSION
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getUser } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadUser = async () => {
    setIsLoading(true);
    try {
      const response = await getUser();
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await apiLogin(credentials);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return { success: true, data: response.data };
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const response = await apiRegister(userData);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return { success: true, data: response.data };
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      return { 
        success: false, 
        error: error.response?.data?.errors || 'Registration failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiLogout();
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      return { success: false, error: 'Logout failed' };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    loadUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
export { AuthContext };
