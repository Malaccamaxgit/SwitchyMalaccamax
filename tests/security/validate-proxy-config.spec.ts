import { describe, it, expect } from 'vitest';
import { isValidProxyConfig } from '@/core/security/validate-proxy-config';

describe('isValidProxyConfig', () => {
  it('accepts direct mode', () => {
    expect(isValidProxyConfig({ mode: 'direct' })).toBe(true);
  });

  it('accepts fixed_servers with valid singleProxy', () => {
    expect(
      isValidProxyConfig({
        mode: 'fixed_servers',
        rules: {
          singleProxy: { scheme: 'http', host: '127.0.0.1', port: 8080 },
        },
      })
    ).toBe(true);
  });

  it('rejects fixed_servers without a proxy rule', () => {
    expect(
      isValidProxyConfig({
        mode: 'fixed_servers',
        rules: { bypassList: ['127.0.0.1'] },
      })
    ).toBe(false);
  });

  it('rejects invalid port', () => {
    expect(
      isValidProxyConfig({
        mode: 'fixed_servers',
        rules: {
          singleProxy: { scheme: 'http', host: '127.0.0.1', port: 99999 },
        },
      })
    ).toBe(false);
  });

  it('rejects invalid scheme', () => {
    expect(
      isValidProxyConfig({
        mode: 'fixed_servers',
        rules: {
          singleProxy: { scheme: 'ftp', host: '127.0.0.1', port: 8080 },
        },
      })
    ).toBe(false);
  });

  it('accepts pac_script with data', () => {
    expect(
      isValidProxyConfig({
        mode: 'pac_script',
        pacScript: { data: 'function FindProxyForURL() { return "DIRECT"; }' },
      })
    ).toBe(true);
  });

  it('accepts pac_script with https url', () => {
    expect(
      isValidProxyConfig({
        mode: 'pac_script',
        pacScript: { url: 'https://example.com/proxy.pac' },
      })
    ).toBe(true);
  });

  it('rejects javascript: pac url', () => {
    expect(
      isValidProxyConfig({
        mode: 'pac_script',
        pacScript: { url: 'javascript:alert(1)' },
      })
    ).toBe(false);
  });

  it('rejects oversized pac data', () => {
    const huge = 'x'.repeat(600 * 1024);
    expect(
      isValidProxyConfig({
        mode: 'pac_script',
        pacScript: { data: huge },
      })
    ).toBe(false);
  });
});
