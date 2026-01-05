<template>
  <Card padding="lg">
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h3 class="text-lg font-semibold mb-2">Quick Start Templates</h3>
        <p class="text-sm text-text-secondary">
          Create profiles from pre-configured templates
        </p>
      </div>

      <!-- Template Grid -->
      <div class="grid gap-4 md:grid-cols-2">
        <Card
          v-for="template in templates"
          :key="template.id"
          variant="outline"
          padding="md"
          hover="lift"
          class="cursor-pointer transition-all"
          @click="selectTemplate(template)"
        >
          <div class="flex items-start gap-3">
            <div :class="getIconClass(template.category)">
              <component :is="template.icon" class="h-5 w-5" />
            </div>
            
            <div class="flex-1 min-w-0">
              <h4 class="font-semibold text-sm mb-1">{{ template.name }}</h4>
              <p class="text-xs text-text-secondary mb-3">{{ template.description }}</p>
              
              <div class="flex items-center gap-2">
                <Badge :variant="getCategoryVariant(template.category)" size="xs">
                  {{ template.category }}
                </Badge>
                <Badge variant="secondary" size="xs">
                  {{ getProfileTypeLabel(template.profileType) }}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Custom Template Dialog -->
      <Dialog
        v-model="showTemplateDialog"
        :title="`Create from Template: ${selectedTemplate?.name}`"
        size="md"
        confirm-text="Create Profile"
        confirm-variant="success"
        @confirm="createFromTemplate"
      >
        <div v-if="selectedTemplate" class="space-y-4">
          <Input
            v-model="templateForm.name"
            label="Profile Name"
            :placeholder="selectedTemplate.name"
            required
          />
          
          <!-- Template-specific fields -->
          <div v-if="requiresHost" class="space-y-4">
            <Input
              v-model="templateForm.host"
              label="Proxy Host"
              placeholder="proxy.example.com"
              required
            >
              <template #prefix>
                <Server class="h-4 w-4 text-text-tertiary" />
              </template>
            </Input>
            
            <Input
              v-model="templateForm.port"
              type="number"
              label="Port"
              :placeholder="String(selectedTemplate.defaultPort || 8080)"
              required
            />
            
            <div v-if="selectedTemplate.supportsAuth" class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium">Require Authentication</span>
                <Switch v-model="templateForm.requiresAuth" size="sm" />
              </div>
              
              <Transition name="expand">
                <div v-if="templateForm.requiresAuth" class="grid grid-cols-2 gap-3">
                  <Input
                    v-model="templateForm.username"
                    label="Username"
                    placeholder="username"
                  />
                  <Input
                    v-model="templateForm.password"
                    type="password"
                    label="Password"
                    placeholder="••••••••"
                  />
                </div>
              </Transition>
            </div>
          </div>
          
          <div v-if="selectedTemplate.configurable" class="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-900">
            <div class="flex items-start gap-2">
              <Info class="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p class="text-xs text-blue-700 dark:text-blue-300">
                {{ selectedTemplate.note }}
              </p>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Briefcase, Home, Globe, Shield, Zap, Server, Wifi, Lock, Info,
} from 'lucide-vue-next';
import { Card, Badge, Dialog, Input, Switch, Button } from '@/components/ui';
import type { Profile } from '@/core/schema';

interface ProfileTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Work' | 'Personal' | 'Development' | 'Security';
  icon: any;
  profileType: Profile['profileType'];
  defaultPort?: number;
  supportsAuth?: boolean;
  configurable: boolean;
  note?: string;
  config: Partial<Profile>;
}

const emit = defineEmits<{
  create: [profile: Partial<Profile>];
}>();

