# PAC Export Feature

> **Export profiles as PAC scripts** — Generate standards-compliant `.pac` files for use in browsers or proxy systems using File System Access API.

## Overview

Implemented PAC (Proxy Auto-Config) script export functionality, achieving feature parity with ZeroOmega's omega-pac module. Users can export configured profiles as PAC scripts for use in browsers or proxy systems.

## Implementation

### Core Module: `src/core/pac/pac-generator.ts`

**Main Function:**
```typescript
generatePacScript(profile: Profile, allProfiles: Profile[]): string
```

**Supported Profile Types:**

| Profile Type | Status | Description |
|--------------|--------|-------------|
| FixedProfile | ✅ | Single proxy with optional bypass rules |
| SwitchProfile | ✅ | Rule-based switching with conditions |
| DirectProfile | ✅ | Returns "DIRECT" connection |
| SystemProfile | ✅ | Returns "DIRECT" (system proxy not applicable in PAC) |
| PacProfile | ⏳ | Returns original PAC URL (future enhancement) |

**Supported Condition Types:**

All 7 condition types from the schema:

| Condition Type | PAC Function |
|----------------|--------------|
| HostWildcard | `shExpMatch(host, pattern)` |
| UrlWildcard | `shExpMatch(url, pattern)` |
| HostRegex | JavaScript RegExp matching on host |
| UrlRegex | JavaScript RegExp matching on URL |
| Keyword | Simple substring search in URL |
| HostLevels | Domain level counting |
| Bypass | For fixed profiles with bypass rules |

**Special Features:**

| Feature | Implementation |
|---------|---------------|
| CIDR notation | `192.168.0.0/16` → `isInNet(host, "192.168.0.0", "255.255.0.0")` |
| Proxy protocol mapping | HTTP→PROXY, HTTPS→HTTPS, SOCKS4→SOCKS, SOCKS5→SOCKS5 |
| Wildcard escaping | Converts user-friendly wildcards to PAC-safe patterns |
| Minification | Removes comments and whitespace for production use |

### UI Integration: `src/options/OptionsApp.vue`

**Location:** Profile Detail View → Action buttons (between Edit and Delete)

**Button:**
```vue
<button
  v-if="selectedProfile.profileType === 'FixedProfile' || selectedProfile.profileType === 'SwitchProfile'"
  @click="exportProfileAsPac(selectedProfile)"
  class="px-3 py-1.5 text-[12px] font-medium rounded-md bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400"
  title="Export as PAC script"
>
  <Download class="h-3.5 w-3.5" />
  Export PAC
</button>
```

**Export Function:**
```typescript
import { saveBlobToFile } from '@/lib/fileSaver';

async function exportProfileAsPac(profile: Profile) {
  // 1. Generate PAC script using pac-generator module
  const pacScript = generatePacScript(profile, profiles.value);

  // 2. Create downloadable blob
  const blob = new Blob([pacScript], { type: 'application/x-ns-proxy-autoconfig' });

  // 3. Save file (File System Access API with anchor fallback)
  const safeName = profile.name.replace(/[^a-zA-Z0-9-_]/g, '_');
  const filename = `${safeName}.pac`;

  try {
    await saveBlobToFile(blob, filename, 'application/x-ns-proxy-autoconfig');
    toastRef.value?.success(`PAC script exported: ${filename}`, 'Exported', 3000);
  } catch (err) {
    // User cancelled or error - handle gracefully
    if (err && (err.name === 'AbortError' || err.message?.includes('cancelled'))) {
      toastRef.value?.info('Export cancelled', 'Cancelled');
    } else {
      toastRef.value?.error('Failed to export PAC script', 'Error');
      console.error('Export failed', err);
    }
  }
}
```

## Usage

### For Users

1. Navigate to **Settings** → **Profiles**
2. Select a profile (Fixed or Switch type)
3. Click **Export PAC** button (blue, between Edit and Delete)
4. Save file dialog prompts for destination and filename
5. Use the PAC file in:
   - Browser proxy settings (Chrome, Firefox, etc.)
   - System proxy configuration
   - Corporate proxy systems
   - Network testing tools

### Example Output

**Fixed Profile with Bypass:**
```javascript
function FindProxyForURL(url, host) {
  // Direct access for bypass rules
  if (shExpMatch(host, "*.local")) return "DIRECT";
  if (shExpMatch(host, "localhost")) return "DIRECT";

  // Fixed proxy
  return "PROXY proxy.example.com:8080";
}
```

**Switch Profile with Rules:**
```javascript
function FindProxyForURL(url, host) {
  // Rule: Work Sites
  if (shExpMatch(host, "*.company.com")) {
    return "PROXY corporate-proxy:3128";
  }

  // Rule: Streaming
  if (shExpMatch(host, "*.netflix.com") || shExpMatch(host, "*.youtube.com")) {
    return "SOCKS5 streaming-proxy:1080";
  }

  // Default fallback
  return "DIRECT";
}
```

## Testing

### Manual Testing

1. Build extension: `npm run build`
2. Load in Chrome: `chrome://extensions` → Load unpacked → Select `dist/`
3. Open extension options
4. Create/select a Fixed or Switch profile
5. Click Export PAC
6. Save file dialog appears; choose destination and save `.pac` file
7. Verify saved `.pac` file opens in text editor with expected `FindProxyForURL` logic
8. Check PAC syntax is valid JavaScript

### Automated Tests

Unit tests for file save helper: `tests/lib/fileSaver.spec.ts`

### PAC Validation

```bash
# Test PAC file in browser
1. Open chrome://net-internals/#proxy
2. Check "Use custom proxy configuration"
3. Enter: file:///path/to/exported.pac
4. Test URLs to verify routing
```

## Technical Details

### File Structure

| Path | Description |
|------|-------------|
| `src/core/pac/pac-generator.ts` | Core PAC generation logic (345 lines) |
| `src/options/OptionsApp.vue` | UI integration |
| `src/lib/fileSaver.ts` | File save helper with File System Access API |

### Dependencies

| Dependency | Usage |
|------------|-------|
| Native Blob API | Create downloadable content |
| URL.createObjectURL() | Generate blob URLs |
| File System Access API | Native save dialog (progressive enhancement) |
| `src/lib/fileSaver.ts` | `saveBlobToFile()` helper |
| TypeScript types | `@/core/schema` |

### Security Considerations

| Measure | Description |
|---------|-------------|
| Filename sanitization | Prevents path traversal |
| Regex validation | Handled by existing `regexSafe.ts` |
| Browser sandbox | PAC scripts run in browser sandbox |
| No eval() | No dynamic code execution |
| Permissions | No `downloads` permission required; uses File System Access API with anchor fallback |

## Future Enhancements

### Phase 2 (Optional)

- [ ] PAC preview modal before download
- [ ] Copy PAC to clipboard button
- [ ] PAC validation/linting
- [ ] Import PAC files (reverse operation)
- [ ] PAC script comments/documentation toggle
- [ ] Support for PacProfile exports

### Advanced Features

- [ ] PAC optimization: Minimize file size
- [ ] PAC testing: Built-in URL tester
- [ ] PAC hosting: Generate shareable URLs
- [ ] PAC versioning: Track changes over time

## Status

| Status | Description |
|--------|-------------|
| ✅ **COMPLETE** | PAC export fully functional |
| ✅ **TESTED** | Core logic, UI integration, build successful |

## Related code

- Implementation: [`src/core/pac/pac-generator.ts`](../../src/core/pac/pac-generator.ts)
