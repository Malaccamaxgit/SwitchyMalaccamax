/**
 * Request optional `<all_urls>` host access when needed (e.g. proxy connection test via fetch).
 * Matches `optional_host_permissions` in the extension manifest.
 */
const ALL_URLS: [string] = ['<all_urls>'];

export async function ensureAllUrlsHostAccess(): Promise<boolean> {
  if (typeof chrome === 'undefined' || !chrome.permissions) {
    return false;
  }
  try {
    const already = await chrome.permissions.contains({ origins: ALL_URLS });
    if (already) return true;
    return await chrome.permissions.request({ origins: ALL_URLS });
  } catch {
    return false;
  }
}
