const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'maktab_tizim_secret_2024';

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token kerak' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token muddati tugagan, qayta kiring' });
    }
    res.status(401).json({ message: 'Token yaroqsiz' });
  }
};