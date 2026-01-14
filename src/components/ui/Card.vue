<template>
  <div
    :class="cardClass"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-unused-vars */
import { computed } from 'vue';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-lg border bg-white dark:bg-slate-900 transition-colors',
  {
    variants: {
      variant: {
        default: 'border-slate-200 dark:border-slate-800',
        outline: 'border-slate-300 dark:border-slate-700',
        ghost: 'border-transparent',
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
      },
      shadow: {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
        xl: 'shadow-xl',
      },
      hover: {
        none: '',
        lift: 'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200',
        glow: 'hover:shadow-blue-500/20 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      shadow: 'sm',
      hover: 'none',
    },
  }
);

interface Props {
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: 'none' | 'lift' | 'border';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  shadow: 'sm',
  hover: 'none',
});

const cardClass = computed(() =>
  cn(
    cardVariants({
      variant: props.variant,
      padding: props.padding,
      shadow: props.shadow,
      hover: props.hover,
    })
  )
);
</script>
