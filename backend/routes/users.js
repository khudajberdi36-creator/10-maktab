const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database');
const auth = require('../middleware/auth');

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: "Ruxsat yo'q" });
  next();
};

router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const users = await db.all_p('SELECT id, username, full_name, role, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { username, password, full_name, role } = req.body;
    if (!username || !password || !full_name || !role)
      return res.status(400).json({ message: "Barcha maydonlarni to'ldiring" });
    const existing = await db.get_p('SELECT id FROM users WHERE username = ?', [username]);
    if (existing) return res.status(400).json({ message: "Bu foydalanuvchi nomi band" });
    await db.run_p('INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)',
      [username, bcrypt.hashSync(password, 10), full_name, role]);
    res.json({ message: "Foydalanuvchi muvaffaqiyatli qo'shildi" });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { full_name, role, password } = req.body;
    if (password) {
      await db.run_p('UPDATE users SET full_name=?, role=?, password=? WHERE id=?',
        [full_name, role, bcrypt.hashSync(password, 10), req.params.id]);
    } else {
      await db.run_p('UPDATE users SET full_name=?, role=? WHERE id=?',
        [full_name, role, req.params.id]);
    }
    res.json({ message: "Foydalanuvchi yangilandi" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id)
      return res.status(400).json({ message: "O'z hisobingizni o'chira olmaysiz" });
    await db.run_p('DELETE FROM users WHERE id=?', [req.params.id]);
    res.json({ message: "Foydalanuvchi o'chirildi" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;