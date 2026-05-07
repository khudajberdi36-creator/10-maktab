const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database');
const auth = require('../middleware/auth');

// Color ustunini qo'shish (agar yo'q bo'lsa)
db.run_p(`ALTER TABLE users ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT '#3b82f6'`, []).catch(() => {});

// ─── Rol tekshiruvi: faqat admin va direktor ──────────────────────────────
function isAdminOrDirektor(req, res, next) {
  if (req.user?.role === 'admin' || req.user?.role === 'direktor') {
    return next();
  }
  return res.status(403).json({ message: "Ruxsat yo'q" });
}

// GET all users — admin va direktor ko'radi
router.get('/', auth, isAdminOrDirektor, async (req, res) => {
  try {
    const users = await db.all_p(
      'SELECT id, username, full_name, role, color, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST create user — admin va direktor qo'sha oladi
router.post('/', auth, isAdminOrDirektor, async (req, res) => {
  try {
    const { username, password, full_name, role, color } = req.body;
    if (!username || !password || !full_name || !role)
      return res.status(400).json({ message: "Barcha maydonlar to'ldirilishi shart" });

    if (password.length < 8)
      return res.status(400).json({ message: "Parol kamida 8 ta belgidan iborat bo'lishi kerak" });

    await db.run_p(
      'INSERT INTO users (username,password,full_name,role,color) VALUES ($1,$2,$3,$4,$5)',
      [username, bcrypt.hashSync(password, 10), full_name, role, color || '#3b82f6']
    );
    res.json({ message: "Foydalanuvchi yaratildi" });
  } catch (e) {
    res.status(400).json({ message: "Foydalanuvchi nomi allaqachon mavjud" });
  }
});

// PUT update user — admin va direktor o'zgartira oladi
router.put('/:id', auth, isAdminOrDirektor, async (req, res) => {
  try {
    const { full_name, role, password, color } = req.body;

    if (password && password.length < 8)
      return res.status(400).json({ message: "Parol kamida 8 ta belgidan iborat bo'lishi kerak" });

    if (password) {
      await db.run_p(
        'UPDATE users SET full_name=$1, role=$2, password=$3, color=$4 WHERE id=$5',
        [full_name, role, bcrypt.hashSync(password, 10), color || '#3b82f6', req.params.id]
      );
    } else {
      await db.run_p(
        'UPDATE users SET full_name=$1, role=$2, color=$3 WHERE id=$4',
        [full_name, role, color || '#3b82f6', req.params.id]
      );
    }
    res.json({ message: "Foydalanuvchi yangilandi" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// DELETE user — faqat admin o'chira oladi
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user?.role !== 'admin')
      return res.status(403).json({ message: "Faqat admin o'chira oladi" });

    // O'zini o'chira olmaydi
    if (parseInt(req.params.id) === req.user?.id)
      return res.status(403).json({ message: "O'z akkauntingizni o'chira olmaysiz" });

    // Oxirgi adminni o'chira olmaydi
    const target = await db.get_p('SELECT role FROM users WHERE id = $1', [req.params.id]);
    if (target?.role === 'admin') {
      const adminCount = await db.get_p("SELECT COUNT(*) as c FROM users WHERE role = 'admin'");
      if (parseInt(adminCount.c) <= 1)
        return res.status(403).json({ message: "Tizimda kamida 1 ta admin bo'lishi kerak" });
    }

    await db.run_p('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: "Foydalanuvchi o'chirildi" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;