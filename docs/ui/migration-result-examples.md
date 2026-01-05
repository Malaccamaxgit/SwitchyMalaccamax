# Migration Result Examples

This document shows concrete examples of `MigrationResult` data structures for different scenarios.

## Scenario 1: Perfect Import (All Green)

**Context**: User imports clean ZeroOmega export with no issues

```typescript
const result: ImportResult = {
  success: true,
  
  profiles: [
    // 3 modern profiles...
  ],
  
  settings: {
    // Modern settings...
  },
  
  warnings: [],
  errors: [],
  
  securityReport: {
    totalPatterns: 12,
    safePatterns: 12,
    rejectedPatterns: 0,
    rejectedDetails: [],
    warnings: []
  },
  
  migrationResult: {
    totalItems: 15,
    successCount: 15,
    warningCount: 0,
    errorCount: 0,
    
    successes: [
      {
        type: 'profile',
        name: 'Company',
        source: '+Company',
        destination: 'profile-company-1a2b3c4d',
        details: 'Imported FixedProfile with 1 proxy server and 5 bypass rules'
      },
      {
        type: 'profile',
        name: 'auto switch',
        source: '+auto switch',
        destination: 'profile-auto-switch',
        details: 'Imported SwitchProfile with 10 rules'
      },
      {
        type: 'profile',
        name: 'direct',
        source: '+direct',
        destination: 'direct',
        details: 'Imported DirectProfile (builtin)'
      },
      {
        type: 'condition',
        name: 'Bypass localhost',
        source: '+Company → bypassList[0]',
        destination: 'profile-company → bypassRules[0]',
        details: 'Pattern: 127.0.0.1'
      },
      {
        type: 'condition',
        name: 'Bypass IPv6 localhost',
        source: '+Company → bypassList[1]',
        destination: 'profile-company → bypassRules[1]',
        details: 'Pattern: [::1]'
      },
      {
        type: 'rule',
        name: 'Company domain wildcard',
        source: '+auto switch → rules[0]',
        destination: 'profile-auto-switch → rules[0]',
        details: 'HostWildcardCondition: *.company.com → Company'
      },
      {
        type: 'rule',
        name: 'Internal domain regex',
        source: '+auto switch → rules[1]',
        destination: 'profile-auto-switch → rules[1]',
        details: 'HostRegexCondition: ^.*\\.internal$ → Company'
      },
      {
        type: 'setting',
        name: 'Startup Profile',
        source: '-startupProfileName',
        destination: 'settings.behavior.startupProfile',
        details: 'Value: "auto switch"'
      },
      {
        type: 'setting',
        name: 'Confirm Deletion',
        source: '-confirmDeletion',
        destination: 'settings.ui.confirmDeletion',
        details: 'Value: true'
      },
      {
        type: 'setting',
        name: 'Add Conditions to Bottom',
        source: '-addConditionsToBottom',
        destination: 'settings.ui.addConditionsToBottom',
        details: 'Value: false'
      },
      {
        type: 'setting',
        name: 'Refresh on Profile Change',
        source: '-refreshOnProfileChange',
        destination: 'settings.behavior.refreshOnProfileChange',
        details: 'Value: true'
      },
      {
        type: 'setting',
        name: 'Quick Switch Profiles',
        source: '-quickSwitchProfiles',
        destination: 'settings.behavior.quickSwitchProfiles',
        details: 'Value: ["direct", "Company", "auto switch"]'
      },
      {
        type: 'setting',
        name: 'Show External Profile',
        source: '-showExternalProfile',
        destination: 'settings.ui.showExternalProfile',
        details: 'Value: true'
      },
      {
        type: 'setting',
        name: 'Show Inspect Menu',
        source: '-showInspectMenu',
        destination: 'settings.ui.showInspectMenu',
        details: 'Value: true'
      },
      {
        type: 'setting',
        name: 'Revert Proxy Changes',
        source: '-revertProxyChanges',
        destination: 'settings.behavior.revertProxyChanges',
        details: 'Value: false'
      }
    ],
    
    warnings: [],
    errors: [],
    
    startTime: '2026-01-03T10:30:00.000Z',
    endTime: '2026-01-03T10:30:00.450Z',
    duration: 450
  }
};
```

**UI Display**:
```
✓ 15 items imported successfully
No warnings or errors
```

---

## Scenario 2: Import with Compatibility Warnings

