import { describe, it, expect } from 'vitest';
import fs from 'fs';
import { scanFile } from '../../scripts/pre-commit-security.js';

describe('Pre-commit Security helpers', () => {
  it('scanFile finds console.log usage', () => {
    const tmpPath = 'tests/temp-precommit-file.js';
    fs.writeFileSync(tmpPath, "console.log('test');\n");
    const findings = scanFile(tmpPath, [
      { pattern: /console\.log/gi, severity: 'warning', message: 'Found console.log - consider using Logger utility', excludePaths: [] }
    ]);
    fs.unlinkSync(tmpPath);

    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].severity).toBe('warning');
  });
});