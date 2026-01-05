/**
 * Logger.ts - Centralized Logging System
 * 
 * Production-grade logging utility with configurable levels and Chrome Storage integration.
 * Supports real-time log level updates without page reloads.
 * 
 * @example Service Worker
 * ```typescript
 * import { Logger } from '@/utils/Logger';
 * Logger.info('Proxy switched', { profile: 'Company' });
 * Logger.error('Failed to apply proxy', { error });
 * ```
 * 
 * @example Vue Component
 * ```typescript
 * import { Logger } from '@/utils/Logger';
 * Logger.debug('Component mounted', { props });
 * Logger.warn('Deprecated feature used');
 * ```
 */

/**
 * Log level enumeration (from most verbose to silent)
 */
export enum LogLevel {
  DEBUG = 0,  // Verbose debugging information
  INFO = 1,   // Standard informational messages
  WARN = 2,   // Warning messages for potential issues
  ERROR = 3,  // Critical error messages
  NONE = 4    // Disable all logging
}

/**
 * Log level metadata for UI display
 */
export const LogLevelMetadata = {
  [LogLevel.DEBUG]: {
    name: 'Debug',
    description: 'Verbose logging for development and troubleshooting',
    color: '#60a5fa', // blue-400
    icon: '🔍'
  },
  [LogLevel.INFO]: {
    name: 'Info',
    description: 'Standard informational messages',
    color: '#10b981', // emerald-500
    icon: 'ℹ️'
  },
  [LogLevel.WARN]: {
    name: 'Warning',
    description: 'Warning messages for potential issues',
    color: '#f59e0b', // amber-500
    icon: '⚠️'
  },
  [LogLevel.ERROR]: {
    name: 'Error',
    description: 'Critical error messages only',
    color: '#ef4444', // red-500
    icon: '❌'
  },
  [LogLevel.NONE]: {
    name: 'None',
    description: 'Disable all logging (production mode)',
    color: '#6b7280', // gray-500
    icon: '🔇'
  }
};

/**
 * Chrome Storage key for log level
 */
const STORAGE_KEY = 'logLevel';

/**
 * Chrome Storage key for log max lines
 */
const STORAGE_KEY_MAX_LINES = 'logMaxLines';

/**
 * Chrome Storage key for persisted logs
 */
const STORAGE_KEY_LOGS = 'persistedLogs';

/**
 * Default log level (INFO for production, DEBUG for development)
 */
const DEFAULT_LOG_LEVEL = LogLevel.INFO;

/**
 * Default maximum lines for persisted logs
 */
const DEFAULT_MAX_LINES = 1000;

/**
 * Hard cap for maximum log lines (prevents storage quota issues)
 */
const HARD_CAP_MAX_LINES = 50000;

/**
 * Batch cleanup threshold (trim when exceeding by this percentage)
 */
const CLEANUP_THRESHOLD_PERCENT = 0.10; // 10%

/**
 * Maximum number of logs to keep in memory
 */
const MAX_LOG_BUFFER_SIZE = 500;

/**
 * Log entry interface for buffered logs
 */
export interface LogEntry {
  timestamp: string;
  level: string;
  component: string;
  message: string;
  data?: any;
}

/**
 * Logger class - Singleton pattern for centralized logging
 */
class LoggerService {
  private currentLevel: LogLevel = DEFAULT_LOG_LEVEL;
  private initialized: boolean = false;
  private componentPrefix: string = '';
  private logBuffer: LogEntry[] = [];
  private listeners: Set<(entry: LogEntry) => void> = new Set();
  private maxLines: number = DEFAULT_MAX_LINES;
  private persistedLogs: LogEntry[] = [];
  private persistenceQueue: LogEntry[] = [];
  private persistenceTimeout: number | null = null;

  constructor() {
    // Initialize asynchronously - will silently fail in test environments
    this.initialize().catch(() => {
      // Silently set initialized to true for test/Node.js environments
      this.initialized = true;
    });
  }

