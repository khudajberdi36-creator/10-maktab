import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import API_URL from '../config';

axios.defaults.baseURL = API_URL;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });

  const [adminVerified, setAdminVerifiedState] = useState(() => {
    return localStorage.getItem('adminVerified') === 'true';
  });

  // ✅ Har ikkisini birga yangilaydigan funksiya
  const setAdminVerified = (val) => {
    if (val) {
      localStorage.setItem('adminVerified', 'true');
    } else {
      localStorage.removeItem('adminVerified');
    }
    setAdminVerifiedState(val);
  };

  const login = async (username, password) => {
    const res = await axios.post('/api/auth/login', { username, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminVerified');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setAdminVerifiedState(false);
  };

  const token = localStorage.getItem('token');
  if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  return (
    <AuthContext.Provider value={{ user, login, logout, adminVerified, setAdminVerified }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);