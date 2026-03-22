import { Settings, FileText, Palette, Bug } from 'lucide-vue-next';

/** Top-level options sidebar entries (excludes per-profile nav). */
export const OPTIONS_SETTINGS_NAV = [
  { id: 'interface', label: 'Interface', icon: Settings },
  { id: 'import-export', label: 'Import/Export', icon: FileText },
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'debug', label: 'Debug & Logs', icon: Bug },
] as const;
