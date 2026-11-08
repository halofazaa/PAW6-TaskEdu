# Taskademik - Web Pengelola Tugas Kuliah (Task Manager)

Aplikasi web pengelola tugas kuliah modern dan responsif yang dibangun menggunakan **Vite** dan **TypeScript** murni. Mengadopsi bahasa desain **Bento Grid** yang bersih, minimalis, dan berorientasi pada produktivitas mahasiswa.

---

## 🌟 Fitur Utama

1. **Daftar Tugas Kuliah (Task List)**
   - Menampilkan kartu tugas lengkap dengan nama mata kuliah, judul tugas, tenggat waktu, indikator urgensi (overdue, hari ini, besok, x hari lagi), dan badge prioritas (Rendah / Sedang / Tinggi).
2. **Form Tambah & Edit Tugas**
   - Modal interaktif dengan validasi form (judul tugas, mata kuliah, datetime tenggat waktu, prioritas, status, serta catatan detail/deskripsi).
3. **Penyuntingan & Penghapusan (Edit & Delete)**
   - Mengedit data tugas yang sudah tersimpan dengan prefill otomatis.
   - Konfirmasi penghapusan tugas dengan aman.
4. **Pembaruan Status Cepat (One-Click Toggle)**
   - Checkbox interaktif untuk menandai status tugas (Belum Selesai / Selesai) langsung dari kartu tugas.
5. **Indikator Statistik Tugas (Bento Stats Grid)**
   - Menampilkan total tugas, jumlah tugas belum selesai, tugas selesai, tugas mendekati/terlewat deadline, persentase penyelesaian (progress bar interaktif), serta jumlah mata kuliah aktif.
6. **Filter & Pencarian Komprehensif**
   - Filter Status: *Semua*, *Belum Selesai*, *Selesai* dengan counter jumlah tugas.
   - Filter Prioritas: *Semua*, *Tinggi*, *Sedang*, *Rendah*.
   - Filter Pencarian: Pencarian real-time berdasarkan judul atau mata kuliah.
   - Pengurutan (Sorting): Berdasarkan tenggat terdekat, tenggat terjauh, terbaru ditambahkan, dan alfabetis.
7. **Notifikasi Toast**
   - Umpan balik visual interaktif untuk setiap aksi penambahan, perubahan status, penyuntingan, dan penghapusan tugas.
8. **Penyimpanan Lokal (LocalStorage Persistence)**
   - Data otomatis tersimpan di peramban sehingga tidak hilang saat halaman disegarkan (refresh).
9. **Environment Variables (.env)**
   - Membaca dan menampilkan nama aplikasi, versi, dan deskripsi institusi secara dinamis di Header dan Footer.

---

## 🎨 Desain UI (Bento Grid Style)

- **Latar Belakang**: Abu-abu sangat muda bersih (`#f8fafc`).
- **Kartu Bento**: Putih murni (`#ffffff`) dengan sudut melengkung besar (`border-radius: 1.5rem` / 24px).
- **Bayangan (Soft Shadows)**: Halus dan bertingkat dengan efek hover lift (`transform: translateY(-3px)`).
- **Aksen Warna**: Biru Modern (`#2563eb` & `#1d4ed8`).
- **Tipografi**: Font **Manrope** dari Google Fonts (bobot 400, 500, 600, 700, 800).
- **Responsif**: Mendukung tampilan Desktop, Tablet, hingga Layar Ponsel Mobile.

---

## 📐 Cakupan TypeScript (TypeScript Coverage)

Aplikasi ini mengimplementasikan konsep TypeScript secara menyeluruh:

