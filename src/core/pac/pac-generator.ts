/**
 * pac-generator.ts - Advanced PAC Compiler with Recursive Profile Resolution
 * Implements ZeroOmega-compatible PAC generation with nested profile support
 * 
 * Architecture:
 * - Generates a profiles dictionary where each profile is a closure/function
 * - Main FindProxyForURL uses a do-while loop to resolve profile chains
 * - Profile references use "+ProfileName" as internal pointer keys
 * - Supports nested profile resolution (e.g., SwitchProfile → FixedProfile)
 */

import type { Profile, FixedProfile, SwitchProfile, PacProfile, Condition, ProxyServer } from '../schema';
import { Logger } from '@/utils/Logger';

// Create scoped logger for PAC compiler
const log = Logger.scope('PAC Compiler');

/**
 * PacCompiler - Advanced PAC script compiler with recursive profile resolution
 */
export class PacCompiler {
  private profiles: Map<string, Profile>;

  constructor(allProfiles: Profile[]) {
    this.profiles = new Map(allProfiles.map(p => [p.name, p]));
  }

  /**
   * Main compilation entry point - generates complete PAC script
   * @param rootProfileName - The starting profile (e.g., "Auto Switch")
   * @returns Complete PAC script with resolver boilerplate
   */
  compilePacScript(rootProfileName: string): string {
    log.group('Compiling PAC Script', true);
    log.info('Root profile', { rootProfileName });
    
    const rootProfile = this.profiles.get(rootProfileName);
    if (!rootProfile) {
      throw new Error(`Root profile "${rootProfileName}" not found`);
    }

    // Collect all profiles that need to be included (referenced profiles)
    const referencedProfiles = this.collectReferencedProfiles(rootProfile);
    log.debug('Referenced profiles', Array.from(referencedProfiles));

    // Generate profile functions dictionary
    const profilesDict = this.generateProfilesDictionary(referencedProfiles);

    // Generate the complete PAC script
    const pacScript = this.generatePacBoilerplate(rootProfileName, profilesDict);
    
    log.groupEnd();
    return pacScript;
  }

  /**
   * Recursively collect all profiles referenced by the root profile
   */
  private collectReferencedProfiles(profile: Profile, visited = new Set<string>()): Set<string> {
    if (visited.has(profile.name)) {
      return visited;
    }
    
    visited.add(profile.name);

    if (profile.profileType === 'SwitchProfile') {
      const switchProfile = profile as SwitchProfile;
      
      // Add default profile
      if (switchProfile.defaultProfileName && this.profiles.has(switchProfile.defaultProfileName)) {
        const defaultProf = this.profiles.get(switchProfile.defaultProfileName)!;
        this.collectReferencedProfiles(defaultProf, visited);
      }

      // Add all rule target profiles
      for (const rule of switchProfile.rules) {
        if (rule.profileName && this.profiles.has(rule.profileName)) {
          const targetProf = this.profiles.get(rule.profileName)!;
          this.collectReferencedProfiles(targetProf, visited);
        }
      }
    }

    return visited;
  }

  /**
   * Generate the profiles dictionary object
   */
  private generateProfilesDictionary(profileNames: Set<string>): string {
    const profileFunctions: string[] = [];

    for (const name of profileNames) {
      const profile = this.profiles.get(name);
      if (!profile) continue;

      const functionCode = this.compileProfile(profile);
      const safeName = this.sanitizeProfileName(name);
      profileFunctions.push(`    "+${safeName}": ${functionCode}`);
    }

    return `{
${profileFunctions.join(',\n')}
}`;
  }