**Context**: User imports export with deprecated patterns that need modification

```typescript
const result: ImportResult = {
  success: true,
  
  migrationResult: {
    totalItems: 12,
    successCount: 10,
    warningCount: 2,
    errorCount: 0,
    
    successes: [
      // ... 10 successful items
    ],
    
    warnings: [
      {
        type: 'condition',
        name: 'Wildcard Pattern',
        source: '+auto switch → rules[3]',
        issue: 'Double-wildcard prefix not supported in modern format',
        resolution: 'Converted ** to * (excludes exact match)',
        severity: 'medium',
        originalValue: '**.company.com',
        modifiedValue: '*.company.com'
      },
      {
        type: 'setting',
        name: 'Download Interval',
        source: '-downloadInterval',
        issue: 'Value below minimum threshold (was 5 minutes)',
        resolution: 'Increased to minimum allowed value (15 minutes)',
        severity: 'low',
        originalValue: '5',
        modifiedValue: '15'
      }
    ],
    
    errors: [],
    
    startTime: '2026-01-03T10:31:00.000Z',
    endTime: '2026-01-03T10:31:00.680Z',
    duration: 680
  },
  
  securityReport: {
    totalPatterns: 15,
    safePatterns: 15,
    rejectedPatterns: 0,
    rejectedDetails: [],
    warnings: [
      'Some patterns were modified for compatibility'
    ]
  }
};
```

**UI Display**:
```
✓ 10 items imported successfully
⚠ 2 items imported with modifications

Warnings:
  ⚠ Wildcard Pattern (medium)
     Issue: Double-wildcard prefix not supported
     Original: **.company.com
     Modified: *.company.com
  
  ⚠ Download Interval (low)
     Issue: Value below minimum (5 minutes)
     Modified: Set to 15 minutes
```

---

## Scenario 3: Import with Security Blocks (ReDoS)

**Context**: User imports export with dangerous regex patterns

```typescript
const result: ImportResult = {
  success: true, // Partial success
  
  migrationResult: {
    totalItems: 13,
    successCount: 10,
    warningCount: 0,
    errorCount: 3,
    
    successes: [
      // ... 10 successful items
    ],
    
    warnings: [],
    
    errors: [
      {
        type: 'pattern',
        name: 'Regex Pattern',
        source: 'Company → Bypass Rule 3',
        reason: 'Catastrophic backtracking detected (ReDoS vulnerability)',
        details: 'Pattern: "(a+)+" - This pattern can cause exponential time complexity',
        blockedBy: 'security',
        suggestion: 'Use simpler pattern like "^a+$" or "[a]+"'
      },
      {
        type: 'pattern',
        name: 'Regex Pattern',
        source: 'auto switch → Rule 7',
        reason: 'Exceeds maximum quantifiers limit (50)',
        details: 'Pattern: "(.+)*\\.com" - Contains nested quantifiers',
        blockedBy: 'security',
        suggestion: 'Use "^[^.]+\\.com$" instead'
      },
      {
        type: 'pattern',
        name: 'Regex Pattern',
        source: 'auto switch → Rule 9',
        reason: 'Pattern too complex - exceeds complexity threshold',
        details: 'Pattern: "(x+x+)+y" - Catastrophic backtracking possible',
        blockedBy: 'security',
        suggestion: 'Simplify pattern or use wildcard matching'
      }
    ],
    
    startTime: '2026-01-03T10:32:00.000Z',
    endTime: '2026-01-03T10:32:01.200Z',
    duration: 1200
  },
  
  securityReport: {
    totalPatterns: 18,
    safePatterns: 15,
    rejectedPatterns: 3,
    rejectedDetails: [
      {
        type: 'regex',
        pattern: '(a+)+',
        reason: 'Catastrophic backtracking detected',
        location: 'Company → Bypass Rule 3',
        suggestion: 'Use simpler pattern like "^a+$"'
      },
      {
        type: 'regex',
        pattern: '(.+)*\\.com',
        reason: 'Exceeds max quantifiers (50)',
        location: 'auto switch → Rule 7',
        suggestion: 'Use "^[^.]+\\.com$"'
      },
      {
        type: 'regex',
        pattern: '(x+x+)+y',
        reason: 'Catastrophic backtracking detected',
        location: 'auto switch → Rule 9',
        suggestion: 'Simplify pattern'
      }
    ],
    warnings: [
      '3 patterns rejected for security reasons',
      'Blocked patterns will not be imported'
    ]
  }
};
```

