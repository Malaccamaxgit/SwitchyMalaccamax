# Migration Service API Specification

This document provides the complete API specification for using the migration services.

## Quick Start

```typescript
import { MigrationService } from '@/core/migration/MigrationService';
import { StorageService } from '@/core/storage/StorageService';

// Initialize services
const migrationService = new MigrationService();
const storageService = new StorageService();

// Import from uploaded file
async function handleImport(fileContent: string) {
  try {
    // Auto-detect format and import
    const result = await migrationService.import(JSON.parse(fileContent));
    
    if (!result.success) {
      console.error('Import failed:', result.errors);
      return;
    }
    
    // Check security warnings
    if (result.securityReport.rejectedPatterns > 0) {
      console.warn('Rejected patterns:', result.securityReport.rejectedDetails);
    }
    
    // Save to storage
    await storageService.saveProfiles(result.profiles);
    await storageService.saveSettings(result.settings);
    
    console.log('Import successful!');
    
  } catch (error) {
    console.error('Import error:', error);
  }
}

// Export with user's preferred format
async function handleExport() {
  try {
    // Get current data
    const profiles = await storageService.getProfiles();
    const settings = await storageService.getSettings();
    const format = await storageService.getPreferredExportFormat();
    
    // Export
    let exportData;
    if (format === ExportFormat.MODERN) {
      exportData = migrationService.exportToModern(profiles, settings);
    } else {
      exportData = migrationService.exportToLegacy(profiles, settings);
    }
    
    // Download
    downloadFile(
      JSON.stringify(exportData, null, 2),
      `export-${Date.now()}.json`
    );
    
  } catch (error) {
    console.error('Export error:', error);
  }
}
```

## MigrationService API

### Constructor
```typescript
class MigrationService implements IMigrationService {
  constructor(
    private legacyMapper: ILegacyMapper = new LegacyMapper(),
    private validator: IValidator = new Validator()
  )
}
```

---

### `detectFormat(data: unknown): FormatDetectionResult`

**Purpose**: Detect if uploaded file is Legacy or Modern format

**Parameters**:
- `data` - Parsed JSON object from uploaded file

**Returns**: `FormatDetectionResult`
```typescript
{
  format: ExportFormat.LEGACY | ExportFormat.MODERN | ExportFormat.UNKNOWN,
  version: "2" | "2.0" | undefined,
  confidence: 0.0 - 1.0,
  reasons: string[],
  warnings?: string[]
}
```

**Example**:
```typescript
const data = JSON.parse(fileContent);
const detection = migrationService.detectFormat(data);

if (detection.format === ExportFormat.UNKNOWN) {
  alert('Unrecognized format. Confidence: ' + detection.confidence);
  console.log('Detection reasons:', detection.reasons);
}
```

**Detection Logic**:
```typescript
// Legacy indicators (high confidence)
+ Has schemaVersion field
+ Has keys starting with +
+ Has keys starting with -
+ Missing version field

// Modern indicators (high confidence)
+ Has version field (e.g., "2.0")
+ Has profiles array
+ Has settings object
+ Missing schemaVersion field

// Unknown
- None of the above patterns match
```

---

### `import(data: unknown): Promise<ImportResult>`

**Purpose**: Auto-detect format and import configuration

**Parameters**:
- `data` - Parsed JSON object from uploaded file

**Returns**: `Promise<ImportResult>`
```typescript
{
  success: boolean,
  profiles: ModernProfile[],
  settings: ModernSettings,
  warnings: ValidationWarning[],
  errors: ValidationError[],
  securityReport: SecurityReport
}
```

**Throws**:
- `ImportError` - Invalid file format or structure
- `SecurityValidationError` - All patterns failed security check (critical)
- `FormatDetectionError` - Cannot determine file format

**Example**:
```typescript
try {
  const result = await migrationService.import(data);
  
  if (result.success) {
    // Check warnings
    if (result.warnings.length > 0) {
      console.warn('Import warnings:', result.warnings);
    }
    
    // Check security issues
    if (result.securityReport.rejectedPatterns > 0) {
      showSecurityDialog({
        rejected: result.securityReport.rejectedDetails,
        safe: result.securityReport.safePatterns,
        total: result.securityReport.totalPatterns
      });
    }
    
    // Save
    await storageService.saveProfiles(result.profiles);
    await storageService.saveSettings(result.settings);
  }
  
} catch (error) {
  if (error instanceof SecurityValidationError) {
    alert('Import blocked: All patterns failed security validation');
  } else if (error instanceof FormatDetectionError) {
    alert('Cannot detect format: ' + error.message);
  } else {
    alert('Import failed: ' + error.message);
  }
}
```

