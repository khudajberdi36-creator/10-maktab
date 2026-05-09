import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';
import * as XLSX from 'xlsx';

const SUBJECTS = [
  'Matematika','Fizika','Kimyo','Biologiya','Tarix','Geografiya','Adabiyot',
  'Ona tili','Ingliz tili','Rus tili','Informatika','Jismoniy tarbiya','Musiqa',
  'Qoraqalpoq tili','Nemis tili','Turkman tili','Fransuz tili',
  "Mehnat ta'limi","Boshlang'ich ta'lim","Tasviriy san'at",'Chizmachilik','Boshqa'
];

const AGE_RANGES = [
  { label: 'Barcha yoshlar', value: '' },
  { label: '20–30 yosh', value: '20-30' },
  { label: '31–40 yosh', value: '31-40' },
  { label: '41–50 yosh', value: '41-50' },
  { label: '51–60 yosh', value: '51-60' },
  { label: '60+ yosh', value: '60+' },
];

const EXP_RANGES = [
  { label: 'Barcha staj', value: '' },
  { label: '0–5 yil', value: '0-5' },
  { label: '6–10 yil', value: '6-10' },
  { label: '11–20 yil', value: '11-20' },
  { label: '20+ yil', value: '20+' },
];

function getAge(birthDate) {
  if (!birthDate) return null;
  const parts = birthDate.includes('/') ? birthDate.split('/') : birthDate.split('-');
  let year;
  if (parts[0].length === 4) year = parseInt(parts[0]);
  else year = parseInt(parts[2]);
  if (!year) return null;
  return new Date().getFullYear() - year;
}

function matchesAge(teacher, range) {
  if (!range) return true;
  const age = getAge(teacher.birth_date);
  if (age === null) return false;
  if (range === '20-30') return age >= 20 && age <= 30;
  if (range === '31-40') return age >= 31 && age <= 40;
  if (range === '41-50') return age >= 41 && age <= 50;
  if (range === '51-60') return age >= 51 && age <= 60;
  if (range === '60+') return age > 60;
  return true;
}

