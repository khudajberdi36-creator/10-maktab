const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');

const SECRET = process.env.JWT_SECRET || 'maktab_tizim_secret_2024';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'maktab_admin_2024';

// ─── Brute Force himoya ───────────────────────────────────────────────────
const loginAttempts = {};
const MAX_ATTEMPTS    = 5;
const BLOCK_DURATION  = 15 * 60 * 1000; // 15 daqiqa
const WINDOW_DURATION = 10 * 60 * 1000; // 10 daqiqa

function getAttemptInfo(ip) {
  if (!loginAttempts[ip]) loginAttempts[ip] = { count: 0, lastAttempt: null, blockedUntil: null };
  return loginAttempts[ip];
}
function isBlocked(ip) {
  const info = getAttemptInfo(ip);
  if (info.blockedUntil && new Date() < new Date(info.blockedUntil)) return true;
  if (info.blockedUntil && new Date() >= new Date(info.blockedUntil)) {
    loginAttempts[ip] = { count: 0, lastAttempt: null, blockedUntil: null };
  }
  return false;
}
function recordFailedAttempt(ip) {
  const info = getAttemptInfo(ip);
  const now = new Date();
  if (info.lastAttempt && (now - new Date(info.lastAttempt)) > WINDOW_DURATION) info.count = 0;
  info.count += 1;
  info.lastAttempt = now;
  if (info.count >= MAX_ATTEMPTS) info.blockedUntil = new Date(now.getTime() + BLOCK_DURATION);
}
function clearAttempts(ip) { delete loginAttempts[ip]; }
function getRemainingTime(ip) {
  const info = getAttemptInfo(ip);
  if (!info.blockedUntil) return 0;
  return Math.ceil((new Date(info.blockedUntil) - new Date()) / 60000);
}

// ─── Login logs jadvalini yaratish ────────────────────────────────────────
db.run_p(`
  CREATE TABLE IF NOT EXISTS login_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    username VARCHAR(100),
    full_name VARCHAR(200),
    role VARCHAR(50),
    action VARCHAR(20) DEFAULT 'login',
    status VARCHAR(20),
    ip VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, []).catch(() => {});

db.run_p(`ALTER TABLE login_logs ADD COLUMN IF NOT EXISTS user_id INTEGER`, []).catch(() => {});
db.run_p(`ALTER TABLE login_logs ADD COLUMN IF NOT EXISTS action VARCHAR(20) DEFAULT 'login'`, []).catch(() => {});

// ─── 10 KUNLIK AVTOMATIK LOG TOZALASH ────────────────────────────────────
// Server ishga tushganda eski loglarni o'chirish
async function cleanOldLogs() {
  try {
    const result = await db.run_p(
      `DELETE FROM login_logs WHERE created_at < NOW() - INTERVAL '10 days'`,
      []
    );
    if (result.changes > 0) {
      console.log(`🧹 ${result.changes} ta eski log o'chirildi (10 kundan eski)`);
    }
  } catch (e) {
    console.error('Log tozalashda xatolik:', e.message);
  }
}

// Ishga tushganda bir marta
cleanOldLogs();

// Har kuni soat 02:00 da tozalash
function scheduleDailyCleanup() {
  const now = new Date();
  const next2am = new Date();
  next2am.setHours(2, 0, 0, 0);
  if (next2am <= now) next2am.setDate(next2am.getDate() + 1);

  const msUntil2am = next2am - now;

  setTimeout(() => {
    cleanOldLogs();
    // Keyin har 24 soatda takrorlash
    setInterval(cleanOldLogs, 24 * 60 * 60 * 1000);
  }, msUntil2am);

  console.log(`⏰ Log tozalash rejalashtirildi: har kuni 02:00 da`);
}
scheduleDailyCleanup();

// ─── LOGIN ─────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown';

    if (isBlocked(ip)) {
      const mins = getRemainingTime(ip);
      return res.status(429).json({
        message: `Juda ko'p urinish! ${mins} daqiqadan keyin qaytadan urinib ko'ring.`
      });
    }

    const user = await db.get_p('SELECT * FROM users WHERE username = $1', [username]);

    if (!user) {
      recordFailedAttempt(ip);
      const left = MAX_ATTEMPTS - getAttemptInfo(ip).count;
      await db.run_p(
        'INSERT INTO login_logs (username, action, status, ip) VALUES ($1,$2,$3,$4)',
        [username, 'login', 'failed', ip]
      ).catch(() => {});
      return res.status(401).json({
        message: left > 0
          ? `Foydalanuvchi topilmadi. ${left} ta urinish qoldi.`
          : `Bloklandingiz. 15 daqiqadan keyin urinib ko'ring.`
      });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      recordFailedAttempt(ip);
      const left = MAX_ATTEMPTS - getAttemptInfo(ip).count;
      await db.run_p(
        'INSERT INTO login_logs (user_id, username, full_name, role, action, status, ip) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [user.id, username, user.full_name, user.role, 'login', 'failed', ip]
      ).catch(() => {});
      return res.status(401).json({
        message: left > 0
          ? `Parol noto'g'ri. ${left} ta urinish qoldi.`
          : `Bloklandingiz. 15 daqiqadan keyin urinib ko'ring.`
      });
    }

    clearAttempts(ip);

    await db.run_p(
      'INSERT INTO login_logs (user_id, username, full_name, role, action, status, ip) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [user.id, username, user.full_name, user.role, 'login', 'success', ip]
    ).catch(() => {});

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, full_name: user.full_name },
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

// ─── LOGOUT ────────────────────────────────────────────────────────────────
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, SECRET);
      const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown';
      await db.run_p(
        'INSERT INTO login_logs (user_id, username, full_name, role, action, status, ip) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [decoded.id, decoded.username || '', decoded.full_name, decoded.role, 'logout', 'success', ip]
      ).catch(() => {});
    }
    res.json({ message: 'Chiqildi' });
  } catch {
    res.json({ message: 'Chiqildi' });
  }
});

// ─── LOGIN LOGLARINI OLISH ─────────────────────────────────────────────────
router.get('/login-logs', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token kerak' });

    let decoded;
    try { decoded = jwt.verify(token, SECRET); }
    catch { return res.status(401).json({ message: 'Token yaroqsiz' }); }

    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Faqat admin ko\'ra oladi' });

    const rows = await db.all_p(
      'SELECT * FROM login_logs ORDER BY created_at DESC LIMIT 200', []
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ─── ADMIN VERIFY ──────────────────────────────────────────────────────────
router.post('/admin-verify', async (req, res) => {
  const { code } = req.body;
  if (code === ADMIN_SECRET) res.json({ verified: true });
  else res.status(401).json({ message: "Admin kodi noto'g'ri" });
});

// ─── REGISTER ─────────────────────────────────────────────────────────────
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