**UI Display**:
```
✓ 10 items imported successfully
✗ 3 items blocked (security)

Security Report:
  Total patterns: 18
  Safe patterns: 15
  Rejected: 3

Errors:
  ✗ Regex Pattern [security]
     Location: Company → Bypass Rule 3
     Pattern: (a+)+
     Reason: Catastrophic backtracking detected
     💡 Suggestion: Use "^a+$"
     ⚠️ This pattern was NOT imported
  
  ✗ Regex Pattern [security]
     Location: auto switch → Rule 7
     Pattern: (.+)*\.com
     Reason: Exceeds max quantifiers (50)
     💡 Suggestion: Use "^[^.]+\.com$"
     ⚠️ This pattern was NOT imported
```

---

## Scenario 4: Critical Failure (All Patterns Rejected)

**Context**: User imports malicious export designed to attack browser

```typescript
// This would throw SecurityValidationError instead of returning result
throw new SecurityValidationError(
  'All patterns failed security validation',
  [
    {
      type: 'regex',
      pattern: '(a+)+',
      reason: 'Catastrophic backtracking',
      location: 'Profile 1 → Rule 1',
      suggestion: 'Use "^a+$"'
    },
    {
      type: 'regex',
      pattern: '(x+x+)+y',
      reason: 'Catastrophic backtracking',
      location: 'Profile 1 → Rule 2',
      suggestion: 'Simplify pattern'
    },
    {
      type: 'regex',
      pattern: '(.*)*',
      reason: 'Catastrophic backtracking',
      location: 'Profile 2 → Rule 1',
      suggestion: 'Use ".+" instead'
    }
  ]
);
```

**UI Display**:
```
❌ Import Blocked

All patterns failed security validation.
This file may be malicious.

Rejected patterns: 3
- (a+)+
- (x+x+)+y
- (.*)*

Import was completely blocked for your protection.
```

---

## Scenario 5: Mixed Issues (Realistic)

**Context**: Real-world import with various issues

```typescript
const result: ImportResult = {
  success: true,
  
  migrationResult: {
    totalItems: 25,
    successCount: 20,
    warningCount: 3,
    errorCount: 2,
    
    successes: [
      // ... 20 successful imports
      {
        type: 'profile',
        name: 'Office VPN',
        source: '+Office VPN',
        destination: 'profile-office-vpn-5e8f2a',
        details: 'Imported FixedProfile with SOCKS5 proxy'
      },
      // ... more
    ],
    
    warnings: [
      {
        type: 'condition',
        name: 'Wildcard Pattern',
        source: '+auto switch → rules[2]',
        issue: 'Leading dot syntax deprecated',
        resolution: 'Converted ".company.com" to "*.company.com"',
        severity: 'low',
        originalValue: '.company.com',
        modifiedValue: '*.company.com'
      },
      {
        type: 'setting',
        name: 'Custom CSS',
        source: '-customCss',
        issue: 'Contains potentially unsafe CSS',
        resolution: 'Sanitized CSS content',
        severity: 'medium',
        originalValue: 'body { background: url(javascript:alert(1)) }',
        modifiedValue: 'body { background: none }'
      },
      {
        type: 'profile',
        name: 'Old PAC',
        source: '+Old PAC',
        issue: 'PAC URL uses HTTP instead of HTTPS',
        resolution: 'Upgraded to HTTPS',
        severity: 'high',
        originalValue: 'http://proxy.company.com/pac.js',
        modifiedValue: 'https://proxy.company.com/pac.js'
      }
    ],
    
    errors: [
      {
        type: 'pattern',
        name: 'Regex Pattern',
        source: 'auto switch → Rule 15',
        reason: 'Pattern exceeds maximum length (256 characters)',
        details: 'Pattern length: 312 characters',
        blockedBy: 'validation',
        suggestion: 'Simplify pattern or split into multiple rules'
      },
      {
        type: 'pattern',
        name: 'Regex Pattern',
        source: 'Company → Bypass Rule 8',
        reason: 'Catastrophic backtracking detected',
        details: 'Pattern: "(.*a){x}" - exponential time complexity',
        blockedBy: 'security',
        suggestion: 'Use ".*a" without repetition'
      }
    ],
    
    startTime: '2026-01-03T10:33:00.000Z',
    endTime: '2026-01-03T10:33:01.850Z',
    duration: 1850
  },
  
  securityReport: {
    totalPatterns: 45,
    safePatterns: 43,
    rejectedPatterns: 2,
    rejectedDetails: [
      {
        type: 'regex',
        pattern: '(.*a){x}',
        reason: 'Catastrophic backtracking detected',
        location: 'Company → Bypass Rule 8',
        suggestion: 'Use ".*a"'
      },
      {
        type: 'wildcard',
        pattern: '*'.repeat(300), // Very long wildcard
        reason: 'Pattern exceeds maximum length (256)',
        location: 'auto switch → Rule 15',
        suggestion: 'Simplify pattern'
      }
    ],
    warnings: [
      '2 patterns rejected',
      '3 items modified for compatibility or security'
    ]
  }
};
```

