<template>
  <div class="w-60 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white font-sans antialiased flex flex-col">
    <!-- Header -->
    <div class="px-3 pt-4 pb-3">
      <div class="flex items-baseline gap-2">
        <h1 class="text-[17px] font-bold tracking-tight text-slate-900 dark:text-white">Proxy Switcher</h1>
        <div class="text-[9px] text-zinc-500 dark:text-zinc-500">v0.1.1</div>
      </div>
    </div>

    <!-- Conflict Warning -->
    <div v-if="hasConflict" class="mx-3 mb-2">
      <div class="px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
        <div class="flex items-start gap-2 mb-2">
          <svg class="w-4 h-4 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <div class="flex-1">
            <div class="text-[12px] font-semibold text-red-800 dark:text-red-400 mb-0.5">Proxy Conflict Detected</div>
            <div class="text-[11px] text-red-700 dark:text-red-500">{{ conflictMessage }}</div>
          </div>
        </div>
        <button
          @click="handleTakeControl"
          class="w-full px-3 py-1.5 rounded-md text-[12px] font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 transition-colors"
        >
          Take Control
        </button>
      </div>
    </div>

    <!-- Divider -->
    <div class="px-3 pb-2">
      <div class="border-t border-gray-200 dark:border-zinc-800"></div>
    </div>

    <!-- Active Profile Section Label -->
    <div class="px-3 pt-2 pb-2">
      <h2 class="text-[11px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">Active Profile</h2>
    </div>

    <!-- Active Profile Card -->
    <div class="px-3 pb-2">
      <div 
        class="relative px-4 py-3.5 rounded-lg bg-gray-100 dark:bg-neutral-800 border-l-4 transition-all duration-300"
        :style="{ borderLeftColor: activeProfileColor }"
      >
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 mt-0.5">
            <component :is="statusIcon" class="h-7 w-7 text-slate-900 dark:text-white" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-[16px] font-semibold leading-tight text-slate-900 dark:text-white mb-1">
              {{ activeProfileName }}
            </div>
            <div class="text-[12px] leading-tight text-zinc-600 dark:text-zinc-400">
              {{ connectionModeText }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="px-3 pb-2">
      <div class="border-t border-gray-200 dark:border-zinc-800"></div>
    </div>

    <!-- Options Section Label -->
    <div class="px-3 pt-1 pb-2">
      <h2 class="text-[13px] font-semibold text-slate-900 dark:text-white tracking-tight">Options</h2>
    </div>

    <!-- Profile List -->
    <div class="px-3 pb-3 space-y-1.5">
      <button
        v-for="profile in sortedProfiles"
        :key="profile.id"
        class="w-full px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 group"
        :class="getProfileButtonClass(profile)"
        @click="handleProfileSwitch(profile)"
      >
        <div 
          class="w-2 h-2 rounded-full flex-shrink-0"
          :style="{ backgroundColor: getProfileColor(profile) }"
        ></div>
        <div class="flex-shrink-0">
          <component :is="getProfileIcon(profile)" class="h-5 w-5 text-zinc-400" />
        </div>
        
        <div class="flex-1 text-left min-w-0">
          <div class="text-[14px] font-medium leading-tight text-slate-900 dark:text-white">
            {{ profile.name }}
          </div>
          <div class="text-[11px] leading-tight text-zinc-600 dark:text-zinc-500">
            {{ getProfileSubtitle(profile) }}
          </div>
        </div>
      </button>
    </div>

    <!-- Footer -->
    <div class="border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-neutral-900">
      <div class="flex items-center p-2.5 gap-2">
        <button
          @click="openOptions"
          class="flex-1 px-3 py-2 rounded-lg text-[13px] font-medium text-zinc-300 bg-neutral-800 hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2"
        >
          <Settings class="h-3.5 w-3.5" />
          Settings
        </button>
        <button
          @click="openAddProfile"
          class="flex-1 px-3 py-2 rounded-lg text-[13px] font-medium text-zinc-300 bg-neutral-800 hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2"
        >
          Add Profile
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Logger } from '@/utils/Logger';
import { 
  Settings, 
  Plus, 
  Zap, 
  Network,
  Globe2,
  Monitor,
  Server,
  Shuffle,
  Layers,
  Cloud
} from 'lucide-vue-next';
import type { Profile, FixedProfile } from '@/core/schema';

