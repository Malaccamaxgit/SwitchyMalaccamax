# Changelog

Notable changes to this project.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)  
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

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