---

### `importLegacy(data: OmegaExport): Promise<ImportResult>`

**Purpose**: Import from Legacy ZeroOmega format (explicit)

**Parameters**:
- `data` - Legacy format export (validated against OmegaExport type)

**Returns**: `Promise<ImportResult>`

**Example**:
```typescript
// When you KNOW it's legacy format
const legacyData = JSON.parse(fileContent) as OmegaExport;
const result = await migrationService.importLegacy(legacyData);
```

---

### `importModern(data: ModernExport): Promise<ImportResult>`

**Purpose**: Import from Modern SwitchyMalaccamax format (explicit)

**Parameters**:
- `data` - Modern format export (validated against ModernExport type)

**Returns**: `Promise<ImportResult>`

**Example**:
```typescript
// When you KNOW it's modern format
const modernData = JSON.parse(fileContent) as ModernExport;
const result = await migrationService.importModern(modernData);
```

---

### `exportToLegacy(profiles: ModernProfile[], settings: ModernSettings): OmegaExport`

**Purpose**: Export to Legacy ZeroOmega format (for compatibility)

**Parameters**:
- `profiles` - Array of modern profiles
- `settings` - Modern settings object

**Returns**: `OmegaExport` (legacy format object)

**Example**:
```typescript
const profiles = await storageService.getProfiles();
const settings = await storageService.getSettings();

const legacyExport = migrationService.exportToLegacy(profiles, settings);

// Download as .bak file
downloadFile(
  JSON.stringify(legacyExport, null, 2),
  `OmegaBackup_${new Date().toISOString().slice(0, 10)}.bak`
);
```

**Use Cases**:
- User wants to share config with ZeroOmega users
- Backup compatibility with older tools
- Testing backward compatibility

---

### `exportToModern(profiles: ModernProfile[], settings: ModernSettings): ModernExport`

**Purpose**: Export to Modern SwitchyMalaccamax format

**Parameters**:
- `profiles` - Array of modern profiles
- `settings` - Modern settings object

**Returns**: `ModernExport` (modern format object with metadata)

**Example**:
```typescript
const profiles = await storageService.getProfiles();
const settings = await storageService.getSettings();

const modernExport = migrationService.exportToModern(profiles, settings);

// Download as .json file
downloadFile(
  JSON.stringify(modernExport, null, 2),
  `switchymalaccamax-export-${new Date().toISOString().slice(0, 10)}.json`
);
```

**Metadata Added**:
```typescript
{
  version: "2.0",
  exportedAt: "2026-01-03T10:30:00.000Z",
  exportedBy: "SwitchyMalaccamax/2.0.0",
  // ... profiles and settings
}
```

---

## StorageService API

### `getPreferredExportFormat(): Promise<ExportFormat>`

**Purpose**: Get user's export format preference

**Returns**: `Promise<ExportFormat>` (default: `ExportFormat.MODERN`)

**Example**:
```typescript
const format = await storageService.getPreferredExportFormat();
console.log('User prefers:', format); // "modern" or "legacy"
```

---

### `setPreferredExportFormat(format: ExportFormat): Promise<void>`

**Purpose**: Set user's export format preference

**Parameters**:
- `format` - User's preferred format

**Example**:
```typescript
// User changed setting in options page
await storageService.setPreferredExportFormat(ExportFormat.LEGACY);
```

---

### `getProfiles(): Promise<ModernProfile[]>`

**Purpose**: Get all profiles from storage

**Returns**: `Promise<ModernProfile[]>`

**Example**:
```typescript
const profiles = await storageService.getProfiles();
console.log('Loaded profiles:', profiles.length);
```

---

### `saveProfiles(profiles: ModernProfile[]): Promise<void>`

**Purpose**: Save all profiles to storage

**Parameters**:
- `profiles` - Array of profiles to save

**Throws**: `ValidationError` if profiles invalid

**Example**:
```typescript
// After import
await storageService.saveProfiles(importResult.profiles);

// After user creates new profile
const newProfile: ModernProfile = {
  id: generateId(),
  name: "Office VPN",
  type: ProfileType.FIXED,
  config: { /* ... */ }
};

const profiles = await storageService.getProfiles();
profiles.push(newProfile);
await storageService.saveProfiles(profiles);
```

---

### `getSettings(): Promise<ModernSettings>`

**Purpose**: Get application settings

**Returns**: `Promise<ModernSettings>`

**Example**:
```typescript
const settings = await storageService.getSettings();
console.log('Startup profile:', settings.behavior.startupProfile);
```

---

### `saveSettings(settings: ModernSettings): Promise<void>`

**Purpose**: Save application settings

