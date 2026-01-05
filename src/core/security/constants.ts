/**
 * Security limits for ReDoS prevention
 * These constants enforce complexity caps on user-supplied patterns
 */
export const SECURITY_LIMITS = {
  MAX_PATTERN_LENGTH: 256,
  MAX_ALTERNATIONS: 20,
  MAX_QUANTIFIERS: 50,
  MAX_WILDCARD_PATTERNS: 50,
  MAX_WILDCARDS_PER_PATTERN: 20,
  MAX_EXECUTION_TIME_MS: 50,
} as const;

export type SecurityLimits = typeof SECURITY_LIMITS;
