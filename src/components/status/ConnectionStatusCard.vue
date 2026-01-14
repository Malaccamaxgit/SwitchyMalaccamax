<template>
  <Card
    :class="cardClass"
    padding="lg"
    shadow="md"
  >
    <div class="flex items-start gap-4">
      <div :class="statusIconClass">
        <component
          :is="statusIcon"
          class="h-6 w-6"
        />
      </div>
      
      <div class="flex-1 min-w-0">
        <h3 class="text-lg font-semibold">
          {{ statusTitle }}
        </h3>
        <p class="text-sm text-text-secondary mt-1">
          {{ statusMessage }}
        </p>
        
        <div class="flex items-center gap-3 mt-3 text-xs flex-wrap">
          <Badge
            :variant="modeVariant"
            size="sm"
          >
            <component
              :is="modeIcon"
              class="h-3 w-3"
            />
            {{ connectionMode }}
          </Badge>
          
          <span
            v-if="requestCount"
            class="text-text-tertiary"
          >
            {{ formatCompactNumber(requestCount) }} requests today
          </span>
          
          <span
            v-if="lastSwitched"
            class="text-text-tertiary"
          >
            Last switch: {{ formatRelativeTime(lastSwitched) }}
          </span>
        </div>
      </div>
      
      <Button
        v-if="collapsible"
        variant="ghost"
        size="icon"
        :aria-label="collapsed ? 'Expand details' : 'Collapse details'"
        @click="collapsed = !collapsed"
      >
        <ChevronUp
          v-if="!collapsed"
          class="h-4 w-4"
        />
        <ChevronDown
          v-else
          class="h-4 w-4"
        />
      </Button>
    </div>
    
    <Transition name="expand">
      <div
        v-if="!collapsed && showDetails"
        class="mt-4 pt-4 border-t border-border"
      >
        <dl class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt class="text-text-tertiary text-xs uppercase tracking-wide mb-1">
              Active Profile
            </dt>
            <dd class="font-medium">
              {{ activeProfile || 'None' }}
            </dd>
          </div>
          <div>
            <dt class="text-text-tertiary text-xs uppercase tracking-wide mb-1">
              Proxy Type
            </dt>
            <dd class="font-medium">
              {{ proxyType || 'N/A' }}
            </dd>
          </div>
          <div v-if="proxyHost">
            <dt class="text-text-tertiary text-xs uppercase tracking-wide mb-1">
              Server
            </dt>
            <dd class="font-medium font-mono text-xs">
              {{ proxyHost }}
            </dd>
          </div>
          <div v-if="rulesCount !== undefined">
            <dt class="text-text-tertiary text-xs uppercase tracking-wide mb-1">
              Active Rules
            </dt>
            <dd class="font-medium">
              {{ rulesCount }} conditions
            </dd>
          </div>
        </dl>
      </div>
    </Transition>
  </Card>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ref, computed } from 'vue';
import { Activity, Zap, Circle, AlertTriangle, XCircle, ChevronUp, ChevronDown } from 'lucide-vue-next';
import { Card, Button, Badge } from '@/components/ui';
import { formatRelativeTime, formatCompactNumber } from '@/lib/utils';

export interface ConnectionStatus {
  status: 'active' | 'auto' | 'direct' | 'error' | 'disconnected';
  activeProfile?: string;
  connectionMode: 'Manual' | 'Auto Switch' | 'Direct';
  requestCount?: number;
  lastSwitched?: Date | number;
  proxyType?: string;
  proxyHost?: string;
  rulesCount?: number;
}

interface Props extends ConnectionStatus {
  collapsible?: boolean;
  showDetails?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  collapsible: true,
  showDetails: true,
});

const collapsed = ref(false);

const statusConfig = {
  active: {
    icon: Activity,
    title: 'Proxy Active',
    message: 'All traffic routed through proxy server',
    iconClass: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400',
    cardClass: 'border-green-200 dark:border-green-900/30',
  },
  auto: {
    icon: Zap,
    title: 'Auto Switch',
    message: 'Automatically switching based on rules',
    iconClass: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
    cardClass: 'border-blue-200 dark:border-blue-900/30',
  },
  direct: {
    icon: Circle,
    title: 'Direct Connection',
    message: 'Not using proxy',
    iconClass: 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400',
    cardClass: 'border-gray-200 dark:border-gray-800',
  },
  error: {
    icon: AlertTriangle,
    title: 'Connection Error',
    message: 'Failed to connect to proxy server',
    iconClass: 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400',
    cardClass: 'border-red-200 dark:border-red-900/30',
  },
  disconnected: {
    icon: XCircle,
    title: 'Disconnected',
    message: 'Proxy connection lost',
    iconClass: 'text-amber-600 bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400',
    cardClass: 'border-amber-200 dark:border-amber-900/30',
  },
};

const currentStatus = computed(() => statusConfig[props.status]);
const statusIcon = computed(() => currentStatus.value.icon);
const statusTitle = computed(() => currentStatus.value.title);
const statusMessage = computed(() => currentStatus.value.message);
const statusIconClass = computed(() => 
  `flex items-center justify-center w-12 h-12 rounded-lg ${currentStatus.value.iconClass}`
);
const cardClass = computed(() => currentStatus.value.cardClass);

const modeIcon = computed(() => {
  switch (props.connectionMode) {
    case 'Auto Switch': return Zap;
    case 'Manual': return Activity;
    case 'Direct': return Circle;
    default: return Activity;
  }
});

const modeVariant = computed(() => {
  switch (props.connectionMode) {
    case 'Auto Switch': return 'default';
    case 'Manual': return 'success';
    case 'Direct': return 'secondary';
    default: return 'secondary';
  }
});
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
  padding-top: 0;
  border-top-width: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 200px;
}
</style>
