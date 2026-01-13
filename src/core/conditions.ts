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
import { WildcardMatcher } from './security/wildcardMatcher';
import { RegexValidator } from './security/regexSafe';
import { Address4, Address6 } from 'ip-address';
import { Logger } from '@/utils/Logger';

const log = Logger.scope('Conditions');

/**
 * Request context for condition matching
 */
export interface RequestContext {
  url: string;           // Full URL (e.g., "https://example.com/path")
  host: string;          // Hostname (e.g., "example.com")
  scheme: string;        // Protocol (e.g., "http", "https")
  path?: string;         // URL path (e.g., "/path")
}

/**
 * Result of condition matching
 */
export interface MatchResult {
  matched: boolean;
  reason?: string;       // Why it matched/didn't match
  conditionType: string; // Type of condition that was evaluated
}

/**
 * Compiled regex cache for performance
 * Maps pattern -> compiled RegExp (or null if unsafe)
 */
const regexCache = new Map<string, RegExp | null>();

/**
 * Maximum cache size to prevent memory leaks
 */
const MAX_CACHE_SIZE = 1000;

/**
 * Condition matcher class
 */
export class ConditionMatcher {
  /**
   * Match a request against a condition
   * @param condition - Condition to match
   * @param context - Request context
   * @returns Match result
   */
  static match(condition: Condition, context: RequestContext): MatchResult {
    // Debug: log attempts to evaluate conditions
    try {
      log.debug('Evaluating condition', { conditionType: condition.conditionType, pattern: (condition as any).pattern, url: context.url, host: context.host });

      let result = null as unknown as MatchResult;

      switch (condition.conditionType) {
        case 'BypassCondition':
          result = this.matchBypass(condition.pattern, context);
          break;

        case 'HostWildcardCondition':
          result = this.matchHostWildcard(condition.pattern, context);
          break;

        case 'HostRegexCondition':
          result = this.matchHostRegex(condition.pattern, context);
          break;

        case 'HostLevelsCondition':
          result = this.matchHostLevels(
            condition.minValue ?? 1,
            condition.maxValue ?? -1,
            context
          );
          break;

        case 'UrlWildcardCondition':
          result = this.matchUrlWildcard(condition.pattern, context);
          break;

        case 'UrlRegexCondition':
          result = this.matchUrlRegex(condition.pattern, context);
          break;

        case 'KeywordCondition':
          result = this.matchKeyword(condition.pattern, context);
          break;

        default:
          result = {
            matched: false,
            reason: `Unknown condition type: ${(condition as any).conditionType}`,
            conditionType: (condition as any).conditionType,
          };
      }

      // Debug: log the outcome
      log.debug('Condition result', { conditionType: condition.conditionType, matched: result.matched, reason: result.reason });

      return result;
    } catch (error) {
      // Ensure any unexpected error is logged for diagnostics
      log.error('Condition match error', { error: String(error), conditionType: (condition as any).conditionType, url: context.url, host: context.host });
      return { matched: false, reason: 'Error during evaluation', conditionType: (condition as any).conditionType };
    }
  }

  /**
   * Match bypass condition (IP, CIDR, hostname)
   * Supports: IPv4, IPv6, CIDR notation, hostnames, <local>
   */
  private static matchBypass(pattern: string, context: RequestContext): MatchResult {
    const { host } = context;
    const conditionType = 'BypassCondition';

    // Special keyword: <local> matches simple hostnames (no dots)
    if (pattern === '<local>') {
      const matched = !host.includes('.');
      return {
        matched,
        reason: matched ? 'Local hostname (no dots)' : 'Not a local hostname',
        conditionType,
      };
    }

    // Try exact hostname match (case-insensitive)
    if (pattern.toLowerCase() === host.toLowerCase()) {
      return {
        matched: true,
        reason: 'Exact hostname match',
        conditionType,
      };
    }

    // Try CIDR notation matching
    if (pattern.includes('/')) {
      try {
        const matched = this.matchCIDR(pattern, host);
        return {
          matched,
          reason: matched ? `Host matches CIDR ${pattern}` : `Host not in CIDR ${pattern}`,
          conditionType,
        };
      } catch (error) {
        return {
          matched: false,
          reason: `Invalid CIDR pattern: ${pattern}`,
          conditionType,
        };
      }
    }

    // Try IP address match
    const matched = this.isIPMatch(pattern, host);
    return {
      matched,
      reason: matched ? 'IP address match' : 'No IP match',
      conditionType,
    };
  }

