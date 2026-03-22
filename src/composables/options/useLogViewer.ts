import { ref, computed, watch, nextTick, onScopeDispose, type ComputedRef, type Ref } from 'vue';
import {
  Logger,
  LogLevel,
  LogLevelMetadata,
  getLogLevel,
  setLogLevel as saveLogLevelToStorage,
  getLogMaxLines,
  setLogMaxLines,
} from '@/utils/Logger';
import { isAbortError } from '@/lib/utils';

/** Cap on rows shown in the options Log Viewer (newest-first). */
const maxLogs = 500;

/** Last `maxLogs` entries from Logger buffer (chronological: oldest → newest). */
function takeRecentTail(buffer: LogEntry[]): LogEntry[] {
  return buffer.length > maxLogs ? buffer.slice(-maxLogs) : [...buffer];
}

/** Matches Toast.vue defineExpose API (InstanceType omits exposed methods). */
export type OptionsToastRef = {
  success: (message: string, title?: string, duration?: number) => void;
  error: (message: string, title?: string, duration?: number) => void;
  info: (message: string, title?: string, duration?: number) => void;
};

type LogEntry = { timestamp: string; level: string; component: string; message: string; data?: unknown };

type LogLevelOption = {
  value: LogLevel;
  name: string;
  description: string;
  color: string;
  icon: string;
};

export interface UseLogViewerReturn {
  /**
   * Chronological order (oldest → newest). The template uses `flex-col-reverse`
   * so the newest line appears at the top of the viewport.
   */
  logs: Ref<LogEntry[]>;
  logExportRowCount: Ref<number>;
  logsContainer: Ref<HTMLElement | null>;
  logLevels: ComputedRef<LogLevelOption[]>;
  currentLogLevel: Ref<LogLevel>;
  currentLogMaxLines: Ref<number>;
  refreshLogs: () => void;
  startLogAutoRefresh: () => void;
  stopLogAutoRefresh: () => void;
  clearLogs: () => Promise<void>;
  exportLogsToFile: () => Promise<void>;
  setLogLevel: (level: LogLevel) => Promise<void>;
  updateLogMaxLines: () => Promise<void>;
  loadLogPreferences: () => Promise<void>;
  /** Max rows held in the Log Viewer UI (for footer copy). */
  maxLogViewerLines: number;
}

/**
 * Debug / log viewer state and actions for the options page.
 */
