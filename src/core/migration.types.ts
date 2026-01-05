/**
 * migration.types.ts - Type definitions for Import/Export Migration System
 * 
 * This file defines the architecture for handling both Legacy (ZeroOmega .bak)
 * and Modern (SwitchyMalaccamax v2) export formats.
 */

import type { OmegaExport, Profile, Condition } from './schema';

// ============================================================================
// FORMAT DETECTION
// ============================================================================

/**
 * Detected format type
 */
export enum ExportFormat {
  LEGACY = 'legacy', // ZeroOmega/SwitchyOmega .bak format
  MODERN = 'modern', // SwitchyMalaccamax v2+ format
  UNKNOWN = 'unknown', // Cannot determine format
}

/**
 * Format detection result
 */
export interface FormatDetectionResult {
  format: ExportFormat;
  version?: string; // e.g., "2" for legacy, "2.0" for modern
  confidence: number; // 0-1, how confident we are in detection
  reasons: string[]; // Why we detected this format
  warnings?: string[]; // Any potential issues detected
}

// ============================================================================
// MODERN FORMAT SCHEMA (v2.0)
// ============================================================================

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
  // Metadata
  version: string; // Format version (e.g., "2.0")
  exportedAt: string; // ISO 8601 timestamp
  exportedBy: string; // Application identifier
  
  // Profiles (no + prefix)
  profiles: ModernProfile[];
  
  // Settings (no - prefix)
  settings: ModernSettings;
}

/**
 * Modern Profile Format
 * Cleaner than legacy with explicit discriminated union
 */
export interface ModernProfile {
  // Common fields
  id: string; // Unique identifier (new in modern format)
  name: string;
  type: ProfileType; // Explicit enum instead of string
  color?: string; // Hex color
  revision?: string;
  
  // Type-specific configuration (discriminated union)
  config: ProfileConfig;
}

/**
 * Profile type enum (more explicit than string literals)
 */
export enum ProfileType {
  DIRECT = 'direct',
  SYSTEM = 'system',
  FIXED = 'fixed',
  PAC = 'pac',
  SWITCH = 'switch',
  RULE_LIST = 'ruleList',
  VIRTUAL = 'virtual',
}

/**
 * Profile configuration (discriminated union by type)
 */
export type ProfileConfig =
  | DirectConfig
  | SystemConfig
  | FixedConfig
  | PacConfig
  | SwitchConfig
  | RuleListConfig
  | VirtualConfig;

export interface DirectConfig {
  type: 'direct';
}

export interface SystemConfig {
  type: 'system';
}

export interface FixedConfig {
  type: 'fixed';
  proxy: ProxyServer;
  bypassRules?: ModernCondition[]; // More explicit than "bypassList"
}

export interface PacConfig {
  type: 'pac';
  pacUrl?: string;
  pacScript?: string;
  fallbackProxy?: ProxyServer;
}

export interface SwitchConfig {
  type: 'switch';
  defaultProfile: string; // Profile ID or name
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
  targetProfile: string; // More explicit than "defaultProfileName"
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
  type: ConditionType; // Explicit enum
  pattern?: string; // For pattern-based conditions
  minValue?: number; // For HostLevels
  maxValue?: number; // For HostLevels
}

/**
 * Condition type enum
 */
export enum ConditionType {
  BYPASS = 'bypass',
  HOST_WILDCARD = 'hostWildcard',
  HOST_REGEX = 'hostRegex',
  HOST_LEVELS = 'hostLevels',
  URL_WILDCARD = 'urlWildcard',
  URL_REGEX = 'urlRegex',
  KEYWORD = 'keyword',
}

/**
 * Modern switch rule
 */
export interface SwitchRule {
  condition: ModernCondition;
  profile: string; // Profile ID or name
}

/**
 * Modern settings format
 * CamelCase keys, more organized
 */
export interface ModernSettings {
  // UI Settings
  ui: {
    addConditionsToBottom?: boolean;
    confirmDeletion?: boolean;
    showExternalProfile?: boolean;
    showInspectMenu?: boolean;
    customCss?: string;
  };
  
  // Behavior Settings
  behavior: {
    startupProfile?: string;
    refreshOnProfileChange?: boolean;
    revertProxyChanges?: boolean;
    enableQuickSwitch?: boolean;
    quickSwitchProfiles?: string[];
  };
  
  // Advanced Settings
  advanced: {
    monitorWebRequests?: boolean;
    downloadInterval?: number; // minutes
    showResultProfileOnBadge?: boolean;
  };
}

// ============================================================================
// MIGRATION SERVICE INTERFACE
// ============================================================================

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
  migrationResult: MigrationResult; // Detailed tracking
}

/**
 * Migration result with detailed item tracking
 * Tracks exactly what happened during import/transformation
 */
export interface MigrationResult {
  // Summary counters
  totalItems: number;
  successCount: number;
  warningCount: number;
  errorCount: number;
  
  // Detailed item tracking
  successes: MigrationSuccess[];
  warnings: MigrationWarning[];
  errors: MigrationError[];
  
  // Timing
  startTime: string; // ISO timestamp
  endTime: string;   // ISO timestamp
  duration: number;  // milliseconds
}

/**
 * Successfully imported item
 */
export interface MigrationSuccess {
  type: 'profile' | 'setting' | 'condition' | 'rule';
  name: string;          // Human-readable name
  source: string;        // Where it came from (e.g., "+Company")
  destination: string;   // Where it went (e.g., "profile-company-1a2b3c4d")
  details?: string;      // Additional info
}

/**
 * Item imported with modifications (compatibility changes)
 */
export interface MigrationWarning {
  type: 'profile' | 'setting' | 'condition' | 'rule';
  name: string;
  source: string;
  issue: string;         // What was the problem
  resolution: string;    // How we fixed it
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
  reason: string;        // Why it failed
  details?: string;      // Additional context
  blockedBy: 'security' | 'validation' | 'compatibility';
  suggestion?: string;   // How to fix it
}

/**
 * Validation warning (non-fatal)
 */
export interface ValidationWarning {
  code: string;
  message: string;
  path?: string; // JSON path to problematic data
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
  location: string; // Profile/condition that contained it
  suggestion?: string; // Safe alternative if available
}

// ============================================================================
// LEGACY MAPPER INTERFACE
// ============================================================================

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
  migrationResult: MigrationResult; // Detailed tracking
}

// ============================================================================
// STORAGE SERVICE INTERFACE
// ============================================================================

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

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Import error
 */
export class ImportError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ImportError';
  }
}

/**
 * Security validation error
 */
export class SecurityValidationError extends ImportError {
  constructor(
    message: string,
    public rejectedPatterns: RejectedPattern[]
  ) {
    super(message, 'SECURITY_VALIDATION_FAILED', rejectedPatterns);
    this.name = 'SecurityValidationError';
  }
}

/**
 * Format detection error
 */
export class FormatDetectionError extends ImportError {
  constructor(message: string, public attempted: string[]) {
    super(message, 'FORMAT_DETECTION_FAILED', attempted);
    this.name = 'FormatDetectionError';
  }
}
