<template>
  <Card padding="lg" class="profile-import-export">
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h3 class="text-lg font-semibold mb-2">Import & Export Profiles</h3>
        <p class="text-sm text-text-secondary">
          Backup your profiles or import from another device
        </p>
      </div>

      <!-- Export Section -->
      <section>
        <h4 class="text-sm font-semibold mb-3 flex items-center gap-2">
          <Download class="h-4 w-4" />
          Export Profiles
        </h4>
        
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-md">
            <div>
              <p class="text-sm font-medium">Include all profiles</p>
              <p class="text-xs text-text-tertiary">Export {{ exportableCount }} profile(s)</p>
              <p class="text-xs text-slate-500 dark:text-zinc-600">Direct profile is excluded (always present)</p>
            </div>
            <Switch v-model="exportAll" />
          </div>
          
          <Transition name="expand">
            <div v-if="!exportAll" class="pl-4 border-l-2 border-blue-500">
              <p class="text-xs text-text-tertiary mb-2">Select profiles to export:</p>
              <div class="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                <label
                  v-for="profile in exportableProfiles"
                  :key="profile.id"
                  class="flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    :value="profile.id"
                    v-model="selectedProfiles"
                    class="rounded"
                  />
                  <span class="text-sm">{{ profile.name }}</span>
                  <Badge :variant="getProfileBadgeVariant(profile)" size="xs">
                    {{ getProfileTypeLabel(profile.profileType) }}
                  </Badge>
                </label>
              </div>
            </div>
          </Transition>
          
          <div class="flex gap-2">
            <Button
              @click="exportProfiles('json')"
              :disabled="!exportAll && selectedProfiles.length === 0"
            >
              <Download class="h-4 w-4" />
              Export as JSON
            </Button>
            <Button
              variant="outline"
              @click="exportProfiles('bak')"
              :disabled="!exportAll && selectedProfiles.length === 0"
            >
              <Download class="h-4 w-4" />
              Export as .BAK (Legacy)
            </Button>
            <Tooltip content="Copy profile data to clipboard">
              <Button
                variant="ghost"
                size="icon"
                @click="copyToClipboard"
                :disabled="!exportAll && selectedProfiles.length === 0"
              >
                <Copy class="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>
        </div>
      </section>

      <div class="border-t border-border"></div>

      <!-- Import Section -->
      <section>
        <h4 class="text-sm font-semibold mb-3 flex items-center gap-2">
          <Upload class="h-4 w-4" />
          Import Profiles
        </h4>
        
        <div class="space-y-4">
          <!-- Drop Zone -->
          <div
            :class="dropZoneClass"
            @drop.prevent="handleDrop"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @click="triggerFileInput"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept=".json,.bak"
              class="hidden"
              @change="handleFileSelect"
            />
            
            <div class="text-center">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-4">
                <Upload :class="uploadIconClass" />
              </div>
              
              <p class="text-sm font-medium mb-2">
                Drop file here or click to browse
              </p>
              <p class="text-xs text-text-tertiary">
                Supports .json (SwitchyMalaccamax) and .bak (Legacy SwitchyOmega)
              </p>
            </div>
          </div>
          
          <!-- File Info -->
          <Transition name="fade">
            <Card v-if="selectedFile" variant="outline" padding="md">
              <div class="flex items-start justify-between">
                <div class="flex items-start gap-3">
                  <FileJson class="h-8 w-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div>
                    <p class="text-sm font-medium">{{ selectedFile.name }}</p>
                    <p class="text-xs text-text-tertiary">{{ formatFileSize(selectedFile.size) }}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-7 w-7"
                  @click="clearFile"
                >
                  <X class="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </Transition>
          
          <!-- Parse Results -->
          <Transition name="fade">
            <div v-if="parseResult" class="space-y-3">
              <Card
                :variant="parseResult.success ? 'default' : 'outline'"
                :class="parseResult.success ? 'border-green-500' : 'border-red-500'"
                padding="md"
              >
                <div class="flex items-start gap-3">
                  <component
                    :is="parseResult.success ? CheckCircle : AlertCircle"
                    :class="parseResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
                    class="h-5 w-5 flex-shrink-0"
                  />
                  <div>
                    <p class="text-sm font-medium">
                      {{ parseResult.message }}
                    </p>
                    <p v-if="parseResult.profiles.length > 0" class="text-xs text-text-tertiary mt-1">
                      Found {{ parseResult.profiles.length }} profile(s)
                    </p>
                  </div>
                </div>
              </Card>
              
              <!-- Profile Preview -->
              <div v-if="parseResult.success && parseResult.profiles.length > 0" class="space-y-2">
                <p class="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                  Profiles to import:
                </p>
                <div class="max-h-48 overflow-y-auto scrollbar-thin space-y-2">
                  <Card
                    v-for="(profile, index) in parseResult.profiles"
                    :key="index"
                    variant="outline"
                    padding="sm"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <component :is="getProfileIcon(profile.profileType)" class="h-4 w-4 text-text-tertiary" />
                        <span class="text-sm font-medium">{{ profile.name }}</span>
                      </div>
                      <Badge :variant="getProfileBadgeVariant(profile)" size="xs">
                        {{ getProfileTypeLabel(profile.profileType) }}
                      </Badge>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </Transition>
          
          <!-- Import Actions -->
          <div v-if="parseResult?.success" class="flex items-center justify-between pt-2">
            <div class="flex items-center gap-2">
              <Switch v-model="replaceExisting" size="sm" />
              <span class="text-xs text-text-tertiary">Replace existing profiles</span>
            </div>
            
            <div class="flex gap-2">
              <Button variant="ghost" @click="clearImport">
                Cancel
              </Button>
              <Button
                variant="success"
                @click="confirmImport"
                :loading="importing"
              >
                <Upload class="h-4 w-4" />
                Import {{ parseResult.profiles.length }} Profile(s)
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Download, Upload, Copy, FileJson, X, CheckCircle, AlertCircle,
  Activity, Circle, Server, Globe,
} from 'lucide-vue-next';
import { Card, Button, Switch, Badge, Tooltip } from '@/components/ui';
import { copyToClipboard as copyText } from '@/lib/utils';
import type { Profile } from '@/core/schema';
import { Logger } from '@/utils/Logger';

