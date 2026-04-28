import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const DOC_TYPES = [
  'Pasport nusxasi',
  'Diplom nusxasi',
  'Sertifikat',
  'Buyruq',
  'Shartnoma',
  "Tibbiy ma'lumotnoma",
  'ONID',
  'Mehnat daftarchasi nusxasi',
  'Attestatsiya varaqasi',
  "Malaka oshirish guvohnomasi",
  "Ta'lim to'g'risidagi guvohnoma",
  'Kadrlar bo\'yicha anketa',
  'Avtobiografiya',
  'Ijtimoiy sug\'urta guvohnomasi',
  'Pensiya guvohnomasi',
  'Nogironlik guvohnomasi',
  'Harbiy xizmat hujjati',
  'Nikoh guvohnomasi',
  'Boshqa',
];

const Row = ({label, value}) => (
  <div style={{display:'flex', padding:'10px 0', borderBottom:'1px solid #f1f5f9'}}>
    <div style={{width:220, fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', flexShrink:0}}>{label}</div>
    <div style={{fontSize:14, fontWeight:600}}>{value || <span style={{color:'#ccc'}}>—</span>}</div>
  </div>
);

export default function TeacherDetail() {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [tab, setTab] = useState('shaxsiy');
  const [certForm, setCertForm] = useState({ name:'', issued_by:'', issued_date:'', expire_date:'', certificate_number:'' });
  const [certFile, setCertFile] = useState(null);
  const [docForm, setDocForm] = useState({ doc_type:'', doc_name:'', onid_number:'', onid_login:'', onid_password:'' });
  const [docFiles, setDocFiles] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const canEdit = user?.role === 'admin' || user?.role === 'direktor';

  const load = () => axios.get(`/api/teachers/${id}`).then(r => setTeacher(r.data));
  useEffect(() => { load(); }, [id]);

  const addCert = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(certForm).forEach(([k,v]) => fd.append(k, v));
    if (certFile) fd.append('file', certFile);
    await axios.post(`/api/teachers/${id}/certificates`, fd, { headers:{'Content-Type':'multipart/form-data'} });
    setCertForm({ name:'', issued_by:'', issued_date:'', expire_date:'', certificate_number:'' });
    setCertFile(null);
    load();
  };

  const deleteCert = async (cid) => {
    if (!window.confirm('Sertifikatni o\'chirmoqchimisiz?')) return;
    await axios.delete(`/api/teachers/${id}/certificates/${cid}`);
    load();
  };

  const addDoc = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(docForm).forEach(([k,v]) => { if (v) fd.append(k, v); });
    docFiles.forEach(f => fd.append('file', f));
    await axios.post(`/api/teachers/${id}/documents`, fd, { headers:{'Content-Type':'multipart/form-data'} });
    setDocForm({ doc_type:'', doc_name:'', onid_number:'', onid_login:'', onid_password:'' });
    setDocFiles([]);
    load();
  };

  const deleteDoc = async (did) => {
    if (!window.confirm('Hujjatni o\'chirmoqchimisiz?')) return;
    await axios.delete(`/api/teachers/${id}/documents/${did}`);
    load();
  };

  const downloadPhoto = async () => {
    if (!teacher.photo) return;
    const url = `${API_URL}/uploads/${teacher.photo}`;
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${teacher.last_name}_${teacher.first_name}_foto${teacher.photo.slice(teacher.photo.lastIndexOf('.'))}`;
    a.click();
  };

  const handlePrint = () => {
    const content = `
      <html><head><title>${teacher.last_name} ${teacher.first_name}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; color: #1e293b; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        .sub { color: #64748b; font-size: 14px; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #f1f5f9; text-align: left; padding: 8px 12px; font-size: 11px; text-transform: uppercase; color: #64748b; }
        td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
        td:first-child { font-weight: 600; width: 200px; color: #475569; }
        h2 { font-size: 15px; margin: 20px 0 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; }
        @media print { body { padding: 10px; } }
      </style></head><body>
      <h1>${teacher.last_name} ${teacher.first_name} ${teacher.middle_name || ''}</h1>
      <div class="sub">${teacher.position || ''} ${teacher.subject ? '• ' + teacher.subject : ''} ${teacher.status === 'active' ? '• Faol' : '• Nofaol'}</div>

      <h2>👤 Shaxsiy ma'lumotlar</h2>
      <table><tbody>
        <tr><td>Tug'ilgan sana</td><td>${teacher.birth_date || '—'}</td></tr>
        <tr><td>Jinsi</td><td>${teacher.gender || '—'}</td></tr>
        <tr><td>Telefon</td><td>${teacher.phone || '—'}</td></tr>
        <tr><td>Email</td><td>${teacher.email || '—'}</td></tr>
        <tr><td>Manzil</td><td>${teacher.address || '—'}</td></tr>
      </tbody></table>

      <h2>🪪 Pasport ma'lumotlari</h2>
      <table><tbody>
        <tr><td>Pasport</td><td>${teacher.passport_series || ''}${teacher.passport_number || '—'}</td></tr>
        <tr><td>JSHSHIR</td><td>${teacher.jshshir || '—'}</td></tr>
        <tr><td>Bergan organ</td><td>${teacher.passport_issued_by || '—'}</td></tr>
        <tr><td>Berilgan sana</td><td>${teacher.passport_issued_date || '—'}</td></tr>
        <tr><td>Amal muddati</td><td>${teacher.passport_expire_date || '—'}</td></tr>
      </tbody></table>

      <h2>💼 Ish ma'lumotlari</h2>
      <table><tbody>
        <tr><td>Lavozim</td><td>${teacher.position || '—'}</td></tr>
        <tr><td>Fan</td><td>${teacher.subject || '—'}</td></tr>
        <tr><td>Sinf rahbari</td><td>${teacher.class_teacher || '—'}</td></tr>
        <tr><td>Ishga kirgan sana</td><td>${teacher.employment_date || '—'}</td></tr>
        <tr><td>Ish turi</td><td>${teacher.employment_type || '—'}</td></tr>
        <tr><td>Stavka</td><td>${teacher.salary_rate || '—'}</td></tr>
        <tr><td>Staj</td><td>${teacher.experience_years ? teacher.experience_years + ' yil' : '—'}</td></tr>
      </tbody></table>

      <h2>🎓 Ta'lim</h2>
      <table><tbody>
        <tr><td>Ta'lim darajasi</td><td>${teacher.education_level || '—'}</td></tr>
        <tr><td>Universitet</td><td>${teacher.university || '—'}</td></tr>
        <tr><td>Mutaxassislik</td><td>${teacher.specialty || '—'}</td></tr>
        <tr><td>Diplom raqami</td><td>${teacher.diploma_number || '—'}</td></tr>
        <tr><td>Diplom sanasi</td><td>${teacher.diploma_date || '—'}</td></tr>
      </tbody></table>

      ${teacher.certificates?.length > 0 ? `
      <h2>🏆 Sertifikatlar</h2>
      <table>
        <thead><tr><th>Nomi</th><th>Bergan</th><th>Sana</th><th>Raqami</th><th>Muddat</th></tr></thead>
        <tbody>${teacher.certificates.map(c => `
          <tr><td>${c.name}</td><td>${c.issued_by||'—'}</td><td>${c.issued_date||'—'}</td><td>${c.certificate_number||'—'}</td><td>${c.expire_date||'—'}</td></tr>
        `).join('')}</tbody>
      </table>` : ''}

      <div style="margin-top:40px; font-size:11px; color:#94a3b8; text-align:right;">
        Chop etilgan: ${new Date().toLocaleDateString('uz-UZ')}
      </div>
      </body></html>
    `;
    const w = window.open('', '_blank');
    w.document.write(content);
    w.document.close();
    w.print();
  };

  if (!teacher) return <div style={{textAlign:'center',padding:60}}>⏳ Yuklanmoqda...</div>;

  return (
    <div>
      {/* Header */}
      <div className="detail-header" style={{marginBottom:24}}>
        <div style={{position:'relative'}}>
          <div className="detail-avatar">
            {teacher.photo
              ? <img src={`${API_URL}/uploads/${teacher.photo}`} alt="foto"/>
              : `${teacher.first_name?.[0] || ''}${teacher.last_name?.[0] || ''}`
            }
          </div>
          {teacher.photo && (
            <button onClick={downloadPhoto} title="Rasmni yuklab olish" style={{
              position:'absolute', bottom:0, right:0,
              width:28, height:28, borderRadius:'50%',
              background:'var(--primary)', color:'#fff',
              border:'2px solid #fff', cursor:'pointer',
              fontSize:14, display:'flex', alignItems:'center', justifyContent:'center'
            }}>⬇</button>
          )}
        </div>
        <div style={{flex:1}}>
          <div className="detail-name">{teacher.last_name} {teacher.first_name} {teacher.middle_name}</div>
          <div className="detail-meta">
            <span>💼 {teacher.position || 'Lavozim kiritilmagan'}</span>
            <span>📚 {teacher.subject || '—'}</span>
            {teacher.experience_years && <span>⭐ {teacher.experience_years} yillik staj</span>}
            <span className={`badge ${teacher.status==='active' ? 'badge-success' : 'badge-danger'}`}>
              {teacher.status==='active' ? '✅ Faol' : '❌ Nofaol'}
            </span>
          </div>
        </div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          <button className="btn btn-outline" onClick={handlePrint}>🖨️ Chop etish</button>
          {canEdit && (
            <Link to={`/teachers/${id}/edit`} className="btn btn-accent">✏️ Tahrirlash</Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {[
          {key:'shaxsiy', label:'👤 Shaxsiy'},
          {key:'pasport', label:'🪪 Pasport / ID'},
          {key:'ish', label:'💼 Ish ma\'lumotlari'},
          {key:"ta'lim", label:"🎓 Ta'lim / Diplom"},
          {key:'sertifikat', label:`🏆 Sertifikatlar (${teacher.certificates?.length || 0})`},
          {key:'hujjat', label:`📁 Hujjatlar (${teacher.documents?.length || 0})`},
        ].map(t => (
          <button key={t.key} className={`tab-btn ${tab===t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-body">

          {tab === 'shaxsiy' && (
            <div>
              <Row label="Familiya" value={teacher.last_name}/>
              <Row label="Ism" value={teacher.first_name}/>
              <Row label="Otasining ismi" value={teacher.middle_name}/>
              <Row label="Tug'ilgan sana" value={teacher.birth_date}/>
              <Row label="Jinsi" value={teacher.gender}/>
              <Row label="Telefon" value={teacher.phone}/>
              <Row label="Email" value={teacher.email}/>
              <Row label="Manzil" value={teacher.address}/>
              <Row label="Izoh" value={teacher.notes}/>
            </div>
          )}

          {tab === 'pasport' && (
            <div>
              <Row label="Pasport seriyasi va raqami" value={`${teacher.passport_series || ''} ${teacher.passport_number || ''}`}/>
              <Row label="JSHSHIR" value={teacher.jshshir}/>
              <Row label="Kim tomonidan berilgan" value={teacher.passport_issued_by}/>
              <Row label="Berilgan sana" value={teacher.passport_issued_date}/>
              <Row label="Amal qilish muddati" value={teacher.passport_expire_date}/>
            </div>
          )}

          {tab === 'ish' && (
            <div>
              <Row label="Lavozimi" value={teacher.position}/>
              <Row label="Fani" value={teacher.subject}/>
              <Row label="Sinf rahbari" value={teacher.class_teacher}/>
              <Row label="Ishga kirgan sana" value={teacher.employment_date}/>
              <Row label="Ish turi" value={teacher.employment_type}/>
              <Row label="Stavka" value={teacher.salary_rate ? `${teacher.salary_rate} stavka` : ''}/>
              <Row label="Ish staji" value={teacher.experience_years ? `${teacher.experience_years} yil` : ''}/>
              <div style={{marginTop:20, padding:'16px', background:'#f8fafc', borderRadius:8}}>
                <div style={{fontWeight:800, marginBottom:8, fontSize:13, textTransform:'uppercase', color:'var(--text-muted)'}}>📕 Mehnat daftarchasi</div>
                <Row label="Daftarcha raqami" value={teacher.labor_book_number}/>
                <Row label="Berilgan sana" value={teacher.labor_book_date}/>
                <Row label="Oldingi ish joylari" value={teacher.previous_workplaces}/>
              </div>
            </div>
          )}

          {tab === "ta'lim" && (
            <div>
              <Row label="Ta'lim darajasi" value={teacher.education_level}/>
              <Row label="Oliy o'quv yurti" value={teacher.university}/>
              <Row label="Mutaxassislik" value={teacher.specialty}/>
              <Row label="Tamomlagan yili" value={teacher.graduation_year}/>
              <Row label="Diplom raqami" value={teacher.diploma_number}/>
              <Row label="Diplom berilgan sana" value={teacher.diploma_date}/>
            </div>
          )}

          {tab === 'sertifikat' && (
            <div>
              {teacher.certificates?.length === 0 && (
                <div className="empty-state" style={{padding:30}}>
                  <div className="icon">🏆</div>
                  <h3>Sertifikatlar yo'q</h3>
                </div>
              )}
              {teacher.certificates?.map(c => (
                <div key={c.id} style={{
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  padding:'14px 16px', background:'#f8fafc', borderRadius:8, marginBottom:8, border:'1px solid var(--border)'
                }}>
                  <div>
                    <div style={{fontWeight:700}}>{c.name}</div>
                    <div style={{fontSize:12, color:'var(--text-muted)'}}>
                      {c.issued_by} {c.issued_date && `• ${c.issued_date}`} {c.certificate_number && `• №${c.certificate_number}`}
                    </div>
                    {c.expire_date && <div style={{fontSize:12, color:'var(--warning)'}}>⏰ Muddati: {c.expire_date}</div>}
                  </div>
                  <div style={{display:'flex', gap:8}}>
                    {c.file_path && (
                      <a href={`${API_URL}/uploads/${c.file_path}`} target="_blank" rel="noreferrer" download
                        className="btn btn-outline btn-sm">
                        {c.file_path.endsWith('.pdf') ? '📄' : '🖼️'} Yuklab olish
                      </a>
                    )}
                    {canEdit && (
                      <button className="btn btn-sm" style={{background:'#fee2e2',color:'var(--danger)'}} onClick={() => deleteCert(c.id)}>🗑</button>
                    )}
                  </div>
                </div>
              ))}

              {canEdit && (
                <form onSubmit={addCert} style={{marginTop:20, padding:20, border:'2px dashed var(--border)', borderRadius:8}}>
                  <div style={{fontWeight:800, marginBottom:12}}>➕ Yangi sertifikat qo'shish</div>
                  <div className="form-grid form-grid-3" style={{gap:10, marginBottom:10}}>
                    <div className="form-group"><label className="form-label">Nomi *</label><input className="form-control" required value={certForm.name} onChange={e=>setCertForm({...certForm, name:e.target.value})}/></div>
                    <div className="form-group"><label className="form-label">Bergan tashkilot</label><input className="form-control" value={certForm.issued_by} onChange={e=>setCertForm({...certForm, issued_by:e.target.value})}/></div>
                    <div className="form-group"><label className="form-label">Raqami</label><input className="form-control" value={certForm.certificate_number} onChange={e=>setCertForm({...certForm, certificate_number:e.target.value})}/></div>
                    <div className="form-group"><label className="form-label">Berilgan sana</label><input type="date" className="form-control" value={certForm.issued_date} onChange={e=>setCertForm({...certForm, issued_date:e.target.value})}/></div>
                    <div className="form-group"><label className="form-label">Amal qilish muddati</label><input type="date" className="form-control" value={certForm.expire_date} onChange={e=>setCertForm({...certForm, expire_date:e.target.value})}/></div>
                    <div className="form-group"><label className="form-label">Fayl PDF/Rasm</label><input type="file" accept=".pdf,.jpg,.jpeg,.png" className="form-control" onChange={e=>setCertFile(e.target.files[0])}/></div>
                  </div>
                  <button type="submit" className="btn btn-success">💾 Saqlash</button>
                </form>
              )}
            </div>
          )}

          {tab === 'hujjat' && (
            <div>
              {teacher.documents?.length === 0 && (
                <div className="empty-state" style={{padding:30}}>
                  <div className="icon">📁</div>
                  <h3>Hujjatlar yo'q</h3>
                </div>
              )}
              {teacher.documents?.map(d => (
                <div key={d.id} style={{
                  padding:'14px 16px', background:'#f8fafc', borderRadius:8, marginBottom:8, border:'1px solid var(--border)'
                }}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                    <div>
                      <div style={{fontWeight:700}}>{d.doc_name}</div>
                      <div style={{fontSize:12, color:'var(--text-muted)', marginTop:4}}>
                        <span style={{background:'#e0e7ff', color:'#4338ca', padding:'2px 8px', borderRadius:20, fontWeight:600, fontSize:11}}>{d.doc_type}</span>
                        <span style={{marginLeft:8}}>{new Date(d.upload_date).toLocaleDateString('uz-UZ')}</span>
                        {d.onid_number && (
                          <span style={{marginLeft:8, color:'var(--primary)', fontWeight:600}}>
                            🪪 ONID: {d.onid_number}
                          </span>
                        )}
                      </div>
                      {/* ONID login/parol */}
                      {d.doc_type === 'ONID' && (d.onid_login || d.onid_password) && (
                        <div style={{marginTop:6, padding:'6px 10px', background:'#eff6ff', borderRadius:6, fontSize:12}}>
                          {d.onid_login && <span style={{marginRight:12}}>👤 Login: <b>{d.onid_login}</b></span>}
                          {d.onid_password && <span>🔑 Parol: <b>{d.onid_password}</b></span>}
                        </div>
                      )}
                    </div>
                    <div style={{display:'flex', gap:8}}>
                      {d.file_path && (
                        <a href={`${API_URL}/uploads/${d.file_path}`} target="_blank" rel="noreferrer" download
                          className="btn btn-outline btn-sm">
                          {d.file_path.endsWith('.pdf') ? '📄' : '🖼️'} Yuklab olish
                        </a>
                      )}
                      {canEdit && (
                        <button className="btn btn-sm" style={{background:'#fee2e2',color:'var(--danger)'}} onClick={() => deleteDoc(d.id)}>🗑</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {canEdit && (
                <form onSubmit={addDoc} style={{marginTop:20, padding:20, border:'2px dashed var(--border)', borderRadius:8}}>
                  <div style={{fontWeight:800, marginBottom:12}}>➕ Yangi hujjat qo'shish</div>
                  <div className="form-grid form-grid-3" style={{gap:10, marginBottom:10}}>
                    <div className="form-group">
                      <label className="form-label">Hujjat turi *</label>
                      <select className="form-control" required value={docForm.doc_type} onChange={e=>setDocForm({...docForm, doc_type:e.target.value})}>
                        <option value="">Tanlang</option>
                        {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nomi *</label>
                      <input className="form-control" required value={docForm.doc_name} onChange={e=>setDocForm({...docForm, doc_name:e.target.value})}/>
                    </div>
                    {docForm.doc_type === 'ONID' && (<>
                      <div className="form-group">
                        <label className="form-label">ONID raqami</label>
                        <input className="form-control" placeholder="ONID raqamini kiriting"
                          value={docForm.onid_number} onChange={e=>setDocForm({...docForm, onid_number:e.target.value})}/>
                      </div>
                      <div className="form-group">
                        <label className="form-label">ONID Login</label>
                        <input className="form-control" placeholder="Login (username)"
                          value={docForm.onid_login} onChange={e=>setDocForm({...docForm, onid_login:e.target.value})}/>
                      </div>
                      <div className="form-group">
                        <label className="form-label">ONID Parol</label>
                        <input className="form-control" placeholder="Parol"
                          value={docForm.onid_password} onChange={e=>setDocForm({...docForm, onid_password:e.target.value})}/>
                      </div>
                    </>)}
                    <div className="form-group">
                      <label className="form-label">Fayllar (PDF yoki rasm)</label>
                      <input type="file" className="form-control" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={e => setDocFiles(Array.from(e.target.files))}/>
                      {docFiles.length > 0 && (
                        <div style={{fontSize:12, color:'var(--text-muted)', marginTop:4}}>
                          ✅ {docFiles.length} ta fayl tanlandi
                        </div>
                      )}
                    </div>
                  </div>
                  <button type="submit" className="btn btn-success">💾 Saqlash</button>
                </form>
              )}
            </div>
          )}

        </div>
      </div>

      <div style={{marginTop:16}}>
        <button className="btn btn-outline" onClick={() => navigate('/teachers')}>← Ro'yxatga qaytish</button>
      </div>
    </div>
  );
}