  /**
   * Match host against wildcard pattern
   * Uses deterministic wildcard matcher (no ReDoS risk)
   */
  private static matchHostWildcard(
    pattern: string,
    context: RequestContext
  ): MatchResult {
    const { host } = context;
    const conditionType = 'HostWildcardCondition';

    const matched = WildcardMatcher.matchPattern(pattern, host);

    return {
      matched,
      reason: matched ? `Host matches pattern ${pattern}` : `Host doesn't match ${pattern}`,
      conditionType,
    };
  }

  /**
   * Match host against regex pattern
   * Uses safe regex compilation to prevent ReDoS
   */
  private static matchHostRegex(pattern: string, context: RequestContext): MatchResult {
    const { host } = context;
    const conditionType = 'HostRegexCondition';

    // Validate pattern first
    const validation = RegexValidator.validate(pattern);
    if (!validation.safe) {
      return {
        matched: false,
        reason: 'Unsafe regex pattern rejected',
        conditionType,
      };
    }

    // Get or compile regex (pattern is safe)
    const regex = this.getCompiledRegex(pattern);

    try {
      const matched = regex.test(host);
      return {
        matched,
        reason: matched ? `Host matches regex ${pattern}` : `Host doesn't match ${pattern}`,
        conditionType,
      };
    } catch (error) {
      return {
        matched: false,
        reason: `Regex execution error: ${error}`,
        conditionType,
      };
    }
  }

  /**
   * Match host based on subdomain levels
   * Examples:
   * - example.com has 2 levels
   * - sub.example.com has 3 levels
   * - deep.sub.example.com has 4 levels
   */
  private static matchHostLevels(
    minValue: number,
    maxValue: number,
    context: RequestContext
  ): MatchResult {
    const { host } = context;
    const conditionType = 'HostLevelsCondition';

    // Count dots to determine levels
    const levels = host.split('.').length;

    // -1 means infinity
    const min = minValue === -1 ? 0 : minValue;
    const max = maxValue === -1 ? Infinity : maxValue;

    const matched = levels >= min && levels <= max;

    return {
      matched,
      reason: matched
        ? `Host has ${levels} levels (in range ${min}-${max})`
        : `Host has ${levels} levels (out of range ${min}-${max})`,
      conditionType,
    };
  }

  /**
   * Match full URL against wildcard pattern
   */
  private static matchUrlWildcard(pattern: string, context: RequestContext): MatchResult {
    const { url } = context;
    const conditionType = 'UrlWildcardCondition';

    const matched = WildcardMatcher.matchPattern(pattern, url);

    return {
      matched,
      reason: matched ? `URL matches pattern ${pattern}` : `URL doesn't match ${pattern}`,
      conditionType,
    };
  }

  /**
   * Match full URL against regex pattern
   * Uses safe regex compilation to prevent ReDoS
   */
  private static matchUrlRegex(pattern: string, context: RequestContext): MatchResult {
    const { url } = context;
    const conditionType = 'UrlRegexCondition';

    // Validate pattern first
    const validation = RegexValidator.validate(pattern);
    if (!validation.safe) {
      return {
        matched: false,
        reason: 'Unsafe regex pattern rejected',
        conditionType,
      };
    }

    // Get or compile regex (pattern is safe)
    const regex = this.getCompiledRegex(pattern);

    try {
      const matched = regex.test(url);
      return {
        matched,
        reason: matched ? `URL matches regex ${pattern}` : `URL doesn't match ${pattern}`,
        conditionType,
      };
    } catch (error) {
      return {
        matched: false,
        reason: `Regex execution error: ${error}`,
        conditionType,
      };
    }
  }

