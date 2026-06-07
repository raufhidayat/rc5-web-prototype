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

// Elemen monitor pembelajaran
const monitorEmpty = document.getElementById('monitorEmpty');
const monitorContent = document.getElementById('monitorContent');
const monitorModeBadge = document.getElementById('monitorModeBadge');
const pipeline = document.getElementById('pipeline');
const monitorInputSize = document.getElementById('monitorInputSize');
const monitorBlockCount = document.getElementById('monitorBlockCount');
const monitorPadding = document.getElementById('monitorPadding');
const monitorSubkeyCount = document.getElementById('monitorSubkeyCount');
const monitorBlock = document.getElementById('monitorBlock');
const monitorRound = document.getElementById('monitorRound');
const roundCaption = document.getElementById('roundCaption');
const roundTitle = document.getElementById('roundTitle');
const roundExplanation = document.getElementById('roundExplanation');
const beforeA = document.getElementById('beforeA');
const beforeB = document.getElementById('beforeB');
const afterA = document.getElementById('afterA');
const afterB = document.getElementById('afterB');
const blockDetail = document.getElementById('blockDetail');
const subkeyDetail = document.getElementById('subkeyDetail');

let currentTrace = null;

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
  if (rounds > 20) throw new Error('Jumlah round maksimal 20 pada antarmuka pembelajaran ini.');
}

function shorten(text, max = 42) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function resetMonitor() {
  currentTrace = null;
  monitorModeBadge.textContent = 'Belum ada proses';
  monitorEmpty.hidden = false;
  monitorContent.hidden = true;
  pipeline.innerHTML = '';
  monitorBlock.innerHTML = '';
  monitorRound.innerHTML = '';
}

function pipelineCard(title, text, hint = '') {
  return `
    <div class="pipeline-step">
      <span>${title}</span>
      <strong>${text}</strong>
      ${hint ? `<small>${hint}</small>` : ''}
    </div>`;
}

function renderPipeline(trace) {
  if (trace.mode === 'encrypt') {
    pipeline.innerHTML = [
      pipelineCard('1. Plaintext', `${trace.inputBytes.length} byte`, shorten(RC5.bytesToHex(trace.inputBytes, true))),
      pipelineCard('2. PKCS#7 Padding', `+${trace.paddingLength} byte`, `${trace.paddedBytes.length} byte setelah padding`),
      pipelineCard('3. Pembagian Blok', `${trace.blocks.length} blok`, 'Setiap blok berukuran 64-bit / 8 byte'),
      pipelineCard('4. Key Expansion', `${trace.subkeys.length} subkey`, 'Kunci rahasia tidak ditampilkan'),
      pipelineCard('5. Round RC5', `${trace.rounds} putaran`, 'XOR, rotasi bit, dan penjumlahan modulo'),
      pipelineCard('6. Encoding Output', trace.format.toUpperCase(), shorten(trace.outputText))
    ].join('<span class="pipeline-arrow">→</span>');
  } else {
    pipeline.innerHTML = [
      pipelineCard('1. Ciphertext', `${trace.inputBytes.length} byte`, `${trace.format.toUpperCase()} diterjemahkan ke byte`),
      pipelineCard('2. Pembagian Blok', `${trace.blocks.length} blok`, 'Setiap blok berukuran 64-bit / 8 byte'),
      pipelineCard('3. Key Expansion', `${trace.subkeys.length} subkey`, 'Subkey sama jika kunci sama'),
      pipelineCard('4. Round Balik', `${trace.rounds} putaran`, 'Urutan round dibalik'),
      pipelineCard('5. Hapus Padding', `-${trace.paddingLength} byte`, 'PKCS#7 unpadding'),
      pipelineCard('6. Plaintext', `${trace.outputBytes.length} byte`, shorten(trace.outputText))
    ].join('<span class="pipeline-arrow">→</span>');
  }
}

function populateMonitorSelectors(trace) {
  monitorBlock.innerHTML = trace.blocks
    .map((_, index) => `<option value="${index}">Blok ${index + 1}</option>`)
    .join('');

  renderRoundOptions();
}

function renderRoundOptions() {
  if (!currentTrace) return;
  const block = currentTrace.blocks[Number(monitorBlock.value || 0)];
  monitorRound.innerHTML = block.stages
    .map((stage, index) => `<option value="${index}">${stage.label}</option>`)
    .join('');
  monitorRound.value = '0';
  renderRoundDetail();
}

