import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '', adminCode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminMode = location.search.includes('admin');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isAdminMode) {
        // Admin kodini tekshirish
        try {
          await axios.post('/api/auth/admin-verify', { code: form.adminCode });
        } catch {
          setError("Admin kodi noto'g'ri!");
          setLoading(false);
          return;
        }
      }

      const user = await login(form.username, form.password);

      if (isAdminMode && user.role !== 'admin' && user.role !== 'direktor') {
        setError("Bu sahifaga kirish uchun admin huquqi kerak!");
        setLoading(false);
        return;
      }

      if (isAdminMode) {
        localStorage.setItem('adminVerified', 'true');
      } else {
        localStorage.removeItem('adminVerified');
      }

      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="emoji">{isAdminMode ? '🔐' : '🏫'}</div>
          <h1>10-Maktab Tizimi</h1>
          <p>{isAdminMode ? '⚙️ Admin Panel' : "O'qituvchilar Ma'lumotlar Bazasi"}</p>
        </div>

        {isAdminMode && (
          <div style={{
            background:'#fef3c7', border:'1px solid #f59e0b',
            borderRadius:8, padding:'10px 14px', marginBottom:16,
            fontSize:13, color:'#92400e', fontWeight:600
          }}>
            🔒 Siz admin panelga kiryapsiz
          </div>
        )}

        {error && <div className="alert alert-danger">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{marginBottom:16}}>
            <label className="form-label">Foydalanuvchi nomi</label>
            <input className="form-control" placeholder="admin"
              value={form.username}
              onChange={e => setForm({...form, username: e.target.value})} required />
          </div>
          <div className="form-group" style={{marginBottom: isAdminMode ? 16 : 24}}>
            <label className="form-label">Parol</label>
            <input className="form-control" type="password" placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} required />
          </div>

          {isAdminMode && (
            <div className="form-group" style={{marginBottom:24}}>
              <label className="form-label">🔑 Admin maxsus kodi</label>
              <input className="form-control" type="password" placeholder="••••••••"
                value={form.adminCode}
                onChange={e => setForm({...form, adminCode: e.target.value})} required />
            </div>
          )}

          <button className="btn btn-primary btn-lg" style={{width:'100%'}} disabled={loading}>
            {loading ? '⏳ Kirish...' : isAdminMode ? '🔐 Admin sifatida kirish' : '🔐 Tizimga kirish'}
          </button>
        </form>
      </div>
    </div>
  );
}