Logger.setComponentPrefix('Popup');

const activeProfileId = ref<string>('profile-1');

// Profiles loaded from chrome.storage
const profiles = ref<Profile[]>([]);
const hasConflict = ref(false);
const conflictMessage = ref('Another extension is controlling the proxy');

const activeProfile = computed(() => {
  if (!Array.isArray(profiles.value)) return undefined;
  return profiles.value.find(p => p.id === activeProfileId.value);
});

const sortedProfiles = computed(() => {
  if (!Array.isArray(profiles.value)) return [];
  
  const direct = profiles.value.find(p => p.name === 'Direct');
  const autoSwitch = profiles.value.find(p => p.name === 'Auto Switch');
  const others = profiles.value
    .filter(p => p.name !== 'Direct' && p.name !== 'Auto Switch')
    .sort((a, b) => a.name.localeCompare(b.name));
  
  const sorted = [];
  if (direct) sorted.push(direct);
  if (autoSwitch) sorted.push(autoSwitch);
  sorted.push(...others);
  
  return sorted;
});

const activeProfileName = computed(() => activeProfile.value?.name || 'No Profile');

const statusText = computed(() => {
  if (!activeProfile.value) return 'Inactive';
  if (activeProfile.value.profileType === 'DirectProfile') return 'Direct';
  return 'Active';
});

const connectionModeText = computed(() => {
  if (!activeProfile.value) return 'Not connected';
  if (activeProfile.value.profileType === 'DirectProfile') return 'No proxy';
  if (activeProfile.value.profileType === 'SystemProfile') return 'System';
  if (activeProfile.value.profileType === 'FixedProfile') {
    const fixed = activeProfile.value as FixedProfile;
    return `${fixed.host}:${fixed.port}`;
  }
  if (activeProfile.value.profileType === 'SwitchProfile') return 'Auto-switching by rules';
  if (activeProfile.value.profileType === 'PacProfile') return 'PAC script active';
  return 'Unknown';
});

const statusIcon = computed(() => {
  if (!activeProfile.value) return Globe2;
  if (activeProfile.value.profileType === 'DirectProfile') return Zap;
  if (activeProfile.value.profileType === 'SystemProfile') return Monitor;
  if (activeProfile.value.profileType === 'FixedProfile') return Server;
  if (activeProfile.value.profileType === 'SwitchProfile') return Shuffle;
  return Network;
});

const activeProfileColor = computed(() => {
  if (!activeProfile.value) return '#a1a1aa'; // zinc-400
  const colors: Record<string, string> = {
    gray: '#9ca3af',
    blue: '#3b82f6',
    green: '#22c55e',
    red: '#ef4444',
    yellow: '#eab308',
    purple: '#a855f7',
  };
  return colors[activeProfile.value.color || 'blue'] || colors.blue;
});