function renderRoundDetail() {
  if (!currentTrace) return;
  const blockIndex = Number(monitorBlock.value || 0);
  const stageIndex = Number(monitorRound.value || 0);
  const block = currentTrace.blocks[blockIndex];
  const stage = block.stages[stageIndex];

  roundCaption.textContent = `Blok ${blockIndex + 1} dari ${currentTrace.blocks.length}`;
  roundTitle.textContent = stage.label;
  roundExplanation.textContent = stage.explanation;
  beforeA.textContent = RC5.hexWord(stage.beforeA);
  beforeB.textContent = RC5.hexWord(stage.beforeB);
  afterA.textContent = RC5.hexWord(stage.afterA);
  afterB.textContent = RC5.hexWord(stage.afterB);

  blockDetail.textContent = [
    `Input blok  : ${RC5.bytesToHex(block.input, true)}`,
    `Output blok : ${RC5.bytesToHex(block.output, true)}`,
    '',
    'Catatan:',
    'Setiap blok berisi 8 byte atau 64 bit.',
    'Blok dibagi menjadi word A dan word B, masing-masing 32 bit.'
  ].join('\n');

  if (stage.subkeys) {
    subkeyDetail.textContent = [
      `Subkey 1 : ${RC5.hexWord(stage.subkeys[0])}`,
      `Subkey 2 : ${RC5.hexWord(stage.subkeys[1])}`,
      '',
      'Subkey berasal dari proses key expansion.',
      'Kunci rahasia asli tidak ditampilkan pada monitor.'
    ].join('\n');
  } else {
    subkeyDetail.textContent = 'Tahap ini tidak menggunakan subkey baru.\nPilih tahap pra-round atau salah satu round untuk melihat subkey.';
  }
}

function renderMonitor(trace) {
  currentTrace = trace;
  monitorEmpty.hidden = true;
  monitorContent.hidden = false;
  monitorModeBadge.textContent = trace.mode === 'encrypt' ? 'Mode Enkripsi' : 'Mode Dekripsi';
  monitorInputSize.textContent = `${trace.inputBytes.length} byte`;
  monitorBlockCount.textContent = `${trace.blocks.length} blok`;
  monitorPadding.textContent = `${trace.paddingLength} byte`;
  monitorSubkeyCount.textContent = `${trace.subkeys.length} buah`;
  renderPipeline(trace);
  populateMonitorSelectors(trace);
}

processBtn.addEventListener('click', () => {
  try {
    const text = inputTextEl.value;
    const key = secretKeyEl.value;
    const rounds = Number(roundsEl.value);
    const format = outputFormatEl.value;
    validateInput(text, key, rounds);

    const start = performance.now();
    const trace = modeEl.value === 'encrypt'
      ? RC5.traceEncryptText(text, key, rounds, format)
      : RC5.traceDecryptText(text, key, rounds, format);
    const end = performance.now();

    outputTextEl.value = trace.outputText;
    renderMonitor(trace);
    setMessage('Proses berhasil dijalankan. Monitor RC5 telah diperbarui.', 'success');

    logBox.textContent = [
      `Mode              : ${modeEl.value === 'encrypt' ? 'Enkripsi' : 'Dekripsi'}`,
      `Algoritma         : RC5-32/${rounds}`,
      `Ukuran blok       : 64 bit`,
      `Panjang kunci     : ${RC5.utf8ToBytes(key).length} byte`,
      `Ukuran input      : ${trace.inputBytes.length} byte`,
      `Jumlah blok       : ${trace.blocks.length}`,
      `Padding PKCS#7    : ${trace.paddingLength} byte`,
      `Format            : ${format.toUpperCase()}`,
      `Waktu proses      : ${(end - start).toFixed(3)} ms`,
      `Status            : Berhasil`
    ].join('\n');
  } catch (error) {
    outputTextEl.value = '';
    resetMonitor();
    setMessage(error.message, 'error');
    logBox.textContent = `Status: Gagal\nPesan : ${error.message}`;
  }
});

clearBtn.addEventListener('click', () => {
  inputTextEl.value = '';
  outputTextEl.value = '';
  secretKeyEl.value = '';
  secretKeyEl.type = 'password';
  toggleKeyBtn.textContent = 'Lihat';
  logBox.textContent = 'Menunggu proses...';
  avalancheBox.textContent = 'Belum ada hasil pengujian.';
  resetMonitor();
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

monitorBlock.addEventListener('change', renderRoundOptions);
monitorRound.addEventListener('change', renderRoundDetail);

modeEl.addEventListener('change', () => {
  updateLabels();

  // Menghapus data sensitif dan hasil lama ketika mode diubah.
  inputTextEl.value = '';
  outputTextEl.value = '';
  secretKeyEl.value = '';
  secretKeyEl.type = 'password';
  toggleKeyBtn.textContent = 'Lihat';
  logBox.textContent = 'Menunggu proses...';
  avalancheBox.textContent = 'Belum ada hasil pengujian.';
  resetMonitor();
  setMessage('Mode berhasil diubah. Masukkan kembali teks dan kunci rahasia.');
});

updateLabels();
resetMonitor();