**Parameters**:
- `settings` - Settings object to save

**Example**:
```typescript
const settings = await storageService.getSettings();
settings.behavior.startupProfile = "profile-office-vpn";
await storageService.saveSettings(settings);
```

---

### `getActiveProfile(): Promise<string>`

**Purpose**: Get ID of currently active profile

**Returns**: `Promise<string>` - Profile ID

**Example**:
```typescript
const activeId = await storageService.getActiveProfile();
const profiles = await storageService.getProfiles();
const active = profiles.find(p => p.id === activeId);
console.log('Active profile:', active?.name);
```

---

### `setActiveProfile(profileId: string): Promise<void>`

**Purpose**: Set currently active profile

**Parameters**:
- `profileId` - ID of profile to activate

**Example**:
```typescript
// User clicked "Switch to Company" in popup
await storageService.setActiveProfile("profile-company-1a2b3c4d");

// Also need to apply proxy settings
await applyProxySettings(profile);
```

---

## Security Report Structure

### `SecurityReport`
```typescript
interface SecurityReport {
  totalPatterns: number;        // Total patterns checked
  safePatterns: number;          // Passed validation
  rejectedPatterns: number;      // Failed validation
  rejectedDetails: RejectedPattern[];
  warnings: string[];            // General warnings
}
```

### `RejectedPattern`
```typescript
interface RejectedPattern {
  type: 'regex' | 'wildcard';
  pattern: string;               // Original pattern
  reason: string;                // Why rejected
  location: string;              // Profile → Rule location
  suggestion?: string;           // Safe alternative
}
```

**Example Report**:
```typescript
{
  totalPatterns: 15,
  safePatterns: 13,
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
    "2 patterns rejected for security",
    "Review patterns before importing"
  ]
}
```

---

## Error Types

### `ImportError`
```typescript
class ImportError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  )
}
```

**Error Codes**:
- `INVALID_FORMAT` - JSON structure invalid
- `MISSING_REQUIRED_FIELD` - Required field missing
- `INVALID_PROFILE_TYPE` - Unknown profile type
- `INVALID_CONDITION_TYPE` - Unknown condition type

**Example**:
```typescript
try {
  await migrationService.import(data);
} catch (error) {
  if (error instanceof ImportError) {
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('Details:', error.details);
  }
}
```

---

### `SecurityValidationError`
```typescript
class SecurityValidationError extends ImportError {
  constructor(
    message: string,
    public rejectedPatterns: RejectedPattern[]
  )
}
```

**Thrown When**: All patterns in import fail security validation (critical)

**Example**:
```typescript
try {
  await migrationService.import(data);
} catch (error) {
  if (error instanceof SecurityValidationError) {
    alert('Import blocked: All patterns are unsafe');
    console.log('Rejected:', error.rejectedPatterns);
  }
}
```

---

### `FormatDetectionError`
```typescript
class FormatDetectionError extends ImportError {
  constructor(
    message: string,
    public attempted: string[]
  )
}
```

**Thrown When**: Cannot determine file format

**Example**:
```typescript
try {
  await migrationService.import(data);
} catch (error) {
  if (error instanceof FormatDetectionError) {
    alert('Cannot detect format');
    console.log('Tried:', error.attempted);
  }
}
```

---

## Complete Usage Example

### Import with Full Error Handling
```typescript
async function importConfiguration(file: File) {
  try {
    // Read file
    const content = await file.text();
    const data = JSON.parse(content);
    
    // Detect format first (optional - import() auto-detects)
    const detection = migrationService.detectFormat(data);
    console.log('Detected format:', detection.format);
    console.log('Confidence:', detection.confidence);
    
    if (detection.confidence < 0.8) {
      const confirm = window.confirm(
        'Format detection uncertain. Continue anyway?'
      );
      if (!confirm) return;
    }
    
    // Import
    const result = await migrationService.import(data);
    
    // Check success
    if (!result.success) {
      showErrors(result.errors);
      return;
    }
    
    // Show warnings
    if (result.warnings.length > 0) {
      showWarnings(result.warnings);
    }
    
    // Check security
    const report = result.securityReport;
    if (report.rejectedPatterns > 0) {
      const message = `
        Security Warning:
        • Total patterns: ${report.totalPatterns}
        • Safe patterns: ${report.safePatterns}
        • Rejected: ${report.rejectedPatterns}
        
        Rejected patterns will not be imported.
        Continue?
      `;
      
      const confirm = window.confirm(message);
      if (!confirm) return;
      
      // Show details
      console.table(report.rejectedDetails);
    }
    
    // Save to storage
    await storageService.saveProfiles(result.profiles);
    await storageService.saveSettings(result.settings);
    
    // Success
    showSuccess(`
      Imported ${result.profiles.length} profiles
      ${report.rejectedPatterns > 0 
        ? `(${report.rejectedPatterns} patterns rejected)`
        : ''}
    `);
    
  } catch (error) {
    if (error instanceof SecurityValidationError) {
      showError('All patterns failed security check', 
                error.rejectedPatterns);
    } else if (error instanceof FormatDetectionError) {
      showError('Cannot detect format', error.attempted);
    } else if (error instanceof ImportError) {
      showError(`Import error: ${error.message}`, error.details);
    } else {
      showError('Unexpected error', error);
    }
  }
}
```

