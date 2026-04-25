import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EMPTY = {
  first_name:'', last_name:'', middle_name:'', birth_date:'', gender:'',
  passport_series:'', passport_number:'', passport_issued_by:'', passport_issued_date:'', passport_expire_date:'',
  jshshir:'', phone:'', email:'', address:'',
  position:'', subject:'', class_teacher:'', employment_date:'', employment_type:'Asosiy', salary_rate:'1.0', experience_years:'',
  labor_book_number:'', labor_book_date:'', previous_workplaces:'',
  education_level:'Oliy', university:'', specialty:'', graduation_year:'', diploma_number:'', diploma_date:'',
  status:'active', notes:''
};

const SUBJECTS = ['Matematika','Fizika','Kimyo','Biologiya','Tarix','Geografiya','Adabiyot','Ona tili','Ingliz tili','Rus tili','Informatika','Chizmachilik','Jismoniy tarbiya','Musiqa',"Tasviriy san'at","Mehnat ta'limi",'Boshqa'];
const POSITIONS = ["Matematika o'qituvchisi","Fizika o'qituvchisi","Kimyo o'qituvchisi","Biologiya o'qituvchisi","Tarix o'qituvchisi","Geografiya o'qituvchisi","Adabiyot o'qituvchisi","Ona tili o'qituvchisi","Ingliz tili o'qituvchisi","Rus tili o'qituvchisi","Informatika o'qituvchisi","Boshlang'ich sinf o'qituvchisi","Jismoniy tarbiya o'qituvchisi","Sinf rahbari","O'quv ishlari bo'yicha direktor o'rinbosari","Tarbiya ishlari bo'yicha direktor o'rinbosari","Psixolog","Boshqa"];

