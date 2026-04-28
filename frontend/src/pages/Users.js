import React, { useState, useEffect } from 'react';
import axios from 'axios';

const roleLabels = {
  admin: '🛡️ Administrator',
  direktor: '👔 Direktor',
  oquvchi: "👨‍🏫 O'qituvchi"
};

const roleColors = {
  admin: '#ef4444',
  direktor: '#3b82f6',
  oquvchi: '#10b981'
};

const emptyForm = { username: '', password: '', full_name: '', role: 'direktor' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (e) {
      setError("Foydalanuvchilarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditUser(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({ username: user.username, password: '', full_name: user.full_name, role: user.role });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    setError('');
    if (!form.full_name || !form.role || (!editUser && (!form.username || !form.password))) {
      setError("Barcha majburiy maydonlarni to'ldiring");
      return;
    }
    setSaving(true);
    try {
      if (editUser) {
        await axios.put(`/api/users/${editUser.id}`, form);
      } else {
        await axios.post('/api/users', form);
      }
      setSuccess(editUser ? "Foydalanuvchi yangilandi ✅" : "Yangi foydalanuvchi qo'shildi ✅");
      setShowModal(false);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`"${user.full_name}" ni o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await axios.delete(`/api/users/${user.id}`);
      setSuccess("Foydalanuvchi o'chirildi");
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.response?.data?.message || "O'chirishda xatolik");
    }
  };

  return (
    <div>
      {success && <div className="alert alert-success" style={{ marginBottom: 16 }}>✅ {success}</div>}
      {error && !showModal && <div className="alert alert-danger" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>👥 Foydalanuvchilar</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 14 }}>Tizim foydalanuvchilarini boshqaring</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>➕ Yangi foydalanuvchi</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>⏳ Yuklanmoqda...</div>
      ) : (
        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {['F.I.SH', 'Foydalanuvchi nomi', 'Lavozim', "Qo'shilgan sana", 'Amallar'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Amallar' ? 'right' : 'left', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-secondary)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: roleColors[user.role] + '22', color: roleColors[user.role], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15 }}>
                        {user.full_name?.[0]}
                      </div>
                      <span style={{ fontWeight: 600 }}>{user.full_name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>@{user.username}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: roleColors[user.role] + '18', color: roleColors[user.role] }}>
                      {roleLabels[user.role] || user.role}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: 13 }}>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('uz-UZ') : '—'}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button className="btn btn-secondary" style={{ marginRight: 8, padding: '6px 12px', fontSize: 13 }} onClick={() => openEdit(user)}>✏️ Tahrirlash</button>
                    <button className="btn" style={{ padding: '6px 12px', fontSize: 13, background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5' }} onClick={() => handleDelete(user)}>🗑️ O'chirish</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Foydalanuvchilar mavjud emas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700 }}>
              {editUser ? '✏️ Foydalanuvchini tahrirlash' : "➕ Yangi foydalanuvchi qo'shish"}
            </h3>
            {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>⚠️ {error}</div>}
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">To'liq ismi *</label>
              <input className="form-control" placeholder="Masalan: Kamol Toshmatov" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Foydalanuvchi nomi *</label>
              <input className="form-control" placeholder="Masalan: direktor2" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} disabled={!!editUser} style={editUser ? { background: 'var(--bg-secondary)', cursor: 'not-allowed' } : {}} />
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Parol {editUser ? "(o'zgartirish uchun kiriting)" : '*'}</label>
              <input className="form-control" type="password" placeholder={editUser ? "Bo'sh qoldiring — o'zgarmaydi" : "Parol kiriting"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Lavozim *</label>
              <select className="form-control" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="direktor">👔 Direktor</option>
                <option value="admin">🛡️ Administrator</option>
                <option value="oquvchi">👨‍🏫 O'qituvchi</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>Bekor qilish</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? '⏳ Saqlanmoqda...' : '💾 Saqlash'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}