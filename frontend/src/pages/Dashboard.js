import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import API_URL from '../config';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

function AnimatedNum({ value, color }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!value) return;
    let start = 0;
    const end = Number(value);
    const step = Math.max(1, Math.ceil(end / 30));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(start);
    }, 20);
    return () => clearInterval(timer);
  }, [value]);
  return <span style={color ? { color } : {}}>{display}</span>;
}

function Skeleton({ h = 80, mb = 12, radius = 12 }) {
  return (
    <div style={{
      height: h, borderRadius: radius, marginBottom: mb,
      background: 'linear-gradient(90deg,#f0f4f8 25%,#e2e8f0 50%,#f0f4f8 75%)',
      backgroundSize: '400% 100%',
      animation: 'shimmer 1.4s infinite'
    }} />
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'white', border: '1px solid #e2e8f0',
      borderRadius: 10, padding: '10px 14px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 13
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: '#0f1f35' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

const PIE_COLORS = ['#1e3a5f','#f0a500','#0ea571','#e53e3e','#8b5cf6','#06b6d4','#ec4899','#2d5a9e'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/dashboard/stats')
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const safeStats = {
    total: stats?.total || 0,
    active: stats?.active || 0,
    inactive: stats?.inactive || 0,
    certCount: stats?.certCount || 0,
    docCount: stats?.docCount || 0,
    bySubject: stats?.bySubject || [],
    byGender: stats?.byGender || [],
    recent: stats?.recent || [],
    birthdays: stats?.birthdays || [],
    expiringSoon: stats?.expiringSoon || [],
    monthly: stats?.monthly || [],
  };

  const subjectPieData = safeStats.bySubject.slice(0, 8).map(s => ({
    name: s.subject || 'Belgilanmagan',
    value: parseInt(s.count)
  }));

  const genderData = safeStats.byGender.map(g => ({
    name: g.gender || "Noma'lum",
    Soni: parseInt(g.count)
  }));

  const certPieData = [
    { name: 'Muddati yaqin', value: safeStats.expiringSoon.length },
    { name: 'Yaxshi holat', value: Math.max(0, safeStats.certCount - safeStats.expiringSoon.length) }
  ];

  if (loading) return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:16, marginBottom:26 }}>
        {[1,2,3,4,5].map(i => <Skeleton key={i} h={100} mb={0} />)}
      </div>
      <Skeleton h={220} mb={20} />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        <Skeleton h={260} mb={0} /><Skeleton h={260} mb={0} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <Skeleton h={220} mb={0} /><Skeleton h={220} mb={0} />
      </div>
    </div>
  );

  return (
    <div>
      {/* STAT KARTOCHKALAR */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background:'#dbeafe' }}>👨‍🏫</div>
          <div>
            <div className="stat-num"><AnimatedNum value={safeStats.total} /></div>
            <div className="stat-label">Jami xodimlar</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background:'#dcfce7' }}>✅</div>
          <div>
            <div className="stat-num"><AnimatedNum value={safeStats.active} color="var(--success)" /></div>
            <div className="stat-label">Faol xodimlar</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background:'#fee2e2' }}>❌</div>
          <div>
            <div className="stat-num"><AnimatedNum value={safeStats.inactive} color="var(--danger)" /></div>
            <div className="stat-label">Nofaol</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background:'#fef3c7' }}>🏆</div>
          <div>
            <div className="stat-num"><AnimatedNum value={safeStats.certCount} color="var(--warning)" /></div>
            <div className="stat-label">Sertifikatlar</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background:'#f3e8ff' }}>📁</div>
          <div>
            <div className="stat-num"><AnimatedNum value={safeStats.docCount} color="#7c3aed" /></div>
            <div className="stat-label">Hujjatlar</div>
          </div>
        </div>
      </div>

      {/* OYLIK GRAFIK */}
      {safeStats.monthly.length > 0 && (
        <div className="card" style={{ marginBottom:20, animation:'fadeInUp 0.4s 0.05s both' }}>
          <div className="card-header">
            <span className="card-title">📈 Oylik xodim qo'shilishi</span>
            <span style={{ fontSize:12, color:'var(--text-muted)', fontWeight:600 }}>Oxirgi 7 oy</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={safeStats.monthly} margin={{ top:10, right:10, left:-20, bottom:0 }}>
                <defs>
                  <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1e3a5f" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="oy" tick={{ fontSize:13, fontWeight:600 }} />
                <YAxis tick={{ fontSize:12 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="qoshilgan" name="Qo'shilgan"
                  stroke="#1e3a5f" strokeWidth={3} fill="url(#colorArea)"
                  dot={{ r:5, fill:'#1e3a5f', strokeWidth:2, stroke:'white' }}
                  activeDot={{ r:7, fill:'#f0a500' }} animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TUG'ILGAN KUN */}
      {safeStats.birthdays.length > 0 && (
        <div style={{
          background:'linear-gradient(135deg,#fef3c7,#fde68a)',
          border:'1px solid #f59e0b', borderRadius:14, padding:18, marginBottom:20,
          animation:'fadeInUp 0.4s both'
        }}>
          <div style={{ fontWeight:800, fontSize:15, marginBottom:12 }}>🎂 Bugun tug'ilgan kun!</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
            {safeStats.birthdays.map(t => (
              <Link key={t.id} to={`/teachers/${t.id}`} style={{
                display:'flex', alignItems:'center', gap:10,
                background:'#fff', borderRadius:10, padding:'10px 14px',
                textDecoration:'none', color:'inherit',
                border:'1px solid #fbbf24', boxShadow:'0 2px 8px #fbbf2420',
                transition:'transform 0.2s'
              }}
                onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
                <div style={{
                  width:40, height:40, borderRadius:'50%', overflow:'hidden',
                  background:'#fde68a', display:'flex', alignItems:'center',
                  justifyContent:'center', fontWeight:800, fontSize:15, flexShrink:0
                }}>
                  {t.photo
                    ? <img src={`${API_URL}/uploads/${t.photo}`} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }} />
                    : `${t.first_name?.[0] || ''}${t.last_name?.[0] || ''}`}
                </div>
                <div>
                  <div style={{ fontWeight:700 }}>{t.last_name} {t.first_name}</div>
                  <div style={{ fontSize:12, color:'#92400e' }}>{t.position}</div>
                </div>
                <span style={{ fontSize:20, marginLeft:4 }}>🎉</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* SERTIFIKAT OGOHLANTIRISH */}
      {safeStats.expiringSoon.length > 0 && (
        <div style={{
          background:'linear-gradient(135deg,#fee2e2,#fecaca)',
          border:'1px solid #f87171', borderRadius:14, padding:18, marginBottom:20,
          animation:'fadeInUp 0.4s 0.05s both'
        }}>
          <div style={{ fontWeight:800, fontSize:15, marginBottom:12 }}>
            ⚠️ Sertifikat muddati tugayapti (30 kun ichida)
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {safeStats.expiringSoon.map(c => {
              const days = Math.ceil((new Date(c.expire_date) - new Date()) / (1000*60*60*24));
              return (
                <Link key={c.id} to={`/teachers/${c.teacher_id}`} style={{
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  background:'#fff', borderRadius:8, padding:'10px 14px',
                  textDecoration:'none', color:'inherit', border:'1px solid #fca5a5',
                  transition:'transform 0.2s'
                }}
                  onMouseEnter={e => e.currentTarget.style.transform='translateX(4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform='translateX(0)'}>
                  <div>
                    <div style={{ fontWeight:700 }}>{c.name}</div>
                    <div style={{ fontSize:12, color:'#7f1d1d' }}>
                      👤 {c.last_name} {c.first_name} • {c.position}
                    </div>
                  </div>
                  <div style={{
                    background: days <= 7 ? '#dc2626' : '#f59e0b',
                    color:'#fff', borderRadius:20, padding:'4px 12px',
                    fontSize:12, fontWeight:700, flexShrink:0
                  }}>
                    {days} kun qoldi
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* GRAFIKLAR 1 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        <div className="card" style={{ animation:'fadeInUp 0.4s 0.1s both' }}>
          <div className="card-header">
            <span className="card-title">📚 Fanlar bo'yicha taqsimot</span>
          </div>
          <div className="card-body">
            {subjectPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={subjectPieData} cx="50%" cy="50%"
                    innerRadius={50} outerRadius={80}
                    paddingAngle={3} dataKey="value" animationDuration={800}>
                    {subjectPieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>
                Ma'lumot yo'q
              </div>
            )}
            <div style={{ display:'flex', flexWrap:'wrap', gap:'6px 14px', marginTop:8 }}>
              {subjectPieData.map((s, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12 }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:PIE_COLORS[i % PIE_COLORS.length], flexShrink:0 }} />
                  <span style={{ color:'var(--text-muted)', fontWeight:600 }}>{s.name}</span>
                  <span style={{ fontWeight:800, color:'var(--primary)' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ animation:'fadeInUp 0.4s 0.15s both' }}>
          <div className="card-header">
            <span className="card-title">👥 Jinsi bo'yicha</span>
          </div>
          <div className="card-body">
            {genderData.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={genderData} barSize={60}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize:13, fontWeight:600 }} />
                  <YAxis tick={{ fontSize:12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Soni" radius={[8,8,0,0]} animationDuration={800}>
                    {genderData.map((g, i) => (
                      <Cell key={i} fill={g.name === 'Erkak' ? '#3b82f6' : '#ec4899'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>Ma'lumot yo'q</div>
            )}
            <div style={{ display:'flex', gap:16, justifyContent:'center', marginTop:12 }}>
              {safeStats.byGender.map((g, i) => (
                <div key={i} style={{
                  textAlign:'center', padding:'12px 24px',
                  background: g.gender === 'Erkak' ? '#dbeafe' : '#fce7f3',
                  borderRadius:12
                }}>
                  <div style={{ fontSize:30 }}>{g.gender === 'Erkak' ? '👨' : '👩'}</div>
                  <div style={{ fontSize:22, fontWeight:800, marginTop:4 }}>{g.count}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', fontWeight:600 }}>{g.gender || "Noma'lum"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* GRAFIKLAR 2 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        <div className="card" style={{ animation:'fadeInUp 0.4s 0.2s both' }}>
          <div className="card-header">
            <span className="card-title">📊 Faollik holati</span>
          </div>
          <div className="card-body">
            <div style={{ display:'flex', gap:16, justifyContent:'center', marginBottom:16 }}>
              <div style={{ textAlign:'center', padding:'16px 28px', background:'#dcfce7', borderRadius:12 }}>
                <div style={{ fontSize:28 }}>✅</div>
                <div style={{ fontSize:26, fontWeight:800, color:'#0ea571' }}>{safeStats.active}</div>
                <div style={{ fontSize:12, color:'#065f46', fontWeight:600 }}>Faol</div>
              </div>
              <div style={{ textAlign:'center', padding:'16px 28px', background:'#fee2e2', borderRadius:12 }}>
                <div style={{ fontSize:28 }}>❌</div>
                <div style={{ fontSize:26, fontWeight:800, color:'#e53e3e' }}>{safeStats.inactive}</div>
                <div style={{ fontSize:12, color:'#7f1d1d', fontWeight:600 }}>Nofaol</div>
              </div>
            </div>
            <div style={{ marginTop:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:13, fontWeight:600 }}>
                <span style={{ color:'#0ea571' }}>Faol: {safeStats.active} ta</span>
                <span style={{ color:'#e53e3e' }}>Nofaol: {safeStats.inactive} ta</span>
              </div>
              <div style={{ background:'#f1f5f9', borderRadius:8, height:12, overflow:'hidden' }}>
                <div style={{
                  background:'linear-gradient(90deg,#0ea571,#22c55e)',
                  height:'100%', borderRadius:8,
                  width:`${safeStats.total > 0 ? Math.round((safeStats.active/safeStats.total)*100) : 0}%`,
                  transition:'width 1.2s cubic-bezier(0.22,1,0.36,1)'
                }} />
              </div>
              <div style={{ textAlign:'center', marginTop:8, fontSize:13, color:'var(--text-muted)', fontWeight:700 }}>
                {safeStats.total > 0 ? Math.round((safeStats.active/safeStats.total)*100) : 0}% faol xodimlar
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ animation:'fadeInUp 0.4s 0.25s both' }}>
          <div className="card-header">
            <span className="card-title">🏆 Sertifikat holati</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={certPieData} cx="50%" cy="50%"
                  innerRadius={45} outerRadius={70}
                  paddingAngle={4} dataKey="value" animationDuration={800}>
                  <Cell fill="#f59e0b" />
                  <Cell fill="#0ea571" />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display:'flex', gap:16, justifyContent:'center', marginTop:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13 }}>
                <div style={{ width:12, height:12, borderRadius:'50%', background:'#f59e0b' }} />
                <span style={{ fontWeight:600, color:'var(--text-muted)' }}>Muddati yaqin</span>
                <span style={{ fontWeight:800 }}>{safeStats.expiringSoon.length}</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13 }}>
                <div style={{ width:12, height:12, borderRadius:'50%', background:'#0ea571' }} />
                <span style={{ fontWeight:600, color:'var(--text-muted)' }}>Yaxshi holat</span>
                <span style={{ fontWeight:800 }}>{Math.max(0, safeStats.certCount - safeStats.expiringSoon.length)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QATOR 3 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        <div className="card" style={{ animation:'fadeInUp 0.4s 0.3s both' }}>
          <div className="card-header">
            <span className="card-title">🕐 Oxirgi qo'shilganlar</span>
            <Link to="/teachers" className="btn btn-outline btn-sm">Barchasi</Link>
          </div>
          <div className="card-body" style={{ padding:0 }}>
            {safeStats.recent.length === 0 ? (
              <div style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>
                Ma'lumot yo'q
              </div>
            ) : (
              safeStats.recent.map((t, i) => (
                <Link key={t.id} to={`/teachers/${t.id}`} style={{
                  display:'flex', alignItems:'center', gap:12,
                  padding:'13px 20px', borderBottom:'1px solid #f1f5f9',
                  textDecoration:'none', color:'inherit',
                  animation:`fadeInUp 0.3s ${i*0.06}s both`,
                  transition:'background 0.15s, transform 0.15s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.background='#f8fafc'; e.currentTarget.style.transform='translateX(4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.transform='translateX(0)'; }}>
                  <div style={{
                    width:38, height:38, borderRadius:'50%', overflow:'hidden',
                    background:'var(--primary)', display:'flex', alignItems:'center',
                    justifyContent:'center', color:'#fff', fontWeight:800, fontSize:13, flexShrink:0
                  }}>
                    {t.photo
                      ? <img src={`${API_URL}/uploads/${t.photo}`} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }} />
                      : `${t.first_name?.[0] || ''}${t.last_name?.[0] || ''}`}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14 }}>{t.last_name} {t.first_name}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)' }}>{t.position}</div>
                  </div>
                  <div style={{ fontSize:11, color:'var(--text-light)' }}>
                    {t.created_at ? new Date(t.created_at).toLocaleDateString('uz-UZ') : ''}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="card" style={{ animation:'fadeInUp 0.4s 0.35s both' }}>
          <div className="card-header">
            <span className="card-title">📚 Fanlar bo'yicha</span>
          </div>
          <div className="card-body">
            {safeStats.bySubject.length === 0 ? (
              <div style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>
                Ma'lumot yo'q
              </div>
            ) : (
              safeStats.bySubject.map((s, i) => {
                const pct = safeStats.total > 0 ? Math.round((s.count/safeStats.total)*100) : 0;
                const color = PIE_COLORS[i % PIE_COLORS.length];
                return (
                  <div key={i} style={{ marginBottom:14, animation:`fadeInUp 0.3s ${i*0.05}s both` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                      <span style={{ fontSize:13, fontWeight:600 }}>{s.subject || 'Belgilanmagan'}</span>
                      <span style={{ fontSize:13, fontWeight:800, color }}>{s.count} ta</span>
                    </div>
                    <div style={{ background:'#f1f5f9', borderRadius:6, height:8, overflow:'hidden' }}>
                      <div style={{
                        background: color, borderRadius:6, height:'100%', width:`${pct}%`,
                        transition:'width 1s cubic-bezier(0.22,1,0.36,1)'
                      }} />
                    </div>
                    <div style={{ fontSize:11, color:'var(--text-light)', marginTop:2 }}>{pct}%</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* TEZKOR AMALLAR */}
      <div className="card" style={{ animation:'fadeInUp 0.4s 0.4s both' }}>
        <div className="card-header"><span className="card-title">⚡ Tezkor amallar</span></div>
        <div className="card-body">
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <Link to="/teachers/new" className="btn btn-primary">➕ Yangi xodim qo'shish</Link>
            <Link to="/import" className="btn btn-accent">📥 Excel dan import qilish</Link>
            <Link to="/teachers" className="btn btn-outline">📋 Barcha ro'yxatni ko'rish</Link>
            <Link to="/certificates" className="btn btn-outline">🏆 Sertifikatlarni ko'rish</Link>
          </div>
        </div>
      </div>
    </div>
  );
}