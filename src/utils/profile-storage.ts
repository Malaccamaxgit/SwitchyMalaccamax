/**
 * Typed parsing of profile arrays from extension storage (chrome.storage.local).
 */
import type { Profile } from '@/core/schema';

export function isProfileRecord(value: unknown): value is Profile {
  if (typeof value !== 'object' || value === null) return false;
  const o = value as Record<string, unknown>;
  return typeof o.id === 'string' && typeof o.profileType === 'string';
}

export function parseProfilesFromStorage(raw: unknown): Profile[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isProfileRecord);
}
