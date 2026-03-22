/**
 * Import pipeline guards: size, depth, and lightweight profile shape checks.
 */
import type { Profile } from '@/core/schema';
import { IMPORT_LIMITS } from '@/core/security/constants';
import { isProfileRecord } from '@/utils/profile-storage';

const ALLOWED_PROFILE_TYPES = new Set<string>([
  'DirectProfile',
  'SystemProfile',
  'FixedProfile',
  'SwitchProfile',
  'PacProfile',
]);

export class ImportValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImportValidationError';
  }
}

/** Recursively measure object/array nesting depth (root depth = 0). */
export function getJsonDepth(value: unknown, depth = 0, max = IMPORT_LIMITS.MAX_OBJECT_DEPTH): number {
  if (depth > max) return depth;
  if (value === null || typeof value !== 'object') return depth;
  if (Array.isArray(value)) {
    let deepest = depth;
    for (const item of value) {
      deepest = Math.max(deepest, getJsonDepth(item, depth + 1, max));
    }
    return deepest;
  }
  let deepest = depth;
  for (const v of Object.values(value)) {
    deepest = Math.max(deepest, getJsonDepth(v, depth + 1, max));
  }
  return deepest;
}

export function assertImportFileSize(file: File): void {
  if (file.size > IMPORT_LIMITS.MAX_FILE_BYTES) {
    throw new ImportValidationError(
      `File too large (max ${Math.round(IMPORT_LIMITS.MAX_FILE_BYTES / (1024 * 1024))} MB)`
    );
  }
}

export function assertImportParsedJson(parsed: unknown, rawTextLength: number): void {
  if (rawTextLength > IMPORT_LIMITS.MAX_SERIALIZED_JSON_CHARS) {
    throw new ImportValidationError('Import text exceeds maximum length');
  }
  let serialized: string;
  try {
    serialized = JSON.stringify(parsed);
  } catch {
    throw new ImportValidationError('JSON could not be serialized');
  }
  if (serialized.length > IMPORT_LIMITS.MAX_SERIALIZED_JSON_CHARS) {
    throw new ImportValidationError('Parsed JSON is too large');
  }
  const depth = getJsonDepth(parsed);
  if (depth > IMPORT_LIMITS.MAX_OBJECT_DEPTH) {
    throw new ImportValidationError('JSON is nested too deeply');
  }
}

/**
 * Keep only objects that look like profiles (id, profileType, name, bounded strings).
 */
export function filterToValidImportedProfiles(raw: unknown[]): Profile[] {
  const out: Profile[] = [];
  for (const item of raw) {
    if (!isProfileRecord(item)) continue;
    const o = item as unknown as Record<string, unknown>;
    if (typeof o.name !== 'string' || o.name.length > IMPORT_LIMITS.MAX_PROFILE_NAME_LENGTH) {
      continue;
    }
    if (typeof o.id !== 'string' || o.id.length > IMPORT_LIMITS.MAX_PROFILE_ID_LENGTH) {
      continue;
    }
    if (!ALLOWED_PROFILE_TYPES.has(o.profileType as string)) continue;
    out.push(item as Profile);
  }
  return out;
}

export function assertImportProfileCount(count: number): void {
  if (count > IMPORT_LIMITS.MAX_PROFILES) {
    throw new ImportValidationError(
      `Too many profiles (max ${IMPORT_LIMITS.MAX_PROFILES})`
    );
  }
}