  /**
   * Match keyword (simple substring search)
   */
  private static matchKeyword(pattern: string, context: RequestContext): MatchResult {
    const { url } = context;
    const conditionType = 'KeywordCondition';

    const matched = url.toLowerCase().includes(pattern.toLowerCase());

    return {
      matched,
      reason: matched ? `URL contains keyword "${pattern}"` : `URL doesn't contain "${pattern}"`,
      conditionType,
    };
  }

  /**
   * Get compiled regex from cache or compile safely
   * NOTE: Only call this after validating the pattern with RegexValidator.validate()
   */
  private static getCompiledRegex(pattern: string): RegExp {
    // Check cache first
    if (regexCache.has(pattern)) {
      return regexCache.get(pattern)!;
    }

    // Compile (assuming validation already done)
    const compiled = new RegExp(pattern, 'i');

    // Cache the result
    if (regexCache.size >= MAX_CACHE_SIZE) {
      // Simple LRU: clear cache when full
      regexCache.clear();
    }
    regexCache.set(pattern, compiled);

    return compiled;
  }

  /**
   * Check if two IP addresses match
   */
  private static isIPMatch(pattern: string, host: string): boolean {
    // Normalize both for comparison
    const normalizedPattern = this.normalizeIP(pattern);
    const normalizedHost = this.normalizeIP(host);

    if (!normalizedPattern || !normalizedHost) {
      return false;
    }

    return normalizedPattern === normalizedHost;
  }

  /**
   * Normalize IP address for comparison
   * Handles IPv4 and IPv6 formats
   */
  private static normalizeIP(ip: string): string | null {
    // Strip brackets from IPv6 addresses [2001:db8::1] → 2001:db8::1
    const cleanIP = ip.replace(/^\[|\]$/g, '');

    try {
      // Try IPv4
      const ipv4 = new Address4(cleanIP);
      return ipv4.correctForm();
    } catch {
      // Not IPv4, try IPv6
    }

    try {
      // Try IPv6
      const ipv6 = new Address6(cleanIP);
      return ipv6.correctForm();
    } catch {
      // Not IPv6 either
    }

    return null;
  }

  /**
   * Match host against CIDR notation
   * Supports both IPv4 and IPv6 CIDR
   */
  private static matchCIDR(cidr: string, host: string): boolean {
    // Strip brackets from IPv6 addresses
    const cleanHost = host.replace(/^\[|\]$/g, '');

    try {
      // Try IPv4 CIDR
      const addr4 = new Address4(cleanHost);
      const cidr4 = new Address4(cidr);
      return addr4.isInSubnet(cidr4);
    } catch {
      // Not IPv4, try IPv6
    }

    try {
      // Try IPv6 CIDR
      const addr6 = new Address6(cleanHost);
      const cidr6 = new Address6(cidr);
      return addr6.isInSubnet(cidr6);
    } catch {
      // Not valid IPv6 either
    }

    return false;
  }

  /**
   * Clear regex cache (for testing or memory management)
   */
  static clearCache(): void {
    regexCache.clear();
  }
}

/**
 * Convenience function for matching a single condition
 * @param condition - Condition to match
 * @param context - Request context
 * @returns true if condition matches
 */
export function matchCondition(condition: Condition, context: RequestContext): boolean {
  return ConditionMatcher.match(condition, context).matched;
}

/**
 * Create request context from URL
 * @param url - Full URL string
 * @returns Request context
 */
export function createContext(url: string): RequestContext {
  try {
    const parsed = new URL(url);
    return {
      url,
      host: parsed.hostname,
      scheme: parsed.protocol.replace(':', ''),
      path: parsed.pathname + parsed.search + parsed.hash,
    };
  } catch (error) {
    // Fallback for invalid URLs
    return {
      url,
      host: '',
      scheme: '',
      path: '',
    };
  }
}
