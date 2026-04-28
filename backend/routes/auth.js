const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');

const SECRET = process.env.JWT_SECRET || 'maktab_tizim_secret_2024';

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await db.get_p('SELECT * FROM users WHERE username = $1', [username]);
    if (!user) return res.status(401).json({ message: "Foydalanuvchi topilmadi" });
    if (!bcrypt.compareSync(password, user.password))
      return res.status(401).json({ message: "Parol noto'g'ri" });
    const token = jwt.sign(
      { id: user.id, role: user.role, full_name: user.full_name },
      SECRET,
      { expiresIn: '24h' }
    );
    res.json({
      token,
      user: { id: user.id, username: user.username, full_name: user.full_name, role: user.role }
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password, full_name, role } = req.body;
    await db.run_p(
      'INSERT INTO users (username,password,full_name,role) VALUES ($1,$2,$3,$4)',
      [username, bcrypt.hashSync(password, 10), full_name, role]
    );
    res.json({ message: "Foydalanuvchi yaratildi" });
  } catch (e) {
    res.status(400).json({ message: "Foydalanuvchi nomi allaqachon mavjud" });
  }
});

module.exports = router;