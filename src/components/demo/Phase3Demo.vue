<template>
  <div class="min-h-screen bg-bg-secondary p-6">
    <div class="max-w-6xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold mb-2">Phase 3 Demo - Essential Primitives</h1>
          <p class="text-text-secondary">Input, Select, Switch, Dialog, Tooltip, Toast components</p>
        </div>
        <ThemeToggle variant="ghost" size="md" />
      </div>

      <!-- Input Components -->
      <section>
        <h2 class="text-xl font-semibold mb-4">Input Component</h2>
        <Card padding="lg">
          <div class="grid gap-6 md:grid-cols-2">
            <Input
              v-model="form.username"
              label="Username"
              placeholder="Enter username"
              hint="Minimum 3 characters"
              required
            />
            
            <Input
              v-model="form.email"
              type="email"
              label="Email Address"
              placeholder="user@example.com"
              :error="emailError"
              required
            />
            
            <Input
              v-model="form.password"
              type="password"
              label="Password"
              placeholder="Enter password"
              hint="Use a strong password"
              required
            />
            
            <Input
              v-model="form.port"
              type="number"
              label="Proxy Port"
              placeholder="8080"
              prefix="Port"
            />
            
            <Input
              v-model="form.host"
              label="Proxy Host"
              placeholder="proxy.example.com"
            >
              <template #prefix>
                <Server class="h-4 w-4 text-text-tertiary" />
              </template>
            </Input>
            
            <Input
              v-model="form.search"
              type="search"
              placeholder="Search profiles..."
              :loading="searching"
            >
              <template #prefix>
                <Search class="h-4 w-4 text-text-tertiary" />
              </template>
            </Input>
          </div>
          
          <div class="mt-6 pt-6 border-t border-border">
            <h3 class="text-sm font-semibold mb-3">Input States</h3>
            <div class="grid gap-4 md:grid-cols-3">
              <Input
                modelValue="Disabled input"
                label="Disabled"
                disabled
              />
              <Input
                modelValue="Read-only value"
                label="Read Only"
                readonly
              />
              <Input
                modelValue="Error state"
                label="With Error"
                error="This field is required"
              />
            </div>
          </div>
        </Card>
      </section>

      <!-- Select Component -->
      <section>
        <h2 class="text-xl font-semibold mb-4">Select Component</h2>
        <Card padding="lg">
          <div class="grid gap-6 md:grid-cols-2">
            <Select
              v-model="form.proxyType"
              :options="proxyTypeOptions"
              label="Proxy Type"
              placeholder="Choose proxy type"
              hint="Select the protocol for your proxy"
              required
            />
            
            <Select
              v-model="form.country"
              :options="countryOptions"
              label="Server Location"
              placeholder="Select country"
              searchable
            />
            
            <Select
              v-model="form.profileType"
              :options="profileTypeOptions"
              label="Profile Type"
              placeholder="Choose profile type"
            />
            
            <Select
              v-model="form.theme"
              :options="['Light', 'Dark', 'System']"
              label="Theme Preference"
              :searchable="false"
            />
          </div>
          
          <div class="mt-6 pt-6 border-t border-border">
            <h3 class="text-sm font-semibold mb-3">Select States</h3>
            <div class="grid gap-4 md:grid-cols-2">
              <Select
                modelValue="HTTP"
                :options="['HTTP', 'HTTPS']"
                label="Disabled"
                disabled
              />
              <Select
                v-model="form.errorSelect"
                :options="['Option 1', 'Option 2']"
                label="With Error"
                error="Please select a valid option"
              />
            </div>
          </div>
        </Card>
      </section>

      <!-- Switch Component -->
      <section>
        <h2 class="text-xl font-semibold mb-4">Switch Component</h2>
        <Card padding="lg">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Enable Auto Switch</p>
                <p class="text-sm text-text-secondary">Automatically switch based on rules</p>
              </div>
              <Switch v-model="settings.autoSwitch" />
            </div>
            
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Dark Mode</p>
                <p class="text-sm text-text-secondary">Use dark theme for the interface</p>
              </div>
              <Switch v-model="settings.darkMode" />
            </div>
            
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Show Notifications</p>
                <p class="text-sm text-text-secondary">Display toast notifications for status changes</p>
              </div>
              <Switch v-model="settings.notifications" />
            </div>
            
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Sync Settings</p>
                <p class="text-sm text-text-secondary">Synchronize settings across devices</p>
              </div>
              <Switch v-model="settings.sync" size="sm" />
            </div>
            
            <div class="flex items-center justify-between opacity-50">
              <div>
                <p class="font-medium">Disabled Switch</p>
                <p class="text-sm text-text-secondary">This setting is locked</p>
              </div>
              <Switch :modelValue="true" disabled />
            </div>
          </div>
          
          <div class="mt-6 pt-6 border-t border-border">
            <h3 class="text-sm font-semibold mb-3">Switch Sizes</h3>
            <div class="flex items-center gap-6">
              <div class="flex items-center gap-2">
                <Switch v-model="sizeDemo.sm" size="sm" aria-label="Small switch" />
                <span class="text-sm">Small</span>
              </div>
              <div class="flex items-center gap-2">
                <Switch v-model="sizeDemo.md" size="md" aria-label="Medium switch" />
                <span class="text-sm">Medium</span>
              </div>
              <div class="flex items-center gap-2">
                <Switch v-model="sizeDemo.lg" size="lg" aria-label="Large switch" />
                <span class="text-sm">Large</span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <!-- Dialog Component -->
      <section>
        <h2 class="text-xl font-semibold mb-4">Dialog Component</h2>
        <Card padding="lg">
          <div class="flex flex-wrap gap-3">
            <Button @click="showDialog = true">
              Open Dialog
            </Button>
            <Button variant="destructive" @click="showDeleteDialog = true">
              Delete Confirmation
            </Button>
            <Button variant="secondary" @click="showFormDialog = true">
              Form Dialog
            </Button>
            <Button variant="ghost" @click="showLargeDialog = true">
              Large Dialog
            </Button>
          </div>

          <!-- Basic Dialog -->
          <Dialog
            v-model="showDialog"
            title="Confirm Action"
            description="Are you sure you want to perform this action?"
            @confirm="handleConfirm"
            @cancel="handleCancel"
          >
            <p class="text-sm text-text-secondary">
              This action will apply the selected proxy profile to all new connections.
              Existing connections will remain unchanged.
            </p>
          </Dialog>

          <!-- Delete Dialog -->
          <Dialog
            v-model="showDeleteDialog"
            title="Delete Profile"
            description="This action cannot be undone."
            confirm-text="Delete"
            confirm-variant="destructive"
            @confirm="handleDelete"
          >
            <p class="text-sm text-text-secondary">
              Are you sure you want to delete the profile "Work Proxy"?
              All associated rules and settings will be permanently removed.
            </p>
          </Dialog>

          <!-- Form Dialog -->
          <Dialog
            v-model="showFormDialog"
            title="Create New Profile"
            description="Enter details for the new proxy profile"
            size="lg"
            confirm-text="Create"
            confirm-variant="success"
            @confirm="handleCreateProfile"
          >
            <div class="space-y-4">
              <Input
                v-model="newProfile.name"
                label="Profile Name"
                placeholder="e.g., Work Proxy"
                required
              />
              <Select
                v-model="newProfile.type"
                :options="profileTypeOptions"
                label="Profile Type"
                required
              />
              <Input
                v-model="newProfile.host"
                label="Proxy Host"
                placeholder="proxy.example.com"
              />
              <Input
                v-model="newProfile.port"
                type="number"
                label="Port"
                placeholder="8080"
              />
            </div>
          </Dialog>

          <!-- Large Dialog -->
          <Dialog
            v-model="showLargeDialog"
            title="Import Profiles"
            size="xl"
            :hide-footer="true"
          >
            <div class="space-y-4">
              <p class="text-sm text-text-secondary">
                Upload a JSON file containing proxy profiles to import.
              </p>
              <div class="border-2 border-dashed border-border rounded-lg p-12 text-center">
                <Upload class="h-12 w-12 mx-auto text-text-tertiary mb-4" />
                <p class="text-sm font-medium mb-2">Drop files here or click to upload</p>
                <p class="text-xs text-text-tertiary">Supports JSON format only</p>
              </div>
            </div>
          </Dialog>
        </Card>
      </section>

      <!-- Tooltip Component -->
      <section>
        <h2 class="text-xl font-semibold mb-4">Tooltip Component</h2>
        <Card padding="lg">
          <div class="grid gap-8 md:grid-cols-2">
            <div>
              <h3 class="text-sm font-semibold mb-4">Tooltip Positions</h3>
              <div class="flex flex-col items-center gap-8 py-8">
                <Tooltip content="This tooltip appears on top" placement="top">
                  <Button>Hover (Top)</Button>
                </Tooltip>
                
                <div class="flex items-center gap-8">
                  <Tooltip content="Left aligned tooltip" placement="left">
                    <Button variant="secondary">Hover (Left)</Button>
                  </Tooltip>
                  
                  <Tooltip content="Right aligned tooltip" placement="right">
                    <Button variant="secondary">Hover (Right)</Button>
                  </Tooltip>
                </div>
                
                <Tooltip content="Bottom positioned tooltip" placement="bottom">
                  <Button>Hover (Bottom)</Button>
                </Tooltip>
              </div>
            </div>
            
            <div>
              <h3 class="text-sm font-semibold mb-4">Interactive Elements</h3>
              <div class="space-y-4">
                <div class="flex items-center gap-2">
                  <Tooltip content="Enable automatic proxy switching based on rules">
                    <Button variant="ghost" size="icon">
                      <HelpCircle class="h-4 w-4" />
                    </Button>
                  </Tooltip>
                  <span class="text-sm">Auto Switch Mode</span>
                </div>
                
                <div class="flex items-center gap-2">
                  <Tooltip content="Your proxy server address and port number">
                    <Info class="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </Tooltip>
                  <span class="text-sm">Proxy: proxy.example.com:8080</span>
                </div>
                
                <div class="flex items-center gap-2">
                  <Tooltip content="Click to copy proxy URL to clipboard" :delay="100">
                    <Button size="sm" variant="outline">
                      <Copy class="h-3 w-3" />
                      Copy URL
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <!-- Toast Component -->
      <section>
        <h2 class="text-xl font-semibold mb-4">Toast Notifications</h2>
        <Card padding="lg">
          <div class="flex flex-wrap gap-3">
            <Button @click="showSuccessToast">
              <CheckCircle class="h-4 w-4" />
              Success Toast
            </Button>
            <Button variant="destructive" @click="showErrorToast">
              <AlertCircle class="h-4 w-4" />
              Error Toast
            </Button>
            <Button variant="secondary" @click="showWarningToast">
              <AlertTriangle class="h-4 w-4" />
              Warning Toast
            </Button>
            <Button variant="ghost" @click="showInfoToast">
              <Info class="h-4 w-4" />
              Info Toast
            </Button>
            <Button variant="outline" @click="showMultipleToasts">
              Multiple Toasts
            </Button>
          </div>
        </Card>
      </section>

      <!-- Toast Container -->
      <Toast ref="toastRef" position="bottom-right" :max-toasts="5" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { 
  Server, Search, Upload, HelpCircle, Info, Copy,
  CheckCircle, AlertCircle, AlertTriangle
} from 'lucide-vue-next';
import { Card, Button, Input, Select, Switch, Dialog, Tooltip, Toast } from '@/components/ui';
import { ThemeToggle } from '@/components/layout';

