import { describe, it, expect } from 'vitest';
import { WildcardMatcher, matchWildcard, validateWildcard } from '@/core/security/wildcardMatcher';
import { SECURITY_LIMITS } from '@/core/security/constants';

describe('WildcardMatcher - Deterministic Matching', () => {
  describe('Pattern Validation', () => {
    it('should accept valid single pattern', () => {
      const result = WildcardMatcher.validate('*.example.com');
      expect(result.valid).toBe(true);
      expect(result.patterns).toEqual(['*.example.com']);
    });

    it('should accept multiple patterns separated by pipe', () => {
      const result = WildcardMatcher.validate('*.example.com|*.test.org');
      expect(result.valid).toBe(true);
      expect(result.patterns).toHaveLength(2);
    });

    it('should reject too many patterns', () => {
      const patterns = Array(SECURITY_LIMITS.MAX_WILDCARD_PATTERNS + 1)
        .fill('*.com')
        .join('|');
      const result = WildcardMatcher.validate(patterns);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Too many patterns');
    });

    it('should reject patterns exceeding length limit', () => {
      const longPattern = 'a'.repeat(SECURITY_LIMITS.MAX_PATTERN_LENGTH + 1);
      const result = WildcardMatcher.validate(longPattern);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('max length');
    });

    it('should reject patterns with too many wildcards', () => {
      const pattern = '*'.repeat(SECURITY_LIMITS.MAX_WILDCARDS_PER_PATTERN + 1);
      const result = WildcardMatcher.validate(pattern);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Too many wildcards');
    });
  });

  describe('Basic Wildcard Matching', () => {
    it('should match exact strings', () => {
      expect(WildcardMatcher.matchPattern('example.com', 'example.com')).toBe(true);
      expect(WildcardMatcher.matchPattern('example.com', 'test.com')).toBe(false);
    });

    it('should match * wildcard', () => {
      expect(WildcardMatcher.matchPattern('*.com', 'example.com')).toBe(true);
      expect(WildcardMatcher.matchPattern('test.*', 'test.com')).toBe(true);
      expect(WildcardMatcher.matchPattern('*', 'anything')).toBe(true);
    });

    it('should match ? wildcard', () => {
      expect(WildcardMatcher.matchPattern('test.?om', 'test.com')).toBe(true);
      expect(WildcardMatcher.matchPattern('test.?om', 'test.org')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(WildcardMatcher.matchPattern('*.Example.COM', 'sub.example.com')).toBe(true);
      expect(WildcardMatcher.matchPattern('TEST.com', 'test.com')).toBe(true);
    });
  });

  describe('Special SwitchyOmega Semantics', () => {
    it('*.domain should match subdomains but NOT exact domain', () => {
      expect(WildcardMatcher.matchPattern('*.example.com', 'sub.example.com')).toBe(true);
      expect(WildcardMatcher.matchPattern('*.example.com', 'deep.sub.example.com')).toBe(true);
      expect(WildcardMatcher.matchPattern('*.example.com', 'example.com')).toBe(false);
    });

    it('**.domain should match subdomains AND exact domain', () => {
      expect(WildcardMatcher.matchPattern('**.example.com', 'sub.example.com')).toBe(true);
      expect(WildcardMatcher.matchPattern('**.example.com', 'deep.sub.example.com')).toBe(true);
      expect(WildcardMatcher.matchPattern('**.example.com', 'example.com')).toBe(true);
    });

    it('should match real-world example: *.example.io -> cdt.example.io', () => {
      // Correct TLD must be used (io vs com)
      expect(WildcardMatcher.matchPattern('*.example.io', 'cdt.example.io')).toBe(true);
      expect(WildcardMatcher.matchPattern('*.example.io', 'example.io')).toBe(false);

      // Leading/trailing whitespace in pattern is treated literally (no auto-trim)
      expect(WildcardMatcher.matchPattern(' *.example.io', 'cdt.example.io')).toBe(false);
      expect(WildcardMatcher.matchPattern('*.example.io ', 'cdt.example.io')).toBe(false);
    });
  });

  describe('Complex Pattern Matching', () => {
    it('should handle multiple * wildcards', () => {
      expect(WildcardMatcher.matchPattern('*.*.com', 'sub.example.com')).toBe(true);
      expect(WildcardMatcher.matchPattern('*test*', 'this-is-a-test-string')).toBe(true);
    });

    it('should handle mixed wildcards', () => {
      expect(WildcardMatcher.matchPattern('?.example.*', 'a.example.com')).toBe(true);
      expect(WildcardMatcher.matchPattern('?.example.*', 'ab.example.com')).toBe(false);
    });

    it('should handle patterns with no wildcards', () => {
      expect(WildcardMatcher.matchPattern('exact.match.com', 'exact.match.com')).toBe(true);
      expect(WildcardMatcher.matchPattern('exact.match.com', 'other.com')).toBe(false);
    });
  });

  describe('Multiple Pattern Matching', () => {
    it('should match against array of patterns', () => {
      const patterns = ['*.example.com', '*.test.org'];
      expect(WildcardMatcher.match(patterns, 'sub.example.com')).toBe(true);
      expect(WildcardMatcher.match(patterns, 'sub.test.org')).toBe(true);
      expect(WildcardMatcher.match(patterns, 'other.com')).toBe(false);
    });

    it('should match against pipe-separated string', () => {
      const patterns = '*.example.com|*.test.org';
      expect(WildcardMatcher.match(patterns, 'sub.example.com')).toBe(true);
      expect(WildcardMatcher.match(patterns, 'sub.test.org')).toBe(true);
      expect(WildcardMatcher.match(patterns, 'other.com')).toBe(false);
    });

    it('should return false for invalid patterns', () => {
      const tooManyPatterns = Array(SECURITY_LIMITS.MAX_WILDCARD_PATTERNS + 1)
        .fill('*.com')
        .join('|');
      expect(WildcardMatcher.match(tooManyPatterns, 'example.com')).toBe(false);
    });
  });

  describe('Performance - Linear Time Complexity', () => {
    it('should handle long hosts in linear time', () => {
      const start = performance.now();
      const pattern = '*.example.com';
      const longHost = 'a'.repeat(5000) + '.example.com';
      
      WildcardMatcher.matchPattern(pattern, longHost);
      
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(SECURITY_LIMITS.MAX_EXECUTION_TIME_MS);
    });

    it('should handle many wildcards efficiently', () => {
      const start = performance.now();
      const pattern = '*.*.*.*.*.*';
      const host = 'a.b.c.d.e.f';
      
      WildcardMatcher.matchPattern(pattern, host);
      
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(SECURITY_LIMITS.MAX_EXECUTION_TIME_MS);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty pattern', () => {
      expect(WildcardMatcher.matchPattern('', '')).toBe(true);
      expect(WildcardMatcher.matchPattern('', 'anything')).toBe(false);
    });

    it('should handle empty host', () => {
      expect(WildcardMatcher.matchPattern('*', '')).toBe(true);
      expect(WildcardMatcher.matchPattern('test', '')).toBe(false);
    });

    it('should handle pattern with only wildcards', () => {
      expect(WildcardMatcher.matchPattern('***', 'anything')).toBe(true);
      expect(WildcardMatcher.matchPattern('???', 'abc')).toBe(true);
      expect(WildcardMatcher.matchPattern('???', 'ab')).toBe(false);
    });
  });

  describe('Regex Conversion (for PAC generation)', () => {
    it('should convert wildcard to regex pattern', () => {
      const regex = WildcardMatcher.toRegexPattern('*.example.com');
      expect(regex).toBe('^.*\\.example\\.com$');
    });

    it('should escape regex special characters', () => {
      const regex = WildcardMatcher.toRegexPattern('test.com+extra');
      expect(regex).toContain('\\+');
      expect(regex).toContain('\\.');
    });
  });

  describe('Convenience Functions', () => {
    it('matchWildcard should work', () => {
      expect(matchWildcard('*.example.com', 'sub.example.com')).toBe(true);
    });

    it('validateWildcard should work', () => {
      const result = validateWildcard('*.example.com');
      expect(result.valid).toBe(true);
    });
  });
});
