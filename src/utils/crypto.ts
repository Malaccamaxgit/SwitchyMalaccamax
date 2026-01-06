/**
 * Cryptographic utilities for securing sensitive data
 * Uses Web Crypto API for AES-GCM encryption
 */
import { Logger } from './Logger';

Logger.setComponentPrefix('Crypto');

// Key derivation parameters
const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 32;
const IV_LENGTH = 12;
const USER_SALT_KEY = 'crypto_user_salt';

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
      return Uint8Array.from(atob(saltStr), c => c.charCodeAt(0));
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
 * @returns Base64-encoded encrypted data with IV prepended
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

    // Return as base64 for safe storage
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    Logger.error('Encryption failed', error);
    throw new Error('Failed to encrypt sensitive data');
  }
}

/**
 * Decrypt sensitive text data
 * @param encrypted - Base64-encoded encrypted data with IV prepended
 * @returns Decrypted plaintext
 */
export async function decryptData(encrypted: string): Promise<string> {
  if (!encrypted) return encrypted;

  try {
    const key = await getEncryptionKey();
    
    // Decode base64
    const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));

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
 * Check if a string appears to be encrypted (base64 with sufficient length)
 */
export function isEncrypted(value: string | undefined): boolean {
  if (!value || value.length < 20) return false;
  
  // Base64 pattern check
  const base64Pattern = /^[A-Za-z0-9+/]+=*$/;
  return base64Pattern.test(value);
}

/**
 * Encrypt sensitive fields in a proxy profile
 */
export async function encryptProfile(profile: any): Promise<any> {
  const encrypted = { ...profile };

  // Encrypt username if present
  if (encrypted.username && !isEncrypted(encrypted.username)) {
    encrypted.username = await encryptData(encrypted.username);
    Logger.debug('Encrypted username', { profileId: profile.id });
  }

  // Encrypt password if present
  if (encrypted.password && !isEncrypted(encrypted.password)) {
    encrypted.password = await encryptData(encrypted.password);
    Logger.debug('Encrypted password', { profileId: profile.id });
  }

  return encrypted;
}

/**
 * Decrypt sensitive fields in a proxy profile
 */
export async function decryptProfile(profile: any): Promise<any> {
  const decrypted = { ...profile };

  // Decrypt username if encrypted
  if (decrypted.username && isEncrypted(decrypted.username)) {
    try {
      decrypted.username = await decryptData(decrypted.username);
    } catch (error) {
      Logger.warn('Failed to decrypt username, using encrypted value', { profileId: profile.id });
    }
  }

  // Decrypt password if encrypted
  if (decrypted.password && isEncrypted(decrypted.password)) {
    try {
      decrypted.password = await decryptData(decrypted.password);
    } catch (error) {
      Logger.warn('Failed to decrypt password, using encrypted value', { profileId: profile.id });
    }
  }

  return decrypted;
}
