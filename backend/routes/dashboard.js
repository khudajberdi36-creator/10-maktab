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
      birthdays, expiringSoon
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

      // Tug'ilgan kunlar — PostgreSQL da TO_CHAR ishlatamiz
      db.all_p(`
        SELECT id, first_name, last_name, middle_name, position, photo, birth_date
        FROM teachers
        WHERE
          birth_date LIKE $1 OR
          birth_date LIKE $2 OR
          birth_date LIKE $3
      `, [
        `%-${mm}-${dd}`,
        `${dd}.${mm}.%`,
        `${dd}/${mm}/%`
      ]),

      // 30 kun ichida muddati tugaydigan sertifikatlar
      db.all_p(`
        SELECT c.id, c.name, c.expire_date, c.certificate_number,
               t.id as teacher_id, t.first_name, t.last_name, t.position
        FROM certificates c
        JOIN teachers t ON c.teacher_id = t.id
        WHERE c.expire_date IS NOT NULL
          AND c.expire_date != ''
          AND c.expire_date::date <= CURRENT_DATE + INTERVAL '30 days'
          AND c.expire_date::date >= CURRENT_DATE
        ORDER BY c.expire_date ASC
      `)
    ]);

    res.json({
      total: parseInt(totalRow.c),
      active: parseInt(activeRow.c),
      inactive: parseInt(inactiveRow.c),
      bySubject,
      byGender,
      recent,
      certCount: parseInt(certCountRow.c),
      docCount: parseInt(docCountRow.c),
      birthdays,
      expiringSoon
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;