  /**
   * Compile a single profile into a JavaScript function
   */
  private compileProfile(profile: Profile): string {
    log.debug('Compiling profile', { name: profile.name, type: profile.profileType });

    switch (profile.profileType) {
      case 'DirectProfile':
        return this.compileDirectProfile();

      case 'SystemProfile':
        return this.compileSystemProfile();

      case 'FixedProfile':
        return this.compileFixedProfile(profile as FixedProfile);

      case 'SwitchProfile':
        return this.compileSwitchProfile(profile as SwitchProfile);

      case 'PacProfile':
        return this.compilePacProfile(profile as PacProfile);

      default:
        log.warn('Unknown profile type', { type: (profile as any).profileType });
        return 'function() { return "DIRECT"; }';
    }
  }

  /**
   * Compile DirectProfile - always returns DIRECT
   */
  private compileDirectProfile(): string {
    return 'function(url, host, scheme) {\n        "use strict";\n        return "DIRECT";\n    }';
  }

  /**
   * Compile SystemProfile - returns DIRECT (system proxy not available in PAC)
   */
  private compileSystemProfile(): string {
    return 'function(url, host, scheme) {\n        "use strict";\n        return "DIRECT";\n    }';
  }

  /**
   * Compile FixedProfile - returns proxy with optional bypass rules
   */
  private compileFixedProfile(profile: FixedProfile): string {
    log.debug('Compiling FixedProfile', { 
      name: profile.name, 
      hasFallbackProxy: !!profile.fallbackProxy,
      fallbackProxy: profile.fallbackProxy,
      rawProfile: profile
    });

    const bypassChecks: string[] = [];

    // Generate bypass list conditions
    if (profile.bypassList && profile.bypassList.length > 0) {
      for (const condition of profile.bypassList) {
        const check = this.generateBypassCondition(condition);
        if (check) {
          bypassChecks.push(check);
        }
      }
    }

    // Handle both schema format (fallbackProxy object) and storage format (proxyType/host/port fields)
    let proxyResult: string;
    
    if (profile.fallbackProxy) {
      // Schema-compliant format: { fallbackProxy: { scheme, host, port } }
      proxyResult = this.proxyServerToString(profile.fallbackProxy);
    } else if ((profile as any).host && (profile as any).port) {
      // Legacy/storage format: { proxyType, host, port }
      const scheme = ((profile as any).proxyType || 'http').toLowerCase();
      const host = (profile as any).host;
      const port = (profile as any).port;
      
      proxyResult = this.proxyServerToString({
        scheme: scheme as 'http' | 'https' | 'socks4' | 'socks5',
        host,
        port
      });
      
      log.debug('Using legacy format', { scheme, host, port, proxyResult });
    } else {
      log.error('FixedProfile missing proxy configuration', { name: profile.name, profile });
      throw new Error(`FixedProfile "${profile.name}" is missing required proxy configuration (fallbackProxy or host/port)`);
    }

    log.debug('FixedProfile proxy result', { name: profile.name, proxyResult });

    const bypassCode = bypassChecks.length > 0
      ? bypassChecks.map(check => `        ${check}`).join('\n') + '\n'
      : '';

    return `function(url, host, scheme) {
        "use strict";
${bypassCode}        return "${proxyResult}";
    }`;
  }

  /**
   * Compile SwitchProfile - returns profile references or final results
   */
  private compileSwitchProfile(profile: SwitchProfile): string {
    const rules: string[] = [];

    // Generate each rule
    for (const rule of profile.rules) {
      const condition = this.generateConditionCheck(rule.condition);
      const targetProfile = rule.profileName;
      
      // Return profile reference (e.g., "+Workday")
      const safeTargetProfile = this.sanitizeProfileName(targetProfile);
      rules.push(`        if (${condition}) return "+${safeTargetProfile}";`);
    }

    // Default profile
    const defaultProfileName = profile.defaultProfileName || 'Direct';
    const safeDefaultProfileName = this.sanitizeProfileName(defaultProfileName);
    
    const rulesCode = rules.length > 0 ? rules.join('\n') + '\n' : '';

    return `function(url, host, scheme) {
        "use strict";
${rulesCode}        return "+${safeDefaultProfileName}";
    }`;
  }

