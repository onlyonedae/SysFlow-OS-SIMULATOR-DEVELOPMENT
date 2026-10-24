# SysFlow — Simulator Manajemen I/O Sistem Operasi

SysFlow adalah simulator manajemen input/output (I/O) sistem operasi interaktif berbasis web yang dibangun untuk tugas UAS mata kuliah Sistem Operasi. Aplikasi ini dirancang sebagai instrumen teknis bagi mahasiswa dan dosen untuk memvisualisasikan, menganalisis, dan membandingkan efisiensi algoritma I/O langkah demi langkah.

---

## Tiga Modul Utama

### 1. Penjadwalan I/O (Disk Scheduling)
* **Metode**: FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK.
* **Input**: Antrean request silinder, posisi head awal, rentang track (0–199), arah awal gerakan head (menuju 0 / menuju akhir), serta opsi penghitungan lompatan kembali pada C-SCAN/C-LOOK.
* **Visualisasi**: 
  * Grafik jalur pergerakan head (sumbu X: nomor track, sumbu Y: urutan langkah).
  * Mekanisme fisik piringan (*platter*) berputar dengan lengan actuator mekanik yang bergerak presisi mengikuti silinder aktif.
* **Metrik**: Total head movement, estimasi seek time, rata-rata dan maksimum waktu tunggu (deteksi starvation), throughput.
* **Uji Kasus Buku Teks Silberschatz**: Antrean `98, 183, 37, 122, 14, 124, 65, 67`, head awal `53`, track `0-199`, arah ke `0`. Hasil: FCFS = 640, SSTF = 236, SCAN = 236, LOOK = 208 silinder.

### 2. Strategi Buffering (I/O Buffering)
* **Metode**: Tanpa Buffer (*Unbuffered*), Single Buffer, Double Buffer (*Ping-Pong*), Circular Buffer (*FIFO*).
* **Model**: Producer (I/O Device) dan Consumer (CPU) dengan parameter waktu transfer $T$, waktu komputasi $C$, dan kapasitas slot buffer.
* **Visualisasi**: Status slot buffer interaktif (*kosong, sedang diisi, penuh, sedang dikosongkan*) serta diagram timing aktivitas yang memperlihatkan waktu menganggur (*idle/stall*).
* **Metrik**: Total waktu selesai, throughput, waktu idle producer dan consumer, persentase utilisasi, rata-rata keterisian buffer, speedup factor.

### 3. Metode Transfer Data
* **Metode**: Programmed I/O (*Polling*), Interrupt-Driven I/O, Direct Memory Access (*DMA*).
* **Input**: Ukuran data total, ukuran blok, waktu baca perangkat hardware, biaya penanganan satu interrupt, waktu inisialisasi setup DMA.
* **Visualisasi**: Timing diagram 3 jalur sinkron (*CPU, Device Controller, Memori Utama*) serta topologi bus perangkat keras.
* **Metrik**: Total waktu transfer, waktu CPU sibuk (*busy*), waktu CPU bebas (*free*), persentase utilisasi CPU, jumlah interrupt yang dipicu, throughput efektif.

---

## Fitur Unggulan Sistem

* **Kontrol Putar Interaktif**: Play, Pause, Step Maju, Step Mundur, Reset, dan pengatur kecepatan putar (0.5x – 2x).
* **Navigasi Keyboard Penuh**: 
  * `Spasi`: Play / Pause
  * `Panah Kanan`: Step Maju
  * `Panah Kiri`: Step Mundur
  * `R` / `r`: Reset Simulasi
* **Panel Narasi Langkah**: Satu kalimat teknis per langkah yang menjelaskan keputusan algoritma secara deterministik.
* **Mode Bandingkan**: Tabel komparasi metrik berdampingan dengan nilai terbaik bertanda `✓`, dilengkapi grafik batang berlabel sumbu dan satuan resmi.
* **Ekspor CSV**: Mengunduh seluruh hasil perbandingan untuk lampiran laporan resmi UAS.
* **Halaman Rumus & Asumsi**: Dokumentasi model matematika lengkap per modul untuk pertanggungjawaban akademis saat presentasi.

---

## Teknologi & Arsitektur

* **Framework**: React 19 + TypeScript + Vite.
* **Styling**: Vanilla CSS murni dengan sistem token semantik (`src/styles/tokens.css` dan `global.css`), ramah aksesibilitas WCAG AA, dan menghormati `prefers-reduced-motion`.
* **Arsitektur Kode**: Logika simulasi berupa fungsi murni (*pure functions*) yang terisolasi total dari antarmuka React (`src/core/`), sehingga memudahkan unit test dan kolaborasi tim tanpa konflik Git.

---

## Instalasi & Cara Menjalankan

### Prasyarat
* Node.js (v18 atau lebih baru)
* NPM

### Langkah Menjalankan
1. Clone repositori atau buka direktori proyek:
   ```bash
   cd "PROJEK SISOP"
   ```
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Jalankan server pengembangan lokal:
   ```bash
   npm run dev
   ```
   Buka peramban pada alamat `http://localhost:5173/`.

4. Menjalankan Unit Test Algoritma:
   ```bash
   npm run test
   ```

5. Membangun Bundel Produksi:
   ```bash
   npm run build
   ```

---

## Struktur Folder Proyek

```
src/
├── core/                   # FUNGSI MURNI SIMULASI (Bebas dari React/DOM)
│   ├── disk/               # Modul 1: Algoritma FCFS, SSTF, SCAN, LOOK & Unit Test
│   ├── buffering/          # Modul 2: Model Unbuffered, Single, Double, Circular
│   └── transfer/           # Modul 3: Model Polling, Interrupt, DMA
├── modules/                # ANTARMUKA PENGGUNA PER MODUL
│   ├── disk/               # Visualisasi piringan, grafik koordinat, kontrol, metrik
│   ├── buffering/          # Visualisasi slot buffer & diagram timing aktivitas
│   ├── transfer/           # Timing diagram 3 jalur & skema topologi bus
│   └── formulas/           # Halaman rumus akademis & asumsi model waktu
├── shared/                 # Komponen UI bersama (Playback, Narasi, Kontrol)
├── styles/                 # Desain sistem, token semantik, & animasi mekanik
└── utils/                  # Utilitas ekspor CSV
```

---

## Pembagian Kerja & Anggota Tim

| No | Peran / Pembagian Kerja | Lingkup Modul |
|---|---|---|
| 1 | Pengembang Logika Penjadwalan Disk | `src/core/disk/` (FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK) |
| 2 | Desainer Visualisasi Piringan & Jalur Disk | `src/modules/disk/` (DiskPlatterView, DiskTrackChart, Params) |
| 3 | Pengembang Logika Strategi Buffering | `src/core/buffering/` (Unbuffered, Single, Double, Circular) |
| 4 | Desainer Visualisasi Slot Buffer & Timeline | `src/modules/buffering/` (BufferSlotsView, BufferTimeline) |
| 5 | Pengembang Logika Metode Transfer Data | `src/core/transfer/` (Programmed I/O, Interrupt, DMA) |
| 6 | Desainer Timing Diagram 3 Jalur & Integrasi Sistem | `src/modules/transfer/` & `src/modules/formulas/` |
