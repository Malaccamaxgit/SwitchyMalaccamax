<template>
  <div
    ref="triggerRef"
    class="inline-block"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <slot />
    
    <Teleport to="body">
      <Transition name="tooltip">
        <div
          v-if="showTooltip"
          ref="tooltipRef"
          role="tooltip"
          :class="tooltipClass"
          :style="tooltipStyle"
        >
          <slot name="content">
            {{ content }}
          </slot>
          <div v-if="!hideArrow" :class="arrowClass" :style="arrowStyle"></div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';

interface Props {
  content?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  hideArrow?: boolean;
  disabled?: boolean;
  maxWidth?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'top',
  delay: 200,
  maxWidth: '320px',
});

const triggerRef = ref<HTMLElement>();
const tooltipRef = ref<HTMLElement>();
const showTooltip = ref(false);
const tooltipStyle = ref({});
const arrowStyle = ref({});
const hoverTimeout = ref<number>();

const tooltipClass = computed(() => [
  'absolute z-[100] px-3 py-2 text-xs font-medium rounded-md shadow-lg',
  'bg-slate-900 dark:bg-slate-700 text-white',
  'pointer-events-none',
]);

const arrowClass = computed(() => [
  'absolute w-2 h-2 rotate-45',
  'bg-slate-900 dark:bg-slate-700',
]);

function handleMouseEnter() {
  if (props.disabled) return;
  
  hoverTimeout.value = window.setTimeout(() => {
    showTooltip.value = true;
    nextTick(() => calculatePosition());
  }, props.delay);
}

function handleMouseLeave() {
  if (hoverTimeout.value) {
    clearTimeout(hoverTimeout.value);
  }
  showTooltip.value = false;
}

function handleFocus() {
  if (props.disabled) return;
  showTooltip.value = true;
  nextTick(() => calculatePosition());
}

function handleBlur() {
  showTooltip.value = false;
}

function calculatePosition() {
  if (!triggerRef.value || !tooltipRef.value) return;
  
  const triggerRect = triggerRef.value.getBoundingClientRect();
  const tooltipRect = tooltipRef.value.getBoundingClientRect();
  
  const spacing = 8; // Gap between trigger and tooltip
  const arrowSize = 4;
  
  let top = 0;
  let left = 0;
  let arrowTop = '';
  let arrowLeft = '';
  
  switch (props.placement) {
    case 'top':
      top = triggerRect.top - tooltipRect.height - spacing;
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      arrowTop = '100%';
      arrowLeft = '50%';
      arrowStyle.value = {
        top: arrowTop,
        left: arrowLeft,
        transform: 'translate(-50%, -50%)',
      };
      break;
      
    case 'bottom':
      top = triggerRect.bottom + spacing;
      left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      arrowTop = `-${arrowSize}px`;
      arrowLeft = '50%';
      arrowStyle.value = {
        top: arrowTop,
        left: arrowLeft,
        transform: 'translate(-50%, -50%)',
      };
      break;
      
    case 'left':
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      left = triggerRect.left - tooltipRect.width - spacing;
      arrowTop = '50%';
      arrowLeft = '100%';
      arrowStyle.value = {
        top: arrowTop,
        left: arrowLeft,
        transform: 'translate(-50%, -50%)',
      };
      break;
      
    case 'right':
      top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      left = triggerRect.right + spacing;
      arrowTop = '50%';
      arrowLeft = `-${arrowSize}px`;
      arrowStyle.value = {
        top: arrowTop,
        left: arrowLeft,
        transform: 'translate(-50%, -50%)',
      };
      break;
  }
  
  // Keep tooltip within viewport
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  if (left < 10) left = 10;
  if (left + tooltipRect.width > viewportWidth - 10) {
    left = viewportWidth - tooltipRect.width - 10;
  }
  
  if (top < 10) top = 10;
  if (top + tooltipRect.height > viewportHeight - 10) {
    top = viewportHeight - tooltipRect.height - 10;
  }
  
  tooltipStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
    maxWidth: props.maxWidth,
  };
}

// Recalculate on window resize
watch(showTooltip, (show) => {
  if (show) {
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition, true);
  } else {
    window.removeEventListener('resize', calculatePosition);
    window.removeEventListener('scroll', calculatePosition, true);
  }
});
</script>

<style scoped>
.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
}
</style>
