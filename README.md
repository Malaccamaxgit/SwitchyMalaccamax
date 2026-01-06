# SwitchyMalaccamax

Chrome extension for managing proxy configurations. Fork of SwitchyOmega rebuilt with TypeScript, Vue 3, and Vite.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

## Features

- Switch between multiple proxy profiles manually or automatically
- 5 profile types: Direct, Fixed Server, PAC Script, Auto Switch, System Proxy
- 7 condition types for auto-switching: wildcards, regex, keywords, host levels, URL patterns, bypass rules
- Import/export configurations
- Generate PAC (Proxy Auto-Configuration) scripts

### Technical Details

- **Language**: TypeScript 5.7 (strict mode)
- **Framework**: Vue 3 Composition API
- **Build**: Vite 6 with @crxjs/vite-plugin
- **Testing**: Vitest (163 tests)
- **Security**: ReDoS-safe pattern matching, AES-256-GCM credential encryption
- **Target**: Chrome Manifest V3

## Installation

### For Users

1. Download the latest release from GitHub
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked"
5. Select the `dist/` folder from the extracted release

### For Developers

```bash
# Clone the repository
git clone https://github.com/Malaccamaxgit/SwitchyMalaccamax.git
cd SwitchyMalaccamax

# Install dependencies
npm install

# Build the extension
npm run build

# Development mode with hot reload
npm run dev
```

## Usage

Click the extension icon in your browser toolbar to:
- Quickly switch between configured proxy profiles
- Access the options page for detailed configuration

### Condition Types

Auto Switch profiles support these matching conditions:

| Type | Description | Example |
|------|-------------|---------|
| Host Wildcard | Match hostnames with wildcards | `*.example.com` |
| Host Regex | Match hostnames with regex | `^.*\.example\.com$` |
| URL Wildcard | Match full URLs with wildcards | `https://*.example.com/*` |
| URL Regex | Match full URLs with regex | `^https://.*\.example\.com/.*$` |
| Keyword | Simple substring match | `example` |
| Host Levels | Match by subdomain depth | Min: 2, Max: 3 |
| Bypass | Always use direct connection | — |

## Development

For development setup:

```bash
npm run dev          # Development mode with hot reload
npm test             # Run tests
npm run typecheck    # Type checking
npm run lint         # Lint code
npm run format       # Format code
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## Project Structure

```
src/
├── background/       # Service worker
├── popup/           # Quick switch UI
├── options/         # Configuration page
├── components/      # Vue components
├── core/            # Business logic
│   ├── schema.ts    # Type definitions
│   ├── conditions.ts # Pattern matching
│   ├── pac/         # PAC generation
│   └── security/    # ReDoS prevention
└── utils/           # Utilities (crypto, logging)

tests/               # Test suites
```

## Security

This extension includes several security features:

- **ReDoS Prevention**: User-supplied regex patterns are validated before use to prevent catastrophic backtracking
- **Credential Encryption**: Proxy credentials are encrypted using AES-256-GCM with PBKDF2 key derivation
- **Content Security Policy**: Strict CSP prevents inline script execution
- **Input Sanitization**: All user inputs are validated and sanitized

For security issues, see [SECURITY.md](./SECURITY.md).

## License

GNU General Public License v3.0 - see [LICENSE](./LICENSE) for details.

## Credits

Fork of [SwitchyOmega](https://github.com/FelisCatus/SwitchyOmega). Original concept from Proxy SwitchySharp.

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
