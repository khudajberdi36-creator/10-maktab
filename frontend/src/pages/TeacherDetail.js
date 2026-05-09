import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const DOC_TYPES = [
  'Pasport nusxasi','Diplom nusxasi','Sertifikat','Buyruq','Shartnoma',
  "Tibbiy ma'lumotnoma",'ONID','Mehnat daftarchasi nusxasi','Attestatsiya varaqasi',
  "Malaka oshirish guvohnomasi","Ta'lim to'g'risidagi guvohnoma",
  "Kadrlar bo'yicha anketa",'Avtobiografiya',"Ijtimoiy sug'urta guvohnomasi",
  'Pensiya guvohnomasi','Nogironlik guvohnomasi','Harbiy xizmat hujjati',
  'Nikoh guvohnomasi','Boshqa',
];

const Row = ({label, value}) => (
  <div style={{display:'flex', padding:'10px 0', borderBottom:'1px solid var(--border, #f1f5f9)'}}>
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

  const load = () => axios.get(`${API_URL}/api/teachers/${id}`).then(r => setTeacher(r.data));
  useEffect(() => { load(); }, [id]);

  const addCert = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(certForm).forEach(([k,v]) => fd.append(k, v));
    if (certFile) fd.append('file', certFile);
    await axios.post(`${API_URL}/api/teachers/${id}/certificates`, fd, { headers:{'Content-Type':'multipart/form-data'} });
    setCertForm({ name:'', issued_by:'', issued_date:'', expire_date:'', certificate_number:'' });
    setCertFile(null);
    load();
  };

  const deleteCert = async (cid) => {
    if (!window.confirm("Sertifikatni o'chirmoqchimisiz?")) return;
    await axios.delete(`${API_URL}/api/teachers/${id}/certificates/${cid}`);
    load();
  };

  const addDoc = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(docForm).forEach(([k,v]) => { if (v) fd.append(k, v); });
    docFiles.forEach(f => fd.append('file', f));
    await axios.post(`${API_URL}/api/teachers/${id}/documents`, fd, { headers:{'Content-Type':'multipart/form-data'} });
    setDocForm({ doc_type:'', doc_name:'', onid_number:'', onid_login:'', onid_password:'' });
    setDocFiles([]);
    load();
  };

  const deleteDoc = async (did) => {
    if (!window.confirm("Hujjatni o'chirmoqchimisiz?")) return;
    await axios.delete(`${API_URL}/api/teachers/${id}/documents/${did}`);
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

  // CHIROYLI PDF CHOP ETISH
  const handlePrint = () => {
    const photoHtml = teacher.photo
      ? `<img src="${API_URL}/uploads/${teacher.photo}" alt="foto" style="width:110px;height:110px;border-radius:50%;object-fit:cover;border:4px solid #1E40AF;"/>`
      : `<div style="width:110px;height:110px;border-radius:50%;background:linear-gradient(135deg,#1E40AF,#3b82f6);display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:800;color:#fff;border:4px solid #1E40AF;">${teacher.first_name?.[0]||''}${teacher.last_name?.[0]||''}</div>`;

    const certsHtml = teacher.certificates?.length > 0 ? `
      <div class="section-title">🏆 Sertifikatlar</div>
      <table>
        <thead><tr><th>Nomi</th><th>Bergan tashkilot</th><th>Sana</th><th>Raqami</th><th>Muddat</th></tr></thead>
        <tbody>${teacher.certificates.map(c => `
          <tr>
            <td>${c.name}</td>
            <td>${c.issued_by||'—'}</td>
            <td>${c.issued_date||'—'}</td>
            <td>${c.certificate_number||'—'}</td>
            <td>${c.expire_date||'—'}</td>
          </tr>`).join('')}
        </tbody>
      </table>` : '';

    const content = `
      <!DOCTYPE html>
      <html lang="uz">
      <head>
        <meta charset="UTF-8"/>
        <title>${teacher.last_name} ${teacher.first_name} — Shaxsiy kartochka</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #1e293b;
            background: #fff;
            padding: 30px;
            font-size: 13px;
            line-height: 1.5;
          }

          /* HEADER */
          .header {
            display: flex;
            align-items: center;
            gap: 24px;
            background: linear-gradient(135deg, #1E40AF 0%, #3b82f6 100%);
            color: #fff;
            border-radius: 16px;
            padding: 24px 28px;
            margin-bottom: 24px;
          }
          .header-info h1 {
            font-size: 22px;
            font-weight: 800;
            margin-bottom: 4px;
          }
          .header-info .position {
            font-size: 14px;
            opacity: 0.85;
            margin-bottom: 10px;
          }
          .badges { display: flex; gap: 8px; flex-wrap: wrap; }
          .badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            background: rgba(255,255,255,0.2);
            color: #fff;
          }
          .badge-success { background: #22c55e; }

          /* SECTIONS */
          .section-title {
            font-size: 13px;
            font-weight: 800;
            text-transform: uppercase;
            color: #1E40AF;
            letter-spacing: 0.5px;
            padding: 10px 0 6px;
            border-bottom: 2px solid #dbeafe;
            margin: 20px 0 0;
          }

          /* GRID LAYOUT */
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0 32px;
          }

          /* ROWS */
          .row {
            display: flex;
            padding: 7px 0;
            border-bottom: 1px solid #f1f5f9;
          }
          .row-label {
            width: 180px;
            font-size: 11px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            flex-shrink: 0;
          }
          .row-value {
            font-size: 13px;
            font-weight: 600;
            color: #1e293b;
          }

          /* TABLE */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 12px;
          }
          th {
            background: #eff6ff;
            color: #1E40AF;
            padding: 8px 10px;
            text-align: left;
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
          }
          td {
            padding: 7px 10px;
            border-bottom: 1px solid #f1f5f9;
          }
          tr:nth-child(even) td { background: #fafafa; }

          /* MAKTAB nomi */
          .school-header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 2px solid #dbeafe;
          }
          .school-header h3 { font-size: 15px; color: #1E40AF; font-weight: 800; }
          .school-header p { font-size: 12px; color: #64748b; }

          /* FOOTER */
          .footer {
            margin-top: 32px;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #94a3b8;
          }

          @media print {
            body { padding: 15px; }
            .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>

        <div class="school-header">
          <h3>🏫 MAKTAB O'QITUVCHISI SHAXSIY KARTOCHKASI</h3>
          <p>Ushbu hujjat tizimdan avtomatik yaratilgan</p>
        </div>

        <div class="header">
          ${photoHtml}
          <div class="header-info">
            <h1>${teacher.last_name} ${teacher.first_name} ${teacher.middle_name||''}</h1>
            <div class="position">${teacher.position||'Lavozim kiritilmagan'} ${teacher.subject ? '• ' + teacher.subject : ''}</div>
            <div class="badges">
              ${teacher.experience_years ? `<span class="badge">⭐ ${teacher.experience_years} yillik staj</span>` : ''}
              ${teacher.employment_type ? `<span class="badge">${teacher.employment_type}</span>` : ''}
              <span class="badge ${teacher.status==='active' ? 'badge-success' : ''}">
                ${teacher.status==='active' ? '✅ Faol' : '❌ Nofaol'}
              </span>
            </div>
          </div>
        </div>

        <div class="grid-2">
          <div>
            <div class="section-title">👤 Shaxsiy ma'lumotlar</div>
            <div class="row"><div class="row-label">Tug'ilgan sana</div><div class="row-value">${teacher.birth_date||'—'}</div></div>
            <div class="row"><div class="row-label">Jinsi</div><div class="row-value">${teacher.gender||'—'}</div></div>
            <div class="row"><div class="row-label">Telefon</div><div class="row-value">${teacher.phone||'—'}</div></div>
            <div class="row"><div class="row-label">Email</div><div class="row-value">${teacher.email||'—'}</div></div>
            <div class="row"><div class="row-label">Manzil</div><div class="row-value">${teacher.address||'—'}</div></div>
          </div>
          <div>
            <div class="section-title">🪪 Pasport ma'lumotlari</div>
            <div class="row"><div class="row-label">Seriya / Raqam</div><div class="row-value">${teacher.passport_series||''} ${teacher.passport_number||'—'}</div></div>
            <div class="row"><div class="row-label">JSHSHIR</div><div class="row-value">${teacher.jshshir||'—'}</div></div>
            <div class="row"><div class="row-label">Bergan organ</div><div class="row-value">${teacher.passport_issued_by||'—'}</div></div>
            <div class="row"><div class="row-label">Berilgan sana</div><div class="row-value">${teacher.passport_issued_date||'—'}</div></div>
            <div class="row"><div class="row-label">Amal muddati</div><div class="row-value">${teacher.passport_expire_date||'—'}</div></div>
          </div>
        </div>

        <div class="grid-2">
          <div>
            <div class="section-title">💼 Ish ma'lumotlari</div>
            <div class="row"><div class="row-label">Lavozim</div><div class="row-value">${teacher.position||'—'}</div></div>
            <div class="row"><div class="row-label">Fan</div><div class="row-value">${teacher.subject||'—'}</div></div>
            <div class="row"><div class="row-label">Sinf rahbari</div><div class="row-value">${teacher.class_teacher||'—'}</div></div>
            <div class="row"><div class="row-label">Ishga kirgan</div><div class="row-value">${teacher.employment_date||'—'}</div></div>
            <div class="row"><div class="row-label">Ish turi</div><div class="row-value">${teacher.employment_type||'—'}</div></div>
            <div class="row"><div class="row-label">Stavka</div><div class="row-value">${teacher.salary_rate||'—'}</div></div>
            <div class="row"><div class="row-label">Staj</div><div class="row-value">${teacher.experience_years ? teacher.experience_years + ' yil' : '—'}</div></div>
          </div>
          <div>
            <div class="section-title">🎓 Ta'lim</div>
            <div class="row"><div class="row-label">Daraja</div><div class="row-value">${teacher.education_level||'—'}</div></div>
            <div class="row"><div class="row-label">Universitet</div><div class="row-value">${teacher.university||'—'}</div></div>
            <div class="row"><div class="row-label">Mutaxassislik</div><div class="row-value">${teacher.specialty||'—'}</div></div>
            <div class="row"><div class="row-label">Tamomlagan yili</div><div class="row-value">${teacher.graduation_year||'—'}</div></div>
            <div class="row"><div class="row-label">Diplom raqami</div><div class="row-value">${teacher.diploma_number||'—'}</div></div>
            <div class="row"><div class="row-label">Diplom sanasi</div><div class="row-value">${teacher.diploma_date||'—'}</div></div>
          </div>
        </div>

        ${certsHtml}

        <div class="footer">
          <span>🏫 Maktab O'qituvchilar Tizimi</span>
          <span>Chop etilgan: ${new Date().toLocaleDateString('uz-UZ', {year:'numeric',month:'long',day:'numeric'})}</span>
        </div>

      </body>
      </html>
    `;

    const w = window.open('', '_blank');
    w.document.write(content);
    w.document.close();
    setTimeout(() => w.print(), 500);
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
          <button className="btn btn-outline" onClick={handlePrint}>🖨️ PDF Chop etish</button>
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
          {key:'ish', label:"💼 Ish ma'lumotlari"},
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
              <div style={{marginTop:20, padding:'16px', background:'var(--bg-secondary,#f8fafc)', borderRadius:8}}>
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
                  padding:'14px 16px', background:'var(--bg-secondary,#f8fafc)', borderRadius:8, marginBottom:8, border:'1px solid var(--border)'
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
                      <a href={`${API_URL}/uploads/${c.file_path}`} target="_blank" rel="noreferrer" download className="btn btn-outline btn-sm">
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
                  padding:'14px 16px', background:'var(--bg-secondary,#f8fafc)', borderRadius:8, marginBottom:8, border:'1px solid var(--border)'
                }}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                    <div>
                      <div style={{fontWeight:700}}>{d.doc_name}</div>
                      <div style={{fontSize:12, color:'var(--text-muted)', marginTop:4}}>
                        <span style={{background:'#e0e7ff', color:'#4338ca', padding:'2px 8px', borderRadius:20, fontWeight:600, fontSize:11}}>{d.doc_type}</span>
                        <span style={{marginLeft:8}}>{new Date(d.upload_date).toLocaleDateString('uz-UZ')}</span>
                        {d.onid_number && <span style={{marginLeft:8, color:'var(--primary)', fontWeight:600}}>🪪 ONID: {d.onid_number}</span>}
                      </div>
                      {d.doc_type === 'ONID' && (d.onid_login || d.onid_password) && (
                        <div style={{marginTop:6, padding:'6px 10px', background:'#eff6ff', borderRadius:6, fontSize:12}}>
                          {d.onid_login && <span style={{marginRight:12}}>👤 Login: <b>{d.onid_login}</b></span>}
                          {d.onid_password && <span>🔑 Parol: <b>{d.onid_password}</b></span>}
                        </div>
                      )}
                    </div>
                    <div style={{display:'flex', gap:8}}>
                      {d.file_path && (
                        <a href={`${API_URL}/uploads/${d.file_path}`} target="_blank" rel="noreferrer" download className="btn btn-outline btn-sm">
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
                        <input className="form-control" value={docForm.onid_number} onChange={e=>setDocForm({...docForm, onid_number:e.target.value})}/>
                      </div>
                      <div className="form-group">
                        <label className="form-label">ONID Login</label>
                        <input className="form-control" value={docForm.onid_login} onChange={e=>setDocForm({...docForm, onid_login:e.target.value})}/>
                      </div>
                      <div className="form-group">
                        <label className="form-label">ONID Parol</label>
                        <input className="form-control" value={docForm.onid_password} onChange={e=>setDocForm({...docForm, onid_password:e.target.value})}/>
                      </div>
                    </>)}
                    <div className="form-group">
                      <label className="form-label">Fayllar (PDF yoki rasm)</label>
                      <input type="file" className="form-control" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={e => setDocFiles(Array.from(e.target.files))}/>
                      {docFiles.length > 0 && <div style={{fontSize:12, color:'var(--text-muted)', marginTop:4}}>✅ {docFiles.length} ta fayl tanlandi</div>}
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