  /**
   * Initialize logger by loading log level from Chrome Storage
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Check if chrome API is available (not in Node.js test environment)
      if (typeof chrome === 'undefined' || !chrome.storage) {
        this.initialized = true;
        return;
      }

      // Load initial configuration from storage
      const result = await chrome.storage.local.get([
        STORAGE_KEY,
        STORAGE_KEY_MAX_LINES,
        STORAGE_KEY_LOGS
      ]);
      
      this.currentLevel = result[STORAGE_KEY] ?? DEFAULT_LOG_LEVEL;
      this.maxLines = Math.min(
        result[STORAGE_KEY_MAX_LINES] ?? DEFAULT_MAX_LINES,
        HARD_CAP_MAX_LINES
      );
      this.persistedLogs = result[STORAGE_KEY_LOGS] ?? [];
      
      // Set up listener for real-time updates
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local') {
          if (changes[STORAGE_KEY]) {
            const newLevel = changes[STORAGE_KEY].newValue;
            if (newLevel !== undefined) {
              this.currentLevel = newLevel;
              console.log(
                `%c[Logger] Log level changed: ${LogLevelMetadata[this.currentLevel].name}`,
                'color: #8b5cf6; font-weight: bold'
              );
            }
          }
          
          if (changes[STORAGE_KEY_MAX_LINES]) {
            const newMaxLines = changes[STORAGE_KEY_MAX_LINES].newValue;
            if (newMaxLines !== undefined) {
              this.maxLines = Math.min(newMaxLines, HARD_CAP_MAX_LINES);
              console.log(
                `%c[Logger] Max lines changed: ${this.maxLines}`,
                'color: #8b5cf6; font-weight: bold'
              );
              // Trigger cleanup if current logs exceed new limit
              this.trimPersistedLogs();
            }
          }
        }
      });

      this.initialized = true;
      this.debug('Logger initialized', { 
        level: LogLevelMetadata[this.currentLevel].name,
        maxLines: this.maxLines,
        persistedCount: this.persistedLogs.length
      });
    } catch (error) {
      // Only log initialization errors in browser environments, not in tests
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        console.error('[Logger] Failed to initialize:', error);
      }
      // Fallback to defaults if storage fails
      this.currentLevel = DEFAULT_LOG_LEVEL;
      this.maxLines = DEFAULT_MAX_LINES;
      this.initialized = true;
    }
  }

  /**
   * Set component-specific prefix for log messages
   * Useful for identifying log sources in large applications
   * 
   * @example
   * Logger.setComponentPrefix('Options');
   * Logger.info('Settings saved'); // [SwitchyMalaccamax:Options] Settings saved
   */
  setComponentPrefix(prefix: string): void {
    this.componentPrefix = prefix;
  }

  /**
   * Get the current log level
   */
  getCurrentLevel(): LogLevel {
    return this.currentLevel;
  }

  /**
   * Check if a log level should be emitted
   */
  private shouldLog(level: LogLevel): boolean {
    return this.initialized && level >= this.currentLevel;
  }

  /**
   * Format log message with optional prefix
   */
  private formatMessage(message: string): string {
    const prefix = this.componentPrefix 
      ? `[SwitchyMalaccamax:${this.componentPrefix}]` 
      : '[SwitchyMalaccamax]';
    return `${prefix} ${message}`;
  }

  /**
   * Format timestamp for logs
   */
  private getTimestamp(): string {
    const now = new Date();
    return now.toISOString().split('T')[1].split('.')[0]; // HH:MM:SS
  }

  /**
   * Add entry to log buffer
   */
  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    
    // Trim buffer if exceeds max size
    if (this.logBuffer.length > MAX_LOG_BUFFER_SIZE) {
      this.logBuffer.shift();
    }
    
    // Notify listeners
    this.listeners.forEach(listener => listener(entry));
    
