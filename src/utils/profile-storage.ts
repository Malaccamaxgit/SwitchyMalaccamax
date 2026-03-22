/**
 * Typed parsing of profile arrays from extension storage (chrome.storage.local).
 */
import type { Profile } from '@/core/schema';
import { decryptProfile } from '@/utils/crypto';

export function isProfileRecord(value: unknown): value is Profile {
  if (typeof value !== 'object' || value === null) return false;
  const o = value as Record<string, unknown>;
  return typeof o.id === 'string' && typeof o.profileType === 'string';
}

export function parseProfilesFromStorage(raw: unknown): Profile[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isProfileRecord);
}

/**
 * Parse stored profile records and decrypt username/password fields (SM1: / legacy base64).
 */
export async function decryptProfilesFromStorage(raw: unknown): Promise<Profile[]> {
  const parsed = parseProfilesFromStorage(raw);
  const decrypted = await Promise.all(
    parsed.map(async (p) => {
      const d = await decryptProfile(p as unknown as Record<string, unknown>);
      return d as unknown as Profile;
    })
  );
  return decrypted;
}
