const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// SQLite dan PostgreSQL ga o'tish uchun helper metodlar
pool.run_p = async (sql, params = []) => {
  const result = await pool.query(sql, params);
  return {
    lastID: result.rows[0]?.id || null,
    changes: result.rowCount
  };
};

pool.get_p = async (sql, params = []) => {
  const result = await pool.query(sql, params);
  return result.rows[0] || null;
};

pool.all_p = async (sql, params = []) => {
  const result = await pool.query(sql, params);
  return result.rows;
};

async function init() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS teachers (
      id SERIAL PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      middle_name TEXT,
      birth_date TEXT,
      gender TEXT,
      photo TEXT,
      passport_series TEXT,
      passport_number TEXT,
      passport_issued_by TEXT,
      passport_issued_date TEXT,
      passport_expire_date TEXT,
      jshshir TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      position TEXT,
      subject TEXT,
      class_teacher TEXT,
      employment_date TEXT,
      employment_type TEXT,
      salary_rate REAL,
      experience_years INTEGER,
      labor_book_number TEXT,
      labor_book_date TEXT,
      previous_workplaces TEXT,
      education_level TEXT,
      university TEXT,
      specialty TEXT,
      graduation_year TEXT,
      diploma_number TEXT,
      diploma_date TEXT,
      status TEXT DEFAULT 'active',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS certificates (
      id SERIAL PRIMARY KEY,
      teacher_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      issued_by TEXT,
      issued_date TEXT,
      expire_date TEXT,
      certificate_number TEXT,
      file_path TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      teacher_id INTEGER NOT NULL,
      doc_type TEXT NOT NULL,
      doc_name TEXT NOT NULL,
      file_path TEXT,
      onid_number TEXT,
      onid_login TEXT,
      onid_password TEXT,
      upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
    )`);

    // Admin foydalanuvchi yo'q bo'lsa yaratish
    const admin = await pool.get_p('SELECT id FROM users WHERE username = $1', ['geldimurat']);
    if (!admin) {
      await pool.query('INSERT INTO users (username,password,full_name,role) VALUES ($1,$2,$3,$4)',
        ['geldimurat', bcrypt.hashSync('admin1967', 10), 'Tizim Administratori', 'admin']);
      await pool.query('INSERT INTO users (username,password,full_name,role) VALUES ($1,$2,$3,$4)',
        ['direktor', bcrypt.hashSync('direktor1967', 10), 'Maktab Direktori', 'direktor']);
      await pool.query('INSERT INTO users (username,password,full_name,role) VALUES ($1,$2,$3,$4)',
        ['oquvchi', bcrypt.hashSync('oquvch1967', 10), "O'qituvchi Foydalanuvchi", 'oquvchi']);

      await pool.query(`INSERT INTO teachers (
        first_name,last_name,middle_name,birth_date,gender,
        passport_series,passport_number,passport_issued_by,passport_issued_date,passport_expire_date,
        jshshir,phone,email,address,position,subject,employment_date,employment_type,salary_rate,
        experience_years,labor_book_number,labor_book_date,previous_workplaces,education_level,
        university,specialty,graduation_year,diploma_number,diploma_date,status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30)`,
        ['Dilnoza','Yusupova','Karimovna','15/03/1985','Ayol','AA','1234567','Toshkent IIB',
         '2018-01-10','2028-01-10','28503150001234','+998901234567','dilnoza@maktab.uz',
         "Toshkent sh., Yunusobod t.","Matematika o'qituvchisi",'Matematika',
         '2010-09-01','Asosiy',1.0,14,'TR-001234','2010-09-01','2005-2010: 45-maktab',
         'Oliy','NUUz','Matematika','2005','D-2005-1234','2005-06-15','active']);

      console.log("Demo ma'lumotlar yuklandi");
    }

    console.log("PostgreSQL bazasi tayyor!");
  } catch (e) {
    console.error("Baza xatosi:", e.message);
    process.exit(1);
  }
}

init();
module.exports = pool;