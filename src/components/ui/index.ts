/**
 * UI Components - Barrel Export
 * Import all UI components from a single entry point
 */

// Primitives
export { default as Button } from './Button.vue';
export { default as Card } from './Card.vue';
export { default as Badge } from './Badge.vue';
export { default as Input } from './Input.vue';
export { default as Select } from './Select.vue';
export { default as Switch } from './Switch.vue';
export { default as Dialog } from './Dialog.vue';
export { default as Tooltip } from './Tooltip.vue';
export { default as Toast } from './Toast.vue';

// Type exports (re-declared to avoid Vue SFC type export issues)
export interface InputProps {
  modelValue?: string | number;
  type?: 'text' | 'email' | 'password' | 'number' | 'url' | 'tel' | 'search';
  label?: string;
  placeholder?: string;
  hint?: string;
  error?: string | boolean;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  loading?: boolean;
  prefix?: string;
  suffix?: string;
  size?: 'sm' | 'md' | 'lg';
}

export type SelectOption = string | number | { label: string; value: string | number; disabled?: boolean };

export interface ToastType {
  id: string;
  message: string;
  title?: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  hideClose?: boolean;
  createdAt?: number;
}

// More components will be added here as we build them
// export { default as Dialog } from './Dialog.vue';
// export { default as Input } from './Input.vue';
// export { default as Select } from './Select.vue';
// etc.