onMounted(async () => {
  // Check for proxy conflicts on load
  checkProxyConflict();
  
  // Load active profile from storage
  try {
    // Load profiles from local storage (larger quota), settings from sync
    const localResult = await chrome.storage.local.get(['profiles', 'testConflictActive']);
    const syncResult = await chrome.storage.sync.get(['activeProfileId', 'settings']);
    const result = { ...localResult, ...syncResult };
    
    // Check if test conflict is active (for debug purposes)
    if (result.testConflictActive) {
      hasConflict.value = true;
      conflictMessage.value = 'Test conflict: Another extension is controlling the proxy';
    }
    
    if (result.profiles && Array.isArray(result.profiles)) {
      profiles.value = result.profiles;
    }
    
    // Initialize activeProfileId if undefined or invalid
    if (profiles.value.length > 0) {
      if (!result.activeProfileId || !profiles.value.find(p => p.id === result.activeProfileId)) {
        activeProfileId.value = profiles.value[0].id;
        await chrome.storage.sync.set({ activeProfileId: activeProfileId.value });
      } else {
        activeProfileId.value = result.activeProfileId;
      }
    }
    
    // Apply theme from settings
    if (result.settings?.theme) {
      const theme = result.settings.theme;
      if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // Default to light theme
      document.documentElement.classList.remove('dark');
    }
  } catch (error) {
    Logger.error('Failed to load profiles', error);
  }
});


function getProfileIcon(profile: Profile) {
  switch (profile.profileType) {
    case 'DirectProfile': return Zap;
    case 'SystemProfile': return Monitor;
    case 'FixedProfile': return Server;
    case 'SwitchProfile': return Layers;
    case 'PacProfile': return Cloud;
    default: return Globe2;
  }
}

function getProfileColor(profile: Profile): string {
  const colors: Record<string, string> = {
    gray: '#9ca3af',
    blue: '#3b82f6',
    green: '#22c55e',
    red: '#ef4444',
    yellow: '#eab308',
    purple: '#a855f7',
  };
  return colors[profile.color || 'blue'] || colors.blue;
}

async function checkProxyConflict() {
  try {
    const proxySettings = await chrome.proxy.settings.get({}) as any;
    const levelOfControl = proxySettings.levelOfControl;
    
    Logger.debug('Checking conflict', { levelOfControl });
    
    if (levelOfControl === 'controlled_by_other_extensions') {
      hasConflict.value = true;
      conflictMessage.value = 'Another extension is controlling the proxy';
    } else if (levelOfControl === 'not_controllable') {
      hasConflict.value = true;
      conflictMessage.value = 'Proxy is controlled by system policy';
    } else {
      hasConflict.value = false;
    }
  } catch (error) {
    Logger.error('Failed to check conflict', error);
  }
}

async function handleTakeControl() {
  if (!activeProfile.value) return;
  
  try {
    // Build the same proxy config as handleProfileSwitch
    const profile = activeProfile.value;
    let config: chrome.proxy.ProxyConfig;
    
    if (profile.profileType === 'DirectProfile') {
      config = { mode: 'direct' };
    } else if (profile.profileType === 'SystemProfile') {
      config = { mode: 'system' };
    } else if (profile.profileType === 'FixedProfile' && 'host' in profile) {
      const fixedProfile = profile as any;
      
      // Build bypass list from BypassConditions
      const bypassList: string[] = [];
      if (fixedProfile.bypassList && Array.isArray(fixedProfile.bypassList)) {
        fixedProfile.bypassList.forEach((condition: any) => {
          if (condition.conditionType === 'BypassCondition' && condition.pattern) {
            bypassList.push(condition.pattern);
          }
        });
      }
      
      config = {
        mode: 'fixed_servers',
        rules: {
          singleProxy: {
            scheme: fixedProfile.proxyType?.toLowerCase() || 'http',
            host: fixedProfile.host || 'localhost',
            port: fixedProfile.port || 8080,
          },
          bypassList: bypassList.length > 0 ? bypassList : undefined,
        },
      };
    } else {
      // Default to direct for unsupported types
      config = { mode: 'direct' };
    }
    
    // Re-apply the current active profile to take control
    await chrome.runtime.sendMessage({
      action: 'setProxy',
      config,
      profileColor: profile.color || 'blue'
    });
    
    // Wait a moment and check again (this will clear the conflict if successful)
    setTimeout(() => checkProxyConflict(), 500);
  } catch (error) {
    Logger.error('Failed to take control', error);
  }
}

