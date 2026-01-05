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
export declare enum LogLevel {
    DEBUG = 0,// Verbose debugging information
    INFO = 1,// Standard informational messages
    WARN = 2,// Warning messages for potential issues
    ERROR = 3,// Critical error messages
    NONE = 4
}
/**
 * Log level metadata for UI display
 */
export declare const LogLevelMetadata: {
    0: {
        name: string;
        description: string;
        color: string;
        icon: string;
    };
    1: {
        name: string;
        description: string;
        color: string;
        icon: string;
    };
    2: {
        name: string;
        description: string;
        color: string;
        icon: string;
    };
    3: {
        name: string;
        description: string;
        color: string;
        icon: string;
    };
    4: {
        name: string;
        description: string;
        color: string;
        icon: string;
    };
};
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
declare class LoggerService {
    private currentLevel;
    private initialized;
    private componentPrefix;
    private logBuffer;
    private listeners;
    private maxLines;
    private persistedLogs;
    private persistenceQueue;
    private persistenceTimeout;
    constructor();
    /**
     * Initialize logger by loading log level from Chrome Storage
     */
    private initialize;
    /**
     * Set component-specific prefix for log messages
     * Useful for identifying log sources in large applications
     *
     * @example
     * Logger.setComponentPrefix('Options');
     * Logger.info('Settings saved'); // [SwitchyMalaccamax:Options] Settings saved
     */
    setComponentPrefix(prefix: string): void;
    /**
     * Get the current log level
     */
    getCurrentLevel(): LogLevel;
    /**
     * Check if a log level should be emitted
     */
    private shouldLog;
    /**
     * Format log message with optional prefix
     */
    private formatMessage;
    /**
     * Format timestamp for logs
     */
    private getTimestamp;
    /**
     * Add entry to log buffer
     */
    private addToBuffer;
    /**
     * Queue log entry for persistence to chrome.storage
     */
    private queueForPersistence;
    /**
     * Flush queued logs to chrome.storage
     */
    private flushPersistenceQueue;
    /**
     * Trim persisted logs to stay within maxLines limit (FIFO)
     */
    private trimPersistedLogs;
    /**
     * Get all persisted log entries
     */
    getPersistedLogs(): LogEntry[];
    /**
     * Get all buffered log entries
     */
    getLogBuffer(): LogEntry[];
    /**
     * Add listener for new log entries
     */
    addLogListener(callback: (entry: LogEntry) => void): () => void;
    /**
     * Clear log buffer and persisted logs
     */
    clearLogBuffer(): Promise<void>;
    /**
     * DEBUG level logging - Verbose debugging information
     * Use for detailed tracing, variable dumps, and development insights
     *
     * @param message - Log message
     * @param data - Optional data object to log
     */
    debug(message: string, data?: any): void;
    /**
     * INFO level logging - Standard informational messages
     * Use for significant events, state changes, and user actions
     *
     * @param message - Log message
     * @param data - Optional data object to log
     */
    info(message: string, data?: any): void;
    /**
     * WARN level logging - Warning messages for potential issues
     * Use for deprecated features, recoverable errors, and attention-needed situations
     *
     * @param message - Log message
     * @param data - Optional data object to log
     */
    warn(message: string, data?: any): void;
    /**
     * ERROR level logging - Critical error messages
     * Use for unrecoverable errors, exceptions, and system failures
     *
     * @param message - Log message
     * @param data - Optional data object to log (typically Error objects)
     */
    error(message: string, data?: any): void;
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
    scope(componentName: string): LoggerService;
    /**
     * Group related log messages together (collapsible in console)
     *
     * @param groupName - Name of the log group
     * @param collapsed - Whether to start collapsed (default: false)
     */
    group(groupName: string, collapsed?: boolean): void;
    /**
     * End the current log group
     */
    groupEnd(): void;
    /**
     * Log a performance timing measurement
     *
     * @param label - Measurement label
     * @param duration - Duration in milliseconds
     */
    performance(label: string, duration: number): void;
    /**
     * Table view for structured data (useful for arrays/objects)
     *
     * @param data - Data to display as table
     * @param label - Optional label
     */
    table(data: any, label?: string): void;
}
/**
 * Singleton logger instance
 */
export declare const Logger: LoggerService;
/**
 * Utility function to set log level (for settings UI)
 *
 * @param level - New log level to set
 * @returns Promise that resolves when level is saved
 */
export declare function setLogLevel(level: LogLevel): Promise<void>;
/**
 * Utility function to get current log level (for settings UI)
 *
 * @returns Promise with current log level
 */
export declare function getLogLevel(): Promise<LogLevel>;
/**
 * Utility function to set max log lines (for settings UI)
 *
 * @param maxLines - Maximum number of log lines to persist
 * @returns Promise that resolves when value is saved
 */
export declare function setLogMaxLines(maxLines: number): Promise<void>;
/**
 * Utility function to get max log lines (for settings UI)
 *
 * @returns Promise with current max log lines
 */
export declare function getLogMaxLines(): Promise<number>;
export {};
//# sourceMappingURL=Logger.d.ts.map