| Konsep TypeScript | Implementasi pada Proyek |
|---|---|
| **Primitive Types** | `string` (id, title, course, deadline), `number` (createdAt, stats counts, completion rate), `boolean` (isCompleted). |
| **Arrays** | `Task[]`, array operasi filter (`filter`), mapping (`map`), dan sorting (`sort`). |
| **Interfaces** | `Task`, `TaskFormData`, `TaskStatsData`, `FilterState`, `AppConfig`, `StoragePayload<T>`. |
| **Type Aliases & Union Types** | `TaskPriority = 'low' \| 'medium' \| 'high'`, `TaskStatusFilter = 'all' \| 'pending' \| 'completed'`, `TaskSortOption`, `ModalMode = 'create' \| 'edit'`, `DeadlineStatus`. |
| **Generic Helper Functions** | `getStorageItem<T>(key, defaultValue): T`<br>`setStorageItem<T>(key, value): OperationResult<T>`<br>`filterItems<T>(items, predicate): T[]`<br>`sortItems<T>(items, comparator): T[]`<br>`updateItemInList<T extends { id: string }>(items, updatedItem): T[]`<br>`removeItemFromList<T extends { id: string }>(items, id): T[]` |

---

## 📁 Struktur Direktori Proyek

```
task-manager-app/
├── .env                  # Konfigurasi environment variabel lokal
├── .env.example          # Contoh referensi template konfigurasi .env
├── .gitignore            # Berkas pengecualian Git
├── index.html            # Halaman HTML utama & pemuatan font Manrope
├── package.json          # Manajemen dependensi Vite & TypeScript
├── tsconfig.json         # Konfigurasi TypeScript compiler (strict mode)
├── vite.config.ts        # Konfigurasi build server Vite
├── README.md             # Dokumentasi lengkap proyek
└── src/
    ├── assets/
    │   └── styles.css    # Styling Bento Grid, font Manrope, & utilitas responsif
    ├── types/
    │   └── task.ts       # Definisi Primitive, Array, Interface, Union Types, & Generics
    ├── utils/
    │   ├── storage.ts    # Helper fungsi generic untuk LocalStorage & manipulasi data
    │   └── toast.ts      # Utilitas notifikasi feedback pop-up
    ├── components/
    │   ├── Header.ts     # Komponen Header (membaca env variables: App Name & Version)
    │   ├── TaskForm.ts   # Komponen Modal Form Tambah/Edit Tugas
    │   ├── TaskItem.ts   # Render single task card ala Bento Card
    │   ├── TaskStats.ts  # Ringkasan status dan progres tugas (Bento Stats)
    │   └── Footer.ts     # Komponen Footer (membaca env variables)
    └── main.ts           # Entry point utama logika aplikasi
```

---

## 🚀 Panduan Menjalankan Aplikasi

### 1. Prasyarat
- Node.js (versi 18 ke atas)
- npm

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variable
Salin berkas `.env.example` ke `.env` (sudah otomatis tersedia secara default):
```ini
VITE_APP_NAME="Taskademik"
VITE_APP_VERSION="v1.2.0"
VITE_APP_DESCRIPTION="Manajemen Tugas Kuliah Modern & Terstruktur"
VITE_COLLEGE_NAME="Portal Mahasiswa"
```

### 4. Menjalankan Server Development
```bash
npm run dev
```
Buka browser pada alamat yang tertera di terminal (biasanya `http://localhost:5173`).

### 5. Membangun Proyek untuk Produksi (Build)
```bash
npm run build
```
Hasil build yang teroptimasi akan tersimpan pada folder `dist/`.

---

## 💡 Pengujian Fungsionalitas
- [x] Memuat daftar tugas awal (sample tasks) saat pertama dibuka.
- [x] Menambah tugas baru melalui modal dialog dan tersimpan di LocalStorage.
- [x] Mengedit judul, mata kuliah, tenggat waktu, prioritas, dan catatan tugas.
- [x] Mengubah status tugas (Belum Selesai / Selesai) dengan interaksi realtime.
- [x] Menghapus tugas dengan prompt konfirmasi.
- [x] Menyaring tugas berdasarkan status (Semua, Belum Selesai, Selesai).
- [x] Mencari tugas berdasarkan judul atau mata kuliah secara dinamis.
- [x] Menampilkan statistik progres, counter tugas, dan mata kuliah aktif secara live.
- [x] Menampilkan nama aplikasi dan versi dari variabel `.env` pada Header dan Footer.