    // Queue for persistence
    this.queueForPersistence(entry);
  }

  /**
   * Queue log entry for persistence to chrome.storage
   */
  private queueForPersistence(entry: LogEntry): void {
    this.persistenceQueue.push(entry);
    
    // Debounce persistence to avoid excessive storage writes
    if (this.persistenceTimeout !== null) {
      clearTimeout(this.persistenceTimeout);
    }
    
    this.persistenceTimeout = setTimeout(() => {
      this.flushPersistenceQueue();
    }, 1000) as unknown as number; // Batch writes every 1 second
  }

  /**
   * Flush queued logs to chrome.storage
   */
  private async flushPersistenceQueue(): Promise<void> {
    if (this.persistenceQueue.length === 0) return;
    
    try {
      // Add queued logs to persisted logs
      this.persistedLogs.push(...this.persistenceQueue);
      this.persistenceQueue = [];
      
      // Check if cleanup is needed (with batching threshold)
      const cleanupThreshold = this.maxLines * (1 + CLEANUP_THRESHOLD_PERCENT);
      if (this.persistedLogs.length > cleanupThreshold) {
        this.trimPersistedLogs();
      }
      
      // Save to storage
      await chrome.storage.local.set({
        [STORAGE_KEY_LOGS]: this.persistedLogs
      });
    } catch (error) {
      console.error('[Logger] Failed to persist logs:', error);
      // If storage fails, clear the queue to prevent memory buildup
      this.persistenceQueue = [];
    }
  }

  /**
   * Trim persisted logs to stay within maxLines limit (FIFO)
   */
  private trimPersistedLogs(): void {
    if (this.persistedLogs.length > this.maxLines) {
      // Remove oldest entries (FIFO)
      const excessCount = this.persistedLogs.length - this.maxLines;
      this.persistedLogs.splice(0, excessCount);
      
      console.log(
        `%c[Logger] Trimmed ${excessCount} old log entries`,
        'color: #f59e0b; font-weight: bold'
      );
    }
  }

  /**
   * Get all persisted log entries
   */
  getPersistedLogs(): LogEntry[] {
    return [...this.persistedLogs];
  }

  /**
   * Get all buffered log entries
   */
  getLogBuffer(): LogEntry[] {
    return [...this.logBuffer];
  }

  /**
   * Add listener for new log entries
   */
  addLogListener(callback: (entry: LogEntry) => void): () => void {
    this.listeners.add(callback);
    // Return unsubscribe function
    return () => this.listeners.delete(callback);
  }

  /**
   * Clear log buffer and persisted logs
   */
  async clearLogBuffer(): Promise<void> {
    this.logBuffer = [];
    this.persistedLogs = [];
    this.persistenceQueue = [];
    
    try {
      await chrome.storage.local.set({
        [STORAGE_KEY_LOGS]: []
      });
    } catch (error) {
      console.error('[Logger] Failed to clear persisted logs:', error);
    }
  }

  /**
   * DEBUG level logging - Verbose debugging information
   * Use for detailed tracing, variable dumps, and development insights
   * 
   * @param message - Log message
   * @param data - Optional data object to log
   */
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
    
    if (data !== undefined) {
      console.debug(
        `%c${this.getTimestamp()} ${formatted}`,
        'color: #60a5fa',
        data
      );
    } else {
      console.debug(`%c${this.getTimestamp()} ${formatted}`, 'color: #60a5fa');
    }
  }

  /**
   * INFO level logging - Standard informational messages
   * Use for significant events, state changes, and user actions
   * 
   * @param message - Log message
   * @param data - Optional data object to log
   */
  info(message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    
    const formatted = this.formatMessage(message);
    
    // Add to buffer
    this.addToBuffer({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      component: this.componentPrefix,
      message: formatted,
      data
    });
    
    if (data !== undefined) {
      console.log(
        `%c${this.getTimestamp()} ${formatted}`,
        'color: #10b981',
        data
      );
    } else {
      console.log(`%c${this.getTimestamp()} ${formatted}`, 'color: #10b981');
    }
  }

  /**
   * WARN level logging - Warning messages for potential issues
   * Use for deprecated features, recoverable errors, and attention-needed situations
   * 
   * @param message - Log message
   * @param data - Optional data object to log
   */
  warn(message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    
    const formatted = this.formatMessage(message);
    
    // Add to buffer
    this.addToBuffer({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      component: this.componentPrefix,
      message: formatted,
      data
    });
    
    if (data !== undefined) {
      console.warn(
        `%c${this.getTimestamp()} ${formatted}`,
        'color: #f59e0b; font-weight: bold',
        data
      );
    } else {
      console.warn(`%c${this.getTimestamp()} ${formatted}`, 'color: #f59e0b; font-weight: bold');
    }
  }

  /**
   * ERROR level logging - Critical error messages
   * Use for unrecoverable errors, exceptions, and system failures
   * 
   * @param message - Log message
   * @param data - Optional data object to log (typically Error objects)
   */
  error(message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    const formatted = this.formatMessage(message);
    
    // Add to buffer
    this.addToBuffer({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      component: this.componentPrefix,
      message: formatted,
      data
    });
    
    if (data !== undefined) {
      console.error(
        `%c${this.getTimestamp()} ${formatted}`,
        'color: #ef4444; font-weight: bold',
        data
      );
    } else {
      console.error(`%c${this.getTimestamp()} ${formatted}`, 'color: #ef4444; font-weight: bold');
    }
  }

  /**
   * Create a scoped logger instance with a specific component prefix
   * Useful for creating module-specific loggers
   * 
   * @param componentName - Component or module name
   * @returns New logger instance with prefix
   * 
   * @example
   * const pacLogger = Logger.scope('PAC Generator');
   * pacLogger.debug('Generating PAC script'); // [SwitchyMalaccamax:PAC Generator] ...
   */
  scope(componentName: string): LoggerService {
    const scoped = new LoggerService();
    scoped.currentLevel = this.currentLevel;
    scoped.initialized = this.initialized;
    scoped.componentPrefix = componentName;
    return scoped;
  }

  /**
   * Group related log messages together (collapsible in console)
   * 
   * @param groupName - Name of the log group
   * @param collapsed - Whether to start collapsed (default: false)
   */
  group(groupName: string, collapsed: boolean = false): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    if (collapsed) {
      console.groupCollapsed(`📦 ${groupName}`);
    } else {
      console.group(`📦 ${groupName}`);
    }
  }

  /**
   * End the current log group
   */
  groupEnd(): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    console.groupEnd();
  }

  /**
   * Log a performance timing measurement
   * 
   * @param label - Measurement label
   * @param duration - Duration in milliseconds
   */
  performance(label: string, duration: number): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    const formatted = this.formatMessage(`⏱️ ${label}`);
    console.log(
      `%c${this.getTimestamp()} ${formatted}: ${duration.toFixed(2)}ms`,
      'color: #8b5cf6; font-style: italic'
    );
  }

  /**
   * Table view for structured data (useful for arrays/objects)
   * 
   * @param data - Data to display as table
   * @param label - Optional label
   */
  table(data: any, label?: string): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    
    if (label) {
      console.log(`%c${this.formatMessage(label)}`, 'color: #60a5fa');
    }
    console.table(data);
  }
}