const templates: ProfileTemplate[] = [
  {
    id: 'work-http',
    name: 'Corporate HTTP Proxy',
    description: 'Standard HTTP proxy for corporate networks',
    category: 'Work',
    icon: Briefcase,
    profileType: 'FixedProfile',
    defaultPort: 8080,
    supportsAuth: true,
    configurable: true,
    note: 'Commonly used in corporate environments. Contact IT for server details.',
    config: {
      profileType: 'FixedProfile',
      proxyType: 'HTTP',
      color: 'blue',
    },
  },
  {
    id: 'work-https',
    name: 'Secure Corporate Proxy',
    description: 'HTTPS proxy with encryption',
    category: 'Work',
    icon: Lock,
    profileType: 'FixedProfile',
    defaultPort: 8443,
    supportsAuth: true,
    configurable: true,
    note: 'Uses SSL/TLS encryption for secure communication.',
    config: {
      profileType: 'FixedProfile',
      proxyType: 'HTTPS',
      color: 'green',
    },
  },
  {
    id: 'home-direct',
    name: 'Direct Connection',
    description: 'No proxy, direct internet access',
    category: 'Personal',
    icon: Home,
    profileType: 'DirectProfile',
    configurable: false,
    config: {
      profileType: 'DirectProfile',
      name: 'Direct',
      color: 'gray',
    },
  },
  {
    id: 'dev-localhost',
    name: 'Local Development Proxy',
    description: 'Proxy for localhost testing (Charles, Fiddler)',
    category: 'Development',
    icon: Server,
    profileType: 'FixedProfile',
    defaultPort: 8888,
    supportsAuth: false,
    configurable: true,
    note: 'Common port for debugging tools like Charles Proxy (8888) or Fiddler (8888).',
    config: {
      profileType: 'FixedProfile',
      proxyType: 'HTTP',
      host: '127.0.0.1',
      color: 'purple',
    },
  },
  {
    id: 'socks5-vpn',
    name: 'SOCKS5 VPN',
    description: 'Full-tunnel VPN using SOCKS5',
    category: 'Security',
    icon: Shield,
    profileType: 'FixedProfile',
    defaultPort: 1080,
    supportsAuth: true,
    configurable: true,
    note: 'SOCKS5 provides better performance and supports UDP.',
    config: {
      profileType: 'FixedProfile',
      proxyType: 'SOCKS5',
      color: 'red',
    },
  },
  {
    id: 'auto-switch',
    name: 'Rule-Based Auto Switch',
    description: 'Automatically switch based on URL patterns',
    category: 'Work',
    icon: Zap,
    profileType: 'SwitchProfile',
    configurable: false,
    note: 'Configure rules after creating the profile.',
    config: {
      profileType: 'SwitchProfile',
      rules: [],
      color: 'yellow',
    },
  },
  {
    id: 'system-proxy',
    name: 'System Proxy Settings',
    description: 'Use operating system proxy configuration',
    category: 'Personal',
    icon: Globe,
    profileType: 'SystemProfile',
    configurable: false,
    config: {
      profileType: 'SystemProfile',
      name: 'System Proxy',
      color: 'gray',
    },
  },
  {
    id: 'pac-script',
    name: 'PAC Script',
    description: 'Custom proxy auto-config script',
    category: 'Development',
    icon: Wifi,
    profileType: 'PacProfile',
    configurable: false,
    note: 'Advanced users only. Configure PAC script after creating.',
    config: {
      profileType: 'PacProfile',
      color: 'indigo',
    },
  },
];

const showTemplateDialog = ref(false);
const selectedTemplate = ref<ProfileTemplate | null>(null);
const templateForm = ref({
  name: '',
  host: '',
  port: '',
  requiresAuth: false,
  username: '',
  password: '',
});

const requiresHost = computed(() => 
  selectedTemplate.value?.configurable && 
  selectedTemplate.value.profileType === 'FixedProfile' &&
  !('host' in selectedTemplate.value.config)
);

function getIconClass(category: string) {
  const classes = {
    Work: 'w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center',
    Personal: 'w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center',
    Development: 'w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center',
    Security: 'w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center',
  };
  return classes[category as keyof typeof classes] || classes.Personal;
}

function getCategoryVariant(category: string) {
  const variants = {
    Work: 'default',
    Personal: 'success',
    Development: 'warning',
    Security: 'danger',
  };
  return variants[category as keyof typeof variants] || 'secondary';
}

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

function selectTemplate(template: ProfileTemplate) {
  selectedTemplate.value = template;
  templateForm.value = {
    name: template.name,
    host: '',
    port: String(template.defaultPort || ''),
    requiresAuth: false,
    username: '',
    password: '',
  };
  
  if (template.configurable) {
    showTemplateDialog.value = true;
  } else {
    // Create directly without dialog
    createFromTemplate();
  }
}

function createFromTemplate() {
  if (!selectedTemplate.value) return;
  
  const profile: Partial<Profile> = {
    ...selectedTemplate.value.config,
    name: templateForm.value.name || selectedTemplate.value.name,
  };
  
  // Add template-specific fields
  if (requiresHost.value && selectedTemplate.value.profileType === 'FixedProfile') {
    Object.assign(profile, {
      host: templateForm.value.host,
      port: Number(templateForm.value.port),
      ...(templateForm.value.requiresAuth && {
        username: templateForm.value.username,
        password: templateForm.value.password,
      }),
    });
  }
  
  emit('create', profile);
  showTemplateDialog.value = false;
  selectedTemplate.value = null;
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
  max-height: 200px;
}
</style>
