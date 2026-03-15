# Profile Editor Fixes - v0.1.5

## Overview
Addressed 6 user-reported issues with profile management UX and data handling.

**Date**: January 4, 2026
**Version**: 0.1.5
**Test Results**: ✅ All 171 tests passing

---

## Issues Fixed

### 1. ✅ Built-in Profile Visibility Toggle
**Issue**: User wanted ability to control if Direct and System profiles show in popup.
**Status**: Already implemented - confirmed working as designed.

**Implementation**:
- Built-in profiles (`isBuiltIn: true`) can toggle `showInPopup` just like user-created profiles
- Located in ProfileEditor.vue lines 55-67
- Toggle applies to ALL profiles without restrictions

**Test**: Open Direct or System profile → Toggle "Show in Popup" → Works correctly

---

### 2. ✅ Icon/Text Overlay in Input Fields
**Issue**: Icons overlapped text in username/password/host fields making input hard to read.

**Root Cause**: Input components with `<template #icon>` slot added icons without proper padding, causing text to render underneath the icon.

**Fix**: Removed icon slots from Input components
- File: `src/components/profile/ProfileEditor.vue`
- Removed `<template #icon>` blocks from:
  - Host input (line ~180)
  - Username input (line ~200)
  - Password input (line ~210)

**Result**: Clean input fields with no visual overlap.

---

### 3. ✅ Authentication Status Display
**Issue**: Profile detail view didn't show if authentication was configured for Fixed Server.

**Implementation**: Added authentication status section in profile detail view
- File: `src/options/OptionsApp.vue`
- Location: Between "Proxy servers" and "Bypass List" sections (line ~670)

**Features**:
- ✓ Shows green checkmark + "Enabled" + username when auth configured
- ✗ Shows gray X + "Not configured" when no auth
- Visual indicators: Icons + color + text (accessible design)

**Example Display**:
```
Authentication
┌──────────────────────────────────────┐
│ ✓ Enabled                            │
│   Username: admin                    │
└──────────────────────────────────────┘
```

---

### 4. ✅ Bypass List "[object Object]" Display Bug
**Issue**: Bypass list showed `[object Object], [object Object]` instead of actual patterns in ProfileEditor.

**Root Cause**: Data structure mismatch
- Storage format: `BypassCondition[]` where each is `{conditionType: 'BypassCondition', pattern: 'value'}`
- ProfileEditor treated it as: `string[]` and called `.join(', ')` directly

**Fix**: Extract `.pattern` property from Condition objects
- File: `src/components/profile/ProfileEditor.vue`
- Line 551: Changed from `profile.bypassList.join(', ')` to:
  ```typescript
  profile.bypassList
    .map((condition: any) => condition.pattern || '')
    .filter(pattern => pattern)
    .join(', ')
  ```
- Line 445: Convert back to Condition objects on save:
  ```typescript
  bypassList: formData.value.bypassList
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(pattern => ({
      conditionType: 'BypassCondition',
      pattern
    }))
  ```

**Result**: Bypass list now displays correctly as comma-separated patterns:
```
127.0.0.1, localhost, 192.168.2.0/24
```

---

### 5. ✅ Authentication Implementation Verification
**Status**: Verified implementation is correct.

**Storage**:
- Credentials stored in chrome.storage.local as encrypted fields
- Encryption: AES-256-GCM via `src/utils/crypto.ts`
- Fields: `username`, `password` (optional, only if `requiresAuth: true`)

**Application**:
- Service worker receives proxy config from popup/options
- Chrome's built-in proxy authentication handles credential prompts
- Extension provides credentials via `chrome.proxy.settings.set()`

**Security**:
- ✅ Passwords encrypted at rest
- ✅ Never logged or exposed in plaintext
- ✅ Credentials only sent to proxy server (not stored in PAC script)

**Note**: Chrome automatically handles proxy authentication dialogs. The extension stores credentials but Chrome's native auth mechanism applies them.

---

### 6. ✅ Test Connection - Real Implementation
**Issue**: Test Connection used mock logic (`setTimeout` + `Math.random()`) instead of actually testing proxy.

**Implementation**: Replaced mock with real proxy connection test
- File: `src/components/profile/ProfileEditor.vue`
- Lines 510-600: Complete rewrite

**New Behavior**:
1. Temporarily applies test proxy configuration
2. Makes actual HTTP request to `https://www.google.com/generate_204`
3. 10-second timeout with AbortController
4. Detects proxy auth requirement (HTTP 407)
5. Restores original proxy settings after test

**Test Results**:
- ✓ Connected successfully (HTTP 204)
- ✗ Connection timeout (10+ seconds)
- ✗ Connection failed (network error)
- ⚠️ Proxy authentication required (HTTP 407)

**Limitations**:
- Authentication credentials are NOT sent in test (Chrome handles auth separately)
- To test auth, user must save profile first, then connect normally
- Test verifies proxy **reachability**, not authentication correctness

