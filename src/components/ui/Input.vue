<template>
  <div class="input-wrapper">
    <label v-if="label" :for="inputId" :class="labelClass">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <div class="relative">
      <!-- Prefix Icon/Text -->
      <div v-if="$slots.prefix || prefix" class="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
        <slot name="prefix">
          <span class="text-text-tertiary text-sm">{{ prefix }}</span>
        </slot>
      </div>
      
      <!-- Input Element -->
      <input
        :id="inputId"
        ref="inputRef"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :class="inputClass"
        :aria-invalid="hasError"
        :aria-describedby="hasError ? `${inputId}-error` : hasHint ? `${inputId}-hint` : undefined"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />
      
      <!-- Suffix Icon/Text -->
      <div v-if="$slots.suffix || suffix || showPasswordToggle" :class="suffixClass">
        <Button
          v-if="showPasswordToggle"
          type="button"
          variant="ghost"
          size="icon"
          class="h-7 w-7"
          @click="togglePasswordVisibility"
          :aria-label="passwordVisible ? 'Hide password' : 'Show password'"
        >
          <Eye v-if="!passwordVisible" class="h-4 w-4" />
          <EyeOff v-else class="h-4 w-4" />
        </Button>
        <slot name="suffix">
          <span v-if="suffix" class="text-text-tertiary text-sm">{{ suffix }}</span>
        </slot>
      </div>
      
      <!-- Loading Spinner -->
      <div v-if="loading" class="absolute right-3 top-1/2 -translate-y-1/2">
        <div class="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    </div>
    
    <!-- Hint Text -->
    <p v-if="hint && !hasError" :id="`${inputId}-hint`" class="mt-1.5 text-xs text-text-tertiary">
      {{ hint }}
    </p>
    
    <!-- Error Message -->
    <p v-if="hasError" :id="`${inputId}-error`" class="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
      <AlertCircle class="h-3 w-3" />
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Eye, EyeOff, AlertCircle } from 'lucide-vue-next';
import Button from './Button.vue';
import { generateId } from '@/lib/utils';

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

const props = withDefaults(defineProps<InputProps>(), {
  type: 'text',
  size: 'md',
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
}>();

const inputRef = ref<HTMLInputElement>();
const passwordVisible = ref(false);
const isFocused = ref(false);

const inputId = computed(() => generateId('input'));

const showPasswordToggle = computed(() => props.type === 'password');

const inputType = computed(() => {
  if (props.type === 'password' && passwordVisible.value) {
    return 'text';
  }
  return props.type;
});

const hasError = computed(() => !!props.error);

const errorMessage = computed(() => 
  typeof props.error === 'string' ? props.error : ''
);

const hasHint = computed(() => !!props.hint);

const hasPrefixSlot = computed(() => !!props.prefix);
const hasSuffixSlot = computed(() => !!props.suffix || showPasswordToggle.value);

const labelClass = computed(() => [
  'block text-sm font-medium mb-1.5',
  props.disabled ? 'text-text-tertiary' : 'text-text-primary',
]);

const inputClass = computed(() => [
  'w-full rounded-md border transition-colors duration-200',
  'focus:outline-none focus:ring-2 focus:ring-offset-0',
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800',
  'placeholder:text-text-tertiary',
  
  // Size variants
  props.size === 'sm' && 'text-sm py-1.5',
  props.size === 'md' && 'text-sm py-2',
  props.size === 'lg' && 'text-base py-2.5',
  
  // Padding based on prefix/suffix
  hasPrefixSlot.value ? 'pl-10' : 'pl-3',
  hasSuffixSlot.value || props.loading ? 'pr-10' : 'pr-3',
  
  // State variants
  hasError.value
    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
    : 'border-border focus:ring-blue-500 focus:border-blue-500',
  
  // Background
  props.readonly 
    ? 'bg-slate-50 dark:bg-slate-900'
    : 'bg-bg-primary',
]);

const suffixClass = computed(() => [
  'absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1',
  props.loading ? 'pointer-events-none' : '',
]);

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  const value = props.type === 'number' ? Number(target.value) : target.value;
  emit('update:modelValue', value);
}

function handleBlur(event: FocusEvent) {
  isFocused.value = false;
  emit('blur', event);
}

function handleFocus(event: FocusEvent) {
  isFocused.value = true;
  emit('focus', event);
}

function togglePasswordVisibility() {
  passwordVisible.value = !passwordVisible.value;
}

// Expose focus method
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
});
</script>
