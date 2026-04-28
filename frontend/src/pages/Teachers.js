import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const SUBJECTS = ['Matematika','Fizika','Kimyo','Biologiya','Tarix','Geografiya','Adabiyot',
  'Ona tili','Ingliz tili','Rus tili','Informatika','Jismoniy tarbiya','Musiqa','Boshqa'];

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (status) params.status = status;
    axios.get('/api/teachers', { params }).then(r => {
      setTeachers(r.data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, [search, status]);

  const deleteTeacher = async (id, name) => {
    if (!window.confirm(`"${name}" o'qituvchini o'chirmoqchimisiz?`)) return;
    await axios.delete(`/api/teachers/${id}`);
    load();
  };

  const exportExcel = () => {
    const headers = ['#','Familiya','Ism','Otasining ismi','Tug\'ilgan sana','Jinsi',
      'Pasport','JSHSHIR','Telefon','Email','Manzil','Lavozim','Fan','Sinf rahbari',
      'Ishga kirgan sana','Ish turi','Stavka','Staj (yil)','Ta\'lim','Universitet',
      'Mutaxassislik','Diplom raqami','Holati'];

    const rows = filtered.map((t, i) => [
      i+1, t.last_name, t.first_name, t.middle_name||'', t.birth_date||'', t.gender||'',
      `${t.passport_series||''}${t.passport_number||''}`, t.jshshir||'',
      t.phone||'', t.email||'', t.address||'', t.position||'', t.subject||'',
      t.class_teacher||'', t.employment_date||'', t.employment_type||'',
      t.salary_rate||'', t.experience_years||'', t.education_level||'',
      t.university||'', t.specialty||'', t.diploma_number||'',
      t.status==='active' ? 'Faol' : 'Nofaol'
    ]);

    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ustozlar_${new Date().toLocaleDateString('uz-UZ')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const canEdit = user?.role === 'admin' || user?.role === 'direktor';

  const filtered = teachers.filter(t =>
    subject ? t.subject === subject : true
  );

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
        <div>
          <h2 style={{fontSize:20, fontWeight:800}}>O'qituvchilar ro'yxati</h2>
          <p style={{fontSize:13, color:'var(--text-muted)'}}>Jami: {filtered.length} ta xodim</p>
        </div>
        <div style={{display:'flex', gap:8}}>
          <button className="btn btn-outline" onClick={exportExcel}>📊 Excel eksport</button>
          {canEdit && <Link to="/teachers/new" className="btn btn-primary">➕ Yangi qo'shish</Link>}
        </div>
      </div>

      <div style={{display:'flex', gap:10, marginBottom:20, flexWrap:'wrap'}}>
        <div className="search-bar" style={{flex:1, minWidth:200}}>
          <span>🔍</span>
          <input placeholder="Ism, familiya, JSHSHIR, pasport raqami..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{width:150}} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Barcha holat</option>
          <option value="active">Faol</option>
          <option value="inactive">Nofaol</option>
        </select>
        <select className="form-control" style={{width:160}} value={subject} onChange={e => setSubject(e.target.value)}>
          <option value="">Barcha fanlar</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

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
                            ? <img src={`${API_URL}/uploads/${t.photo}`} alt=""
                                style={{width:'100%', height:'100%', objectFit:'cover'}}/>
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
                            onClick={() => deleteTeacher(t.id, `${t.last_name} ${t.first_name}`)}>🗑</button>
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