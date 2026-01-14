<template>
  <Teleport to="body">
    <Transition name="dialog-backdrop">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="handleBackdropClick"
      >
        <Transition name="dialog-content">
          <div
            v-if="modelValue"
            :class="dialogClass"
            role="dialog"
            :aria-modal="true"
            :aria-labelledby="`${dialogId}-title`"
            :aria-describedby="description ? `${dialogId}-description` : undefined"
          >
            <!-- Header -->
            <div
              v-if="!hideHeader"
              class="flex items-start justify-between gap-4 px-6 pt-6 pb-5 border-b border-border"
            >
              <div class="flex-1 min-w-0">
                <h2
                  :id="`${dialogId}-title`"
                  :class="titleClass"
                >
                  {{ title }}
                </h2>
                <p
                  v-if="description"
                  :id="`${dialogId}-description`"
                  class="text-sm text-text-secondary mt-1"
                >
                  {{ description }}
                </p>
              </div>
              <Button
                v-if="!hideClose"
                variant="ghost"
                size="icon"
                class="h-8 w-8 flex-shrink-0"
                aria-label="Close dialog"
                @click="close"
              >
                <X class="h-4 w-4" />
              </Button>
            </div>
            
            <!-- Content -->
            <div :class="contentClass">
              <slot />
            </div>
            
            <!-- Footer -->
            <div
              v-if="!hideFooter || $slots.footer"
              :class="footerClass"
            >
              <slot name="footer">
                <div class="flex items-center justify-end gap-3">
                  <Button
                    variant="ghost"
                    @click="handleCancel"
                  >
                    {{ cancelText }}
                  </Button>
                  <Button
                    :variant="confirmVariant"
                    :loading="loading"
                    @click="handleConfirm"
                  >
                    {{ confirmText }}
                  </Button>
                </div>
              </slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/explicit-function-return-type */
import { computed, watch } from 'vue';
import { X } from 'lucide-vue-next';
import Button from './Button.vue';
import { generateId } from '@/lib/utils';

interface Props {
  modelValue: boolean;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  hideHeader?: boolean;
  hideFooter?: boolean;
  hideClose?: boolean;
  closeOnBackdrop?: boolean;
  cancelText?: string;
  confirmText?: string;
  confirmVariant?: 'default' | 'destructive' | 'success';
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: '',
  description: '',
  size: 'md',
  closeOnBackdrop: true,
  cancelText: 'Cancel',
  confirmText: 'Confirm',
  confirmVariant: 'default',
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  close: [];
  cancel: [];
  confirm: [];
}>();

const dialogId = computed(() => generateId('dialog'));

const dialogClass = computed(() => [
  'relative w-full bg-bg-primary rounded-lg shadow-2xl overflow-hidden',
  'flex flex-col',
  
  // Size variants
  props.size === 'sm' && 'max-w-sm max-h-[80vh]',
  props.size === 'md' && 'max-w-md max-h-[85vh]',
  props.size === 'lg' && 'max-w-2xl max-h-[90vh]',
  props.size === 'xl' && 'max-w-4xl max-h-[90vh]',
  props.size === 'full' && 'max-w-7xl max-h-[95vh]',
]);

const titleClass = computed(() => [
  'font-semibold',
  props.size === 'sm' ? 'text-base' : 'text-lg',
]);

const contentClass = computed(() => [
  'flex-1 overflow-y-auto scrollbar-thin',
  props.hideHeader ? 'pt-8 px-8' : 'pt-6 px-8',
  props.hideFooter ? 'pb-8' : 'pb-6',
]);

const footerClass = computed(() => [
  'flex items-center justify-end gap-3',
  'pt-5 px-8 pb-8',
  'border-t border-border',
]);

function close() {
  emit('update:modelValue', false);
  emit('close');
}

function handleBackdropClick() {
  if (props.closeOnBackdrop) {
    close();
  }
}

function handleCancel() {
  emit('cancel');
  close();
}

function handleConfirm() {
  emit('confirm');
}

// Lock body scroll when dialog is open
watch(() => props.modelValue, (open) => {
  if (open) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}, { immediate: true });
</script>

<style scoped>
.dialog-backdrop-enter-active,
.dialog-backdrop-leave-active {
  transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.dialog-backdrop-enter-from,
.dialog-backdrop-leave-to {
  opacity: 0;
}

.dialog-content-enter-active,
.dialog-content-leave-active {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.dialog-content-enter-from,
.dialog-content-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}
</style>