export function useLogViewer(
  toastRef: Ref<OptionsToastRef | undefined>,
  currentView: Ref<string>
): UseLogViewerReturn {
  const logs = ref<LogEntry[]>(takeRecentTail(Logger.getLogBuffer()));

  const logExportRowCount = ref(100);
  const logsContainer = ref<HTMLElement | null>(null);
  const logAutoRefreshTimer = ref<number | null>(null);
  const currentLogLevel = ref<LogLevel>(LogLevel.INFO);
  const currentLogMaxLines = ref<number>(1000);

  const unsubscribeLogListener = Logger.addLogListener((entry) => {
    logs.value.push(entry);
    if (logs.value.length > maxLogs) {
      logs.value.shift();
    }
  });

  function refreshLogs(): void {
    try {
      logs.value = takeRecentTail(Logger.getLogBuffer());

      nextTick(() => {
        const el = logsContainer.value;
        if (currentView.value === 'debug' && el) {
          // Newest lines are at top; only snap to top if user was already viewing the head (avoid interrupting scroll-down reading).
          const nearTop = el.scrollTop < 48;
          if (nearTop) {
            el.scrollTop = 0;
          }
        }
      });
    } catch (error) {
      Logger.error('Failed to refresh logs', error);
    }
  }

  function startLogAutoRefresh(): void {
    if (logAutoRefreshTimer.value !== null) return;
    refreshLogs();
    logAutoRefreshTimer.value = window.setInterval(() => refreshLogs(), 1000);
  }

  function stopLogAutoRefresh(): void {
    if (logAutoRefreshTimer.value !== null) {
      clearInterval(logAutoRefreshTimer.value);
      logAutoRefreshTimer.value = null;
    }
  }

  const logLevels = computed(() => [
    {
      value: LogLevel.DEBUG,
      name: LogLevelMetadata[LogLevel.DEBUG].name,
      description: LogLevelMetadata[LogLevel.DEBUG].description,
      color: LogLevelMetadata[LogLevel.DEBUG].color,
      icon: LogLevelMetadata[LogLevel.DEBUG].icon,
    },
    {
      value: LogLevel.INFO,
      name: LogLevelMetadata[LogLevel.INFO].name,
      description: LogLevelMetadata[LogLevel.INFO].description,
      color: LogLevelMetadata[LogLevel.INFO].color,
      icon: LogLevelMetadata[LogLevel.INFO].icon,
    },
    {
      value: LogLevel.WARN,
      name: LogLevelMetadata[LogLevel.WARN].name,
      description: LogLevelMetadata[LogLevel.WARN].description,
      color: LogLevelMetadata[LogLevel.WARN].color,
      icon: LogLevelMetadata[LogLevel.WARN].icon,
    },
    {
      value: LogLevel.ERROR,
      name: LogLevelMetadata[LogLevel.ERROR].name,
      description: LogLevelMetadata[LogLevel.ERROR].description,
      color: LogLevelMetadata[LogLevel.ERROR].color,
      icon: LogLevelMetadata[LogLevel.ERROR].icon,
    },
    {
      value: LogLevel.NONE,
      name: LogLevelMetadata[LogLevel.NONE].name,
      description: LogLevelMetadata[LogLevel.NONE].description,
      color: LogLevelMetadata[LogLevel.NONE].color,
      icon: LogLevelMetadata[LogLevel.NONE].icon,
    },
  ]);

  async function clearLogs(): Promise<void> {
    await Logger.clearLogBuffer();
    logs.value = [];
    Logger.info('Logs cleared');
    toastRef.value?.success('All logs cleared', 'Success', 2000);
  }

  async function exportLogsToFile(): Promise<void> {
    try {
      // logs are oldest→newest; take last N = most recent; file stays chronological (oldest→newest).
      const n = Math.min(logExportRowCount.value, logs.value.length);
      const logsToExport = logs.value.slice(-n);

      const logText = [
        '='.repeat(80),
        'SwitchyMalaccamax Debug Logs',
        `Exported: ${new Date().toISOString()}`,
        `Total Logs: ${logs.value.length} | Exported: ${logsToExport.length} (most recent, chronological in file)`,
        '='.repeat(80),
        '',
        ...logsToExport.map((log) => {
          const dataStr = log.data ? '\n  Data: ' + JSON.stringify(log.data, null, 2).replace(/\n/g, '\n  ') : '';
          return `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}${dataStr}`;
        }),
      ].join('\n');

      const blob = new Blob([logText], { type: 'text/plain' });
      const filename = `switchymalaccamax-logs-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;

      try {
        const { saveBlobToFile } = await import('@/lib/fileSaver');
        await saveBlobToFile(blob, filename, 'text/plain');
        Logger.info('Logs exported via file picker', { count: logsToExport.length, filename });
        toastRef.value?.success(`Exported ${logsToExport.length} logs`, 'Export Successful', 3000);
      } catch (err) {
        if (isAbortError(err)) {
          Logger.info('User cancelled export');
          return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);

        Logger.info('Logs exported to file (fallback download)', { count: logsToExport.length, filename });
        toastRef.value?.success(`Exported ${logsToExport.length} logs`, 'Export Successful', 3000);
      }
    } catch (error) {
      Logger.error('Failed to export logs', error);
      toastRef.value?.error('Failed to export logs', 'Error');
    }
  }

  async function setLogLevel(level: LogLevel): Promise<void> {
    try {
      await saveLogLevelToStorage(level);
      currentLogLevel.value = level;
      Logger.info('Log level changed', { level: LogLevelMetadata[level].name });
      toastRef.value?.success(`Log level set to ${LogLevelMetadata[level].name}`, 'Settings Updated', 2000);
    } catch (error) {
      Logger.error('Failed to save log level', error);
      toastRef.value?.error('Failed to save log level', 'Error');
    }
  }

  async function updateLogMaxLines(): Promise<void> {
    try {
      const value = Math.max(10, Math.min(currentLogMaxLines.value, 50000));
      currentLogMaxLines.value = value;

      await setLogMaxLines(value);
      Logger.info('Max log lines changed', { maxLines: value });
      toastRef.value?.success(`Max log lines set to ${value.toLocaleString()}`, 'Settings Updated', 2000);
    } catch (error) {
      Logger.error('Failed to save max log lines', error);
      toastRef.value?.error('Failed to save max log lines', 'Error');
    }
  }

  async function loadLogPreferences(): Promise<void> {
    currentLogLevel.value = await getLogLevel();
    currentLogMaxLines.value = await getLogMaxLines();
    Logger.debug('Initial log level loaded', { level: LogLevelMetadata[currentLogLevel.value].name });
  }

  watch(currentView, (newVal) => {
    if (newVal === 'debug') {
      startLogAutoRefresh();
    } else {
      stopLogAutoRefresh();
    }
  });

  onScopeDispose(() => {
    unsubscribeLogListener();
    stopLogAutoRefresh();
  });

  return {
    logs,
    logExportRowCount,
    logsContainer,
    logLevels,
    currentLogLevel,
    currentLogMaxLines,
    refreshLogs,
    startLogAutoRefresh,
    stopLogAutoRefresh,
    clearLogs,
    exportLogsToFile,
    setLogLevel,
    updateLogMaxLines,
    loadLogPreferences,
    maxLogViewerLines: maxLogs,
  };
}
