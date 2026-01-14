<template>
  <button
    :class="buttonClass"
    :disabled="disabled || loading"
    :aria-busy="loading"
    :type="type"
    v-bind="$attrs"
  >
    <span
      v-if="loading"
      class="spinner"
      aria-hidden="true"
    >
      <svg
        class="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </span>
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-unused-vars */
import { computed } from 'vue';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-emerald-500 text-white hover:bg-emerald-600 focus-visible:ring-emerald-500',
        secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600',
        ghost: 'hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100',
        outline: 'border border-gray-300 dark:border-zinc-700 bg-white dark:bg-transparent text-slate-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800',
        destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
        success: 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500',
        link: 'bg-emerald-500 text-white hover:bg-emerald-600 underline-offset-4',
      },
      size: {
        xs: 'h-7 px-2 text-xs',
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-11 px-6 text-lg',
        xl: 'h-12 px-8 text-xl',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

interface Props {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
});

const buttonClass = computed(() =>
  cn(buttonVariants({ variant: props.variant, size: props.size }))
);
</script>

<style scoped>
.spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
