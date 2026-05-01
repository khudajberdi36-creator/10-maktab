import React, { useState, useEffect } from 'react';
import axios from 'axios';

const roleLabels = {
  admin: '🛡️ Administrator',
  direktor: '👔 Direktor',
  oquvchi: "👨‍🏫 O'qituvchi"
};

const PRESET_COLORS = [
  '#3b82f6','#8b5cf6','#ec4899','#ef4444',
  '#f97316','#eab308','#10b981','#06b6d4',
  '#1e3a5f','#6366f1','#14b8a6','#84cc16'
];

const emptyForm = { username:'', password:'', full_name:'', role:'direktor', color:'#3b82f6' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loginStats, setLoginStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchUsers(); fetchLoginStats(); }, []);

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

  const fetchLoginStats = async () => {
    try {
      const res = await axios.get('/api/dashboard/login-stats');
      setLoginStats(res.data);
    } catch (e) {
      console.log('Login stats yuklanmadi');
    }
  };

  const openAdd = () => { setEditUser(null); setForm(emptyForm); setError(''); setShowModal(true); };
  const openEdit = (user) => {
    setEditUser(user);
    setForm({ username: user.username, password: '', full_name: user.full_name, role: user.role, color: user.color || '#3b82f6' });
    setError(''); setShowModal(true);
  };

  const handleSave = async () => {
    setError('');
    if (!form.full_name || !form.role || (!editUser && (!form.username || !form.password))) {
      setError("Barcha majburiy maydonlarni to'ldiring"); return;
    }
    setSaving(true);
    try {
      if (editUser) await axios.put(`/api/users/${editUser.id}`, form);
      else await axios.post('/api/users', form);
      setSuccess(editUser ? "Foydalanuvchi yangilandi ✅" : "Yangi foydalanuvchi qo'shildi ✅");
      setShowModal(false); fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.response?.data?.message || "Xatolik yuz berdi");
    } finally { setSaving(false); }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`"${user.full_name}" ni o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await axios.delete(`/api/users/${user.id}`);
      setSuccess("Foydalanuvchi o'chirildi"); fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError(e.response?.data?.message || "O'chirishda xatolik"); }
  };

  return (
    <div>
      {success && <div className="alert alert-success">{success}</div>}
      {error && !showModal && <div className="alert alert-danger">⚠️ {error}</div>}

      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <div>
          <h2 style={{margin:0, fontSize:20, fontWeight:800, letterSpacing:'-0.3px'}}>👥 Foydalanuvchilar</h2>
          <p style={{margin:'4px 0 0', color:'var(--text-muted)', fontSize:13.5}}>Tizim foydalanuvchilarini boshqaring</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>➕ Yangi foydalanuvchi</button>
      </div>

      {/* TABS */}
      <div className="tabs">
        <button className={`tab-btn ${activeTab==='users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          👥 Foydalanuvchilar ({users.length})
        </button>
        <button className={`tab-btn ${activeTab==='stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
          📊 Kirish statistikasi
          {loginStats?.today > 0 && (
            <span style={{marginLeft:8, background:'var(--primary)', color:'white', borderRadius:20, padding:'1px 8px', fontSize:11, fontWeight:700}}>
              {loginStats.today}
            </span>
          )}
        </button>
      </div>

      {/* USERS TAB */}
      {activeTab === 'users' && (
        loading ? (
          <div style={{textAlign:'center', padding:60, color:'var(--text-muted)'}}>⏳ Yuklanmoqda...</div>
        ) : (
          <div className="card">
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead>
                <tr style={{borderBottom:'2px solid var(--border-light)'}}>
                  {['F.I.SH','Foydalanuvchi nomi','Lavozim','Rang',"Qo'shilgan sana",'Amallar'].map(h => (
                    <th key={h} style={{padding:'12px 18px', textAlign:h==='Amallar'?'right':'left', fontSize:11, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.6px', background:'#f6f9fc'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const color = user.color || '#3b82f6';
                  return (
                    <tr key={user.id} style={{borderBottom:'1px solid var(--border-light)', transition:'background 0.15s'}}
                      onMouseEnter={e=>e.currentTarget.style.background='#f8fbff'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{padding:'14px 18px'}}>
                        <div style={{display:'flex', alignItems:'center', gap:12}}>
                          <div style={{width:38, height:38, borderRadius:'50%', background:color+'22', border:`2px solid ${color}44`, color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:16, boxShadow:`0 2px 8px ${color}30`, flexShrink:0}}>
                            {user.full_name?.[0]?.toUpperCase()}
                          </div>
                          <span style={{fontWeight:700, fontSize:14}}>{user.full_name}</span>
                        </div>
                      </td>
                      <td style={{padding:'14px 18px', color:'var(--text-muted)', fontFamily:'monospace', fontSize:13}}>@{user.username}</td>
                      <td style={{padding:'14px 18px'}}>
                        <span style={{padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:700, background:color+'18', color, border:`1px solid ${color}30`}}>
                          {roleLabels[user.role] || user.role}
                        </span>
                      </td>
                      <td style={{padding:'14px 18px'}}>
                        <div style={{display:'flex', alignItems:'center', gap:8}}>
                          <div style={{width:22, height:22, borderRadius:'50%', background:color, boxShadow:`0 2px 8px ${color}60`, border:'2px solid white', outline:`2px solid ${color}40`}}/>
                          <span style={{fontSize:12, color:'var(--text-muted)', fontFamily:'monospace'}}>{color}</span>
                        </div>
                      </td>
                      <td style={{padding:'14px 18px', color:'var(--text-muted)', fontSize:13}}>
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('uz-UZ') : '—'}
                      </td>
                      <td style={{padding:'14px 18px', textAlign:'right'}}>
                        <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(user)}>✏️ Tahrirlash</button>
                          <button className="btn btn-sm" style={{background:'#fee2e2', color:'#ef4444', border:'1px solid #fca5a5'}} onClick={() => handleDelete(user)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr><td colSpan={6} style={{padding:40, textAlign:'center', color:'var(--text-muted)'}}>Foydalanuvchilar mavjud emas</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* STATISTIKA TAB */}
      {activeTab === 'stats' && (
        <div>
          {/* Stat kartochkalar */}
          {loginStats && (
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px,1fr))', gap:16, marginBottom:24}}>
              {[
                { label:"Bugun kirganlar", value: loginStats.today, icon:'📅', color:'#3b82f6', bg:'#dbeafe' },
                { label:"Jami kirishlar", value: loginStats.total, icon:'🔑', color:'#10b981', bg:'#d1fae5' },
                { label:"Muvaffaqiyatsiz", value: loginStats.failed, icon:'❌', color:'#ef4444', bg:'#fee2e2' },
              ].map((s,i) => (
                <div key={i} style={{background:'white', borderRadius:14, padding:'20px', border:'1px solid var(--border-light)', boxShadow:'var(--shadow-sm)', display:'flex', alignItems:'center', gap:16}}>
                  <div style={{width:50, height:50, borderRadius:12, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0}}>
                    {s.icon}
                  </div>
                  <div>
                    <div style={{fontSize:28, fontWeight:800, color:s.color, lineHeight:1}}>{s.value}</div>
                    <div style={{fontSize:12, color:'var(--text-muted)', marginTop:3, fontWeight:600}}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Kirish loglari */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">🕐 So'nggi kirishlar</span>
              <button className="btn btn-outline btn-sm" onClick={fetchLoginStats}>🔄 Yangilash</button>
            </div>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead>
                  <tr>
                    {['Foydalanuvchi','To\'liq ism','Lavozim','Holat','IP manzil','Vaqt'].map(h => (
                      <th key={h} style={{padding:'11px 18px', textAlign:'left', fontSize:11, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.6px', background:'#f6f9fc', borderBottom:'2px solid var(--border-light)'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loginStats?.recent?.map((log, i) => (
                    <tr key={i} style={{borderBottom:'1px solid var(--border-light)', transition:'background 0.15s'}}
                      onMouseEnter={e=>e.currentTarget.style.background='#f8fbff'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{padding:'12px 18px', fontFamily:'monospace', fontSize:13, fontWeight:600}}>@{log.username}</td>
                      <td style={{padding:'12px 18px', fontSize:13, fontWeight:600}}>{log.full_name || '—'}</td>
                      <td style={{padding:'12px 18px'}}>
                        <span style={{fontSize:12, color:'var(--text-muted)', fontWeight:600}}>
                          {roleLabels[log.role] || log.role || '—'}
                        </span>
                      </td>
                      <td style={{padding:'12px 18px'}}>
                        <span style={{
                          padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700,
                          background: log.status==='success' ? '#d1fae5' : '#fee2e2',
                          color: log.status==='success' ? '#065f46' : '#991b1b'
                        }}>
                          {log.status==='success' ? '✅ Muvaffaqiyatli' : '❌ Rad etildi'}
                        </span>
                      </td>
                      <td style={{padding:'12px 18px', fontFamily:'monospace', fontSize:12, color:'var(--text-muted)'}}>{log.ip}</td>
                      <td style={{padding:'12px 18px', fontSize:12, color:'var(--text-muted)'}}>
                        {new Date(log.created_at).toLocaleString('uz-UZ')}
                      </td>
                    </tr>
                  ))}
                  {(!loginStats?.recent || loginStats.recent.length === 0) && (
                    <tr><td colSpan={6} style={{padding:40, textAlign:'center', color:'var(--text-muted)'}}>Ma'lumot yo'q</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div style={{position:'fixed', inset:0, background:'rgba(10,22,40,0.55)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20}}>
          <div style={{background:'white', borderRadius:20, padding:36, width:'100%', maxWidth:500, boxShadow:'0 32px 80px rgba(0,0,0,0.25)', animation:'scaleIn 0.3s ease', maxHeight:'90vh', overflowY:'auto'}}>
            <h3 style={{margin:'0 0 24px', fontSize:18, fontWeight:800}}>
              {editUser ? '✏️ Foydalanuvchini tahrirlash' : "➕ Yangi foydalanuvchi qo'shish"}
            </h3>
            {error && <div className="alert alert-danger">⚠️ {error}</div>}

            <div className="form-group" style={{marginBottom:16}}>
              <label className="form-label">To'liq ismi *</label>
              <input className="form-control" placeholder="Masalan: Kamol Toshmatov"
                value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
            </div>
            <div className="form-group" style={{marginBottom:16}}>
              <label className="form-label">Foydalanuvchi nomi *</label>
              <input className="form-control" placeholder="Masalan: direktor2"
                value={form.username} onChange={e => setForm({...form, username: e.target.value})}
                disabled={!!editUser} style={editUser ? {background:'#f6f9fc', cursor:'not-allowed', opacity:0.7} : {}} />
            </div>
            <div className="form-group" style={{marginBottom:16}}>
              <label className="form-label">Parol {editUser ? "(o'zgartirish uchun kiriting)" : '*'}</label>
              <input className="form-control" type="password"
                placeholder={editUser ? "Bo'sh qoldiring — o'zgarmaydi" : "Parol kiriting"}
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <div className="form-group" style={{marginBottom:16}}>
              <label className="form-label">Lavozim *</label>
              <select className="form-control" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="direktor">👔 Direktor</option>
                <option value="admin">🛡️ Administrator</option>
                <option value="oquvchi">👨‍🏫 O'qituvchi</option>
              </select>
            </div>

            <div className="form-group" style={{marginBottom:28}}>
              <label className="form-label">🎨 Profil rangi</label>
              <div style={{marginTop:10}}>
                <div style={{display:'flex', flexWrap:'wrap', gap:10, marginBottom:14}}>
                  {PRESET_COLORS.map(color => (
                    <button key={color} onClick={() => setForm({...form, color})}
                      style={{width:32, height:32, borderRadius:'50%', background:color, border: form.color===color ? '3px solid #0f1f35' : '2px solid white', outline: form.color===color ? `3px solid ${color}` : 'none', outlineOffset:'2px', cursor:'pointer', boxShadow:`0 2px 8px ${color}50`, transition:'all 0.2s', transform: form.color===color ? 'scale(1.15)' : 'scale(1)'}}/>
                  ))}
                </div>
                <div style={{display:'flex', alignItems:'center', gap:12}}>
                  <input type="color" value={form.color} onChange={e => setForm({...form, color: e.target.value})}
                    style={{width:44, height:44, border:'none', borderRadius:10, cursor:'pointer', padding:2}}/>
                  <div style={{flex:1, background:form.color+'15', border:`1px solid ${form.color}40`, borderRadius:8, padding:'8px 12px', display:'flex', alignItems:'center', gap:10}}>
                    <div style={{width:20, height:20, borderRadius:'50%', background:form.color}}/>
                    <span style={{fontFamily:'monospace', fontSize:13, fontWeight:600, color:form.color}}>{form.color}</span>
                  </div>
                </div>
                <div style={{marginTop:14, padding:'12px 16px', background:'#f6f9fc', borderRadius:10, display:'flex', alignItems:'center', gap:12, border:'1px solid var(--border-light)'}}>
                  <div style={{width:40, height:40, borderRadius:'50%', background:form.color+'22', border:`2px solid ${form.color}44`, color:form.color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:17, boxShadow:`0 2px 10px ${form.color}30`}}>
                    {form.full_name?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div>
                    <div style={{fontWeight:700, fontSize:14}}>{form.full_name || 'Ism Familiya'}</div>
                    <span style={{padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:form.color+'18', color:form.color}}>
                      {roleLabels[form.role]}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{display:'flex', gap:12, justifyContent:'flex-end'}}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)} disabled={saving}>Bekor qilish</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '⏳ Saqlanmoqda...' : '💾 Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}