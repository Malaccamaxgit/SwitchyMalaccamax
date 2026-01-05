<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="ariaLabel"
    :disabled="disabled"
    :class="switchClass"
    @click="toggle"
  >
    <span :class="thumbClass" aria-hidden="true">
      <Transition name="icon-fade">
        <Check v-if="modelValue && showIcon" class="h-3 w-3 text-white" />
        <X v-else-if="!modelValue && showIcon" class="h-3 w-3 text-slate-400" />
      </Transition>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Check, X } from 'lucide-vue-next';

interface Props {
  modelValue: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
  showIcon?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showIcon: true,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  change: [value: boolean];
}>();

const switchClass = computed(() => [
  'relative inline-flex items-center rounded-full transition-all duration-200',
  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  
  // Size variants
  props.size === 'sm' && 'h-5 w-9',
  props.size === 'md' && 'h-6 w-11',
  props.size === 'lg' && 'h-7 w-14',
  
  // State variants
  props.modelValue
    ? 'bg-blue-600 dark:bg-blue-500'
    : 'bg-slate-300 dark:bg-slate-700',
  
  !props.disabled && 'cursor-pointer',
]);

const thumbClass = computed(() => [
  'inline-flex items-center justify-center rounded-full transition-all duration-200',
  'bg-white shadow-sm',
  
  // Size variants
  props.size === 'sm' && [
    'h-4 w-4',
    props.modelValue ? 'translate-x-4' : 'translate-x-0.5',
  ],
  props.size === 'md' && [
    'h-5 w-5',
    props.modelValue ? 'translate-x-5' : 'translate-x-0.5',
  ],
  props.size === 'lg' && [
    'h-6 w-6',
    props.modelValue ? 'translate-x-7' : 'translate-x-0.5',
  ],
]);

function toggle() {
  if (!props.disabled) {
    const newValue = !props.modelValue;
    emit('update:modelValue', newValue);
    emit('change', newValue);
  }
}
</script>

<style scoped>
.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: opacity 150ms ease;
}

.icon-fade-enter-from,
.icon-fade-leave-to {
  opacity: 0;
}
</style>
