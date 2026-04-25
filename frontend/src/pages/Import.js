import React, { useState } from 'react';
import axios from 'axios';

const TEMPLATE_HEADERS = [
  'last_name','first_name','middle_name','birth_date','gender',
  'passport_series','passport_number','passport_issued_by','passport_issued_date','passport_expire_date',
  'jshshir','phone','email','address','position','subject','class_teacher',
  'employment_date','employment_type','salary_rate','experience_years',
  'labor_book_number','labor_book_date','previous_workplaces',
  'education_level','university','specialty','graduation_year',
  'diploma_number','diploma_date','status','notes'
];

const TEMPLATE_LABELS = {
  last_name: 'Familiya',
  first_name: 'Ism',
  middle_name: 'Otasining ismi',
  birth_date: 'Tug\'ilgan sana (YYYY-MM-DD)',
  gender: 'Jinsi (Erkak/Ayol)',
  passport_series: 'Pasport seriyasi (AA)',
  passport_number: 'Pasport raqami (1234567)',
  passport_issued_by: 'Kim bergan',
  passport_issued_date: 'Berilgan sana (YYYY-MM-DD)',
  passport_expire_date: 'Amal muddati (YYYY-MM-DD)',
  jshshir: 'JSHSHIR (14 raqam)',
  phone: 'Telefon (+998901234567)',
  email: 'Email',
  address: 'Manzil',
  position: 'Lavozim',
  subject: 'Fan',
  class_teacher: 'Sinf rahbari (5-A)',
  employment_date: 'Ishga kirgan sana (YYYY-MM-DD)',
  employment_type: 'Ish turi (Asosiy/O\'rindosh/Shartnoma)',
  salary_rate: 'Stavka (0.5/0.75/1.0/1.25/1.5)',
  experience_years: 'Staj (yil)',
  labor_book_number: 'Mehnat daftarcha raqami',
  labor_book_date: 'Daftarcha berilgan sana (YYYY-MM-DD)',
  previous_workplaces: 'Oldingi ish joylari',
  education_level: 'Ta\'lim (Oliy/O\'rta maxsus/O\'rta)',
  university: 'Oliy o\'quv yurti',
  specialty: 'Mutaxassislik',
  graduation_year: 'Tamomlagan yili',
  diploma_number: 'Diplom raqami',
  diploma_date: 'Diplom berilgan sana (YYYY-MM-DD)',
  status: 'Holati (active/inactive)',
  notes: 'Izoh'
};

// CSV shablon yaratish
const downloadTemplate = () => {
  const headers = TEMPLATE_HEADERS.join(',');
  const example = [
    'Yusupov','Ali','Karimovich','1985-03-15','Erkak',
    'AA','1234567','Toshkent IIB','2018-01-10','2028-01-10',
    '28503150001234','+998901234567','ali@maktab.uz','Toshkent sh.',
    'Matematika o\'qituvchisi','Matematika','5-A',
    '2010-09-01','Asosiy','1.0','14',
    'TR-001234','2010-09-01','2005-2010: 45-maktab',
    'Oliy','NUUz','Matematika','2005',
    'D-2005-1234','2005-06-15','active','Izoh'
  ].join(',');

  const csv = `${headers}\n${example}`;
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ustozlar_shablon.csv';
  a.click();
  URL.revokeObjectURL(url);
};

