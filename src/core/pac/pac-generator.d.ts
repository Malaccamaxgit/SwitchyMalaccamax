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
import type { Profile } from '../schema';
/**
 * PacCompiler - Advanced PAC script compiler with recursive profile resolution
 */
export declare class PacCompiler {
    private profiles;
    constructor(allProfiles: Profile[]);
    /**
     * Main compilation entry point - generates complete PAC script
     * @param rootProfileName - The starting profile (e.g., "Auto Switch")
     * @returns Complete PAC script with resolver boilerplate
     */
    compilePacScript(rootProfileName: string): string;
    /**
     * Recursively collect all profiles referenced by the root profile
     */
    private collectReferencedProfiles;
    /**
     * Generate the profiles dictionary object
     */
    private generateProfilesDictionary;
    /**
     * Compile a single profile into a JavaScript function
     */
    private compileProfile;
    /**
     * Compile DirectProfile - always returns DIRECT
     */
    private compileDirectProfile;
    /**
     * Compile SystemProfile - returns DIRECT (system proxy not available in PAC)
     */
    private compileSystemProfile;
    /**
     * Compile FixedProfile - returns proxy with optional bypass rules
     */
    private compileFixedProfile;
    /**
     * Compile SwitchProfile - returns profile references or final results
     */
    private compileSwitchProfile;
    /**
     * Compile PacProfile - returns proxy or DIRECT
     */
    private compilePacProfile;
    /**
     * Generate bypass condition check (returns "DIRECT" if matched)
     */
    private generateBypassCondition;
    /**
     * Generate condition check for switch rules
     */
    private generateConditionCheck;
    /**
     * Convert wildcard pattern to regex (ZeroOmega compatible)
     */
    private wildcardToRegex;
    /**
     * Sanitize profile name for use in JavaScript object key
     * Prevents injection attacks via malicious profile names
     * Security: Only allows alphanumeric, space, dash, underscore
     */
    private sanitizeProfileName;
    /**
     * Escape regex special characters
     */
    private escapeRegexPattern;
    /**
     * Escape string for JavaScript
     * Enhanced: Prevents newlines, control characters, and quote injection
     */
    private escapeString;
    /**
     * Convert proxy server to PAC result string
     */
    private proxyServerToString;
    /**
     * Convert CIDR mask to subnet mask
     */
    private cidrToMask;
    /**
     * Generate the complete PAC boilerplate with resolver logic
     */
    private generatePacBoilerplate;
}
/**
 * Generate PAC script for a profile (legacy API)
 * @deprecated Use PacCompiler class instead
 */
export declare function generatePacScript(profile: Profile, allProfiles: Profile[]): string;
/**
 * Beautify PAC script (add proper indentation and comments)
 */
export declare function beautifyPac(pac: string): string;
/**
 * Minify PAC script (remove comments and whitespace)
 */
export declare function minifyPac(pac: string): string;
//# sourceMappingURL=pac-generator.d.ts.map