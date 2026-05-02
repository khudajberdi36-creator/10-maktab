const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');

router.get('/stats', auth, async (req, res) => {
  try {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    const [
      totalRow, activeRow, inactiveRow,
      bySubject, byGender, recent,
      certCountRow, docCountRow,
      birthdays, expiringSoon,
      monthly
    ] = await Promise.all([
      db.get_p('SELECT COUNT(*) as c FROM teachers'),
      db.get_p("SELECT COUNT(*) as c FROM teachers WHERE status = 'active'"),
      db.get_p("SELECT COUNT(*) as c FROM teachers WHERE status = 'inactive'"),
      db.all_p(`SELECT subject, COUNT(*) as count FROM teachers
                WHERE subject IS NOT NULL AND subject != ''
                GROUP BY subject ORDER BY count DESC LIMIT 10`),
      db.all_p(`SELECT gender, COUNT(*) as count FROM teachers
                WHERE gender IS NOT NULL GROUP BY gender`),
      db.all_p(`SELECT id,first_name,last_name,position,photo,created_at
                FROM teachers ORDER BY created_at DESC LIMIT 5`),
      db.get_p('SELECT COUNT(*) as c FROM certificates'),
      db.get_p('SELECT COUNT(*) as c FROM documents'),
      db.all_p(`
        SELECT id, first_name, last_name, middle_name, position, photo, birth_date
        FROM teachers
        WHERE birth_date LIKE $1 OR birth_date LIKE $2 OR birth_date LIKE $3
      `, [`%-${mm}-${dd}`, `${dd}.${mm}.%`, `${dd}/${mm}/%`]),
      db.all_p(`
        SELECT c.id, c.name, c.expire_date, c.certificate_number,
               t.id as teacher_id, t.first_name, t.last_name, t.position
        FROM certificates c
        JOIN teachers t ON c.teacher_id = t.id
        WHERE c.expire_date IS NOT NULL AND c.expire_date != ''
          AND c.expire_date::date <= CURRENT_DATE + INTERVAL '30 days'
          AND c.expire_date::date >= CURRENT_DATE
        ORDER BY c.expire_date ASC
      `),
      // Oxirgi 7 oy — har oyda qo'shilgan xodimlar soni
      db.all_p(`
        SELECT
          TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') AS oy,
          TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS oy_key,
          COUNT(*) AS qoshilgan
        FROM teachers
        WHERE created_at >= NOW() - INTERVAL '7 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY DATE_TRUNC('month', created_at) ASC
      `)
    ]);

    res.json({
      total:    parseInt(totalRow.c),
      active:   parseInt(activeRow.c),
      inactive: parseInt(inactiveRow.c),
      bySubject, byGender, recent,
      certCount: parseInt(certCountRow.c),
      docCount:  parseInt(docCountRow.c),
      birthdays, expiringSoon,
      monthly: monthly.map(m => ({
        oy:        m.oy,
        qoshilgan: parseInt(m.qoshilgan)
      }))
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ─── Login statistika (faqat admin) ───────────────────────────────────────
router.get('/login-stats', auth, async (req, res) => {
  try {
    const [todayRow, totalRow, failedRow, recent] = await Promise.all([
      db.get_p(`SELECT COUNT(*) as c FROM login_logs
                WHERE DATE(created_at) = CURRENT_DATE AND status = 'success'`),
      db.get_p(`SELECT COUNT(*) as c FROM login_logs WHERE status = 'success'`),
      db.get_p(`SELECT COUNT(*) as c FROM login_logs WHERE status = 'failed'`),
      db.all_p(`SELECT username, full_name, role, status, ip, created_at
                FROM login_logs ORDER BY created_at DESC LIMIT 20`)
    ]);

    res.json({
      today:  parseInt(todayRow.c),
      total:  parseInt(totalRow.c),
      failed: parseInt(failedRow.c),
      recent
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;