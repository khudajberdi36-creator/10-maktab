import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '', adminCode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, adminVerified, verifyAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminMode = location.search.includes('admin');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Admin rejimida — admin kodni tekshir (faqat bir marta)
      if (isAdminMode && !adminVerified) {
        try {
          await axios.post('/api/auth/admin-verify', { code: form.adminCode });
          verifyAdmin(); // LocalStorage ga yozadi, qayta so'ramaydi
        } catch {
          setError("Admin kodi noto'g'ri!");
          setLoading(false);
          return;
        }
      }

      // 2. Login qilish
      const userData = await login(form.username, form.password);

      // 3. Admin rejimida rol tekshiruvi
      if (isAdminMode && userData.role !== 'admin' && userData.role !== 'direktor') {
        setError("Bu sahifaga kirish uchun admin huquqi kerak!");
        setLoading(false);
        return;
      }

      // 4. Muvaffaqiyatli — bosh sahifaga o'tish
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
          <div className="emoji" style={{fontSize:48, marginBottom:8}}>
            {isAdminMode ? '🔐' : '🏫'}
          </div>
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
              onChange={e => setForm({...form, username: e.target.value})}
              required />
          </div>

          <div className="form-group" style={{marginBottom: isAdminMode && !adminVerified ? 16 : 24}}>
            <label className="form-label">Parol</label>
            <input className="form-control" type="password" placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              required />
          </div>

          {/* Admin kodi — faqat admin rejimida VA hali tasdiqlanmagan bo'lsa */}
          {isAdminMode && !adminVerified && (
            <div className="form-group" style={{marginBottom:24}}>
              <label className="form-label">🔑 Admin maxsus kodi</label>
              <input className="form-control" type="password" placeholder="••••••••"
                value={form.adminCode}
                onChange={e => setForm({...form, adminCode: e.target.value})}
                required />
            </div>
          )}

          <button
            className="btn btn-primary btn-lg"
            style={{
              width:'100%',
              opacity: loading ? 0.75 : 1,
              transition:'all 0.2s'
            }}
            disabled={loading}>
            {loading
              ? <span style={{display:'flex', alignItems:'center', justifyContent:'center', gap:8}}>
                  <span style={{
                    width:16, height:16,
                    border:'2px solid rgba(255,255,255,0.4)',
                    borderTopColor:'#fff',
                    borderRadius:'50%',
                    display:'inline-block',
                    animation:'spin 0.7s linear infinite'
                  }}/>
                  Kirish...
                </span>
              : isAdminMode ? '🔐 Admin sifatida kirish' : '🔐 Tizimga kirish'
            }
          </button>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}