const modeEl = document.getElementById('mode');
const inputTextEl = document.getElementById('inputText');
const secretKeyEl = document.getElementById('secretKey');
const roundsEl = document.getElementById('rounds');
const outputFormatEl = document.getElementById('outputFormat');
const outputTextEl = document.getElementById('outputText');
const processBtn = document.getElementById('processBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const toggleKeyBtn = document.getElementById('toggleKey');
const messageEl = document.getElementById('message');
const logBox = document.getElementById('logBox');
const inputLabel = document.getElementById('inputLabel');
const outputLabel = document.getElementById('outputLabel');
const avalancheBtn = document.getElementById('avalancheBtn');
const avalancheBox = document.getElementById('avalancheBox');

function setMessage(text, type = '') {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`.trim();
}

function updateLabels() {
  const isEncrypt = modeEl.value === 'encrypt';
  inputLabel.textContent = isEncrypt ? 'Plaintext' : 'Ciphertext';
  outputLabel.textContent = isEncrypt ? 'Ciphertext' : 'Plaintext';
  inputTextEl.placeholder = isEncrypt
    ? 'Contoh: Data rahasia kelompok 4'
    : 'Masukkan ciphertext Base64 atau Hex sesuai format output';
}

function validateInput(text, key, rounds) {
  if (!text.trim()) throw new Error('Input teks tidak boleh kosong.');
  if (!key) throw new Error('Kunci rahasia tidak boleh kosong.');
  if (key.length < 4) throw new Error('Kunci terlalu pendek. Gunakan minimal 4 karakter untuk uji awal.');
  if (rounds < 12) throw new Error('Jumlah round minimal 12 sesuai rancangan proyek.');
}

processBtn.addEventListener('click', () => {
  try {
    const text = inputTextEl.value;
    const key = secretKeyEl.value;
    const rounds = Number(roundsEl.value);
    const format = outputFormatEl.value;
    validateInput(text, key, rounds);

    const start = performance.now();
    let result;
    if (modeEl.value === 'encrypt') {
      result = RC5.encryptText(text, key, rounds, format);
    } else {
      result = RC5.decryptText(text, key, rounds, format);
    }
    const end = performance.now();

    outputTextEl.value = result;
    setMessage('Proses berhasil dijalankan.', 'success');

    const inputBytes = modeEl.value === 'encrypt'
      ? RC5.utf8ToBytes(text).length
      : (format === 'hex' ? RC5.hexToBytes(text).length : RC5.base64ToBytes(text).length);

    logBox.textContent = [
      `Mode              : ${modeEl.value === 'encrypt' ? 'Enkripsi' : 'Dekripsi'}`,
      `Algoritma         : RC5-32/${rounds}`,
      `Ukuran blok       : 64 bit`,
      `Panjang kunci     : ${RC5.utf8ToBytes(key).length} byte`,
      `Ukuran input      : ${inputBytes} byte`,
      `Format output     : ${format.toUpperCase()}`,
      `Waktu proses      : ${(end - start).toFixed(3)} ms`,
      `Status            : Berhasil`
    ].join('\n');
  } catch (error) {
    outputTextEl.value = '';
    setMessage(error.message, 'error');
    logBox.textContent = `Status: Gagal\nPesan : ${error.message}`;
  }
});

clearBtn.addEventListener('click', () => {
  inputTextEl.value = '';
  outputTextEl.value = '';
  secretKeyEl.value = '';
  logBox.textContent = 'Menunggu proses...';
  avalancheBox.textContent = 'Belum ada hasil pengujian.';
  setMessage('');
});

copyBtn.addEventListener('click', async () => {
  if (!outputTextEl.value) return setMessage('Tidak ada hasil untuk disalin.', 'error');
  await navigator.clipboard.writeText(outputTextEl.value);
  setMessage('Hasil berhasil disalin.', 'success');
});

toggleKeyBtn.addEventListener('click', () => {
  const visible = secretKeyEl.type === 'text';
  secretKeyEl.type = visible ? 'password' : 'text';
  toggleKeyBtn.textContent = visible ? 'Lihat' : 'Sembunyi';
});

avalancheBtn.addEventListener('click', () => {
  try {
    const text = inputTextEl.value;
    const key = secretKeyEl.value;
    const rounds = Number(roundsEl.value);
    validateInput(text, key, rounds);
    if (modeEl.value !== 'encrypt') {
      throw new Error('Uji avalanche menggunakan plaintext. Ubah mode ke Enkripsi terlebih dahulu.');
    }

    const result = RC5.avalancheTest(text, key, rounds);
    avalancheBox.textContent = [
      `Plaintext asli      : ${text}`,
      `Plaintext modifikasi: ${result.modifiedText}`,
      `Bit berbeda        : ${result.differentBits} dari ${result.totalBits} bit`,
      `Avalanche effect   : ${result.percentage.toFixed(2)}%`,
      `Catatan            : Nilai mendekati 50% menunjukkan perubahan bit menyebar cukup baik.`
    ].join('\n');
  } catch (error) {
    avalancheBox.textContent = `Pengujian gagal: ${error.message}`;
  }
});

modeEl.addEventListener('change', () => {
  updateLabels();

  // Menghapus kunci ketika mode proses diganti
  secretKeyEl.value = '';

  // Mengembalikan kolom kunci ke kondisi tersembunyi
  secretKeyEl.type = 'password';
  toggleKeyBtn.textContent = 'Lihat';

  // Menghapus hasil dan log proses sebelumnya
  outputTextEl.value = '';
  logBox.textContent = 'Menunggu proses...';
  avalancheBox.textContent = 'Belum ada hasil pengujian.';

  setMessage('Mode berhasil diubah. Masukkan kembali kunci rahasia.');
});

updateLabels();
