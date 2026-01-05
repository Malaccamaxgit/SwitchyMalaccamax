# PAC Compiler Fix - Legacy Format Support

## Issue

The PAC compiler was generating incorrect output where FixedProfile profiles were returning `"DIRECT"` instead of the actual proxy configuration (e.g., `"PROXY 192.168.50.30:8213"`).

### Root Cause

**Schema vs Storage Format Mismatch**

The TypeScript schema defines FixedProfile as:
```typescript
export interface FixedProfile extends BaseProfile {
  profileType: 'FixedProfile';
  fallbackProxy: ProxyServer;  // ← Nested object
  bypassList?: Condition[];
}

export interface ProxyServer {
  scheme: 'http' | 'https' | 'socks4' | 'socks5';
  host: string;
  port: number;
}
```

But the actual storage format (in OptionsApp.vue and Chrome storage) uses:
```typescript
{
  profileType: 'FixedProfile',
  proxyType: 'HTTP',  // ← Top-level field
  host: 'proxy.example.com',  // ← Top-level field
  port: 8080,  // ← Top-level field
  bypassList: [...]
}
```

## Example Output Comparison

### Before Fix (INCORRECT)
```javascript
"+Workday": function(url, host, scheme) {
    "use strict";
    if (/^127\.0\.0\.1$/.test(host)) return "DIRECT";
    if (/^localhost$/.test(host)) return "DIRECT";
    return "DIRECT";  // ❌ WRONG - should be proxy address
}
```

### After Fix (CORRECT)
```javascript
"+Workday": function(url, host, scheme) {
    "use strict";
    if (/^127\.0\.0\.1$/.test(host)) return "DIRECT";
    if (/^localhost$/.test(host)) return "DIRECT";
    return "PROXY 192.168.50.30:8213";  // ✅ CORRECT
}
```

## Solution

Updated `compileFixedProfile()` to handle **both formats**:

```typescript
private compileFixedProfile(profile: FixedProfile): string {
  let proxyResult: string;
  
  if (profile.fallbackProxy) {
    // Schema-compliant format: { fallbackProxy: { scheme, host, port } }
    proxyResult = this.proxyServerToString(profile.fallbackProxy);
  } else if ((profile as any).host && (profile as any).port) {
    // Legacy/storage format: { proxyType, host, port }
    const scheme = ((profile as any).proxyType || 'http').toLowerCase();
    const host = (profile as any).host;
    const port = (profile as any).port;
    
    proxyResult = this.proxyServerToString({
      scheme: scheme as 'http' | 'https' | 'socks4' | 'socks5',
      host,
      port
    });
  } else {
    throw new Error(`FixedProfile missing proxy configuration`);
  }
  
  // ... rest of function
}
```

## Benefits

1. ✅ **Backward Compatible**: Works with existing storage format
2. ✅ **Future-Proof**: Also works with schema-compliant format
3. ✅ **Defensive**: Provides clear error messages if neither format is present
4. ✅ **Logged**: Detailed logging for debugging

## Testing

Added test for legacy format:
```typescript
it('should generate fixed proxy profile with legacy format (host/port)', () => {
  const profiles: Profile[] = [{
    name: 'Workday',
    profileType: 'FixedProfile',
    proxyType: 'HTTP',  // ← Legacy format
    host: '192.168.50.30',
    port: 8213,
    bypassList: [...]
  } as any];

  const result = compiler.compilePacScript('Workday');
  expect(result).toContain('PROXY 192.168.50.30:8213');  // ✅ Passes
});
```

## Files Modified

1. **[src/core/pac/pac-generator.ts](src/core/pac/pac-generator.ts)** - Updated `compileFixedProfile()` with dual-format support
2. **[tests/core/pac-compiler.spec.ts](tests/core/pac-compiler.spec.ts)** - Added legacy format test

## Migration Path (Optional)

To eventually migrate to the schema-compliant format, you could add a data migration function:

```typescript
function migrateFixedProfile(profile: any): FixedProfile {
  if (profile.fallbackProxy) {
    return profile;  // Already migrated
  }
  
  return {
    ...profile,
    fallbackProxy: {
      scheme: (profile.proxyType || 'http').toLowerCase(),
      host: profile.host,
      port: profile.port
    }
  };
}
```

But this is **not required** - the PAC compiler now handles both formats transparently!

---

**Status**: ✅ FIXED

**Date**: January 4, 2026

**Impact**: PAC exports now correctly include proxy configurations
