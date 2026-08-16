import React, { createContext, useContext, useState } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Start fresh as Guest on cold website launch; only maintain active tab session if explicitly signed in
  const [user, setUser] = useState(() => {
    try {
      const sessionUser = sessionStorage.getItem('user');
      return sessionUser ? JSON.parse(sessionUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', { email, password });
      const authenticatedUser = data.data.user;
      setUser(authenticatedUser);
      sessionStorage.setItem('user', JSON.stringify(authenticatedUser));
      sessionStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('accessToken', data.data.accessToken);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (registrationData) => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', registrationData);
      const registeredUser = data.data.user;
      setUser(registeredUser);
      sessionStorage.setItem('user', JSON.stringify(registeredUser));
      sessionStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('accessToken', data.data.accessToken);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updatedUserData) => {
    setUser((prev) => {
      const merged = { ...(prev || {}), ...updatedUserData };
      sessionStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      sessionStorage.clear();
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('myRecentOrders');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