Logger.setComponentPrefix('ProfileImportExport');

interface Props {
  profiles: Profile[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  import: [profiles: Profile[], replace: boolean];
  exportComplete: [];
}>();

const exportAll = ref(true);
const selectedProfiles = ref<string[]>([]);
const isDragging = ref(false);
const selectedFile = ref<File | null>(null);
const parseResult = ref<{
  success: boolean;
  message: string;
  profiles: Profile[];
} | null>(null);
const replaceExisting = ref(false);
const importing = ref(false);
const fileInputRef = ref<HTMLInputElement>();

const dropZoneClass = computed(() => [
  'border-2 border-dashed rounded-lg p-8 transition-all duration-200 cursor-pointer',
  isDragging.value
    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
    : 'border-border hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-900',
]);

const uploadIconClass = computed(() => [
  'h-8 w-8 transition-transform duration-200',
  isDragging.value ? 'text-blue-600 dark:text-blue-400 scale-110' : 'text-text-tertiary',
]);

const exportableProfiles = computed(() => {
  // Exclude Direct profile as it's always present and should not be exported
  return props.profiles.filter(p => p.name !== 'Direct');
});

const exportableCount = computed(() => exportableProfiles.value.length);

function getProfileTypeLabel(type: Profile['profileType']): string {
  const labels = {
    DirectProfile: 'Direct',
    SystemProfile: 'System',
    FixedProfile: 'Fixed',
    SwitchProfile: 'Switch',
    PacProfile: 'PAC',
  };
  return labels[type] || type;
}

function getProfileBadgeVariant(profile: Profile) {
  const variants = {
    DirectProfile: 'secondary',
    SystemProfile: 'secondary',
    FixedProfile: 'default',
    SwitchProfile: 'success',
    PacProfile: 'warning',
  };
  return variants[profile.profileType] || 'default';
}

function getProfileIcon(type: Profile['profileType']) {
  const icons = {
    DirectProfile: Circle,
    SystemProfile: Globe,
    FixedProfile: Server,
    SwitchProfile: Activity,
    PacProfile: Globe,
  };
  return icons[type] || Server;
}

async function exportProfiles(format: 'json' | 'bak' = 'json') {
  const profilesToExport = exportAll.value
    ? exportableProfiles.value
    : exportableProfiles.value.filter(p => selectedProfiles.value.includes(p.id));
  
  let data: any;
  let filename: string;
  let mimeType: string;
  let fileExtension: string;
  
  if (format === 'bak') {
    // Convert to legacy SwitchyOmega .bak format
    data = convertToOmegaFormat(profilesToExport);
    filename = `SwitchyOmega_${Date.now()}.bak`;
    mimeType = 'application/octet-stream';
    fileExtension = '.bak';
  } else {
    // Modern JSON format
    data = {
      version: '1.0.0',
      exported: new Date().toISOString(),
      profiles: profilesToExport,
    };
    filename = `switchymalaccamax-profiles-${Date.now()}.json`;
    mimeType = 'application/json';
    fileExtension = '.json';
  }
  
  const content = JSON.stringify(data, null, 2);
  
  try {
    // Use Chrome's File System Access API for save dialog
    const opts = {
      suggestedName: filename,
      types: [{
        description: format === 'bak' ? 'Legacy Backup Files' : 'JSON Files',
        accept: { [mimeType]: [fileExtension] }
      }]
    };
    
    // @ts-ignore - showSaveFilePicker is available in Chrome
    const handle = await window.showSaveFilePicker(opts);
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
    
    Logger.info('Profiles exported successfully');
  } catch (err: any) {
    if (err.name === 'AbortError') {
      Logger.info('Export cancelled by user');
      return;
    }
    
    // Fallback to download if File System Access API fails
    Logger.info('Using fallback download method');
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  emit('exportComplete');
}

function convertToOmegaFormat(profiles: Profile[]): any {
  // Convert our modern format to legacy SwitchyOmega .bak format
  const omegaConfig: any = {
    schemaVersion: 2,
    '+proxy': {},
  };
  
  for (const profile of profiles) {
    const key = profile.id.replace('imported-', '');
    
    if (profile.profileType === 'DirectProfile') {
      omegaConfig['+proxy'][key] = {
        name: profile.name,
        profileType: 'DirectProfile',
        color: profile.color || 'gray',
      };
    } else if (profile.profileType === 'SystemProfile') {
      omegaConfig['+proxy'][key] = {
        name: profile.name,
        profileType: 'SystemProfile',
        color: profile.color || 'gray',
      };
    } else if (profile.profileType === 'FixedProfile' && 'host' in profile) {
      omegaConfig['+proxy'][key] = {
        name: profile.name,
        profileType: 'FixedProfile',
        color: profile.color || 'blue',
        fallbackProxy: {
          scheme: profile.proxyType?.toLowerCase() || 'http',
          host: profile.host,
          port: profile.port,
        },
        bypassList: (profile as any).bypassList || [],
      };
    } else if (profile.profileType === 'SwitchProfile' && 'rules' in profile) {
      omegaConfig['+proxy'][key] = {
        name: profile.name,
        profileType: 'SwitchProfile',
        color: profile.color || 'green',
        defaultProfileName: (profile as any).defaultProfileName || 'direct',
        rules: (profile as any).rules || [],
      };
    } else if (profile.profileType === 'PacProfile' && 'pacScript' in profile) {
      omegaConfig['+proxy'][key] = {
        name: profile.name,
        profileType: 'PacProfile',
        color: profile.color || 'purple',
        pacScript: (profile as any).pacScript || '',
      };
    }
  }
  
  return omegaConfig;
}

async function copyToClipboard() {
  const profilesToExport = exportAll.value
    ? props.profiles
    : props.profiles.filter(p => selectedProfiles.value.includes(p.id));
  
  const data = {
    version: '1.0.0',
    exported: new Date().toISOString(),
    profiles: profilesToExport,
  };
  
  await copyText(JSON.stringify(data, null, 2));
}

function triggerFileInput() {
  fileInputRef.value?.click();
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    handleFile(file);
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false;
  const file = event.dataTransfer?.files[0];
  if (file && (file.name.endsWith('.json') || file.name.endsWith('.bak'))) {
    handleFile(file);
  }
}

async function handleFile(file: File) {
  selectedFile.value = file;
  parseResult.value = null;
  
  const isBakFile = file.name.endsWith('.bak');
  
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    // Support multiple formats
    let profiles: Profile[] = [];
    
    if (isBakFile || (data['+proxy'] && typeof data['+proxy'] === 'object')) {
      // Legacy SwitchyOmega .bak format or Omega format
      profiles = convertFromOmegaFormat(data);
      if (profiles.length > 0) {
        // Filter out Direct profile as it's always present
        profiles = profiles.filter(p => p.name !== 'Direct');
        parseResult.value = {
          success: true,
          message: `Legacy format detected - converted ${profiles.length} profile(s)`,
          profiles,
        };
        return;
      }
    } else if (Array.isArray(data)) {
      // Direct array of profiles
      profiles = data;
    } else if (data.profiles && Array.isArray(data.profiles)) {
      // Wrapped format { profiles: [...] }
      profiles = data.profiles;
    }
    
    // Filter out Direct profile as it's always present
    profiles = profiles.filter(p => p.name !== 'Direct');
    
    if (profiles.length === 0) {
      parseResult.value = {
        success: false,
        message: 'No valid profiles found in file',
        profiles: [],
      };
      return;
    }
    
    parseResult.value = {
      success: true,
      message: `File parsed successfully - found ${profiles.length} profile(s)`,
      profiles,
    };
  } catch (error) {
    parseResult.value = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to parse file',
      profiles: [],
    };
  }
}

