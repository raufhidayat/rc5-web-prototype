+# Laporan Progress Minggu 2
+## Implementasi Algoritma RC5 untuk Enkripsi dan Dekripsi Data Berbasis Web
+
+## 1. Tujuan Implementasi Minggu 2
+- Membangun prototype awal sistem web statis untuk enkripsi/dekripsi.
+- Mengimplementasikan algoritma RC5-32 manual dari dasar.
+- Menyiapkan fitur utama agar alur sistem dapat didemokan.
+
+## 2. Fitur yang Sudah Dibuat
+- Form input plaintext/ciphertext dan secret key.
+- Mode operasi enkripsi/dekripsi.
+- Pilihan format Hex dan Base64.
+- Tombol jalankan proses dan salin hasil.
+- Area hasil output.
+- Log proses sederhana.
+- Validasi input kosong.
+- Pengujian awal avalanche effect sederhana.
+- Informasi ringkas alur sistem dan parameter RC5.
+
+## 3. Penjelasan Singkat Implementasi RC5
+Implementasi menggunakan RC5-32 dengan spesifikasi:
+- Word size 32-bit.
+- Block 64-bit (dua word: A dan B).
+- Default 12 round.
+
+Operasi inti yang dipakai:
+- XOR.
+- Penjumlahan modulo 2^32.
+- Pengurangan modulo 2^32.
+- Rotasi kiri (ROTL).
+- Rotasi kanan (ROTR).
+
+Fungsi utama yang sudah diimplementasikan:
+- `rotl(x, y)`
+- `rotr(x, y)`
+- `keyExpansion(keyBytes, rounds)`
+- `encryptBlock(blockBytes, keyBytes, rounds)`
+- `decryptBlock(blockBytes, keyBytes, rounds)`
+- `encryptText(plaintext, key, rounds, outputFormat)`
+- `decryptText(ciphertext, key, rounds, inputFormat)`
+
+Tambahan:
+- PKCS#7 padding sebelum enkripsi.
+- PKCS#7 unpadding setelah dekripsi.
+
+## 4. Pengujian Awal
+- Uji enkripsi plaintext dengan key tertentu menghasilkan ciphertext format Hex/Base64.
+- Uji dekripsi ciphertext dengan key sama mengembalikan plaintext semula.
+- Uji avalanche sederhana: membandingkan ciphertext dari dua plaintext dengan beda 1 karakter dan menghitung perubahan bit.
+
+## 5. Kendala
+- Perlu kehati-hatian tinggi pada operasi bit 32-bit di JavaScript karena tipe angka default adalah floating-point.
+- Validasi format input dekripsi (khususnya Base64/Hex) harus ketat agar tidak menghasilkan error yang membingungkan.
+
+## 6. Rencana Minggu 3
+- Menambahkan mode operasi blok (contoh CBC) untuk simulasi peningkatan keamanan.
+- Menambah pengujian terstruktur (test case tetap).
+- Menambah visualisasi langkah internal RC5 per round untuk kebutuhan presentasi.
+- Meningkatkan UX (indikator error/sukses lebih informatif).
 
EOF
)
