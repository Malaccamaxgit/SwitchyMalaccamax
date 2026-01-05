<template>
  <Dialog
    v-model="isOpen"
    title="Network Monitor"
    description="Real-time network request analytics"
    size="xl"
    :show-confirm="false"
    cancel-text="Close"
  >
    <div class="space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-4 gap-4">
        <Card padding="md">
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600 dark:text-green-400">{{ stats.successful }}</div>
            <div class="text-xs text-text-secondary mt-1">Successful</div>
          </div>
        </Card>
        <Card padding="md">
          <div class="text-center">
            <div class="text-3xl font-bold text-red-600 dark:text-red-400">{{ stats.failed }}</div>
            <div class="text-xs text-text-secondary mt-1">Failed</div>
          </div>
        </Card>
        <Card padding="md">
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ stats.total }}</div>
            <div class="text-xs text-text-secondary mt-1">Total</div>
          </div>
        </Card>
        <Card padding="md">
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">{{ successRate }}%</div>
            <div class="text-xs text-text-secondary mt-1">Success Rate</div>
          </div>
        </Card>
      </div>

      <!-- Controls -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <Button 
            :variant="isMonitoring ? 'destructive' : 'default'" 
            size="sm" 
            @click="toggleMonitoring"
          >
            <component :is="isMonitoring ? Square : Play" class="h-4 w-4" />
            {{ isMonitoring ? 'Stop' : 'Start' }} Monitoring
          </Button>
          <Button variant="outline" size="sm" @click="clearLogs">
            <Trash2 class="h-4 w-4" />
            Clear
          </Button>
          <Button variant="outline" size="sm" @click="exportAnalytics" :disabled="requests.length === 0">
            <Download class="h-4 w-4" />
            Export
          </Button>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-text-secondary">Filter:</span>
          <select 
            v-model="filter"
            class="px-3 py-1.5 text-sm border border-gray-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Requests</option>
            <option value="failed">Failed Only</option>
            <option value="successful">Successful Only</option>
          </select>
        </div>
      </div>

      <!-- Request List -->
      <Card padding="none">
        <div class="max-h-96 overflow-y-auto scrollbar-thin">
          <table class="w-full text-sm">
            <thead class="bg-bg-secondary border-b border-border sticky top-0">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider w-16">Status</th>
                <th class="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider">URL</th>
                <th class="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider w-24">Method</th>
                <th class="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider w-32">Time</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr 
                v-for="request in filteredRequests" 
                :key="request.id"
                class="hover:bg-bg-secondary"
              >
                <td class="px-4 py-2">
                  <Badge 
                    :variant="request.status >= 200 && request.status < 300 ? 'success' : 'danger'"
                    size="sm"
                  >
                    {{ request.status }}
                  </Badge>
                </td>
                <td class="px-4 py-2">
                  <div class="truncate max-w-md" :title="request.url">
                    {{ request.url }}
                  </div>
                </td>
                <td class="px-4 py-2">
                  <span class="text-text-secondary">{{ request.method }}</span>
                </td>
                <td class="px-4 py-2">
                  <span class="text-text-tertiary text-xs">{{ formatTime(request.timestamp) }}</span>
                </td>
              </tr>
              <tr v-if="filteredRequests.length === 0">
                <td colspan="4" class="px-4 py-8 text-center text-text-tertiary">
                  {{ isMonitoring ? 'No requests yet...' : 'Start monitoring to see network requests' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <!-- Status Bar -->
      <div class="flex items-center justify-between text-xs text-text-secondary">
        <div>
          <span v-if="isMonitoring" class="flex items-center gap-1">
            <span class="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Monitoring active
          </span>
          <span v-else class="flex items-center gap-1">
            <span class="inline-block w-2 h-2 rounded-full bg-gray-400"></span>
            Monitoring stopped
          </span>
        </div>
        <div>
          Showing {{ filteredRequests.length }} of {{ requests.length }} requests
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { Play, Square, Trash2, Activity, Download } from 'lucide-vue-next';
import { Dialog, Card, Button, Badge } from '@/components/ui';

interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  status: number;
  timestamp: Date;
}

interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const requests = ref<NetworkRequest[]>([]);
const isMonitoring = ref(false);
const filter = ref<'all' | 'failed' | 'successful'>('all');

const stats = computed(() => {
  const successful = requests.value.filter(r => r.status >= 200 && r.status < 300).length;
  const failed = requests.value.filter(r => r.status >= 400 || r.status === 0).length;
  return {
    successful,
    failed,
    total: requests.value.length
  };
});

const successRate = computed(() => {
  if (stats.value.total === 0) return 0;
  return Math.round((stats.value.successful / stats.value.total) * 100);
});

const filteredRequests = computed(() => {
  if (filter.value === 'all') return requests.value;
  if (filter.value === 'failed') {
    return requests.value.filter(r => r.status >= 400 || r.status === 0);
  }
  return requests.value.filter(r => r.status >= 200 && r.status < 300);
});

let requestListener: ((details: any) => void) | null = null;

function toggleMonitoring() {
  if (isMonitoring.value) {
    stopMonitoring();
  } else {
    startMonitoring();
  }
}

function startMonitoring() {
  console.log('[SwitchyMalaccamax:NetworkMonitor] Starting network monitoring');
  isMonitoring.value = true;
  
  // Listen to completed requests
  requestListener = (details: chrome.webRequest.WebResponseCacheDetails) => {
    requests.value.unshift({
      id: `${Date.now()}-${Math.random()}`,
      url: details.url,
      method: details.method,
      status: details.statusCode || 0,
      timestamp: new Date()
    });
    
    // Keep only last 100 requests
    if (requests.value.length > 100) {
      requests.value = requests.value.slice(0, 100);
    }
  };
  
  chrome.webRequest.onCompleted.addListener(
    requestListener,
    { urls: ['<all_urls>'] }
  );
}

function stopMonitoring() {
  console.log('[SwitchyMalaccamax:NetworkMonitor] Stopping network monitoring');
  isMonitoring.value = false;
  
  if (requestListener) {
    chrome.webRequest.onCompleted.removeListener(requestListener);
    requestListener = null;
  }
}

function clearLogs() {
  console.log('[SwitchyMalaccamax:NetworkMonitor] Clearing logs');
  requests.value = [];
}

async function exportAnalytics() {
  console.log('[SwitchyMalaccamax:NetworkMonitor] Exporting analytics');
  
  // Prepare CSV data
  const headers = ['Timestamp', 'Status', 'Method', 'URL'];
  const rows = requests.value.map(r => [
    r.timestamp.toISOString(),
    r.status.toString(),
    r.method,
    r.url
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  // Add summary statistics at the top
  const summary = [
    '# Network Request Analytics Summary',
    `# Total Requests: ${stats.value.total}`,
    `# Successful Requests: ${stats.value.successful}`,
    `# Failed Requests: ${stats.value.failed}`,
    `# Success Rate: ${successRate.value}%`,
    `# Exported: ${new Date().toISOString()}`,
    '',
    ''
  ].join('\n');
  
  const fullContent = summary + csvContent;
  
  try {
    // Use Chrome's File System Access API for save dialog
    const opts = {
      suggestedName: `network-analytics-${new Date().toISOString().replace(/[:.]/g, '-')}.csv`,
      types: [{
        description: 'CSV Files',
        accept: { 'text/csv': ['.csv'] }
      }]
    };
    
    // @ts-ignore - showSaveFilePicker is available in Chrome
    const handle = await window.showSaveFilePicker(opts);
    const writable = await handle.createWritable();
    await writable.write(fullContent);
    await writable.close();
    
    console.log('[SwitchyMalaccamax:NetworkMonitor] Analytics exported successfully');
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.log('[SwitchyMalaccamax:NetworkMonitor] Export cancelled by user');
      return;
    }
    
    // Fallback to download if File System Access API fails
    console.log('[SwitchyMalaccamax:NetworkMonitor] Using fallback download method');
    const blob = new Blob([fullContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `network-analytics-${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

function formatTime(timestamp: Date): string {
  return timestamp.toLocaleTimeString();
}

// Stop monitoring when dialog closes
watch(isOpen, (open) => {
  if (!open && isMonitoring.value) {
    stopMonitoring();
  }
});

// Cleanup on unmount
onUnmounted(() => {
  if (isMonitoring.value) {
    stopMonitoring();
  }
});
</script>