**UI Display**:
```
Import completed in 1850ms

✓ 20 items imported successfully
⚠ 3 items imported with modifications
✗ 2 items blocked

Tab View:
  [Successes (20)] [Warnings (3)] [Errors (2)] [Security (2)]

Warnings Tab:
  ⚠ Wildcard Pattern (low)
     Issue: Leading dot syntax deprecated
     - .company.com
     + *.company.com
  
  ⚠ Custom CSS (medium)
     Issue: Contains unsafe CSS
     Sanitized for security
  
  ⚠ PAC URL (high)
     Issue: HTTP instead of HTTPS
     - http://proxy.company.com/pac.js
     + https://proxy.company.com/pac.js

Errors Tab:
  ✗ Pattern too long [validation]
     Length: 312 characters (max: 256)
     ⚠️ This pattern was NOT imported
  
  ✗ Regex Pattern [security]
     Pattern: (.*a){x}
     Reason: Catastrophic backtracking
     💡 Use ".*a" instead
     ⚠️ This pattern was NOT imported
```

---

## MigrationResult Builder Pattern

For implementation, use a builder pattern:

```typescript
class MigrationResultBuilder {
  private result: MigrationResult;
  
  constructor() {
    this.result = {
      totalItems: 0,
      successCount: 0,
      warningCount: 0,
      errorCount: 0,
      successes: [],
      warnings: [],
      errors: [],
      startTime: new Date().toISOString(),
      endTime: '',
      duration: 0
    };
  }
  
  addSuccess(item: MigrationSuccess): this {
    this.result.successes.push(item);
    this.result.successCount++;
    this.result.totalItems++;
    return this;
  }
  
  addWarning(item: MigrationWarning): this {
    this.result.warnings.push(item);
    this.result.warningCount++;
    this.result.totalItems++;
    return this;
  }
  
  addError(item: MigrationError): this {
    this.result.errors.push(item);
    this.result.errorCount++;
    this.result.totalItems++;
    return this;
  }
  
  build(): MigrationResult {
    this.result.endTime = new Date().toISOString();
    this.result.duration = 
      new Date(this.result.endTime).getTime() - 
      new Date(this.result.startTime).getTime();
    return this.result;
  }
}

// Usage in LegacyMapper
const builder = new MigrationResultBuilder();

// Process each profile
for (const [key, profile] of Object.entries(legacy)) {
  if (key.startsWith('+')) {
    try {
      const modernProfile = await this.mapProfile(profile, key);
      builder.addSuccess({
        type: 'profile',
        name: profile.name,
        source: key,
        destination: modernProfile.id,
        details: `Imported ${profile.profileType}`
      });
    } catch (error) {
      builder.addError({
        type: 'profile',
        name: profile.name,
        source: key,
        reason: error.message,
        blockedBy: 'validation'
      });
    }
  }
}

const migrationResult = builder.build();
```

---

## Summary Statistics

The `MigrationResult` provides:

1. **Quick Summary**: Total, success, warning, error counts
2. **Detailed Tracking**: Every item with source/destination
3. **Timing Data**: How long import took
4. **Actionable Info**: Suggestions for blocked items
5. **Audit Trail**: Complete log of what happened

This enables:
- ✅ User transparency (what changed?)
- ✅ Debugging (why did it fail?)
- ✅ Security reporting (what was blocked?)
- ✅ Compliance logging (audit trail)
- ✅ User decision-making (proceed or cancel?)
