/**
 * Utility functions for component styling and logic
 */
import { type ClassValue } from 'clsx';
/**
 * Merge Tailwind classes with conflict resolution
 * @param inputs - Class names to merge
 * @returns Merged class string
 */
export declare function cn(...inputs: ClassValue[]): string;
/**
 * Format timestamp to relative time
 * @param timestamp - Date or timestamp
 * @returns Relative time string (e.g., "2 minutes ago")
 */
export declare function formatRelativeTime(timestamp: Date | number): string;
/**
 * Format number with abbreviations (1K, 1M, etc.)
 * @param num - Number to format
 * @returns Formatted string
 */
export declare function formatCompactNumber(num: number): string;
/**
 * Debounce function calls
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export declare function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void;
/**
 * Throttle function calls
 * @param fn - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export declare function throttle<T extends (...args: any[]) => any>(fn: T, limit: number): (...args: Parameters<T>) => void;
/**
 * Generate unique ID
 * @param prefix - Optional prefix
 * @returns Unique ID string
 */
export declare function generateId(prefix?: string): string;
/**
 * Sleep/delay function
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after delay
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @returns Promise that resolves when copied
 */
export declare function copyToClipboard(text: string): Promise<void>;
/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param value - Value to check
 * @returns True if empty
 */
export declare function isEmpty(value: any): boolean;
//# sourceMappingURL=utils.d.ts.map