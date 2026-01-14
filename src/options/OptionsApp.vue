<!-- eslint-disable vue/valid-v-for -->
<template>
  <div class="flex min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white font-sans antialiased">
    <!-- Sidebar -->
    <aside class="w-64 bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-zinc-900 flex flex-col flex-shrink-0">
      <!-- Header -->
      <div class="p-4 border-b border-gray-200 dark:border-zinc-900">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
            <Settings class="h-4 w-4 text-white" />
          </div>
          <span class="text-sm font-semibold tracking-tight">Settings</span>
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex-1 overflow-y-auto py-4 px-3">
        <!-- Settings Section -->
        <div class="mb-6">
          <div class="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-2 px-2">
            Configuration
          </div>
          <nav class="space-y-0.5">
            <!-- eslint-disable-next-line vue/valid-v-for -->
            <button
              v-for="(item, idx) in settingsNav"
              :key="item.id"
              :class="getSidebarItemClass(item.id)"
              class="w-full text-left px-2 py-1.5 rounded-md text-[13px] flex items-center gap-2 transition-all duration-200 relative"
              @click="currentView = item.id"
            >
              <div 
                v-if="currentView === item.id"
                class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-emerald-500 rounded-full"
              />
              <component
                :is="item.icon"
                class="h-3.5 w-3.5 flex-shrink-0"
              />
              <span class="tracking-tight">{{ item.label }}</span>
            </button>
          </nav>
        </div>

        <!-- Profiles Section -->
        <div>
          <div class="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-2 px-2">
            Profiles
          </div>
          <nav class="space-y-0.5">
            <!-- eslint-disable-next-line vue/valid-v-for -->
            <button
              v-for="(profile, idx) in sortedProfiles"
              :key="profile.id"
              :class="getSidebarItemClass(`profile-${profile.id}`)"
              class="w-full text-left px-2 py-1.5 rounded-md text-[13px] flex items-center gap-2 transition-all duration-200 group relative"
              @click="selectProfile(profile)"
            >
              <div 
                v-if="selectedProfile?.id === profile.id"
                class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-emerald-500 rounded-full"
              />
              <div 
                class="w-2 h-2 rounded-full flex-shrink-0"
                :style="{ backgroundColor: getProfileColor(profile) }"
              />
              <component
                :is="getProfileIcon(profile)"
                class="h-3.5 w-3.5 flex-shrink-0"
              />
              <span class="tracking-tight flex-1 truncate">{{ profile.name }}</span>
              
              <!-- Show in Popup toggle -->
              <button
                :class="profile.showInPopup !== false 
                  ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' 
                  : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'"
                class="text-[9px] px-1.5 py-0.5 rounded font-medium transition-colors flex-shrink-0"
                :title="profile.showInPopup !== false ? 'Click to hide from popup menu' : 'Click to show in popup menu'"
                @click.stop="toggleShowInPopup(profile)"
              >
                {{ profile.showInPopup !== false ? 'Visible' : 'Hidden' }}
              </button>
              
              <!-- Active profile indicator -->
              <div 
                v-if="activeProfileId === profile.id"
                class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"
              />
            </button>
            <button
              class="w-full text-left px-2 py-1.5 rounded-md text-[13px] flex items-center gap-2 text-emerald-400 hover:bg-zinc-950/50 transition-colors"
              @click="showProfileEditor = true"
            >
              <Plus class="h-3.5 w-3.5" />
              <span class="tracking-tight">New Profile</span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="border-t border-zinc-900">
        <div class="p-3 space-y-1">
          <button
            :disabled="savingChanges || !hasUnsavedChanges"
            class="w-full px-2 py-1.5 rounded-md text-[12px] font-medium flex items-center justify-center gap-2 transition-colors"
            :class="hasUnsavedChanges && !savingChanges 
              ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
              : 'bg-gray-300 dark:bg-zinc-950 text-gray-500 dark:text-zinc-600 cursor-not-allowed'"
            @click="applyChanges"
          >
            <Check
              v-if="!savingChanges"
              class="h-3.5 w-3.5"
            />
            <svg
              v-else
              class="animate-spin h-3.5 w-3.5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>{{ savingChanges ? 'Saving...' : 'Save Changes' }}</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto">
      <!-- Interface View -->
      <div
        v-if="currentView === 'interface'"
        class="max-w-3xl mx-auto p-8"
      >
        <h2 class="text-2xl font-semibold mb-8 tracking-tight">
          Interface
        </h2>
        
        <section class="mb-8">
          <h3 class="text-base font-medium mb-4 text-slate-900 dark:text-zinc-300">
            Misc Options
          </h3>
          <div class="space-y-3 bg-gray-50 dark:bg-zinc-950/30 border border-gray-200 dark:border-zinc-900 rounded-lg p-4">
            <label class="flex items-start gap-3 cursor-pointer group">
              <input
                v-model="settings.confirmDelete"
                type="checkbox" 
                class="mt-0.5 w-4 h-4 rounded border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-emerald-500 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
              <span class="text-[13px] text-slate-700 dark:text-zinc-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors leading-tight">
                Confirm before deleting profiles
              </span>
            </label>
          </div>
        </section>

        <section class="mb-8">
          <h3 class="text-base font-medium mb-4 text-slate-900 dark:text-zinc-300">
            Keyboard Shortcut
          </h3>
          <div class="bg-gray-50 dark:bg-zinc-950/30 border border-gray-200 dark:border-zinc-900 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-[13px] text-slate-700 dark:text-zinc-300 mb-1">
                  Quick Switch Popup
                </div>
                <div class="text-[11px] text-slate-500 dark:text-zinc-600">
                  Default: <span class="font-mono text-slate-600 dark:text-zinc-500">Alt+Shift+O</span>
                </div>
              </div>
              <button
                class="px-3 py-1.5 text-[12px] font-medium rounded-md bg-gray-200 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2"
                @click="configureShortcut"
              >
                <Settings class="h-3.5 w-3.5" />
                Configure
              </button>
            </div>
          </div>
        </section>

        <section>
          <h3 class="text-base font-medium mb-4 text-slate-900 dark:text-zinc-300">
            Switch Options
          </h3>
          <div class="bg-gray-50 dark:bg-zinc-950/30 border border-gray-200 dark:border-zinc-900 rounded-lg p-4 space-y-4">
            <div>
              <label class="text-[11px] text-slate-500 dark:text-zinc-500 uppercase tracking-wider font-semibold mb-2 block">Startup Profile</label>
              <select 
                v-model="settings.startupProfile" 
                class="w-full px-3 py-2 text-[13px] border border-gray-300 dark:border-zinc-900 rounded-md bg-white dark:bg-zinc-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              >
                <!-- eslint-disable-next-line vue/valid-v-for -->
                <option
                  v-for="p in profiles"
                  :key="p.id"
                  :value="p.id"
                >
                  {{ p.name }}
                </option>
              </select>
            </div>
          </div>
        </section>
      </div>

      <!-- General View -->
      <!-- Import/Export View -->
      <div
        v-else-if="currentView === 'import-export'"
        class="max-w-3xl mx-auto p-8"
      >
        <h2 class="text-2xl font-semibold mb-8 tracking-tight">
          Import/Export
        </h2>
        <div class="bg-gray-50 dark:bg-zinc-950/30 border border-gray-200 dark:border-zinc-900 rounded-lg p-6">
          <ProfileImportExport
            :profiles="profiles"
            @import="handleImportProfiles"
            @export-complete="handleExportComplete"
          />
        </div>
      </div>

      <!-- Theme View -->
      <div
        v-else-if="currentView === 'theme'"
        class="max-w-3xl mx-auto p-8"
      >
        <h2 class="text-2xl font-semibold mb-8 tracking-tight">
          Theme
        </h2>
        
        <section>
          <h3 class="text-base font-medium mb-4 text-slate-700 dark:text-zinc-300">
            Appearance
          </h3>
          <div class="bg-gray-50 dark:bg-zinc-950/30 border border-gray-200 dark:border-zinc-900 rounded-lg p-4">
            <div class="flex gap-2 mb-4">
              <button
                :class="settings.theme === 'light' ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'"
                class="flex-1 px-4 py-2.5 rounded-md text-[13px] font-medium transition-colors flex items-center justify-center gap-2"
                @click="setTheme('light')"
              >
                <Sun class="h-4 w-4" />
                Light
              </button>
              <button
                :class="settings.theme === 'dark' ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'"
                class="flex-1 px-4 py-2.5 rounded-md text-[13px] font-medium transition-colors flex items-center justify-center gap-2"
                @click="setTheme('dark')"
              >
                <Moon class="h-4 w-4" />
                Dark
              </button>
              <button
                :class="settings.theme === 'auto' ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'"
                class="flex-1 px-4 py-2.5 rounded-md text-[13px] font-medium transition-colors flex items-center justify-center gap-2"
                @click="setTheme('auto')"
              >
                <Monitor class="h-4 w-4" />
                Auto
              </button>
            </div>
            
            <div class="text-[11px] text-slate-500 dark:text-zinc-600 leading-relaxed">
              Dark mode is recommended for optimal contrast and readability. Auto mode adapts to your system preferences.
            </div>
          </div>
        </section>
      </div>

      <!-- Logs View -->
      <!-- Debug View (includes Logs) -->
      <div
        v-else-if="currentView === 'debug'"
        class="max-w-5xl mx-auto p-8"
      >
        <h2 class="text-2xl font-semibold mb-8 tracking-tight">
          Debug & Logs
        </h2>
        
        <!-- Extension Information -->
        <section class="mb-8">
          <h3 class="text-base font-medium mb-4 text-slate-900 dark:text-zinc-300">
            Extension Information
          </h3>
          <div class="bg-gray-50 dark:bg-zinc-950/30 border border-gray-200 dark:border-zinc-900 rounded-lg p-4 space-y-2">
            <div class="flex justify-between text-[13px]">
              <span class="text-slate-500 dark:text-zinc-500">Version:</span>
              <span class="text-slate-900 dark:text-white font-mono">{{ VERSION }}</span>
            </div>
            <div class="flex justify-between text-[13px]">
              <span class="text-slate-500 dark:text-zinc-500">Manifest Version:</span>
              <span class="text-slate-900 dark:text-white font-mono">{{ getManifestVersion() }}</span>
            </div>
            <div class="flex justify-between text-[13px]">
              <span class="text-slate-500 dark:text-zinc-500">Storage Used:</span>
              <span class="text-slate-900 dark:text-white font-mono">{{ storageUsed }}</span>
            </div>
          </div>
        </section>
        
        <!-- Log Viewer Section (moved to top) -->
        <section class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-medium text-slate-900 dark:text-zinc-300">
              Log Viewer
            </h3>
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-2">
                <label class="text-[13px] text-slate-600 dark:text-zinc-400">Export rows:</label>
                <input
                  v-model.number="logExportRowCount"
                  type="number"
                  min="10"
                  max="1000"
                  step="10"
                  class="w-20 px-2 py-1 text-[13px] rounded border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                >
              </div>
              <Button
                variant="outline"
                size="sm"
                :disabled="logs.length === 0"
                @click="exportLogsToFile"
              >
                <Download class="h-4 w-4" />
                Export to File
              </Button>
              <Button
                variant="outline"
                size="sm"
                :disabled="logs.length === 0"
                @click="clearLogs"
              >
                Clear
              </Button>
            </div>
          </div>

          <div
            ref="logsContainer"
            class="bg-gray-50 dark:bg-zinc-950/50 border border-gray-200 dark:border-zinc-900 rounded-lg p-4 min-h-[400px] max-h-[400px] overflow-y-auto"
          >
            <div
              v-if="logs.length === 0"
              class="flex items-center justify-center h-full text-slate-500 dark:text-zinc-600"
            >
              No logs captured yet. Actions will be logged here.
            </div>
            <div
              v-else
              class="space-y-1 font-mono text-xs"
            >
              <!-- eslint-disable-next-line vue/valid-v-for -->
              <div 
                v-for="(log, index) in logs" 
                :key="index"
                :class="{
                  'text-red-600 dark:text-red-400': log.level === 'ERROR',
                  'text-emerald-600 dark:text-emerald-400': log.level === 'INFO',
                  'text-yellow-600 dark:text-yellow-400': log.level === 'WARN',
                  'text-slate-500 dark:text-zinc-500': log.level === 'DEBUG'
                }"
                class="py-1 border-b border-gray-200 dark:border-zinc-900/30"
              >
                <span class="text-slate-500 dark:text-zinc-600">[{{ new Date(log.timestamp).toLocaleTimeString() }}]</span>
                <span class="text-slate-400 dark:text-zinc-500 ml-2">[{{ log.level }}]</span>
                <span class="text-slate-400 dark:text-zinc-500 ml-2">[{{ log.component }}]</span>
                <span class="ml-2">{{ log.message }}</span>
                <div
                  v-if="log.data"
                  class="ml-16 text-slate-500 dark:text-zinc-600 mt-1 break-all"
                >
                  {{ typeof log.data === 'object' ? JSON.stringify(log.data, null, 2) : log.data }}
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 text-xs text-slate-500 dark:text-zinc-600">
            <p>Showing {{ logs.length }} of {{ maxLogs }} maximum logs. Use "Export to File" to save logs for bug reports.</p>
          </div>
        </section>

        <!-- Logging Configuration Section (now below Log Viewer) -->
        <section class="mb-8">
          <h3 class="text-base font-medium mb-4 text-slate-900 dark:text-zinc-300">
            Logging Configuration
          </h3>
          <div class="bg-gray-50 dark:bg-zinc-950/30 border border-gray-200 dark:border-zinc-900 rounded-lg p-4">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Log Level Selector - Compact Design -->
              <div>
                <label class="text-[13px] font-medium text-slate-700 dark:text-zinc-300 block mb-2">
                  Log Level
                </label>
                <p class="text-[12px] text-slate-500 dark:text-zinc-500 mb-3">
                  Control verbosity for debugging. Changes apply immediately.
                </p>
                <div class="space-y-1.5">
                  <!-- eslint-disable-next-line vue/valid-v-for -->
                  <button
                    v-for="level in logLevels"
                    :key="level.value"
                    class="w-full flex items-center gap-2.5 px-3 py-2 rounded-md border transition-all text-left group"
                    :class="currentLogLevel === level.value 
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' 
                      : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-gray-300 dark:hover:border-zinc-700'"
                    @click="setLogLevel(level.value)"
                  >
                    <span class="text-base">{{ level.icon }}</span>
                    <span
                      class="text-[13px] font-medium flex-1"
                      :style="{ color: level.color }"
                    >
                      {{ level.name }}
                    </span>
                    <div
                      v-if="currentLogLevel === level.value"
                      class="w-2 h-2 rounded-full bg-emerald-500"
                    />
                  </button>
                </div>
                <div class="mt-3 p-2.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-md">
                  <p class="text-[11px] text-blue-700 dark:text-blue-400">
                    💡 Use <strong>Debug</strong> when reporting issues
                  </p>
                </div>
              </div>

              <!-- Max Log Lines Input -->
              <div>
                <label class="text-[13px] font-medium text-slate-700 dark:text-zinc-300 block mb-2">
                  Max Log Lines (Persistent Storage)
                </label>
                <p class="text-[12px] text-slate-500 dark:text-zinc-500 mb-3">
                  Maximum entries in storage. Older logs auto-removed (FIFO).
                </p>
                <div class="flex items-center gap-3">
                  <input
                    v-model.number="currentLogMaxLines"
                    type="number"
                    min="10"
                    max="50000"
                    step="100"
                    class="flex-1 px-3 py-2 text-[13px] rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    @blur="updateLogMaxLines"
                    @keyup.enter="updateLogMaxLines"
                  >
                  <Button
                    variant="outline"
                    size="sm"
                    @click="updateLogMaxLines"
                  >
                    Apply
                  </Button>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-zinc-500 mt-2">
                  Hard cap: 50,000 lines. Default: 1,000 lines.
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Proxy Conflict Testing Section -->
        <section class="mb-8">
          <h3 class="text-base font-medium mb-4 text-slate-900 dark:text-zinc-300">
            Proxy Conflict Testing
          </h3>
          <div class="bg-gray-50 dark:bg-zinc-950/30 border border-gray-200 dark:border-zinc-900 rounded-lg p-4">
            <div class="mb-4">
              <p class="text-[13px] text-slate-700 dark:text-zinc-400 mb-2">
                Test how the extension handles proxy conflicts by simulating a conflict warning in the popup.
              </p>
              <p class="text-[12px] text-slate-500 dark:text-zinc-500">
                This will display a conflict warning banner in the popup window without actually creating a real proxy conflict.
              </p>
            </div>
            <button
              class="w-full px-4 py-2.5 rounded-md text-[13px] font-medium transition-colors flex items-center justify-center gap-2"
              :class="testConflictActive 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                : 'bg-gray-200 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-800'"
              @click="toggleTestConflict"
            >
              <Bug class="h-4 w-4" />
              {{ testConflictActive ? '✓ Test Conflict Active' : 'Activate Test Conflict' }}
            </button>
            <div
              v-if="testConflictActive"
              class="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-md"
            >
              <p class="text-[12px] text-emerald-700 dark:text-emerald-400">
                ✓ Test conflict is active. Open the popup to see the conflict warning banner.
              </p>
            </div>
          </div>
        </section>



        <!-- Conflicts Section -->
        <section class="mb-8">
          <h3 class="text-base font-medium mb-4 text-slate-900 dark:text-zinc-300">
            Conflicts
          </h3>
          <div class="bg-gray-50 dark:bg-zinc-950/30 border border-gray-200 dark:border-zinc-900 rounded-lg p-4">
            <p class="text-[11px] text-slate-500 dark:text-zinc-600 leading-relaxed mb-4">
              Other apps may try to control proxy settings, causing conflicts. Ad blockers and 
              extensions may also use proxy settings. These conflicts are unavoidable due to browser limitations.
            </p>
            <div class="bg-red-100 dark:bg-red-950/30 border border-red-300 dark:border-red-900/50 rounded-lg p-3">
              <p class="text-[11px] text-red-800 dark:text-red-400 leading-relaxed">
                A red badge on the icon indicates another app has higher priority. Try uninstalling 
                other apps and reinstalling to raise SwitchyMalaccamax's priority.
              </p>
            </div>
          </div>
        </section>
      </div>

      <!-- Profile Detail View -->
      <div
        v-else-if="selectedProfile"
        class="max-w-4xl mx-auto p-8"
      >
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-3">
            <component
              :is="getProfileIcon(selectedProfile)"
              class="h-5 w-5 text-emerald-400"
            />
            <h2 class="text-2xl font-semibold tracking-tight">
              {{ selectedProfile.name }}
            </h2>
            <div
              class="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider"
              :class="getProfileTypeBadgeClass(selectedProfile)"
            >
              {{ getProfileTypeLabel(selectedProfile) }}
            </div>
          </div>
          <div class="flex gap-2">
            <button
              class="px-3 py-1.5 text-[12px] font-medium rounded-md bg-gray-200 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-gray-300 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2"
              @click="editProfile(selectedProfile)"
            >
              <Edit class="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              v-if="selectedProfile.profileType === 'FixedProfile' || selectedProfile.profileType === 'SwitchProfile'"
              class="px-3 py-1.5 text-[12px] font-medium rounded-md bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 hover:text-blue-800 dark:hover:text-blue-300 transition-colors flex items-center gap-2"
              title="Export as PAC script"
              @click="exportProfileAsPac(selectedProfile)"
            >
              <Download class="h-3.5 w-3.5" />
              Export PAC
            </button>
            <button
              v-if="!selectedProfile.isBuiltIn"
              class="px-3 py-1.5 text-[12px] font-medium rounded-md bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 hover:text-red-800 dark:hover:text-red-300 transition-colors flex items-center gap-2"
              @click="deleteProfile(selectedProfile)"
            >
              <Trash2 class="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>

        <!-- Profile Content Based on Type -->
        <div v-if="selectedProfile.profileType === 'SwitchProfile'">
          <section class="mb-8">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold">
                Switch rules
              </h3>
              <Button
                variant="ghost"
                size="sm"
                disabled
                title="Coming Soon - Advanced editor"
              >
                <Code class="h-4 w-4" />
                Edit source code
                <Badge
                  variant="secondary"
                  size="xs"
                  class="ml-2"
                >
                  Beta
                </Badge>
              </Button>
            </div>

            <!-- Rules Table -->
            <div class="border border-border rounded-lg overflow-hidden">
              <table class="w-full">
                <thead class="bg-bg-secondary border-b border-border">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-16">
                      Sort
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      Condition Type
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      Condition Details
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      Profile
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-24">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border">
                  <!-- eslint-disable-next-line vue/valid-v-for -->
                  <tr 
                    v-for="(rule, index) in switchProfileRules" 
                    :key="index" 
                    class="hover:bg-bg-secondary"
                    draggable="true"
                    @dragstart="handleRuleDragStart(index)"
                    @dragover.prevent
                    @drop="handleRuleDrop(index)"
                  >
                    <td class="px-4 py-3">
                      <GripVertical class="h-4 w-4 text-text-tertiary cursor-move" />
                    </td>
                    <td class="px-4 py-3">
                      <select 
                        :value="rule.condition.conditionType"
                        class="w-full px-2 py-1 text-sm border border-border rounded bg-bg-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        @change="updateRuleConditionType(index, ($event.target as HTMLSelectElement).value)"
                      >
                        <option value="">
                          Select an option
                        </option>
                        <option value="HostWildcardCondition">
                          Host wildcard
                        </option>
                        <option value="HostRegexCondition">
                          Host regex
                        </option>
                        <option value="UrlWildcardCondition">
                          URL wildcard
                        </option>
                        <option value="UrlRegexCondition">
                          URL regex
                        </option>
                        <option value="KeywordCondition">
                          Keyword
                        </option>
                        <option value="HostLevelsCondition">
                          Host levels
                        </option>
                        <option value="BypassCondition">
                          Bypass
                        </option>
                      </select>
                    </td>
                    <td class="px-4 py-3">
                      <input
                        v-if="'pattern' in rule.condition"
                        type="text"
                        :value="rule.condition.pattern"
                        placeholder="Enter pattern..."
                        class="w-full px-2 py-1 text-sm border border-border rounded bg-bg-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        @input="updateRulePattern(index, ($event.target as HTMLInputElement).value)"
                      >
                      <div
                        v-else-if="rule.condition.conditionType === 'HostLevelsCondition'"
                        class="flex gap-2"
                      >
                        <input
                          type="number"
                          :value="rule.condition.minValue ?? -1"
                          placeholder="Min"
                          class="w-20 px-2 py-1 text-sm border border-border rounded bg-bg-primary"
                          @input="updateRuleHostLevels(index, 'min', ($event.target as HTMLInputElement).value)"
                        >
                        <input
                          type="number"
                          :value="rule.condition.maxValue ?? -1"
                          placeholder="Max"
                          class="w-20 px-2 py-1 text-sm border border-border rounded bg-bg-primary"
                          @input="updateRuleHostLevels(index, 'max', ($event.target as HTMLInputElement).value)"
                        >
                      </div>
                      <span
                        v-else
                        class="text-xs text-text-tertiary"
                      >No details needed</span>
                    </td>
                    <td class="px-4 py-3">
                      <select
                        :value="rule.profileName"
                        class="w-full px-2 py-1 text-sm border border-border rounded bg-bg-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        @change="updateRuleProfile(index, ($event.target as HTMLSelectElement).value)"
                      >
                        <option value="">
                          Select an option
                        </option>
                        <!-- eslint-disable-next-line vue/valid-v-for -->
                        <option
                          v-for="p in profiles"
                          :key="p.id"
                          :value="p.name"
                        >
                          {{ p.name }}
                        </option>
                      </select>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          class="h-7 w-7"
                          :disabled="index === 0"
                          title="Move up"
                          @click="moveRuleUp(index)"
                        >
                          <ArrowUp class="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          class="h-7 w-7"
                          :disabled="index === switchProfileRules.length - 1"
                          title="Move down"
                          @click="moveRuleDown(index)"
                        >
                          <ArrowDown class="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          class="h-7 w-7 text-red-600"
                          title="Delete rule"
                          @click="deleteRule(index)"
                        >
                          <Trash2 class="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <Button
              variant="outline"
              size="sm"
              class="mt-3"
              @click="addNewRule"
            >
              <Plus class="h-4 w-4" />
              Add condition
            </Button>
          </section>

          <section class="mb-8">
            <h3 class="text-lg font-semibold mb-4">
              Default
            </h3>
            <p class="text-sm text-text-secondary mb-2">
              Profile to use when no rules match
            </p>
            <select
              :value="switchProfileDefault"
              class="w-full max-w-xs px-3 py-2 text-sm border border-border rounded bg-bg-primary focus:outline-none focus:ring-2 focus:ring-primary"
              @change="updateDefaultProfile(($event.target as HTMLSelectElement).value)"
            >
              <option value="">
                Select an option
              </option>
              <option
                v-for="p in profiles"
                :key="p.id"
                :value="p.name"
              >
                {{ p.name }}
              </option>
            </select>
          </section>
        </div>

        <!-- Fixed Proxy Profile -->
        <div v-else-if="selectedProfile.profileType === 'FixedProfile'">
          <Card padding="lg">
            <div class="space-y-6">
              <div>
                <h3 class="text-base font-medium mb-4 text-slate-900 dark:text-zinc-300">
                  Proxy servers
                </h3>
                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium mb-2">Protocol</label>
                    <select 
                      v-model="(selectedProfile as unknown as Record<string, unknown>).proxyType"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="HTTP">
                        HTTP
                      </option>
                      <option value="HTTPS">
                        HTTPS
                      </option>
                      <option value="SOCKS4">
                        SOCKS4
                      </option>
                      <option value="SOCKS5">
                        SOCKS5
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2">Server</label>
                    <input
                      v-model="(selectedProfile as unknown as Record<string, unknown>).host"
                      type="text"
                      placeholder="192.168.50.30"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 text-slate-900 dark:text-white"
                    >
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2">Port</label>
                    <input
                      v-model="(selectedProfile as unknown as Record<string, unknown>).port"
                      type="number"
                      placeholder="8213"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 text-slate-900 dark:text-white"
                    >
                  </div>
                </div>
              </div>
              
              <!-- Authentication Status -->
              <div>
                <h3 class="text-base font-medium mb-2 text-slate-900 dark:text-zinc-300">
                  Authentication
                </h3>
                <div class="px-3 py-2 border border-gray-300 dark:border-zinc-800 rounded-md bg-gray-50 dark:bg-zinc-900">
                  <div
                    v-if="(selectedProfile as unknown as Record<string, unknown>).username || (selectedProfile as unknown as Record<string, unknown>).password"
                    class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span class="font-medium">Enabled</span>
                    <span class="text-xs text-slate-500 dark:text-zinc-500 ml-2">Username: {{ (selectedProfile as unknown as Record<string, unknown>).username }}</span>
                  </div>
                  <div
                    v-else
                    class="flex items-center gap-2 text-slate-500 dark:text-zinc-500"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Not configured</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 class="text-base font-medium mb-2 text-slate-900 dark:text-zinc-300">
                  Bypass List
                </h3>
                <p class="text-sm text-zinc-600 dark:text-zinc-500 mb-3">
                  Servers for which you do not want to use any proxy: (One server on each line.)
                </p>
                <textarea
                  v-model="bypassListText"
                  rows="8"
                  placeholder="192.168.2.0/24&#10;192.168.50.0/24&#10;127.0.0.1&#10;::1&#10;localhost&#10;<local>"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 text-slate-900 dark:text-white font-mono text-sm"
                  @input="updateBypassList"
                />
                <p class="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  <a
                    href="https://developer.chrome.com/docs/extensions/reference/api/proxy#bypass_list"
                    target="_blank"
                    class="hover:underline"
                  >
                    Wildcards and CIDR notation available
                  </a>
                </p>
              </div>
            </div>
          </Card>
        </div>

        <!-- PAC Profile -->
        <div v-else-if="selectedProfile.profileType === 'PacProfile'">
          <Card padding="lg">
            <div class="space-y-6">
              <div>
                <h3 class="text-base font-medium mb-4 text-slate-900 dark:text-zinc-300">
                  PAC Script
                </h3>
                <div class="space-y-4">
                  <div v-if="(selectedProfile as unknown as Record<string, unknown>).pacUrl">
                    <label class="block text-sm font-medium mb-2">PAC URL</label>
                    <div class="px-3 py-2 border border-gray-300 dark:border-zinc-800 rounded-md bg-gray-50 dark:bg-zinc-900 text-slate-900 dark:text-white break-all">
                      {{ (selectedProfile as unknown as Record<string, unknown>).pacUrl }}
                    </div>
                  </div>
                  <div v-else-if="(selectedProfile as unknown as Record<string, unknown>).pacScript">
                    <label class="block text-sm font-medium mb-2">PAC Script</label>
                    <textarea
                      :value="(selectedProfile as unknown as Record<string, unknown>).pacScript"
                      readonly
                      rows="12"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-zinc-800 rounded-md bg-gray-50 dark:bg-zinc-900 text-slate-900 dark:text-white font-mono text-sm"
                    />
                  </div>
                  <div v-else>
                    <p class="text-sm text-amber-600 dark:text-amber-400">
                      No PAC URL or script configured for this profile.
                    </p>
                  </div>
                </div>
              </div>
              
              <div v-if="(selectedProfile as unknown as Record<string, unknown>).fallbackProxy">
                <h3 class="text-base font-medium mb-2 text-slate-900 dark:text-zinc-300">
                  Fallback Proxy
                </h3>
                <p class="text-sm text-zinc-600 dark:text-zinc-500 mb-3">
                  Used when PAC script fails or is unavailable
                </p>
                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium mb-2">Protocol</label>
                    <div class="px-3 py-2 border border-gray-300 dark:border-zinc-800 rounded-md bg-gray-50 dark:bg-zinc-900 text-slate-900 dark:text-white">
                      {{ ((selectedProfile as unknown as Record<string, unknown>).fallbackProxy as Record<string, unknown>).scheme.toUpperCase() }}
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2">Server</label>
                    <div class="px-3 py-2 border border-gray-300 dark:border-zinc-800 rounded-md bg-gray-50 dark:bg-zinc-900 text-slate-900 dark:text-white">
                      {{ ((selectedProfile as unknown as Record<string, unknown>).fallbackProxy as Record<string, unknown>).host }}
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2">Port</label>
                    <div class="px-3 py-2 border border-gray-300 dark:border-zinc-800 rounded-md bg-gray-50 dark:bg-zinc-900 text-slate-900 dark:text-white">
                      {{ ((selectedProfile as unknown as Record<string, unknown>).fallbackProxy as Record<string, unknown>).port }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-md p-4">
                <p class="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Note:</strong> To edit PAC script settings, click the "Edit" button above.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <!-- Direct/System Profile -->
        <div v-else-if="selectedProfile.profileType === 'DirectProfile' || selectedProfile.profileType === 'SystemProfile'">
          <Card padding="lg">
            <p class="text-text-secondary">
              This is a {{ selectedProfile.profileType === 'DirectProfile' ? 'direct connection' : 'system proxy' }} profile.
              {{ selectedProfile.profileType === 'DirectProfile' 
                ? 'All requests will connect directly without using any proxy.' 
                : 'The extension will use your system\'s configured proxy settings.' 
              }}
            </p>
          </Card>
        </div>
        
        <!-- Unknown Profile Type -->
        <div v-else>
          <Card padding="lg">
            <p class="text-amber-600 dark:text-amber-400">
              Unknown profile type: {{ selectedProfile.profileType }}
            </p>
          </Card>
        </div>
      </div>
    </main>

    <!-- Dialogs -->
    <ProfileEditor
      v-model="showProfileEditor"
      :profile="editingProfile"
      @save="handleSaveProfile"
      @cancel="editingProfile = undefined"
    />



    <Toast
      ref="toastRef"
      position="bottom-right"
    />
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/explicit-function-return-type */
import { ref, computed, onMounted, watch, nextTick, onBeforeUnmount } from 'vue';
import type { ConnectionStatus } from '@/components/status';
import { useDark } from '@vueuse/core';
import { VERSION, getManifestVersion } from '@/utils/version';
import { 
  Plus, 
  Settings,
  FileText,
  Download,
  Upload,
  Palette,
  Globe,
  Zap,
  Monitor,
  Server,
  Shuffle,
  Check,
  X,
  Edit,
  Trash2,
  Code,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Sun,
  Moon,
  Bug
} from 'lucide-vue-next';
import { Card, Badge, Button, Toast, Select } from '@/components/ui';
import { encryptProfile, decryptProfile } from '@/utils/crypto';
import { ProfileImportExport, ProfileEditor } from '@/components/profile';
import { generatePacScript } from '@/core/pac/pac-generator';
import { Logger, LogLevel, LogLevelMetadata, getLogLevel, setLogLevel as saveLogLevel, getLogMaxLines, setLogMaxLines } from '@/utils/Logger';
import type { Profile, FixedProfile, SwitchProfile, SwitchRule } from '@/core/schema';
import { generateId } from '@/lib/utils';

// Set component prefix for all logs from Options page
Logger.setComponentPrefix('Options');

const isDark = useDark();
const toastRef = ref<InstanceType<typeof Toast>>();
const showProfileEditor = ref(false);
const showEditor = ref(false);
const showTemplates = ref(false);
const editingProfile = ref<Profile | undefined>();
const currentView = ref('interface');
const selectedProfile = ref<Profile | undefined>();
const savingChanges = ref(false);
const hasUnsavedChanges = ref(false);
const bypassListText = ref<string>('');
const logs = ref<Array<{ timestamp: string; level: string; component: string; message: string; data?: unknown }>>([]);
const maxLogs = 500;
const logExportRowCount = ref(100);

// Auto-refresh / tailing for Log Viewer
const logsContainer = ref<HTMLElement | null>(null);
const logAutoRefreshTimer = ref<number | null>(null);

function refreshLogs() {
  try {
    const buffer = Logger.getLogBuffer();
    logs.value = buffer;
    if (logs.value.length > maxLogs) {
      logs.value = logs.value.slice(0, maxLogs);
    }

    // Tailing behavior: newest logs are at the top (logs[0]), so scroll to top
    nextTick(() => {
      if (currentView.value === 'debug' && logsContainer.value) {
        logsContainer.value.scrollTop = 0;
      }
    });
  } catch (error) {
    Logger.error('Failed to refresh logs', error);
  }
}

function startLogAutoRefresh() {
  if (logAutoRefreshTimer.value !== null) return;
  // Immediate refresh
  refreshLogs();
  logAutoRefreshTimer.value = window.setInterval(() => refreshLogs(), 1000);
}

function stopLogAutoRefresh() {
  if (logAutoRefreshTimer.value !== null) {
    clearInterval(logAutoRefreshTimer.value);
    logAutoRefreshTimer.value = null;
  }
}
const testConflictActive = ref(false);
const storageUsed = ref('Calculating...');
const currentLogLevel = ref<LogLevel>(LogLevel.INFO);
const currentLogMaxLines = ref<number>(1000);

// Initialize logs from Logger buffer
logs.value = Logger.getLogBuffer();

// Subscribe to new log entries
Logger.addLogListener((entry) => {
  logs.value.unshift(entry);
  if (logs.value.length > maxLogs) {
    logs.value = logs.value.slice(0, maxLogs);
  }
});

// Log level options for UI
const logLevels = computed(() => [
  {
    value: LogLevel.DEBUG,
    name: LogLevelMetadata[LogLevel.DEBUG].name,
    description: LogLevelMetadata[LogLevel.DEBUG].description,
    color: LogLevelMetadata[LogLevel.DEBUG].color,
    icon: LogLevelMetadata[LogLevel.DEBUG].icon
  },
  {
    value: LogLevel.INFO,
    name: LogLevelMetadata[LogLevel.INFO].name,
    description: LogLevelMetadata[LogLevel.INFO].description,
    color: LogLevelMetadata[LogLevel.INFO].color,
    icon: LogLevelMetadata[LogLevel.INFO].icon
  },
  {
    value: LogLevel.WARN,
    name: LogLevelMetadata[LogLevel.WARN].name,
    description: LogLevelMetadata[LogLevel.WARN].description,
    color: LogLevelMetadata[LogLevel.WARN].color,
    icon: LogLevelMetadata[LogLevel.WARN].icon
  },
  {
    value: LogLevel.ERROR,
    name: LogLevelMetadata[LogLevel.ERROR].name,
    description: LogLevelMetadata[LogLevel.ERROR].description,
    color: LogLevelMetadata[LogLevel.ERROR].color,
    icon: LogLevelMetadata[LogLevel.ERROR].icon
  },
  {
    value: LogLevel.NONE,
    name: LogLevelMetadata[LogLevel.NONE].name,
    description: LogLevelMetadata[LogLevel.NONE].description,
    color: LogLevelMetadata[LogLevel.NONE].color,
    icon: LogLevelMetadata[LogLevel.NONE].icon
  }
]);

const settingsNav = [
  { id: 'interface', label: 'Interface', icon: Settings },
  { id: 'import-export', label: 'Import/Export', icon: FileText },
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'debug', label: 'Debug & Logs', icon: Bug },
];

