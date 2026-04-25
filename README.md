# 🏫 Maktab O'qituvchilar Ma'lumotlar Tizimi

O'zbek tilida to'liq maktab o'qituvchilarini boshqarish tizimi.

## 📋 Xususiyatlari

- ✅ **Shaxsiy ma'lumotlar** — ism, familiya, tug'ilgan sana, foto
- ✅ **Pasport ma'lumotlari** — seriya, raqam, berilgan sana, amal qilish muddati
- ✅ **JSHSHIR** (14 raqamli ID)
- ✅ **Mehnat daftarchasi** — raqam, oldingi ish joylari
- ✅ **Diplom/Ta'lim** — oliy o'quv yurti, mutaxassislik, diplom raqami
- ✅ **Sertifikatlar** — fayl yuklash, muddatni nazorat qilish
- ✅ **Hujjatlar** — har qanday hujjatni yuklash
- ✅ **3 ta rol** — Admin, Direktor, O'qituvchi
- ✅ **Qidiruv** — ism, JSHSHIR, pasport raqami bo'yicha

---

## 🚀 O'rnatish va ishga tushirish

### Talablar
- Node.js 18+ (https://nodejs.org)

### 1. Backend o'rnatish

```bash
cd backend
npm install
node server.js
```

Backend http://localhost:5000 da ishlaydi

### 2. Frontend o'rnatish (yangi terminal)

```bash
cd frontend
npm install
npm start
```

Brauzer http://localhost:3000 da ochiladi

---

## 🔐 Demo hisoblar

| Foydalanuvchi | Parol        | Rol           |
|--------------|--------------|---------------|
| admin        | admin123     | Administrator |
| direktor     | direktor123  | Direktor      |
| oquvchi      | oquvchi123   | O'qituvchi    |

---

## 📁 Loyiha tuzilmasi

```
teacher-system/
├── backend/
│   ├── server.js          — Asosiy server
│   ├── database.js        — SQLite ma'lumotlar bazasi
│   ├── middleware/
│   │   └── auth.js        — JWT autentifikatsiya
│   ├── routes/
│   │   ├── auth.js        — Login/register
│   │   ├── teachers.js    — O'qituvchilar CRUD
│   │   └── dashboard.js   — Statistika
│   └── uploads/           — Yuklangan fayllar
│
└── frontend/
    └── src/
        ├── App.js          — Asosiy ilova
        ├── App.css         — Dizayn
        ├── context/
        │   └── AuthContext.js
        ├── components/
        │   └── Layout.js   — Sidebar + topbar
        └── pages/
            ├── Login.js
            ├── Dashboard.js
            ├── Teachers.js
            ├── TeacherForm.js
            └── TeacherDetail.js
```

---

## 🛠 Texnologiyalar

- **Frontend**: React 18, React Router, Axios
- **Backend**: Node.js, Express.js
- **Ma'lumotlar bazasi**: SQLite (better-sqlite3)
- **Autentifikatsiya**: JWT (JSON Web Token)
- **Fayl yuklash**: Multer

---

## 📞 Qo'llab-quvvatlash

Savollar va takliflar uchun murojaat qiling.
