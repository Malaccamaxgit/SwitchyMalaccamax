# Changelog

> **Notable changes** — Version history following [Keep a Changelog](https://keepachangelog.com/).

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/)

## [0.1.9] — 2026-03-15

### Added
- Service worker tests (`tests/background/service-worker.spec.ts`) — 259 lines testing `checkProxyConflicts()`, message validation, icon generation
- PopupApp component tests (`tests/popup/PopupApp.spec.ts`) — 390 lines testing profile switching, conflict detection, sorting, navigation
- 22 new tests (201 total passing)

### Changed
- Dead code removal: `migration.types.ts` (506 lines removed)
- Type assertions replaced with type guards in PAC generator
- Interval cleanup on extension unload (`onSuspend` lifecycle)
- Documentation test counts updated (180 → 201)

### Security
- All security features maintained
- npm audit: 0 vulnerabilities
- ReDoS prevention, AES-256-GCM encryption intact

## [0.1.8] — 2026-03-15

### Added
- `update_url` for Chrome Web Store auto-update support
- `activeTab` permission for enhanced tab access
- SVG icon variants (icon.svg, icon-128.svg)

### Changed
- Moved `<all_urls>` from `host_permissions` to `optional_host_permissions`
- Improves Chrome Web Store privacy compliance
- Users can now deny host access while retaining basic functionality

### Security
- No code changes—manifest permission refinements only
- Aligns with Chrome Web Store distribution requirements

## [0.1.7] — 2026-03-15

### Security
- Fixed all 8 npm audit vulnerabilities (6 high, 2 moderate)
- Updated `@crxjs/vite-plugin` to 1.0.14 (rollup vulnerability fix)
- `npm audit`: 0 vulnerabilities

### Changed
- Documentation rewrite: all root-level `.md` files simplified with tables and taglines
- Documentation rewrite: all `docs/architecture/` and `docs/guides/` files reformatted
- Updated test count references to 180 across documentation

### Added
- Clear taglines at top of all documentation files
- Consistent table-based formatting for specifications

## [0.1.6] — 2026-01-07

### Added
- File System Access API for exports (native save dialog with anchor fallback; no `downloads` permission required)
- CI check for Dependency Review deprecation warnings
- ESLint v9 flat config migration

### Changed
- Export flows use `saveBlobToFile()` helper for consistent cross-browser behavior

### Fixed
- Test stubs for File System Access API in CI environment

### Security
- 180 tests passing

## [0.1.5] — 2026-01-06

### Added
- Startup profile: auto-apply profile on browser launch
- Profile visibility toggle (show/hide in popup)
- Built-in profiles (Direct, System Proxy) protected from deletion
- Test Connection feature with customizable target URL
- SOCKS4 authentication (username-only mode)
- Commercial proxy service support (API token in password field)

### Changed
- Auto Switch bypass list handled per-rule (not in profile editor)
- Log viewer moved to Debug section with configurable row count
- PAC compiler with recursive profile resolution

### Fixed
- Profile editor validation and UI consistency
- Husky pre-commit hooks on Windows
- Security scanner false positives

### Security
- 180 tests passing
- npm audit: 0 vulnerabilities

## [0.1.3] — 2026-01-05

### Security
- Per-user random salt (32 bytes) for credential encryption
- Hardened CSP (removed `unsafe-inline`, added `upgrade-insecure-requests`)
- TypeScript message interfaces with action whitelist
- Rate limiting (100ms cooldown per sender)
- Pre-commit security hooks
- GitHub Actions security audit workflow
- PAC fuzzing test suite

### Testing
- Crypto tests mock `chrome.storage.local`
- 180 tests passing

## [0.1.2] — 2026-01-04

### Added
- Chrome Web Store preparation (manifest audit, permission minimization)
- Production logger cleanup script
- Secret scanner implementation
- Comprehensive security audit

### Removed
- Network Monitor feature (simplify Chrome Web Store review)

### Fixed
- TypeScript compilation with Web Crypto API
- GPG signing configuration
- Type definitions for `.vue` files and `safe-regex`

## [0.1.1] — 2026-01-03

### Added
- PAC compiler (TypeScript rewrite)
- 5 profile types: Direct, Fixed Server, PAC Script, Auto Switch, System Proxy
- 7 condition types: wildcards, regex, keywords, host levels, URL patterns, bypass
- Vue 3 Composition API UI
- Tailwind CSS styling
- Vite 6 build system
- 180 tests with Vitest

## [0.1.0] — 2026-01-01

### Added
- Initial fork of SwitchyOmega
- TypeScript 5.7, Vue 3, Vite modernization
- Chrome Manifest V3 compliance
- ReDoS-safe wildcard matching
- Input validation for user patterns
- GPL-3.0 license
