/**
 * version.ts - Centralized version management
 *
 * Provides access to the extension version from manifest.json
 * This ensures version numbers are consistent across the extension
 */
/**
 * Get the extension version from manifest.json
 * @returns Version string (e.g., "0.1.2")
 */
export declare function getVersion(): string;
/**
 * Get the extension version with 'v' prefix
 * @returns Version string with v prefix (e.g., "v0.1.2")
 */
export declare function getVersionWithPrefix(): string;
/**
 * Get the manifest version
 * @returns Manifest version number (e.g., 3)
 */
export declare function getManifestVersion(): number;
/**
 * Extension version (for convenience)
 */
export declare const VERSION: string;
/**
 * Extension version with 'v' prefix (for convenience)
 */
export declare const VERSION_PREFIXED: string;
//# sourceMappingURL=version.d.ts.map