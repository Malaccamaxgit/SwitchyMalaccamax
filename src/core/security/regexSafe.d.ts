/**
 * regexSafe.ts - Safe regex compilation to prevent ReDoS attacks
 *
 * This module validates and safely compiles regular expressions from user input,
 * preventing catastrophic backtracking and denial of service attacks.
 *
 * Security features:
 * - Pattern length limits
 * - Alternation count limits
 * - Quantifier count limits
 * - Catastrophic backtracking detection via safe-regex library
 * - Fail-closed behavior (returns non-matching regex on validation failure)
 */
import type { RegexValidationResult } from './types';
export declare class RegexValidator {
    /**
     * Validates a regex pattern for ReDoS vulnerabilities
     * @param pattern - The regex pattern to validate
     * @returns Validation result with safety status and reason
     * @throws Never throws - returns validation result instead
     */
    static validate(pattern: string): RegexValidationResult;
    /**
     * Safely compiles a regex pattern
     * Returns a non-matching regex (/(?!)/) if pattern is unsafe
     * @param pattern - The regex pattern to compile
     * @param flags - Regex flags (default: 'i' for case-insensitive)
     * @returns Compiled RegExp object (never-matching regex if unsafe)
     */
    static compileSafe(pattern: string, flags?: string): RegExp;
    /**
     * Count alternations in pattern (excluding escaped pipes)
     */
    private static countAlternations;
    /**
     * Count quantifiers in pattern: *, +, ?, {m,n}
     */
    private static countQuantifiers;
    /**
     * Check if a character at given index is escaped
     * Handles multiple backslashes correctly
     */
    private static isEscaped;
}
/**
 * Convenience function for safe regex compilation
 * @param pattern - Regex pattern to compile
 * @param flags - Regex flags
 * @returns Compiled RegExp (never-matching if unsafe)
 */
export declare function compileSafeRegex(pattern: string, flags?: string): RegExp;
/**
 * Convenience function for pattern validation
 * @param pattern - Regex pattern to validate
 * @returns Validation result
 */
export declare function validateRegex(pattern: string): RegexValidationResult;
//# sourceMappingURL=regexSafe.d.ts.map