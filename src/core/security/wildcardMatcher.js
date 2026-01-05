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
import { SECURITY_LIMITS } from './constants';
export class WildcardMatcher {
    /**
     * Validates wildcard patterns against security limits
     * @param patterns - Array of wildcard patterns or pipe-separated string
     * @returns Validation result
     */
    static validate(patterns) {
        const patternArray = Array.isArray(patterns)
            ? patterns
            : patterns.split('|').map(p => p.trim());
        // Check number of patterns
        if (patternArray.length > SECURITY_LIMITS.MAX_WILDCARD_PATTERNS) {
            return {
                valid: false,
                reason: `Too many patterns (${patternArray.length}/${SECURITY_LIMITS.MAX_WILDCARD_PATTERNS})`,
            };
        }
        // Validate each pattern
        for (const pattern of patternArray) {
            // Check pattern length
            if (pattern.length > SECURITY_LIMITS.MAX_PATTERN_LENGTH) {
                return {
                    valid: false,
                    reason: `Pattern exceeds max length: ${pattern.substring(0, 30)}...`,
                };
            }
            // Count wildcards
            const wildcardCount = (pattern.match(/\*|\?/g) || []).length;
            if (wildcardCount > SECURITY_LIMITS.MAX_WILDCARDS_PER_PATTERN) {
                return {
                    valid: false,
                    reason: `Too many wildcards in pattern (${wildcardCount}/${SECURITY_LIMITS.MAX_WILDCARDS_PER_PATTERN})`,
                };
            }
        }
        return { valid: true, patterns: patternArray };
    }
    /**
     * Match a host against wildcard patterns using deterministic algorithm
     * @param patterns - Array of wildcard patterns or pipe-separated string
     * @param host - Host to match against
     * @returns true if any pattern matches the host
     */
    static match(patterns, host) {
        const validation = this.validate(patterns);
        if (!validation.valid || !validation.patterns) {
            console.warn(`[WildcardMatcher] Invalid patterns: ${validation.reason}`);
            return false;
        }
        // Try matching against each pattern
        for (const pattern of validation.patterns) {
            if (this.matchPattern(pattern, host)) {
                return true;
            }
        }
        return false;
    }
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
    static matchPattern(pattern, host) {
        // Handle special SwitchyOmega semantics
        if (pattern.startsWith('**.')) {
            // **.example.com matches example.com AND all subdomains
            // Convert ** to match optionally: (*.example.com OR example.com)
            const domain = pattern.substring(3);
            if (host.toLowerCase() === domain.toLowerCase()) {
                return true; // Exact match allowed
            }
            return this.matchPatternInternal('*' + pattern.substring(2), host);
        }
        else if (pattern.startsWith('*.')) {
            // *.example.com matches subdomains but NOT example.com itself
            const domain = pattern.substring(2);
            if (host.toLowerCase() === domain.toLowerCase()) {
                return false; // Exact match excluded
            }
            return this.matchPatternInternal(pattern, host);
        }
        return this.matchPatternInternal(pattern, host);
    }
    /**
     * Internal pattern matching using deterministic algorithm
     * Time complexity: O(n + m) where n = pattern length, m = host length
     */
    static matchPatternInternal(pattern, host) {
        // Normalize to lowercase for case-insensitive matching
        pattern = pattern.toLowerCase();
        host = host.toLowerCase();
        let pIdx = 0; // Pattern index
        let hIdx = 0; // Host index
        let starIdx = -1; // Last '*' position in pattern
        let matchIdx = 0; // Position in host where we can resume after '*'
        const pLen = pattern.length;
        const hLen = host.length;
        while (hIdx < hLen) {
            // Case 1: Characters match or pattern has '?'
            if (pIdx < pLen && (pattern[pIdx] === host[hIdx] || pattern[pIdx] === '?')) {
                pIdx++;
                hIdx++;
            }
            // Case 2: Pattern has '*'
            else if (pIdx < pLen && pattern[pIdx] === '*') {
                starIdx = pIdx;
                matchIdx = hIdx;
                pIdx++;
            }
            // Case 3: No match, but we have a previous '*' to backtrack to
            else if (starIdx !== -1) {
                pIdx = starIdx + 1;
                matchIdx++;
                hIdx = matchIdx;
            }
            // Case 4: No match and no '*' to backtrack - fail
            else {
                return false;
            }
        }
        // Consume any trailing '*' in pattern
        while (pIdx < pLen && pattern[pIdx] === '*') {
            pIdx++;
        }
        // Success if we consumed entire pattern
        return pIdx === pLen;
    }
    /**
     * Convert wildcard pattern to safe regex (for PAC script generation)
     * Only use this for generating PAC scripts, NOT for runtime matching
     * @param pattern - Wildcard pattern
     * @returns Regex pattern string (not compiled)
     */
    static toRegexPattern(pattern) {
        // Escape regex special characters except * and ?
        let escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
        // Convert wildcards to regex
        escaped = escaped.replace(/\*/g, '.*').replace(/\?/g, '.');
        // Add anchors
        return `^${escaped}$`;
    }
}
/**
 * Convenience function for wildcard matching
 * @param patterns - Wildcard patterns
 * @param host - Host to match
 * @returns true if any pattern matches
 */
export function matchWildcard(patterns, host) {
    return WildcardMatcher.match(patterns, host);
}
/**
 * Convenience function for pattern validation
 * @param patterns - Wildcard patterns to validate
 * @returns Validation result
 */
export function validateWildcard(patterns) {
    return WildcardMatcher.validate(patterns);
}
//# sourceMappingURL=wildcardMatcher.js.map