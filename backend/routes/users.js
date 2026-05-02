const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database');
const auth = require('../middleware/auth');

// Color ustunini qo'shish
db.run_p(`ALTER TABLE users ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT '#3b82f6'`, []).catch(() => {});

// ─── Parol kuchliligini tekshirish ────────────────────────────────────────
function validatePassword(password) {
  if (!password || password.length < 8) {
    return "Parol kamida 8 ta belgidan iborat bo'lishi kerak";
  }
  if (!/[0-9]/.test(password)) {
    return "Parolda kamida 1 ta raqam bo'lishi kerak";
  }
  if (!/[a-zA-Z]/.test(password)) {
    return "Parolda kamida 1 ta harf bo'lishi kerak";
  }
  return null; // null = xatolik yo'q
}

// ─── GET all users ────────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const users = await db.all_p(
      'SELECT id, username, full_name, role, color, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ─── POST create user ─────────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { username, password, full_name, role, color } = req.body;

    // Majburiy maydonlar
    if (!username || !password || !full_name || !role) {
      return res.status(400).json({ message: "Barcha maydonlar to'ldirilishi shart" });
    }

    // Parol kuchliligi
    const passError = validatePassword(password);
    if (passError) return res.status(400).json({ message: passError });

    // Username faqat harf va raqam
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ message: "Foydalanuvchi nomi faqat harf, raqam va _ dan iborat bo'lishi kerak" });
    }

    await db.run_p(
      'INSERT INTO users (username,password,full_name,role,color) VALUES ($1,$2,$3,$4,$5)',
      [username, bcrypt.hashSync(password, 10), full_name, role, color || '#3b82f6']
    );
    res.json({ message: "Foydalanuvchi yaratildi" });
  } catch (e) {
    res.status(400).json({ message: "Foydalanuvchi nomi allaqachon mavjud" });
  }
});

// ─── PUT update user ──────────────────────────────────────────────────────
router.put('/:id', auth, async (req, res) => {
  try {
    const { full_name, role, password, color } = req.body;
    const targetId = parseInt(req.params.id);
    const currentUserId = req.user?.id;

    // O'z rolini o'zgartira olmaydi
    if (currentUserId === targetId && role && role !== req.user?.role) {
      return res.status(403).json({ message: "O'z rolingizni o'zgartira olmaysiz" });
    }

    if (password) {
      // Parol kuchliligi
      const passError = validatePassword(password);
      if (passError) return res.status(400).json({ message: passError });

      await db.run_p(
        'UPDATE users SET full_name=$1, role=$2, password=$3, color=$4 WHERE id=$5',
        [full_name, role, bcrypt.hashSync(password, 10), color || '#3b82f6', targetId]
      );
    } else {
      await db.run_p(
        'UPDATE users SET full_name=$1, role=$2, color=$3 WHERE id=$4',
        [full_name, role, color || '#3b82f6', targetId]
      );
    }
    res.json({ message: "Foydalanuvchi yangilandi" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// ─── DELETE user ──────────────────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const targetId = parseInt(req.params.id);
    const currentUserId = req.user?.id;

    // O'zini o'chira olmaydi
    if (currentUserId === targetId) {
      return res.status(403).json({ message: "O'z akkauntingizni o'chira olmaysiz" });
    }

    // Oxirgi admin ni o'chira olmaydi
    const target = await db.get_p('SELECT role FROM users WHERE id = $1', [targetId]);
    if (target?.role === 'admin') {
      const adminCount = await db.get_p("SELECT COUNT(*) as c FROM users WHERE role = 'admin'");
      if (parseInt(adminCount.c) <= 1) {
        return res.status(403).json({ message: "Tizimda kamida 1 ta admin bo'lishi kerak" });
      }
    }

    await db.run_p('DELETE FROM users WHERE id = $1', [targetId]);
    res.json({ message: "Foydalanuvchi o'chirildi" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;