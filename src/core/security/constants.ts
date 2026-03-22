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

/** Caps for profile import JSON (DoS / storage abuse). */
export const IMPORT_LIMITS = {
  MAX_FILE_BYTES: 2 * 1024 * 1024,
  MAX_SERIALIZED_JSON_CHARS: 6 * 1024 * 1024,
  MAX_OBJECT_DEPTH: 48,
  MAX_PROFILES: 500,
  MAX_PROFILE_ID_LENGTH: 128,
  MAX_PROFILE_NAME_LENGTH: 256,
} as const;

/** chrome.proxy.ProxyConfig validation (service worker / message boundary). */
export const PROXY_CONFIG_LIMITS = {
  MAX_PAC_SCRIPT_DATA_CHARS: 512 * 1024,
  MAX_PAC_SCRIPT_URL_LENGTH: 2048,
  MAX_PROXY_HOST_LENGTH: 253,
  MAX_BYPASS_ENTRIES: 512,
  MAX_BYPASS_PATTERN_LENGTH: 2048,
} as const;

export type SecurityLimits = typeof SECURITY_LIMITS;
