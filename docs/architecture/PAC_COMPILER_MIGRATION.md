# PAC Compiler Migration Guide

## Overview

The PAC compiler has been completely rewritten to support **recursive profile resolution** matching ZeroOmega's implementation. The new system generates self-contained executable PAC files that can resolve nested profile references.

## What Changed

### Old Implementation
- Generated simple flat PAC files with hardcoded proxy results
- Did not support nested profile references
- Switch profiles directly embedded target profile logic

### New Implementation  
- Generates ZeroOmega-compatible PAC files with profiles dictionary
- Full support for nested profile resolution via do-while loop
- Profile references use "+ProfileName" pointers
- Self-contained and executable

## API Changes

### Legacy API (Still Supported)

The old API continues to work with the new implementation:

```typescript
import { generatePacScript } from '@/core/pac/pac-generator';

const profile: Profile = { /* your profile */ };
const allProfiles: Profile[] = [ /* all profiles */ ];

const pacScript = generatePacScript(profile, allProfiles);
```

**No code changes required!** The legacy function now uses the new PacCompiler internally.

### New API (Recommended)

For more control and better performance:

```typescript
import { PacCompiler } from '@/core/pac/pac-generator';

// Create compiler instance with all profiles
const compiler = new PacCompiler(allProfiles);

// Generate PAC script for a specific profile
const pacScript = compiler.compilePacScript('Auto Switch');
```

## Benefits of New Implementation

### 1. True Profile Nesting
```javascript
// Old output - hardcoded
if (shExpMatch(host, "*.example.com")) {
  return "PROXY proxy.example.com:8080";  // ❌ No flexibility
}

// New output - with profile references
if (/(?:^|\.)example\.com$/.test(host)) {
  return "+CompanyProxy";  // ✅ Resolved at runtime
}
```

### 2. Bypass Lists Work Correctly
```javascript
// Profile "CompanyProxy" function includes bypass logic
"+CompanyProxy": function(url, host, scheme) {
    if (/^127\.0\.0\.1$/.test(host)) return "DIRECT";  // ✅ Bypass rule
    if (isInNet(host, "192.168.0.0", "255.255.0.0")) return "DIRECT";
    return "PROXY proxy.example.com:8080";
}
```

### 3. Reusable Profiles
Multiple switch profiles can reference the same proxy profile, and the PAC file will only include it once.

## Breaking Changes

### None!

The legacy API is fully backward compatible. Existing code will work without modifications.

## Performance Considerations

### Compilation Time
- **Old**: O(n) - linear with number of rules
- **New**: O(n) - same complexity, but with profile reference collection

### Runtime Performance
- **Old**: Direct lookup, no overhead
- **New**: Do-while loop resolution (minimal overhead, 1-3 iterations typically)

### File Size
- **Old**: Smaller (inline everything)
- **New**: Slightly larger (profiles dictionary structure), but more maintainable

## Examples

### Before (Old Output)
```javascript
function FindProxyForURL(url, host) {
  // Rule 1: HostWildcardCondition -> "Example" (FixedProfile)
  if (shExpMatch(host, "confluence.example.com")) {
    return "PROXY 192.168.50.30:8213";
  }
  
  // Rule 2: HostWildcardCondition -> "Example" (FixedProfile)
  if (shExpMatch(host, "*.example.com")) {
    return "PROXY 192.168.50.30:8213";
  }

  // Default profile: "Direct" (DirectProfile)
  return "DIRECT";
}
```

### After (New Output)
```javascript
var FindProxyForURL = function(init, profiles) {
    return function(url, host) {
        "use strict";
        var result = init, scheme = url.substr(0, url.indexOf(":"));
        do {
            if (!profiles[result]) return result;
            result = profiles[result];
            if (typeof result === "function") result = result(url, host, scheme);
        } while (typeof result !== "string" || result.charCodeAt(0) === 43);
        return result;
    };
}("+Auto Switch", {
    "+Auto Switch": function(url, host, scheme) {
        "use strict";
        if (/^confluence\.example\.com$/.test(host)) return "+Example";
        if (/(?:^|\.)example\.com$/.test(host)) return "+Example";
        return "+Direct";
    },
    "+Example": function(url, host, scheme) {
        "use strict";
        if (/^127\.0\.0\.1$/.test(host)) return "DIRECT";
        if (/^localhost$/.test(host)) return "DIRECT";
        return "PROXY 192.168.50.30:8213";
    },
    "+Direct": function(url, host, scheme) {
        "use strict";
        return "DIRECT";
    }
});
```

## Testing Your Code

If you have existing tests that validate PAC output, you may need to update them to match the new format:

### Update Assertions
```typescript
// Old assertion
expect(pacScript).toContain('return "PROXY proxy.example.com:8080"');

// New assertion - check for profile reference first
expect(pacScript).toContain('return "+CompanyProxy"');
// Then check the actual proxy is defined in the profile
expect(pacScript).toContain('PROXY proxy.example.com:8080');
```

### Verify Structure
```typescript
// Check for resolver boilerplate
expect(pacScript).toContain('var FindProxyForURL = function(init, profiles)');
expect(pacScript).toContain('do {');
expect(pacScript).toContain('} while');

// Check for profiles dictionary
expect(pacScript).toContain('"+Auto Switch":');
expect(pacScript).toContain('"+CompanyProxy":');
```

## Rollback Plan

If you need to revert to the old implementation (not recommended):

1. Checkout previous version of `src/core/pac/pac-generator.ts` from git
2. Remove the `PacCompiler` class
3. Restore the old `generatePacScript()` implementation

However, this is **not recommended** as the new implementation is fully backward compatible and provides significant benefits.

## Questions?

See [PAC_COMPILER_REWRITE.md](./PAC_COMPILER_REWRITE.md) for detailed implementation documentation.

---

**Migration Status**: ✅ COMPLETE - No action required for existing code

**Backward Compatibility**: ✅ 100% - Legacy API works with new implementation

**Date**: January 4, 2026
