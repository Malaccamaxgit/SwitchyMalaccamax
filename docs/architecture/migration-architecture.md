# Migration Service Architecture

This document describes the architecture of the dual-format import/export system.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ACTIONS                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MIGRATION SERVICE                           │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  1. FORMAT DETECTION                                    │    │
│  │     • Analyze file structure                            │    │
│  │     • Check for + and - prefixes (legacy)              │    │
│  │     • Check for version field (modern)                 │    │
│  │     • Return confidence score                           │    │
│  └────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                    ┌─────────┴─────────┐                        │
│                    ▼                   ▼                         │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │  LEGACY IMPORT      │  │  MODERN IMPORT      │              │
│  │  ┌──────────────┐   │  │  ┌──────────────┐   │              │
│  │  │ LegacyMapper │   │  │  │ JSON Schema  │   │              │
│  │  │  Validation  │   │  │  │  Validation  │   │              │
│  │  └──────────────┘   │  │  └──────────────┘   │              │
│  │         │            │  │         │            │              │
│  │         ▼            │  │         ▼            │              │
│  │  ┌──────────────┐   │  │  ┌──────────────┐   │              │
│  │  │   Security   │   │  │  │   Security   │   │              │
│  │  │  Validation  │   │  │  │  Validation  │   │              │
│  │  │ (regexSafe)  │   │  │  │ (regexSafe)  │   │              │
│  │  └──────────────┘   │  │  └──────────────┘   │              │
│  │         │            │  │         │            │              │
│  │         ▼            │  │         ▼            │              │
│  │  ┌──────────────┐   │  │  ┌──────────────┐   │              │
│  │  │   Transform  │   │  │  │  Direct Use  │   │              │
│  │  │ to Modern    │   │  │  │              │   │              │
│  │  └──────────────┘   │  │  └──────────────┘   │              │
│  └─────────────────────┘  └─────────────────────┘              │
│                    │                   │                         │
│                    └─────────┬─────────┘                        │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  2. UNIFIED MODERN FORMAT                               │    │
│  │     • ModernProfile[]                                   │    │
│  │     • ModernSettings                                    │    │
│  │     • SecurityReport                                    │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      STORAGE SERVICE                             │
│  • Save profiles to Chrome storage                              │
│  • Save settings to Chrome storage                              │
│  • Track user preferences (export format)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         EXPORT FLOW                              │
│                                                                  │
│  User Preference: settings.exportFormat                         │
│                              │                                   │
│                    ┌─────────┴─────────┐                        │
│                    ▼                   ▼                         │
│       ┌──────────────────┐  ┌──────────────────┐               │
│       │ exportToModern() │  │ exportToLegacy() │               │
│       └──────────────────┘  └──────────────────┘               │
│                    │                   │                         │
│                    ▼                   ▼                         │
│       ┌──────────────────┐  ┌──────────────────┐               │
│       │  Modern JSON     │  │  Legacy .bak     │               │
│       │  (v2.0 format)   │  │  (compatible)    │               │
│       └──────────────────┘  └──────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

### 1. MigrationService
**Purpose**: Orchestrate import/export with format detection

**Methods**:
```typescript
detectFormat(data: unknown): FormatDetectionResult
  ├─ Check for schemaVersion field (legacy indicator)
  ├─ Check for + and - prefix keys (legacy indicator)
  ├─ Check for version field (modern indicator)
  ├─ Check for profiles array (modern indicator)
  └─ Return confidence score (0-1)

import(data: unknown): Promise<ImportResult>
  ├─ Call detectFormat()
  ├─ Route to importLegacy() or importModern()
  ├─ Apply security validation
  └─ Return unified result with warnings/errors

exportToModern(profiles, settings): ModernExport
  ├─ Add metadata (timestamp, version)
  ├─ Validate all profiles
  └─ Generate clean JSON

exportToLegacy(profiles, settings): OmegaExport
  ├─ Transform to legacy structure
  ├─ Add + and - prefixes
  └─ Set schemaVersion = 2
```

### 2. LegacyMapper
**Purpose**: Transform legacy format ↔ modern format