function matchesExp(teacher, range) {
  if (!range) return true;
  const exp = parseInt(teacher.experience_years) || 0;
  if (range === '0-5') return exp >= 0 && exp <= 5;
  if (range === '6-10') return exp >= 6 && exp <= 10;
  if (range === '11-20') return exp >= 11 && exp <= 20;
  if (range === '20+') return exp > 20;
  return true;
}

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [subject, setSubject] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [expRange, setExpRange] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  };

  const load = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (status) params.status = status;
    axios.get(`${API_URL}/api/teachers`, { params, headers: getHeaders() })
      .then(r => { setTeachers(r.data); setLoading(false); })
      .catch(err => { console.error('Xato:', err); setLoading(false); });
  };

  useEffect(() => { load(); }, [search, status]);

  const deleteTeacher = async (id, name) => {
    if (!window.confirm(`"${name}" o'qituvchini o'chirmoqchimisiz?`)) return;
    await axios.delete(`${API_URL}/api/teachers/${id}`, { headers: getHeaders() });
    load();
  };

  const exportExcel = () => {
    setExporting(true);
    try {
      const headers = [
        '#', 'Familiya', 'Ism', "Otasining ismi", "Tug'ilgan sana", 'Jinsi',
        'Pasport seriya', 'Pasport raqami', 'JSHSHIR', 'Telefon', 'Email', 'Manzil',
        'Lavozim', 'Fan', 'Sinf rahbari', 'Ishga kirgan sana', 'Ish turi', 'Stavka',
        'Staj (yil)', "Ta'lim darajasi", 'Universitet', 'Mutaxassislik',
        "Tamomlagan yili", 'Diplom raqami', 'Holati'
      ];

      const rows = filtered.map((t, i) => [
        i + 1, t.last_name||'', t.first_name||'', t.middle_name||'',
        t.birth_date||'', t.gender||'', t.passport_series||'', t.passport_number||'',
        t.jshshir||'', t.phone||'', t.email||'', t.address||'', t.position||'',
        t.subject||'', t.class_teacher||'', t.employment_date||'', t.employment_type||'',
        t.salary_rate||'', t.experience_years||'', t.education_level||'',
        t.university||'', t.specialty||'', t.graduation_year||'', t.diploma_number||'',
        t.status === 'active' ? 'Faol' : 'Nofaol'
      ]);

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      ws['!cols'] = [
        {wch:4},{wch:16},{wch:14},{wch:16},{wch:14},{wch:8},{wch:10},{wch:12},
        {wch:16},{wch:14},{wch:20},{wch:20},{wch:30},{wch:18},{wch:12},{wch:14},
        {wch:12},{wch:8},{wch:10},{wch:14},{wch:24},{wch:20},{wch:12},{wch:14},{wch:8},
      ];
      XLSX.utils.book_append_sheet(wb, ws, "O'qituvchilar");
      const date = new Date().toLocaleDateString('uz-UZ').replace(/\//g, '-');
      XLSX.writeFile(wb, `ustozlar_royxati_${date}.xlsx`);
    } catch (e) {
      alert("Export qilishda xatolik yuz berdi!");
    } finally {
      setExporting(false);
    }
  };

  const canEdit = user?.role === 'admin' || user?.role === 'direktor';

  const filtered = teachers.filter(t => {
    if (subject && t.subject !== subject) return false;
    if (!matchesAge(t, ageRange)) return false;
    if (!matchesExp(t, expRange)) return false;
    return true;
  });

  const activeFiltersCount = [subject, ageRange, expRange].filter(Boolean).length;

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
        <div>
          <h2 style={{fontSize:20, fontWeight:800}}>O'qituvchilar ro'yxati</h2>
          <p style={{fontSize:13, color:'var(--text-muted)'}}>Jami: {filtered.length} ta xodim</p>
        </div>
        <div style={{display:'flex', gap:8}}>
          <button
            className="btn btn-outline"
            onClick={exportExcel}
            disabled={exporting || filtered.length === 0}
            style={{
              display:'flex', alignItems:'center', gap:6,
              background: filtered.length === 0 ? 'var(--bg-secondary)' : '#f0fdf4',
              color: filtered.length === 0 ? 'var(--text-muted)' : '#16a34a',
              border: filtered.length === 0 ? '1px solid var(--border)' : '1px solid #86efac',
              fontWeight:700
            }}>
            {exporting ? '⏳ Yuklanmoqda...' : '📊 Excel'}
          </button>
          {canEdit && <Link to="/teachers/new" className="btn btn-primary">➕ Yangi</Link>}
        </div>
      </div>

      {/* ASOSIY FILTER QATORI */}
      <div style={{display:'flex', gap:10, marginBottom:12, flexWrap:'wrap', alignItems:'center'}}>
        <div className="search-bar" style={{flex:1, minWidth:200}}>
          <span>🔍</span>
          <input
            placeholder="Ism, familiya, JSHSHIR, pasport raqami..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-control" style={{width:150}} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Barcha holat</option>
          <option value="active">✅ Faol</option>
          <option value="inactive">❌ Nofaol</option>
        </select>
        <button
          className="btn btn-outline"
          onClick={() => setShowFilters(v => !v)}
          style={{
            display:'flex', alignItems:'center', gap:6, fontWeight:700,
            background: activeFiltersCount > 0 ? 'var(--primary)' : undefined,
            color: activeFiltersCount > 0 ? '#fff' : undefined,
            border: activeFiltersCount > 0 ? 'none' : undefined,
          }}>
          🎛️ Filter {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </button>
        {activeFiltersCount > 0 && (
          <button className="btn btn-outline" style={{color:'var(--danger)'}}
            onClick={() => { setSubject(''); setAgeRange(''); setExpRange(''); }}>
            ✕ Tozalash
          </button>
        )}
      </div>

      {/* KENGAYTIRILGAN FILTER PANEL */}
      {showFilters && (
        <div style={{
          background:'var(--bg-secondary)', border:'1px solid var(--border)',
          borderRadius:12, padding:16, marginBottom:16,
          display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:12
        }}>
          <div className="form-group" style={{margin:0}}>
            <label className="form-label">📚 Fan bo'yicha</label>
            <select className="form-control" value={subject} onChange={e => setSubject(e.target.value)}>
              <option value="">Barcha fanlar</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group" style={{margin:0}}>
            <label className="form-label">🎂 Yosh bo'yicha</label>
            <select className="form-control" value={ageRange} onChange={e => setAgeRange(e.target.value)}>
              {AGE_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="form-group" style={{margin:0}}>
            <label className="form-label">⭐ Staj bo'yicha</label>
            <select className="form-control" value={expRange} onChange={e => setExpRange(e.target.value)}>
              {EXP_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* JADVAL */}
      <div className="card">
        {loading ? (
          <div style={{textAlign:'center', padding:60}}>⏳ Yuklanmoqda...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">👨‍🏫</div>
            <h3>Xodimlar topilmadi</h3>
            <p>Qidiruv shartlarini o'zgartiring yoki yangi xodim qo'shing</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Xodim</th>
                  <th>JSHSHIR</th>
                  <th>Pasport</th>
                  <th>Lavozim / Fan</th>
                  <th>Telefon</th>
                  <th>Staj</th>
                  <th>Holat</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => (
                  <tr key={t.id}>
                    <td style={{color:'var(--text-muted)', fontWeight:600}}>{i + 1}</td>
                    <td>
                      <div style={{display:'flex', alignItems:'center', gap:10}}>
                        <div style={{
                          width:38, height:38, borderRadius:'50%', overflow:'hidden',
                          background:'var(--primary)', display:'flex', alignItems:'center',
                          justifyContent:'center', color:'#fff', fontWeight:800,
                          fontSize:13, flexShrink:0
                        }}>
                          {t.photo
                            ? <img src={`${API_URL}/uploads/${t.photo}`} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                            : `${t.first_name?.[0] || ''}${t.last_name?.[0] || ''}`
                          }
                        </div>
                        <div>
                          <div style={{fontWeight:700}}>{t.last_name} {t.first_name}</div>
                          <div style={{fontSize:12, color:'var(--text-muted)'}}>{t.middle_name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{fontFamily:'monospace', fontSize:13}}>{t.jshshir || '—'}</td>
                    <td style={{fontFamily:'monospace', fontSize:13}}>{t.passport_series}{t.passport_number || '—'}</td>
                    <td>
                      <div style={{fontWeight:600, fontSize:13}}>{t.position || '—'}</div>
                      <div style={{fontSize:12, color:'var(--text-muted)'}}>{t.subject}</div>
                    </td>
                    <td style={{fontSize:13}}>{t.phone || '—'}</td>
                    <td style={{textAlign:'center'}}>
                      {t.experience_years
                        ? <span className="badge badge-info">{t.experience_years} yil</span>
                        : '—'}
                    </td>
                    <td>
                      <span className={`badge ${t.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                        {t.status === 'active' ? '✅ Faol' : '❌ Nofaol'}
                      </span>
                    </td>
                    <td>
                      <div style={{display:'flex', gap:4}}>
                        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/teachers/${t.id}`)}>👁</button>
                        {canEdit && <>
                          <button className="btn btn-outline btn-sm" onClick={() => navigate(`/teachers/${t.id}/edit`)}>✏️</button>
                          <button className="btn btn-sm" style={{background:'#fee2e2', color:'var(--danger)'}}
                            onClick={() => deleteTeacher(t.id, `${t.last_name} ${t.first_name}`)}>🗑️</button>
                        </>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}