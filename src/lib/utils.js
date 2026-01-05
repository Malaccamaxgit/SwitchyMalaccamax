/**
 * Utility functions for component styling and logic
 */
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
/**
 * Merge Tailwind classes with conflict resolution
 * @param inputs - Class names to merge
 * @returns Merged class string
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
/**
 * Format timestamp to relative time
 * @param timestamp - Date or timestamp
 * @returns Relative time string (e.g., "2 minutes ago")
 */
export function formatRelativeTime(timestamp) {
    const now = Date.now();
    const time = timestamp instanceof Date ? timestamp.getTime() : timestamp;
    const diff = now - time;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (seconds < 60)
        return 'Just now';
    if (minutes < 60)
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24)
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7)
        return `${days} day${days > 1 ? 's' : ''} ago`;
    return new Date(time).toLocaleDateString();
}
/**
 * Format number with abbreviations (1K, 1M, etc.)
 * @param num - Number to format
 * @returns Formatted string
 */
export function formatCompactNumber(num) {
    if (num < 1000)
        return num.toString();
    if (num < 1000000)
        return `${(num / 1000).toFixed(1)}K`;
    if (num < 1000000000)
        return `${(num / 1000000).toFixed(1)}M`;
    return `${(num / 1000000000).toFixed(1)}B`;
}
/**
 * Debounce function calls
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce(fn, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}
/**
 * Throttle function calls
 * @param fn - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle(fn, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
/**
 * Generate unique ID
 * @param prefix - Optional prefix
 * @returns Unique ID string
 */
export function generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
/**
 * Sleep/delay function
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after delay
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Copy text to clipboard
 * @param text - Text to copy
 * @returns Promise that resolves when copied
 */
export async function copyToClipboard(text) {
    if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
    }
    else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}
/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 * @param value - Value to check
 * @returns True if empty
 */
export function isEmpty(value) {
    if (value === null || value === undefined)
        return true;
    if (typeof value === 'string')
        return value.trim().length === 0;
    if (Array.isArray(value))
        return value.length === 0;
    if (typeof value === 'object')
        return Object.keys(value).length === 0;
    return false;
}
//# sourceMappingURL=utils.js.map