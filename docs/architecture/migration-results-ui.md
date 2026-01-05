# Migration Results UI Design

This document shows the proposed UI for displaying migration results after importing a configuration file.

## Overview

The Migration Results modal appears after importing a `.bak` or `.json` file and shows:
- ✅ **Successes**: Items imported without issues
- ⚠️ **Warnings**: Items modified for compatibility
- ❌ **Errors**: Items blocked (especially regex patterns rejected by security)

## UI Mockup

### Full Modal Layout
```
┌─────────────────────────────────────────────────────────────────┐
│  Migration Results                                        [×]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Import completed in 0.45s                                │  │
│  │                                                            │  │
│  │  ✓ 8 items imported successfully                          │  │
│  │  ⚠ 2 items imported with modifications                    │  │
│  │  ✗ 1 item blocked (security)                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ [Successes (8)] [Warnings (2)] [Errors (1)] [Security]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ✓ Profile: Company                                       │  │
│  │    Source: +Company → profile-company-1a2b3c4d            │  │
│  │    Imported 1 proxy server, 5 bypass rules                │  │
│  │                                                            │  │
│  │  ✓ Profile: auto switch                                   │  │
│  │    Source: +auto switch → profile-auto-switch             │  │
│  │    Imported 10 rules with HostWildcardCondition           │  │
│  │                                                            │  │
│  │  ✓ Setting: Startup Profile                               │  │
│  │    Source: -startupProfileName → behavior.startupProfile  │  │
│  │    Value: "auto switch"                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [Copy Report]  [Download Log]              [Close]            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Tab Views

### 1. Successes Tab (Default)
Shows items imported without issues.

### 2. Warnings Tab
Shows items that were modified:
```
⚠ Condition Pattern Modified
  Profile: auto switch → Rule 3
  Issue: Legacy wildcard syntax detected
  Original: "**.company.com"
  Modified: "*.company.com"
  Reason: Double-wildcard not supported in modern format
```

### 3. Errors Tab (Critical)
Shows items that were completely blocked:
```
✗ Regex Pattern Blocked (Security)
  Profile: Company → Bypass Rule 3
  Pattern: "(a+)+"
  Reason: Catastrophic backtracking detected (ReDoS vulnerability)
  Suggestion: Use simpler pattern like "^a+$"
  
  This pattern was NOT imported for security reasons.
