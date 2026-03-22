import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ensureAllUrlsHostAccess } from '@/lib/optionalHostPermission';

describe('ensureAllUrlsHostAccess', () => {
  beforeEach(() => {
    vi.stubGlobal('chrome', {
      permissions: {
        contains: vi.fn(),
        request: vi.fn(),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns true when optional <all_urls> is already granted', async () => {
    (chrome.permissions.contains as ReturnType<typeof vi.fn>).mockResolvedValue(true);

    await expect(ensureAllUrlsHostAccess()).resolves.toBe(true);
    expect(chrome.permissions.contains).toHaveBeenCalledWith({ origins: ['<all_urls>'] });
    expect(chrome.permissions.request).not.toHaveBeenCalled();
  });

  it('requests permission when not yet granted and returns request result', async () => {
    (chrome.permissions.contains as ReturnType<typeof vi.fn>).mockResolvedValue(false);
    (chrome.permissions.request as ReturnType<typeof vi.fn>).mockResolvedValue(true);

    await expect(ensureAllUrlsHostAccess()).resolves.toBe(true);
    expect(chrome.permissions.request).toHaveBeenCalledWith({ origins: ['<all_urls>'] });
  });

  it('returns false when user denies the request', async () => {
    (chrome.permissions.contains as ReturnType<typeof vi.fn>).mockResolvedValue(false);
    (chrome.permissions.request as ReturnType<typeof vi.fn>).mockResolvedValue(false);

    await expect(ensureAllUrlsHostAccess()).resolves.toBe(false);
  });

  it('returns false when permissions API throws', async () => {
    (chrome.permissions.contains as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('boom'));

    await expect(ensureAllUrlsHostAccess()).resolves.toBe(false);
  });

  it('returns false when chrome is undefined', async () => {
    vi.unstubAllGlobals();

    await expect(ensureAllUrlsHostAccess()).resolves.toBe(false);
  });
});
