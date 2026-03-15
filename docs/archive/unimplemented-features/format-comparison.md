# Format Comparison: Legacy vs Modern

This document shows side-by-side examples of the Legacy (ZeroOmega .bak) and Modern (SwitchyMalaccamax v2) export formats.

## Legacy Format (ZeroOmega .bak)

```json
{
  "+Company": {
    "name": "Company",
    "profileType": "FixedProfile",
    "color": "#99dd99",
    "bypassList": [
      {
        "conditionType": "BypassCondition",
        "pattern": "127.0.0.1"
      },
      {
        "conditionType": "BypassCondition",
        "pattern": "[::1]"
      },
      {
        "conditionType": "BypassCondition",
        "pattern": "localhost"
      }
    ],
    "fallbackProxy": {
      "scheme": "http",
      "host": "proxy.company.com",
      "port": 8080
    },
    "revision": "1a2b3c4d"
  },
  "+auto switch": {
    "name": "auto switch",
    "profileType": "SwitchProfile",
    "color": "#99ccee",
    "defaultProfileName": "direct",
    "rules": [
      {
        "condition": {
          "conditionType": "HostWildcardCondition",
          "pattern": "*.company.com"
        },
        "profileName": "Company"
      },
      {
        "condition": {
          "conditionType": "HostRegexCondition",
          "pattern": "^.*\\.internal$"
        },
        "profileName": "Company"
      }
    ]
  },
  "+direct": {
    "name": "direct",
    "profileType": "DirectProfile",
    "color": "#aaaaaa",
    "builtin": true
  },
  "-addConditionsToBottom": false,
  "-confirmDeletion": true,
  "-startupProfileName": "auto switch",
  "-refreshOnProfileChange": true,
  "-quickSwitchProfiles": ["direct", "Company", "auto switch"],
  "schemaVersion": 2
}
```

### Issues with Legacy Format:
1. **Cryptic key prefixes**: `+` for profiles, `-` for settings
2. **Inconsistent naming**: Mix of camelCase and spaces
3. **No metadata**: No export timestamp, version info
4. **Flat structure**: Settings and profiles mixed together
5. **Type ambiguity**: String literals instead of enums
6. **No validation**: No built-in schema validation

---

## Modern Format (SwitchyMalaccamax v2.0)

```json
{
  "version": "2.0",
  "exportedAt": "2026-01-03T10:30:00.000Z",
  "exportedBy": "SwitchyMalaccamax/2.0.0",
  
  "profiles": [
    {
      "id": "profile-1a2b3c4d",
      "name": "Company",
      "type": "fixed",
      "color": "#99dd99",
      "revision": "1a2b3c4d",
      "config": {
        "type": "fixed",
        "proxy": {
          "scheme": "http",
          "host": "proxy.company.com",
          "port": 8080
        },
        "bypassRules": [
          {
            "type": "bypass",
            "pattern": "127.0.0.1"
          },
          {
            "type": "bypass",
            "pattern": "[::1]"
          },
          {
            "type": "bypass",
            "pattern": "localhost"
          }
        ]
      }
    },
    {
      "id": "profile-auto-switch",
      "name": "auto switch",
      "type": "switch",
      "color": "#99ccee",
      "config": {
        "type": "switch",
        "defaultProfile": "direct",
        "rules": [
          {
            "condition": {
              "type": "hostWildcard",
              "pattern": "*.company.com"
            },
            "profile": "profile-1a2b3c4d"
          },
          {
            "condition": {
              "type": "hostRegex",
              "pattern": "^.*\\.internal$"
            },
            "profile": "profile-1a2b3c4d"
          }
        ]
      }
    },
    {
      "id": "direct",
      "name": "direct",
      "type": "direct",
      "color": "#aaaaaa",
      "config": {
        "type": "direct"
      }
    }
  ],
  
  "settings": {
    "ui": {
      "addConditionsToBottom": false,
      "confirmDeletion": true
    },
    "behavior": {
      "startupProfile": "profile-auto-switch",
      "refreshOnProfileChange": true,
      "quickSwitchProfiles": ["direct", "profile-1a2b3c4d", "profile-auto-switch"]
    },
    "advanced": {}
  }
}
```

