import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import API_URL from '../config';

const EMPTY = {
  first_name:'', last_name:'', middle_name:'', birth_date:'', gender:'',
  passport_series:'', passport_number:'', passport_issued_by:'', passport_issued_date:'', passport_expire_date:'',
  jshshir:'', phone:'', email:'', address:'',
  position:'', subject:'', class_teacher:'', employment_date:'', employment_type:'Asosiy', salary_rate:'1.0', experience_years:'',
  labor_book_number:'', labor_book_date:'', previous_workplaces:'',
  education_level:'Oliy', university:'', specialty:'', graduation_year:'', diploma_number:'', diploma_date:'',
  status:'active', notes:''
};

const SUBJECTS = [
  'Matematika','Fizika','Kimyo','Biologiya','Tarix','Geografiya',
  'Adabiyot','Ona tili','Ingliz tili','Rus tili','Informatika',
  'Chizmachilik','Jismoniy tarbiya','Musiqa',"Tasviriy san'at",
  "Mehnat ta'limi","Boshlang'ich ta'lim",'Qoraqalpoq tili','Nemis tili','Turkman tili',
  'Fransuz tili','Boshqa'
];

const POSITIONS = [
  'Direktor',
  "O'quv ishlari bo'yicha direktor o'rinbosari",
  "Tarbiya ishlari bo'yicha direktor o'rinbosari",
  "Xo'jalik ishlari bo'yicha direktor o'rinbosari",
  "Matematika o'qituvchisi",
  "Fizika o'qituvchisi",
  "Kimyo o'qituvchisi",
  "Biologiya o'qituvchisi",
  "Tarix o'qituvchisi",
  "Geografiya o'qituvchisi",
  "Adabiyot o'qituvchisi",
  "Ona tili o'qituvchisi",
  "Ingliz tili o'qituvchisi",
  "Rus tili o'qituvchisi",
  "Qoraqalpoq tili o'qituvchisi",
  "Nemis tili o'qituvchisi",
  "Turkman tili o'qituvchisi",
  "Fransuz tili o'qituvchisi",
  "Informatika o'qituvchisi",
  "Boshlang'ich sinf o'qituvchisi",
  "Jismoniy tarbiya o'qituvchisi",
  "Musiqa o'qituvchisi",
  "Tasviriy san'at o'qituvchisi",
  "Mehnat ta'limi o'qituvchisi",
  "Sinf rahbari",
  "Psixolog",
  "Ijtimoiy pedagog",
  "Kutubxonachi",
  "Laborant",
  "Buxgalter",
  "Kotib",
  "Boshqa"
];

const F = ({ label, required, children, col }) => (
  <div className="form-group" style={col ? {gridColumn:`span ${col}`} : {}}>
    <label className="form-label">{label} {required && <span className="req">*</span>}</label>
    {children}
  </div>
);

