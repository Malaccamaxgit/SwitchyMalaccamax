/**
 * migration.types.ts - Type definitions for Import/Export Migration System
 *
 * This file defines the architecture for handling both Legacy (ZeroOmega .bak)
 * and Modern (SwitchyMalaccamax v2) export formats.
 */
// ============================================================================
// FORMAT DETECTION
// ============================================================================
/**
 * Detected format type
 */
export var ExportFormat;
(function (ExportFormat) {
    ExportFormat["LEGACY"] = "legacy";
    ExportFormat["MODERN"] = "modern";
    ExportFormat["UNKNOWN"] = "unknown";
})(ExportFormat || (ExportFormat = {}));
/**
 * Profile type enum (more explicit than string literals)
 */
export var ProfileType;
(function (ProfileType) {
    ProfileType["DIRECT"] = "direct";
    ProfileType["SYSTEM"] = "system";
    ProfileType["FIXED"] = "fixed";
    ProfileType["PAC"] = "pac";
    ProfileType["SWITCH"] = "switch";
    ProfileType["RULE_LIST"] = "ruleList";
    ProfileType["VIRTUAL"] = "virtual";
})(ProfileType || (ProfileType = {}));
/**
 * Condition type enum
 */
export var ConditionType;
(function (ConditionType) {
    ConditionType["BYPASS"] = "bypass";
    ConditionType["HOST_WILDCARD"] = "hostWildcard";
    ConditionType["HOST_REGEX"] = "hostRegex";
    ConditionType["HOST_LEVELS"] = "hostLevels";
    ConditionType["URL_WILDCARD"] = "urlWildcard";
    ConditionType["URL_REGEX"] = "urlRegex";
    ConditionType["KEYWORD"] = "keyword";
})(ConditionType || (ConditionType = {}));
// ============================================================================
// ERROR TYPES
// ============================================================================
/**
 * Import error
 */
export class ImportError extends Error {
    code;
    details;
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'ImportError';
    }
}
/**
 * Security validation error
 */
export class SecurityValidationError extends ImportError {
    rejectedPatterns;
    constructor(message, rejectedPatterns) {
        super(message, 'SECURITY_VALIDATION_FAILED', rejectedPatterns);
        this.rejectedPatterns = rejectedPatterns;
        this.name = 'SecurityValidationError';
    }
}
/**
 * Format detection error
 */
export class FormatDetectionError extends ImportError {
    attempted;
    constructor(message, attempted) {
        super(message, 'FORMAT_DETECTION_FAILED', attempted);
        this.attempted = attempted;
        this.name = 'FormatDetectionError';
    }
}
//# sourceMappingURL=migration.types.js.map