**Methods**:
```typescript
mapToModern(legacy: OmegaExport): Promise<MappingResult>
  ├─ For each +key → create ModernProfile
  │   ├─ Generate unique ID from name+revision
  │   ├─ Transform profileType → type enum
  │   ├─ Map nested fields (bypassList → bypassRules)
  │   └─ Apply security validation to patterns
  │
  ├─ For each -key → populate ModernSettings
  │   ├─ Group by category (ui, behavior, advanced)
  │   └─ Transform key names to camelCase
  │
  └─ Return MappingResult with security report

mapToLegacy(modern: ModernExport): OmegaExport
  ├─ For each profile → create +key entry
  │   ├─ Use profile.name as key
  │   ├─ Transform type → profileType string
  │   └─ Flatten nested config
  │
  ├─ For each setting → create -key entry
  │   └─ Flatten grouped settings
  │
  └─ Add schemaVersion = 2
```

### 3. Security Validation Layer
**Purpose**: Prevent ReDoS and validate patterns

**Flow**:
```typescript
For each pattern in import:
  ├─ Identify pattern type (regex/wildcard)
  │
  ├─ If regex:
  │   ├─ Call RegexValidator.validate(pattern)
  │   ├─ Check: length, complexity, backtracking
  │   └─ If unsafe: reject with reason
  │
  ├─ If wildcard:
  │   ├─ Call WildcardMatcher.validate(pattern)
  │   ├─ Check: length, ** usage
  │   └─ If invalid: reject with reason
  │
  └─ If rejected:
      ├─ Add to securityReport.rejectedDetails
      ├─ Generate suggested safe alternative
      └─ Continue with remaining patterns
```

**Security Report Structure**:
```typescript
{
  totalPatterns: 25,
  safePatterns: 23,
  rejectedPatterns: 2,
  rejectedDetails: [
    {
      type: "regex",
      pattern: "(a+)+",
      reason: "Catastrophic backtracking detected",
      location: "Company → Bypass Rule 3",
      suggestion: "Use '^a+$' instead"
    },
    {
      type: "regex",
      pattern: "(.+)*\\.com",
      reason: "Exceeds max quantifiers (50)",
      location: "auto switch → Rule 7",
      suggestion: "Use '^[^.]+\\.com$' instead"
    }
  ],
  warnings: [
    "2 patterns were rejected for security reasons",
    "Review rejected patterns before importing"
  ]
}
```

### 4. StorageService
**Purpose**: Manage Chrome storage and user preferences

**Storage Structure**:
```typescript
chrome.storage.sync:
  ├─ preferredExportFormat: "modern" | "legacy"
  ├─ activeProfileId: string
  └─ settings: ModernSettings

chrome.storage.local:
  └─ profiles: ModernProfile[]
```

**Methods**:
```typescript
getPreferredExportFormat(): Promise<ExportFormat>
  └─ Return user preference (default: modern)

setPreferredExportFormat(format): Promise<void>
  └─ Save to chrome.storage.sync

getProfiles(): Promise<ModernProfile[]>
  └─ Load from chrome.storage.local

saveProfiles(profiles): Promise<void>
  ├─ Validate all profiles
  └─ Save to chrome.storage.local
```

## Import Flow Example

### Legacy Import
```typescript
User uploads: ZeroOmegaExport_Company_Example.bak

Step 1: Format Detection
  ✓ Found schemaVersion: 2
  ✓ Found +Company key (legacy)
  ✓ Found -startupProfileName key (legacy)
  → Detected: LEGACY format (confidence: 1.0)

Step 2: Legacy Mapping
  Profile: "+Company" (FixedProfile)
    ├─ Generate ID: "profile-company-1a2b3c4d"
    ├─ Map bypassList → bypassRules
    │   ├─ Condition 1: "127.0.0.1" (BypassCondition)
    │   │   └─ Transform: {type: "bypass", pattern: "127.0.0.1"}
    │   └─ Condition 2: "localhost" (BypassCondition)
    │       └─ Transform: {type: "bypass", pattern: "localhost"}
    └─ Security check: PASS (no regex patterns)

  Profile: "+auto switch" (SwitchProfile)
    ├─ Generate ID: "profile-auto-switch"
    ├─ Map rules[0]: HostWildcardCondition
    │   ├─ Pattern: "*.company.com"
    │   ├─ Security: WildcardMatcher.validate() → PASS
    │   └─ Transform: {type: "hostWildcard", pattern: "*.company.com"}
    └─ Map rules[1]: HostRegexCondition
        ├─ Pattern: "^.*\\.internal$"
        ├─ Security: RegexValidator.validate() → PASS
        └─ Transform: {type: "hostRegex", pattern: "^.*\\.internal$"}

Step 3: Security Report
  {
    totalPatterns: 12,
    safePatterns: 12,
    rejectedPatterns: 0,
    rejectedDetails: [],
    warnings: []
  }

Step 4: Import Complete
  ✓ 3 profiles imported
  ✓ 8 settings imported
  ✓ 0 security issues
```

