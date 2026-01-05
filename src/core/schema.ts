/**
 * schema.ts - TypeScript Schema for ZeroOmega/SwitchyOmega Configuration
 * 
 * This file defines the EXACT structure of the legacy ZeroOmega export format
 * to ensure 100% backward compatibility. Every interface matches the JSON schema
 * from existing .bak export files.
 * 
 * Schema Version: 2 (as of ZeroOmega 2024)
 */

// ============================================================================
// CONDITION TYPES
// ============================================================================

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
  pattern: string; // IP address, CIDR notation, or hostname
}

/**
 * Host wildcard condition - matches hosts using wildcard patterns
 * Supports: *, ?, *.domain, **.domain semantics
 * Example: {"conditionType":"HostWildcardCondition","pattern":"*.example.com"}
 */
export interface HostWildcardCondition extends BaseCondition {
  conditionType: 'HostWildcardCondition';
  pattern: string; // Wildcard pattern (*, ?, *.domain, **.domain)
}

/**
 * Host regex condition - matches hosts using regular expressions
 * SECURITY: Must use safe regex compilation to prevent ReDoS
 * Example: {"conditionType":"HostRegexCondition","pattern":"^.*\\.example\\.com$"}
 */
export interface HostRegexCondition extends BaseCondition {
  conditionType: 'HostRegexCondition';
  pattern: string; // Regular expression pattern
}

/**
 * Host levels condition - matches based on subdomain depth
 * Example: {"conditionType":"HostLevelsCondition","minValue":2,"maxValue":3}
 */
export interface HostLevelsCondition extends BaseCondition {
  conditionType: 'HostLevelsCondition';
  minValue?: number; // Minimum subdomain levels (-1 for infinity)
  maxValue?: number; // Maximum subdomain levels (-1 for infinity)
}

/**
 * URL wildcard condition - matches full URLs using wildcard patterns
 * Example: {"conditionType":"UrlWildcardCondition","pattern":"https://*.example.com/*"}
 */
export interface UrlWildcardCondition extends BaseCondition {
  conditionType: 'UrlWildcardCondition';
  pattern: string; // Wildcard pattern for full URL
}

/**
 * URL regex condition - matches full URLs using regular expressions
 * SECURITY: Must use safe regex compilation to prevent ReDoS
 * Example: {"conditionType":"UrlRegexCondition","pattern":"^https://.*\\.example\\.com/.*$"}
 */
export interface UrlRegexCondition extends BaseCondition {
  conditionType: 'UrlRegexCondition';
  pattern: string; // Regular expression pattern
}

/**
 * Keyword condition - simple substring match
 * Example: {"conditionType":"KeywordCondition","pattern":"example"}
 */
export interface KeywordCondition extends BaseCondition {
  conditionType: 'KeywordCondition';
  pattern: string; // Substring to match
}

/**
 * Union type of all possible condition types
 */
export type Condition =
  | BypassCondition
  | HostWildcardCondition
  | HostRegexCondition
  | HostLevelsCondition
  | UrlWildcardCondition
  | UrlRegexCondition
  | KeywordCondition;

// ============================================================================
// PROXY CONFIGURATION
// ============================================================================

/**
 * Proxy server configuration
 * Used in: FixedProfile.fallbackProxy, PacProfile.fallbackProxy
 */
export interface ProxyServer {
  scheme: 'http' | 'https' | 'socks4' | 'socks5'; // Proxy protocol
  host: string; // Proxy hostname or IP
  port: number; // Proxy port
}

// ============================================================================
// PROFILE TYPES
// ============================================================================

/**
 * Base profile interface - all profiles extend this
 */
export interface BaseProfile {
  name: string; // Profile display name
  profileType: string; // Discriminator for profile type
  color?: string; // Hex color for UI (#RRGGBB)
  revision?: string; // Version/revision identifier
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
  fallbackProxy: ProxyServer; // The proxy server to use
  bypassList?: Condition[]; // Conditions for bypassing proxy
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
  pacUrl?: string; // URL to PAC script
  pacScript?: string; // Inline PAC script content
  fallbackProxy?: ProxyServer; // Fallback when PAC fails
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
  defaultProfileName: string; // Profile to use when no rule matches
  rules: SwitchRule[]; // Array of condition-to-profile mappings
}

/**
 * Rule in a SwitchProfile - maps condition to profile
 * Example: {
 *   "condition":{"conditionType":"HostWildcardCondition","pattern":"*.example.com"},
 *   "profileName":"Company"
 * }
 */