  /**
   * Compile PacProfile - returns proxy or DIRECT
   */
  private compilePacProfile(profile: PacProfile): string {
    log.debug('Compiling PacProfile', { 
      name: profile.name,
      hasFallbackProxy: !!profile.fallbackProxy,
      fallbackProxy: profile.fallbackProxy
    });

    const proxyResult = profile.fallbackProxy
      ? this.proxyServerToString(profile.fallbackProxy)
      : 'DIRECT';

    return `function(url, host, scheme) {
        "use strict";
        return "${proxyResult}";
    }`;
  }

  /**
   * Generate bypass condition check (returns "DIRECT" if matched)
   */
  private generateBypassCondition(condition: Condition): string {
    if (condition.conditionType !== 'BypassCondition') return '';

    const pattern = condition.pattern;

    // IPv4 address
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(pattern)) {
      return `if (/^${pattern.replace(/\./g, '\\.')}$/.test(host)) return "DIRECT";`;
    }

    // IPv6 address
    if (pattern.includes(':') && !pattern.includes('.')) {
      return `if (/^${pattern}$/.test(host)) return "DIRECT";`;
    }

    // CIDR notation (e.g., 192.168.2.0/24)
    if (pattern.includes('/')) {
      const [ip, mask] = pattern.split('/');
      const subnetMask = this.cidrToMask(mask);
      return `if (host[host.length - 1] >= 0 && isInNet(host, "${ip}", "${subnetMask}")) return "DIRECT";`;
    }

    // Special hostnames
    if (pattern === 'localhost' || pattern === '<local>') {
      return `if (/^127\\.0\\.0\\.1$/.test(host) || /^::1$/.test(host) || /^localhost$/.test(host)) return "DIRECT";`;
    }

    // Wildcard patterns
    if (pattern.includes('*')) {
      const regex = this.wildcardToRegex(pattern);
      return `if (${regex}.test(host)) return "DIRECT";`;
    }

