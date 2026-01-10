<template>
  <div class="select-wrapper">
    <label v-if="label" :for="selectId" :class="labelClass">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <div class="relative" ref="containerRef">
      <!-- Trigger Button -->
      <button
        :id="selectId"
        type="button"
        :disabled="disabled"
        :class="triggerClass"
        :aria-expanded="isOpen"
        :aria-haspopup="true"
        :aria-invalid="hasError"
        @click="toggle"
      >
        <span :class="valueClass">
          {{ displayValue }}
        </span>
        <ChevronDown :class="chevronClass" />
      </button>
      
      <!-- Dropdown -->
      <Transition name="dropdown">
        <div v-if="isOpen" :class="dropdownClass">
          <!-- Search -->
          <div v-if="searchable" class="p-2 border-b border-border">
            <div class="relative">
              <Search class="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
              <input
                ref="searchRef"
                v-model="searchQuery"
                type="text"
                :placeholder="searchPlaceholder"
                class="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-border bg-bg-primary focus:outline-none focus:ring-1 focus:ring-blue-500"
                @keydown.escape="close"
                @keydown.down.prevent="highlightNext"
                @keydown.up.prevent="highlightPrevious"
                @keydown.enter.prevent="selectHighlighted"
              />
            </div>
          </div>
          
          <!-- Options List -->
          <div class="max-h-64 overflow-y-auto scrollbar-thin py-1">
            <button
              v-for="(option, index) in filteredOptions"
              :key="getOptionValue(option)"
              type="button"
              role="option"
              :aria-selected="isSelected(option)"
              :class="getOptionClass(option, index)"
              @click="selectOption(option)"
              @mouseenter="highlightedIndex = index"
            >
              <div class="flex-1 text-left">
                <div class="truncate">
                  {{ getOptionLabel(option) }}
                </div>
                <div v-if="getOptionDescription(option)" class="text-xs text-text-tertiary mt-0.5">
                  {{ getOptionDescription(option) }}
                </div>
              </div>
              <Check v-if="isSelected(option)" class="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            </button>
            
            <!-- Empty State -->
            <div v-if="filteredOptions.length === 0" class="px-4 py-8 text-center text-sm text-text-tertiary">
              {{ emptyText }}
            </div>
          </div>
        </div>
      </Transition>
    </div>
    
    <!-- Hint Text -->
    <p v-if="hint && !hasError" class="mt-1.5 text-xs text-text-tertiary">
      {{ hint }}
    </p>
    
    <!-- Error Message -->
    <p v-if="hasError" class="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
      <AlertCircle class="h-3 w-3" />
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { ChevronDown, Check, Search, AlertCircle } from 'lucide-vue-next';
import { generateId } from '@/lib/utils';

export type SelectOption = string | number | { label: string; value: string | number; disabled?: boolean; description?: string };

interface Props {
  modelValue?: string | number;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  hint?: string;
  error?: string | boolean;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  size?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select an option',
  searchPlaceholder: 'Search...',
  emptyText: 'No options found',
  searchable: true,
  size: 'md',
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
  change: [value: string | number];
}>();

const isOpen = ref(false);
const searchQuery = ref('');
const highlightedIndex = ref(0);
const containerRef = ref<HTMLElement>();
const searchRef = ref<HTMLInputElement>();

const selectId = computed(() => generateId('select'));

const hasError = computed(() => !!props.error);

const errorMessage = computed(() => 
  typeof props.error === 'string' ? props.error : ''
);

const selectedOption = computed(() =>
  props.options?.find(opt => getOptionValue(opt) === props.modelValue)
);

const displayValue = computed(() => {
  if (selectedOption.value) {
    return getOptionLabel(selectedOption.value);
  }
  return props.placeholder;
});

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options;
  
  const query = searchQuery.value.toLowerCase();
  return props.options.filter(option => 
    getOptionLabel(option).toLowerCase().includes(query)
  );
});

const labelClass = computed(() => [
  'block text-sm font-medium mb-1.5',
  props.disabled ? 'text-text-tertiary' : 'text-text-primary',
]);

const triggerClass = computed(() => [
  'w-full flex items-center justify-between gap-2 rounded-md border transition-colors duration-200',
  'focus:outline-none focus:ring-2 focus:ring-offset-0',
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800',
  
  // Size variants
  props.size === 'sm' && 'text-sm py-1.5 px-3',
  props.size === 'md' && 'text-sm py-2 px-3',
  props.size === 'lg' && 'text-base py-2.5 px-3',
  
  // State variants
  hasError.value
    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
    : 'border-border focus:ring-blue-500 focus:border-blue-500',
  
  'bg-bg-primary',
]);

const valueClass = computed(() => [
  'flex-1 text-left truncate',
  !selectedOption.value && 'text-text-tertiary',
]);

const chevronClass = computed(() => [
  'h-4 w-4 text-text-tertiary transition-transform duration-200 flex-shrink-0',
  isOpen.value && 'rotate-180',
]);

const dropdownClass = computed(() => [
  'absolute z-50 mt-2 w-full bg-bg-primary border border-border rounded-lg shadow-xl',
  'top-full left-0',
]);

function getOptionValue(option: SelectOption): string | number {
  return typeof option === 'object' ? option.value : option;
}

function getOptionLabel(option: SelectOption): string {
  if (typeof option === 'object') return option.label;
  return String(option);
}

function isOptionDisabled(option: SelectOption): boolean {
  return typeof option === 'object' ? option.disabled ?? false : false;
}

function isSelected(option: SelectOption): boolean {
  return getOptionValue(option) === props.modelValue;
}

function getOptionDescription(option: SelectOption): string {
  return typeof option === 'object' && 'description' in option ? option.description || '' : '';
}

function getOptionClass(option: SelectOption, index: number) {
  return [
    'w-full flex items-center gap-3 px-3 py-2 text-sm text-left',
    'transition-colors duration-150',
    isOptionDisabled(option)
      ? 'opacity-50 cursor-not-allowed'
      : 'hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer',
    isSelected(option) && 'bg-blue-50 dark:bg-blue-950/30',
    index === highlightedIndex.value && 'bg-slate-100 dark:bg-slate-800',
  ];
}

function toggle() {
  if (!props.disabled) {
    isOpen.value = !isOpen.value;
    
    if (isOpen.value && props.searchable) {
      nextTick(() => {
        searchRef.value?.focus();
      });
    }
  }
}

function close() {
  isOpen.value = false;
  searchQuery.value = '';
  highlightedIndex.value = 0;
}

function selectOption(option: SelectOption) {
  if (isOptionDisabled(option)) return;
  
  const value = getOptionValue(option);
  emit('update:modelValue', value);
  emit('change', value);
  close();
}

function highlightNext() {
  highlightedIndex.value = Math.min(highlightedIndex.value + 1, filteredOptions.value.length - 1);
}

function highlightPrevious() {
  highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0);
}

function selectHighlighted() {
  if (filteredOptions.value[highlightedIndex.value]) {
    selectOption(filteredOptions.value[highlightedIndex.value]);
  }
}

onClickOutside(containerRef, close);

watch(isOpen, (open) => {
  if (!open) {
    searchQuery.value = '';
    highlightedIndex.value = 0;
  }
});
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