const toastRef = ref<InstanceType<typeof Toast>>();

// Form state
const form = ref({
  username: '',
  email: '',
  password: '',
  port: '',
  host: '',
  search: '',
  proxyType: '',
  country: '',
  profileType: '',
  theme: 'System',
  errorSelect: '',
});

const emailError = ref('');

// Settings state
const settings = ref({
  autoSwitch: true,
  darkMode: false,
  notifications: true,
  sync: false,
});

const sizeDemo = ref({
  sm: true,
  md: true,
  lg: true,
});

// Dialog state
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const showFormDialog = ref(false);
const showLargeDialog = ref(false);

const newProfile = ref({
  name: '',
  type: '',
  host: '',
  port: '',
});

// Loading state
const searching = ref(false);

// Select options
const proxyTypeOptions = [
  { label: 'HTTP', value: 'http' },
  { label: 'HTTPS', value: 'https' },
  { label: 'SOCKS4', value: 'socks4' },
  { label: 'SOCKS5', value: 'socks5' },
];

const countryOptions = [
  'United States',
  'United Kingdom',
  'Germany',
  'France',
  'Japan',
  'Singapore',
  'Australia',
  'Canada',
  'Netherlands',
  'Switzerland',
];

const profileTypeOptions = [
  { label: 'Direct Connection', value: 'direct' },
  { label: 'Fixed Server', value: 'fixed' },
  { label: 'Auto Switch', value: 'switch' },
  { label: 'PAC Script', value: 'pac' },
];

