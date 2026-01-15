# Changelog

Notable changes to this project.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)  
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

## [0.1.6] - 2026-01-07

### Added
- File export UX: Use the File System Access API (when available) to prompt users for a save destination; fallback to standard download flow. This avoids requiring the `downloads` permission and improves user control over exported files. (See `src/lib/fileSaver.ts`)
- CI check to detect Dependency Review deprecation warnings and fail if the `deny-licenses` deprecation reappears.
- ESLint v9 (flat) migration report (`eslint-report.json`) and repo cleanup.

### Changed
- Export flows in `OptionsApp` and related components now use `saveBlobToFile()` helper for consistent save behavior across browsers.

### Fixed
- Tests and Node environment stubs for File System Access API to make exports testable in CI.

### Security
- All tests passing (178 passed, 2 skipped)


## [0.1.5] - 2026-01-06

### Added
- Startup profile feature: automatically apply a profile on browser start
- Profile visibility toggle (show/hide in popup quick-switch menu)
- Built-in profiles (Direct, System Proxy) with protection from deletion
- Test Connection feature for proxy profiles with customizable target URL/IP
- SOCKS4 authentication field behavior (username only)
- Commercial proxy service support (API token in password field)

### Changed
- Auto Switch profile no longer shows bypass list editor (bypass handled per-rule)
- Log viewer moved to Debug section with configurable export row count
- Improved PAC compiler with recursive profile resolution

### Fixed
- Profile editor validation and UI consistency
- Husky pre-commit hooks on Windows (CMD wrapper)
- Security scanner false positive for validation error messages

### Security
- 171 tests passing with comprehensive PAC fuzzing
- npm audit: 0 vulnerabilities

## [0.1.3] - 2026-01-05

### Security
- Enhanced credential encryption with per-user random salt (32 bytes)
- Hardened Content Security Policy (removed unsafe-inline, added upgrade-insecure-requests)
- Added TypeScript message interfaces with action whitelist
- Implemented rate limiting (100ms cooldown per sender)
- Added pre-commit security hooks
- Added GitHub Actions security audit workflow
- Created PAC fuzzing test suite (9 tests)

### Testing
- Fixed crypto tests to mock chrome.storage.local
- Updated PAC fuzzing tests
- 163 tests passing (2 skipped intentionally)

## [0.1.2] - 2026-01-04

### Added
- Chrome Web Store preparation (manifest audit, permission minimization)
- Production logger cleanup script
- Secret scanner implementation
- Comprehensive security audit

### Removed
- Network Monitor feature (to simplify Chrome Web Store review)

### Fixed
- TypeScript compilation errors with Web Crypto API
- GPG signing configuration issues
- Type definitions for .vue files and safe-regex

## [0.1.1] - 2026-01-03

### Added
- PAC compiler with TypeScript rewrite
- 5 profile types (Direct, Fixed Server, PAC Script, Auto Switch, System Proxy)
- 7 condition types (wildcards, regex, keywords, host levels, URL patterns, bypass)
- Vue 3 Composition API UI
- Tailwind CSS styling
- Vite 6 build system
- 150+ tests with Vitest

## [0.1.0] - 2026-01-01

### Added
- Initial fork of SwitchyOmega
- Modernized with TypeScript 5.7, Vue 3, and Vite
- Chrome Manifest V3 compliance
- ReDoS-safe wildcard matching
- Input validation for user patterns
- GPL-3.0 license