// F komponenti TeacherForm TASHQARISIDA — fokus muammosini hal qiladi
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
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      axios.get(`/api/teachers/${id}`).then(r => {
        const d = r.data;
        setForm({...EMPTY, ...d});
        if (d.photo) setPhotoPreview(`http://localhost:5000/uploads/${d.photo}`);
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
                📤 Foto yuklash
                <input type="file" accept="image/*" style={{display:'none'}} onChange={handlePhoto}/>
              </label>
            </div>
            <div style={{flex:1}}>
              <div className="form-grid form-grid-3" style={{gap:12}}>
                <F label="Familiya" required>
                  <input className="form-control" value={form.last_name || ''}
                    onChange={e => set('last_name', e.target.value)} required/>
                </F>
                <F label="Ism" required>
                  <input className="form-control" value={form.first_name || ''}
                    onChange={e => set('first_name', e.target.value)} required/>
                </F>
                <F label="Otasining ismi">
                  <input className="form-control" value={form.middle_name || ''}
                    onChange={e => set('middle_name', e.target.value)}/>
                </F>
                <F label="Tug'ilgan sana">
                  <input className="form-control" type="date" value={form.birth_date || ''}
                    onChange={e => set('birth_date', e.target.value)}/>
                </F>
                <F label="Jinsi">
                  <select className="form-control" value={form.gender || ''} onChange={e => set('gender', e.target.value)}>
                    <option value="">Tanlang</option>
                    <option value="Erkak">Erkak</option>
                    <option value="Ayol">Ayol</option>
                  </select>
                </F>
                <F label="Holati">
                  <select className="form-control" value={form.status || 'active'} onChange={e => set('status', e.target.value)}>
                    <option value="active">Faol</option>
                    <option value="inactive">Nofaol</option>
                  </select>
                </F>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PASPORT */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-header"><span className="card-title">🪪 Pasport ma'lumotlari</span></div>
        <div className="card-body">
          <div className="form-grid form-grid-3" style={{gap:12}}>
            <F label="Pasport seriyasi">
              <input className="form-control" value={form.passport_series || ''} maxLength={2}
                style={{textTransform:'uppercase'}} onChange={e => set('passport_series', e.target.value.toUpperCase())} placeholder="AA"/>
            </F>
            <F label="Pasport raqami">
              <input className="form-control" value={form.passport_number || ''} maxLength={7}
                onChange={e => set('passport_number', e.target.value)} placeholder="1234567"/>
            </F>
            <F label="JSHSHIR (14 raqam)">
              <input className="form-control" value={form.jshshir || ''} maxLength={14}
                onChange={e => set('jshshir', e.target.value.replace(/\D/g,''))} placeholder="12345678901234"/>
            </F>
            <F label="Kim tomonidan berilgan" col={3}>
              <input className="form-control" value={form.passport_issued_by || ''}
                onChange={e => set('passport_issued_by', e.target.value)} placeholder="Toshkent sh. IIB"/>
            </F>
            <F label="Berilgan sana">
              <input className="form-control" type="date" value={form.passport_issued_date || ''}
                onChange={e => set('passport_issued_date', e.target.value)}/>
            </F>
            <F label="Amal qilish muddati">
              <input className="form-control" type="date" value={form.passport_expire_date || ''}
                onChange={e => set('passport_expire_date', e.target.value)}/>
            </F>
          </div>
        </div>
      </div>

      {/* KONTAKT */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-header"><span className="card-title">📞 Kontakt ma'lumotlari</span></div>
        <div className="card-body">
          <div className="form-grid form-grid-3" style={{gap:12}}>
            <F label="Telefon">
              <input className="form-control" value={form.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="+998901234567"/>
            </F>
            <F label="Email">
              <input className="form-control" type="email" value={form.email || ''} onChange={e => set('email', e.target.value)}/>
            </F>
            <F label="Yashash manzili" col={3}>
              <input className="form-control" value={form.address || ''} onChange={e => set('address', e.target.value)} placeholder="Viloyat, shahar, ko'cha..."/>
            </F>
          </div>
        </div>
      </div>

      {/* ISH */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-header"><span className="card-title">💼 Ish ma'lumotlari</span></div>
        <div className="card-body">
          <div className="form-grid form-grid-3" style={{gap:12}}>
            <F label="Lavozimi">
              <select className="form-control" value={form.position || ''} onChange={e => set('position', e.target.value)}>
                <option value="">Tanlang</option>
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </F>
            <F label="Fani">
              <select className="form-control" value={form.subject || ''} onChange={e => set('subject', e.target.value)}>
                <option value="">Tanlang</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </F>
            <F label="Sinf rahbari">
              <input className="form-control" value={form.class_teacher || ''} onChange={e => set('class_teacher', e.target.value)} placeholder="5-A"/>
            </F>
            <F label="Ishga kirgan sana">
              <input className="form-control" type="date" value={form.employment_date || ''} onChange={e => set('employment_date', e.target.value)}/>
            </F>
            <F label="Ish turi">
              <select className="form-control" value={form.employment_type || 'Asosiy'} onChange={e => set('employment_type', e.target.value)}>
                <option value="Asosiy">Asosiy</option>
                <option value="O'rindosh">O'rindosh</option>
                <option value="Shartnoma">Shartnoma</option>
              </select>
            </F>
            <F label="Stavka">
              <select className="form-control" value={form.salary_rate || '1.0'} onChange={e => set('salary_rate', e.target.value)}>
                <option value="0.5">0.5 stavka</option>
                <option value="0.75">0.75 stavka</option>
                <option value="1.0">1.0 stavka</option>
                <option value="1.25">1.25 stavka</option>
                <option value="1.5">1.5 stavka</option>
              </select>
            </F>
            <F label="Ish staji (yil)">
              <input className="form-control" type="number" value={form.experience_years || ''} onChange={e => set('experience_years', e.target.value)}/>
            </F>
          </div>
        </div>
      </div>

      {/* MEHNAT */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-header"><span className="card-title">📕 Mehnat daftarchasi</span></div>
        <div className="card-body">
          <div className="form-grid form-grid-3" style={{gap:12}}>
            <F label="Daftarcha raqami">
              <input className="form-control" value={form.labor_book_number || ''} onChange={e => set('labor_book_number', e.target.value)}/>
            </F>
            <F label="Berilgan sana">
              <input className="form-control" type="date" value={form.labor_book_date || ''} onChange={e => set('labor_book_date', e.target.value)}/>
            </F>
            <F label="Oldingi ish joylari" col={3}>
              <textarea className="form-control" value={form.previous_workplaces || ''}
                onChange={e => set('previous_workplaces', e.target.value)}
                placeholder="2010-2015: 45-maktab, Toshkent&#10;2015-2020: 12-maktab, Samarqand"/>
            </F>
          </div>
        </div>
      </div>

      {/* DIPLOM */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-header"><span className="card-title">🎓 Ta'lim va diplom</span></div>
        <div className="card-body">
          <div className="form-grid form-grid-3" style={{gap:12}}>
            <F label="Ta'lim darajasi">
              <select className="form-control" value={form.education_level || 'Oliy'} onChange={e => set('education_level', e.target.value)}>
                <option value="O'rta">O'rta</option>
                <option value="O'rta maxsus">O'rta maxsus</option>
                <option value="Oliy">Oliy</option>
                <option value="Magistr">Magistr</option>
                <option value="Doktorant">Doktorant</option>
              </select>
            </F>
            <F label="Oliy o'quv yurti">
              <input className="form-control" value={form.university || ''} onChange={e => set('university', e.target.value)}/>
            </F>
            <F label="Mutaxassislik">
              <input className="form-control" value={form.specialty || ''} onChange={e => set('specialty', e.target.value)}/>
            </F>
            <F label="Tamomlagan yili">
              <input className="form-control" type="number" value={form.graduation_year || ''} onChange={e => set('graduation_year', e.target.value)}/>
            </F>
            <F label="Diplom raqami">
              <input className="form-control" value={form.diploma_number || ''} onChange={e => set('diploma_number', e.target.value)}/>
            </F>
            <F label="Diplom berilgan sana">
              <input className="form-control" type="date" value={form.diploma_date || ''} onChange={e => set('diploma_date', e.target.value)}/>
            </F>
          </div>
        </div>
      </div>

      {/* IZOH */}
      <div className="card" style={{marginBottom:24}}>
        <div className="card-header"><span className="card-title">📝 Qo'shimcha izoh</span></div>
        <div className="card-body">
          <textarea className="form-control" value={form.notes || ''}
            onChange={e => set('notes', e.target.value)}
            placeholder="Qo'shimcha ma'lumotlar..."/>
        </div>
      </div>

      <div style={{display:'flex', gap:12}}>
        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          {loading ? '⏳ Saqlanmoqda...' : isEdit ? '💾 Yangilash' : "➕ Qo'shish"}
        </button>
        <button type="button" className="btn btn-outline btn-lg" onClick={() => navigate(-1)}>
          ❌ Bekor qilish
        </button>
      </div>
    </form>
  );
}
