/**
 * Proxy Configuration Builder
 *
 * Centralized utility for building chrome.proxy.ProxyConfig objects from Profile instances.
 * Eliminates code duplication across service-worker.ts, PopupApp.vue, and OptionsApp.vue.
 */

import type { Profile, FixedProfile, SwitchProfile, PacProfile } from '@/core/schema';
import { PacCompiler } from './pac/pac-generator';
import { Logger } from '@/utils/Logger';

const log = Logger.scope('ProxyConfigBuilder');

/**
 * Type guard for legacy FixedProfile format (host/port instead of fallbackProxy)
 */
function isLegacyFixedProfile(profile: FixedProfile): boolean {
  return !profile.fallbackProxy?.host || !profile.fallbackProxy?.port;
}

/**
 * Extract bypass list from FixedProfile
 */
function extractBypassList(profile: FixedProfile): string[] {
  const bypassList: string[] = [];

  if (profile.bypassList && profile.bypassList.length > 0) {
    profile.bypassList.forEach((condition) => {
      if (condition.conditionType === 'BypassCondition' && condition.pattern) {
        bypassList.push(condition.pattern);
      }
    });
  }

  return bypassList;
}

/**
 * Build proxy config from FixedProfile
 * Supports both modern (fallbackProxy) and legacy (host/port) formats
 */
function buildFixedProfileConfig(profile: FixedProfile): chrome.proxy.ProxyConfig {
  const bypassList = extractBypassList(profile);

  let scheme = 'http';
  let host = 'localhost';
  let port = 8080;

  if (profile.fallbackProxy?.host && profile.fallbackProxy?.port) {
    // Modern format
    scheme = (profile.fallbackProxy.scheme || 'http').toLowerCase();
    host = profile.fallbackProxy.host;
    port = profile.fallbackProxy.port;
  } else if (isLegacyFixedProfile(profile)) {
    // Legacy format
    const legacy = profile as unknown as { proxyType?: string; host?: string; port?: number };
    if (legacy.host && legacy.port) {
      scheme = (legacy.proxyType || 'http').toLowerCase();
      host = legacy.host;
      port = legacy.port;
    }
  }

  return {
    mode: 'fixed_servers',
    rules: {
      singleProxy: {
        scheme,
        host,
        port,
      },
      bypassList: bypassList.length > 0 ? bypassList : undefined,
    },
  };
}

/**
 * Build proxy config from SwitchProfile using PAC script
 */
async function buildSwitchProfileConfig(
  profile: SwitchProfile,
  allProfiles: Profile[]
): Promise<chrome.proxy.ProxyConfig> {
  try {
    const compiler = new PacCompiler(allProfiles);
    const pacScript = compiler.compilePacScript(profile.name);

    return {
      mode: 'pac_script',
      pacScript: { data: pacScript }
    };
  } catch (err) {
    log.error('Failed to generate PAC for SwitchProfile', err);
    return { mode: 'direct' };
  }
}

/**
 * Build proxy config from PacProfile
 */
function buildPacProfileConfig(profile: PacProfile): chrome.proxy.ProxyConfig {
  if (profile.pacUrl) {
    return {
      mode: 'pac_script',
      pacScript: { url: profile.pacUrl }
    };
  }

  if (profile.pacScript) {
    return {
      mode: 'pac_script',
      pacScript: { data: profile.pacScript }
    };
  }

  log.warn('PacProfile missing pacUrl or pacScript, falling back to direct');
  return { mode: 'direct' };
}

/**
 * Main entry point: Build proxy config from any profile type
 */
export async function buildProxyConfig(
  profile: Profile,
  allProfiles?: Profile[]
): Promise<chrome.proxy.ProxyConfig> {
  switch (profile.profileType) {
    case 'DirectProfile':
      return { mode: 'direct' };

    case 'SystemProfile':
      return { mode: 'system' };

    case 'FixedProfile':
      return buildFixedProfileConfig(profile);

    case 'SwitchProfile':
      if (!allProfiles) {
        log.warn('SwitchProfile requires allProfiles for PAC generation');
        return { mode: 'direct' };
      }
      return buildSwitchProfileConfig(profile, allProfiles);

    case 'PacProfile':
      return buildPacProfileConfig(profile);

    default:
      log.warn('Unknown profile type, falling back to direct');
      return { mode: 'direct' };
  }
}

/**
 * Synchronous version for direct/system profiles (no async overhead)
 */
export function buildSimpleProxyConfig(profile: Profile): chrome.proxy.ProxyConfig {
  if (profile.profileType === 'DirectProfile') {
    return { mode: 'direct' };
  }
  if (profile.profileType === 'SystemProfile') {
    return { mode: 'system' };
  }
  // For other types, use the async version
  throw new Error('Use buildProxyConfig() for complex profile types');
}
