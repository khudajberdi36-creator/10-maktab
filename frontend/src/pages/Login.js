import API_URL from '../config';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.username, form.password);
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
          <div className="emoji">🏫</div>
          <h1>10-Maktab Tizimi</h1>
          <p>O'qituvchilar Ma'lumotlar Bazasi</p>
        </div>

        {error && <div className="alert alert-danger">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{marginBottom:16}}>
            <label className="form-label">Foydalanuvchi nomi</label>
            <input className="form-control" placeholder="admin" value={form.username}
              onChange={e => setForm({...form, username: e.target.value})} required />
          </div>
          <div className="form-group" style={{marginBottom:24}}>
            <label className="form-label">Parol</label>
            <input className="form-control" type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <button className="btn btn-primary btn-lg" style={{width:'100%'}} disabled={loading}>
            {loading ? '⏳ Kirish...' : '🔐 Tizimga kirish'}
          </button>
        </form>

        <div style={{marginTop:24, padding:16, background:'#f8fafc', borderRadius:8, fontSize:12, color:'var(--text-muted)'}}>
          <strong>Demo hisoblar:</strong><br/>
          
        </div>
      </div>
    </div>
  );
}