### Improvements in Modern Format:
1. ✅ **Clear structure**: Profiles and settings separated
2. ✅ **Metadata**: Version, timestamp, export source
3. ✅ **Type safety**: Enum-like strings (`"fixed"`, `"switch"`)
4. ✅ **Unique IDs**: Each profile has stable identifier
5. ✅ **CamelCase**: Consistent naming convention
6. ✅ **Organized settings**: Grouped by category (ui, behavior, advanced)
7. ✅ **Self-documenting**: Property names are explicit
8. ✅ **Discriminated unions**: Type-safe config objects
9. ✅ **Human-readable**: No cryptic prefixes
10. ✅ **Versioned**: Explicit major.minor versioning

---

## Key Mapping Rules

### Profile Keys
| Legacy | Modern | Notes |
|--------|--------|-------|
| `+ProfileName` | `profiles[].id` | Generated from name/revision |
| `profileType` | `type` + `config.type` | Lowercase enum |
| `defaultProfileName` | `defaultProfile` | References profile ID |
| `bypassList` | `bypassRules` | More explicit |

### Condition Types
| Legacy | Modern | Example |
|--------|--------|---------|
| `BypassCondition` | `bypass` | `127.0.0.1` |
| `HostWildcardCondition` | `hostWildcard` | `*.example.com` |
| `HostRegexCondition` | `hostRegex` | `^.*\.local$` |
| `HostLevelsCondition` | `hostLevels` | min=2, max=4 |
| `UrlWildcardCondition` | `urlWildcard` | `*://example.com/*` |
| `UrlRegexCondition` | `urlRegex` | `^https://.*` |
| `KeywordCondition` | `keyword` | `vpn` |

### Setting Keys
| Legacy | Modern | Category |
|--------|--------|----------|
| `-addConditionsToBottom` | `settings.ui.addConditionsToBottom` | UI |
| `-confirmDeletion` | `settings.ui.confirmDeletion` | UI |
| `-startupProfileName` | `settings.behavior.startupProfile` | Behavior |
| `-refreshOnProfileChange` | `settings.behavior.refreshOnProfileChange` | Behavior |
| `-quickSwitchProfiles` | `settings.behavior.quickSwitchProfiles` | Behavior |
| `-downloadInterval` | `settings.advanced.downloadInterval` | Advanced |

---

## Security Validation

Both formats are validated during import:

### Pattern Validation
```typescript
// Legacy: "^.*\\.internal$"
// ↓ Security Check via regexSafe.ts
// ↓ If safe → Import
// ↓ If unsafe → Reject with warning

// Modern: Same validation applied
```

### Rejected Pattern Example
```json
{
  "type": "hostRegex",
  "pattern": "(a+)+"  // ❌ ReDoS pattern - REJECTED
}
```

**Import Result:**
```json
{
  "success": false,
  "errors": [{
    "code": "UNSAFE_REGEX",
    "message": "Pattern rejected: catastrophic backtracking detected",
    "path": "profiles[1].config.rules[0].condition.pattern"
  }],
  "securityReport": {
    "totalPatterns": 10,
    "safePatterns": 9,
    "rejectedPatterns": 1,
    "rejectedDetails": [{
      "type": "regex",
      "pattern": "(a+)+",
      "reason": "Catastrophic backtracking detected",
      "location": "auto switch → Rule 1",
      "suggestion": "Use simpler pattern like '^a+$'"
    }]
  }
}
```

---

## User Preference Storage

```json
{
  "preferredExportFormat": "modern",  // or "legacy"
  "lastImportFormat": "legacy",
  "migrationWarningsShown": true
}
```

### Export Behavior
- **Default**: Export to modern format
- **User override**: Settings → Export Format → Legacy/Modern
- **Smart detection**: Import auto-detects format
- **Compatibility mode**: Can export to legacy for sharing with ZeroOmega users
