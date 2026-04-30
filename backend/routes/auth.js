const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');

const SECRET = process.env.JWT_SECRET || 'maktab_tizim_secret_2024';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'maktab_admin_2024';

// Login logs jadvalini yaratish
db.run_p(`
  CREATE TABLE IF NOT EXISTS login_logs (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100),
    full_name VARCHAR(200),
    role VARCHAR(50),
    status VARCHAR(20),
    ip VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, []).catch(() => {});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const user = await db.get_p('SELECT * FROM users WHERE username = $1', [username]);

    if (!user) {
      await db.run_p(
        'INSERT INTO login_logs (username, status, ip) VALUES ($1, $2, $3)',
        [username, 'failed', ip]
      ).catch(() => {});
      return res.status(401).json({ message: "Foydalanuvchi topilmadi" });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      await db.run_p(
        'INSERT INTO login_logs (username, full_name, role, status, ip) VALUES ($1, $2, $3, $4, $5)',
        [username, user.full_name, user.role, 'failed', ip]
      ).catch(() => {});
      return res.status(401).json({ message: "Parol noto'g'ri" });
    }

    await db.run_p(
      'INSERT INTO login_logs (username, full_name, role, status, ip) VALUES ($1, $2, $3, $4, $5)',
      [username, user.full_name, user.role, 'success', ip]
    ).catch(() => {});

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

// Admin maxsus kodni tekshirish
router.post('/admin-verify', async (req, res) => {
  const { code } = req.body;
  if (code === ADMIN_SECRET) {
    res.json({ verified: true });
  } else {
    res.status(401).json({ message: "Admin kodi noto'g'ri" });
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