### Modern Import
```typescript
User uploads: switchymalaccamax-export-2026.json

Step 1: Format Detection
  ✓ Found version: "2.0"
  ✓ Found profiles: [...] (array)
  ✓ Found settings: {...} (object)
  → Detected: MODERN format (confidence: 1.0)

Step 2: JSON Schema Validation
  ✓ Version format valid
  ✓ Profiles structure valid
  ✓ Settings structure valid

Step 3: Security Validation
  For each profile.config.rules:
    ✓ Validate condition patterns
    ✓ Check regex safety

Step 4: Import Complete
  ✓ Direct import (no transformation needed)
```

## Export Flow Example

### Export to Modern (Default)
```typescript
User: Settings → Export Configuration

Step 1: Get User Preference
  preferredExportFormat: "modern"

Step 2: Load Current Data
  profiles: 3 profiles from storage
  settings: Current settings object

Step 3: Generate Modern Export
  {
    version: "2.0",
    exportedAt: "2026-01-03T10:30:00.000Z",
    exportedBy: "SwitchyMalaccamax/2.0.0",
    profiles: [...],
    settings: {...}
  }

Step 4: Download
  Filename: switchymalaccamax-export-2026-01-03.json
```

### Export to Legacy (Compatibility Mode)
```typescript
User: Settings → Export Format → Legacy

Step 1: Get User Preference
  preferredExportFormat: "legacy"

Step 2: Load Current Data
  profiles: 3 modern profiles
  settings: Modern settings object

Step 3: Transform to Legacy
  For each profile:
    ├─ Create +name key
    ├─ Add profileType field
    ├─ Transform config → flat structure
    └─ Map bypassRules → bypassList

  For each setting:
    ├─ Flatten grouped structure
    ├─ Add - prefix to key
    └─ Convert camelCase names

Step 4: Download
  Filename: OmegaBackup_2026-01-03.bak
  Compatible with: ZeroOmega, SwitchyOmega
```

## Error Handling

### Security Validation Errors
```typescript
try {
  const result = await migrationService.import(data);
  
  if (result.securityReport.rejectedPatterns > 0) {
    // Show warning dialog
    showSecurityWarning({
      rejected: result.securityReport.rejectedDetails,
      message: "Some patterns were rejected for security reasons"
    });
  }
  
} catch (error) {
  if (error instanceof SecurityValidationError) {
    // Critical: All patterns failed
    showError("Import blocked: unsafe patterns detected");
  }
}
```

### Format Detection Errors
```typescript
try {
  const detection = migrationService.detectFormat(data);
  
  if (detection.format === ExportFormat.UNKNOWN) {
    showError("Unrecognized file format", {
      attempted: detection.reasons,
      suggestion: "Ensure file is valid ZeroOmega or SwitchyMalaccamax export"
    });
  }
  
} catch (error) {
  if (error instanceof FormatDetectionError) {
    showError("Cannot detect format", error.attempted);
  }
}
```

## Testing Strategy

### Unit Tests
- ✅ Format detection with various inputs
- ✅ Legacy → Modern transformation
- ✅ Modern → Legacy transformation
- ✅ Security validation integration
- ✅ Pattern rejection handling
- ✅ Settings mapping accuracy

### Integration Tests
- ✅ Import real ZeroOmega .bak files
- ✅ Export and re-import (round-trip)
- ✅ Cross-format compatibility
- ✅ Security report generation
- ✅ Storage service integration

### Security Tests
- ✅ ReDoS pattern rejection
- ✅ Poison-pill patterns
- ✅ Pattern complexity limits
- ✅ Safe alternative suggestions
