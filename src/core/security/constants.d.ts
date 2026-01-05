/**
 * Security limits for ReDoS prevention
 * These constants enforce complexity caps on user-supplied patterns
 */
export declare const SECURITY_LIMITS: {
    readonly MAX_PATTERN_LENGTH: 256;
    readonly MAX_ALTERNATIONS: 20;
    readonly MAX_QUANTIFIERS: 50;
    readonly MAX_WILDCARD_PATTERNS: 50;
    readonly MAX_WILDCARDS_PER_PATTERN: 20;
    readonly MAX_EXECUTION_TIME_MS: 50;
};
export type SecurityLimits = typeof SECURITY_LIMITS;
//# sourceMappingURL=constants.d.ts.map