<template>
  <div class="relative" ref="containerRef">
    <!-- Trigger Button -->
    <Button
      :variant="variant"
      :size="size"
      @click="toggle"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      :class="triggerClass"
    >
      <component :is="activeIcon" class="h-4 w-4" />
      <span class="flex-1 text-left truncate">{{ activeProfileName }}</span>
      <ChevronDown :class="chevronClass" />
    </Button>

    <!-- Dropdown -->
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        :class="dropdownClass"
        role="listbox"
        :aria-activedescendant="activeProfileId"
      >
        <!-- Quick Actions -->
        <div v-if="showQuickActions" class="p-2 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            class="w-full justify-start"
            @click="handleQuickDirect"
          >
            <Circle class="h-4 w-4" />
            Direct Connection
          </Button>
        </div>

        <!-- Search -->
        <div v-if="searchable && profiles.length > 5" class="p-2 border-b border-border">
          <div class="relative">
            <Search class="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-text-tertiary" />
            <input
              ref="searchRef"
              v-model="searchQuery"
              type="text"
              placeholder="Search..."
              class="w-full pl-7 pr-2 py-1.5 text-xs rounded-md border border-border bg-bg-primary focus:outline-none focus:ring-1 focus:ring-blue-500"
              @keydown.escape="close"
            />
          </div>
        </div>

        <!-- Profile List -->
        <div class="max-h-64 overflow-y-auto scrollbar-thin py-1">
          <button
            v-for="profile in filteredProfiles"
            :key="profile.id"
            :id="profile.id"
            type="button"
            role="option"
            :aria-selected="activeProfileId === profile.id"
            :class="getProfileItemClass(profile)"
            @click="handleSelect(profile)"
          >
            <div class="flex items-center gap-2 flex-1 min-w-0">
              <component :is="getProfileIcon(profile)" class="h-4 w-4 flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <div class="font-medium text-sm truncate">{{ profile.name }}</div>
                <div class="text-xs text-text-tertiary truncate">
                  {{ getProfileDescription(profile) }}
                </div>
              </div>
            </div>
            <Check v-if="activeProfileId === profile.id" class="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          </button>

          <!-- Empty State -->
          <div v-if="filteredProfiles.length === 0" class="px-3 py-6 text-center text-sm text-text-tertiary">
            No profiles found
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="p-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            class="w-full justify-start"
            @click="handleManage"
          >
            <Settings class="h-4 w-4" />
            Manage Profiles
          </Button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { 
  ChevronDown, 
  Check, 
  Search, 
  Settings,
  Activity, 
  Circle, 
  Server, 
  Globe,
} from 'lucide-vue-next';
import { Button } from '@/components/ui';
import type { Profile } from '@/core/schema';

interface Props {
  profiles: Profile[];
  activeProfileId?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  searchable?: boolean;
  showQuickActions?: boolean;
  position?: 'bottom' | 'top';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'outline',
  size: 'md',
  searchable: true,
  showQuickActions: true,
  position: 'bottom',
});

const emit = defineEmits<{
  select: [profile: Profile];
  manage: [];
}>();

const isOpen = ref(false);
const searchQuery = ref('');
const containerRef = ref<HTMLElement>();
const searchRef = ref<HTMLInputElement>();

const activeProfile = computed(() => 
  props.profiles?.find(p => p.id === props.activeProfileId)
);

const activeProfileName = computed(() => 
  activeProfile.value?.name || 'Select Profile'
);

const activeIcon = computed(() => getProfileIcon(activeProfile.value));

const filteredProfiles = computed(() => {
  if (!searchQuery.value) return props.profiles;
  
  const query = searchQuery.value.toLowerCase();
  return props.profiles.filter(profile =>
    profile.name.toLowerCase().includes(query) ||
    ('host' in profile && profile.host?.toLowerCase().includes(query))
  );
});

const triggerClass = computed(() => [
  'gap-2',
  props.size === 'sm' ? 'min-w-[180px]' : 'min-w-[220px]',
]);

const dropdownClass = computed(() => [
  'absolute z-50 mt-2 bg-bg-primary border border-border rounded-lg shadow-xl',
  props.position === 'bottom' ? 'top-full' : 'bottom-full mb-2',
  props.size === 'sm' ? 'min-w-[180px]' : 'min-w-[280px]',
  'left-0',
]);

const chevronClass = computed(() => [
  'h-4 w-4 transition-transform duration-200',
  isOpen.value && 'rotate-180',
]);

function getProfileItemClass(profile: Profile) {
  return [
    'w-full flex items-center gap-3 px-3 py-2 text-left',
    'hover:bg-slate-100 dark:hover:bg-slate-800',
    'transition-colors duration-150',
    'focus:outline-none focus:bg-slate-100 dark:focus:bg-slate-800',
    props.activeProfileId === profile.id && 'bg-blue-50 dark:bg-blue-950/30',
  ];
}

function getProfileIcon(profile: Profile | undefined) {
  if (!profile) return Circle;
  
  switch (profile.profileType) {
    case 'DirectProfile': return Circle;
    case 'SystemProfile': return Globe;
    case 'FixedProfile': return Server;
    case 'SwitchProfile': return Activity;
    default: return Server;
  }
}

function getProfileDescription(profile: Profile): string {
  switch (profile.profileType) {
    case 'DirectProfile':
      return 'No proxy';
    case 'SystemProfile':
      return 'System settings';
    case 'FixedProfile':
      if ('host' in profile && 'port' in profile) {
        return `${profile.host}:${profile.port}`;
      }
      return 'Fixed server';
    case 'SwitchProfile':
      if ('rules' in profile) {
        const count = profile.rules?.length || 0;
        return `${count} rule${count !== 1 ? 's' : ''}`;
      }
      return 'Auto-switch';
    default:
      return 'Proxy profile';
  }
}

function toggle() {
  isOpen.value = !isOpen.value;
  
  if (isOpen.value && props.searchable) {
    nextTick(() => {
      searchRef.value?.focus();
    });
  }
}

function close() {
  isOpen.value = false;
  searchQuery.value = '';
}

function handleSelect(profile: Profile) {
  emit('select', profile);
  close();
}

function handleQuickDirect() {
  const directProfile = props.profiles?.find(p => p.profileType === 'DirectProfile');
  if (directProfile) {
    handleSelect(directProfile);
  }
}

function handleManage() {
  emit('manage');
  close();
}

// Close on click outside
onClickOutside(containerRef, close);

// Clear search when closed
watch(isOpen, (open) => {
  if (!open) {
    searchQuery.value = '';
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