```

### 4. Security Tab
Dedicated view for all security-related issues.

---

## Vue Component Implementation

### MigrationResultsModal.vue

```vue
<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click.self="close"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">
            Migration Results
          </h2>
          <button
            @click="close"
            class="text-gray-400 hover:text-gray-600 transition"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Summary Banner -->
        <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div class="space-y-2">
            <p class="text-sm text-gray-600">
              Import completed in <strong>{{ result.migrationResult.duration }}ms</strong>
            </p>
            
            <div class="flex items-center gap-6 text-sm">
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600">
                  ✓
                </span>
                <span class="text-gray-700">
                  <strong>{{ result.migrationResult.successCount }}</strong> 
                  {{ pluralize('item', result.migrationResult.successCount) }} imported successfully
                </span>
              </div>
              
              <div v-if="result.migrationResult.warningCount > 0" class="flex items-center gap-2">
                <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-600">
                  ⚠
                </span>
                <span class="text-gray-700">
                  <strong>{{ result.migrationResult.warningCount }}</strong> 
                  {{ pluralize('item', result.migrationResult.warningCount) }} with modifications
                </span>
              </div>
              
              <div v-if="result.migrationResult.errorCount > 0" class="flex items-center gap-2">
                <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600">
                  ✗
                </span>
                <span class="text-gray-700">
                  <strong>{{ result.migrationResult.errorCount }}</strong> 
                  {{ pluralize('item', result.migrationResult.errorCount) }} blocked
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex border-b border-gray-200 px-6">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-4 py-3 text-sm font-medium transition border-b-2',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            ]"
          >
            {{ tab.label }}
            <span
              v-if="tab.count > 0"
              :class="[
                'ml-2 px-2 py-0.5 rounded-full text-xs',
                tab.color
              ]"
            >
              {{ tab.count }}
            </span>
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto px-6 py-4">
          <!-- Successes -->
          <div v-if="activeTab === 'successes'" class="space-y-3">
            <div
              v-for="(item, index) in result.migrationResult.successes"
              :key="index"
              class="p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <div class="flex items-start gap-3">
                <span class="flex-shrink-0 text-green-600 mt-0.5">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">
                    {{ formatType(item.type) }}: {{ item.name }}
                  </p>
                  <p class="text-xs text-gray-600 mt-1">
                    <code class="px-1 py-0.5 bg-white rounded text-green-700">{{ item.source }}</code>
                    →
                    <code class="px-1 py-0.5 bg-white rounded text-green-700">{{ item.destination }}</code>
                  </p>
                  <p v-if="item.details" class="text-xs text-gray-500 mt-1">
                    {{ item.details }}
                  </p>
                </div>
              </div>
            </div>
            
            <div v-if="result.migrationResult.successes.length === 0" class="text-center py-8 text-gray-500">
              No successful imports
            </div>
          </div>

          <!-- Warnings -->
          <div v-if="activeTab === 'warnings'" class="space-y-3">
            <div
              v-for="(item, index) in result.migrationResult.warnings"
              :key="index"
              :class="[
                'p-4 border rounded-lg',
                item.severity === 'high' ? 'bg-orange-50 border-orange-300' :
                item.severity === 'medium' ? 'bg-yellow-50 border-yellow-300' :
                'bg-yellow-50 border-yellow-200'
              ]"
            >
              <div class="flex items-start gap-3">
                <span class="flex-shrink-0 text-yellow-600 mt-0.5">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </span>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-medium text-gray-900">
                      {{ formatType(item.type) }}: {{ item.name }}
                    </p>
                    <span
                      :class="[
                        'px-2 py-0.5 text-xs rounded-full',
                        item.severity === 'high' ? 'bg-orange-200 text-orange-800' :
                        item.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-yellow-100 text-yellow-700'
                      ]"
                    >
                      {{ item.severity }}
                    </span>
                  </div>
                  
                  <p class="text-xs text-gray-600 mt-1">
                    Source: <code class="px-1 py-0.5 bg-white rounded">{{ item.source }}</code>
                  </p>
                  
                  <div class="mt-2 space-y-1">
                    <p class="text-sm text-gray-700">
                      <strong>Issue:</strong> {{ item.issue }}
                    </p>
                    <p class="text-sm text-gray-700">
                      <strong>Resolution:</strong> {{ item.resolution }}
                    </p>
                  </div>
                  
                  <div v-if="item.originalValue" class="mt-2 space-y-1">
                    <div class="flex items-start gap-2 text-xs">
                      <span class="text-red-600">-</span>
                      <code class="flex-1 px-2 py-1 bg-red-50 border border-red-200 rounded text-red-800">
                        {{ item.originalValue }}
                      </code>
                    </div>
                    <div class="flex items-start gap-2 text-xs">
                      <span class="text-green-600">+</span>
                      <code class="flex-1 px-2 py-1 bg-green-50 border border-green-200 rounded text-green-800">
                        {{ item.modifiedValue }}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="result.migrationResult.warnings.length === 0" class="text-center py-8 text-gray-500">
              No warnings
            </div>
          </div>

          <!-- Errors -->
          <div v-if="activeTab === 'errors'" class="space-y-3">
            <div
              v-for="(item, index) in result.migrationResult.errors"
              :key="index"
              class="p-4 bg-red-50 border border-red-300 rounded-lg"
            >
              <div class="flex items-start gap-3">
                <span class="flex-shrink-0 text-red-600 mt-0.5">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </span>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-medium text-gray-900">
                      {{ formatType(item.type) }}: {{ item.name }}
                    </p>
                    <span class="px-2 py-0.5 text-xs rounded-full bg-red-200 text-red-800">
                      {{ item.blockedBy }}
                    </span>
                  </div>
                  
                  <p class="text-xs text-gray-600 mt-1">
                    Source: <code class="px-1 py-0.5 bg-white rounded">{{ item.source }}</code>
                  </p>
                  
                  <div class="mt-2 space-y-1">
                    <p class="text-sm text-red-900">
                      <strong>Reason:</strong> {{ item.reason }}
                    </p>
                    <p v-if="item.details" class="text-sm text-gray-700">
                      {{ item.details }}
                    </p>
                  </div>
                  
                  <div v-if="item.suggestion" class="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p class="text-xs font-medium text-blue-900 mb-1">💡 Suggestion:</p>
                    <p class="text-xs text-blue-800">{{ item.suggestion }}</p>
                  </div>
                  
                  <div class="mt-3 p-2 bg-white border border-red-200 rounded">
                    <p class="text-xs font-semibold text-red-900">
                      ⚠️ This item was NOT imported
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="result.migrationResult.errors.length === 0" class="text-center py-8 text-gray-500">
              No errors
            </div>
          </div>

          <!-- Security -->
          <div v-if="activeTab === 'security'" class="space-y-4">
            <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 class="text-sm font-semibold text-blue-900 mb-2">Security Report</h3>
              <div class="space-y-1 text-sm text-gray-700">
                <p>Total patterns analyzed: <strong>{{ result.securityReport.totalPatterns }}</strong></p>
                <p>Safe patterns: <strong class="text-green-600">{{ result.securityReport.safePatterns }}</strong></p>
                <p>Rejected patterns: <strong class="text-red-600">{{ result.securityReport.rejectedPatterns }}</strong></p>
              </div>
            </div>
            
            <div v-if="result.securityReport.rejectedPatterns > 0" class="space-y-3">
              <h4 class="text-sm font-semibold text-gray-900">Rejected Patterns</h4>
              
              <div
                v-for="(rejected, index) in result.securityReport.rejectedDetails"
                :key="index"
                class="p-4 bg-red-50 border border-red-300 rounded-lg"
              >
                <div class="flex items-start gap-3">
                  <span class="flex-shrink-0 text-red-600 mt-0.5">🛡️</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900">
                      {{ rejected.location }}
                    </p>
                    
                    <div class="mt-2">
                      <p class="text-xs text-gray-600 mb-1">Pattern:</p>
                      <code class="block px-2 py-1 bg-white border border-red-300 rounded text-sm text-red-800 break-all">
                        {{ rejected.pattern }}
                      </code>
                    </div>
                    
                    <p class="mt-2 text-sm text-red-900">
                      <strong>Reason:</strong> {{ rejected.reason }}
                    </p>
                    
                    <div v-if="rejected.suggestion" class="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                      <p class="text-xs font-medium text-green-900 mb-1">✓ Safe Alternative:</p>
                      <code class="block px-2 py-1 bg-white border border-green-300 rounded text-xs text-green-800">
                        {{ rejected.suggestion }}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="result.securityReport.rejectedPatterns === 0" class="text-center py-8">
              <span class="text-4xl">🛡️</span>
              <p class="mt-2 text-sm font-medium text-green-600">All patterns passed security validation</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div class="flex gap-2">
            <button
              @click="copyReport"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition"
            >
              Copy Report
            </button>
            <button
              @click="downloadLog"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition"
            >
              Download Log
            </button>
          </div>
          
          <button
            @click="close"
            class="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ImportResult, MigrationError } from '@/core/migration.types';

