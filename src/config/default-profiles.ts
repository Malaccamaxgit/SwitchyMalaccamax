/**
 * Default profiles and sync settings for first install and options UI seed.
 * Kept in one module so the service worker, options page, and tests stay aligned.
 */
import type { Profile, FixedProfile, SwitchProfile } from '@/core/schema';
import { STARTUP_PROFILE_LAST_USED } from '@/config/startup-profile';

export const DEFAULT_ACTIVE_PROFILE_ID = 'profile-direct';

export const DEFAULT_SYNC_SETTINGS = {
  confirmDelete: true,
  startupProfile: STARTUP_PROFILE_LAST_USED,
  downloadInterval: 'never',
  theme: 'auto' as const,
};

const DEFAULT_PROFILES_SEED: Profile[] = [
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
  } as unknown as FixedProfile,
  {
    id: 'profile-3',
    name: 'Auto Switch',
    profileType: 'SwitchProfile',
    defaultProfileName: 'Direct',
    showInPopup: true,
    rules: [
      {
        condition: { conditionType: 'HostWildcardCondition', pattern: '*.example.com' },
        profileName: 'Your Proxy',
      },
      {
        condition: { conditionType: 'HostWildcardCondition', pattern: 'internal.company.net' },
        profileName: 'Your Proxy',
      },
    ],
    color: 'green',
  } as SwitchProfile,
];

/**
 * Deep clone of built-in default profiles (safe to mutate in UI).
 */
export function getDefaultProfiles(): Profile[] {
  return JSON.parse(JSON.stringify(DEFAULT_PROFILES_SEED)) as Profile[];
}