export default function Import() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleImport = async () => {
    if (!file) { setError('Fayl tanlanmagan!'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await axios.post('/api/import/csv', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(r.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <h2 style={{margin:0, fontSize:22, fontWeight:800}}>📥 Excel/CSV dan Import</h2>
      </div>

      {/* Qadamlar */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-header"><span className="card-title">📋 Qanday ishlaydi?</span></div>
        <div className="card-body">
          <div style={{display:'flex', gap:20, flexWrap:'wrap'}}>
            {[
              { n:'1', icon:'📥', title:'Shablon yuklab oling', desc:'CSV shablon faylni yuklab oling' },
              { n:'2', icon:'✏️', title:'Excel da oching', desc:'Excel yoki Google Sheets da oching va ma\'lumotlarni to\'ldiring' },
              { n:'3', icon:'💾', title:'CSV sifatida saqlang', desc:'Faylni CSV formatda saqlang' },
              { n:'4', icon:'🚀', title:'Tizimga yuklang', desc:'Faylni tanlang va Import tugmasini bosing' },
            ].map(s => (
              <div key={s.n} style={{
                flex:1, minWidth:180, padding:16, borderRadius:10,
                background:'linear-gradient(135deg,#f8fafc,#f1f5f9)',
                border:'1px solid var(--border)', textAlign:'center'
              }}>
                <div style={{fontSize:32, marginBottom:8}}>{s.icon}</div>
                <div style={{
                  width:24, height:24, borderRadius:'50%', background:'var(--primary)',
                  color:'#fff', fontSize:12, fontWeight:800,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  margin:'0 auto 8px'
                }}>{s.n}</div>
                <div style={{fontWeight:700, marginBottom:4}}>{s.title}</div>
                <div style={{fontSize:12, color:'var(--text-muted)'}}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shablon */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-header"><span className="card-title">📄 CSV Shablon</span></div>
        <div className="card-body">
          <p style={{color:'var(--text-muted)', marginBottom:16}}>
            Quyidagi tugmani bosib shablon faylni yuklab oling. Faylda barcha ustunlar va 1 ta namuna qator bor.
          </p>
          <button className="btn btn-accent" onClick={downloadTemplate}>
            📥 Shablon yuklab olish (CSV)
          </button>

          <div style={{marginTop:20}}>
            <div style={{fontWeight:700, marginBottom:10}}>Ustunlar ro'yxati:</div>
            <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
              {TEMPLATE_HEADERS.map(h => (
                <div key={h} style={{
                  padding:'4px 10px', borderRadius:20,
                  background:'#e0e7ff', color:'#4338ca',
                  fontSize:12, fontWeight:600
                }}>
                  {TEMPLATE_LABELS[h]}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Yuklash */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-header"><span className="card-title">🚀 Faylni yuklash</span></div>
        <div className="card-body">
          {error && <div className="alert alert-danger" style={{marginBottom:16}}>⚠️ {error}</div>}

          {result && (
            <div style={{
              padding:16, borderRadius:10, marginBottom:16,
              background: result.errors?.length > 0 ? '#fffbeb' : '#f0fdf4',
              border: `1px solid ${result.errors?.length > 0 ? '#fbbf24' : '#86efac'}`
            }}>
              <div style={{fontWeight:800, fontSize:16, marginBottom:8}}>
                {result.errors?.length > 0 ? '⚠️' : '✅'} {result.message}
              </div>
              <div style={{fontSize:14, color:'var(--text-muted)'}}>
                Muvaffaqiyatli: <strong>{result.imported}</strong> ta ustoz
              </div>
              {result.errors?.length > 0 && (
                <div style={{marginTop:10}}>
                  <div style={{fontWeight:600, marginBottom:4}}>Xatolar:</div>
                  {result.errors.map((e, i) => (
                    <div key={i} style={{fontSize:12, color:'#dc2626'}}>• {e}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{
            border:'2px dashed var(--border)', borderRadius:10, padding:30,
            textAlign:'center', marginBottom:16,
            background: file ? '#f0fdf4' : '#fafbfc'
          }}>
            <div style={{fontSize:40, marginBottom:8}}>{file ? '✅' : '📂'}</div>
            <div style={{fontWeight:700, marginBottom:8}}>
              {file ? file.name : 'CSV faylni tanlang'}
            </div>
            <div style={{fontSize:12, color:'var(--text-muted)', marginBottom:16}}>
              Faqat .csv formatdagi fayllar qabul qilinadi
            </div>
            <label className="btn btn-outline" style={{cursor:'pointer'}}>
              📂 Fayl tanlash
              <input type="file" accept=".csv" style={{display:'none'}}
                onChange={e => { setFile(e.target.files[0]); setResult(null); setError(''); }}/>
            </label>
          </div>

          <button
            className="btn btn-primary btn-lg"
            onClick={handleImport}
            disabled={!file || loading}
          >
            {loading ? '⏳ Yuklanmoqda...' : '🚀 Importni boshlash'}
          </button>
        </div>
      </div>

      {/* Eslatma */}
      <div className="card">
        <div className="card-header"><span className="card-title">⚠️ Muhim eslatmalar</span></div>
        <div className="card-body">
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {[
              'Fayl CSV formatda bo\'lishi shart (.csv)',
              'Sana formati: YYYY-MM-DD (masalan: 1985-03-15)',
              'Jinsi: "Erkak" yoki "Ayol" deb yozing',
              'Holati: "active" yoki "inactive" deb yozing',
              'Ish turi: "Asosiy", "O\'rindosh" yoki "Shartnoma"',
              'Stavka: 0.5, 0.75, 1.0, 1.25 yoki 1.5',
              'Familiya va Ism — majburiy maydonlar',
              'Excel da saqlayotganda: Fayl → Saqlash → CSV (vergul bilan ajratilgan) formatini tanlang',
            ].map((t, i) => (
              <div key={i} style={{display:'flex', alignItems:'flex-start', gap:8, fontSize:14}}>
                <span style={{color:'var(--primary)', fontWeight:700, flexShrink:0}}>•</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
