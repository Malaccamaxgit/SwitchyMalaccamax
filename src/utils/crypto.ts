/**
 * Cryptographic utilities for securing sensitive data
 * Uses Web Crypto API for AES-GCM encryption
 */
import { Logger } from './Logger';

Logger.setComponentPrefix('Crypto');

/** Prefix for ciphertext so we do not mis-detect random base64-looking plaintext as encrypted. */
export const ENCRYPTED_PREFIX = 'SM1:';

// Key derivation parameters
const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 32;
const IV_LENGTH = 12;
const USER_SALT_KEY = 'crypto_user_salt';

const BASE64_CHUNK = 0x8000;

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += BASE64_CHUNK) {
    const sub = bytes.subarray(i, i + BASE64_CHUNK);
    binary += String.fromCharCode(...sub);
  }
  return btoa(binary);
}

function base64ToUint8(b64: string): Uint8Array {
  const binary = atob(b64);
  const len = binary.length;
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

/**
 * Generate or retrieve user-specific random salt
 * Security: Adds per-user entropy to prevent cross-user key predictability
 */
async function getUserSalt(): Promise<Uint8Array> {
  try {
    const stored = await chrome.storage.local.get(USER_SALT_KEY);

    if (stored[USER_SALT_KEY]) {
      // Convert stored base64 back to Uint8Array
      const saltStr = stored[USER_SALT_KEY];
      return Uint8Array.from(atob(saltStr as string), c => c.charCodeAt(0));
    }

    // Generate new random salt
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

    // Store as base64
    const saltStr = btoa(String.fromCharCode(...salt));
    await chrome.storage.local.set({ [USER_SALT_KEY]: saltStr });

    Logger.info('Generated new user-specific encryption salt');
    return salt;
  } catch (error) {
    Logger.error('Failed to get/generate user salt', error);
    // Fallback to deterministic salt (degraded security)
    const fallback = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(chrome.runtime.id + Date.now())
    );
    return new Uint8Array(fallback).slice(0, SALT_LENGTH);
  }
}

/**
 * Generate encryption key from extension ID + user-specific salt
 * Security: Combines extension ID (installation-unique) with random user salt (user-unique)
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  // Use extension ID as base material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(chrome.runtime.id),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Get user-specific random salt
  const userSalt = await getUserSalt();

  // Convert to plain ArrayBuffer for compatibility
  const saltBuffer = userSalt.slice().buffer as ArrayBuffer;

  // Derive encryption key with user salt
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt sensitive text data (proxy credentials)
 * @param plaintext - Sensitive data to encrypt
 * @returns Base64-encoded encrypted data with IV prepended, with version prefix
 */
export async function encryptData(plaintext: string): Promise<string> {
  if (!plaintext) return plaintext;

  try {
    const key = await getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encoded = new TextEncoder().encode(plaintext);

    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    // Prepend IV to ciphertext for storage
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);

    return ENCRYPTED_PREFIX + uint8ToBase64(combined);
  } catch (error) {
    Logger.error('Encryption failed', error);
    throw new Error('Failed to encrypt sensitive data');
  }
}

/**
 * Decrypt sensitive text data
 * @param encrypted - Output from encryptData (prefixed) or legacy unprefixed base64
 * @returns Decrypted plaintext
 */
export async function decryptData(encrypted: string): Promise<string> {
  if (!encrypted) return encrypted;

  try {
    const key = await getEncryptionKey();

    let combined: Uint8Array;
    if (encrypted.startsWith(ENCRYPTED_PREFIX)) {
      combined = base64ToUint8(encrypted.slice(ENCRYPTED_PREFIX.length));
    } else {
      combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
    }

    // Extract IV and ciphertext
    const iv = combined.slice(0, IV_LENGTH);
    const ciphertext = combined.slice(IV_LENGTH);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    Logger.error('Decryption failed', error);
    throw new Error('Failed to decrypt sensitive data');
  }
}

/**
 * True if the value is our ciphertext or (legacy) long base64-like strings.
 * Heuristic path can false-positive on long base64-looking passwords; prefer SM1: for new data.
 */
export function isEncrypted(value: string | undefined): boolean {
  if (!value) return false;

  if (value.startsWith(ENCRYPTED_PREFIX)) {
    return value.length > ENCRYPTED_PREFIX.length + 20;
  }

  if (value.length < 20) return false;

  const base64Pattern = /^[A-Za-z0-9+/]+=*$/;
  return base64Pattern.test(value);
}

/**
 * Encrypt sensitive fields in a proxy profile
 */
export async function encryptProfile(profile: Record<string, unknown>): Promise<Record<string, unknown>> {
  const encrypted: Record<string, unknown> = { ...profile };

  // Encrypt username if present
  const username = (encrypted as Record<string, unknown>).username;
  if (typeof username === 'string' && !isEncrypted(username)) {
    (encrypted as Record<string, unknown>).username = await encryptData(username);
    Logger.debug('Encrypted username', { profileId: (profile as Record<string, unknown>).id });
  }

  // Encrypt password if present
  const password = (encrypted as Record<string, unknown>).password;
  if (typeof password === 'string' && !isEncrypted(password)) {
    (encrypted as Record<string, unknown>).password = await encryptData(password);
    Logger.debug('Encrypted password', { profileId: (profile as Record<string, unknown>).id });
  }

  return encrypted;
}

/**
 * Decrypt sensitive fields in a proxy profile
 */
export async function decryptProfile(profile: Record<string, unknown>): Promise<Record<string, unknown>> {
  const decrypted: Record<string, unknown> = { ...profile };

  // Decrypt username if encrypted
  const encUsername = (decrypted as Record<string, unknown>).username;
  if (typeof encUsername === 'string' && isEncrypted(encUsername)) {
    try {
      (decrypted as Record<string, unknown>).username = await decryptData(encUsername);
    } catch (error) {
      Logger.warn('Failed to decrypt username, using encrypted value', { profileId: (profile as Record<string, unknown>).id, error: String(error) });
    }
  }

  // Decrypt password if encrypted
  const encPassword = (decrypted as Record<string, unknown>).password;
  if (typeof encPassword === 'string' && isEncrypted(encPassword)) {
    try {
      (decrypted as Record<string, unknown>).password = await decryptData(encPassword);
    } catch (error) {
      Logger.warn('Failed to decrypt password, using encrypted value', { profileId: (profile as Record<string, unknown>).id, error: String(error) });
    }
  }

  return decrypted;
}
