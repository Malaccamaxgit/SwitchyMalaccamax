import { describe, it, expect } from 'vitest';
import fs from 'fs';
import { isWhitelisted, shouldScanFile, scanFile } from '../../scripts/secret-scanner.js';

describe('Secret Scanner helpers', () => {
  it('isWhitelisted recognizes whitelist patterns', () => {
    expect(isWhitelisted('example.com')).toBe(true);
    expect(isWhitelisted('your-api-key')).toBe(true);
    expect(isWhitelisted('normal-string')).toBe(false);
  });

  it('shouldScanFile respects extension rules', () => {
    expect(shouldScanFile('src/index.js')).toBe(true);
    expect(shouldScanFile('node_modules/lib/index.js')).toBe(false);
    expect(shouldScanFile('image.png')).toBe(false);
  });

  it('scanFile finds a password assignment in a temp file', () => {
    const tmpDir = 'tmp';
    const tmpPath = `${tmpDir}/temp-secret-file.txt`;
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    fs.writeFileSync(tmpPath, "const x = { password: 'supersecret' };\n");
    const findings = scanFile(tmpPath);
    fs.unlinkSync(tmpPath);

    expect(findings.length).toBeGreaterThan(0);
    const hasPassword = findings.some((f: { type: string }) => f.type.includes('Password'));
    expect(hasPassword).toBe(true);
  });
});