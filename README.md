# 🏫 CMS & SIAKAD SMA — Sistem Informasi Sekolah Enterprise

Sistem manajemen konten (CMS) dan informasi akademik (SIAKAD) berbasis web untuk SMA, dirancang skala **enterprise / high-traffic**. Mencakup portal publik, manajemen akademik lengkap, absensi QR, e-rapor, PPDB daftar ulang, hingga portal pengumuman kelulusan (SKL) dengan sistem antrean virtual.

---

## ✨ Fitur Utama

| Modul | Keterangan |
|---|---|
| 🔐 **RBAC** | Multi-role: Super Admin, Kurikulum, Guru, Siswa, Orang Tua, Staf Piket |
| 🌐 **Portal Publik** | Landing page dinamis, berita, agenda, profil, fasilitas, alumni |
| 🧩 **Page Builder** | Drag-and-drop editor halaman kustom dengan blok komponen pra-desain |
| 🎨 **CMS Visual** | Navbar builder bertingkat, layout sections, tema warna & background dinamis |
| 👨‍🎓 **Master Data** | CRUD Siswa, Guru, Kelas, Mata Pelajaran, Tahun Ajaran, Semester |
| 📷 **Absensi QR** | Scanner QR Kartu Pelajar via webcam, rekap harian, cetak dispensasi 5×5cm |
| 📊 **E-Rapor** | Input nilai grid, kalkulasi otomatis, deskripsi kompetensi, cetak PDF |
| 🏢 **Organigram** | Builder visual bagan struktur organisasi sekolah |
| 📝 **PPDB Daftar Ulang** | Multi-step form, upload berkas, verifikasi admin, ekspor Excel |
| 🎓 **Portal SKL** | Pengumuman kelulusan massal + Virtual Waiting Room anti-lonjakan trafik |
| 💬 **Komentar & Notifikasi** | Sistem komentar berita dengan moderasi & notifikasi real-time admin |

---

## 🛠️ Stack Teknologi

- **Framework:** Next.js 16 (App Router, Server Actions)
- **Styling & UI:** Tailwind CSS + shadcn/ui
- **Database:** MongoDB + Mongoose ODM (Atlas / Localhost)
- **Autentikasi:** Auth.js / NextAuth v5 (Multi-role)
- **Optimalisasi:** Cloudflare Workers (Virtual Waiting Room SKL)
- **Drag-and-Drop:** @dnd-kit/core & @dnd-kit/sortable
- **QR Scanner:** html5-qrcode
- **PDF:** pdfkit / puppeteer
- **Dokumen:** docxtemplater (Laporan IKI Guru)

---

## 🚀 Menjalankan Proyek

### 1. Clone & Install

```bash
git clone <repo-url>
cd cms_sma
npm install
```

### 2. Konfigurasi Environment

Buat file `.env.local` di root proyek:

```env
MONGODB_URI=mongodb://localhost:27017/cms_sma
NEXTAUTH_SECRET=<64-char-hex-secret>
NEXTAUTH_URL=http://localhost:3000
```

### 3. Seeding Database (Default Superuser)

```bash
npm run seed
```

Akun default yang dibuat:
- **Email:** `admin@sekolah.sch.id`
- **Password:** `SuperPassword123!`
- **Role:** `SUPER_ADMIN`, `ADMIN`

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 📁 Struktur Proyek

```
cms_sma/
├── app/
│   ├── (public)/          # Route grup halaman publik
│   ├── (dashboard)/       # Route grup dashboard admin (protected)
│   └── api/               # API Routes & Server Actions
├── components/            # Komponen UI reusable
├── models/                # Mongoose schema & models
├── actions/               # Server Actions (Next.js)
├── lib/                   # Utilities & konfigurasi
└── public/                # Aset statis
```

---

## 🐳 Deployment (Docker)

```bash
# Build & jalankan dengan Docker Compose
docker compose up -d --build
```

Aplikasi berjalan di port `9090` (produksi). MongoDB menggunakan persistent volume.

---

## 📋 Roadmap

Lihat [`planning_cms_siakad_sma.md`](./planning_cms_siakad_sma.md) untuk detail lengkap setiap phase implementasi.

| Phase | Minggu | Status |
|---|---|---|
| Phase 1 — Foundation & Auth | Minggu 1 | ✅ Selesai |
| Phase 2 — Website Publik | Minggu 2 | ✅ Selesai |
| Phase 3 — CMS Berita & Agenda | Minggu 3 | ✅ Selesai |
| Phase 4 — Master Data Akademik | Minggu 4 | ✅ Selesai |
| Phase 5 — Absensi QR & Piket | Minggu 5 | ✅ Selesai |
| Phase 6 — E-Rapor & Page Builder | Minggu 6–7 | ✅ Selesai |
| Phase 7 — PPDB & Portal SKL | Minggu 8 | ✅ Selesai |
| Phase 8 — QA, Testing & Docker | Minggu 9 | ✅ Selesai |

---

## 📄 Lisensi

Proyek ini dikembangkan untuk kebutuhan internal sekolah. Seluruh hak cipta dilindungi.
