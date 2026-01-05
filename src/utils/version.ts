/**
 * version.ts - Centralized version management
 * 
 * Provides access to the extension version from manifest.json
 * This ensures version numbers are consistent across the extension
 */

import manifest from '../manifest.json';

/**
 * Get the extension version from manifest.json
 * @returns Version string (e.g., "0.1.2")
 */
export function getVersion(): string {
  return manifest.version;
}

/**
 * Get the extension version with 'v' prefix
 * @returns Version string with v prefix (e.g., "v0.1.2")
 */
export function getVersionWithPrefix(): string {
  return `v${manifest.version}`;
}

/**
 * Get the manifest version
 * @returns Manifest version number (e.g., 3)
 */
export function getManifestVersion(): number {
  return manifest.manifest_version;
}

/**
 * Extension version (for convenience)
 */
export const VERSION = manifest.version;

/**
 * Extension version with 'v' prefix (for convenience)
 */
export const VERSION_PREFIXED = `v${manifest.version}`;
