# RC5 Web Encryption Prototype

Prototype sistem keamanan minggu 2 untuk tugas kelompok mata kuliah Sistem Keamanan.

## Judul Proyek
Implementasi Algoritma RC5 untuk Enkripsi dan Dekripsi Data Berbasis Web

## Fitur Minggu 2
- Antarmuka web sederhana untuk input plaintext/ciphertext dan kunci rahasia.
- Implementasi awal algoritma RC5 dari dasar tanpa library kriptografi pihak ketiga.
- Proses enkripsi teks ke Base64 atau Hex.
- Proses dekripsi ciphertext kembali menjadi plaintext.
- Validasi input dasar.
- Log proses: mode, jumlah round, ukuran blok, panjang kunci, dan waktu proses.
- Pengujian awal avalanche effect sederhana.

## Parameter RC5
- Word size: 32-bit
- Block size: 64-bit
- Round default: 12
- Padding: PKCS#7
- Format ciphertext: Base64 atau Hex

## Struktur Folder
```text
rc5-web-prototype/
├── index.html
├── style.css
├── rc5.js
├── app.js
├── README.md
└── LAPORAN_MINGGU_2.md
```

## Cara Menjalankan Lokal
1. Unduh atau clone repository.
2. Buka folder proyek.
3. Klik dua kali file `index.html` atau buka menggunakan ekstensi Live Server di Visual Studio Code.
4. Masukkan plaintext dan kunci, lalu klik **Jalankan Proses**.

## Catatan Keamanan
Prototype ini dibuat untuk pembelajaran. Sistem belum menggunakan mode operasi blok lanjutan seperti CBC/CTR, belum memakai IV/nonce, dan belum ditujukan untuk penggunaan produksi.
