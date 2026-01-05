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
// TYPE GUARDS
// ============================================================================
/**
 * Type guard for FixedProfile
 */
export function isFixedProfile(profile) {
    return profile.profileType === 'FixedProfile';
}
/**
 * Type guard for SwitchProfile
 */
export function isSwitchProfile(profile) {
    return profile.profileType === 'SwitchProfile';
}
/**
 * Type guard for PacProfile
 */
export function isPacProfile(profile) {
    return profile.profileType === 'PacProfile';
}
/**
 * Type guard for RuleListProfile
 */
export function isRuleListProfile(profile) {
    return profile.profileType === 'RuleListProfile';
}
/**
 * Type guard for regex-based conditions (need safe regex)
 */
export function isRegexCondition(condition) {
    return (condition.conditionType === 'HostRegexCondition' ||
        condition.conditionType === 'UrlRegexCondition');
}
/**
 * Type guard for wildcard conditions
 */
export function isWildcardCondition(condition) {
    return (condition.conditionType === 'HostWildcardCondition' ||
        condition.conditionType === 'UrlWildcardCondition');
}
//# sourceMappingURL=schema.js.map