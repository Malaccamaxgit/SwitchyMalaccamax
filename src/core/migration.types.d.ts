/**
 * migration.types.ts - Type definitions for Import/Export Migration System
 *
 * This file defines the architecture for handling both Legacy (ZeroOmega .bak)
 * and Modern (SwitchyMalaccamax v2) export formats.
 */
import type { OmegaExport, Profile, Condition } from './schema';
/**
 * Detected format type
 */
export declare enum ExportFormat {
    LEGACY = "legacy",// ZeroOmega/SwitchyOmega .bak format
    MODERN = "modern",// SwitchyMalaccamax v2+ format
    UNKNOWN = "unknown"
}
/**
 * Format detection result
 */
export interface FormatDetectionResult {
    format: ExportFormat;
    version?: string;
    confidence: number;
    reasons: string[];
    warnings?: string[];
}
/**
 * Modern Export Format (SwitchyMalaccamax v2.0+)
 *
 * Key differences from legacy:
 * - No + or - prefixes on keys
 * - CamelCase for all property names
 * - Explicit versioning with major.minor
 * - Profiles in dedicated array
 * - Settings in dedicated object
 * - Metadata for export tracking
 * - Human-readable structure
 */
export interface ModernExport {
    version: string;
    exportedAt: string;
    exportedBy: string;
    profiles: ModernProfile[];
    settings: ModernSettings;
}
/**
 * Modern Profile Format
 * Cleaner than legacy with explicit discriminated union
 */
export interface ModernProfile {
    id: string;
    name: string;
    type: ProfileType;
    color?: string;
    revision?: string;
    config: ProfileConfig;
}
/**
 * Profile type enum (more explicit than string literals)
 */
export declare enum ProfileType {
    DIRECT = "direct",
    SYSTEM = "system",
    FIXED = "fixed",
    PAC = "pac",
    SWITCH = "switch",
    RULE_LIST = "ruleList",
    VIRTUAL = "virtual"
}
/**
 * Profile configuration (discriminated union by type)
 */
export type ProfileConfig = DirectConfig | SystemConfig | FixedConfig | PacConfig | SwitchConfig | RuleListConfig | VirtualConfig;
export interface DirectConfig {
    type: 'direct';
}
export interface SystemConfig {
    type: 'system';
}
export interface FixedConfig {
    type: 'fixed';
    proxy: ProxyServer;
    bypassRules?: ModernCondition[];
}
export interface PacConfig {
    type: 'pac';
    pacUrl?: string;
    pacScript?: string;
    fallbackProxy?: ProxyServer;
}
export interface SwitchConfig {
    type: 'switch';
    defaultProfile: string;
    rules: SwitchRule[];
}
export interface RuleListConfig {
    type: 'ruleList';
    ruleListUrl: string;
    matchProfile: string;
    defaultProfile: string;
    sourceUrl?: string;
    format?: string;
}
export interface VirtualConfig {
    type: 'virtual';
    targetProfile: string;
}
/**
 * Modern proxy server (same as legacy but more explicit docs)
 */
export interface ProxyServer {
    scheme: 'http' | 'https' | 'socks4' | 'socks5';
    host: string;
    port: number;
}
/**
 * Modern condition format
 * More explicit type discriminator
 */
export interface ModernCondition {
    type: ConditionType;
    pattern?: string;
    minValue?: number;
    maxValue?: number;
}
/**
 * Condition type enum
 */
export declare enum ConditionType {
    BYPASS = "bypass",
    HOST_WILDCARD = "hostWildcard",
    HOST_REGEX = "hostRegex",
    HOST_LEVELS = "hostLevels",
    URL_WILDCARD = "urlWildcard",
    URL_REGEX = "urlRegex",
    KEYWORD = "keyword"
}
/**
 * Modern switch rule
 */
export interface SwitchRule {
    condition: ModernCondition;
    profile: string;
}
/**
 * Modern settings format
 * CamelCase keys, more organized
 */
export interface ModernSettings {
    ui: {
        addConditionsToBottom?: boolean;
        confirmDeletion?: boolean;
        showExternalProfile?: boolean;
        showInspectMenu?: boolean;
        customCss?: string;
    };
    behavior: {
        startupProfile?: string;
        refreshOnProfileChange?: boolean;
        revertProxyChanges?: boolean;
        enableQuickSwitch?: boolean;
        quickSwitchProfiles?: string[];
    };
    advanced: {
        monitorWebRequests?: boolean;
        downloadInterval?: number;
        showResultProfileOnBadge?: boolean;
    };
}
/**
 * Migration service for handling format conversion
 */
export interface IMigrationService {
    /**
     * Detect format of uploaded file
     */
    detectFormat(data: unknown): FormatDetectionResult;
    /**
     * Import from any format (auto-detects)
     * @throws {ImportError} if format invalid or security check fails
     */
    import(data: unknown): Promise<ImportResult>;
    /**
     * Import from legacy format
     * @throws {ImportError} if invalid or security check fails
     */
    importLegacy(data: OmegaExport): Promise<ImportResult>;
    /**
     * Import from modern format
     * @throws {ImportError} if validation fails
     */
    importModern(data: ModernExport): Promise<ImportResult>;
    /**
     * Export to legacy format
     */
    exportToLegacy(profiles: ModernProfile[], settings: ModernSettings): OmegaExport;
    /**
     * Export to modern format
     */
    exportToModern(profiles: ModernProfile[], settings: ModernSettings): ModernExport;
}
/**
 * Import result with validation details
 */
