import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import API_URL from '../config';

export default function Certificates() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    axios.get('/api/teachers/certificates/all', { headers })
      .then(r => {
        setData(r.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Xato:', err);
        setLoading(false);
      });
  }, []);

  const filtered = data.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.certificate_number?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{textAlign:'center',padding:60}}>⏳ Yuklanmoqda...</div>;

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <h2 style={{margin:0, fontSize:22, fontWeight:800}}>🏆 Barcha Sertifikatlar</h2>
        <div style={{fontSize:14, color:'var(--text-muted)', fontWeight:600}}>
          Jami: {data.length} ta sertifikat
        </div>
      </div>

      <div className="card" style={{marginBottom:20}}>
        <div className="card-body" style={{padding:'14px 20px'}}>
          <input
            className="form-control"
            placeholder="🔍 O'qituvchi ismi yoki sertifikat nomi bo'yicha qidiring..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{maxWidth:460}}
          />
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="icon">🏆</div>
          <h3>Sertifikatlar topilmadi</h3>
        </div>
      )}

      <div className="card">
        <div className="card-body" style={{padding:0}}>
          {filtered.map((c, i) => (
            <div key={c.id} style={{
              display:'flex', justifyContent:'space-between', alignItems:'center',
              padding:'14px 20px',
              borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
              background: i % 2 === 0 ? '#fff' : '#fafbfc'
            }}>
              <div style={{display:'flex', alignItems:'center', gap:14}}>
                <div style={{
                  width:42, height:42, borderRadius:10,
                  background:'linear-gradient(135deg,#f59e0b,#d97706)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:20, flexShrink:0
                }}>🏆</div>
                <div>
                  <div style={{fontWeight:700, fontSize:15}}>{c.name}</div>
                  <div style={{fontSize:12, color:'var(--text-muted)', marginTop:2}}>
                    {c.issued_by && <span>{c.issued_by} • </span>}
                    {c.issued_date && <span>{c.issued_date} • </span>}
                    {c.certificate_number && <span>№{c.certificate_number}</span>}
                  </div>
                  {c.expire_date && (
                    <div style={{fontSize:12, color:'var(--warning)', marginTop:2}}>⏰ Muddati: {c.expire_date}</div>
                  )}
                </div>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:12}}>
                <div style={{textAlign:'right'}}>
                  <Link to={`/teachers/${c.teacher_id}`} style={{
                    fontWeight:700, fontSize:13, color:'var(--primary)', textDecoration:'none'
                  }}>
                    👤 {c.last_name} {c.first_name}
                  </Link>
                  <div style={{fontSize:12, color:'var(--text-muted)'}}>{c.position}</div>
                </div>
                {c.file_path && (
                  <a href={`${API_URL}/uploads/${c.file_path}`}
                    target="_blank" rel="noreferrer" download
                    className="btn btn-outline btn-sm">
                    {c.file_path.endsWith('.pdf') ? '📄' : '🖼️'} Yuklab olish
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}