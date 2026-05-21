# Laporan Progress Minggu 2

## Judul Proyek
Implementasi Algoritma RC5 untuk Enkripsi dan Dekripsi Data Berbasis Web

## Kelompok
Kelompok 4

## Progress Minggu 2
Pada minggu kedua, kelompok mulai mengimplementasikan prototype sistem berbasis web sesuai rancangan minggu pertama. Fokus utama pekerjaan adalah pembuatan antarmuka pengguna, implementasi fitur enkripsi dan dekripsi teks, serta implementasi awal algoritma RC5 tanpa menggunakan library kriptografi pihak ketiga.

## Fitur yang Sudah Berjalan
| No | Fitur | Status | Keterangan |
|---|---|---|---|
| 1 | Input plaintext/ciphertext | Berjalan | Pengguna dapat memasukkan teks yang akan diproses. |
| 2 | Input kunci rahasia | Berjalan | Kunci digunakan untuk proses key expansion RC5. |
| 3 | Enkripsi teks | Berjalan | Plaintext dikonversi menjadi ciphertext Base64 atau Hex. |
| 4 | Dekripsi teks | Berjalan | Ciphertext dapat dikembalikan menjadi plaintext jika kunci benar. |
| 5 | Validasi input | Berjalan | Sistem menolak input kosong, kunci kosong, dan round kurang dari 12. |
| 6 | Log proses | Berjalan | Sistem menampilkan informasi mode, round, ukuran input, dan waktu proses. |
| 7 | Uji avalanche sederhana | Berjalan awal | Sistem membandingkan perbedaan bit ciphertext dari dua plaintext yang sedikit berbeda. |

## Implementasi Awal Algoritma RC5
Algoritma RC5 diimplementasikan dengan parameter RC5-32/12. Sistem menggunakan ukuran word 32-bit, ukuran blok 64-bit, dan jumlah round default 12. Proses yang sudah dibuat meliputi:

1. Konversi plaintext menjadi byte UTF-8.
2. Padding PKCS#7 agar panjang data menjadi kelipatan 8 byte.
3. Ekspansi kunci menjadi subkey RC5.
4. Enkripsi blok menggunakan operasi XOR, penjumlahan modulo 2^32, dan rotasi bit.
5. Dekripsi blok dengan urutan operasi kebalikan.
6. Konversi hasil menjadi Base64 atau Hex.

## Alur Sistem
1. Pengguna membuka aplikasi web.
2. Pengguna memilih mode enkripsi atau dekripsi.
3. Pengguna memasukkan teks dan kunci rahasia.
4. Sistem melakukan validasi input.
5. Sistem melakukan key expansion.
6. Sistem menjalankan proses enkripsi atau dekripsi RC5.
7. Sistem menampilkan hasil dan log proses.

## Pengujian Awal
| Skenario | Input | Hasil yang Diharapkan | Status |
|---|---|---|---|
| Enkripsi teks | Plaintext dan kunci valid | Sistem menghasilkan ciphertext | Berhasil |
| Dekripsi teks | Ciphertext dan kunci benar | Sistem menghasilkan plaintext awal | Berhasil |
| Kunci kosong | Plaintext ada, kunci kosong | Sistem menampilkan pesan error | Berhasil |
| Round kurang dari 12 | Round diisi 10 | Sistem menolak proses | Berhasil |
| Ciphertext salah | Ciphertext tidak valid | Sistem menampilkan pesan error | Berhasil |

## Kendala
Kendala pada minggu kedua adalah memastikan operasi bitwise JavaScript tetap berjalan sebagai bilangan 32-bit unsigned. Selain itu, format ciphertext perlu dibuat jelas agar pengguna tidak salah memasukkan data saat proses dekripsi.

## Rencana Minggu 3
1. Memperbaiki bug dari hasil pengujian lanjutan.
2. Menambahkan test vector sederhana untuk memastikan hasil enkripsi dan dekripsi konsisten.
3. Menambahkan screenshot sistem ke laporan akhir.
4. Menyempurnakan analisis keamanan, termasuk keterbatasan RC5 dan prototype.
5. Menyiapkan demo sistem dan slide presentasi.
