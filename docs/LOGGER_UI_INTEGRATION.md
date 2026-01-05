# Logger UI Integration

## Overview
This document describes the implementation of log buffering and UI integration for the SwitchyMalaccamax extension's logging system.

## Problem Statement
The extension had two disconnected systems:
1. **Logger Utility** (`src/utils/Logger.ts`) - Wrote logs only to browser console
2. **UI Logs Array** (`src/options/OptionsApp.vue`) - Local array that was never populated

Result: The Logs UI in the Settings page appeared empty despite active logging throughout the extension.

## Solution Implemented

### 1. Logger System Enhancement

#### Added Log Buffering Infrastructure
**File:** `src/utils/Logger.ts`

```typescript
// Maximum number of log entries to keep in buffer
const MAX_LOG_BUFFER_SIZE = 500;

// Log entry interface for structured logging
export interface LogEntry {
  timestamp: string;    // ISO timestamp
  level: string;        // DEBUG, INFO, WARN, ERROR
  component: string;    // Component name (e.g., "PacCompiler")
  message: string;      // Log message
  data?: any;          // Optional structured data
}

class LoggerService {
  private logBuffer: LogEntry[] = [];
  private listeners: Set<(entry: LogEntry) => void> = new Set();
}
```

#### Implemented Buffer Management Methods
```typescript
// Add entry to buffer with size management
private addToBuffer(entry: LogEntry): void {
  this.logBuffer.push(entry);
  
  // Keep buffer size under limit
  if (this.logBuffer.length > MAX_LOG_BUFFER_SIZE) {
    this.logBuffer.shift(); // Remove oldest entry
  }
  
  // Notify all listeners
  this.listeners.forEach(listener => listener(entry));
}

// Get all buffered log entries
getLogBuffer(): LogEntry[] {
  return [...this.logBuffer]; // Return copy
}

// Subscribe to new log entries
addLogListener(callback: (entry: LogEntry) => void): () => void {
  this.listeners.add(callback);
  return () => this.listeners.delete(callback); // Unsubscribe function
}

// Clear all buffered logs
clearLogBuffer(): void {
  this.logBuffer = [];
}
```

#### Updated Logging Methods
All logging methods (`debug`, `info`, `warn`, `error`) now call `addToBuffer()`:

```typescript
debug(message: string, data?: any): void {
  if (!this.shouldLog(LogLevel.DEBUG)) return;
  
  const formatted = this.formatMessage(message);
  
  // Add to buffer
  this.addToBuffer({
    timestamp: new Date().toISOString(),
    level: 'DEBUG',
    component: this.componentPrefix,
    message: formatted,
    data
  });
  
  // Also log to console
  console.debug(`%c${this.getTimestamp()} ${formatted}`, 'color: #60a5fa', data);
}
```

### 2. UI Integration

#### Connected Logs to Logger Buffer
**File:** `src/options/OptionsApp.vue`

```typescript
// Updated logs ref to include component field
const logs = ref<Array<{ 
  timestamp: string; 
  level: string; 
  component: string; 
  message: string; 
  data?: any 
}>>([]);

// Initialize logs from Logger buffer
logs.value = Logger.getLogBuffer();

// Subscribe to new log entries
Logger.addLogListener((entry) => {
  logs.value.unshift(entry); // Add to beginning
  if (logs.value.length > maxLogs) {
    logs.value = logs.value.slice(0, maxLogs);
  }
});
```

#### Updated addLog Helper Function
The `addLog()` function now delegates to Logger:

```typescript
function addLog(level: string, message: string, data?: any) {
  // Delegate to Logger system which handles buffering
  switch (level.toLowerCase()) {
    case 'debug':
      Logger.debug(message, data);
      break;
    case 'info':
    case 'success':
      Logger.info(message, data);
      break;
    case 'warn':
    case 'warning':
      Logger.warn(message, data);
      break;
    case 'error':
      Logger.error(message, data);
      break;
    default:
      Logger.info(message, data);
  }
}
```

#### Updated clearLogs Function
```typescript
function clearLogs() {
  Logger.clearLogBuffer();
  logs.value = [];
  Logger.info('Logs cleared');
}
```

### 3. UI Consolidation

#### Combined "Logs" and "Debug" Menu Items
**Before:**
```typescript
const settingsNav = [
  { id: 'interface', label: 'Interface', icon: Settings },
  { id: 'general', label: 'General', icon: Globe },
  { id: 'import-export', label: 'Import/Export', icon: FileText },
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'logs', label: 'Logs', icon: FileText },     // Separate
  { id: 'debug', label: 'Debug', icon: Bug },        // Separate
];
```

