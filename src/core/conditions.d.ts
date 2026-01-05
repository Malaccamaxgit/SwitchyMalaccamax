/**
 * conditions.ts - Condition Matching Engine
 *
 * This module implements condition matching logic for proxy auto-switching.
 * Converted from CoffeeScript omega-pac/src/conditions.coffee with strict typing
 * and ReDoS protection.
 *
 * Supported condition types:
 * - BypassCondition: IP/CIDR/hostname bypass patterns
 * - HostWildcardCondition: Wildcard host matching (*.example.com)
 * - HostRegexCondition: Regex host matching (with ReDoS protection)
 * - HostLevelsCondition: Subdomain depth matching
 * - UrlWildcardCondition: Full URL wildcard matching
 * - UrlRegexCondition: Full URL regex matching (with ReDoS protection)
 * - KeywordCondition: Simple substring matching
 */
import type { Condition } from './schema';
/**
 * Request context for condition matching
 */
export interface RequestContext {
    url: string;
    host: string;
    scheme: string;
    path?: string;
}
/**
 * Result of condition matching
 */
export interface MatchResult {
    matched: boolean;
    reason?: string;
    conditionType: string;
}
/**
 * Condition matcher class
 */
export declare class ConditionMatcher {
    /**
     * Match a request against a condition
     * @param condition - Condition to match
     * @param context - Request context
     * @returns Match result
     */
    static match(condition: Condition, context: RequestContext): MatchResult;
    /**
     * Match bypass condition (IP, CIDR, hostname)
     * Supports: IPv4, IPv6, CIDR notation, hostnames, <local>
     */
    private static matchBypass;
    /**
     * Match host against wildcard pattern
     * Uses deterministic wildcard matcher (no ReDoS risk)
     */
    private static matchHostWildcard;
    /**
     * Match host against regex pattern
     * Uses safe regex compilation to prevent ReDoS
     */
    private static matchHostRegex;
    /**
     * Match host based on subdomain levels
     * Examples:
     * - example.com has 2 levels
     * - sub.example.com has 3 levels
     * - deep.sub.example.com has 4 levels
     */
    private static matchHostLevels;
    /**
     * Match full URL against wildcard pattern
     */
    private static matchUrlWildcard;
    /**
     * Match full URL against regex pattern
     * Uses safe regex compilation to prevent ReDoS
     */
    private static matchUrlRegex;
    /**
     * Match keyword (simple substring search)
     */
    private static matchKeyword;
    /**
     * Get compiled regex from cache or compile safely
     * NOTE: Only call this after validating the pattern with RegexValidator.validate()
     */
    private static getCompiledRegex;
    /**
     * Check if two IP addresses match
     */
    private static isIPMatch;
    /**
     * Normalize IP address for comparison
     * Handles IPv4 and IPv6 formats
     */
    private static normalizeIP;
    /**
     * Match host against CIDR notation
     * Supports both IPv4 and IPv6 CIDR
     */
    private static matchCIDR;
    /**
     * Clear regex cache (for testing or memory management)
     */
    static clearCache(): void;
}
/**
 * Convenience function for matching a single condition
 * @param condition - Condition to match
 * @param context - Request context
 * @returns true if condition matches
 */
export declare function matchCondition(condition: Condition, context: RequestContext): boolean;
/**
 * Create request context from URL
 * @param url - Full URL string
 * @returns Request context
 */
export declare function createContext(url: string): RequestContext;
//# sourceMappingURL=conditions.d.ts.map