function getProfileSubtitle(profile: Profile): string {
  switch (profile.profileType) {
    case 'DirectProfile': return 'No proxy';
    case 'SystemProfile': return 'System';
    case 'FixedProfile': {
      const fixed = profile as FixedProfile;
      if (fixed.host && fixed.port) {
        return `${fixed.host}:${fixed.port}`;
      }
      return fixed.proxyType || 'HTTP';
    }
    case 'SwitchProfile': {
      const switchProfile = profile as any;
      if (switchProfile.rules && Array.isArray(switchProfile.rules)) {
        // Get unique profile names from rules
        const profileNames = new Set<string>();
        switchProfile.rules.forEach((rule: any) => {
          if (rule.profileName) {
            profileNames.add(rule.profileName);
          }
        });
        if (switchProfile.defaultProfileName) {
          profileNames.add(switchProfile.defaultProfileName);
        }
        const names = Array.from(profileNames);
        if (names.length > 0) {
          return names.join(', ');
        }
      }
      return 'Auto-switching by rules';
    }
    case 'PacProfile': return 'PAC Script';
    default: return 'Custom';
  }
}

function getProfileIconBg(profile: Profile) {
  return '';
}

function getProfileIconColor(profile: Profile) {
  return '';
}

function getProfileButtonClass(profile: Profile) {
  const isActive = activeProfileId.value === profile.id;
  if (isActive) {
    return 'bg-gray-100 dark:bg-neutral-800';
  }
  return 'bg-transparent hover:bg-gray-100 dark:hover:bg-neutral-800';
}

const switchingProfile = ref(false);

async function handleProfileSwitch(profile: Profile) {
  Logger.info('Switching to profile', { name: profile.name, id: profile.id });
  
  // Immediate UI feedback
  switchingProfile.value = true;
  const previousProfile = activeProfileId.value;
  activeProfileId.value = profile.id;
  
  try {
    Logger.debug('Saving to storage', { activeProfileId: profile.id });
    // Save to storage
    await chrome.storage.sync.set({ activeProfileId: profile.id });

    // Apply proxy settings
    let config: chrome.proxy.ProxyConfig;
    
    if (profile.profileType === 'DirectProfile') {
      config = { mode: 'direct' };
    } else if (profile.profileType === 'SystemProfile') {
      config = { mode: 'system' };
    } else if (profile.profileType === 'FixedProfile' && 'host' in profile) {
      const fixedProfile = profile as any;
      
      // Build bypass list from BypassConditions
      const bypassList: string[] = [];
      if (fixedProfile.bypassList && Array.isArray(fixedProfile.bypassList)) {
        fixedProfile.bypassList.forEach((condition: any) => {
          if (condition.conditionType === 'BypassCondition' && condition.pattern) {
            bypassList.push(condition.pattern);
          }
        });
      }
      
      config = {
        mode: 'fixed_servers',
        rules: {
          singleProxy: {
            scheme: fixedProfile.proxyType?.toLowerCase() || 'http',
            host: fixedProfile.host || 'localhost',
            port: fixedProfile.port || 8080,
          },
          bypassList: bypassList.length > 0 ? bypassList : undefined,
        },
      };
    } else {
      config = { mode: 'direct' };
    }

    // Send message to background script
    Logger.debug('Applying proxy config', config);
    await chrome.runtime.sendMessage({
      action: 'setProxy',
      config,
      profileColor: profile.color || 'blue',
    });
    Logger.info('Profile switch complete');
  } catch (error) {
    Logger.error('Failed to switch profile', error);
    activeProfileId.value = previousProfile; // Rollback
  } finally {
    switchingProfile.value = false;
  }
}

function openOptions() {
  chrome.runtime.openOptionsPage();
}

function openAddProfile() {
  chrome.tabs.create({ url: chrome.runtime.getURL('src/options/options.html?action=addProfile') });
}
</script>
