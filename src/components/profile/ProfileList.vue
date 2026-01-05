<template>
  <div class="profile-list">
    <!-- Search -->
    <div v-if="searchable" class="mb-4">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search profiles..."
          class="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-border bg-bg-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredProfiles.length === 0" class="text-center py-12">
      <div class="flex justify-center mb-4">
        <div class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Inbox class="h-8 w-8 text-slate-400" />
        </div>
      </div>
      <h3 class="text-lg font-semibold mb-2">No profiles found</h3>
      <p class="text-sm text-text-secondary mb-4">
        {{ searchQuery ? 'Try adjusting your search' : 'Get started by creating a profile' }}
      </p>
      <Button v-if="!searchQuery" @click="$emit('create')">
        <Plus class="h-4 w-4" />
        Create Profile
      </Button>
    </div>

    <!-- Profile List -->
    <div v-else :class="listClass">
      <TransitionGroup
        name="profile-list"
        tag="div"
        class="space-y-2"
      >
        <ProfileCard
          v-for="profile in paginatedProfiles"
          :key="profile.id"
          :profile="profile"
          :is-active="activeProfileId === profile.id"
          :selectable="selectable"
          :compact="compact"
          :show-actions="showActions"
          :show-metadata="showMetadata"
          :requests-today="profileStats[profile.id]?.requestsToday"
          @select="handleSelect"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
          @more="$emit('more', $event)"
        />
      </TransitionGroup>

      <!-- Load More -->
      <div v-if="hasMore" class="mt-4 text-center">
        <Button
          variant="ghost"
          size="sm"
          @click="loadMore"
          :loading="loading"
        >
          Load More
        </Button>
      </div>

      <!-- Results Info -->
      <div v-if="showResultsInfo" class="mt-4 text-center text-xs text-text-tertiary">
        Showing {{ paginatedProfiles.length }} of {{ filteredProfiles.length }} profiles
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search, Inbox, Plus } from 'lucide-vue-next';
import ProfileCard from './ProfileCard.vue';
import { Button } from '@/components/ui';
import type { Profile } from '@/core/schema';

interface ProfileStats {
  [profileId: string]: {
    requestsToday?: number;
    lastUsed?: Date;
  };
}

interface Props {
  profiles: Profile[];
  activeProfileId?: string;
  selectable?: boolean;
  compact?: boolean;
  showActions?: boolean;
  showMetadata?: boolean;
  searchable?: boolean;
  showResultsInfo?: boolean;
  pageSize?: number;
  profileStats?: ProfileStats;
}

const props = withDefaults(defineProps<Props>(), {
  selectable: true,
  compact: false,
  showActions: true,
  showMetadata: true,
  searchable: true,
  showResultsInfo: false,
  pageSize: 20,
  profileStats: () => ({}),
});

const emit = defineEmits<{
  select: [profile: Profile];
  edit: [profile: Profile];
  delete: [profile: Profile];
  more: [profile: Profile];
  create: [];
}>();

const searchQuery = ref('');
const currentPage = ref(1);
const loading = ref(false);

const filteredProfiles = computed(() => {
  if (!searchQuery.value) return props.profiles;
  
  const query = searchQuery.value.toLowerCase();
  return props.profiles.filter(profile => 
    profile.name.toLowerCase().includes(query) ||
    ('host' in profile && profile.host?.toLowerCase().includes(query))
  );
});

const paginatedProfiles = computed(() => {
  const end = currentPage.value * props.pageSize;
  return filteredProfiles.value.slice(0, end);
});

const hasMore = computed(() => 
  paginatedProfiles.value.length < filteredProfiles.value.length
);

const listClass = computed(() => [
  'scrollbar-thin',
  props.compact ? 'max-h-96 overflow-y-auto' : '',
]);

function handleSelect(profile: Profile) {
  emit('select', profile);
}

async function loadMore() {
  loading.value = true;
  // Simulate loading delay for smooth UX
  await new Promise(resolve => setTimeout(resolve, 150));
  currentPage.value++;
  loading.value = false;
}
</script>

<style scoped>
.profile-list-enter-active,
.profile-list-leave-active {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.profile-list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.profile-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.profile-list-move {
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
