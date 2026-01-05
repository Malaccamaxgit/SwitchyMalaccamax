import { describe, it, expect } from 'vitest';
import { RegexValidator, compileSafeRegex, validateRegex } from '@/core/security/regexSafe';
import { SECURITY_LIMITS } from '@/core/security/constants';

describe('RegexValidator - ReDoS Prevention', () => {
  describe('Malicious Pattern Rejection', () => {
    it('should reject catastrophic backtracking pattern ^(a+)+$', () => {
      const result = RegexValidator.validate('^(a+)+$');
      expect(result.safe).toBe(false);
      expect(result.reason).toContain('catastrophic backtracking');
    });

    it('should reject deeply nested quantifier pattern', () => {
      const result = RegexValidator.validate('((a+)+)+');
      expect(result.safe).toBe(false);
    });

    it('should reject pattern with nested quantifiers (a*)*', () => {
      const result = RegexValidator.validate('(a*)*');
      expect(result.safe).toBe(false);
    });

    it('should handle adversarial input in < 50ms', () => {
      const start = performance.now();
      const regex = RegexValidator.compileSafe('^(a+)+$');
      const maliciousInput = 'a'.repeat(5000) + 'X';
      
      regex.test(maliciousInput);
      
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(SECURITY_LIMITS.MAX_EXECUTION_TIME_MS);
    });
  });

  describe('Complexity Caps', () => {
    it('should reject patterns exceeding length limit', () => {
      const longPattern = 'a'.repeat(SECURITY_LIMITS.MAX_PATTERN_LENGTH + 1);
      const result = RegexValidator.validate(longPattern);
      expect(result.safe).toBe(false);
      expect(result.reason).toContain('maximum length');
    });

    it('should accept patterns at length limit', () => {
      const maxPattern = 'a'.repeat(SECURITY_LIMITS.MAX_PATTERN_LENGTH);
      const result = RegexValidator.validate(maxPattern);
      expect(result.safe).toBe(true);
    });

    it('should reject patterns with too many alternations', () => {
      // Need +1 actual pipes, so +2 elements (21 elements = 20 pipes)
      const alternations = Array(SECURITY_LIMITS.MAX_ALTERNATIONS + 2)
        .fill('a')
        .join('|');
      const result = RegexValidator.validate(alternations);
      expect(result.safe).toBe(false);
      expect(result.reason).toContain('alternations');
    });

    it('should accept patterns at alternation limit', () => {
      const alternations = Array(SECURITY_LIMITS.MAX_ALTERNATIONS)
        .fill('a')
        .join('|');
      const result = RegexValidator.validate(alternations);
      expect(result.safe).toBe(true);
    });

    it('should reject patterns with too many quantifiers', () => {
      const quantifiers = 'a+'.repeat(SECURITY_LIMITS.MAX_QUANTIFIERS + 1);
      const result = RegexValidator.validate(quantifiers);
      expect(result.safe).toBe(false);
      expect(result.reason).toContain('quantifiers');
    });

    it('should count different quantifier types', () => {
      const pattern = 'a*b+c?d{1,2}e{3}';
      // Should have 5 quantifiers: *, +, ?, {1,2}, {3}
      const result = RegexValidator.validate(pattern);
      expect(result.safe).toBe(true);
    });
  });

  describe('Safe Pattern Acceptance', () => {
    it('should accept simple valid patterns', () => {
      const result = RegexValidator.validate('^example\\.com$');
      expect(result.safe).toBe(true);
      expect(result.pattern).toBe('^example\\.com$');
    });

    it('should compile safe patterns correctly', () => {
      const regex = RegexValidator.compileSafe('^test\\.com$');
      expect(regex.test('test.com')).toBe(true);
      expect(regex.test('evil.com')).toBe(false);
    });

    it('should accept patterns with reasonable complexity', () => {
      const pattern = '^(www\\.)?(example|test)\\.(com|org)$';
      const result = RegexValidator.validate(pattern);
      expect(result.safe).toBe(true);
    });

    it('should handle case-insensitive flag', () => {
      const regex = RegexValidator.compileSafe('test', 'i');
      expect(regex.test('TEST')).toBe(true);
      expect(regex.test('Test')).toBe(true);
    });
  });

  describe('Escaped Characters', () => {
    it('should not count escaped quantifiers', () => {
      const pattern = 'test\\*\\.com\\+example\\?';
      const result = RegexValidator.validate(pattern);
      expect(result.safe).toBe(true);
    });

    it('should count non-escaped quantifiers after escaped backslash', () => {
      const pattern = 'test\\\\*'; // \\* = escaped backslash + quantifier
      const result = RegexValidator.validate(pattern);
      expect(result.safe).toBe(true);
    });

    it('should not count escaped pipes as alternations', () => {
      const pattern = 'test\\|example\\|demo';
      const result = RegexValidator.validate(pattern);
      expect(result.safe).toBe(true);
    });
  });

  describe('Fail-Closed Behavior', () => {
    it('should return non-matching regex for unsafe patterns', () => {
      const regex = RegexValidator.compileSafe('^(a+)+$');
      expect(regex.test('aaaa')).toBe(false);
      expect(regex.test('anything')).toBe(false);
      expect(regex.test('')).toBe(false);
    });

    it('should return non-matching regex on compilation error', () => {
      const regex = RegexValidator.compileSafe('[invalid(');
      expect(regex.test('anything')).toBe(false);
    });
  });

  describe('Convenience Functions', () => {
    it('compileSafeRegex should work', () => {
      const regex = compileSafeRegex('^test$');
      expect(regex.test('test')).toBe(true);
    });

    it('validateRegex should work', () => {
      const result = validateRegex('^example\\.com$');
      expect(result.safe).toBe(true);
    });
  });
});
