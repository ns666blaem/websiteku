# Mode Pemilik: mengecualikan kunjungan sendiri

Setelah versi ini selesai di-deploy ke Vercel, buka alamat berikut **satu kali** pada browser yang biasa digunakan:

```text
https://nordy-sukmana.vercel.app/?analytics=off
```

Parameter `analytics=off` akan langsung dihapus dari bilah alamat. Browser tersebut kemudian disimpan sebagai browser pemilik, sehingga skrip Vercel Web Analytics dan Speed Insights tidak dimuat pada kunjungan berikutnya.

## Perangkat atau browser lain

Aktifkan alamat di atas secara terpisah pada setiap browser, profil browser, ponsel, atau komputer yang digunakan. Mode pemilik tersimpan di browser, bukan pada akun Vercel atau alamat IP.

## Mengaktifkan pencatatan kembali

Buka alamat berikut satu kali:

```text
https://nordy-sukmana.vercel.app/?analytics=on
```

## Perilaku otomatis

- Kunjungan pada `localhost` tidak dicatat.
- Deployment preview Vercel tidak dicatat.
- Jika situs produksi dibuka langsung dari halaman Vercel, mode pemilik akan diaktifkan pada browser tersebut.
- Data kunjungan yang sudah tercatat sebelum mode pemilik diaktifkan tidak dapat dihapus oleh kode ini.
