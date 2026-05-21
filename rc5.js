/*
  Implementasi RC5-32/r/b dari dasar untuk kebutuhan pembelajaran.
  Tidak menggunakan library kriptografi pihak ketiga.
  Parameter default: word 32-bit, block 64-bit, round 12.
*/

const RC5 = (() => {
  const WORD_SIZE = 32;
  const BYTES_PER_WORD = 4;
  const BLOCK_SIZE = 8;
  const MOD_MASK = 0xffffffff;
  const P32 = 0xB7E15163;
  const Q32 = 0x9E3779B9;

  function add(a, b) {
    return (a + b) >>> 0;
  }

  function sub(a, b) {
    return (a - b) >>> 0;
  }

  function rotl(x, y) {
    const s = y & 31;
    return ((x << s) | (x >>> (WORD_SIZE - s))) >>> 0;
  }

  function rotr(x, y) {
    const s = y & 31;
    return ((x >>> s) | (x << (WORD_SIZE - s))) >>> 0;
  }

  function utf8ToBytes(text) {
    return new TextEncoder().encode(text);
  }

  function bytesToUtf8(bytes) {
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  }

  function pkcs7Pad(bytes) {
    const remainder = bytes.length % BLOCK_SIZE;
    const padLength = remainder === 0 ? BLOCK_SIZE : BLOCK_SIZE - remainder;
    const padded = new Uint8Array(bytes.length + padLength);
    padded.set(bytes);
    padded.fill(padLength, bytes.length);
    return padded;
  }

  function pkcs7Unpad(bytes) {
    if (bytes.length === 0 || bytes.length % BLOCK_SIZE !== 0) {
      throw new Error('Data hasil dekripsi tidak valid. Ukuran blok salah.');
    }

    const padLength = bytes[bytes.length - 1];
    if (padLength < 1 || padLength > BLOCK_SIZE) {
      throw new Error('Padding tidak valid. Pastikan kunci dan ciphertext benar.');
    }

    for (let i = bytes.length - padLength; i < bytes.length; i++) {
      if (bytes[i] !== padLength) {
        throw new Error('Padding tidak valid. Pastikan kunci dan ciphertext benar.');
      }
    }

    return bytes.slice(0, bytes.length - padLength);
  }

  function readWordLE(bytes, offset) {
    return (
      bytes[offset] |
      (bytes[offset + 1] << 8) |
      (bytes[offset + 2] << 16) |
      (bytes[offset + 3] << 24)
    ) >>> 0;
  }

  function writeWordLE(word, output, offset) {
    output[offset] = word & 0xff;
    output[offset + 1] = (word >>> 8) & 0xff;
    output[offset + 2] = (word >>> 16) & 0xff;
    output[offset + 3] = (word >>> 24) & 0xff;
  }

  function expandKey(keyBytes, rounds = 12) {
    if (!keyBytes || keyBytes.length === 0) {
      throw new Error('Kunci tidak boleh kosong.');
    }

    const t = 2 * (rounds + 1);
    const c = Math.max(1, Math.ceil(keyBytes.length / BYTES_PER_WORD));
    const L = new Array(c).fill(0);

    for (let i = keyBytes.length - 1; i >= 0; i--) {
      const index = Math.floor(i / BYTES_PER_WORD);
      L[index] = (((L[index] << 8) >>> 0) + keyBytes[i]) >>> 0;
    }

    const S = new Array(t);
    S[0] = P32 >>> 0;
    for (let i = 1; i < t; i++) {
      S[i] = add(S[i - 1], Q32);
    }

    let A = 0;
    let B = 0;
    let i = 0;
    let j = 0;
    const v = 3 * Math.max(t, c);

    for (let s = 0; s < v; s++) {
      A = S[i] = rotl(add(add(S[i], A), B), 3);
      B = L[j] = rotl(add(add(L[j], A), B), add(A, B));
      i = (i + 1) % t;
      j = (j + 1) % c;
    }

    return S;
  }

  function encryptBlock(blockBytes, S, rounds = 12) {
    let A = readWordLE(blockBytes, 0);
    let B = readWordLE(blockBytes, 4);

    A = add(A, S[0]);
    B = add(B, S[1]);

    for (let i = 1; i <= rounds; i++) {
      A = add(rotl((A ^ B) >>> 0, B), S[2 * i]);
      B = add(rotl((B ^ A) >>> 0, A), S[2 * i + 1]);
    }

    const out = new Uint8Array(BLOCK_SIZE);
    writeWordLE(A, out, 0);
    writeWordLE(B, out, 4);
    return out;
  }

  function decryptBlock(blockBytes, S, rounds = 12) {
    let A = readWordLE(blockBytes, 0);
    let B = readWordLE(blockBytes, 4);

    for (let i = rounds; i >= 1; i--) {
      B = (rotr(sub(B, S[2 * i + 1]), A) ^ A) >>> 0;
      A = (rotr(sub(A, S[2 * i]), B) ^ B) >>> 0;
    }

    B = sub(B, S[1]);
    A = sub(A, S[0]);

    const out = new Uint8Array(BLOCK_SIZE);
    writeWordLE(A, out, 0);
    writeWordLE(B, out, 4);
    return out;
  }

  function encryptBytes(plainBytes, keyBytes, rounds = 12) {
    const padded = pkcs7Pad(plainBytes);
    const S = expandKey(keyBytes, rounds);
    const out = new Uint8Array(padded.length);

    for (let offset = 0; offset < padded.length; offset += BLOCK_SIZE) {
      const encrypted = encryptBlock(padded.slice(offset, offset + BLOCK_SIZE), S, rounds);
      out.set(encrypted, offset);
    }

    return out;
  }

  function decryptBytes(cipherBytes, keyBytes, rounds = 12) {
    if (cipherBytes.length === 0 || cipherBytes.length % BLOCK_SIZE !== 0) {
      throw new Error('Ciphertext harus berukuran kelipatan 8 byte.');
    }

    const S = expandKey(keyBytes, rounds);
    const out = new Uint8Array(cipherBytes.length);

    for (let offset = 0; offset < cipherBytes.length; offset += BLOCK_SIZE) {
      const decrypted = decryptBlock(cipherBytes.slice(offset, offset + BLOCK_SIZE), S, rounds);
      out.set(decrypted, offset);
    }

    return pkcs7Unpad(out);
  }

  function bytesToBase64(bytes) {
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  }

  function base64ToBytes(base64) {
    const clean = base64.replace(/\s+/g, '');
    const binary = atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function bytesToHex(bytes) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function hexToBytes(hex) {
    const clean = hex.replace(/\s+/g, '').toLowerCase();
    if (!/^[0-9a-f]*$/.test(clean) || clean.length % 2 !== 0) {
      throw new Error('Format hex tidak valid.');
    }
    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < clean.length; i += 2) {
      bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
    }
    return bytes;
  }

  function encryptText(plaintext, key, rounds = 12, format = 'base64') {
    const plainBytes = utf8ToBytes(plaintext);
    const keyBytes = utf8ToBytes(key);
    const cipherBytes = encryptBytes(plainBytes, keyBytes, rounds);
    return format === 'hex' ? bytesToHex(cipherBytes) : bytesToBase64(cipherBytes);
  }

  function decryptText(ciphertext, key, rounds = 12, format = 'base64') {
    const cipherBytes = format === 'hex' ? hexToBytes(ciphertext) : base64ToBytes(ciphertext);
    const keyBytes = utf8ToBytes(key);
    const plainBytes = decryptBytes(cipherBytes, keyBytes, rounds);
    return bytesToUtf8(plainBytes);
  }

  function bitDifference(bytesA, bytesB) {
    const max = Math.max(bytesA.length, bytesB.length);
    let diff = 0;
    for (let i = 0; i < max; i++) {
      let xor = (bytesA[i] || 0) ^ (bytesB[i] || 0);
      while (xor > 0) {
        diff += xor & 1;
        xor >>>= 1;
      }
    }
    return {
      differentBits: diff,
      totalBits: max * 8,
      percentage: max === 0 ? 0 : (diff / (max * 8)) * 100
    };
  }

  function avalancheTest(text, key, rounds = 12) {
    if (text.length === 0) throw new Error('Plaintext tidak boleh kosong untuk uji avalanche.');
    const modified = text.slice(0, -1) + String.fromCharCode(text.charCodeAt(text.length - 1) ^ 1);
    const keyBytes = utf8ToBytes(key);
    const cipherA = encryptBytes(utf8ToBytes(text), keyBytes, rounds);
    const cipherB = encryptBytes(utf8ToBytes(modified), keyBytes, rounds);
    return { modifiedText: modified, ...bitDifference(cipherA, cipherB) };
  }

  return {
    encryptText,
    decryptText,
    avalancheTest,
    utf8ToBytes,
    base64ToBytes,
    hexToBytes
  };
})();