interface Props {
  show: boolean;
  result: ImportResult;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

const activeTab = ref('successes');

const tabs = computed(() => [
  {
    id: 'successes',
    label: 'Successes',
    count: props.result.migrationResult.successCount,
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'warnings',
    label: 'Warnings',
    count: props.result.migrationResult.warningCount,
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    id: 'errors',
    label: 'Errors',
    count: props.result.migrationResult.errorCount,
    color: 'bg-red-100 text-red-800'
  },
  {
    id: 'security',
    label: 'Security',
    count: props.result.securityReport.rejectedPatterns,
    color: 'bg-blue-100 text-blue-800'
  }
]);

function formatType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function pluralize(word: string, count: number): string {
  return count === 1 ? word : `${word}s`;
}

function close() {
  emit('close');
}

function copyReport() {
  const report = generateTextReport();
  navigator.clipboard.writeText(report);
  alert('Report copied to clipboard');
}

function downloadLog() {
  const report = generateTextReport();
  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `migration-log-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function generateTextReport(): string {
  const r = props.result.migrationResult;
  let report = 'MIGRATION REPORT\n';
  report += '='.repeat(60) + '\n\n';
  report += `Start Time: ${r.startTime}\n`;
  report += `End Time: ${r.endTime}\n`;
  report += `Duration: ${r.duration}ms\n\n`;
  
  report += `SUMMARY\n`;
  report += '-'.repeat(60) + '\n';
  report += `Total Items: ${r.totalItems}\n`;
  report += `Successes: ${r.successCount}\n`;
  report += `Warnings: ${r.warningCount}\n`;
  report += `Errors: ${r.errorCount}\n\n`;
  
  if (r.successes.length > 0) {
    report += `SUCCESSES (${r.successCount})\n`;
    report += '-'.repeat(60) + '\n';
    r.successes.forEach(item => {
      report += `✓ ${item.type}: ${item.name}\n`;
      report += `  ${item.source} → ${item.destination}\n`;
      if (item.details) report += `  ${item.details}\n`;
      report += '\n';
    });
  }
  
  if (r.warnings.length > 0) {
    report += `WARNINGS (${r.warningCount})\n`;
    report += '-'.repeat(60) + '\n';
    r.warnings.forEach(item => {
      report += `⚠ ${item.type}: ${item.name} [${item.severity}]\n`;
      report += `  Source: ${item.source}\n`;
      report += `  Issue: ${item.issue}\n`;
      report += `  Resolution: ${item.resolution}\n`;
      if (item.originalValue) {
        report += `  Original: ${item.originalValue}\n`;
        report += `  Modified: ${item.modifiedValue}\n`;
      }
      report += '\n';
    });
  }
  
  if (r.errors.length > 0) {
    report += `ERRORS (${r.errorCount})\n`;
    report += '-'.repeat(60) + '\n';
    r.errors.forEach(item => {
      report += `✗ ${item.type}: ${item.name} [${item.blockedBy}]\n`;
      report += `  Source: ${item.source}\n`;
      report += `  Reason: ${item.reason}\n`;
      if (item.details) report += `  Details: ${item.details}\n`;
      if (item.suggestion) report += `  Suggestion: ${item.suggestion}\n`;
      report += '\n';
    });
  }
  
  if (props.result.securityReport.rejectedPatterns > 0) {
    report += `SECURITY REPORT\n`;
    report += '-'.repeat(60) + '\n';
    report += `Total Patterns: ${props.result.securityReport.totalPatterns}\n`;
    report += `Safe Patterns: ${props.result.securityReport.safePatterns}\n`;
    report += `Rejected Patterns: ${props.result.securityReport.rejectedPatterns}\n\n`;
    
    props.result.securityReport.rejectedDetails.forEach(rejected => {
      report += `🛡️ ${rejected.location}\n`;
      report += `  Pattern: ${rejected.pattern}\n`;
      report += `  Reason: ${rejected.reason}\n`;
      if (rejected.suggestion) report += `  Suggestion: ${rejected.suggestion}\n`;
      report += '\n';
    });
  }
  
  return report;
}
</script>
```

---

## Usage Example

```vue
<template>
  <div>
    <!-- Options page content -->
    
    <!-- Migration Results Modal -->
    <MigrationResultsModal
      :show="showMigrationResults"
      :result="importResult"
      @close="showMigrationResults = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MigrationResultsModal from '@/components/MigrationResultsModal.vue';
import { migrationService } from '@/core/migration/MigrationService';
import type { ImportResult } from '@/core/migration.types';

const showMigrationResults = ref(false);
const importResult = ref<ImportResult | null>(null);

async function handleImport(file: File) {
  try {
    const content = await file.text();
    const data = JSON.parse(content);
    
    // Import
    importResult.value = await migrationService.import(data);
    
    // Show results modal
    showMigrationResults.value = true;
    
    // Save if successful
    if (importResult.value.success) {
      await storageService.saveProfiles(importResult.value.profiles);
      await storageService.saveSettings(importResult.value.settings);
    }
    
  } catch (error) {
    alert('Import failed: ' + error.message);
  }
}
</script>
```

---

## Example Migration Result Data

### Successful Import (No Issues)
```typescript
{
  success: true,
  migrationResult: {
    totalItems: 8,
    successCount: 8,
    warningCount: 0,
    errorCount: 0,
    
    successes: [
      {
        type: 'profile',
        name: 'Company',
        source: '+Company',
        destination: 'profile-company-1a2b3c4d',
        details: 'Imported 1 proxy server, 5 bypass rules'
      },
      {
        type: 'profile',
        name: 'auto switch',
        source: '+auto switch',
        destination: 'profile-auto-switch',
        details: 'Imported 10 rules'
      }
      // ... more successes
    ],
    warnings: [],
    errors: [],
    
    startTime: '2026-01-03T10:30:00.000Z',
    endTime: '2026-01-03T10:30:00.450Z',
    duration: 450
  },
  securityReport: {
    totalPatterns: 12,
    safePatterns: 12,
    rejectedPatterns: 0,
    rejectedDetails: [],
    warnings: []
  }
}
```

### Import with Warnings
```typescript
{
  success: true,
  migrationResult: {
    totalItems: 10,
    successCount: 8,
    warningCount: 2,
    errorCount: 0,
    
    successes: [ /* ... */ ],
    
    warnings: [
      {
        type: 'condition',
        name: 'Host Wildcard Pattern',
        source: '+auto switch → Rule 3',
        issue: 'Double-wildcard syntax not supported',
        resolution: 'Converted to single wildcard',
        severity: 'medium',
        originalValue: '**.company.com',
        modifiedValue: '*.company.com'
      },
      {
        type: 'setting',
        name: 'Download Interval',
        source: '-downloadInterval',
        issue: 'Value out of range (5 minutes)',
        resolution: 'Set to minimum allowed (15 minutes)',
        severity: 'low',
        originalValue: '5',
        modifiedValue: '15'
      }
    ],
    
    errors: [],
    // ...
  }
}
```

### Import with Security Blocks
```typescript
{
  success: true,
  migrationResult: {
    totalItems: 12,
    successCount: 10,
    warningCount: 1,
    errorCount: 1,
    
    successes: [ /* ... */ ],
    warnings: [ /* ... */ ],
    
    errors: [
      {
        type: 'pattern',
        name: 'Regex Pattern',
        source: 'Company → Bypass Rule 3',
        reason: 'Catastrophic backtracking detected (ReDoS vulnerability)',
        details: 'Pattern: "(a+)+"',
        blockedBy: 'security',
        suggestion: 'Use simpler pattern like "^a+$"'
      }
    ],
    // ...
  },
  securityReport: {
    totalPatterns: 15,
    safePatterns: 14,
    rejectedPatterns: 1,
    rejectedDetails: [
      {
        type: 'regex',
        pattern: '(a+)+',
        reason: 'Catastrophic backtracking detected',
        location: 'Company → Bypass Rule 3',
        suggestion: 'Use simpler pattern like "^a+$"'
      }
    ],
    warnings: [
      '1 pattern rejected for security reasons'
    ]
  }
}
```

---

## Visual States

### 1. All Success (Green)
- Green banner with checkmark
- Only Successes tab has badge
- User can immediately close

### 2. With Warnings (Yellow)
- Yellow banner with warning icon
- Warnings tab highlighted with badge
- User should review but can proceed

### 3. With Errors (Red)
- Red banner with X icon
- Errors tab highlighted with badge
- User MUST review blocked items

### 4. Security Focus
- Security tab has special shield icon 🛡️
- Shows ReDoS-blocked patterns prominently
- Provides safe alternatives

---

## Responsive Behavior

- **Desktop**: Full width modal (max-w-4xl)
- **Tablet**: Slightly narrower, same layout
- **Mobile**: Full screen modal, tabs stack vertically

## Accessibility

- ✓ Keyboard navigation (Tab, Enter, Escape)
- ✓ ARIA labels on all interactive elements
- ✓ Focus management (trap focus in modal)
- ✓ Screen reader announcements for status
- ✓ Color + icon for color-blind users

## Future Enhancements

- [ ] Export report as PDF
- [ ] Email report option
- [ ] "Fix errors automatically" button
- [ ] Inline pattern editor for rejected patterns
- [ ] Compare before/after for warnings
