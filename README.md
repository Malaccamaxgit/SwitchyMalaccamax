# SwitchyMalaccamax

> Chrome Extension for proxy management

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Security Score](https://img.shields.io/badge/Security%20Score-9.2%2F10-brightgreen.svg)](./docs/development/SECURITY_AUDIT_REPORT.md)
[![Vulnerabilities](https://img.shields.io/badge/Vulnerabilities-0%20CVEs-brightgreen.svg)](https://github.com/Malaccamaxgit/SwitchyMalaccamax/security)

A Chrome extension for managing proxy configurations. Built with TypeScript, Vue 3, and Vite. Includes ReDoS attack prevention, AES-256-GCM credential encryption, and automated security scanning.

## Features

- Switch proxy profiles manually or automatically based on URL patterns
- 5 profile types: Direct, Fixed Server, PAC Script, Auto Switch, System Proxy
- 7 condition types for auto-switching: wildcards, regex, keywords, host levels, bypass
- TypeScript with strict mode and Vue 3 Composition API
- ReDoS-safe pattern matching (< 50ms guaranteed)
- AES-256-GCM credential encryption
- 150+ tests with Vitest

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Chrome/Chromium 88+

### Installation

```bash
# Clone the repository
git clone https://github.com/Malaccamaxgit/SwitchyMalaccamax.git
cd SwitchyMalaccamax

# Install dependencies
npm install

# Build the extension
npm run build
```

### Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `dist/` directory from the project root
5. The extension icon will appear in your toolbar

### Development Mode

```bash
# Start development server with hot reload
npm run dev

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Type checking
npm run typecheck

# Lint and format
npm run lint
npm run format
```

## 📦 Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Language** | TypeScript | 5.7+ |
| **Framework** | Vue 3 (Composition API) | 3.5+ |
| **Build Tool** | Vite | 6.0+ |
| **Testing** | Vitest | 4.0+ |
| **Styling** | Tailwind CSS | 3.4+ |
| **Extension Plugin** | @crxjs/vite-plugin | 2.0+ |
| **Target** | Chrome Manifest V3 | — |

## Project Structure

```
src/
├── background/          # Service worker
├── popup/              # Quick switch UI
├── options/            # Configuration page
├── components/         # Vue components
├── core/               # Business logic
│   ├── schema.ts       # Type definitions
│   ├── conditions.ts   # Pattern matching
│   ├── pac/            # PAC generation
│   └── security/       # ReDoS prevention
├── utils/              # Utilities (crypto, Logger)
└── manifest.json       # Extension manifest

tests/                  # Vitest test suites
```

## Configuration

### Condition Types

Auto Switch profiles support these condition types:

| Condition Type | Description | Example |
|---------------|-------------|---------|
| `HostWildcardCondition` | Wildcard hostname matching | `*.example.com` |
| `HostRegexCondition` | Regex hostname matching | `^.*\.example\.com$` |
| `UrlWildcardCondition` | Wildcard full URL matching | `https://*.example.com/*` |
| `UrlRegexCondition` | Regex full URL matching | `^https://.*\.example\.com/.*$` |
| `KeywordCondition` | Simple substring match | `example` |
| `HostLevelsCondition` | Subdomain depth matching | `minValue: 2, maxValue: 3` |
| `BypassCondition` | Always bypass proxy | — |

## Development

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## Performance

- Build time: ~1.7s (production)
- Pattern matching: < 50ms (guaranteed)
- Extension size: ~310 KB (gzipped)

## Security

**Security Score**: 9.2/10 (OWASP Top 10 audit - see [SECURITY_AUDIT_REPORT.md](./docs/development/SECURITY_AUDIT_REPORT.md))

**Implementation**:
- ReDoS prevention: Pattern matching validated and deterministic (< 50ms)
- Credential encryption: AES-256-GCM with PBKDF2 (100,000 iterations)
- Permissions: No host permissions requested
- Dependencies: 0 known CVEs

**Automation**:
- Pre-commit hook runs npm audit and secret scanner
- GitHub Actions: security checks on push/PR, weekly scans (Mondays 9 AM UTC)
- See [docs/guides/SECURITY_AUTOMATION.md](./docs/guides/SECURITY_AUTOMATION.md)

**Report vulnerabilities**: [SECURITY.md](./SECURITY.md) or GitHub Security Advisories

## 📄 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](./LICENSE) file for details.

## Acknowledgments

Inspired by SwitchyOmega and Proxy SwitchySharp extensions.

## Documentation

### Quick Links
- **Getting Started**: [Project Setup Guide](./docs/guides/PROJECT_SETUP_COMPLETE.md)
- **Security**: [Security Policy](./SECURITY.md) | [Audit Report](./docs/development/SECURITY_AUDIT_REPORT.md) | [Automation](./docs/guides/SECURITY_AUTOMATION.md)
- **Contributing**: [CONTRIBUTING.md](./CONTRIBUTING.md) | [Pre-flight Checklist](./docs/guides/PRE_FLIGHT_CHECKLIST.md)

### Documentation Map

#### 📘 Guides (Step-by-Step Instructions)
- [Icon Generation Guide](./docs/guides/ICON_GENERATION_GUIDE.md)
- [Line Endings Configuration](./docs/guides/LINE_ENDINGS.md)
- [Logger Integration Guide](./docs/guides/LOGGER_INTEGRATION_GUIDE.md)
- [Pre-flight Checklist](./docs/guides/PRE_FLIGHT_CHECKLIST.md)
- [Project Setup Complete](./docs/guides/PROJECT_SETUP_COMPLETE.md)
- [Security Automation](./docs/guides/SECURITY_AUTOMATION.md)

#### 🏗️ Architecture (Deep Dives & Specifications)
- [Format Comparison](./docs/architecture/format-comparison.md)
- [Logger UI Integration](./docs/architecture/LOGGER_UI_INTEGRATION.md)
- [Migration API Specification](./docs/architecture/migration-api-spec.md)
- [Migration Architecture](./docs/architecture/migration-architecture.md)
- [Migration Implementation Tracker](./docs/architecture/MIGRATION_IMPLEMENTATION_TRACKER.md)
- [Migration Result Examples](./docs/architecture/migration-result-examples.md)
- [Migration Results UI](./docs/architecture/migration-results-ui.md)
- [Migration System Design](./docs/architecture/MIGRATION_SYSTEM_DESIGN.md)
- [Migration UI States](./docs/architecture/migration-ui-states.md)
- [PAC Compiler Fix](./docs/architecture/PAC_COMPILER_FIX.md)
- [PAC Compiler Migration](./docs/architecture/PAC_COMPILER_MIGRATION.md)
- [PAC Compiler Rewrite](./docs/architecture/PAC_COMPILER_REWRITE.md)
- [PAC Export Feature](./docs/architecture/PAC_EXPORT_FEATURE.md)
- [PAC Output Example](./docs/architecture/PAC_OUTPUT_EXAMPLE.md)
- [UI Redesign Specification](./docs/architecture/UI_REDESIGN_SPEC.md)

#### 🔧 Development (Contributor Information)
- [Security Audit Report](./docs/development/SECURITY_AUDIT_REPORT.md)

#### 📦 Archive (Historical Reports)
- [Development History](./docs/archive/)

---

**Issues**: [GitHub Issues](https://github.com/Malaccamaxgit/SwitchyMalaccamax/issues) | **Discussions**: [GitHub Discussions](https://github.com/Malaccamaxgit/SwitchyMalaccamax/discussions)
