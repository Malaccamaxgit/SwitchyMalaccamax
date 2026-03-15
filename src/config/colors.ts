/**
 * colors.ts - Shared color configuration
 *
 * Centralized color constants used across the application
 * to ensure consistency and avoid duplication.
 */

/**
 * Profile color mapping - maps profile color name to hex value
 */
export const PROFILE_COLORS: Record<string, string> = {
  gray: '#9ca3af',
  blue: '#3b82f6',
  green: '#22c55e',
  red: '#ef4444',
  yellow: '#eab308',
  purple: '#a855f7',
};

/**
 * Default profile color (fallback when color is not set)
 */
export const DEFAULT_PROFILE_COLOR = 'blue';

/**
 * Icon background colors for different proxy modes
 */
export const ICON_COLORS = {
  direct: '#10b981',    // emerald-500
  system: '#6b7280',    // gray-500
  fixed: '#3b82f6',     // blue-500
  switch: '#a855f7',    // purple-500
  pac: '#8b5cf6',       // violet-500
  conflict: '#ef4444',  // red-500
  warning: '#f59e0b',   // amber-500
};

/**
 * Badge colors for status indicators
 */
export const BADGE_COLORS = {
  error: '#DC2626',     // red-600
  warning: '#F59E0B',   // amber-500
  success: '#10b981',   // emerald-500
  transparent: [0, 0, 0, 0],
};

/**
 * Get profile color by name
 */
export function getProfileColor(colorName?: string): string {
  return PROFILE_COLORS[colorName || DEFAULT_PROFILE_COLOR] || PROFILE_COLORS[DEFAULT_PROFILE_COLOR];
}
