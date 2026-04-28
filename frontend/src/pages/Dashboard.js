import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import API_URL from '../config';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get('/api/dashboard/stats').then(r => setStats(r.data));
  }, []);

  if (!stats) return <div style={{textAlign:'center',padding:60}}>⏳ Yuklanmoqda...</div>;

  return (
    <div>
      {/* STAT KARTOCHKALAR */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{background:'#dbeafe'}}>👨‍🏫</div>
          <div>
            <div className="stat-num">{stats.total}</div>
            <div className="stat-label">Jami xodimlar</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:'#dcfce7'}}>✅</div>
          <div>
            <div className="stat-num" style={{color:'var(--success)'}}>{stats.active}</div>
            <div className="stat-label">Faol xodimlar</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:'#fee2e2'}}>❌</div>
          <div>
            <div className="stat-num" style={{color:'var(--danger)'}}>{stats.inactive}</div>
            <div className="stat-label">Nofaol</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:'#fef3c7'}}>🏆</div>
          <div>
            <div className="stat-num" style={{color:'var(--warning)'}}>{stats.certCount}</div>
            <div className="stat-label">Sertifikatlar</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background:'#f3e8ff'}}>📁</div>
          <div>
            <div className="stat-num" style={{color:'#7c3aed'}}>{stats.docCount}</div>
            <div className="stat-label">Hujjatlar</div>
          </div>
        </div>
      </div>

      {/* TUG'ILGAN KUN ESLATMASI */}
      {stats.birthdays?.length > 0 && (
        <div style={{
          background:'linear-gradient(135deg,#fef3c7,#fde68a)',
          border:'1px solid #f59e0b', borderRadius:12, padding:16, marginBottom:20
        }}>
          <div style={{fontWeight:800, fontSize:15, marginBottom:12}}>
            🎂 Bugun tug'ilgan kun!
          </div>
          <div style={{display:'flex', flexWrap:'wrap', gap:10}}>
            {stats.birthdays.map(t => (
              <Link key={t.id} to={`/teachers/${t.id}`} style={{
                display:'flex', alignItems:'center', gap:10,
                background:'#fff', borderRadius:10, padding:'10px 14px',
                textDecoration:'none', color:'inherit',
                border:'1px solid #fbbf24', boxShadow:'0 2px 8px #fbbf2420'
              }}>
                <div style={{
                  width:40, height:40, borderRadius:'50%', overflow:'hidden',
                  background:'#fde68a', display:'flex', alignItems:'center',
                  justifyContent:'center', fontWeight:800, fontSize:15, flexShrink:0
                }}>
                  {t.photo
                    ? <img src={`${API_URL}/uploads/${t.photo}`} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    : `${t.first_name?.[0]}${t.last_name?.[0]}`
                  }
                </div>
                <div>
                  <div style={{fontWeight:700}}>{t.last_name} {t.first_name}</div>
                  <div style={{fontSize:12, color:'#92400e'}}>{t.position}</div>
                </div>
                <span style={{fontSize:20, marginLeft:4}}>🎉</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* SERTIFIKAT MUDDATI TUGAYAPTI */}
      {stats.expiringSoon?.length > 0 && (
        <div style={{
          background:'linear-gradient(135deg,#fee2e2,#fecaca)',
          border:'1px solid #f87171', borderRadius:12, padding:16, marginBottom:20
        }}>
          <div style={{fontWeight:800, fontSize:15, marginBottom:12}}>
            ⚠️ Sertifikat muddati tugayapti (30 kun ichida)
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {stats.expiringSoon.map(c => {
              const days = Math.ceil((new Date(c.expire_date) - new Date()) / (1000*60*60*24));
              return (
                <Link key={c.id} to={`/teachers/${c.teacher_id}`} style={{
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  background:'#fff', borderRadius:8, padding:'10px 14px',
                  textDecoration:'none', color:'inherit', border:'1px solid #fca5a5'
                }}>
                  <div>
                    <div style={{fontWeight:700}}>{c.name}</div>
                    <div style={{fontSize:12, color:'#7f1d1d'}}>
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

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
        {/* Oxirgi qo'shilganlar */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🕐 Oxirgi qo'shilganlar</span>
            <Link to="/teachers" className="btn btn-outline btn-sm">Barchasi</Link>
          </div>
          <div className="card-body" style={{padding:0}}>
            {stats.recent.map(t => (
              <Link key={t.id} to={`/teachers/${t.id}`} style={{
                display:'flex', alignItems:'center', gap:12,
                padding:'14px 20px', borderBottom:'1px solid #f1f5f9',
                textDecoration:'none', color:'inherit', transition:'background 0.15s'
              }}
              onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{
                  width:38, height:38, borderRadius:'50%', overflow:'hidden',
                  background:'var(--primary)', display:'flex', alignItems:'center',
                  justifyContent:'center', color:'#fff', fontWeight:800, fontSize:13, flexShrink:0
                }}>
                  {t.photo
                    ? <img src={`${API_URL}/uploads/${t.photo}`} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                    : `${t.first_name?.[0]}${t.last_name?.[0]}`
                  }
                </div>
                <div>
                  <div style={{fontWeight:700, fontSize:14}}>{t.last_name} {t.first_name}</div>
                  <div style={{fontSize:12, color:'var(--text-muted)'}}>{t.position}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Fanlar bo'yicha */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📚 Fanlar bo'yicha</span>
          </div>
          <div className="card-body">
            {stats.bySubject.map((s, i) => (
              <div key={i} style={{marginBottom:12}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:4}}>
                  <span style={{fontSize:13, fontWeight:600}}>{s.subject || 'Belgilanmagan'}</span>
                  <span style={{fontSize:13, fontWeight:800, color:'var(--primary)'}}>{s.count}</span>
                </div>
                <div style={{background:'#f1f5f9', borderRadius:4, height:6}}>
                  <div style={{
                    background:'var(--primary)', borderRadius:4, height:6,
                    width:`${Math.round((s.count / stats.total) * 100)}%`
                  }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Jinsi bo'yicha */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">👥 Jinsi bo'yicha</span>
          </div>
          <div className="card-body">
            <div style={{display:'flex', gap:20}}>
              {stats.byGender.map((g, i) => (
                <div key={i} style={{
                  flex:1, textAlign:'center', padding:'20px',
                  background: g.gender==='Erkak' ? '#dbeafe' : '#fce7f3',
                  borderRadius:12
                }}>
                  <div style={{fontSize:40}}>{g.gender==='Erkak' ? '👨' : '👩'}</div>
                  <div style={{fontSize:28, fontWeight:800, marginTop:8}}>{g.count}</div>
                  <div style={{fontSize:13, color:'var(--text-muted)', fontWeight:600}}>{g.gender || 'Noma\'lum'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tezkor amallar */}
        <div className="card">
          <div className="card-header"><span className="card-title">⚡ Tezkor amallar</span></div>
          <div className="card-body">
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              <Link to="/teachers/new" className="btn btn-primary">➕ Yangi xodim qo'shish</Link>
              <Link to="/import" className="btn btn-accent">📥 Excel dan import qilish</Link>
              <Link to="/teachers" className="btn btn-outline">📋 Barcha ro'yxatni ko'rish</Link>
              <Link to="/certificates" className="btn btn-outline">🏆 Sertifikatlarni ko'rish</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}