### Export with User Preference
```typescript
async function exportConfiguration() {
  try {
    // Get data
    const profiles = await storageService.getProfiles();
    const settings = await storageService.getSettings();
    const format = await storageService.getPreferredExportFormat();
    
    // Check if any profiles exist
    if (profiles.length === 0) {
      alert('No profiles to export');
      return;
    }
    
    // Export based on preference
    let exportData;
    let filename;
    
    if (format === ExportFormat.MODERN) {
      exportData = migrationService.exportToModern(profiles, settings);
      filename = `switchymalaccamax-${timestamp()}.json`;
    } else {
      exportData = migrationService.exportToLegacy(profiles, settings);
      filename = `OmegaBackup_${timestamp()}.bak`;
    }
    
    // Download
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
    
    showSuccess(`Exported ${profiles.length} profiles`);
    
  } catch (error) {
    showError('Export failed', error);
  }
}

function timestamp(): string {
  return new Date().toISOString().slice(0, 10);
}
```

---

## UI Integration

### Settings Page - Export Format Selector
```vue
<template>
  <div class="setting-group">
    <label>Export Format</label>
    <select v-model="exportFormat" @change="saveFormat">
      <option value="modern">Modern (SwitchyMalaccamax)</option>
      <option value="legacy">Legacy (ZeroOmega Compatible)</option>
    </select>
    <p class="hint">
      Choose "Legacy" to share with ZeroOmega users
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storageService } from '@/core/storage/StorageService';
import { ExportFormat } from '@/core/migration.types';

const exportFormat = ref<ExportFormat>(ExportFormat.MODERN);

onMounted(async () => {
  exportFormat.value = await storageService.getPreferredExportFormat();
});

async function saveFormat() {
  await storageService.setPreferredExportFormat(exportFormat.value);
}
</script>
```

### Options Page - Import Button
```vue
<template>
  <div class="import-section">
    <input
      ref="fileInput"
      type="file"
      accept=".json,.bak"
      @change="handleFileUpload"
      style="display: none"
    />
    
    <button @click="selectFile">
      Import Configuration
    </button>
    
    <div v-if="importing" class="loading">
      Importing...
    </div>
    
    <div v-if="securityWarning" class="warning">
      <h3>Security Warning</h3>
      <p>{{ securityWarning.message }}</p>
      <ul>
        <li v-for="pattern in securityWarning.patterns" :key="pattern.pattern">
          <code>{{ pattern.pattern }}</code>
          <span>{{ pattern.reason }}</span>
        </li>
      </ul>
      <button @click="confirmImport">Continue Import</button>
      <button @click="cancelImport">Cancel</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { migrationService } from '@/core/migration/MigrationService';
import { storageService } from '@/core/storage/StorageService';

const fileInput = ref<HTMLInputElement>();
const importing = ref(false);
const securityWarning = ref(null);
let pendingImport = null;

function selectFile() {
  fileInput.value?.click();
}

async function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  
  importing.value = true;
  
  try {
    const content = await file.text();
    const data = JSON.parse(content);
    
    const result = await migrationService.import(data);
    
    if (result.securityReport.rejectedPatterns > 0) {
      // Show warning, let user decide
      securityWarning.value = {
        message: `${result.securityReport.rejectedPatterns} patterns rejected`,
        patterns: result.securityReport.rejectedDetails
      };
      pendingImport = result;
      return;
    }
    
    // No security issues, save immediately
    await saveImport(result);
    
  } catch (error) {
    alert('Import failed: ' + error.message);
  } finally {
    importing.value = false;
  }
}

async function confirmImport() {
  if (pendingImport) {
    await saveImport(pendingImport);
    securityWarning.value = null;
    pendingImport = null;
  }
}

function cancelImport() {
  securityWarning.value = null;
  pendingImport = null;
}

async function saveImport(result) {
  await storageService.saveProfiles(result.profiles);
  await storageService.saveSettings(result.settings);
  alert(`Imported ${result.profiles.length} profiles`);
}
</script>
```