function handleConfirm() {
  toastRef.value?.success('Action confirmed successfully');
}

function handleCancel() {
  toastRef.value?.info('Action cancelled');
}

function handleDelete() {
  toastRef.value?.success('Profile deleted', 'Success', 3000);
}

function handleCreateProfile() {
  if (!newProfile.value.name) {
    toastRef.value?.error('Profile name is required', 'Validation Error');
    return;
  }
  toastRef.value?.success(`Profile "${newProfile.value.name}" created`, 'Success');
  showFormDialog.value = false;
  newProfile.value = { name: '', type: '', host: '', port: '' };
}

function showSuccessToast() {
  toastRef.value?.success('Profile switched successfully', 'Switched to Work Proxy', 4000);
}

function showErrorToast() {
  toastRef.value?.error('Failed to connect to proxy server', 'Connection Error', 6000);
}

function showWarningToast() {
  toastRef.value?.warning('Proxy server is responding slowly', 'Performance Warning', 5000);
}

function showInfoToast() {
  toastRef.value?.info('Auto-switch rules updated', 'Rules Updated', 4000);
}

function showMultipleToasts() {
  toastRef.value?.info('Starting profile import...');
  setTimeout(() => {
    toastRef.value?.success('3 profiles imported');
  }, 1000);
  setTimeout(() => {
    toastRef.value?.warning('2 profiles skipped (duplicates)');
  }, 2000);
}
</script>
