import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';

axios.defaults.baseURL = API_URL;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  });

  const [adminVerified, setAdminVerified] = useState(() => {
    return localStorage.getItem('adminVerified') === 'true';
  });

  // Sahifa ochilganda token o'rnatilsin — bir marta
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const login = async (username, password) => {
    const res = await axios.post('/api/auth/login', { username, password });
    const { token, user: userData } = res.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      // Backend ga logout xabari yuborish (log uchun)
      await axios.post('/api/auth/logout');
    } catch (e) {
      // Xatolik bo'lsa ham chiqishni davom ettiramiz
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminVerified');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setAdminVerified(false);
  };

  const verifyAdmin = () => {
    localStorage.setItem('adminVerified', 'true');
    setAdminVerified(true);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, adminVerified, verifyAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);