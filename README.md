# O'zgartirilgan fayllar

## Nima o'zgardi:

### Frontend fayllar (frontend/src/):
1. **pages/TeacherDetail.js** — localhost → API_URL, ONID login/parol qo'shildi, ko'p hujjat turlari
2. **pages/TeacherForm.js** — localhost → API_URL, Direktor va boshqa lavozimlar qo'shildi
3. **pages/Teachers.js** — localhost → API_URL
4. **pages/Documents.js** — localhost → API_URL, ONID login/parol ko'rsatish
5. **pages/Dashboard.js** — localhost → API_URL

### Backend fayllar (backend/):
6. **database.js** — onid_login, onid_password ustunlari qo'shildi, doimiy saqlash yo'li
7. **routes/teachers.js** — ONID login/parol saqlash qo'shildi

## Qanday joylash:

### 1. Fayllarni ko'chiring
Har bir faylni tegishli joyga ko'chiring:
- frontend fayllarini → teacher-system/frontend/src/pages/ ga
- backend fayllarini → teacher-system/backend/ ga

### 2. Push qiling
```bash
cd C:\Users\begzod\Desktop\teacher-system
git add .
git commit -m "feat: add director position, ONID credentials, fix API URLs"
git push origin main
```

### 3. Ma'lumotlar doimiy saqlash (Render Disk)
Render free plan da disk yo'q, shuning uchun server qayta ishga tushganda ma'lumotlar o'chadi.
Yechim: Render da **Disk** qo'shing:
- Render → 10-maktab-tt → Settings → Disks → Add Disk
- Mount Path: /opt/render/project/data
- Size: 1 GB (free plan yo'q, $0.25/GB/oy)

Yoki bepul yechim: **Railway.app** ga o'ting (PostgreSQL bepul beradi).

## Yangi lavozimlar:
- Direktor
- O'quv ishlari bo'yicha direktor o'rinbosari
- Tarbiya ishlari bo'yicha direktor o'rinbosari
- Xo'jalik ishlari bo'yicha direktor o'rinbosari
- Psixolog, Ijtimoiy pedagog, Kutubxonachi, Laborant, Buxgalter, Kotib va boshqalar

## Yangi hujjat turlari:
- Mehnat daftarchasi nusxasi
- Attestatsiya varaqasi
- Malaka oshirish guvohnomasi
- Ta'lim to'g'risidagi guvohnoma
- Kadrlar bo'yicha anketa
- Avtobiografiya va boshqalar

## ONID da login/parol:
Hujjat turini "ONID" tanlasangiz, ONID raqami, login va parol kiritish maydonlari chiqadi.