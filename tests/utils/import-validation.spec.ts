import { describe, it, expect } from 'vitest';
import {
  getJsonDepth,
  assertImportParsedJson,
  filterToValidImportedProfiles,
  assertImportProfileCount,
  ImportValidationError,
} from '@/utils/import-validation';
import { IMPORT_LIMITS } from '@/core/security/constants';

describe('import-validation', () => {
  it('measures JSON depth', () => {
    expect(getJsonDepth({ a: { b: { c: 1 } } })).toBe(3);
    expect(getJsonDepth({ a: 1 })).toBe(1);
  });

  it('throws when parsed JSON serializes too large', () => {
    const big = 'y'.repeat(IMPORT_LIMITS.MAX_SERIALIZED_JSON_CHARS);
    expect(() => assertImportParsedJson({ x: big }, 100)).toThrow(ImportValidationError);
  });

  it('filters to valid profile shapes', () => {
    const profiles = filterToValidImportedProfiles([
      { id: 'a', name: 'Test', profileType: 'FixedProfile' },
      { id: 'b', name: 'Bad', profileType: 'NotARealType' },
      { foo: 1 },
    ]);
    expect(profiles).toHaveLength(1);
    expect(profiles[0].id).toBe('a');
  });

  it('throws when too many profiles', () => {
    expect(() => assertImportProfileCount(IMPORT_LIMITS.MAX_PROFILES + 1)).toThrow(ImportValidationError);
  });
});
