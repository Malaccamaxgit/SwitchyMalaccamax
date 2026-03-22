/**
 * Validates chrome.proxy.ProxyConfig-shaped objects before applying them.
 * Used by the service worker message handler (defense in depth).
 */
import { PROXY_CONFIG_LIMITS } from './constants';

const ALLOWED_MODES = ['direct', 'auto_detect', 'pac_script', 'fixed_servers', 'system'] as const;

const ALLOWED_SCHEMES = new Set(['http', 'https', 'socks4', 'socks5']);

const PROXY_RULE_KEYS = [
  'singleProxy',
  'proxyForHttp',
  'proxyForHttps',
  'proxyForFtp',
  'fallbackProxy',
] as const;

function isSafePacUrl(url: string): boolean {
  if (url.length === 0 || url.length > PROXY_CONFIG_LIMITS.MAX_PAC_SCRIPT_URL_LENGTH) {
    return false;
  }
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidProxyServer(obj: unknown): boolean {
  if (!obj || typeof obj !== 'object') return false;
  const s = obj as Record<string, unknown>;
  if (typeof s.host !== 'string' || s.host.length === 0) return false;
  if (s.host.length > PROXY_CONFIG_LIMITS.MAX_PROXY_HOST_LENGTH) return false;
  if (/[\0\n\r]/.test(s.host)) return false;
  if (typeof s.port !== 'number' || !Number.isInteger(s.port)) return false;
  if (s.port < 1 || s.port > 65535) return false;
  const scheme = typeof s.scheme === 'string' ? s.scheme.toLowerCase() : '';
  if (!ALLOWED_SCHEMES.has(scheme)) return false;
  return true;
}

function validateFixedServersRules(rules: Record<string, unknown>): boolean {
  let hasProxy = false;
  for (const key of PROXY_RULE_KEYS) {
    const v = rules[key];
    if (v === undefined) continue;
    if (!isValidProxyServer(v)) return false;
    hasProxy = true;
  }
  if (!hasProxy) return false;

  if (rules.bypassList !== undefined) {
    if (!Array.isArray(rules.bypassList)) return false;
    if (rules.bypassList.length > PROXY_CONFIG_LIMITS.MAX_BYPASS_ENTRIES) return false;
    for (const b of rules.bypassList) {
      if (typeof b !== 'string') return false;
      if (b.length > PROXY_CONFIG_LIMITS.MAX_BYPASS_PATTERN_LENGTH) return false;
      if (/[\0\n\r]/.test(b)) return false;
    }
  }

  return true;
}

function validatePacScript(pac: Record<string, unknown>): boolean {
  let ok = false;
  if (pac.data != null) {
    if (typeof pac.data !== 'string') return false;
    if (pac.data.length === 0 || pac.data.length > PROXY_CONFIG_LIMITS.MAX_PAC_SCRIPT_DATA_CHARS) {
      return false;
    }
    ok = true;
  }
  if (pac.url != null) {
    if (typeof pac.url !== 'string' || !isSafePacUrl(pac.url)) return false;
    ok = true;
  }
  return ok;
}

export function isValidProxyConfig(config: unknown): config is chrome.proxy.ProxyConfig {
  if (!config || typeof config !== 'object') return false;

  const cfg = config as Record<string, unknown>;

  if (
    !cfg.mode ||
    typeof cfg.mode !== 'string' ||
    !ALLOWED_MODES.includes(cfg.mode as (typeof ALLOWED_MODES)[number])
  ) {
    return false;
  }

  if (cfg.mode === 'pac_script') {
    const pac = cfg.pacScript as Record<string, unknown> | undefined;
    if (!pac || typeof pac !== 'object') return false;
    return validatePacScript(pac);
  }

  if (cfg.mode === 'fixed_servers') {
    if (!cfg.rules || typeof cfg.rules !== 'object') return false;
    return validateFixedServersRules(cfg.rules as Record<string, unknown>);
  }

  return true;
}