/**
 * Singleton logger instance
 */
export const Logger = new LoggerService();

/**
 * Utility function to set log level (for settings UI)
 * 
 * @param level - New log level to set
 * @returns Promise that resolves when level is saved
 */
export async function setLogLevel(level: LogLevel): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: level });
}

/**
 * Utility function to get current log level (for settings UI)
 * 
 * @returns Promise with current log level
 */
export async function getLogLevel(): Promise<LogLevel> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] ?? DEFAULT_LOG_LEVEL;
}

/**
 * Utility function to set max log lines (for settings UI)
 * 
 * @param maxLines - Maximum number of log lines to persist
 * @returns Promise that resolves when value is saved
 */
export async function setLogMaxLines(maxLines: number): Promise<void> {
  // Apply hard cap
  const cappedValue = Math.min(Math.max(maxLines, 10), HARD_CAP_MAX_LINES);
  await chrome.storage.local.set({ [STORAGE_KEY_MAX_LINES]: cappedValue });
}

/**
 * Utility function to get max log lines (for settings UI)
 * 
 * @returns Promise with current max log lines
 */
export async function getLogMaxLines(): Promise<number> {
  const result = await chrome.storage.local.get(STORAGE_KEY_MAX_LINES);
  return Math.min(result[STORAGE_KEY_MAX_LINES] ?? DEFAULT_MAX_LINES, HARD_CAP_MAX_LINES);
}
