import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const manifestPath = join(dirname(fileURLToPath(import.meta.url)), '../../src/manifest.json');

function loadManifest(): Record<string, unknown> {
  return JSON.parse(readFileSync(manifestPath, 'utf-8')) as Record<string, unknown>;
}

describe('Chrome Web Store manifest compliance', () => {
  const manifest = loadManifest();

  it('uses Manifest V3', () => {
    expect(manifest.manifest_version).toBe(3);
  });

  it('omits update_url (Chrome Web Store manages updates)', () => {
    expect(manifest).not.toHaveProperty('update_url');
  });

  it('requests only proxy and storage', () => {
    const perms = manifest.permissions as string[];
    expect(Array.isArray(perms)).toBe(true);
    expect([...perms].sort()).toEqual(['proxy', 'storage']);
  });

  it('does not request webRequest or activeTab', () => {
    const perms = manifest.permissions as string[];
    expect(perms).not.toContain('webRequest');
    expect(perms).not.toContain('activeTab');
  });

  it('declares optional <all_urls> and does not require broad host_permissions', () => {
    expect(manifest.optional_host_permissions).toEqual(['<all_urls>']);
    expect(manifest).not.toHaveProperty('host_permissions');
  });

  it('uses extension_pages CSP without unsafe directives', () => {
    const csp = manifest.content_security_policy as { extension_pages?: string };
    const ep = csp.extension_pages ?? '';
    expect(ep).toContain("script-src 'self'");
    expect(ep).not.toContain('unsafe-eval');
    expect(ep).not.toContain('unsafe-inline');
  });
});
