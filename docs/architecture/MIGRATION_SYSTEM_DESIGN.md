# Migration System Design - Complete Overview

## 📋 Design Deliverables

This design phase has produced comprehensive specifications for the Dual-Format Import/Export system:

### 1. Type Definitions
**File**: [src/core/migration.types.ts](../src/core/migration.types.ts)

**Contains**:
- `IMigrationService` interface with all import/export methods
- `ILegacyMapper` interface for format transformation
- `IStorageService` interface for Chrome storage
- `ModernExport` schema (v2.0 format)
- `MigrationResult` with detailed item tracking
- `SecurityReport` structure
- Error types (`ImportError`, `SecurityValidationError`, `FormatDetectionError`)

**Key Interfaces**:
```typescript
MigrationResult {
  totalItems: number;
  successCount: number;     // ✅ Perfect imports
  warningCount: number;     // ⚠️ Modified for compatibility
  errorCount: number;       // ❌ Blocked items
  successes: MigrationSuccess[];
  warnings: MigrationWarning[];
  errors: MigrationError[];
  startTime/endTime/duration
}
```

---

### 2. Format Comparison
**File**: [docs/format-comparison.md](../docs/format-comparison.md)

**Shows**:
- Side-by-side Legacy vs Modern format examples
- Key mapping rules (profile keys, condition types, settings)
- Security validation flow
- Rejected pattern examples

**Key Differences**:
| Legacy | Modern | Benefit |
|--------|--------|---------|
| `+ProfileName` | `profiles[].id` | No cryptic prefixes |
| `profileType: "FixedProfile"` | `type: "fixed"` | Cleaner enums |
| Flat structure | Organized groups | Human-readable |
| No metadata | version, exportedAt | Auditable |

---

### 3. Architecture
**File**: [docs/migration-architecture.md](../docs/migration-architecture.md)

**Describes**:
- Complete system flow diagram
- Component responsibilities
- Security validation layer
- Import/export flow examples
- Error handling patterns
- Testing strategy

**Core Flow**:
```
Upload File → Format Detection → Route to Mapper
  ↓
Legacy Mapper OR Modern Validator
  ↓
Security Validation (regexSafe.ts)
  ↓
Unified Modern Format
  ↓
Storage Service → Chrome Storage
```

---

### 4. API Specification
**File**: [docs/migration-api-spec.md](../docs/migration-api-spec.md)

**Provides**:
- Complete method signatures with examples
- Error handling patterns
- Vue component integration examples
- Security report structure
- Complete usage examples

**Key Methods**:
```typescript
// Auto-detect and import
import(data: unknown): Promise<ImportResult>

// Export with user preference
exportToModern(profiles, settings): ModernExport
exportToLegacy(profiles, settings): OmegaExport

// Storage
getPreferredExportFormat(): Promise<ExportFormat>
saveProfiles(profiles): Promise<void>
```

---

### 5. UI Design
**File**: [docs/migration-results-ui.md](../docs/migration-results-ui.md)

**Contains**:
- Complete Vue component implementation (700+ lines)
- Migration Results modal with 4 tabs:
  - ✅ Successes (items imported perfectly)
  - ⚠️ Warnings (items modified for compatibility)
  - ❌ Errors (items blocked)
  - 🛡️ Security (dedicated security report)
- Tailwind CSS styling
- Copy/Download report functionality
- Accessibility features

**Tabs**:
- **Successes**: Green cards showing perfect imports
- **Warnings**: Yellow cards with before/after diffs
- **Errors**: Red cards with suggestions and NOT IMPORTED warnings
- **Security**: Blue cards with shield icons and safe alternatives

---

### 6. Example Data
**File**: [docs/migration-result-examples.md](../docs/migration-result-examples.md)

**Shows**:
- 5 realistic scenarios with complete data structures
- Perfect import (all green)
- Import with compatibility warnings
- Import with security blocks (ReDoS)
- Critical failure (all patterns rejected)
- Mixed realistic case

**Builder Pattern**:
```typescript
const builder = new MigrationResultBuilder();
builder.addSuccess({ type: 'profile', name: 'Company', ... });
builder.addWarning({ type: 'condition', issue: '...', ... });
builder.addError({ type: 'pattern', reason: 'ReDoS', ... });
const result = builder.build(); // Auto-calculates duration
```

---

### 7. UI States
**File**: [docs/migration-ui-states.md](../docs/migration-ui-states.md)

**Visualizes**:
- ASCII art mockups of all UI states
- Color schemes for each state
- Responsive behavior (desktop/tablet/mobile)
- Interactive hover/focus states
- Loading animations
- Print styles
- Accessibility features

**States**:
1. ✅ All Success (green banner)
2. ⚠️ With Warnings (yellow banner, diff view)
3. ❌ With Errors (red banner, suggestions)
4. 🛡️ Security Tab (shield icons, pattern analysis)
5. ✓ Security All Clear (celebratory view)
6. 📊 Mixed State (multiple tabs with badges)

---

## 🎯 Design Highlights

### Modern Format (v2.0) Features
✅ **No cryptic prefixes** (eliminated + and -)  
✅ **CamelCase everywhere** (consistent naming)  
✅ **Metadata tracking** (version, exportedAt, exportedBy)  
✅ **Organized structure** (profiles array, grouped settings)  
✅ **Unique IDs** (stable profile identifiers)  
✅ **Type enums** (`ProfileType.FIXED`, `ConditionType.HOST_WILDCARD`)  
✅ **Human-readable** (self-documenting JSON)  

