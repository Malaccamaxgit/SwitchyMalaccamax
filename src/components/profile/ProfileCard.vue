<template>
  <Card
    :class="cardClass"
    :padding="compact ? 'sm' : 'md'"
    shadow="sm"
    :hover="selectable ? 'lift' : 'none'"
    role="button"
    :tabindex="selectable ? 0 : -1"
    :aria-selected="isActive"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <div class="flex items-start gap-3">
      <!-- Status Indicator -->
      <div :class="statusIndicatorClass">
        <component
          :is="statusIcon"
          :class="statusIconSize"
        />
      </div>
      
      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <h3 :class="titleClass">
            {{ profile.name }}
          </h3>
          <Badge 
            v-if="isActive" 
            variant="success" 
            size="xs"
          >
            Active
          </Badge>
        </div>
        
        <p :class="descriptionClass">
          {{ profileDescription }}
        </p>
        
        <div
          v-if="!compact && showMetadata"
          class="flex items-center gap-3 mt-2 text-xs text-text-tertiary"
        >
          <span v-if="profile.lastUsed">
            {{ formatRelativeTime(profile.lastUsed) }}
          </span>
          <span v-if="requestsToday">
            {{ formatCompactNumber(requestsToday) }} requests
          </span>
          <Badge
            v-if="profile.color"
            variant="secondary"
            size="xs"
          >
            {{ profile.profileType }}
          </Badge>
        </div>
      </div>
      
      <!-- Actions -->
      <div
        v-if="showActions"
        class="flex items-center gap-1"
        @click.stop
      >
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8"
          aria-label="Edit profile"
          @click="$emit('edit', profile)"
        >
          <Edit2 class="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8"
          aria-label="Delete profile"
          @click="$emit('delete', profile)"
        >
          <Trash2 class="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="h-8 w-8"
          aria-label="More options"
          @click="$emit('more', profile)"
        >
          <MoreVertical class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/explicit-function-return-type */
import { computed } from 'vue';
import { Activity, Circle, Server, Globe, Edit2, Trash2, MoreVertical } from 'lucide-vue-next';
import { Card, Button, Badge } from '@/components/ui';
import { formatRelativeTime, formatCompactNumber } from '@/lib/utils';
import type { Profile } from '@/core/schema';

interface Props {
  profile: Profile;
  isActive?: boolean;
  selectable?: boolean;
  compact?: boolean;
  showActions?: boolean;
  showMetadata?: boolean;
  requestsToday?: number;
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
  selectable: true,
  compact: false,
  showActions: false,
  showMetadata: true,
  requestsToday: 0,
});

const emit = defineEmits<{
  select: [profile: Profile];
  edit: [profile: Profile];
  delete: [profile: Profile];
  more: [profile: Profile];
}>();

const cardClass = computed(() => [
  'transition-all duration-200',
  props.isActive 
    ? 'border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/30' 
    : 'border-border',
  props.selectable && 'cursor-pointer',
]);

const statusIndicatorClass = computed(() => [
  'flex items-center justify-center rounded-lg',
  props.compact ? 'w-8 h-8' : 'w-10 h-10',
  props.isActive 
    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
]);

const statusIcon = computed(() => {
  if (props.profile.profileType === 'DirectProfile') return Circle;
  if (props.profile.profileType === 'SystemProfile') return Globe;
  if (props.profile.profileType === 'FixedProfile') return Server;
  if (props.profile.profileType === 'SwitchProfile') return Activity;
  return Server;
});

const statusIconSize = computed(() => props.compact ? 'h-4 w-4' : 'h-5 w-5');

const titleClass = computed(() => [
  'font-medium truncate',
  props.compact ? 'text-sm' : 'text-base',
]);

const descriptionClass = computed(() => [
  'text-text-secondary truncate',
  props.compact ? 'text-xs mt-0.5' : 'text-sm mt-1',
]);

const profileDescription = computed(() => {
  const { profile } = props;
  
  switch (profile.profileType) {
    case 'DirectProfile':
      return 'No proxy';
    case 'SystemProfile':
      return 'Use system settings';
    case 'FixedProfile':
      if ('host' in profile && 'port' in profile) {
        return `${profile.proxyType || 'HTTP'} • ${profile.host}:${profile.port}`;
      }
      return 'Fixed server';
    case 'SwitchProfile':
      if ('rules' in profile) {
        const ruleCount = profile.rules?.length || 0;
        return `Auto-switch • ${ruleCount} rule${ruleCount !== 1 ? 's' : ''}`;
      }
      return 'Auto-switch rules';
    case 'PacProfile':
      return 'PAC script';
    default:
      return 'Proxy profile';
  }
});

function handleClick() {
  if (props.selectable) {
    emit('select', props.profile);
  }
}
</script>
