const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const auth = require('../middleware/auth');

// Uploads papkasi — doimiy saqlash uchun
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname))
});
const upload = multer({ storage });

const FIELDS = ['first_name','last_name','middle_name','birth_date','gender','photo',
  'passport_series','passport_number','passport_issued_by','passport_issued_date','passport_expire_date',
  'jshshir','phone','email','address','position','subject','class_teacher','employment_date',
  'employment_type','salary_rate','experience_years','labor_book_number','labor_book_date',
  'previous_workplaces','education_level','university','specialty','graduation_year',
  'diploma_number','diploma_date','status','notes'];

// GET all
router.get('/', auth, async (req, res) => {
  try {
    const { search, status } = req.query;
    let sql = 'SELECT * FROM teachers WHERE 1=1';
    const p = [];
    if (search) {
      sql += ' AND (first_name LIKE ? OR last_name LIKE ? OR jshshir LIKE ? OR passport_number LIKE ?)';
      p.push(`%${search}%`,`%${search}%`,`%${search}%`,`%${search}%`);
    }
    if (status) { sql += ' AND status=?'; p.push(status); }
    sql += ' ORDER BY last_name ASC';
    res.json(await db.all_p(sql, p));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET one
router.get('/:id', auth, async (req, res) => {
  try {
    const t = await db.get_p('SELECT * FROM teachers WHERE id=?', [req.params.id]);
    if (!t) return res.status(404).json({ message: "O'qituvchi topilmadi" });
    t.certificates = await db.all_p('SELECT * FROM certificates WHERE teacher_id=?', [req.params.id]);
    t.documents = await db.all_p('SELECT * FROM documents WHERE teacher_id=?', [req.params.id]);
    res.json(t);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST create
router.post('/', auth, upload.single('photo'), async (req, res) => {
  try {
    const d = { ...req.body };
    if (req.file) d.photo = req.file.filename;
    const cols = FIELDS.filter(f => d[f] !== undefined && d[f] !== '');
    const sql = `INSERT INTO teachers (${cols.join(',')}) VALUES (${cols.map(()=>'?').join(',')})`;
    const result = await db.run_p(sql, cols.map(c => d[c]));
    res.json({ id: result.lastID, message: "O'qituvchi qo'shildi" });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// PUT update
router.put('/:id', auth, upload.single('photo'), async (req, res) => {
  try {
    const d = { ...req.body };
    if (req.file) d.photo = req.file.filename;
    const cols = FIELDS.filter(f => f !== 'photo' || d.photo);
    const setClauses = cols.filter(c=>c!=='id').map(c=>`${c}=?`).join(',');
    const vals = cols.filter(c=>c!=='id').map(c=>d[c]||null);
    vals.push(req.params.id);
    await db.run_p(`UPDATE teachers SET ${setClauses}, updated_at=CURRENT_TIMESTAMP WHERE id=?`, vals);
    res.json({ message: "Ma'lumotlar yangilandi" });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// DELETE
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.run_p('DELETE FROM teachers WHERE id=?', [req.params.id]);
    res.json({ message: "O'qituvchi o'chirildi" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Certificates
router.post('/:id/certificates', auth, upload.single('file'), async (req, res) => {
  try {
    const { name, issued_by, issued_date, expire_date, certificate_number } = req.body;
    const file_path = req.file?.filename || null;
    await db.run_p(
      'INSERT INTO certificates (teacher_id,name,issued_by,issued_date,expire_date,certificate_number,file_path) VALUES (?,?,?,?,?,?,?)',
      [req.params.id, name, issued_by, issued_date, expire_date, certificate_number, file_path]
    );
    res.json({ message: "Sertifikat qo'shildi" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/:id/certificates/:cid', auth, async (req, res) => {
  try {
    await db.run_p('DELETE FROM certificates WHERE id=? AND teacher_id=?', [req.params.cid, req.params.id]);
    res.json({ message: "Sertifikat o'chirildi" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Documents — ONID login/parol qo'shildi
router.post('/:id/documents', auth, upload.fields([
  { name: 'file', maxCount: 10 }
]), async (req, res) => {
  try {
    const { doc_type, doc_name, onid_number, onid_login, onid_password } = req.body;
    const files = req.files?.file || [];
    if (files.length === 0) {
      await db.run_p(
        'INSERT INTO documents (teacher_id,doc_type,doc_name,file_path,onid_number,onid_login,onid_password) VALUES (?,?,?,?,?,?,?)',
        [req.params.id, doc_type, doc_name, null, onid_number||null, onid_login||null, onid_password||null]
      );
    } else {
      for (const f of files) {
        await db.run_p(
          'INSERT INTO documents (teacher_id,doc_type,doc_name,file_path,onid_number,onid_login,onid_password) VALUES (?,?,?,?,?,?,?)',
          [req.params.id, doc_type, doc_name, f.filename, onid_number||null, onid_login||null, onid_password||null]
        );
      }
    }
    res.json({ message: "Hujjat qo'shildi" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/:id/documents/:did', auth, async (req, res) => {
  try {
    await db.run_p('DELETE FROM documents WHERE id=? AND teacher_id=?', [req.params.did, req.params.id]);
    res.json({ message: "Hujjat o'chirildi" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;