const settings = ref({
  confirmDelete: true,
  startupProfile: 'profile-1',
  downloadInterval: 'never',
  theme: 'auto' as 'light' | 'dark' | 'auto',
});

const activeProfileId = ref<string>('profile-1');
const lastSwitched = ref<Date>(new Date());

const profiles = ref<Profile[]>([
  {
    id: 'profile-direct',
    name: 'Direct',
    profileType: 'DirectProfile',
    color: 'gray',
    showInPopup: true,
    isBuiltIn: true,
  },
  {
    id: 'profile-system',
    name: 'System Proxy',
    profileType: 'SystemProfile',
    color: 'gray',
    showInPopup: true,
    isBuiltIn: true,
  },
  {
    id: 'profile-2',
    name: 'Your Proxy',
    profileType: 'FixedProfile',
    proxyType: 'HTTP',
    host: 'proxy.example.com',
    port: 8080,
    color: 'blue',
    showInPopup: true,
    bypassList: [
      { conditionType: 'BypassCondition', pattern: '127.0.0.1' },
      { conditionType: 'BypassCondition', pattern: '::1' },
      { conditionType: 'BypassCondition', pattern: 'localhost' },
      { conditionType: 'BypassCondition', pattern: '<local>' },
    ],
  } as FixedProfile,
  {
    id: 'profile-3',
    name: 'Auto Switch',
    profileType: 'SwitchProfile',
    defaultProfileName: 'Direct',
    showInPopup: true,
    rules: [
      {
        condition: { conditionType: 'HostWildcardCondition', pattern: '*.example.com' },
        profileName: 'Your Proxy'
      },
      {
        condition: { conditionType: 'HostWildcardCondition', pattern: 'internal.company.net' },
        profileName: 'Your Proxy'
      }
    ],
    color: 'green',
  } as SwitchProfile,
]);

