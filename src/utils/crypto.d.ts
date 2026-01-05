/**
 * Encrypt sensitive text data (proxy credentials)
 * @param plaintext - Sensitive data to encrypt
 * @returns Base64-encoded encrypted data with IV prepended
 */
export declare function encryptData(plaintext: string): Promise<string>;
/**
 * Decrypt sensitive text data
 * @param encrypted - Base64-encoded encrypted data with IV prepended
 * @returns Decrypted plaintext
 */
export declare function decryptData(encrypted: string): Promise<string>;
/**
 * Check if a string appears to be encrypted (base64 with sufficient length)
 */
export declare function isEncrypted(value: string | undefined): boolean;
/**
 * Encrypt sensitive fields in a proxy profile
 */
export declare function encryptProfile(profile: any): Promise<any>;
/**
 * Decrypt sensitive fields in a proxy profile
 */
export declare function decryptProfile(profile: any): Promise<any>;
//# sourceMappingURL=crypto.d.ts.map