export interface SwitchRule {
  condition: Condition; // The matching condition
  profileName: string; // Name of profile to use when condition matches
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
  ruleListUrl: string; // URL to rule list
  matchProfileName: string; // Profile for matched requests
  defaultProfileName: string; // Profile for non-matched requests
  sourceUrl?: string; // Original source URL
  format?: string; // Rule list format (e.g., "AutoProxy")
}

/**
 * Virtual profile - references another profile without duplicating
 * Used for aliasing/referencing
 */
export interface VirtualProfile extends BaseProfile {
  profileType: 'VirtualProfile';
  defaultProfileName: string; // Name of the actual profile
}

/**
 * Union type of all possible profile types
 */
export type Profile =
  | DirectProfile
  | SystemProfile
  | FixedProfile
  | PacProfile
  | SwitchProfile
  | RuleListProfile
  | VirtualProfile;

// ============================================================================
// GLOBAL OPTIONS/SETTINGS
// ============================================================================

/**
 * Global application options
 * These are prefixed with '-' in the export format
 */
export interface GlobalOptions {
  // UI Options
  addConditionsToBottom?: boolean; // Add new conditions at bottom of list
  confirmDeletion?: boolean; // Confirm before deleting profiles/rules
  customCss?: string; // Custom CSS for UI theming
  showExternalProfile?: boolean; // Show external profile indicator
  showInspectMenu?: boolean; // Show "Inspect" context menu
  showResultProfileOnActionBadgeText?: boolean; // Show active profile on badge

  // Behavior Options
  refreshOnProfileChange?: boolean; // Reload tabs when profile changes
  revertProxyChanges?: boolean; // Revert external proxy changes
  startupProfileName?: string; // Profile to activate on startup
  enableQuickSwitch?: boolean; // Enable quick switch popup
  quickSwitchProfiles?: string[]; // Profiles for quick switch

  // Advanced Options
  monitorWebRequests?: boolean; // Monitor web requests for debugging
  downloadInterval?: number; // Auto-update interval (minutes)

  // Schema
  schemaVersion: number; // Configuration schema version (current: 2)
}

// ============================================================================
// EXPORT FORMAT
// ============================================================================

/**
 * Complete export structure
 * Keys:
 * - Profiles are prefixed with '+' (e.g., "+Company", "+auto switch")
 * - Settings are prefixed with '-' (e.g., "-startupProfileName")
 * - Special key: "schemaVersion" (no prefix)
 */
export interface OmegaExport {
  // Profiles (keys start with '+')
  [profileKey: `+${string}`]: Profile;

  // Global options (keys start with '-')
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

  // Schema version (no prefix)
  schemaVersion: number;
}

// ============================================================================
// RUNTIME INTERFACES (for matching engine)
// ============================================================================

/**
 * Request context for condition matching
 * Contains all information needed to evaluate conditions
 */
export interface RequestContext {
  url: string; // Full URL (e.g., "https://example.com/path")
  host: string; // Hostname only (e.g., "example.com")
  scheme?: string; // Protocol (http, https, ftp, etc.)
  type?: string; // Resource type (main_frame, sub_frame, script, etc.)
}

/**
 * Match result from condition evaluation
 */
export interface ConditionMatchResult {
  matched: boolean; // Whether condition matched
  profileName?: string; // Profile to use (if matched in SwitchProfile)
  error?: string; // Error message if evaluation failed
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for FixedProfile
 */
export function isFixedProfile(profile: Profile): profile is FixedProfile {
  return profile.profileType === 'FixedProfile';
}

/**
 * Type guard for SwitchProfile
 */
export function isSwitchProfile(profile: Profile): profile is SwitchProfile {
  return profile.profileType === 'SwitchProfile';
}

/**
 * Type guard for PacProfile
 */
export function isPacProfile(profile: Profile): profile is PacProfile {
  return profile.profileType === 'PacProfile';
}

/**
 * Type guard for RuleListProfile
 */
export function isRuleListProfile(profile: Profile): profile is RuleListProfile {
  return profile.profileType === 'RuleListProfile';
}

/**
 * Type guard for regex-based conditions (need safe regex)
 */
export function isRegexCondition(
  condition: Condition
): condition is HostRegexCondition | UrlRegexCondition {
  return (
    condition.conditionType === 'HostRegexCondition' ||
    condition.conditionType === 'UrlRegexCondition'
  );
}

/**
 * Type guard for wildcard conditions
 */
export function isWildcardCondition(
  condition: Condition
): condition is HostWildcardCondition | UrlWildcardCondition {
  return (
    condition.conditionType === 'HostWildcardCondition' ||
    condition.conditionType === 'UrlWildcardCondition'
  );
}