export interface ImportResult {
    success: boolean;
    profiles: ModernProfile[];
    settings: ModernSettings;
    warnings: ValidationWarning[];
    errors: ValidationError[];
    securityReport: SecurityReport;
    migrationResult: MigrationResult;
}
/**
 * Migration result with detailed item tracking
 * Tracks exactly what happened during import/transformation
 */
export interface MigrationResult {
    totalItems: number;
    successCount: number;
    warningCount: number;
    errorCount: number;
    successes: MigrationSuccess[];
    warnings: MigrationWarning[];
    errors: MigrationError[];
    startTime: string;
    endTime: string;
    duration: number;
}
/**
 * Successfully imported item
 */
export interface MigrationSuccess {
    type: 'profile' | 'setting' | 'condition' | 'rule';
    name: string;
    source: string;
    destination: string;
    details?: string;
}
/**
 * Item imported with modifications (compatibility changes)
 */
export interface MigrationWarning {
    type: 'profile' | 'setting' | 'condition' | 'rule';
    name: string;
    source: string;
    issue: string;
    resolution: string;
    severity: 'low' | 'medium' | 'high';
    originalValue?: string;
    modifiedValue?: string;
}
/**
 * Item that failed to import (blocked)
 */
export interface MigrationError {
    type: 'profile' | 'setting' | 'condition' | 'rule' | 'pattern';
    name: string;
    source: string;
    reason: string;
    details?: string;
    blockedBy: 'security' | 'validation' | 'compatibility';
    suggestion?: string;
}
/**
 * Validation warning (non-fatal)
 */
export interface ValidationWarning {
    code: string;
    message: string;
    path?: string;
    suggestion?: string;
}
/**
 * Validation error (fatal)
 */
export interface ValidationError {
    code: string;
    message: string;
    path?: string;
    severity: 'error' | 'critical';
}
/**
 * Security report from import
 */
export interface SecurityReport {
    totalPatterns: number;
    safePatterns: number;
    rejectedPatterns: number;
    rejectedDetails: RejectedPattern[];
    warnings: string[];
}
/**
 * Details of a rejected pattern
 */
export interface RejectedPattern {
    type: 'regex' | 'wildcard';
    pattern: string;
    reason: string;
    location: string;
    suggestion?: string;
}
/**
 * Legacy mapper for transforming old format to new
 */
export interface ILegacyMapper {
    /**
     * Map legacy export to modern format
     * Applies security validation to all patterns
     */
    mapToModern(legacy: OmegaExport): Promise<MappingResult>;
    /**
     * Map modern format back to legacy (for compatibility)
     */
    mapToLegacy(modern: ModernExport): OmegaExport;
    /**
     * Map individual profile from legacy to modern
     */
    mapProfile(legacy: Profile, legacyKey: string): Promise<ModernProfile>;
    /**
     * Map individual condition from legacy to modern
     * Applies security validation
     */
    mapCondition(legacy: Condition): Promise<ModernCondition>;
}
/**
 * Result of mapping operation
 */
export interface MappingResult {
    success: boolean;
    profiles: ModernProfile[];
    settings: ModernSettings;
    warnings: ValidationWarning[];
    errors: ValidationError[];
    securityReport: SecurityReport;
    migrationResult: MigrationResult;
}
/**
 * Storage service for user preferences
 */
export interface IStorageService {
    /**
     * Get user's preferred export format
     */
    getPreferredExportFormat(): Promise<ExportFormat>;
    /**
     * Set user's preferred export format
     */
    setPreferredExportFormat(format: ExportFormat): Promise<void>;
    /**
     * Get all profiles
     */
    getProfiles(): Promise<ModernProfile[]>;
    /**
     * Save all profiles
     */
    saveProfiles(profiles: ModernProfile[]): Promise<void>;
    /**
     * Get settings
     */
    getSettings(): Promise<ModernSettings>;
    /**
     * Save settings
     */
    saveSettings(settings: ModernSettings): Promise<void>;
    /**
     * Get active profile ID
     */
    getActiveProfile(): Promise<string>;
    /**
     * Set active profile ID
     */
    setActiveProfile(profileId: string): Promise<void>;
}
/**
 * Import error
 */
export declare class ImportError extends Error {
    code: string;
    details?: unknown | undefined;
    constructor(message: string, code: string, details?: unknown | undefined);
}
/**
 * Security validation error
 */
export declare class SecurityValidationError extends ImportError {
    rejectedPatterns: RejectedPattern[];
    constructor(message: string, rejectedPatterns: RejectedPattern[]);
}
/**
 * Format detection error
 */
export declare class FormatDetectionError extends ImportError {
    attempted: string[];
    constructor(message: string, attempted: string[]);
}
//# sourceMappingURL=migration.types.d.ts.map