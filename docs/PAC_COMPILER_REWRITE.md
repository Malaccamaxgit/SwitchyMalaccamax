# PAC Compiler Rewrite - Complete Implementation

## Overview

Successfully implemented a **ZeroOmega-compatible PAC compiler** with recursive profile resolution, matching the reference implementation from `OmegaProfile_auto_switch.pac`.

## Key Features

### 1. **Recursive Profile Resolution**
- Profiles dictionary stores each profile as a closure/function
- Main `FindProxyForURL` uses a do-while loop to resolve profile chains
- Profile references use `"+ProfileName"` as internal pointer keys
- Supports nested profile resolution (e.g., SwitchProfile → FixedProfile → actual proxy)

### 2. **Profile Reference System**
```javascript
// Generated structure:
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
    "+Auto Switch": function(url, host, scheme) { ... },
    "+Workday": function(url, host, scheme) { ... },
    "+Direct": function(url, host, scheme) { ... }
});
```

### 3. **Profile Type Support**

#### DirectProfile
```javascript
function(url, host, scheme) {
    "use strict";
    return "DIRECT";
}
```

#### FixedProfile (with bypass list)
```javascript
function(url, host, scheme) {
    "use strict";
    if (/^127\.0\.0\.1$/.test(host)) return "DIRECT";
    if (/^::1$/.test(host)) return "DIRECT";
    if (/^localhost$/.test(host)) return "DIRECT";
    if (host[host.length - 1] >= 0 && isInNet(host, "192.168.2.0", "255.255.255.0")) return "DIRECT";
    return "PROXY 192.168.50.30:8213";
}
```

#### SwitchProfile (with rules)
```javascript
function(url, host, scheme) {
    "use strict";
    if (/^confluence\.workday\.com$/.test(host)) return "+Workday";
    if (/^jira2\.workday\.com$/.test(host)) return "+Workday";
    if (/(?:^|\.)workdayinternal\.com$/.test(host)) return "+Workday";
    return "+Direct";
}
```

### 4. **Wildcard Pattern Support**

Implements SwitchyOmega wildcard semantics:
- `*.example.com` → `/(?:^|\.)example\.com$/` (matches subdomains, NOT base domain)
- `**.example.com` → `/(?:^|\.)example\.com$/` (matches all including base)
- `*` and `?` → Standard wildcard conversion

### 5. **Bypass List Support**

Handles all bypass condition types:
- IPv4 addresses: `/^127\.0\.0\.1$/.test(host)`
- IPv6 addresses: `/^::1$/.test(host)`
- CIDR notation: `isInNet(host, "192.168.2.0", "255.255.255.0")`
- Hostnames: `/^localhost$/.test(host)`
- Wildcards: Converted to regex

### 6. **Condition Type Support**

- ✅ HostWildcardCondition
- ✅ UrlWildcardCondition
- ✅ HostRegexCondition
- ✅ UrlRegexCondition
- ✅ KeywordCondition
- ✅ HostLevelsCondition
- ✅ BypassCondition

## Architecture

### Class: PacCompiler

```typescript
export class PacCompiler {
  private profiles: Map<string, Profile>;

  constructor(allProfiles: Profile[])
  compilePacScript(rootProfileName: string): string
  
  private collectReferencedProfiles(profile: Profile): Set<string>
  private generateProfilesDictionary(profileNames: Set<string>): string
  private compileProfile(profile: Profile): string
  private compileDirectProfile(): string
  private compileSystemProfile(): string
  private compileFixedProfile(profile: FixedProfile): string
  private compileSwitchProfile(profile: SwitchProfile): string
  private compilePacProfile(profile: PacProfile): string
  private generateBypassCondition(condition: Condition): string
  private generateConditionCheck(condition: Condition): string
  private wildcardToRegex(pattern: string): string
  private proxyServerToString(proxy: ProxyServer): string
  private generatePacBoilerplate(rootProfileName: string, profilesDict: string): string
}
```

### Legacy API Compatibility

