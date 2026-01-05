<template>
  <button
    @click="toggleTheme"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :class="buttonClass"
    class="theme-toggle"
  >
    <Transition name="theme-icon" mode="out-in">
      <Sun v-if="isDark" :key="'sun'" class="h-5 w-5" />
      <Moon v-else :key="'moon'" class="h-5 w-5" />
    </Transition>
  </button>
</template>

<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next';
import { useDark, useToggle } from '@vueuse/core';
import { computed } from 'vue';

interface Props {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'ghost',
  size: 'md',
});

const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
  storageKey: 'switchymalaccamax-theme',
  listenToStorageChanges: true,
});

const toggleTheme = useToggle(isDark);

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

const variantClasses = {
  default: 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600',
  ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800',
  outline: 'border border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800',
};

const buttonClass = computed(() => [
  'inline-flex items-center justify-center rounded-md transition-all duration-200',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
  sizeClasses[props.size],
  variantClasses[props.variant],
]);
</script>

<style scoped>
.theme-icon-enter-active,
.theme-icon-leave-active {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-icon-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.5);
}

.theme-icon-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.5);
}
</style>