### Security Integration
🛡️ **ReDoS prevention** via `regexSafe.ts`  
🛡️ **Non-blocking** (user reviews and decides)  
🛡️ **Detailed reporting** (reason + suggestion for each rejected pattern)  
🛡️ **Safe alternatives** (automatic suggestions)  
🛡️ **Audit trail** (complete log of what was blocked)  

### Migration Tracking
📊 **Success tracking** (what imported perfectly)  
📊 **Warning tracking** (what was modified + before/after)  
📊 **Error tracking** (what was blocked + why)  
📊 **Timing data** (import duration)  
📊 **Source mapping** (legacy key → modern path)  

### User Experience
🎨 **Auto-detection** (no manual format selection)  
🎨 **Visual feedback** (color-coded cards with icons)  
🎨 **Actionable info** (suggestions for blocked items)  
🎨 **Export options** (text/JSON/CSV)  
🎨 **Accessibility** (keyboard nav, screen readers, high contrast)  

---

## 📐 Implementation Checklist

When implementing, create these files in order:

### Phase 1: Core Types ✅
- [x] `src/core/migration.types.ts` - Already created

### Phase 2: Utilities
- [ ] `src/core/migration/MigrationResultBuilder.ts` - Builder pattern
- [ ] `src/core/migration/formatDetector.ts` - Format detection logic

### Phase 3: Services
- [ ] `src/core/migration/MigrationService.ts` - Main orchestrator
- [ ] `src/core/migration/LegacyMapper.ts` - Legacy ↔ Modern transformation
- [ ] `src/core/storage/StorageService.ts` - Chrome storage wrapper

### Phase 4: Validation
- [ ] `src/core/migration/validators/ModernValidator.ts` - JSON schema validation
- [ ] `src/core/migration/validators/LegacyValidator.ts` - Legacy format validation
- [ ] `src/core/migration/validators/SecurityValidator.ts` - Integrate regexSafe.ts

### Phase 5: UI Components
- [ ] `src/components/MigrationResultsModal.vue` - Main modal
- [ ] `src/components/migration/SuccessTab.vue` - Success items
- [ ] `src/components/migration/WarningsTab.vue` - Warning items with diffs
- [ ] `src/components/migration/ErrorsTab.vue` - Blocked items
- [ ] `src/components/migration/SecurityTab.vue` - Security report

### Phase 6: Integration
- [ ] Update `src/options/OptionsApp.vue` - Add import button
- [ ] Add settings for export format preference
- [ ] Wire up Chrome storage events

### Phase 7: Testing
- [ ] `tests/core/migration/formatDetector.spec.ts`
- [ ] `tests/core/migration/LegacyMapper.spec.ts`
- [ ] `tests/core/migration/MigrationService.spec.ts`
- [ ] `tests/core/migration/SecurityValidator.spec.ts`
- [ ] `tests/integration/migration-flow.spec.ts` - End-to-end
- [ ] Test with real ZeroOmega exports
- [ ] Test with poison-pill patterns

---

## 🔒 Security Requirements

All implementations MUST:

1. **Validate every regex pattern** via `RegexValidator.compileSafe()`
2. **Reject catastrophic backtracking** patterns immediately
3. **Enforce complexity limits**:
   - Max pattern length: 256 characters
   - Max alternations: 20
   - Max quantifiers: 50
4. **Generate SecurityReport** for transparency
5. **Provide safe alternatives** when patterns rejected
6. **Never execute unsafe patterns** (fail-safe by default)
7. **Log all rejections** for audit trail

---

## 📊 Expected Outcomes

After implementation, users will:

✅ **Import ZeroOmega .bak files** seamlessly  
✅ **See detailed report** of what was imported/modified/blocked  
✅ **Review security issues** before accepting import  
✅ **Get safe alternatives** for rejected patterns  
✅ **Export to modern or legacy** format based on preference  
✅ **Share configs** with ZeroOmega users (legacy export)  
✅ **Maintain audit trail** of all imports  

---

## 🎨 Design Philosophy

1. **Transparency First**: User sees exactly what happened
2. **Security by Default**: Unsafe patterns blocked automatically
3. **User Control**: Review and decide on warnings
4. **Backward Compatibility**: Support legacy format forever
5. **Forward Progress**: Encourage modern format adoption
6. **Fail-Safe**: Better to reject than to execute unsafe code

---

## 📝 Next Steps

1. **Review this design** with user for approval
2. **Implement Phase 1-2** (utilities and builders)
3. **Implement Phase 3** (core services)
4. **Test with real exports** (ZeroOmegaExport_Company_Example.bak)
5. **Implement Phase 4** (validators with security integration)
6. **Test poison-pill patterns** (verify ReDoS protection)
7. **Implement Phase 5** (UI components)
8. **Integration testing** (end-to-end flow)
9. **User acceptance testing** (real-world scenarios)

---

## 📚 Documentation Index

- [migration.types.ts](../src/core/migration.types.ts) - Type definitions
- [format-comparison.md](format-comparison.md) - Legacy vs Modern
- [migration-architecture.md](migration-architecture.md) - System design
- [migration-api-spec.md](migration-api-spec.md) - API reference
- [migration-results-ui.md](migration-results-ui.md) - UI component
- [migration-result-examples.md](migration-result-examples.md) - Example data
- [migration-ui-states.md](migration-ui-states.md) - Visual states

All designs ready for implementation! 🚀
