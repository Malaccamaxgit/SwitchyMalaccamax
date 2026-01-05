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
    <form @submit.prevent="handleSave" class="space-y-6">
      <!-- Basic Information -->
      <section>
        <h3 class="text-sm font-semibold mb-3">Basic Information</h3>
        <div class="space-y-4">
          <Input
            v-model="formData.name"
            label="Profile Name"
            placeholder="e.g., Work Proxy, Home VPN"
            hint="Give your profile a descriptive name"
            :error="errors.name"
            :disabled="isDirectProfile"
            required
          />
          
          <Select
            v-model="formData.profileType"
            :options="profileTypeOptions"
            label="Profile Type"
            hint="Choose how this profile handles connections"
            :error="errors.profileType"
            :disabled="isDirectProfile"
            required
            @change="handleProfileTypeChange"
          />
          
          <Select
            v-model="formData.color"
            :options="colorOptions"
            label="Color Tag"
            hint="Helps identify profiles visually"
          />
        </div>
      </section>

      <!-- Fixed Server Settings -->
      <section v-if="isFixedProfile">
        <h3 class="text-sm font-semibold mb-3">Server Settings</h3>
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
              <p class="text-sm font-medium">Require Authentication</p>
              <p class="text-xs text-text-tertiary">Proxy requires username and password</p>
            </div>
            <Switch v-model="formData.requiresAuth" />
          </div>
          
          <Transition name="expand">
            <div v-if="formData.requiresAuth" class="grid grid-cols-2 gap-4 pl-4 border-l-2 border-blue-500">
              <Input
                v-model="formData.username"
                label="Username"
                placeholder="username"
                :error="errors.username"
                :required="formData.requiresAuth"
              >
                <template #prefix>
                  <User class="h-4 w-4 text-text-tertiary" />
                </template>
              </Input>
              
              <Input
                v-model="formData.password"
                type="password"
                label="Password"
                placeholder="••••••••"
                :error="errors.password"
                :required="formData.requiresAuth"
              >
                <template #prefix>
                  <Lock class="h-4 w-4 text-text-tertiary" />
                </template>
              </Input>
            </div>
          </Transition>
        </div>
      </section>

      <!-- PAC Script Settings -->
      <section v-if="isPacProfile">
        <h3 class="text-sm font-semibold mb-3">PAC Script</h3>
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
            hint="URL to PAC script file"
            :error="errors.pacUrl"
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
              class="w-full px-3 py-2 text-sm font-mono rounded-md border border-border bg-bg-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="function FindProxyForURL(url, host) {&#10;  return 'DIRECT';&#10;}"
            ></textarea>
            <p class="text-xs text-text-tertiary mt-1.5">JavaScript function to determine proxy</p>
          </div>
        </div>
      </section>

      <!-- Switch Profile Settings -->
      <section v-if="isSwitchProfile">
        <h3 class="text-sm font-semibold mb-3">Auto-Switch Rules</h3>
        <div class="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-900">
          <div class="flex items-start gap-3">
            <Info class="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                Rules will be configured separately
              </p>
              <p class="text-xs text-blue-700 dark:text-blue-300">
                After creating the profile, you can add conditions and target profiles for automatic switching.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Advanced Settings -->
      <section>
        <h3 class="text-sm font-semibold mb-3">Advanced Settings</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-md">
            <div>
              <p class="text-sm font-medium">Bypass List</p>
              <p class="text-xs text-text-tertiary">Domains that skip proxy</p>
            </div>
            <Switch v-model="showBypassList" size="sm" />
          </div>
          
          <Transition name="expand">
            <div v-if="showBypassList" class="pl-4 border-l-2 border-slate-300 dark:border-slate-700">
              <Input
                v-model="formData.bypassList"
                placeholder="localhost, 127.0.0.1, *.local"
                hint="Comma-separated list of hosts/patterns"
              />
            </div>
          </Transition>
        </div>
      </section>

      <!-- Test Connection -->
      <section v-if="isFixedProfile" class="pt-4 border-t border-border">
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
              <Badge v-if="testResult" :variant="testResult.success ? 'success' : 'danger'" size="sm">
                {{ testResult.message }}
              </Badge>
            </Transition>
          </div>
        </div>
      </section>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
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
const isDirectProfile = computed(() => props.profile?.name === 'Direct');

const formData = ref({
  name: '',
  profileType: 'FixedProfile' as Profile['profileType'],
  color: 'blue',
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
});

const errors = ref<Record<string, string>>({});
const saving = ref(false);
const testing = ref(false);
const testResult = ref<{ success: boolean; message: string } | null>(null);
const showBypassList = ref(false);

const profileTypeOptions = [
  { label: 'Direct Connection', value: 'DirectProfile' },
  { label: 'Fixed Server', value: 'FixedProfile' },
  { label: 'Auto Switch', value: 'SwitchProfile' },
  { label: 'PAC Script', value: 'PacProfile' },
  { label: 'System Proxy', value: 'SystemProfile' },
];

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
        errors.value.password = 'Password is required';
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
          bypassList: formData.value.bypassList.split(',').map(s => s.trim()).filter(Boolean),
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
  
  try {
    // Simulate connection test (in real app, would use background script)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock result - in production, actually test the proxy
    const success = Math.random() > 0.3;
    testResult.value = {
      success,
      message: success ? 'Connected' : 'Connection failed',
    };
  } finally {
    testing.value = false;
  }
}

// Load profile data when editing
watch(() => props.profile, (profile) => {
  if (profile) {
    formData.value.name = profile.name;
    formData.value.profileType = profile.profileType;
    formData.value.color = profile.color || 'blue';
    
    if (profile.profileType === 'FixedProfile') {
      formData.value.proxyType = profile.proxyType || 'HTTP';
      formData.value.host = profile.host || '';
      formData.value.port = String(profile.port || '');
      formData.value.requiresAuth = !!(profile.username || profile.password);
      formData.value.username = profile.username || '';
      formData.value.password = profile.password || '';
      if (profile.bypassList) {
        formData.value.bypassList = profile.bypassList.join(', ');
        showBypassList.value = true;
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
