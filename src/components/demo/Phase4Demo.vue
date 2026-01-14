<template>
  <div class="min-h-screen bg-bg-secondary p-6">
    <div class="max-w-6xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold mb-2">
            Phase 4 Demo - Profile Management
          </h1>
          <p class="text-text-secondary">
            Editor, Import/Export, Templates components
          </p>
        </div>
        <ThemeToggle
          variant="ghost"
          size="md"
        />
      </div>

      <!-- Quick Actions -->
      <section>
        <h2 class="text-xl font-semibold mb-4">
          Profile Actions
        </h2>
        <Card padding="lg">
          <div class="flex flex-wrap gap-3">
            <Button @click="showEditor = true">
              <Plus class="h-4 w-4" />
              Create New Profile
            </Button>
            <Button
              variant="secondary"
              @click="showTemplates = true"
            >
              <Sparkles class="h-4 w-4" />
              Use Template
            </Button>
            <Button
              variant="outline"
              @click="editSampleProfile"
            >
              <Edit class="h-4 w-4" />
              Edit Sample Profile
            </Button>
          </div>
        </Card>
      </section>

      <!-- Profile Editor Demo -->
      <ProfileEditor
        v-model="showEditor"
        :profile="editingProfile"
        @save="handleSaveProfile"
        @cancel="handleCancelEdit"
      />

      <!-- Templates Section -->
      <Dialog
        v-model="showTemplates"
        title="Profile Templates"
        size="xl"
        :hide-footer="true"
      >
        <ProfileTemplates @create="handleCreateFromTemplate" />
      </Dialog>

      <!-- Current Profiles -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">
            Current Profiles
          </h2>
          <Badge variant="secondary">
            {{ profiles.length }} profiles
          </Badge>
        </div>
        
        <ProfileList
          :profiles="profiles"
          :active-profile-id="activeProfileId"
          :show-actions="true"
          @select="handleSelectProfile"
          @edit="handleEditProfile"
          @delete="handleDeleteProfile"
        />
      </section>

      <!-- Import/Export Section -->
      <section>
        <h2 class="text-xl font-semibold mb-4">
          Import & Export
        </h2>
        <ProfileImportExport
          :profiles="profiles"
          @import="handleImportProfiles"
          @export-complete="handleExportComplete"
        />
      </section>

      <!-- Toast Notifications -->
      <Toast
        ref="toastRef"
        position="bottom-right"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/explicit-function-return-type */
import { ref } from 'vue';
import { Plus, Sparkles, Edit } from 'lucide-vue-next';
import { Card, Button, Badge, Dialog, Toast } from '@/components/ui';
import { ThemeToggle } from '@/components/layout';
import { ProfileList } from '@/components/profile';
import ProfileEditor from '@/components/profile/ProfileEditor.vue';
import ProfileImportExport from '@/components/profile/ProfileImportExport.vue';
import ProfileTemplates from '@/components/profile/ProfileTemplates.vue';
import type { Profile, FixedProfile } from '@/core/schema';
import { generateId } from '@/lib/utils';

const toastRef = ref<InstanceType<typeof Toast>>();
const showEditor = ref(false);
const showTemplates = ref(false);
const editingProfile = ref<Profile | undefined>();
const activeProfileId = ref('profile-2');

const profiles = ref<Profile[]>([
  {
    id: 'profile-1',
    name: 'Direct',
    profileType: 'DirectProfile',
    color: 'gray',
  },
  {
    id: 'profile-2',
    name: 'Work Proxy',
    profileType: 'FixedProfile',
    proxyType: 'HTTP',
    host: 'proxy.company.com',
    port: 8080,
    color: 'blue',
  } as FixedProfile,
  {
    id: 'profile-3',
    name: 'Smart Rules',
    profileType: 'SwitchProfile',
    rules: [
      {
        id: 'rule-1',
        condition: { conditionType: 'HostWildcardCondition', pattern: '*.company.com' },
        profileId: 'profile-2'
      },
    ],
    color: 'purple',
  },
  {
    id: 'profile-4',
    name: 'Development',
    profileType: 'FixedProfile',
    proxyType: 'HTTP',
    host: '127.0.0.1',
    port: 8888,
    color: 'green',
  } as FixedProfile,
]);

function handleSaveProfile(profile: Partial<Profile>) {
  if (editingProfile.value) {
    // Update existing
    const index = profiles.value.findIndex(p => p.id === editingProfile.value!.id);
    if (index !== -1) {
      profiles.value[index] = {
        ...profiles.value[index],
        ...profile,
      };
      toastRef.value?.success(`Profile "${profile.name}" updated`, 'Saved', 3000);
    }
  } else {
    // Create new
    const newProfile: Profile = {
      id: generateId('profile'),
      ...profile,
    } as Profile;
    profiles.value.push(newProfile);
    toastRef.value?.success(`Profile "${profile.name}" created`, 'Created', 3000);
  }
  
  showEditor.value = false;
  editingProfile.value = undefined;
}

function handleCancelEdit() {
  editingProfile.value = undefined;
}

function handleCreateFromTemplate(profile: Partial<Profile>) {
  const newProfile: Profile = {
    id: generateId('profile'),
    ...profile,
  } as Profile;
  profiles.value.push(newProfile);
  toastRef.value?.success(`Profile "${profile.name}" created from template`, 'Created', 3000);
  showTemplates.value = false;
}

function editSampleProfile() {
  editingProfile.value = profiles.value[1]; // Edit Work Proxy
  showEditor.value = true;
}

function handleSelectProfile(profile: Profile) {
  activeProfileId.value = profile.id;
  toastRef.value?.info(`Switched to "${profile.name}"`, 'Profile Changed', 2000);
}

function handleEditProfile(profile: Profile) {
  editingProfile.value = profile;
  showEditor.value = true;
}

function handleDeleteProfile(profile: Profile) {
  const index = profiles.value.findIndex(p => p.id === profile.id);
  if (index !== -1) {
    profiles.value.splice(index, 1);
    toastRef.value?.success(`Profile "${profile.name}" deleted`, 'Deleted', 2000);
  }
}

function handleImportProfiles(importedProfiles: Profile[], replace: boolean) {
  if (replace) {
    profiles.value = importedProfiles;
    toastRef.value?.success(`Replaced with ${importedProfiles.length} profiles`, 'Imported', 3000);
  } else {
    profiles.value.push(...importedProfiles);
    toastRef.value?.success(`Added ${importedProfiles.length} profiles`, 'Imported', 3000);
  }
}

function handleExportComplete() {
  toastRef.value?.success('Profiles exported successfully', 'Export Complete', 2000);
}
</script>
