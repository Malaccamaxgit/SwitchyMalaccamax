/**
 * schema.ts - TypeScript Schema for ZeroOmega/SwitchyOmega Configuration
 *
 * This file defines the EXACT structure of the legacy ZeroOmega export format
 * to ensure 100% backward compatibility. Every interface matches the JSON schema
 * from existing .bak export files.
 *
 * Schema Version: 2 (as of ZeroOmega 2024)
 */
/**
 * Base condition interface - all conditions extend this
 */
export interface BaseCondition {
    conditionType: string;
}
/**
 * Bypass condition - matches IPs/hosts that should bypass proxy
 * Used in: FixedProfile.bypassList
 * Example: {"conditionType":"BypassCondition","pattern":"192.168.2.0/24"}
 */
export interface BypassCondition extends BaseCondition {
    conditionType: 'BypassCondition';
    pattern: string;
}
/**
 * Host wildcard condition - matches hosts using wildcard patterns
 * Supports: *, ?, *.domain, **.domain semantics
 * Example: {"conditionType":"HostWildcardCondition","pattern":"*.example.com"}
 */
export interface HostWildcardCondition extends BaseCondition {
    conditionType: 'HostWildcardCondition';
    pattern: string;
}
/**
 * Host regex condition - matches hosts using regular expressions
 * SECURITY: Must use safe regex compilation to prevent ReDoS
 * Example: {"conditionType":"HostRegexCondition","pattern":"^.*\\.example\\.com$"}
 */
export interface HostRegexCondition extends BaseCondition {
    conditionType: 'HostRegexCondition';
    pattern: string;
}
/**
 * Host levels condition - matches based on subdomain depth
 * Example: {"conditionType":"HostLevelsCondition","minValue":2,"maxValue":3}
 */
export interface HostLevelsCondition extends BaseCondition {
    conditionType: 'HostLevelsCondition';
    minValue?: number;
    maxValue?: number;
}
/**
 * URL wildcard condition - matches full URLs using wildcard patterns
 * Example: {"conditionType":"UrlWildcardCondition","pattern":"https://*.example.com/*"}
 */
export interface UrlWildcardCondition extends BaseCondition {
    conditionType: 'UrlWildcardCondition';
    pattern: string;
}
/**
 * URL regex condition - matches full URLs using regular expressions
 * SECURITY: Must use safe regex compilation to prevent ReDoS
 * Example: {"conditionType":"UrlRegexCondition","pattern":"^https://.*\\.example\\.com/.*$"}
 */
export interface UrlRegexCondition extends BaseCondition {
    conditionType: 'UrlRegexCondition';
    pattern: string;
}
/**
 * Keyword condition - simple substring match
 * Example: {"conditionType":"KeywordCondition","pattern":"example"}
 */
export interface KeywordCondition extends BaseCondition {
    conditionType: 'KeywordCondition';
    pattern: string;
}
/**
 * Union type of all possible condition types
 */
export type Condition = BypassCondition | HostWildcardCondition | HostRegexCondition | HostLevelsCondition | UrlWildcardCondition | UrlRegexCondition | KeywordCondition;
/**
 * Proxy server configuration
 * Used in: FixedProfile.fallbackProxy, PacProfile.fallbackProxy
 */
export interface ProxyServer {
    scheme: 'http' | 'https' | 'socks4' | 'socks5';
    host: string;
    port: number;
}
/**
 * Base profile interface - all profiles extend this
 */
export interface BaseProfile {
    name: string;
    profileType: string;
    color?: string;
    revision?: string;
}
/**
 * Direct profile - no proxy, direct connection
 * Example: {"name":"[direct]","profileType":"DirectProfile","color":"#aaa"}
 */
export interface DirectProfile extends BaseProfile {
    profileType: 'DirectProfile';
}
/**
 * System profile - use system proxy settings
 * Example: {"name":"[system]","profileType":"SystemProfile","color":"#aaa"}
 */
export interface SystemProfile extends BaseProfile {
    profileType: 'SystemProfile';
}
/**
 * Fixed profile - single proxy server with optional bypass list
 * Example: {
 *   "name":"Company",
 *   "profileType":"FixedProfile",
 *   "color":"#99ccee",
 *   "fallbackProxy":{"host":"192.168.50.30","port":8213,"scheme":"http"},
 *   "bypassList":[...]
 * }
 */
export interface FixedProfile extends BaseProfile {
    profileType: 'FixedProfile';
    fallbackProxy: ProxyServer;
    bypassList?: Condition[];
}
/**
 * PAC profile - uses a PAC script (URL or inline)
 * Example: {
 *   "name":"AutoPAC",
 *   "profileType":"PacProfile",
 *   "pacUrl":"http://example.com/proxy.pac",
 *   "fallbackProxy":{"..."}
 * }
 */
