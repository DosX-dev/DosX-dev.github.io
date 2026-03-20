'use strict';

/* ============================================================
   CRYPTO  —  AES-256-GCM + Argon2id (WASM)
   ============================================================ */
const Crypto = (() => {

  async function deriveKey(password, salt) {
    // Use Argon2id via hash-wasm for key derivation
    const hash = await hashwasm.argon2id({
      password,
      salt,
      parallelism: ARGON2_PAR,
      iterations:  ARGON2_ITER,
      memorySize:  ARGON2_MEM,
      hashLength:  32,
      outputType:  'binary',
    });
    return crypto.subtle.importKey(
      'raw', hash,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async function encrypt(key, data) {
    const iv  = crypto.getRandomValues(new Uint8Array(12));
    const buf = data instanceof ArrayBuffer
      ? data
      : (data instanceof Uint8Array
        ? data.buffer
        : new TextEncoder().encode(typeof data === 'string' ? data : JSON.stringify(data)));
    const ct  = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, buf);
    return { iv: Array.from(iv), blob: buf2b64(ct) };
  }

  async function decrypt(key, iv, blobB64) {
    const ivU8 = new Uint8Array(iv);
    const buf  = b642buf(blobB64);
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv: ivU8 }, key, buf);
  }

  async function encryptBin(key, buf) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, buf);
    return { iv: Array.from(iv), blob: ct };
  }

  async function decryptBin(key, iv, blob) {
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(iv) }, key, blob);
  }

  async function makeVerification(key) {
    const { iv, blob } = await encrypt(key, VERIFY_TEXT);
    return { iv, blob };
  }

  async function checkVerification(key, iv, blob) {
    try {
      const buf = await decrypt(key, iv, blob);
      return new TextDecoder().decode(buf) === VERIFY_TEXT;
    } catch { return false; }
  }

  return { deriveKey, encrypt, decrypt, encryptBin, decryptBin, makeVerification, checkVerification };
})();
