const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');

router.get('/stats', auth, async (req, res) => {
  try {
    const total = (await db.get_p('SELECT COUNT(*) as c FROM teachers')).c;
    const active = (await db.get_p("SELECT COUNT(*) as c FROM teachers WHERE status='active'")).c;
    const inactive = (await db.get_p("SELECT COUNT(*) as c FROM teachers WHERE status='inactive'")).c;
    const bySubject = await db.all_p("SELECT subject, COUNT(*) as count FROM teachers GROUP BY subject ORDER BY count DESC LIMIT 10");
    const byGender = await db.all_p("SELECT gender, COUNT(*) as count FROM teachers GROUP BY gender");
    const recent = await db.all_p("SELECT id,first_name,last_name,position,photo,created_at FROM teachers ORDER BY created_at DESC LIMIT 5");
    const certCount = (await db.get_p('SELECT COUNT(*) as c FROM certificates')).c;
    const docCount = (await db.get_p('SELECT COUNT(*) as c FROM documents')).c;

    // Bugun tug'ilgan kunlari — barcha formatlarni tekshiradi
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const birthdays = await db.all_p(
      `SELECT id, first_name, last_name, middle_name, position, photo, birth_date
       FROM teachers WHERE 
       birth_date LIKE '%-${mm}-${dd}' OR
       birth_date LIKE '${dd}.${mm}.%' OR
       birth_date LIKE '${dd}/${mm}/%' OR
       strftime('%m-%d', birth_date) = '${mm}-${dd}'`
    );

    // 30 kun ichida muddati tugaydigan sertifikatlar
    const expiringSoon = await db.all_p(`
      SELECT c.id, c.name, c.expire_date, c.certificate_number,
             t.id as teacher_id, t.first_name, t.last_name, t.position
      FROM certificates c
      JOIN teachers t ON c.teacher_id = t.id
      WHERE c.expire_date IS NOT NULL AND c.expire_date != ''
        AND date(c.expire_date) <= date('now', '+30 days')
        AND date(c.expire_date) >= date('now')
      ORDER BY c.expire_date ASC
    `);

    res.json({ total, active, inactive, bySubject, byGender, recent, certCount, docCount, birthdays, expiringSoon });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;