export interface PacProfile extends BaseProfile {
    profileType: 'PacProfile';
    pacUrl?: string;
    pacScript?: string;
    fallbackProxy?: ProxyServer;
}
/**
 * Switch profile - rule-based automatic profile switching
 * Example: {
 *   "name":"auto switch",
 *   "profileType":"SwitchProfile",
 *   "color":"#99dd99",
 *   "defaultProfileName":"direct",
 *   "rules":[...]
 * }
 */
export interface SwitchProfile extends BaseProfile {
    profileType: 'SwitchProfile';
    defaultProfileName: string;
    rules: SwitchRule[];
}
/**
 * Rule in a SwitchProfile - maps condition to profile
 * Example: {
 *   "condition":{"conditionType":"HostWildcardCondition","pattern":"*.example.com"},
 *   "profileName":"Company"
 * }
 */
export interface SwitchRule {
    condition: Condition;
    profileName: string;
}
/**
 * RuleList profile - uses external rule list (e.g., gfwlist, autoproxy)
 * Example: {
 *   "name":"GFWList",
 *   "profileType":"RuleListProfile",
 *   "ruleListUrl":"https://example.com/gfwlist.txt",
 *   "matchProfileName":"proxy",
 *   "defaultProfileName":"direct"
 * }
 */
export interface RuleListProfile extends BaseProfile {
    profileType: 'RuleListProfile';
    ruleListUrl: string;
    matchProfileName: string;
    defaultProfileName: string;
    sourceUrl?: string;
    format?: string;
}
/**
 * Virtual profile - references another profile without duplicating
 * Used for aliasing/referencing
 */
export interface VirtualProfile extends BaseProfile {
    profileType: 'VirtualProfile';
    defaultProfileName: string;
}
/**
 * Union type of all possible profile types
 */
export type Profile = DirectProfile | SystemProfile | FixedProfile | PacProfile | SwitchProfile | RuleListProfile | VirtualProfile;
/**
 * Global application options
 * These are prefixed with '-' in the export format
 */
export interface GlobalOptions {
    addConditionsToBottom?: boolean;
    confirmDeletion?: boolean;
    customCss?: string;
    showExternalProfile?: boolean;
    showInspectMenu?: boolean;
    showResultProfileOnActionBadgeText?: boolean;
    refreshOnProfileChange?: boolean;
    revertProxyChanges?: boolean;
    startupProfileName?: string;
    enableQuickSwitch?: boolean;
    quickSwitchProfiles?: string[];
    monitorWebRequests?: boolean;
    downloadInterval?: number;
    schemaVersion: number;
}
/**
 * Complete export structure
 * Keys:
 * - Profiles are prefixed with '+' (e.g., "+Company", "+auto switch")
 * - Settings are prefixed with '-' (e.g., "-startupProfileName")
 * - Special key: "schemaVersion" (no prefix)
 */
export interface OmegaExport {
    [profileKey: `+${string}`]: Profile;
    '-addConditionsToBottom'?: boolean;
    '-confirmDeletion'?: boolean;
    '-customCss'?: string;
    '-downloadInterval'?: number;
    '-enableQuickSwitch'?: boolean;
    '-monitorWebRequests'?: boolean;
    '-quickSwitchProfiles'?: string[];
    '-refreshOnProfileChange'?: boolean;
    '-revertProxyChanges'?: boolean;
    '-showExternalProfile'?: boolean;
    '-showInspectMenu'?: boolean;
    '-showResultProfileOnActionBadgeText'?: boolean;
    '-startupProfileName'?: string;
    schemaVersion: number;
}
/**
 * Request context for condition matching
 * Contains all information needed to evaluate conditions
 */
export interface RequestContext {
    url: string;
    host: string;
    scheme?: string;
    type?: string;
}
/**
 * Match result from condition evaluation
 */
export interface ConditionMatchResult {
    matched: boolean;
    profileName?: string;
    error?: string;
}
/**
 * Type guard for FixedProfile
 */
export declare function isFixedProfile(profile: Profile): profile is FixedProfile;
/**
 * Type guard for SwitchProfile
 */
export declare function isSwitchProfile(profile: Profile): profile is SwitchProfile;
/**
 * Type guard for PacProfile
 */
export declare function isPacProfile(profile: Profile): profile is PacProfile;
/**
 * Type guard for RuleListProfile
 */
export declare function isRuleListProfile(profile: Profile): profile is RuleListProfile;
/**
 * Type guard for regex-based conditions (need safe regex)
 */
export declare function isRegexCondition(condition: Condition): condition is HostRegexCondition | UrlRegexCondition;
/**
 * Type guard for wildcard conditions
 */
export declare function isWildcardCondition(condition: Condition): condition is HostWildcardCondition | UrlWildcardCondition;
//# sourceMappingURL=schema.d.ts.map