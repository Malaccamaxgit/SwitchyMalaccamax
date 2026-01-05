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
import safeRegex from 'safe-regex';
import { SECURITY_LIMITS } from './constants';
export class RegexValidator {
    /**
     * Validates a regex pattern for ReDoS vulnerabilities
     * @param pattern - The regex pattern to validate
     * @returns Validation result with safety status and reason
     * @throws Never throws - returns validation result instead
     */
    static validate(pattern) {
        // Check pattern length
        if (pattern.length > SECURITY_LIMITS.MAX_PATTERN_LENGTH) {
            return {
                safe: false,
                reason: `Pattern exceeds maximum length of ${SECURITY_LIMITS.MAX_PATTERN_LENGTH} characters`,
            };
        }
        // Count alternations (|)
        const alternations = this.countAlternations(pattern);
        if (alternations > SECURITY_LIMITS.MAX_ALTERNATIONS) {
            return {
                safe: false,
                reason: `Too many alternations (${alternations}/${SECURITY_LIMITS.MAX_ALTERNATIONS})`,
            };
        }
        // Count quantifiers (*, +, ?, {m,n})
        const quantifiers = this.countQuantifiers(pattern);
        if (quantifiers > SECURITY_LIMITS.MAX_QUANTIFIERS) {
            return {
                safe: false,
                reason: `Too many quantifiers (${quantifiers}/${SECURITY_LIMITS.MAX_QUANTIFIERS})`,
            };
        }
        // Check for catastrophic backtracking using safe-regex library
        if (!safeRegex(pattern)) {
            return {
                safe: false,
                reason: 'Pattern contains catastrophic backtracking vulnerability',
            };
        }
        return { safe: true, pattern };
    }
    /**
     * Safely compiles a regex pattern
     * Returns a non-matching regex (/(?!)/) if pattern is unsafe
     * @param pattern - The regex pattern to compile
     * @param flags - Regex flags (default: 'i' for case-insensitive)
     * @returns Compiled RegExp object (never-matching regex if unsafe)
     */
    static compileSafe(pattern, flags = 'i') {
        try {
            const validation = this.validate(pattern);
            if (!validation.safe) {
                console.warn(`[RegexValidator] Rejected unsafe pattern: ${validation.reason}`);
                return /(?!)/; // Negative lookahead - never matches anything
            }
            return new RegExp(pattern, flags);
        }
        catch (error) {
            console.error('[RegexValidator] Compilation error:', error);
            return /(?!)/; // Fail closed
        }
    }
    /**
     * Count alternations in pattern (excluding escaped pipes)
     */
    static countAlternations(pattern) {
        let count = 0;
        for (let i = 0; i < pattern.length; i++) {
            if (pattern[i] === '|' && !this.isEscaped(pattern, i)) {
                count++;
            }
        }
        return count;
    }
    /**
     * Count quantifiers in pattern: *, +, ?, {m,n}
     */
    static countQuantifiers(pattern) {
        let count = 0;
        // Count *, +, ? quantifiers (excluding escaped ones)
        for (let i = 0; i < pattern.length; i++) {
            const char = pattern[i];
            if (['*', '+', '?'].includes(char) && !this.isEscaped(pattern, i)) {
                count++;
            }
        }
        // Count {m,n} style quantifiers
        const rangeQuantifiers = pattern.match(/\{[0-9,]+\}/g);
        if (rangeQuantifiers) {
            count += rangeQuantifiers.length;
        }
        return count;
    }
    /**
     * Check if a character at given index is escaped
     * Handles multiple backslashes correctly
     */
    static isEscaped(pattern, index) {
        let backslashCount = 0;
        for (let i = index - 1; i >= 0 && pattern[i] === '\\'; i--) {
            backslashCount++;
        }
        // Odd number of backslashes means the character is escaped
        return backslashCount % 2 === 1;
    }
}
/**
 * Convenience function for safe regex compilation
 * @param pattern - Regex pattern to compile
 * @param flags - Regex flags
 * @returns Compiled RegExp (never-matching if unsafe)
 */
export function compileSafeRegex(pattern, flags) {
    return RegexValidator.compileSafe(pattern, flags);
}
/**
 * Convenience function for pattern validation
 * @param pattern - Regex pattern to validate
 * @returns Validation result
 */
export function validateRegex(pattern) {
    return RegexValidator.validate(pattern);
}
//# sourceMappingURL=regexSafe.js.map