**After:**
```typescript
const settingsNav = [
  { id: 'interface', label: 'Interface', icon: Settings },
  { id: 'general', label: 'General', icon: Globe },
  { id: 'import-export', label: 'Import/Export', icon: FileText },
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'debug', label: 'Debug & Logs', icon: Bug }, // Combined
];
```

#### Merged UI Views
The Debug view now includes:
1. **Logging Configuration** - Log level selector (DEBUG, INFO, WARN, ERROR, NONE)
2. **Log Viewer** - Display all captured logs with export/clear controls
3. **Proxy Conflict Testing** - Test mode for UI conflict warnings

**Log Viewer Features:**
- Displays timestamp, log level, component, and message
- Color-coded by level (DEBUG=gray, INFO=green, WARN=yellow, ERROR=red)
- Shows component name to identify log source
- Displays structured data objects
- Export to file with configurable row count
- Clear buffer button
- Shows current buffer size

```vue
<div 
  v-for="(log, index) in logs" 
  :key="index"
  :class="{
    'text-red-600 dark:text-red-400': log.level === 'ERROR',
    'text-emerald-600 dark:text-emerald-400': log.level === 'INFO',
    'text-yellow-600 dark:text-yellow-400': log.level === 'WARN',
    'text-slate-500 dark:text-zinc-500': log.level === 'DEBUG'
  }"
>
  <span>[{{ new Date(log.timestamp).toLocaleTimeString() }}]</span>
  <span>[{{ log.level }}]</span>
  <span>[{{ log.component }}]</span>
  <span>{{ log.message }}</span>
  <div v-if="log.data">
    {{ typeof log.data === 'object' ? JSON.stringify(log.data, null, 2) : log.data }}
  </div>
</div>
```

## Benefits

### For Users
1. **Visible Logging** - Can now see logs in the UI without opening DevTools
2. **Better Debugging** - Export logs to file for bug reports
3. **Component Identification** - See which part of the extension generated each log
4. **Simplified Navigation** - One "Debug & Logs" menu item instead of two

### For Developers
1. **Centralized Logging** - Single source of truth for all logs
2. **Real-time Updates** - Listener pattern ensures UI updates automatically
3. **Buffer Management** - Automatic size limiting prevents memory issues
4. **Type Safety** - LogEntry interface ensures consistent log structure
5. **Backward Compatibility** - Existing `addLog()` calls still work

## Usage Example

### In Extension Code
```typescript
import { Logger } from '@/utils/Logger';

// Create scoped logger
const logger = Logger.scope('MyComponent');

// Log at different levels
logger.debug('Detailed debug info', { details: 'data' });
logger.info('Something happened', { count: 42 });
logger.warn('Potential issue detected');
logger.error('Something went wrong', error);
```

### In Options UI
```typescript
// Logs automatically appear in UI
// No need to manually call addLog()

// Export logs to file
await exportLogsToFile(); // Exports last N logs as configured

// Clear logs
clearLogs(); // Clears buffer and UI
```

## Testing

### Verify Logging Works
1. Open extension options page
2. Navigate to "Debug & Logs"
3. Change log level to "Debug"
4. Perform actions in the extension (switch profiles, save settings, etc.)
5. Verify logs appear in the Log Viewer section
6. Check that timestamp, level, component, and message are displayed
7. Test export functionality
8. Test clear functionality

### Verify Real-time Updates
1. Keep options page open
2. Open popup in another window
3. Perform actions in popup
4. Verify logs appear immediately in options page Log Viewer

## File Changes Summary

### Modified Files
1. **src/utils/Logger.ts** (463 lines)
   - Added LogEntry interface
   - Added log buffer and listeners
   - Implemented buffer management methods
   - Updated all logging methods to populate buffer

2. **src/options/OptionsApp.vue** (1,713 lines)
   - Connected logs array to Logger buffer
   - Added listener for real-time updates
   - Updated addLog() to delegate to Logger
   - Updated clearLogs() to use Logger.clearLogBuffer()
   - Combined "Logs" and "Debug" menu items
   - Merged UI views into single "Debug & Logs" view
   - Updated log display to show component field
   - Fixed log level color coding

## Future Enhancements

### Potential Improvements
1. **Log Filtering** - Filter by level, component, or search term
2. **Log Persistence** - Save logs to chrome.storage for cross-session debugging
3. **Log Analytics** - Aggregate error counts, performance metrics
4. **Export Formats** - Support JSON, CSV export formats
5. **Log Streaming** - WebSocket streaming for external log viewers
6. **Performance Monitoring** - Track method execution times

### Migration Notes
- All existing logging code works without changes
- The `addLog()` function is maintained for backward compatibility
- Extension components using `Logger` automatically benefit from buffering
- No breaking changes to the Logger API

## Conclusion
The Logger UI integration successfully connects the centralized logging system to the user interface, providing visibility into extension behavior and improving the debugging experience for both users and developers.