export default function TeacherForm() {
  const [form, setForm] = useState(EMPTY);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [customSubject, setCustomSubject] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      axios.get(`/api/teachers/${id}`).then(r => {
        const d = r.data;
        setForm({...EMPTY, ...d});
        if (d.photo) setPhotoPreview(`${API_URL}/uploads/${d.photo}`);
        // Agar saqlangan fan ro'yxatda yo'q bo'lsa, "Boshqa" rejimini yoqamiz
        if (d.subject && !SUBJECTS.slice(0, -1).includes(d.subject)) {
          setCustomSubject(true);
        }
      });
    }
  }, [id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubjectChange = (e) => {
    const val = e.target.value;
    if (val === 'Boshqa') {
      setCustomSubject(true);
      set('subject', '');
    } else {
      setCustomSubject(false);
      set('subject', val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, v); });
      if (photo) fd.append('photo', photo);
      if (isEdit) {
        await axios.put(`/api/teachers/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setSuccess("Ma'lumotlar muvaffaqiyatli yangilandi! ✅");
        setTimeout(() => navigate(`/teachers/${id}`), 1500);
      } else {
        const r = await axios.post('/api/teachers', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setSuccess("O'qituvchi muvaffaqiyatli qo'shildi! ✅");
        setTimeout(() => navigate(`/teachers/${r.data.id}`), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-danger">⚠️ {error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* SHAXSIY */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-header"><span className="card-title">👤 Shaxsiy ma'lumotlar</span></div>
        <div className="card-body">
          <div style={{display:'flex', gap:24, alignItems:'flex-start', marginBottom:20}}>
            <div style={{textAlign:'center'}}>
              <div style={{
                width:100, height:100, borderRadius:12, overflow:'hidden',
                background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:40, border:'2px dashed var(--border)', marginBottom:8
              }}>
                {photoPreview ? <img src={photoPreview} alt="foto" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : '📷'}
              </div>
              <label className="btn btn-outline btn-sm" style={{cursor:'pointer'}}>
                📂 Foto yuklash
                <input type="file" accept="image/*" style={{display:'none'}} onChange={handlePhoto}/>
              </label>
            </div>
            <div style={{flex:1}}>
              <div className="form-grid form-grid-3">
                <F label="Familiya" required><input className="form-control" required value={form.last_name} onChange={e=>set('last_name',e.target.value)}/></F>
                <F label="Ism" required><input className="form-control" required value={form.first_name} onChange={e=>set('first_name',e.target.value)}/></F>
                <F label="Otasining ismi"><input className="form-control" value={form.middle_name} onChange={e=>set('middle_name',e.target.value)}/></F>
                <F label="Tug'ilgan sana"><input type="text" className="form-control" placeholder="dd/mm/yyyy" value={form.birth_date} onChange={e=>set('birth_date',e.target.value)}/></F>
                <F label="Jinsi">
                  <select className="form-control" value={form.gender} onChange={e=>set('gender',e.target.value)}>
                    <option value="">Tanlang</option>
                    <option value="Erkak">Erkak</option>
                    <option value="Ayol">Ayol</option>
                  </select>
                </F>
                <F label="Holati">
                  <select className="form-control" value={form.status} onChange={e=>set('status',e.target.value)}>
                    <option value="active">Faol</option>
                    <option value="inactive">Nofaol</option>
                  </select>
                </F>
              </div>
            </div>
          </div>
          <div className="form-grid form-grid-3">
            <F label="Telefon"><input className="form-control" placeholder="+998 90 000 00 00" value={form.phone} onChange={e=>set('phone',e.target.value)}/></F>
            <F label="Email"><input type="email" className="form-control" value={form.email} onChange={e=>set('email',e.target.value)}/></F>
            <F label="Manzil" col={1}><input className="form-control" value={form.address} onChange={e=>set('address',e.target.value)}/></F>
          </div>
        </div>
      </div>

      {/* PASPORT */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-header"><span className="card-title">🪪 Pasport / ID ma'lumotlari</span></div>
        <div className="card-body">
          <div className="form-grid form-grid-3">
            <F label="Pasport seriyasi"><input className="form-control" placeholder="AA" value={form.passport_series} onChange={e=>set('passport_series',e.target.value)}/></F>
            <F label="Pasport raqami"><input className="form-control" placeholder="1234567" value={form.passport_number} onChange={e=>set('passport_number',e.target.value)}/></F>
            <F label="JSHSHIR"><input className="form-control" placeholder="14 raqam" maxLength={14} value={form.jshshir} onChange={e=>set('jshshir',e.target.value)}/></F>
            <F label="Kim tomonidan berilgan" col={3}><input className="form-control" value={form.passport_issued_by} onChange={e=>set('passport_issued_by',e.target.value)}/></F>
            <F label="Berilgan sana"><input type="date" className="form-control" value={form.passport_issued_date} onChange={e=>set('passport_issued_date',e.target.value)}/></F>
            <F label="Amal qilish muddati"><input type="date" className="form-control" value={form.passport_expire_date} onChange={e=>set('passport_expire_date',e.target.value)}/></F>
          </div>
        </div>
      </div>

      {/* ISH */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-header"><span className="card-title">💼 Ish ma'lumotlari</span></div>
        <div className="card-body">
          <div className="form-grid form-grid-3">
            <F label="Lavozim">
              <select className="form-control" value={form.position} onChange={e=>set('position',e.target.value)}>
                <option value="">Tanlang</option>
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </F>
            <F label="Fan">
              <select
                className="form-control"
                value={customSubject ? 'Boshqa' : form.subject}
                onChange={handleSubjectChange}
              >
                <option value="">Tanlang</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {customSubject && (
                <input
                  className="form-control"
                  style={{marginTop: 8}}
                  placeholder="Fan nomini yozing..."
                  value={form.subject}
                  onChange={e => set('subject', e.target.value)}
                />
              )}
            </F>
            <F label="Sinf rahbari (sinf nomi)"><input className="form-control" placeholder="Masalan: 9-A" value={form.class_teacher} onChange={e=>set('class_teacher',e.target.value)}/></F>
            <F label="Ishga kirgan sana"><input type="date" className="form-control" value={form.employment_date} onChange={e=>set('employment_date',e.target.value)}/></F>
            <F label="Ish turi">
              <select className="form-control" value={form.employment_type} onChange={e=>set('employment_type',e.target.value)}>
                <option value="Asosiy">Asosiy</option>
                <option value="0.5 stavka">0.5 stavka</option>
                <option value="0.25 stavka">0.25 stavka</option>
                <option value="Qo'shimcha">Qo'shimcha</option>
                <option value="Shartnoma">Shartnoma</option>
              </select>
            </F>
            <F label="Stavka">
              <select className="form-control" value={form.salary_rate} onChange={e=>set('salary_rate',e.target.value)}>
                <option value="1.0">1.0</option>
                <option value="1.25">1.25</option>
                <option value="1.5">1.5</option>
                <option value="0.75">0.75</option>
                <option value="0.5">0.5</option>
                <option value="0.25">0.25</option>
              </select>
            </F>
            <F label="Ish staji (yil)"><input type="number" className="form-control" min="0" max="50" value={form.experience_years} onChange={e=>set('experience_years',e.target.value)}/></F>
          </div>
          <div style={{marginTop:16, padding:16, background:'#f8fafc', borderRadius:8}}>
            <div style={{fontWeight:700, marginBottom:12, fontSize:13, color:'var(--text-muted)'}}>📋 Mehnat daftarchasi</div>
            <div className="form-grid form-grid-3">
              <F label="Daftarcha raqami"><input className="form-control" value={form.labor_book_number} onChange={e=>set('labor_book_number',e.target.value)}/></F>
              <F label="Berilgan sana"><input type="date" className="form-control" value={form.labor_book_date} onChange={e=>set('labor_book_date',e.target.value)}/></F>
              <F label="Oldingi ish joylari" col={3}><textarea className="form-control" rows={2} value={form.previous_workplaces} onChange={e=>set('previous_workplaces',e.target.value)}/></F>
            </div>
          </div>
        </div>
      </div>

      {/* TA'LIM */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-header"><span className="card-title">🎓 Ta'lim / Diplom</span></div>
        <div className="card-body">
          <div className="form-grid form-grid-3">
            <F label="Ta'lim darajasi">
              <select className="form-control" value={form.education_level} onChange={e=>set('education_level',e.target.value)}>
                <option value="Oliy">Oliy</option>
                <option value="O'rta maxsus">O'rta maxsus</option>
                <option value="Magistratura">Magistratura</option>
                <option value="O'rta">O'rta</option>
              </select>
            </F>
            <F label="Oliy o'quv yurti"><input className="form-control" value={form.university} onChange={e=>set('university',e.target.value)}/></F>
            <F label="Mutaxassislik"><input className="form-control" value={form.specialty} onChange={e=>set('specialty',e.target.value)}/></F>
            <F label="Tamomlagan yili"><input className="form-control" placeholder="2005" value={form.graduation_year} onChange={e=>set('graduation_year',e.target.value)}/></F>
            <F label="Diplom raqami"><input className="form-control" value={form.diploma_number} onChange={e=>set('diploma_number',e.target.value)}/></F>
            <F label="Diplom berilgan sana"><input type="date" className="form-control" value={form.diploma_date} onChange={e=>set('diploma_date',e.target.value)}/></F>
          </div>
        </div>
      </div>

      {/* IZOH */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-header"><span className="card-title">📝 Izoh</span></div>
        <div className="card-body">
          <textarea className="form-control" rows={3} value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Qo'shimcha ma'lumotlar..."/>
        </div>
      </div>

      <div style={{display:'flex', gap:10}}>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? '⏳ Saqlanmoqda...' : isEdit ? '💾 Yangilash' : "➕ Qo'shish"}
        </button>
        <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Bekor qilish</button>
      </div>
    </form>
  );
}