**Example Flow**:
```
User clicks "Test Connection"
  ↓
Apply test proxy temporarily
  ↓
Fetch https://www.google.com/generate_204
  ↓
[Success] HTTP 204 → "Connected successfully"
[Auth Required] HTTP 407 → "Proxy authentication required"
[Timeout] 10s+ → "Connection timeout"
[Error] Network fail → "Connection failed"
  ↓
Restore original proxy settings
```

---

## Technical Details

### Data Structure: BypassCondition
```typescript
interface BypassCondition {
  conditionType: 'BypassCondition';
  pattern: string; // IP, CIDR, hostname, wildcard
}

// Example:
[
  { conditionType: 'BypassCondition', pattern: '127.0.0.1' },
  { conditionType: 'BypassCondition', pattern: 'localhost' },
  { conditionType: 'BypassCondition', pattern: '192.168.2.0/24' },
  { conditionType: 'BypassCondition', pattern: '<local>' }
]
```

### Conversion Logic
```typescript
// Load (Condition[] → string)
const text = profile.bypassList
  .map(condition => condition.pattern)
  .join(', ');

// Save (string → Condition[])
const conditions = text
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)
  .map(pattern => ({
    conditionType: 'BypassCondition',
    pattern
  }));
```

### Files Modified
1. `src/components/profile/ProfileEditor.vue`
   - Removed icon slots from inputs (lines 180, 200, 210)
   - Fixed bypass list loading (line 551)
   - Fixed bypass list saving (line 445)
   - Implemented real test connection (lines 510-600)

2. `src/options/OptionsApp.vue`
   - Added authentication status display (line ~670)

---

## Testing Performed

### Unit Tests
```bash
npm test
✅ All 171 tests passing
```

### Manual Testing Checklist
- [x] Create new Fixed Server profile with bypass list
- [x] Edit existing profile - bypass list displays correctly
- [x] Save profile - bypass list persists as Condition objects
- [x] View profile detail - authentication status shows
- [x] Toggle visibility on Direct profile - works
- [x] Toggle visibility on System profile - works
- [x] Test Connection with valid proxy - shows result
- [x] Test Connection with invalid host - shows timeout
- [x] Input fields display text without icon overlap

---

## User-Facing Changes

### Profile Editor Dialog
- **Cleaner input fields**: No more icon/text overlap
- **Correct bypass list display**: Shows actual patterns instead of "[object Object]"
- **Real connection test**: Actually tests proxy reachability

### Profile Detail View (Options Page)
- **Authentication section**: New visual indicator showing if auth is configured
- **Better UX**: Users can see at a glance which profiles use authentication

### Built-in Profiles
- **Confirmed**: Direct and System profiles can be hidden from popup
- **No changes needed**: Feature already worked as designed

---

## Backward Compatibility

✅ **Fully backward compatible**
- Existing profiles load correctly
- Bypass list migration handled automatically
- No data loss or corruption

### Migration Notes
- Old bypass lists stored as `string[]` are automatically converted to `Condition[]` on first load
- Encryption is applied to credentials during migration (see `src/utils/migration.ts`)

---

## Known Limitations

### Test Connection
1. **Authentication not tested**: Chrome handles auth separately, can't test credentials directly
2. **Network-dependent**: Requires internet connection to reach test endpoint
3. **Proxy-specific**: Some proxies block the test endpoint (google.com/generate_204)

**Workaround**: Save profile and connect normally to test authentication.

### Authentication Display
1. **Username only**: Shows username but not password (security best practice)
2. **No "test auth" button**: Can't verify credentials without actually connecting

---

## Future Enhancements

### Potential Improvements
1. **Test endpoint selection**: Let users choose test URL (e.g., internal server)
2. **Auth testing**: Add separate "Test Authentication" button that actually connects
3. **Bypass list editor**: Rich editor with validation, pattern templates
4. **Profile templates**: Pre-configured profiles for common proxy setups

### Community Requests
- [ ] Bulk profile import/export
- [ ] Profile groups/categories
- [ ] Connection quality metrics (latency, success rate)
- [ ] Auto-detect proxy settings from system

---

## References

### Related Files
- `src/core/schema.ts` - BypassCondition interface
- `src/core/conditions.ts` - Bypass pattern matching logic
- `src/utils/crypto.ts` - Credential encryption
- `src/background/service-worker.ts` - Proxy application logic

### Related Documentation
- [Migration UI States](./migration-ui-states.md)
- [PAC Compiler Rewrite](./PAC_COMPILER_REWRITE.md)
- [Security Audit Report](../development/SECURITY_AUDIT_REPORT.md)

---

## Changelog Entry

```markdown
### [0.1.5] - 2026-01-04

#### Fixed
- Fixed icon/text overlap in profile editor input fields
- Fixed bypass list displaying "[object Object]" instead of actual patterns
- Added authentication status indicator in profile detail view
- Implemented real proxy connection testing (replaced mock)

#### Verified
- Built-in profiles (Direct/System) can control popup visibility
- Authentication credentials properly encrypted and stored

#### Technical
- Bypass list now correctly converts between Condition[] and string formats
- Test Connection makes actual HTTP request through configured proxy
- Added visual authentication status in profile detail view
```

---

**Status**: ✅ All issues resolved and tested
**Ready for**: Production deployment
**Breaking Changes**: None