function convertFromOmegaFormat(data: any): Profile[] {
  // Convert SwitchyOmega/ZeroOmega .bak format to our format
  const profiles: Profile[] = [];
  const proxyConfig = data['+proxy'] || data;
  
  for (const [key, value] of Object.entries(proxyConfig)) {
    if (typeof value !== 'object' || value === null) continue;
    
    const config = value as any;
    const profileType = config.profileType || 'FixedProfile';
    
    // Convert based on profile type
    if (profileType === 'DirectProfile' || config.name === 'direct') {
      profiles.push({
        id: `imported-${key}`,
        name: config.name || 'Direct Connection',
        profileType: 'DirectProfile',
        color: config.color || 'gray',
      });
    } else if (profileType === 'SystemProfile' || config.name === 'system') {
      profiles.push({
        id: `imported-${key}`,
        name: config.name || 'System Proxy',
        profileType: 'SystemProfile',
        color: config.color || 'gray',
      });
    } else if (profileType === 'FixedProfile' || config.fallbackProxy) {
      const fallback = config.fallbackProxy || config;
      profiles.push({
        id: `imported-${key}`,
        name: config.name || key,
        profileType: 'FixedProfile',
        proxyType: (fallback.scheme || 'http').toUpperCase(),
        host: fallback.host || 'localhost',
        port: fallback.port || 8080,
        bypassList: config.bypassList || [],
        color: config.color || 'blue',
      });
    } else if (profileType === 'SwitchProfile' || config.rules) {
      profiles.push({
        id: `imported-${key}`,
        name: config.name || key,
        profileType: 'SwitchProfile',
        defaultProfileName: config.defaultProfileName || 'direct',
        rules: config.rules || [],
        color: config.color || 'green',
      });
    } else if (profileType === 'PacProfile' || config.pacScript) {
      profiles.push({
        id: `imported-${key}`,
        name: config.name || key,
        profileType: 'PacProfile',
        pacScript: config.pacScript || '',
        color: config.color || 'purple',
      });
    }
  }
  
  return profiles.filter(p => p.name !== 'direct' && p.name !== 'system' || profiles.length === 1);
}

function clearFile() {
  selectedFile.value = null;
  parseResult.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
}

function clearImport() {
  clearFile();
  replaceExisting.value = false;
}

async function confirmImport() {
  if (!parseResult.value?.profiles.length) return;
  
  importing.value = true;
  try {
    emit('import', parseResult.value.profiles, replaceExisting.value);
    clearImport();
  } finally {
    importing.value = false;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
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
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 300px;
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
