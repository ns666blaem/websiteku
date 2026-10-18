# Pembaruan video profil

Kontrol putar, jeda, suara, posisi video, dan layar penuh ditempatkan di bawah video. Kontrol bawaan YouTube disembunyikan dengan parameter resmi `controls=0`, sehingga kontrol pemutaran tidak menutupi gambar. Tombol layar penuh tersedia pada browser yang mendukungnya.

Video tetap dimuat setelah pengunjung memilih Tonton di Website. Menutup jendela video menghentikan pemutaran. Jika pemutaran otomatis diblokir, pengunjung dapat menekan Putar. Tautan YouTube tersedia juga pada layar ponsel jika video gagal dimuat.

## Deploy

Ekstrak ZIP ini dan gunakan isinya untuk memperbarui proyek Vercel yang sama. Konfigurasi build proyek tetap `npm run build`, dengan direktori hasil `dist`. Halaman utama proyek Astro berada di `src/pages/index.astro`.

Setelah deploy selesai, buka Tonton di Website dan periksa video saat sedang diputar. Tombol Jeda berada di bawah gambar. Coba juga menutup lalu membuka video, serta tombol Putar, suara, dan penggeser durasi. Jika tampilan lama masih tersimpan di browser, muat ulang halaman dengan Ctrl+Shift+R.

## Pemeriksaan dan batasan

Sintaks JavaScript dan logika kontrol sudah diperiksa, termasuk pemutaran otomatis yang diblokir, penutupan saat pemutar masih dimuat, serta kegagalan memuat YouTube. Pengujian logika menggunakan simulasi API. Pemutaran YouTube langsung dan build Astro belum dapat diuji di lingkungan pengerjaan ini, sehingga perlu diperiksa setelah deploy.

Judul, logo, atau tampilan lain yang muncul saat mulai, jeda, dan akhir video tetap dikelola YouTube. Pembaruan ini memakai pengaturan resmi, tanpa menutupi atau memotong bagian pemutar.

Dokumentasi: [parameter pemutar YouTube](https://developers.google.com/youtube/player_parameters) dan [IFrame Player API](https://developers.google.com/youtube/iframe_api_reference).
