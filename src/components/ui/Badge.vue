<template>
  <span
    :class="badgeClass"
    v-bind="$attrs"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-unused-vars */
import { computed } from 'vue';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        secondary: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        outline: 'border border-current bg-transparent',
      },
      size: {
        xs: 'px-1.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  }
);

interface Props {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
});

const badgeClass = computed(() =>
  cn(badgeVariants({ variant: props.variant, size: props.size }))
);
</script>
