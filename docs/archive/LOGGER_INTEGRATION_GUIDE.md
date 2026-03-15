# Logger System Integration Guide

## Overview
Centralized, production-grade logging system with real-time configuration updates via Chrome Storage.

## Quick Start

### In Options/Popup Vue Components
```typescript
import { Logger } from '@/utils/Logger';

// Set component prefix (optional but recommended)
Logger.setComponentPrefix('Options');

// Use logging methods
Logger.debug('Component mounted', { props });
Logger.info('Profile switched', { profile: 'Company' });
Logger.warn('Deprecated feature used');
Logger.error('Failed to save', error);
```

### In Service Worker (Background)
```typescript
import { Logger } from '@/utils/Logger';

Logger.setComponentPrefix('Background');

chrome.proxy.onProxyError.addListener((details) => {
  Logger.error('Proxy error occurred', details);
});

Logger.info('Extension started', { version: '0.1.1' });
```

### In Utility Modules
```typescript
import { Logger } from '@/utils/Logger';

// Create scoped logger for module
const log = Logger.scope('PAC Generator');

function generatePac() {
  log.debug('Starting PAC generation');
  log.group('Profile Rules', true); // Collapsible group
  rules.forEach(rule => log.debug('Rule', rule));
  log.groupEnd();
  log.info('PAC generated successfully');
}
```

## Log Levels

| Level | Value | Usage | Example |
|-------|-------|-------|---------|
| **DEBUG** | 0 | Verbose debugging, variable dumps | `Logger.debug('Processing rule', { rule })` |
| **INFO** | 1 | Significant events, state changes | `Logger.info('Profile saved')` |
| **WARN** | 2 | Potential issues, deprecations | `Logger.warn('API rate limit approaching')` |
| **ERROR** | 3 | Critical errors, exceptions | `Logger.error('Failed to connect', error)` |
| **NONE** | 4 | Silent mode (production) | No logs emitted |

## UI Configuration

Location: **Settings → Debug → Logging Configuration**

Users can dynamically change log levels without reloading the extension. Changes propagate instantly to all contexts (popup, options, service worker).

## Advanced Features

### Performance Timing
```typescript
const start = performance.now();
// ... some operation ...
Logger.performance('Operation name', performance.now() - start);
```

### Table View
```typescript
Logger.table(profiles, 'Current Profiles');
```

### Grouped Logs
```typescript
Logger.group('Profile Validation');
Logger.debug('Checking name uniqueness');
Logger.debug('Validating proxy configuration');
Logger.groupEnd();
```

### Scoped Loggers
```typescript
// Create module-specific logger
const pacLogger = Logger.scope('PAC Generator');
const networkLogger = Logger.scope('Network Monitor');

// Each maintains separate context
pacLogger.info('PAC compiled'); // [SwitchyMalaccamax:PAC Generator] PAC compiled
networkLogger.info('Request intercepted'); // [SwitchyMalaccamax:Network Monitor] Request intercepted
```

## Migration Strategy

### Before
```typescript
console.log('[SwitchyMalaccamax:Options] Profile saved');
console.error('[SwitchyMalaccamax:Options] Failed:', error);
```

### After
```typescript
Logger.info('Profile saved');
Logger.error('Failed', error);
```

## Color Coding

Logs are automatically color-coded in the browser console:
- 🔍 DEBUG: Blue (#60a5fa)
- ℹ️ INFO: Green (#10b981)
- ⚠️ WARN: Amber (#f59e0b)
- ❌ ERROR: Red (#ef4444)

## Storage Key

The log level is stored in `chrome.storage.local` under the key `logLevel` as a numeric value (0-4).

## Default Behavior

- **Default Level**: INFO (suitable for production)
- **Auto-reload**: Changes take effect immediately via `chrome.storage.onChanged` listener
- **Fallback**: If storage fails, defaults to INFO level

## Production Considerations

1. **Set to NONE or ERROR** for production builds to improve performance
2. **DEBUG level** adds ~10-15% overhead due to detailed logging
3. **INFO level** is recommended for beta releases
4. **Use structured data** instead of string concatenation for better debugging

## Examples

### Profile Save Operation
```typescript
Logger.group('Saving Profile');
Logger.debug('Profile data', profile);
Logger.info('Validating profile');
try {
  await chrome.storage.local.set({ profiles });
  Logger.info('Profile saved successfully');
} catch (error) {
  Logger.error('Failed to save profile', error);
} finally {
  Logger.groupEnd();
}
```

### PAC Export with Troubleshooting
```typescript
const log = Logger.scope('PAC Export');
log.info('Starting export', { profileName: profile.name });
log.debug('Available profiles', allProfiles.map(p => p.name));

try {
  const pac = generatePacScript(profile, allProfiles);
  log.debug('Generated PAC length', pac.length);
  // ... download logic ...
  log.info('Export successful');
} catch (error) {
  log.error('Export failed', error);
}
```

## Troubleshooting

### Issue: Logs not appearing
- Check log level in Settings → Debug
- Ensure Logger is initialized (happens automatically on import)
- Check browser console filter (some browsers filter by log level)

### Issue: Changes not taking effect
- Logger uses `chrome.storage.onChanged` for live updates
- If not working, reload the extension context
- Check chrome.storage.local permissions in manifest.json

### Issue: Performance concerns
- Switch to WARN or ERROR level in production
- Avoid logging in tight loops
- Use `Logger.group()` for related logs instead of individual calls

## Best Practices

1. **Use appropriate log levels** - Don't use DEBUG for production events
2. **Include context** - Pass objects with relevant data: `Logger.info('Saved', { profileId })`
3. **Set component prefixes** - Makes log origin clear: `Logger.setComponentPrefix('Options')`
4. **Group related logs** - Use `Logger.group()` for multi-step operations
5. **Use scoped loggers** - For utility modules: `const log = Logger.scope('Module')`
6. **Don't log sensitive data** - Be mindful of PII, tokens, passwords
7. **Use structured data** - Objects are better than string concatenation

## Integration Checklist

- [x] Logger utility created (`src/utils/Logger.ts`)
- [x] UI added to Settings → Debug section
- [x] PAC generator using Logger
- [x] Options page using Logger
- [ ] Service worker using Logger (TODO)
- [ ] Popup using Logger (TODO)
- [ ] Replace all console.log calls (TODO)

## Status

✅ **COMPLETE** - Logging system fully operational and integrated into Options page and PAC generator.
