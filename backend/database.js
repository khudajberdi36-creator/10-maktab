const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');

// Ma'lumotlar doimiy saqlanishi uchun /opt/render/project/data papkasidan foydalanamiz
// Render.com da bu disk persistent bo'ladi (agar Disk qo'shilgan bo'lsa)
// Aks holda loyiha papkasida saqlanadi
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname);
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'teachers.db');
const db = new sqlite3.Database(DB_PATH);

db.run_p = (sql, params = []) => new Promise((res, rej) =>
  db.run(sql, params, function (err) { err ? rej(err) : res(this); })
);
db.get_p = (sql, params = []) => new Promise((res, rej) =>
  db.get(sql, params, (err, row) => err ? rej(err) : res(row))
);
db.all_p = (sql, params = []) => new Promise((res, rej) =>
  db.all(sql, params, (err, rows) => err ? rej(err) : res(rows))
);

async function init() {
  await db.run_p(`PRAGMA foreign_keys = ON`);

  await db.run_p(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.run_p(`CREATE TABLE IF NOT EXISTS teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL, last_name TEXT NOT NULL, middle_name TEXT,
    birth_date TEXT, gender TEXT, photo TEXT,
    passport_series TEXT, passport_number TEXT, passport_issued_by TEXT,
    passport_issued_date TEXT, passport_expire_date TEXT, jshshir TEXT,
    phone TEXT, email TEXT, address TEXT,
    position TEXT, subject TEXT, class_teacher TEXT,
    employment_date TEXT, employment_type TEXT, salary_rate REAL, experience_years INTEGER,
    labor_book_number TEXT, labor_book_date TEXT, previous_workplaces TEXT,
    education_level TEXT, university TEXT, specialty TEXT,
    graduation_year TEXT, diploma_number TEXT, diploma_date TEXT,
    status TEXT DEFAULT 'active', notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.run_p(`CREATE TABLE IF NOT EXISTS certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER NOT NULL, name TEXT NOT NULL,
    issued_by TEXT, issued_date TEXT, expire_date TEXT,
    certificate_number TEXT, file_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
  )`);

  await db.run_p(`CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER NOT NULL, doc_type TEXT NOT NULL,
    doc_name TEXT NOT NULL, file_path TEXT,
    onid_number TEXT,
    onid_login TEXT,
    onid_password TEXT,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
  )`);

  // Eski documents jadvaliga yangi ustunlar qo'shish (agar yo'q bo'lsa)
  try {
    await db.run_p(`ALTER TABLE documents ADD COLUMN onid_login TEXT`);
  } catch(e) { /* ustun allaqachon bor */ }
  try {
    await db.run_p(`ALTER TABLE documents ADD COLUMN onid_password TEXT`);
  } catch(e) { /* ustun allaqachon bor */ }

  const admin = await db.get_p('SELECT id FROM users WHERE username = ?', ['admin']);
  if (!admin) {
    await db.run_p('INSERT INTO users (username,password,full_name,role) VALUES (?,?,?,?)',
      ['geldimurat', bcrypt.hashSync('admin1967',10), 'Tizim Administratori', 'admin']);
    await db.run_p('INSERT INTO users (username,password,full_name,role) VALUES (?,?,?,?)',
      ['direktor', bcrypt.hashSync('direktor1967',10), 'Maktab Direktori', 'direktor']);
    await db.run_p('INSERT INTO users (username,password,full_name,role) VALUES (?,?,?,?)',
      ['oquvchi', bcrypt.hashSync('oquvch1967',10), "O'qituvchi Foydalanuvchi", 'oquvchi']);

    await db.run_p(`INSERT INTO teachers (first_name,last_name,middle_name,birth_date,gender,
      passport_series,passport_number,passport_issued_by,passport_issued_date,passport_expire_date,
      jshshir,phone,email,address,position,subject,employment_date,employment_type,salary_rate,
      experience_years,labor_book_number,labor_book_date,previous_workplaces,education_level,
      university,specialty,graduation_year,diploma_number,diploma_date,status) VALUES
      (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      ['Dilnoza','Yusupova','Karimovna','15/03/1985','Ayol','AA','1234567','Toshkent IIB',
       '2018-01-10','2028-01-10','28503150001234','+998901234567','dilnoza@maktab.uz',
       "Toshkent sh., Yunusobod t.","Matematika o'qituvchisi",'Matematika',
       '2010-09-01','Asosiy',1.0,14,'TR-001234','2010-09-01','2005-2010: 45-maktab',
       'Oliy','NUUz','Matematika','2005','D-2005-1234','2005-06-15','active']);

    console.log("Demo ma'lumotlar yuklandi");
  }
  console.log("Ma'lumotlar bazasi tayyor:", DB_PATH);
}

init().catch(console.error);
module.exports = db;