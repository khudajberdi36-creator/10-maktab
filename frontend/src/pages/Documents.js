import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import API_URL from '../config';

export default function Documents() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/teachers').then(async r => {
      const teachers = r.data;
      const all = [];
      for (const t of teachers) {
        const detail = await axios.get(`/api/teachers/${t.id}`);
        (detail.data.documents || []).forEach(d => {
          all.push({ ...d, teacher: detail.data });
        });
      }
      setData(all);
      setLoading(false);
    });
  }, []);

  const docTypes = [...new Set(data.map(d => d.doc_type))].filter(Boolean);

  const filtered = data.filter(d => {
    const matchSearch =
      d.doc_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.teacher?.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.teacher?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.onid_number?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType ? d.doc_type === filterType : true;
    return matchSearch && matchType;
  });

  const typeIcon = (type) => {
    if (type === 'Pasport nusxasi') return '🪪';
    if (type === 'Diplom nusxasi') return '🎓';
    if (type === 'Sertifikat') return '🏆';
    if (type === 'Buyruq') return '📜';
    if (type === 'Shartnoma') return '🤝';
    if (type === "Tibbiy ma'lumotnoma") return '🏥';
    if (type === 'ONID') return '🆔';
    if (type === 'Mehnat daftarchasi nusxasi') return '📕';
    if (type === 'Attestatsiya varaqasi') return '📋';
    if (type === "Malaka oshirish guvohnomasi") return '📈';
    return '📁';
  };

  if (loading) return <div style={{textAlign:'center',padding:60}}>⏳ Yuklanmoqda...</div>;

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <h2 style={{margin:0, fontSize:22, fontWeight:800}}>📁 Barcha Hujjatlar</h2>
        <div style={{fontSize:14, color:'var(--text-muted)', fontWeight:600}}>
          Jami: {data.length} ta hujjat
        </div>
      </div>

      <div className="card" style={{marginBottom:20}}>
        <div className="card-body" style={{padding:'14px 20px', display:'flex', gap:12, flexWrap:'wrap'}}>
          <input
            className="form-control"
            placeholder="🔍 O'qituvchi ismi, hujjat nomi yoki ONID bo'yicha qidiring..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{flex:1, minWidth:260}}
          />
          <select
            className="form-control"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            style={{width:220}}
          >
            <option value="">Barcha turlar</option>
            {docTypes.map(t => (
              <option key={t} value={t}>{typeIcon(t)} {t}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="icon">📁</div>
          <h3>Hujjatlar topilmadi</h3>
        </div>
      )}

      <div className="card">
        <div className="card-body" style={{padding:0}}>
          {filtered.map((d, i) => (
            <div key={d.id} style={{
              padding:'14px 20px',
              borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
              background: i % 2 === 0 ? '#fff' : '#fafbfc'
            }}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <div style={{display:'flex', alignItems:'flex-start', gap:14}}>
                  <div style={{
                    width:42, height:42, borderRadius:10,
                    background:'linear-gradient(135deg,#6366f1,#4f46e5)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:20, flexShrink:0
                  }}>{typeIcon(d.doc_type)}</div>
                  <div>
                    <div style={{fontWeight:700, fontSize:15}}>{d.doc_name}</div>
                    <div style={{fontSize:12, color:'var(--text-muted)', marginTop:2}}>
                      <span style={{
                        background:'#e0e7ff', color:'#4338ca',
                        padding:'2px 8px', borderRadius:20, fontWeight:600, fontSize:11
                      }}>{d.doc_type}</span>
                      <span style={{marginLeft:8}}>{new Date(d.upload_date).toLocaleDateString('uz-UZ')}</span>
                      {d.onid_number && (
                        <span style={{marginLeft:8, color:'var(--primary)', fontWeight:600}}>
                          🪪 ONID: {d.onid_number}
                        </span>
                      )}
                    </div>
                    {d.doc_type === 'ONID' && (d.onid_login || d.onid_password) && (
                      <div style={{marginTop:4, fontSize:12, color:'#1d4ed8'}}>
                        {d.onid_login && <span style={{marginRight:12}}>👤 Login: <b>{d.onid_login}</b></span>}
                        {d.onid_password && <span>🔑 Parol: <b>{d.onid_password}</b></span>}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:12}}>
                  <div style={{textAlign:'right'}}>
                    <Link to={`/teachers/${d.teacher.id}`} style={{
                      fontWeight:700, fontSize:13, color:'var(--primary)', textDecoration:'none'
                    }}>
                      👤 {d.teacher.last_name} {d.teacher.first_name}
                    </Link>
                    <div style={{fontSize:12, color:'var(--text-muted)'}}>{d.teacher.position}</div>
                  </div>
                  {d.file_path && (
                    <a href={`${API_URL}/uploads/${d.file_path}`} target="_blank" rel="noreferrer" download
                      className="btn btn-outline btn-sm">
                      {d.file_path.endsWith('.pdf') ? '📄' : '🖼️'} Yuklab olish
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}