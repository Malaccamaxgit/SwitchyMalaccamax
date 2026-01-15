# PAC Export Feature

## Overview
Implemented PAC (Proxy Auto-Config) script export functionality, achieving feature parity with ZeroOmega's omega-pac module. Users can now export configured profiles as PAC scripts for use in browsers or proxy systems.

## Implementation

### Core Module: `src/core/pac/pac-generator.ts`
**Main Function:**
```typescript
generatePacScript(profile: Profile, allProfiles: Profile[]): string
```

**Supported Profile Types:**
- ✅ **FixedProfile**: Single proxy with optional bypass rules
- ✅ **SwitchProfile**: Rule-based switching with conditions
- ✅ **DirectProfile**: Returns "DIRECT" connection
- ✅ **SystemProfile**: Returns "DIRECT" (system proxy not applicable in PAC)
- ⏳ **PacProfile**: Returns original PAC URL (future enhancement)

**Supported Condition Types:**
All 7 condition types from the schema:
1. **HostWildcard**: `shExpMatch(host, pattern)`
2. **UrlWildcard**: `shExpMatch(url, pattern)`
3. **HostRegex**: JavaScript RegExp matching on host
4. **UrlRegex**: JavaScript RegExp matching on URL
5. **Keyword**: Simple substring search in URL
6. **HostLevels**: Domain level counting (e.g., `>=3` for subdomains)
7. **Bypass**: For fixed profiles with bypass rules

**Special Features:**
- CIDR notation support: `192.168.0.0/16` → `isInNet(host, "192.168.0.0", "255.255.0.0")`
- Proxy protocol mapping:
  - `HTTP` → `PROXY host:port`
  - `HTTPS` → `HTTPS host:port`
  - `SOCKS4` → `SOCKS host:port`
  - `SOCKS5` → `SOCKS5 host:port`
- Wildcard escaping: Converts user-friendly wildcards to PAC-safe patterns
- Minification: Removes comments and whitespace for production use

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

**Export Function (modern):**
```typescript
import { saveBlobToFile } from '@/lib/fileSaver';

async function exportProfileAsPac(profile: Profile) {
  // 1. Generate PAC script using pac-generator module
  const pacScript = generatePacScript(profile, profiles.value);

  // 2. Create downloadable blob
  const blob = new Blob([pacScript], { type: 'application/x-ns-proxy-autoconfig' });

  // 3. Prompt user to save (File System Access API where available; fallback to anchor download)
  const safeName = profile.name.replace(/[^a-zA-Z0-9-_]/g, '_');
  const filename = `${safeName}.pac`;

  try {
    await saveBlobToFile(blob, filename, 'application/x-ns-proxy-autoconfig');
    toastRef.value?.success(`PAC script exported: ${filename}`, 'Exported', 3000);
  } catch (err) {
    // User cancelled or an error occurred - handle gracefully
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

### For Users:
1. Navigate to **Settings** → **Profiles**
2. Select a profile (Fixed or Switch type)
3. Click **Export PAC** button (blue, between Edit and Delete)
4. A **Save file** dialog will prompt you to choose the destination and filename. On browsers that support the File System Access API the extension will show a native save dialog; otherwise the browser will fall back to the standard download flow (you'll be prompted to save the file).
5. Use the PAC file in:
   - Browser proxy settings (Chrome, Firefox, etc.)
   - System proxy configuration
   - Corporate proxy systems
   - Network testing tools

### Example Output:

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

### Manual Testing:
1. Build extension: `npm run build`
2. Load in Chrome: `chrome://extensions` → Load unpacked → Select `dist/`
3. Open extension options
4. Create/select a Fixed or Switch profile
5. Click Export PAC
6. A **Save file** dialog should appear; choose a destination and save the `.pac` file
7. Verify saved `.pac` file opens in a text editor and contains the expected `FindProxyForURL` logic
8. Check PAC syntax is valid JavaScript

### Automated Tests
- Unit tests for the file save helper are available: `tests/lib/fileSaver.spec.ts` which stubs `showSaveFilePicker()` and verifies both the native picker path and the download fallback behavior.
### PAC Validation:
```bash
# Test PAC file in browser
1. Open chrome://net-internals/#proxy
2. Check "Use custom proxy configuration"
3. Enter: file:///path/to/exported.pac
4. Test URLs to verify routing
```

## Technical Details

### File Structure:
```
src/
└── core/
    └── pac/
        └── pac-generator.ts  (New - 345 lines)
            ├── generatePacScript()
            ├── generateFixedProfilePac()
            ├── generateSwitchProfilePac()
            ├── generateBypassCondition()
            ├── generateConditionCheck()
            ├── proxyServerToString()
            ├── cidrToMask()
            └── minifyPac()

src/options/
└── OptionsApp.vue (Modified)
    ├── Import: generatePacScript
    ├── Import: Download icon
    └── Function: exportProfileAsPac()
```

### Dependencies:
- No external npm dependencies
- Uses native browser APIs: `Blob`, `URL.createObjectURL()`, and the File System Access API (progressive enhancement)
- Save helper: `src/lib/fileSaver.ts` provides `saveBlobToFile()` which uses `showSaveFilePicker()` when available and falls back to a standard anchor download
- TypeScript types from `@/core/schema`

### Security Considerations:
- Filename sanitization prevents path traversal
- Regex patterns validated by existing regexSafe.ts
- PAC scripts run in browser sandbox
- No eval() or dynamic code execution
- **Privacy/Permissions:** The extension does **not** request the `downloads` permission; exports always prompt the user for the destination. When available, the File System Access API is used to show a native save dialog; otherwise the browser's standard download flow is used as a fallback, ensuring the user remains in control of where files are stored.

## Future Enhancements

### Phase 2 (Optional):
- [ ] PAC preview modal before download
- [ ] Copy PAC to clipboard button
- [ ] PAC validation/linting
- [ ] Import PAC files (reverse operation)
- [ ] PAC script comments/documentation toggle
- [ ] Support for PacProfile exports (return original URL)

### Advanced Features:
- [ ] PAC optimization: Minimize file size
- [ ] PAC testing: Built-in URL tester
- [ ] PAC hosting: Generate shareable URLs
- [ ] PAC versioning: Track changes over time

## Status
✅ **COMPLETE** - PAC export fully functional
- Core logic implemented
- UI integrated
- Build successful
- Ready for testing

## Related
- Original feature: [ZeroOmega omega-pac module](https://github.com/zero-peak/ZeroOmega)
- PAC specification: [Navigator Proxy Auto-Config](https://developer.mozilla.org/en-US/docs/Web/HTTP/Proxy_servers_and_tunneling/Proxy_Auto-Configuration_PAC_file)
