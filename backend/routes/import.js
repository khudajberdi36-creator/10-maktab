const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const db = require('../database');

const upload = multer({ storage: multer.memoryStorage() });

const FIELDS = [
  'first_name','last_name','middle_name','birth_date','gender',
  'passport_series','passport_number','passport_issued_by','passport_issued_date','passport_expire_date',
  'jshshir','phone','email','address','position','subject','class_teacher','employment_date',
  'employment_type','salary_rate','experience_years','labor_book_number','labor_book_date',
  'previous_workplaces','education_level','university','specialty','graduation_year',
  'diploma_number','diploma_date','status','notes'
];

// CSV import
router.post('/csv', auth, upload.single('file'), async (req, res) => {
  try {
    const text = req.file.buffer.toString('utf-8');
    const lines = text.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

    let imported = 0;
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const row = {};
        headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

        if (!row.first_name || !row.last_name) continue;

        const cols = FIELDS.filter(f => row[f] !== undefined && row[f] !== '');
        if (cols.length === 0) continue;

        row.status = row.status || 'active';

        const placeholders = cols.map((_, idx) => `$${idx + 1}`).join(',');
        const sql = `INSERT INTO teachers (${cols.join(',')}) VALUES (${placeholders})`;
        await db.run_p(sql, cols.map(c => row[c]));
        imported++;
      } catch (e) {
        errors.push(`${i}-qator: ${e.message}`);
      }
    }

    res.json({
      message: `${imported} ta ustoz muvaffaqiyatli yuklandi`,
      imported,
      errors
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;