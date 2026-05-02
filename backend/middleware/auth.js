const jwt = require('jsonwebtoken');
const SECRET = 'maktab_tizim_secret_2024';

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token kerak' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Token yaroqsiz' });
  }
};