async function clearLogs() {
  await Logger.clearLogBuffer();
  logs.value = [];
  Logger.info('Logs cleared');
  toastRef.value?.success('All logs cleared', 'Success', 2000);
}

async function exportLogsToFile() {
  try {
    // Get the specified number of most recent logs
    const logsToExport = logs.value.slice(-logExportRowCount.value);
    
    const logText = [
      '='.repeat(80),
      'SwitchyMalaccamax Debug Logs',
      `Exported: ${new Date().toISOString()}`,
      `Total Logs: ${logs.value.length} | Exported: ${logsToExport.length}`,
      '='.repeat(80),
      '',
      ...logsToExport.map(log => {
        const dataStr = log.data ? '\n  Data: ' + JSON.stringify(log.data, null, 2).replace(/\n/g, '\n  ') : '';
        return `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}${dataStr}`;
      })
    ].join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const filename = `switchymalaccamax-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    
    // Use <a download> to trigger save dialog
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    // Clean up the blob URL after a short delay
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    Logger.info('Logs exported to file', { count: logsToExport.length, filename });
    toastRef.value?.success(`Exported ${logsToExport.length} logs`, 'Export Successful', 3000);
  } catch (error) {
    Logger.error('Failed to export logs', error);
    toastRef.value?.error('Failed to export logs', 'Error');
  }
}

async function toggleTestConflict() {
  testConflictActive.value = !testConflictActive.value;
  
  // Store the test conflict state in chrome.storage so popup can read it
  await chrome.storage.local.set({ testConflictActive: testConflictActive.value });
  
  Logger.info(`Test conflict ${testConflictActive.value ? 'activated' : 'deactivated'}`);
  
  if (testConflictActive.value) {
    toastRef.value?.info(
      'Open the popup to see the conflict warning banner.',
      'Test Conflict Activated',
      3000
    );
  } else {
    toastRef.value?.info(
      'Conflict warning removed from popup.',
      'Test Conflict Deactivated',
      3000
    );
  }
}

async function setLogLevel(level: LogLevel) {
  try {
    await saveLogLevel(level);
    currentLogLevel.value = level;
    Logger.info('Log level changed', { level: LogLevelMetadata[level].name });
    toastRef.value?.success(
      `Log level set to ${LogLevelMetadata[level].name}`,
      'Settings Updated',
      2000
    );
  } catch (error) {
    Logger.error('Failed to save log level', error);
    toastRef.value?.error('Failed to save log level', 'Error');
  }
}

async function updateLogMaxLines() {
  try {
    // Validate input
    const value = Math.max(10, Math.min(currentLogMaxLines.value, 50000));
    currentLogMaxLines.value = value;
    
    await setLogMaxLines(value);
    Logger.info('Max log lines changed', { maxLines: value });
    toastRef.value?.success(
      `Max log lines set to ${value.toLocaleString()}`,
      'Settings Updated',
      2000
    );
  } catch (error) {
    Logger.error('Failed to save max log lines', error);
    toastRef.value?.error('Failed to save max log lines', 'Error');
  }
}

async function calculateStorageUsed() {
  try {
    const usage = await chrome.storage.local.getBytesInUse();
    const usageKB = (usage / 1024).toFixed(2);
    storageUsed.value = `${usageKB} KB`;
  } catch (error) {
    storageUsed.value = 'N/A';
  }
}

const activeProfile = computed(() => 
  profiles.value?.find(p => p.id === activeProfileId.value)
);

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

const activeProfileName = computed(() => activeProfile.value?.name);

const connectionStatus = computed<ConnectionStatus['status']>(() => {
  if (!activeProfile.value) return 'disconnected';
  if (activeProfile.value.profileType === 'DirectProfile') return 'direct';
  if (activeProfile.value.profileType === 'FixedProfile') return 'active';
  if (activeProfile.value.profileType === 'SwitchProfile') return 'auto';
  return 'direct';
});

const connectionMode = computed<ConnectionStatus['connectionMode']>(() => {
  if (activeProfile.value?.profileType === 'SwitchProfile') return 'Auto Switch';
  if (activeProfile.value?.profileType === 'DirectProfile') return 'Direct';
  return 'Manual';
});

const proxyType = computed(() => {
  if (activeProfile.value?.profileType === 'FixedProfile' && 'proxyType' in activeProfile.value) {
    return activeProfile.value.proxyType;
  }
  return undefined;
});

const proxyHost = computed(() => {
  if (activeProfile.value?.profileType === 'FixedProfile' && 'host' in activeProfile.value) {
    return `${activeProfile.value.host}:${activeProfile.value.port}`;
  }
  return undefined;
});

// Switch Profile Rules Management
const switchProfileRules = computed({
  get() {
    if (selectedProfile.value?.profileType === 'SwitchProfile' && 'rules' in selectedProfile.value) {
      return selectedProfile.value.rules || [];
    }
    return [];
  },
  set(newRules) {
    if (selectedProfile.value?.profileType === 'SwitchProfile' && 'rules' in selectedProfile.value) {
      selectedProfile.value.rules = newRules;
      hasUnsavedChanges.value = true;
    }
  }
});

const switchProfileDefault = computed({
  get() {
    if (selectedProfile.value?.profileType === 'SwitchProfile' && 'defaultProfileName' in selectedProfile.value) {
      return selectedProfile.value.defaultProfileName;
    }
    return '';
  },
  set(newDefault) {
    if (selectedProfile.value?.profileType === 'SwitchProfile' && 'defaultProfileName' in selectedProfile.value) {
      selectedProfile.value.defaultProfileName = newDefault;
      hasUnsavedChanges.value = true;
    }
  }
});

let draggedRuleIndex: number | null = null;

function handleRuleDragStart(index: number) {
  draggedRuleIndex = index;
  Logger.debug('Drag started for rule', { index });
}

function handleRuleDrop(dropIndex: number) {
  if (draggedRuleIndex === null || draggedRuleIndex === dropIndex) return;
  
  Logger.debug('Moving rule', { from: draggedRuleIndex, to: dropIndex });
  const rules = [...switchProfileRules.value];
  const [movedRule] = rules.splice(draggedRuleIndex, 1);
  rules.splice(dropIndex, 0, movedRule);
  switchProfileRules.value = rules;
  draggedRuleIndex = null;
}

function updateRuleConditionType(index: number, conditionType: string) {
  Logger.debug('Update rule condition type', { index, conditionType });
  const rules = [...switchProfileRules.value];
  const rule = rules[index];
  
  // Create new condition based on type
  if (conditionType === 'HostWildcardCondition') {
    rule.condition = { conditionType: 'HostWildcardCondition', pattern: '' };
  } else if (conditionType === 'HostRegexCondition') {
    rule.condition = { conditionType: 'HostRegexCondition', pattern: '' };
  } else if (conditionType === 'UrlWildcardCondition') {
    rule.condition = { conditionType: 'UrlWildcardCondition', pattern: '' };
  } else if (conditionType === 'UrlRegexCondition') {
    rule.condition = { conditionType: 'UrlRegexCondition', pattern: '' };
  } else if (conditionType === 'KeywordCondition') {
    rule.condition = { conditionType: 'KeywordCondition', pattern: '' };
  } else if (conditionType === 'HostLevelsCondition') {
    rule.condition = { conditionType: 'HostLevelsCondition', minValue: 1, maxValue: 2 };
  } else if (conditionType === 'BypassCondition') {
    rule.condition = { conditionType: 'BypassCondition' };
  }
  
  switchProfileRules.value = rules;
}

function updateRulePattern(index: number, pattern: string) {
  // Trim whitespace to avoid accidental non-matching patterns
  const trimmed = typeof pattern === 'string' ? pattern.trim() : pattern;
  Logger.debug('Update rule pattern', { index, pattern: trimmed });
  const rules = [...switchProfileRules.value];
  const rule = rules[index];
  if ('pattern' in rule.condition) {
    rule.condition.pattern = trimmed;
  }
  switchProfileRules.value = rules;
}

function updateRuleHostLevels(index: number, type: 'min' | 'max', value: string) {
  Logger.debug('Update rule host levels', { index, type, value });
  const rules = [...switchProfileRules.value];
  const rule = rules[index];
  if (rule.condition.conditionType === 'HostLevelsCondition') {
    const numValue = parseInt(value, 10);
    if (type === 'min') {
      rule.condition.minValue = isNaN(numValue) ? undefined : numValue;
    } else {
      rule.condition.maxValue = isNaN(numValue) ? undefined : numValue;
    }
  }
  switchProfileRules.value = rules;
}

function updateRuleProfile(index: number, profileName: string) {
  Logger.debug('Update rule profile', { index, profileName });
  const rules = [...switchProfileRules.value];
  rules[index].profileName = profileName;
  switchProfileRules.value = rules;
}

function moveRuleUp(index: number) {
  if (index === 0) return;
  Logger.debug('Move rule up', { index });
  const rules = [...switchProfileRules.value];
  [rules[index - 1], rules[index]] = [rules[index], rules[index - 1]];
  switchProfileRules.value = rules;
}

function moveRuleDown(index: number) {
  if (index >= switchProfileRules.value.length - 1) return;
  Logger.debug('Move rule down', { index });
  const rules = [...switchProfileRules.value];
  [rules[index], rules[index + 1]] = [rules[index + 1], rules[index]];
  switchProfileRules.value = rules;
}

function deleteRule(index: number) {
  Logger.debug('Delete rule', { index });
  const rules = [...switchProfileRules.value];
  rules.splice(index, 1);
  switchProfileRules.value = rules;
  toastRef.value?.success('Rule deleted', 'Success', 3000);
}

function addNewRule() {
  Logger.debug('Add new rule');
  const rules = [...switchProfileRules.value];
  rules.push({
    condition: { conditionType: 'HostWildcardCondition', pattern: '' },
    profileName: ''
  });
  switchProfileRules.value = rules;
  toastRef.value?.info('New rule added', 'Info', 3000);
}

function updateDefaultProfile(profileName: string) {
  Logger.debug('Update default profile', { profileName });
  switchProfileDefault.value = profileName;
}

function configureShortcut() {
  Logger.info('Opening keyboard shortcuts configuration');
  chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  toastRef.value?.info('Opening Chrome shortcuts settings...', 'Keyboard Shortcuts', 3000);
}

onMounted(async () => {
  Logger.info('Loading data from storage');
  
  // Load current log level and max lines
  currentLogLevel.value = await getLogLevel();
  currentLogMaxLines.value = await getLogMaxLines();
  
  // Check if we should open add profile dialog
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');
  if (action === 'addProfile') {
    // Open profile editor after data loads
    setTimeout(() => {
      showProfileEditor.value = true;
      editingProfile.value = undefined;
    }, 100);
  }
  
  try {
    // Load profiles from local storage, other settings from sync
    const localResult = await chrome.storage.local.get(['profiles']);
    const syncResult = await chrome.storage.sync.get(['activeProfileId', 'settings']);
    
    Logger.debug('Local storage result', { 
      hasProfiles: !!localResult.profiles, 
      profilesCount: localResult.profiles?.length,
      keys: Object.keys(localResult)
    });
    
    Logger.debug('Sync storage result', { 
      hasActiveProfile: !!syncResult.activeProfileId,
      hasSettings: !!syncResult.settings,
      keys: Object.keys(syncResult)
    });
    
    const result = { ...localResult, ...syncResult };
    
    Logger.debug('Loaded data', result);
    Logger.debug('Combined storage result', { 
      hasProfiles: !!result.profiles, 
      profilesType: typeof result.profiles,
      profilesLength: result.profiles?.length,
      profilesIsArray: Array.isArray(result.profiles)
    });
    
    // Load profiles from storage or keep defaults
    if (result.profiles && result.profiles.length > 0) {
      // Decrypt profiles on load
      profiles.value = await Promise.all(
        result.profiles.map((profile: Profile) => decryptProfile(profile))
      );
      const msg = `Loaded ${result.profiles.length} profiles from storage`;
      Logger.info(msg);
      
      // Migration: Update profile name capitalization
      let needsSave = false;
      profiles.value.forEach((p: Profile) => {
        if (p.name === 'auto switch') {
          p.name = 'Auto Switch';
          needsSave = true;
          Logger.info('Migrated profile name: "auto switch" → "Auto Switch"');
        }
        if (p.name === 'Builtin') {
          p.name = 'Direct';
          needsSave = true;
          Logger.info('Migrated profile name: "Builtin" → "Direct"');
        }
      });
      
      // Migrate defaultProfileName in SwitchProfiles
      profiles.value.forEach((p: Profile) => {
        if (p.profileType === 'SwitchProfile' && p.defaultProfileName === 'Builtin') {
          p.defaultProfileName = 'Direct';
          needsSave = true;
          Logger.info('Migrated default profile name in Auto Switch');
        }
      });
      
      // Save if migrations were applied
      if (needsSave) {
        const encryptedProfiles = await Promise.all(
          profiles.value.map((profile: Profile) => encryptProfile(profile))
        );
        await chrome.storage.local.set({ profiles: encryptedProfiles });
        Logger.info('Profile migrations saved');
      }
      
      // Log bypass lists
      result.profiles.forEach((p: Profile, i: number) => {
        if (p.profileType === 'FixedProfile' && p.bypassList) {
          const bypassMsg = `Profile "${p.name}" has ${p.bypassList.length} bypass rules`;
          Logger.debug(bypassMsg, p.bypassList);
        }
      });
    } else {
      // Keep default profiles and save them to storage
      Logger.info('No profiles in storage, using defaults');
      const encryptedProfiles = await Promise.all(
        profiles.value.map((profile: Profile) => encryptProfile(profile))
      );
      await chrome.storage.local.set({ profiles: encryptedProfiles });
    }
    
    if (result.activeProfileId) {
      activeProfileId.value = result.activeProfileId;
    }
    if (result.settings) {
      Object.assign(settings.value, result.settings);
    }
    
    // Apply theme from settings
    const theme = settings.value.theme || 'light';
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      isDark.value = prefersDark;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else if (theme === 'dark') {
      isDark.value = true;
      document.documentElement.classList.add('dark');
    } else {
      isDark.value = false;
      document.documentElement.classList.remove('dark');
    }
    
    Logger.info('Data loaded successfully');
    
    // Load debug test conflict state
    const debugResult = await chrome.storage.local.get(['testConflictActive']);
    if (debugResult.testConflictActive !== undefined) {
      testConflictActive.value = debugResult.testConflictActive;
    }
    
    // Load current log level
    currentLogLevel.value = await getLogLevel();
    Logger.debug('Initial log level loaded', { level: LogLevelMetadata[currentLogLevel.value].name });
    
    // Calculate storage usage
    calculateStorageUsed();
  } catch (error) {
    Logger.error('Failed to load data', error);
  }

  // Start auto-refresh if we're already on the debug view
  if (currentView.value === 'debug') {
    startLogAutoRefresh();
  }
});

async function toggleShowInPopup(profile: Profile) {
  Logger.info('Toggling showInPopup', { name: profile.name, currentValue: profile.showInPopup });
  
  // Toggle the showInPopup property
  profile.showInPopup = profile.showInPopup === false ? true : false;
  
  // Save changes immediately
  try {
    await saveProfiles();
    hasUnsavedChanges.value = false; // Reset since we just saved
    const status = profile.showInPopup ? 'shown in' : 'hidden from';
    toastRef.value?.success(`"${profile.name}" will be ${status} popup menu`, 'Updated', 2000);
    Logger.info('showInPopup toggled successfully', { name: profile.name, newValue: profile.showInPopup });
  } catch (error) {
    Logger.error('Failed to toggle showInPopup', error);
    toastRef.value?.error('Failed to save changes', 'Error');
    // Revert the change on error
    profile.showInPopup = !profile.showInPopup;
  }
}

async function saveProfiles() {
  const logMsg = `Saving profiles: ${profiles.value.length} profiles`;
  Logger.info(logMsg);
  
  // Log each profile with bypass list details
  profiles.value.forEach((p, i) => {
    if (p.profileType === 'FixedProfile') {
      const msg = `Profile ${i}: ${p.name} - bypassList: ${((p as unknown as Record<string, unknown>).bypassList as Array<unknown>)?.length || 0} items`; 
      Logger.debug(msg, (p as unknown as Record<string, unknown>).bypassList);
    }
  });
  
  try {
    // Serialize to plain objects to avoid Vue reactivity proxy issues
    const plainProfiles = JSON.parse(JSON.stringify(profiles.value));
    Logger.info('Serialized profiles for storage');
    Logger.debug('Serialized data size', {
      profilesCount: plainProfiles.length,
      jsonSize: JSON.stringify(plainProfiles).length,
      quotaEstimate: `${(JSON.stringify(plainProfiles).length / 1024).toFixed(2)} KB`
    });
    
    // Encrypt sensitive credentials before storage
    const encryptedProfiles = await Promise.all(
      plainProfiles.map((profile: Profile) => encryptProfile(profile))
    );
    
    // Use chrome.storage.local for profiles (larger quota: 5MB vs 100KB for sync)
    // This prevents quota exceeded errors with large profile configurations
    await chrome.storage.local.set({ profiles: encryptedProfiles });
    Logger.info('Profiles saved successfully to local storage');
    
    // Verify what was saved
    const saved = await chrome.storage.local.get(['profiles']);
    Logger.debug('Verification - saved profiles', saved);
    Logger.info(`Verification - profiles count: ${saved.profiles?.length || 0}`);
    
    if (saved.profiles && saved.profiles.length > 0) {
      saved.profiles.forEach((p: Profile, i: number) => {
        if (p.profileType === 'FixedProfile') {
          const msg = `Verified profile ${i}: ${p.name} - bypassList: ${p.bypassList?.length || 0} items`;
          Logger.debug(msg, p.bypassList);
        }
      });
    }
  } catch (error) {
    Logger.error('Failed to save profiles', error);
    throw error;
  }
}

async function handleProfileSwitch(profile: Profile) {
  activeProfileId.value = profile.id;
  lastSwitched.value = new Date();
  
  try {
    await chrome.storage.sync.set({ activeProfileId: profile.id });
    toastRef.value?.success(`Switched to "${profile.name}"`, 'Profile Changed', 2000);
  } catch (error) {
    toastRef.value?.error('Failed to switch profile', 'Error');
  }
}

function handleEditProfile(profile: Profile) {
  editingProfile.value = profile;
  showEditor.value = true;
}

async function handleDeleteProfile(profile: Profile) {
  const index = profiles.value.findIndex(p => p.id === profile.id);
  if (index !== -1) {
    profiles.value.splice(index, 1);
    await saveProfiles();
    toastRef.value?.success(`Profile "${profile.name}" deleted`, 'Deleted', 2000);
  }
}

async function handleSaveProfile(profileData: Partial<Profile>) {
  if (editingProfile.value) {
    // Update existing
    const index = profiles.value.findIndex(p => p.id === editingProfile.value!.id);
    if (index !== -1) {
      profiles.value[index] = {
        ...profiles.value[index],
        ...profileData,
      };
      toastRef.value?.success(`Profile "${profileData.name}" updated`, 'Saved', 3000);
    }
  } else {
    // Create new
    const newProfile: Profile = {
      id: generateId('profile'),
      ...profileData,
    } as Profile;
    profiles.value.push(newProfile);
    toastRef.value?.success(`Profile "${profileData.name}" created`, 'Created', 3000);
  }
  
  await saveProfiles();
  showProfileEditor.value = false;
  editingProfile.value = undefined;
}

async function handleCreateFromTemplate(profileData: Partial<Profile>) {
  const newProfile: Profile = {
    id: generateId('profile'),
    ...profileData,
  } as Profile;
  profiles.value.push(newProfile);
  await saveProfiles();
  toastRef.value?.success(`Profile "${profileData.name}" created from template`, 'Created', 3000);
  showTemplates.value = false;
}

async function handleImportProfiles(importedProfiles: Profile[], replace: boolean) {
  // Filter out Direct profile from imports (it should never be imported)
  const filteredProfiles = importedProfiles.filter(p => p.name !== 'Direct');
  
  if (replace) {
    // Always preserve Direct profile
    const directProfile = profiles.value.find(p => p.name === 'Direct');
    profiles.value = directProfile ? [directProfile, ...filteredProfiles] : filteredProfiles;
    toastRef.value?.success(`Replaced with ${filteredProfiles.length} profiles`, 'Imported', 3000);
  } else {
    profiles.value.push(...filteredProfiles);
    toastRef.value?.success(`Added ${filteredProfiles.length} profiles`, 'Imported', 3000);
  }
  await saveProfiles();
}

function handleExportComplete() {
  toastRef.value?.success('Profiles exported successfully', 'Export Complete', 2000);
}

function getSidebarItemClass(id: string) {
  const isActive = currentView.value === id || 
                   (selectedProfile.value && `profile-${selectedProfile.value.id}` === id);
  return isActive 
    ? 'bg-zinc-950/50 text-white' 
    : 'text-zinc-500 hover:bg-zinc-950/30 hover:text-zinc-300';
}

function getProfileIcon(profile: Profile) {
  switch (profile.profileType) {
    case 'DirectProfile': return Zap;
    case 'SystemProfile': return Monitor;
    case 'FixedProfile': return Server;
    case 'SwitchProfile': return Shuffle;
    default: return Globe;
  }
}

function getProfileTypeLabel(profile: Profile): string {
  switch (profile.profileType) {
    case 'DirectProfile': return 'Direct';
    case 'SystemProfile': return 'System';
    case 'FixedProfile': return 'Fixed';
    case 'SwitchProfile': return 'Auto';
    case 'PacProfile': return 'PAC';
    default: return 'Custom';
  }
}

function getProfileTypeBadgeClass(profile: Profile): string {
  switch (profile.profileType) {
    case 'DirectProfile': return 'bg-zinc-900 text-zinc-500';
    case 'SwitchProfile': return 'bg-emerald-900/30 text-emerald-400';
    case 'FixedProfile': return 'bg-blue-900/30 text-blue-400';
    default: return 'bg-zinc-900 text-zinc-500';
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

function selectProfile(profile: Profile) {
  if (!profile) {
    Logger.warn('Attempted to select undefined profile');
    return;
  }
  Logger.info('Selected profile', { name: profile.name });
  selectedProfile.value = profile;
  currentView.value = `profile-${profile.id}`;
  
  // Load bypass list if this is a FixedProfile
  if (profile.profileType === 'FixedProfile') {
    loadBypassListText(profile as FixedProfile);
  }
}

function loadBypassListText(profile: FixedProfile) {
  if (profile.bypassList && Array.isArray(profile.bypassList)) {
    // Convert BypassCondition array to text (one pattern per line)
    bypassListText.value = profile.bypassList
      .map((condition: { pattern?: string }) => condition.pattern || '')
      .filter(pattern => pattern)
      .join('\n');
  } else {
    bypassListText.value = '';
  }
}

function updateBypassList() {
  if (!selectedProfile.value || selectedProfile.value.profileType !== 'FixedProfile') {
    return;
  }
  
  hasUnsavedChanges.value = true;
  
  // Convert text to BypassCondition array
  const lines = bypassListText.value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#')); // Filter empty lines and comments
  
  const bypassList = lines.map(pattern => ({
    conditionType: 'BypassCondition',
    pattern
  }));
  
  const msg = `Updated bypass list for ${selectedProfile.value.name}: ${bypassList.length} items`;
  Logger.info(msg, lines);
  (selectedProfile.value as unknown as Record<string, unknown>).bypassList = bypassList;
}

function setTheme(theme: 'light' | 'dark' | 'auto') {
  Logger.info('Setting theme', { theme });
  settings.value.theme = theme;
  hasUnsavedChanges.value = true;
  
  // Apply theme immediately
  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    isDark.value = prefersDark;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } else if (theme === 'dark') {
    isDark.value = true;
    document.documentElement.classList.add('dark');
  } else {
    isDark.value = false;
    document.documentElement.classList.remove('dark');
  }
}

async function saveSettings() {
  Logger.debug('Saving settings', settings.value);
  try {
    await chrome.storage.sync.set({ settings: settings.value });
    Logger.info('Settings saved');
  } catch (error) {
    Logger.error('Failed to save settings', error);
    throw error;
  }
}

function editProfile(profile: Profile) {
  Logger.info('Editing profile', { name: profile.name });
  editingProfile.value = profile;
  showProfileEditor.value = true;
}

async function exportProfileAsPac(profile: Profile) {
  Logger.info('Exporting PAC for profile', { name: profile.name, type: profile.profileType });
  try {
    // Generate PAC script
    const pacScript = generatePacScript(profile, profiles.value);
    
    // Sanitize filename: replace spaces and special chars with underscores
    const safeName = profile.name.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filename = `${safeName}.pac`;
    
    // Create blob and download with save dialog
    const blob = new Blob([pacScript], { type: 'application/x-ns-proxy-autoconfig' });
    const url = URL.createObjectURL(blob);
    
    // Use <a download> to trigger save dialog
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    // Clean up the blob URL after a short delay
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    toastRef.value?.success(`PAC script exported: ${filename}`, 'Exported', 3000);
    Logger.info('PAC export successful', { filename });
  } catch (error) {
    Logger.error('Failed to export PAC', error);
    toastRef.value?.error('Failed to export PAC script', 'Error');
  }
}

async function deleteProfile(profile: Profile) {
  // Prevent deletion of built-in profiles
  if (profile.isBuiltIn) {
    toastRef.value?.error('Built-in profiles cannot be deleted', 'Not Allowed');
    return;
  }
  
  Logger.info('Deleting profile', { name: profile.name });
  if (settings.value.confirmDelete && !confirm(`Delete profile "${profile.name}"?`)) {
    return;
  }
  const index = profiles.value.findIndex(p => p.id === profile.id);
  if (index !== -1) {
    profiles.value.splice(index, 1);
    await saveProfiles();
    selectedProfile.value = undefined;
    currentView.value = 'interface';
    toastRef.value?.success(`Profile "${profile.name}" deleted`, 'Deleted', 2000);
  }
}

async function applyChanges() {
  Logger.info('Applying changes');
  savingChanges.value = true;
  try {
    await saveProfiles();
    await saveSettings();
    hasUnsavedChanges.value = false;
    Logger.info('Changes applied successfully');
    toastRef.value?.success('Changes applied successfully', 'Saved', 2000);
  } catch (error) {
    Logger.error('Failed to apply changes', error);
    toastRef.value?.error('Failed to save changes', 'Error');
  } finally {
    savingChanges.value = false;
  }
}

function discardChanges() {
  Logger.info('Discarding changes');
  if (hasUnsavedChanges.value && !confirm('Discard all unsaved changes?')) {
    return;
  }
  window.location.reload();
}

// Watch for changes
watch(settings, async () => {
  hasUnsavedChanges.value = true;
  Logger.debug('Settings changed');
  
  // Save settings to sync storage
  try {
    await chrome.storage.sync.set({ settings: settings.value });
  } catch (error) {
    Logger.error('Failed to save settings', error);
  }
}, { deep: true });

watch(profiles, () => {
  hasUnsavedChanges.value = true;
  Logger.debug('Profiles changed');
}, { deep: true });

// Watcher to start/stop log auto-refresh when user navigates to Debug view
watch(currentView, (newVal) => {
  if (newVal === 'debug') {
    startLogAutoRefresh();
  } else {
    stopLogAutoRefresh();
  }
});

onBeforeUnmount(() => {
  stopLogAutoRefresh();
});
</script>
