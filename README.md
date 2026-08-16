# Ta'awun DAHAM 2026 — Website Penggalangan Dana

Website satu halaman untuk **Gerakan Bersama Ta'awun DAHAM 2026**, target **Rp300.000.000** dalam **30 hari** (18 Agustus – 17 September 2026). Statis (HTML/CSS/JS), tanpa server sendiri — data donasi disimpan di **Google Sheet** dan dilayani lewat **Google Apps Script**, lalu dipublikasikan gratis lewat **GitHub Pages**.

```
taawun-daham-2026/
├── index.html
├── css/style.css
├── js/app.js
├── apps-script/Code.gs      ← ditempel ke Google Apps Script, bukan dijalankan di sini
├── assets/                  ← taruh logo, foto, qris.png di sini
└── README.md
```

## 1. Siapkan Google Sheet sebagai database

1. Buka [sheets.google.com](https://sheets.google.com), buat spreadsheet baru, beri nama misalnya **"Database Ta'awun DAHAM 2026"**.
2. Klik **Extensions → Apps Script**.
3. Hapus isi `Code.gs` bawaan, lalu **salin-tempel** seluruh isi file [`apps-script/Code.gs`](apps-script/Code.gs) dari proyek ini.
4. Klik **Deploy → New deployment**.
   - Pilih tipe **Web app**.
   - **Execute as**: *Me*.
   - **Who has access**: *Anyone*.
   - Klik **Deploy**, izinkan akses saat diminta.
5. Salin **URL Web App** yang muncul (format: `https://script.google.com/macros/s/XXXXXXXX/exec`).
6. Kembali ke Google Sheet — saat pertama kali dipanggil, script otomatis membuat sheet **"Donasi"** dengan kolom: `Timestamp, Nama, Jumlah, Metode, NoHP, Status, Pesan`.
7. **Verifikasi donasi**: setiap donasi masuk berstatus `Pending`. Panitia mengubah manual menjadi `Verified` setelah dana benar diterima — hanya baris `Verified` yang dihitung ke total & tampil di laporan publik. Ini mencegah data palsu tampil di halaman.

> Jika sewaktu-waktu mengubah kode `Code.gs`, ulangi **Deploy → Manage deployments → Edit → New version** agar perubahan aktif.

## 2. Hubungkan website ke Apps Script

Buka `js/app.js`, isi baris berikut dengan URL dari langkah 1.5:

```js
const CONFIG = {
  API_URL: "https://script.google.com/macros/s/XXXXXXXX/exec",
  ...
};
```

## 3. Lengkapi konten (wajib diisi sebelum publish)

Buka `index.html` dan ganti bagian bertanda kurung siku `[ ... ]`:

- Nomor rekening & nama pemilik rekening (bagian **Cara Berdonasi**).
- Gambar QRIS: taruh file `qris.png` di folder `assets/`, lalu ganti kotak `.qris-box` dengan `<img src="assets/qris.png" alt="QRIS Ta'awun DAHAM 2026">`.
- Nama & WhatsApp narahubung panitia, akun Instagram, link Zoom launching.

## 4. Publikasikan ke GitHub Pages

1. Buat repository baru di GitHub, misalnya `taawun-daham-2026`.
2. Unggah seluruh isi folder ini ke repository tersebut (via web upload, GitHub Desktop, atau `git`):
   ```bash
   cd taawun-daham-2026
   git init
   git add .
   git commit -m "Launch website Ta'awun DAHAM 2026"
   git branch -M main
   git remote add origin https://github.com/USERNAME/taawun-daham-2026.git
   git push -u origin main
   ```
3. Di GitHub, buka **Settings → Pages**.
4. Pada **Source**, pilih branch `main` dan folder `/ (root)`, lalu **Save**.
5. Tunggu beberapa menit — situs akan aktif di:
   `https://USERNAME.github.io/taawun-daham-2026/`

## 5. Uji coba sebelum disebar

- Buka situs, cek progress bar tampil `Rp0 / Rp300.000.000` (wajar, belum ada data `Verified`).
- Isi formulir konfirmasi donasi → cek baris baru muncul di Google Sheet dengan status `Pending`.
- Ubah status baris itu ke `Verified` di Sheet → muat ulang halaman → pastikan angka & tabel laporan ter-update.
- Cek tampilan di HP (mobile) — layout sudah responsif.

## Catatan

- Situs ini murni statis; tidak ada data sensitif yang tersimpan di kode. Yang perlu dijaga kerahasiaannya hanya akses **edit** ke Google Sheet (bagikan hanya ke panitia).
- Countdown hari tersisa dihitung otomatis berdasarkan tanggal perangkat pengunjung menuju **17 September 2026**, tidak bergantung pada Google Sheet.
- Untuk mengganti target dana atau tanggal penutupan, ubah `TARGET` dan `DEADLINE` di `js/app.js`.