    // Plain hostname
    return `if (/^${this.escapeRegexPattern(pattern)}$/.test(host)) return "DIRECT";`;
  }

  /**
   * Generate condition check for switch rules
   */
  private generateConditionCheck(condition: Condition): string {
    switch (condition.conditionType) {
      case 'HostWildcardCondition': {
        const regex = this.wildcardToRegex(condition.pattern);
        return `${regex}.test(host)`;
      }

      case 'UrlWildcardCondition': {
        const regex = this.wildcardToRegex(condition.pattern);
        return `${regex}.test(url)`;
      }

      case 'HostRegexCondition':
        return `/${this.escapeRegexPattern(condition.pattern)}/.test(host)`;

      case 'UrlRegexCondition':
        return `/${this.escapeRegexPattern(condition.pattern)}/.test(url)`;

      case 'KeywordCondition':
        return `url.indexOf("${this.escapeString(condition.pattern)}") !== -1`;

      case 'HostLevelsCondition': {
        const parts = 'host.split(".").length';
        if (condition.minValue !== undefined && condition.maxValue !== undefined) {
          return `(${parts} >= ${condition.minValue} && ${parts} <= ${condition.maxValue})`;
        } else if (condition.minValue !== undefined) {
          return `${parts} >= ${condition.minValue}`;
        } else if (condition.maxValue !== undefined) {
          return `${parts} <= ${condition.maxValue}`;
        }
        return 'true';
      }

      default:
        return 'false';
    }
  }

  /**
   * Convert wildcard pattern to regex (ZeroOmega compatible)
   */
  private wildcardToRegex(pattern: string): string {
    // Handle special SwitchyOmega semantics
    // *.example.com matches subdomains but NOT example.com itself
    // **.example.com matches all subdomains INCLUDING example.com
    
    if (pattern.startsWith('*.')) {
      // *.example.com → /(?:^|\.)example\.com$/
      const domain = pattern.substring(2);
      const escaped = this.escapeRegexPattern(domain);
      return `/(?:^|\\.)${escaped}$/`;
    } else if (pattern.startsWith('**')) {
      // Already includes base domain
      const domain = pattern.substring(2);
      const escaped = this.escapeRegexPattern(domain);
      return `/(?:^|\\.)${escaped}$/`;
    } else if (pattern.includes('*') || pattern.includes('?')) {
      // General wildcard conversion
      let regex = this.escapeRegexPattern(pattern);
      regex = regex.replace(/\\\*/g, '.*').replace(/\\\?/g, '.');
      return `/^${regex}$/`;
    } else {
      // Exact match
      return `/^${this.escapeRegexPattern(pattern)}$/`;
    }
  }

  /**
   * Sanitize profile name for use in JavaScript object key
   * Prevents injection attacks via malicious profile names
   * Security: Only allows alphanumeric, space, dash, underscore
   */
  private sanitizeProfileName(name: string): string {
    return name.replace(/[^a-zA-Z0-9 _-]/g, '_');
  }

  /**
   * Escape regex special characters
   */
  private escapeRegexPattern(pattern: string): string {
    return pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Escape string for JavaScript
   * Enhanced: Prevents newlines, control characters, and quote injection
   */
  private escapeString(str: string): string {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/'/g, "\\'")  
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/[\x00-\x1F\x7F]/g, '');
  }

  /**
   * Convert proxy server to PAC result string
   */
  private proxyServerToString(proxy: ProxyServer): string {
    const scheme = proxy.scheme.toUpperCase();
    const protocol = scheme === 'HTTP' ? 'PROXY' : 
                     scheme === 'HTTPS' ? 'HTTPS' :
                     scheme === 'SOCKS4' ? 'SOCKS' :
                     scheme === 'SOCKS5' ? 'SOCKS5' : 'PROXY';
    return `${protocol} ${proxy.host}:${proxy.port}`;
  }

  /**
   * Convert CIDR mask to subnet mask
   */
  private cidrToMask(cidr: string): string {
    const bits = parseInt(cidr);
    const mask = [];
    for (let i = 0; i < 4; i++) {
      const n = Math.min(bits - i * 8, 8);
      mask.push(n <= 0 ? 0 : 256 - Math.pow(2, 8 - n));
    }
    return mask.join('.');
  }

  /**
   * Generate the complete PAC boilerplate with resolver logic
   */
  private generatePacBoilerplate(rootProfileName: string, profilesDict: string): string {
    const safeRootProfileName = this.sanitizeProfileName(rootProfileName);
    return `var FindProxyForURL = function(init, profiles) {
    return function(url, host) {
        "use strict";
        var result = init, scheme = url.substr(0, url.indexOf(":"));
        do {
            if (!profiles[result]) return result;
            result = profiles[result];
            if (typeof result === "function") result = result(url, host, scheme);
        } while (typeof result !== "string" || result.charCodeAt(0) === 43);
        return result;
    };
}("+${safeRootProfileName}", ${profilesDict});
`;
  }
}

// ============================================================================
// Legacy API Compatibility Layer
// ============================================================================

/**
 * Generate PAC script for a profile (legacy API)
 * @deprecated Use PacCompiler class instead
 */
export function generatePacScript(profile: Profile, allProfiles: Profile[]): string {
  const compiler = new PacCompiler(allProfiles);
  return compiler.compilePacScript(profile.name);
}

/**
 * Beautify PAC script (add proper indentation and comments)
 */
export function beautifyPac(pac: string): string {
  // Already formatted in generation
  return pac;
}

/**
 * Minify PAC script (remove comments and whitespace)
 */
export function minifyPac(pac: string): string {
  return pac
    .split('\n')
    .filter(line => !line.trim().startsWith('//'))
    .join('\n')
    .replace(/\s+/g, ' ')
    .replace(/\s*\{\s*/g, '{')
    .replace(/\s*\}\s*/g, '}')
    .replace(/\s*\(\s*/g, '(')
    .replace(/\s*\)\s*/g, ')')
    .trim();
}
