import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Teachers from './pages/Teachers';
import TeacherForm from './pages/TeacherForm';
import TeacherDetail from './pages/TeacherDetail';
import Certificates from './pages/Certificates';
import Documents from './pages/Documents';
import Import from './pages/Import';
import Users from './pages/Users';
import Layout from './components/Layout';
import './App.css';

const Protected = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const AdminOnly = ({ children }) => {
  const { user, adminVerified } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!adminVerified) return <Navigate to="/login?admin" />;
  if (user.role !== 'admin' && user.role !== 'direktor') return <Navigate to="/" />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Protected><Layout /></Protected>}>
            <Route index element={<Dashboard />} />
            <Route path="teachers" element={<Teachers />} />
            <Route path="teachers/new" element={<AdminOnly><TeacherForm /></AdminOnly>} />
            <Route path="teachers/:id" element={<TeacherDetail />} />
            <Route path="teachers/:id/edit" element={<AdminOnly><TeacherForm /></AdminOnly>} />
            <Route path="certificates" element={<Certificates />} />
            <Route path="documents" element={<Documents />} />
            <Route path="import" element={<AdminOnly><Import /></AdminOnly>} />
            <Route path="users" element={<AdminOnly><Users /></AdminOnly>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}