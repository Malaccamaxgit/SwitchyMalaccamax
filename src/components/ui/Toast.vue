<template>
  <Teleport to="body">
    <div :class="containerClass">
      <TransitionGroup name="toast-list">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="getToastClass(toast)"
          role="alert"
          :aria-live="toast.variant === 'error' ? 'assertive' : 'polite'"
        >
          <div class="flex items-start gap-3">
            <component :is="getIcon(toast)" :class="getIconClass(toast)" />
            
            <div class="flex-1 min-w-0">
              <p v-if="toast.title" class="font-semibold text-sm">
                {{ toast.title }}
              </p>
              <p :class="toast.title ? 'text-xs mt-0.5' : 'text-sm'">
                {{ toast.message }}
              </p>
            </div>
            
            <button
              v-if="!toast.hideClose"
              type="button"
              class="flex-shrink-0 text-text-secondary hover:text-text-primary transition-colors"
              @click="removeToast(toast.id)"
              aria-label="Close notification"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
          
          <!-- Progress Bar -->
          <div
            v-if="toast.duration && toast.duration > 0"
            class="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10"
          >
            <div
              class="h-full bg-current opacity-30 transition-all ease-linear"
              :style="{ width: getProgress(toast) + '%' }"
            ></div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-vue-next';

export interface Toast {
  id: string;
  message: string;
  title?: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  hideClose?: boolean;
  createdAt?: number;
}

interface Props {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
}

const props = withDefaults(defineProps<Props>(), {
  position: 'bottom-right',
  maxToasts: 5,
});

const toasts = ref<Toast[]>([]);
const toastTimers = ref<Map<string, number>>(new Map());

const containerClass = computed(() => [
  'fixed z-[200] flex flex-col gap-3 p-4 pointer-events-none',
  'max-w-sm w-full',
  
  // Position variants
  props.position === 'top-right' && 'top-0 right-0',
  props.position === 'top-left' && 'top-0 left-0',
  props.position === 'bottom-right' && 'bottom-0 right-0',
  props.position === 'bottom-left' && 'bottom-0 left-0',
  props.position === 'top-center' && 'top-0 left-1/2 -translate-x-1/2',
  props.position === 'bottom-center' && 'bottom-0 left-1/2 -translate-x-1/2',
]);

function getToastClass(toast: Toast) {
  return [
    'relative flex flex-col bg-bg-primary border rounded-lg shadow-xl p-4',
    'pointer-events-auto',
    'overflow-hidden',
    
    // Variant colors
    toast.variant === 'success' && 'border-green-500 text-green-900 dark:text-green-100',
    toast.variant === 'error' && 'border-red-500 text-red-900 dark:text-red-100',
    toast.variant === 'warning' && 'border-amber-500 text-amber-900 dark:text-amber-100',
    toast.variant === 'info' && 'border-blue-500 text-blue-900 dark:text-blue-100',
    !toast.variant && 'border-border',
  ];
}

function getIcon(toast: Toast) {
  switch (toast.variant) {
    case 'success': return CheckCircle;
    case 'error': return AlertCircle;
    case 'warning': return AlertTriangle;
    case 'info': return Info;
    default: return Info;
  }
}

function getIconClass(toast: Toast) {
  return [
    'h-5 w-5 flex-shrink-0',
    toast.variant === 'success' && 'text-green-600 dark:text-green-400',
    toast.variant === 'error' && 'text-red-600 dark:text-red-400',
    toast.variant === 'warning' && 'text-amber-600 dark:text-amber-400',
    toast.variant === 'info' && 'text-blue-600 dark:text-blue-400',
  ];
}

function getProgress(toast: Toast) {
  if (!toast.duration || !toast.createdAt) return 100;
  
  const elapsed = Date.now() - toast.createdAt;
  const remaining = Math.max(0, toast.duration - elapsed);
  return (remaining / toast.duration) * 100;
}

function addToast(toast: Omit<Toast, 'id' | 'createdAt'>) {
  const id = `toast-${Date.now()}-${Math.random()}`;
  const newToast: Toast = {
    ...toast,
    id,
    createdAt: Date.now(),
    duration: toast.duration ?? 5000,
  };
  
  // Remove oldest if max reached
  if (toasts.value.length >= props.maxToasts) {
    const oldest = toasts.value[0];
    removeToast(oldest.id);
  }
  
  toasts.value.push(newToast);
  
  // Auto remove after duration
  if (newToast.duration && newToast.duration > 0) {
    const timer = window.setTimeout(() => {
      removeToast(id);
    }, newToast.duration);
    
    toastTimers.value.set(id, timer);
  }
  
  return id;
}

function removeToast(id: string) {
  const index = toasts.value.findIndex(t => t.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
  
  // Clear timer
  const timer = toastTimers.value.get(id);
  if (timer) {
    clearTimeout(timer);
    toastTimers.value.delete(id);
  }
}

function clearAll() {
  toasts.value = [];
  toastTimers.value.forEach(timer => clearTimeout(timer));
  toastTimers.value.clear();
}

// Expose methods
defineExpose({
  addToast,
  removeToast,
  clearAll,
  success: (message: string, title?: string, duration?: number) =>
    addToast({ message, title, variant: 'success', duration }),
  error: (message: string, title?: string, duration?: number) =>
    addToast({ message, title, variant: 'error', duration }),
  warning: (message: string, title?: string, duration?: number) =>
    addToast({ message, title, variant: 'warning', duration }),
  info: (message: string, title?: string, duration?: number) =>
    addToast({ message, title, variant: 'info', duration }),
});
</script>

<style scoped>
.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-list-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-list-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.toast-list-move {
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
