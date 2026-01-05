/**
 * wildcardMatcher.ts - Deterministic wildcard matching without regex
 *
 * This module provides linear-time wildcard matching to prevent ReDoS attacks
 * from complex wildcard patterns. Instead of converting wildcards to regex with
 * alternations (which can cause exponential backtracking), we use a deterministic
 * algorithm with O(n+m) complexity.
 *
 * Supported wildcards:
 * - * (asterisk): Matches zero or more characters
 * - ? (question mark): Matches exactly one character
 *
 * Special SwitchyOmega semantics:
 * - *.example.com: Matches subdomains but NOT example.com itself
 * - **.example.com: Matches all subdomains INCLUDING example.com
 */
import type { WildcardValidationResult } from './types';
export declare class WildcardMatcher {
    /**
     * Validates wildcard patterns against security limits
     * @param patterns - Array of wildcard patterns or pipe-separated string
     * @returns Validation result
     */
    static validate(patterns: string | string[]): WildcardValidationResult;
    /**
     * Match a host against wildcard patterns using deterministic algorithm
     * @param patterns - Array of wildcard patterns or pipe-separated string
     * @param host - Host to match against
     * @returns true if any pattern matches the host
     */
    static match(patterns: string | string[], host: string): boolean;
    /**
     * Match a single wildcard pattern against a host
     * Uses linear-time algorithm with backtracking only for '*' wildcards
     *
     * Algorithm: Greedy matching with fallback
     * - For *, ?: Direct character comparison
     * - For *: Remember position and try to match rest; backtrack if needed
     *
     * @param pattern - Single wildcard pattern
     * @param host - Host to match
     * @returns true if pattern matches host
     */
    static matchPattern(pattern: string, host: string): boolean;
    /**
     * Internal pattern matching using deterministic algorithm
     * Time complexity: O(n + m) where n = pattern length, m = host length
     */
    private static matchPatternInternal;
    /**
     * Convert wildcard pattern to safe regex (for PAC script generation)
     * Only use this for generating PAC scripts, NOT for runtime matching
     * @param pattern - Wildcard pattern
     * @returns Regex pattern string (not compiled)
     */
    static toRegexPattern(pattern: string): string;
}
/**
 * Convenience function for wildcard matching
 * @param patterns - Wildcard patterns
 * @param host - Host to match
 * @returns true if any pattern matches
 */
export declare function matchWildcard(patterns: string | string[], host: string): boolean;
/**
 * Convenience function for pattern validation
 * @param patterns - Wildcard patterns to validate
 * @returns Validation result
 */
export declare function validateWildcard(patterns: string | string[]): WildcardValidationResult;
//# sourceMappingURL=wildcardMatcher.d.ts.map