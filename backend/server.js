const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/import', require('./routes/import'));

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishlamoqda`);
});
