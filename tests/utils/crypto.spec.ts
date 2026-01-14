import { describe, it, expect } from 'vitest';
import { encryptData, decryptData, isEncrypted, encryptProfile, decryptProfile } from '../../src/utils/crypto';

// Mock chrome API for testing
const mockStorage: Record<string, unknown> = {};
global.chrome = {
  runtime: {
    id: 'test-extension-id-12345',
  },
  storage: {
    local: {
      get: async (key: string | string[]) => {
        const keys = Array.isArray(key) ? key : [key];
        const result: Record<string, unknown> = {};
        keys.forEach(k => {
          if (mockStorage[k]) result[k] = mockStorage[k];
        });
        return result;
      },
      set: async (items: Record<string, unknown>) => {
        Object.assign(mockStorage, items);
      },
    },
  },
} as unknown as typeof chrome;

describe('Crypto Utilities', () => {
  describe('encryptData / decryptData', () => {
    it('should encrypt and decrypt simple text', async () => {
      const plaintext = 'my-secret-password';
      const encrypted = await encryptData(plaintext);
      const decrypted = await decryptData(encrypted);

      expect(encrypted).not.toBe(plaintext);
      expect(encrypted.length).toBeGreaterThan(20);
      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertexts for same plaintext (random IV)', async () => {
      const plaintext = 'test-password';
      const encrypted1 = await encryptData(plaintext);
      const encrypted2 = await encryptData(plaintext);

      expect(encrypted1).not.toBe(encrypted2);
      
      // Both should decrypt correctly
      expect(await decryptData(encrypted1)).toBe(plaintext);
      expect(await decryptData(encrypted2)).toBe(plaintext);
    });

    it('should handle empty strings', async () => {
      expect(await encryptData('')).toBe('');
      expect(await decryptData('')).toBe('');
    });

    it('should handle special characters', async () => {
      const special = 'p@ssw0rd!#$%^&*(){}[]|\\:;"\'<>,.?/~`';
      const encrypted = await encryptData(special);
      const decrypted = await decryptData(encrypted);

      expect(decrypted).toBe(special);
    });

    it('should handle Unicode characters', async () => {
      const unicode = '密码🔒中文パスワード';
      const encrypted = await encryptData(unicode);
      const decrypted = await decryptData(encrypted);

      expect(decrypted).toBe(unicode);
    });

    it('should produce base64-encoded output', async () => {
      const encrypted = await encryptData('test');
      const base64Pattern = /^[A-Za-z0-9+/]+=*$/;
      
      expect(base64Pattern.test(encrypted)).toBe(true);
    });

    it('should throw error on invalid encrypted data', async () => {
      await expect(decryptData('invalid-base64-!@#')).rejects.toThrow();
      await expect(decryptData('dG9vc2hvcnQ=')).rejects.toThrow(); // Too short
    });
  });

  describe('isEncrypted', () => {
    it('should identify encrypted strings', async () => {
      const encrypted = await encryptData('password123');
      expect(isEncrypted(encrypted)).toBe(true);
    });

    it('should reject plaintext strings', () => {
      expect(isEncrypted('plaintext')).toBe(false);
      expect(isEncrypted('user@example.com')).toBe(false);
      expect(isEncrypted('short')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isEncrypted('')).toBe(false);
      expect(isEncrypted(undefined)).toBe(false);
      expect(isEncrypted('abc')).toBe(false); // Too short
    });

    it('should reject invalid base64', () => {
      expect(isEncrypted('not-base64-!@#$%^&*()')).toBe(false);
      expect(isEncrypted('has spaces in it')).toBe(false);
    });
  });

  describe('encryptProfile / decryptProfile', () => {
    const testProfile = {
      id: 'test-profile-1',
      name: 'Test Proxy',
      type: 'FixedProfile',
      color: 'blue',
      host: 'proxy.example.com',
      port: 8080,
      proxyType: 'HTTP',
      username: 'testuser',
      password: 'testpass123',
    };

    it('should encrypt username and password', async () => {
      const encrypted = await encryptProfile(testProfile);

      expect(encrypted.username).not.toBe(testProfile.username);
      expect(encrypted.password).not.toBe(testProfile.password);
      expect(isEncrypted(encrypted.username as string | undefined)).toBe(true);
      expect(isEncrypted(encrypted.password as string | undefined)).toBe(true);

      // Other fields unchanged
      expect(encrypted.id).toBe(testProfile.id);
      expect(encrypted.name).toBe(testProfile.name);
      expect(encrypted.host).toBe(testProfile.host);
      expect(encrypted.port).toBe(testProfile.port);
    });

    it('should decrypt username and password', async () => {
      const encrypted = await encryptProfile(testProfile);
      const decrypted = await decryptProfile(encrypted);

      expect(decrypted.username).toBe(testProfile.username);
      expect(decrypted.password).toBe(testProfile.password);
      expect(decrypted.id).toBe(testProfile.id);
      expect(decrypted.name).toBe(testProfile.name);
    });

    it('should handle profiles without credentials', async () => {
      const noCredentials = {
        id: 'direct-profile',
        name: 'Direct',
        type: 'DirectProfile',
        color: 'gray',
      };

      const encrypted = await encryptProfile(noCredentials);
      const decrypted = await decryptProfile(encrypted);

      expect(encrypted).toEqual(noCredentials);
      expect(decrypted).toEqual(noCredentials);
    });

    it('should not double-encrypt already encrypted fields', async () => {
      const encrypted = await encryptProfile(testProfile);
      const doubleEncrypted = await encryptProfile(encrypted);

      // Should not change (already encrypted)
      expect(doubleEncrypted.username).toBe(encrypted.username);
      expect(doubleEncrypted.password).toBe(encrypted.password);
    });

    it('should handle decryption errors gracefully', async () => {
      const malformed = {
        ...testProfile,
        username: 'VGhpc0lzTm90VmFsaWRFbmNyeXB0ZWREYXRh', // Valid base64 but not encrypted
        password: 'QW5vdGhlckludmFsaWRFbmNyeXB0ZWRTdHJpbmc=',
      };

      // Should not throw, but log warnings
      const decrypted = await decryptProfile(malformed);
      
      // Should return encrypted values as-is when decryption fails
      expect(decrypted.username).toBe(malformed.username);
      expect(decrypted.password).toBe(malformed.password);
    });

    it('should roundtrip multiple profiles', async () => {
      const profiles = [
        { ...testProfile, id: '1', username: 'user1', password: 'pass1' },
        { ...testProfile, id: '2', username: 'user2', password: 'pass2' },
        { ...testProfile, id: '3', username: 'user3', password: 'pass3' },
      ];

      const encrypted = await Promise.all(profiles.map(encryptProfile));
      const decrypted = await Promise.all(encrypted.map(decryptProfile));

      for (let i = 0; i < profiles.length; i++) {
        expect(decrypted[i].username).toBe(profiles[i].username);
        expect(decrypted[i].password).toBe(profiles[i].password);
      }
    });
  });

  describe('Security properties', () => {
    it('should use unique IVs for each encryption', async () => {
      const plaintext = 'same-password';
      const encrypted1 = await encryptData(plaintext);
      const encrypted2 = await encryptData(plaintext);

      // Different ciphertexts due to unique IVs
      expect(encrypted1).not.toBe(encrypted2);
      
      // Both decrypt correctly
      expect(await decryptData(encrypted1)).toBe(plaintext);
      expect(await decryptData(encrypted2)).toBe(plaintext);
    });

    it('should derive consistent key from extension ID', async () => {
      const plaintext = 'test-consistency';
      const encrypted = await encryptData(plaintext);
      
      // Multiple decryptions should work (same key derived)
      expect(await decryptData(encrypted)).toBe(plaintext);
      expect(await decryptData(encrypted)).toBe(plaintext);
      expect(await decryptData(encrypted)).toBe(plaintext);
    });

    it('should handle long credentials', async () => {
      const longPassword = 'a'.repeat(1000);
      const encrypted = await encryptData(longPassword);
      const decrypted = await decryptData(encrypted);

      expect(decrypted).toBe(longPassword);
      expect(decrypted.length).toBe(1000);
    });
  });
});
