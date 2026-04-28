const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database');
const auth = require('../middleware/auth');

// GET all users
router.get('/', auth, async (req, res) => {
  try {
    const users = await db.all_p(
      'SELECT id, username, full_name, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST create user
router.post('/', auth, async (req, res) => {
  try {
    const { username, password, full_name, role } = req.body;
    if (!username || !password || !full_name || !role)
      return res.status(400).json({ message: "Barcha maydonlar to'ldirilishi shart" });

    await db.run_p(
      'INSERT INTO users (username,password,full_name,role) VALUES ($1,$2,$3,$4)',
      [username, bcrypt.hashSync(password, 10), full_name, role]
    );
    res.json({ message: "Foydalanuvchi yaratildi" });
  } catch (e) {
    res.status(400).json({ message: "Foydalanuvchi nomi allaqachon mavjud" });
  }
});

// PUT update user
router.put('/:id', auth, async (req, res) => {
  try {
    const { full_name, role, password } = req.body;
    if (password) {
      await db.run_p(
        'UPDATE users SET full_name=$1, role=$2, password=$3 WHERE id=$4',
        [full_name, role, bcrypt.hashSync(password, 10), req.params.id]
      );
    } else {
      await db.run_p(
        'UPDATE users SET full_name=$1, role=$2 WHERE id=$3',
        [full_name, role, req.params.id]
      );
    }
    res.json({ message: "Foydalanuvchi yangilandi" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// DELETE user
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.run_p('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: "Foydalanuvchi o'chirildi" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;