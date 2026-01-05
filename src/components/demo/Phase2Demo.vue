<template>
  <div class="min-h-screen bg-bg-secondary p-6">
    <div class="max-w-5xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold mb-2">Phase 2 Demo - Connection & Profile Components</h1>
          <p class="text-text-secondary">ConnectionStatusCard + Profile management components</p>
        </div>
        <ThemeToggle variant="ghost" size="md" />
      </div>

      <!-- Connection Status Card -->
      <section>
        <h2 class="text-xl font-semibold mb-4">Connection Status Card</h2>
        <div class="grid gap-4 lg:grid-cols-2">
          <ConnectionStatusCard
            status="active"
            connection-mode="Manual"
            active-profile="Work Proxy"
            :request-count="1247"
            :last-switched="new Date(Date.now() - 1000 * 60 * 15)"
            proxy-type="HTTP"
            proxy-host="proxy.company.com:8080"
            :rules-count="12"
          />
          <ConnectionStatusCard
            status="auto"
            connection-mode="Auto Switch"
            active-profile="Smart Rules"
            :request-count="3429"
            :last-switched="new Date(Date.now() - 1000 * 60 * 2)"
            proxy-type="HTTPS"
            proxy-host="auto-proxy.example.com:443"
            :rules-count="8"
          />
          <ConnectionStatusCard
            status="direct"
            connection-mode="Direct"
            :request-count="521"
          />
          <ConnectionStatusCard
            status="error"
            connection-mode="Manual"
            active-profile="Failed Proxy"
            proxy-type="SOCKS5"
            proxy-host="unreachable.proxy.com:1080"
          />
        </div>
      </section>

      <!-- Profile Switcher -->
      <section>
        <h2 class="text-xl font-semibold mb-4">Profile Switcher Dropdown</h2>
        <div class="flex gap-4">
          <ProfileSwitcher
            :profiles="sampleProfiles"
            :active-profile-id="activeProfileId"
            @select="handleProfileSelect"
            @manage="handleManageProfiles"
          />
          <ProfileSwitcher
            :profiles="sampleProfiles"
            :active-profile-id="activeProfileId"
            variant="ghost"
            size="sm"
            :searchable="false"
            @select="handleProfileSelect"
            @manage="handleManageProfiles"
          />
        </div>
      </section>

      <!-- Profile Cards -->
      <section>
        <h2 class="text-xl font-semibold mb-4">Profile Cards</h2>
        <div class="grid gap-3">
          <ProfileCard
            v-for="profile in sampleProfiles.slice(0, 4)"
            :key="profile.id"
            :profile="profile"
            :is-active="activeProfileId === profile.id"
            :show-actions="true"
            :requests-today="Math.floor(Math.random() * 5000)"
            @select="handleProfileSelect"
            @edit="handleEditProfile"
            @delete="handleDeleteProfile"
          />
        </div>
      </section>

      <!-- Profile List -->
      <section>
        <h2 class="text-xl font-semibold mb-4">Profile List with Search</h2>
        <Card padding="lg">
          <ProfileList
            :profiles="sampleProfiles"
            :active-profile-id="activeProfileId"
            :show-actions="true"
            :profile-stats="profileStats"
            @select="handleProfileSelect"
            @edit="handleEditProfile"
            @delete="handleDeleteProfile"
            @create="handleCreateProfile"
          />
        </Card>
      </section>

      <!-- Compact Mode -->
      <section>
        <h2 class="text-xl font-semibold mb-4">Compact Mode (Popup/Sidebar)</h2>
        <Card padding="md" class="max-w-sm">
          <h3 class="font-semibold mb-3">Quick Switch</h3>
          <ProfileList
            :profiles="sampleProfiles"
            :active-profile-id="activeProfileId"
            :compact="true"
            :searchable="false"
            :show-actions="false"
            :show-results-info="false"
            @select="handleProfileSelect"
          />
        </Card>
      </section>

      <!-- Notifications -->
      <div v-if="notification" class="fixed bottom-4 right-4 max-w-sm">
        <Card padding="md" shadow="lg" class="border-blue-500">
          <div class="flex items-start gap-3">
            <Check class="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p class="font-medium">{{ notification }}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Check } from 'lucide-vue-next';
import { Card } from '@/components/ui';
import { ThemeToggle } from '@/components/layout';
import { ConnectionStatusCard } from '@/components/status';
import { ProfileCard, ProfileList, ProfileSwitcher } from '@/components/profile';
import type { Profile } from '@/core/schema';

const activeProfileId = ref('profile-2');
const notification = ref('');

const sampleProfiles: Profile[] = [
  {
    id: 'profile-1',
    name: 'Direct',
    profileType: 'DirectProfile',
    color: 'gray',
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: 'profile-2',
    name: 'Work Proxy',
    profileType: 'FixedProfile',
    proxyType: 'HTTP',
    host: 'proxy.company.com',
    port: 8080,
    color: 'blue',
    lastUsed: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: 'profile-3',
    name: 'Smart Rules',
    profileType: 'SwitchProfile',
    rules: [
      { id: 'rule-1', condition: { conditionType: 'HostWildcardCondition', pattern: '*.company.com' }, profileId: 'profile-2' },
      { id: 'rule-2', condition: { conditionType: 'HostWildcardCondition', pattern: '*.google.com' }, profileId: 'profile-1' },
    ],
    color: 'purple',
    lastUsed: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: 'profile-4',
    name: 'Development',
    profileType: 'FixedProfile',
    proxyType: 'HTTPS',
    host: 'dev-proxy.local',
    port: 8443,
    color: 'green',
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: 'profile-5',
    name: 'China VPN',
    profileType: 'FixedProfile',
    proxyType: 'SOCKS5',
    host: 'vpn.example.com',
    port: 1080,
    color: 'red',
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
  {
    id: 'profile-6',
    name: 'System Settings',
    profileType: 'SystemProfile',
    color: 'gray',
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
  {
    id: 'profile-7',
    name: 'Testing Rules',
    profileType: 'SwitchProfile',
    rules: [
      { id: 'rule-3', condition: { conditionType: 'HostWildcardCondition', pattern: 'localhost' }, profileId: 'profile-1' },
    ],
    color: 'orange',
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 96),
  },
  {
    id: 'profile-8',
    name: 'Europe Proxy',
    profileType: 'FixedProfile',
    proxyType: 'HTTP',
    host: 'eu-proxy.example.com',
    port: 3128,
    color: 'indigo',
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 120),
  },
];

const profileStats = computed(() => ({
  'profile-1': { requestsToday: 521 },
  'profile-2': { requestsToday: 1247 },
  'profile-3': { requestsToday: 3429 },
  'profile-4': { requestsToday: 892 },
  'profile-5': { requestsToday: 156 },
  'profile-6': { requestsToday: 0 },
  'profile-7': { requestsToday: 42 },
  'profile-8': { requestsToday: 234 },
}));

function handleProfileSelect(profile: Profile) {
  activeProfileId.value = profile.id;
  showNotification(`Switched to "${profile.name}"`);
}

function handleEditProfile(profile: Profile) {
  showNotification(`Edit "${profile.name}"`);
}

function handleDeleteProfile(profile: Profile) {
  showNotification(`Delete "${profile.name}"`);
}

function handleManageProfiles() {
  showNotification('Opening profile management...');
}

function handleCreateProfile() {
  showNotification('Creating new profile...');
}

function showNotification(message: string) {
  notification.value = message;
  setTimeout(() => {
    notification.value = '';
  }, 2000);
}
</script>