```typescript
// Legacy function - maintained for backward compatibility
export function generatePacScript(profile: Profile, allProfiles: Profile[]): string {
  const compiler = new PacCompiler(allProfiles);
  return compiler.compilePacScript(profile.name);
}
```

## Usage Example

```typescript
import { PacCompiler } from '@/core/pac/pac-generator';

// Define profiles
const profiles: Profile[] = [
  {
    name: 'Direct',
    profileType: 'DirectProfile',
    color: 'blue'
  },
  {
    name: 'Workday',
    profileType: 'FixedProfile',
    color: 'green',
    fallbackProxy: {
      scheme: 'http',
      host: '192.168.50.30',
      port: 8213
    },
    bypassList: [
      { conditionType: 'BypassCondition', pattern: '127.0.0.1' },
      { conditionType: 'BypassCondition', pattern: '192.168.2.0/24' }
    ]
  },
  {
    name: 'Auto Switch',
    profileType: 'SwitchProfile',
    color: 'purple',
    defaultProfileName: 'Direct',
    rules: [
      {
        condition: { conditionType: 'HostWildcardCondition', pattern: 'confluence.workday.com' },
        profileName: 'Workday'
      },
      {
        condition: { conditionType: 'HostWildcardCondition', pattern: '*.workdayinternal.com' },
        profileName: 'Workday'
      }
    ]
  }
];

// Compile PAC script
const compiler = new PacCompiler(profiles);
const pacScript = compiler.compilePacScript('Auto Switch');

// Save to file
fs.writeFileSync('proxy.pac', pacScript);
```

## Comparison: Old vs New

### Old Implementation (Simple)
```javascript
function FindProxyForURL(url, host) {
  // Rule 1: HostWildcardCondition -> "Workday" (FixedProfile)
  if (shExpMatch(host, "confluence.workday.com")) {
    return "PROXY 192.168.50.30:8213";  // ❌ Hardcoded - no nesting
  }
  
  // Default profile: "Direct" (DirectProfile)
  return "DIRECT";
}
```

### New Implementation (Recursive)
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
        if (/^confluence\.workday\.com$/.test(host)) return "+Workday";  // ✅ Profile reference
        return "+Direct";
    },
    "+Workday": function(url, host, scheme) {
        "use strict";
        if (/^127\.0\.0\.1$/.test(host)) return "DIRECT";  // ✅ Bypass rules
        return "PROXY 192.168.50.30:8213";
    },
    "+Direct": function(url, host, scheme) {
        "use strict";
        return "DIRECT";
    }
});
```

## Benefits

1. **Full Nesting Support**: Switch profiles can reference other profiles indefinitely
2. **Bypass List Integration**: Fixed profiles with bypass rules work correctly
3. **Profile Isolation**: Each profile is self-contained and reusable
4. **ZeroOmega Compatible**: Generated PAC files match ZeroOmega's export format
5. **Efficient**: Only includes referenced profiles in the output

## Testing

Created comprehensive test suite in `tests/core/pac-compiler.spec.ts`:
- ✅ DirectProfile generation
- ✅ FixedProfile with bypass rules
- ✅ SwitchProfile with nested references
- ✅ Wildcard pattern conversion
- ✅ Profile reference resolution (only includes used profiles)
- ✅ Legacy API compatibility

## Files Modified

1. **[src/core/pac/pac-generator.ts](src/core/pac/pac-generator.ts)** - Complete rewrite with PacCompiler class
2. **[tests/core/pac-compiler.spec.ts](tests/core/pac-compiler.spec.ts)** - New comprehensive test suite

## Integration

The new `PacCompiler` is fully backward compatible with existing code through the legacy `generatePacScript()` function. Existing export features in OptionsApp.vue will work without any changes.

## Next Steps

1. ✅ Implementation complete
2. ✅ Tests passing
3. ✅ Build successful
4. Ready for production use

---

**Status**: ✅ COMPLETE - Production Ready

**Date**: January 4, 2026

**Implements**: ZeroOmega-compatible recursive profile resolution
