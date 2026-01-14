<template>
  <Dialog
    v-model="isOpen"
    :title="isEditMode ? 'Edit Profile' : 'Create Profile'"
    :description="isEditMode ? 'Update proxy profile settings' : 'Create a new proxy profile'"
    size="lg"
    :confirm-text="isEditMode ? 'Save Changes' : 'Create Profile'"
    confirm-variant="success"
    :loading="saving"
    @confirm="handleSave"
    @cancel="handleCancel"
  >
    <form
      class="space-y-6"
      @submit.prevent="handleSave"
    >
      <!-- Basic Information -->
      <section>
        <h3 class="text-sm font-semibold mb-3">
          Basic Information
        </h3>
        <div class="space-y-4">
          <Input
            v-model="formData.name"
            label="Profile Name"
            placeholder="e.g., Work Proxy, Home VPN"
            hint="Give your profile a descriptive name (max 50 characters)"
            :error="errors.name"
            :disabled="isBuiltInProfile"
            :maxlength="50"
            required
          />
          
          <Select
            v-if="!isBuiltInProfile"
            v-model="formData.profileType"
            :options="profileTypeOptions"
            label="Profile Type"
            hint="Choose how this profile handles connections"
            :error="errors.profileType"
            :disabled="isEditMode"
            required
            @change="handleProfileTypeChange"
          />
          
          <!-- Built-in profile type display (read-only) -->
          <div
            v-if="isBuiltInProfile"
            class="space-y-1.5"
          >
            <label class="block text-sm font-medium text-text-primary">Profile Type</label>
            <div class="px-3 py-2 text-sm rounded-md border border-border bg-slate-100 dark:bg-slate-800 text-text-secondary">
              {{ isDirectProfile ? 'Direct Connection' : 'System Proxy' }}
              <span class="ml-2 text-xs text-text-tertiary">(built-in)</span>
            </div>
            <p class="text-xs text-text-tertiary">
              {{ isDirectProfile ? 'Bypass all proxies and connect directly' : 'Uses your operating system\'s proxy settings' }}
            </p>
          </div>
          
          <Select
            v-model="formData.color"
            :options="colorOptions"
            label="Color Tag"
            hint="Helps identify profiles visually"
          />
          
          <!-- Show in Popup Toggle (always available) -->
          <div class="flex items-center justify-between py-2">
            <div>
              <label class="text-sm font-medium text-text-primary">Show in Popup</label>
              <p class="text-xs text-text-tertiary">
                Display this profile in the quick-switch popup menu
              </p>
            </div>
            <Switch v-model="formData.showInPopup" />
          </div>
        </div>
      </section>

      <!-- Fixed Server Settings -->
      <section v-if="isFixedProfile">
        <h3 class="text-sm font-semibold mb-3">
          Server Settings
        </h3>
        <div class="space-y-4">
          <Select
            v-model="formData.proxyType"
            :options="proxyProtocolOptions"
            label="Protocol"
            :error="errors.proxyType"
            required
          />
          
          <div class="grid grid-cols-3 gap-4">
            <div class="col-span-2">
              <Input
                v-model="formData.host"
                label="Host"
                placeholder="proxy.example.com"
                :error="errors.host"
                :maxlength="255"
                required
              >
                <template #prefix>
                  <Server class="h-4 w-4 text-text-tertiary" />
                </template>
              </Input>
            </div>
            <Input
              v-model="formData.port"
              type="number"
              label="Port"
              placeholder="8080"
              :error="errors.port"
              required
            />
          </div>
          
          <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-md">
            <div>
              <p class="text-sm font-medium">
                Require Authentication
              </p>
              <p class="text-xs text-text-tertiary">
                {{ formData.proxyType === 'SOCKS4' ? 'SOCKS4: Username only' : 'Username and password or API token' }}
              </p>
            </div>
            <Switch v-model="formData.requiresAuth" />
          </div>
          
          <Transition name="expand">
            <div
              v-if="formData.requiresAuth"
              class="pl-4 border-l-2 border-blue-500"
            >
              <div :class="formData.proxyType === 'SOCKS4' ? 'grid grid-cols-1' : 'grid grid-cols-2 gap-4'">
                <Input
                  v-model="formData.username"
                  label="Username"
                  placeholder="username"
                  :error="errors.username"
                  :required="formData.requiresAuth"
                  :maxlength="128"
                >
                  <template #prefix>
                    <User class="h-4 w-4 text-text-tertiary" />
                  </template>
                </Input>
                
                <Input
                  v-if="formData.proxyType !== 'SOCKS4'"
                  v-model="formData.password"
                  type="password"
                  label="Password / API Token"
                  placeholder="••••••••"
                  :error="errors.password"
                  :required="formData.requiresAuth"
                  :maxlength="256"
                >
                  <template #prefix>
                    <Lock class="h-4 w-4 text-text-tertiary" />
                  </template>
                </Input>
              </div>
              
              <!-- Protocol-specific authentication notes -->
              <div
                v-if="formData.proxyType === 'SOCKS4'"
                class="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-900"
              >
                <p class="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Note:</strong> SOCKS4 only supports username authentication. Password field not available.
                </p>
              </div>
              
              <!-- API Token help for HTTP/HTTPS/SOCKS5 -->
              <div
                v-if="formData.proxyType !== 'SOCKS4'"
                class="mt-2 p-2 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-900"
              >
                <p class="text-xs text-amber-700 dark:text-amber-300">
                  <strong>💡 Using a commercial proxy?</strong> Most services (Bright Data, ScraperAPI, Oxylabs, etc.) 
                  accept API tokens in the Password field. Check your provider's documentation for the exact format.
                </p>
              </div>
            </div>
          </Transition>
        </div>
      </section>

      <!-- PAC Script Settings -->
      <section v-if="isPacProfile">
        <h3 class="text-sm font-semibold mb-3">
          PAC Script
        </h3>
        <div class="space-y-4">
          <div class="flex gap-2 mb-2">
            <Button
              type="button"
              :variant="formData.pacScriptType === 'url' ? 'default' : 'ghost'"
              size="sm"
              @click="formData.pacScriptType = 'url'"
            >
              PAC URL
            </Button>
            <Button
              type="button"
              :variant="formData.pacScriptType === 'data' ? 'default' : 'ghost'"
              size="sm"
              @click="formData.pacScriptType = 'data'"
            >
              PAC Script
            </Button>
          </div>
          
          <Input
            v-if="formData.pacScriptType === 'url'"
            v-model="formData.pacUrl"
            label="PAC URL"
            placeholder="http://example.com/proxy.pac"
            hint="URL to PAC script file (max 2048 characters)"
            :error="errors.pacUrl"
            :maxlength="2048"
            required
          >
            <template #prefix>
              <Globe class="h-4 w-4 text-text-tertiary" />
            </template>
          </Input>
          
          <div v-else>
            <label class="block text-sm font-medium mb-1.5">PAC Script</label>
            <textarea
              v-model="formData.pacScript"
              rows="8"
              maxlength="102400"
              class="w-full px-3 py-2 text-sm font-mono rounded-md border border-border bg-bg-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="function FindProxyForURL(url, host) {&#10;  return 'DIRECT';&#10;}"
            />
            <p class="text-xs text-text-tertiary mt-1.5">
              JavaScript function to determine proxy (max 100KB)
            </p>
          </div>
        </div>
      </section>

      <!-- Switch Profile Settings -->
      <section v-if="isSwitchProfile">
        <h3 class="text-sm font-semibold mb-3">
          Auto-Switch Rules
        </h3>
        <div class="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-900">
          <div class="flex items-start gap-3">
            <Info class="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                {{ isEditMode ? 'Profile Name and Color Only' : 'Rules will be configured separately' }}
              </p>
              <p class="text-xs text-blue-700 dark:text-blue-300">
                {{ isEditMode ? 'On this screen you can change the profile name and color tag. Rules are configured on the profile detail page in Settings.' : 'After creating the profile, you can add conditions and target profiles for automatic switching.' }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Advanced Settings -->
      <!-- Only show bypass list for FixedProfile (DirectProfile, SystemProfile, PacProfile don't need it) -->
      <section v-if="isFixedProfile">
        <h3 class="text-sm font-semibold mb-3">
          Advanced Settings
        </h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-md">
            <div>
              <p class="text-sm font-medium">
                Bypass List
              </p>
              <p class="text-xs text-text-tertiary">
                Domains that skip proxy
              </p>
            </div>
            <Switch
              v-model="showBypassList"
              size="sm"
            />
          </div>
          
          <Transition name="expand">
            <div
              v-if="showBypassList"
              class="pl-4 border-l-2 border-slate-300 dark:border-slate-700"
            >
              <Input
                v-model="formData.bypassList"
                placeholder="localhost, 127.0.0.1, *.local"
                hint="Comma-separated list of hosts/patterns (max 4KB)"
                :maxlength="4096"
              />
            </div>
          </Transition>
        </div>
      </section>

      <!-- Test Connection -->
      <section
        v-if="isFixedProfile"
        class="pt-4 border-t border-border"
      >
        <div class="space-y-3">
          <div>
            <Input
              v-model="formData.testUrl"
              label="Test URL/IP (Optional)"
              :placeholder="testUrlPlaceholder"
              :hint="formData.proxyType === 'SOCKS4' || formData.proxyType === 'SOCKS5' 
                ? 'Test IP address (default: 8.8.8.8 - Google DNS)'
                : 'Test URL (default: Google no-content endpoint)'"
            />
          </div>
          
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Tooltip content="Test if the proxy server is reachable">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  :loading="testing"
                  @click="testConnection"
                >
                  <Zap class="h-3.5 w-3.5" />
                  Test Connection
                </Button>
              </Tooltip>
              
              <Transition name="fade">
                <Badge
                  v-if="testResult"
                  :variant="testResult.success ? 'success' : 'danger'"
                  size="sm"
                >
                  {{ testResult.message }}
                </Badge>
              </Transition>
            </div>
          </div>
        </div>
      </section>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/explicit-function-return-type */
import { ref, computed, watch } from 'vue';
import { Server, User, Lock, Globe, Info, Zap } from 'lucide-vue-next';
import { Dialog, Input, Select, Switch, Button, Badge, Tooltip } from '@/components/ui';
import type { Profile, FixedProfile, PacProfile, SwitchProfile } from '@/core/schema';

interface Props {
  modelValue: boolean;
  profile?: Profile;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  save: [profile: Partial<Profile>];
  cancel: [];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const isEditMode = computed(() => !!props.profile);
const isDirectProfile = computed(() => props.profile?.profileType === 'DirectProfile');
const isSystemProfile = computed(() => props.profile?.profileType === 'SystemProfile');
const isBuiltInProfile = computed(() => isDirectProfile.value || isSystemProfile.value);

const formData = ref({
  name: '',
  profileType: 'FixedProfile' as Profile['profileType'],
  color: 'blue',
  showInPopup: true,
  proxyType: 'HTTP',
  host: '',
  port: '',
  requiresAuth: false,
  username: '',
  password: '',
  pacScriptType: 'url' as 'url' | 'data',
  pacUrl: '',
  pacScript: '',
  bypassList: '',
  testUrl: 'https://www.google.com/generate_204', // Default for HTTP/HTTPS
});

const errors = ref<Record<string, string>>({});
const saving = ref(false);
const testing = ref(false);
const testResult = ref<{ success: boolean; message: string } | null>(null);
const showBypassList = ref(false);

// User-creatable profile types (excludes built-in Direct and System)
const creatableProfileTypeOptions = [
  { 
    label: 'Fixed Server', 
    value: 'FixedProfile',
    description: 'Route all traffic through a single proxy server'
  },
  { 
    label: 'Auto Switch', 
    value: 'SwitchProfile',
    description: 'Automatically switch between proxies based on URL patterns'
  },
  { 
    label: 'PAC Script', 
    value: 'PacProfile',
    description: 'Use a Proxy Auto-Configuration script for advanced routing'
  },
];

// All profile types (for display when editing built-in profiles)
const allProfileTypeOptions = [
  { 
    label: 'Direct Connection', 
    value: 'DirectProfile',
    description: 'Bypass all proxies and connect directly to the internet'
  },
  { 
    label: 'System Proxy', 
    value: 'SystemProfile',
    description: 'Use the operating system\'s proxy settings'
  },
  ...creatableProfileTypeOptions,
];

// When creating new profiles, only show creatable types
const profileTypeOptions = computed(() => {
  if (isEditMode.value) {
    return allProfileTypeOptions;
  }
  return creatableProfileTypeOptions;
});

const proxyProtocolOptions = [
  { label: 'HTTP', value: 'HTTP' },
  { label: 'HTTPS', value: 'HTTPS' },
  { label: 'SOCKS4', value: 'SOCKS4' },
  { label: 'SOCKS5', value: 'SOCKS5' },
];

const colorOptions = [
  { label: '🔵 Blue', value: 'blue' },
  { label: '🟢 Green', value: 'green' },
  { label: '🟣 Purple', value: 'purple' },
  { label: '🔴 Red', value: 'red' },
  { label: '🟡 Yellow', value: 'yellow' },
  { label: '⚫ Gray', value: 'gray' },
];

const isFixedProfile = computed(() => formData.value.profileType === 'FixedProfile');
const isPacProfile = computed(() => formData.value.profileType === 'PacProfile');
const isSwitchProfile = computed(() => formData.value.profileType === 'SwitchProfile');

// Test URL placeholder based on proxy type
const testUrlPlaceholder = computed(() => {
  const proxyType = formData.value.proxyType;
  if (proxyType === 'SOCKS4' || proxyType === 'SOCKS5') {
    return '8.8.8.8 (IP address)';
  }
  return 'https://www.google.com/generate_204';
});

// Default test target based on proxy type
const defaultTestTarget = computed(() => {
  const proxyType = formData.value.proxyType;
  if (proxyType === 'SOCKS4' || proxyType === 'SOCKS5') {
    return '8.8.8.8'; // Google Public DNS - reliable, always available
  }
  return 'https://www.google.com/generate_204'; // Google no-content endpoint
});

function handleProfileTypeChange() {
  // Clear type-specific errors when changing profile type
  errors.value = { name: errors.value.name };
  testResult.value = null;
}

function validateForm(): boolean {
  errors.value = {};
  
  if (!formData.value.name.trim()) {
    errors.value.name = 'Profile name is required';
  }
  
  if (isFixedProfile.value) {
    if (!formData.value.host.trim()) {
      errors.value.host = 'Host is required';
    }
    if (!formData.value.port) {
      errors.value.port = 'Port is required';
    } else if (Number(formData.value.port) < 1 || Number(formData.value.port) > 65535) {
      errors.value.port = 'Port must be between 1 and 65535';
    }
    
    if (formData.value.requiresAuth) {
      if (!formData.value.username.trim()) {
        errors.value.username = 'Username is required';
      }
      if (!formData.value.password) {
        errors.value.password = 'Credentials are required';
      }
    }
  }
  
  if (isPacProfile.value && formData.value.pacScriptType === 'url') {
    if (!formData.value.pacUrl.trim()) {
      errors.value.pacUrl = 'PAC URL is required';
    } else if (!formData.value.pacUrl.match(/^https?:\/\//)) {
      errors.value.pacUrl = 'Must be a valid HTTP/HTTPS URL';
    }
  }
  
  return Object.keys(errors.value).length === 0;
}

function buildProfile(): Partial<Profile> {
  const base = {
    name: formData.value.name.trim(),
    profileType: formData.value.profileType,
    color: formData.value.color,
    showInPopup: formData.value.showInPopup,
  };
  
  switch (formData.value.profileType) {
    case 'FixedProfile':
      return {
        ...base,
        profileType: 'FixedProfile',
        proxyType: formData.value.proxyType,
        host: formData.value.host.trim(),
        port: Number(formData.value.port),
        ...(formData.value.requiresAuth && {
          username: formData.value.username,
          password: formData.value.password,
        }),
        ...(formData.value.bypassList && {
          bypassList: formData.value.bypassList
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
            .map(pattern => ({
              conditionType: 'BypassCondition',
              pattern
            })),
        }),
      } as Partial<FixedProfile>;
      
    case 'PacProfile':
      return {
        ...base,
        profileType: 'PacProfile',
        ...(formData.value.pacScriptType === 'url'
          ? { pacUrl: formData.value.pacUrl }
          : { pacScript: formData.value.pacScript }
        ),
      } as Partial<PacProfile>;
      
    case 'SwitchProfile':
      return {
        ...base,
        profileType: 'SwitchProfile',
        rules: [],
      } as Partial<SwitchProfile>;
      
    default:
      return base;
  }
}

async function handleSave() {
  if (!validateForm()) return;
  
  saving.value = true;
  try {
    const profile = buildProfile();
    emit('save', profile);
    // Parent will close the dialog after successful save
  } finally {
    saving.value = false;
  }
}

function handleCancel() {
  emit('cancel');
  resetForm();
}

function resetForm() {
  formData.value = {
    name: '',
    profileType: 'FixedProfile',
    color: 'blue',
    showInPopup: true,
    proxyType: 'HTTP',
    host: '',
    port: '',
    requiresAuth: false,
    username: '',
    password: '',
    pacScriptType: 'url',
    pacUrl: '',
    pacScript: '',
    bypassList: '',
    testUrl: 'https://www.google.com/generate_204',
  };
  errors.value = {};
  testResult.value = null;
  showBypassList.value = false;
}

async function testConnection() {
  if (!formData.value.host || !formData.value.port) {
    testResult.value = { success: false, message: 'Enter host and port first' };
    return;
  }
  
  testing.value = true;
  testResult.value = null;
  
  const proxyType = formData.value.proxyType;
  const isSocks = proxyType === 'SOCKS4' || proxyType === 'SOCKS5';
  
  // Get test target (use custom or default)
  const testTarget = formData.value.testUrl.trim() || defaultTestTarget.value;
  
  try {
    // Build test proxy config
    const testConfig: chrome.proxy.ProxyConfig = {
      mode: 'fixed_servers',
      rules: {
        singleProxy: {
          scheme: proxyType.toLowerCase() as 'http' | 'https' | 'socks4' | 'socks5',
          host: formData.value.host,
          port: Number(formData.value.port),
        },
      },
    };
    
    // Temporarily apply the proxy
    await chrome.proxy.settings.set({ value: testConfig, scope: 'regular' });
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      if (isSocks) {
        // For SOCKS proxies, test with a simple HTTP request to the target
        // If testTarget is an IP, try to reach it via HTTP
        const testUrl = testTarget.startsWith('http') ? testTarget : `http://${testTarget}`;
        const response = await fetch(testUrl, {
          method: 'HEAD',
          signal: controller.signal,
          mode: 'no-cors', // Avoid CORS issues when testing IPs
        });
        
        clearTimeout(timeoutId);
        
        // For SOCKS, if we didn't timeout, consider it success
        testResult.value = {
          success: true,
          message: 'Connected successfully',
        };
      } else {
        // For HTTP/HTTPS proxies, test with standard request
        const response = await fetch(testTarget, {
          method: 'GET',
          signal: controller.signal,
          // Note: Proxy auth is handled by Chrome if configured
        });
      
        clearTimeout(timeoutId);
        
        // Status 204 (No Content) is expected from this endpoint
        const success = response.status === 204 || response.ok;
        testResult.value = {
          success,
          message: success ? 'Connected successfully' : `HTTP ${response.status}`,
        };
        
        // If auth is required and not provided, Chrome will show auth dialog
        if (response.status === 407) {
          testResult.value = {
            success: false,
            message: 'Proxy authentication required',
          };
        }
      }
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      const errName = (error as { name?: string } | undefined)?.name;
      if (errName === 'AbortError') {
        testResult.value = { success: false, message: 'Connection timeout' };
      } else {
        testResult.value = { success: false, message: 'Connection failed' };
      }
    }
  } catch (error) {
    testResult.value = { success: false, message: 'Test failed' };
  } finally {
    // Restore original proxy settings
    try {
      const { activeProfileId } = await chrome.storage.sync.get('activeProfileId');
      const { profiles } = await chrome.storage.local.get('profiles');
      if (profiles && activeProfileId) {
        const activeProfile = (profiles as Profile[]).find((p: Profile) => p.id === activeProfileId);
        if (activeProfile) {
          // Restore active profile (implementation would need full proxy logic)
          await chrome.runtime.sendMessage({ action: 'restoreProxy' });
        }
      }
    } catch (error) {
      // Ignore restoration errors
    }
    
    testing.value = false;
  }
}

// Load profile data when editing
watch(() => props.profile, (profile) => {
  if (profile) {
    formData.value.name = profile.name;
    formData.value.profileType = profile.profileType;
    formData.value.color = profile.color || 'blue';
    formData.value.showInPopup = profile.showInPopup !== false; // Default to true
    
    if (profile.profileType === 'FixedProfile') {
      formData.value.proxyType = profile.proxyType || 'HTTP';
      formData.value.host = profile.host || '';
      formData.value.port = String(profile.port || '');
      formData.value.requiresAuth = !!(profile.username || profile.password);
      formData.value.username = profile.username || '';
      formData.value.password = profile.password || '';
      if (profile.bypassList && Array.isArray(profile.bypassList)) {
        // Convert BypassCondition array to comma-separated string
        formData.value.bypassList = profile.bypassList
          .map((condition: { pattern?: string }) => condition.pattern || '')
          .filter(pattern => pattern)
          .join(', ');
        showBypassList.value = profile.bypassList.length > 0;
      }
    } else if (profile.profileType === 'PacProfile') {
      if ('pacUrl' in profile && profile.pacUrl) {
        formData.value.pacScriptType = 'url';
        formData.value.pacUrl = profile.pacUrl;
      } else if ('pacScript' in profile && profile.pacScript) {
        formData.value.pacScriptType = 'data';
        formData.value.pacScript = profile.pacScript;
      }
    }
  }
}, { immediate: true });

// Update test URL when proxy type changes
watch(() => formData.value.proxyType, (newType) => {
  // Only update if field is empty or contains a default value
  const currentValue = formData.value.testUrl.trim();
  const isDefaultHttpUrl = currentValue === 'https://www.google.com/generate_204' || currentValue === '';
  const isDefaultSocksIp = currentValue === '8.8.8.8' || currentValue === '';
  
  // Update to new default if current value is a default or empty
  if (isDefaultHttpUrl || isDefaultSocksIp) {
    formData.value.testUrl = defaultTestTarget.value;
  }
});

// Reset when dialog closes
watch(isOpen, (open) => {
  if (!open && !isEditMode.value) {
    resetForm();
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
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
