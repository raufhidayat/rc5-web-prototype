# RC5 Learning Lab

Web pembelajaran untuk melakukan enkripsi dan dekripsi teks menggunakan algoritma RC5-32/r/b yang diimplementasikan dari dasar tanpa library kriptografi pihak ketiga.

## Fitur utama

- Enkripsi plaintext menjadi ciphertext.
- Dekripsi ciphertext menjadi plaintext.
- Output Base64 atau Hex.
- Jumlah round dapat dipilih, dengan nilai default 12.
- Padding PKCS#7.
- Reset kunci dan data sensitif ketika mode diganti.
- Uji avalanche effect sederhana.
- Monitor proses RC5 untuk melihat perubahan data secara bertahap.

## Monitor proses RC5

Setelah pengguna menekan tombol **Jalankan Proses**, monitor menampilkan:

1. perubahan input menjadi byte;
2. jumlah padding PKCS#7;
3. pembagian data menjadi blok 64-bit;
4. jumlah subkey dari proses key expansion;
5. nilai word A dan B sebelum dan sesudah setiap round;
6. subkey yang digunakan pada tahap terpilih;
7. output akhir dalam Base64 atau Hex.

Kunci rahasia asli tidak ditampilkan pada monitor dan tidak disimpan ke localStorage, sessionStorage, database, atau file.

## Cara menjalankan

Buka file `index.html` secara langsung melalui browser.
