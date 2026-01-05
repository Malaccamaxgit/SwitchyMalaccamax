# SwitchyMalaccamax

> Chrome Extension for proxy management

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Security Score](https://img.shields.io/badge/Security%20Score-9.2%2F10-brightgreen.svg)](./SECURITY_AUDIT_REPORT.md)
[![Vulnerabilities](https://img.shields.io/badge/Vulnerabilities-0%20CVEs-brightgreen.svg)](https://github.com/Malaccamaxgit/SwitchyMalaccamax/security)

A Chrome extension for managing proxy configurations. Built with TypeScript, Vue 3, and Vite. Includes ReDoS attack prevention, AES-256-GCM credential encryption, and automated security scanning.

## Features

- **ReDoS Prevention**: Deterministic wildcard matching with < 50ms execution time guarantee
- **Credential Encryption**: AES-256-GCM encryption with PBKDF2 key derivation for stored passwords
- **TypeScript**: Strict mode with full type safety
- **Vue 3**: Composition API with Tailwind CSS
- **Test Coverage**: 150+ tests including security, crypto, and pattern matching
- **Manifest V3**: Chrome extension compliance
- **Security Automation**: Pre-commit hooks and GitHub Actions for vulnerability scanning
- **Development Tools**: ESLint, Prettier, Vitest, hot module reloading

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

## 🏗️ Architecture

### Project Structure

```
src/
├── background/          # Service worker for Chrome extension
│   └── service-worker.ts
├── popup/              # Quick switch popup UI
│   ├── popup.html
│   ├── popup.ts
│   └── PopupApp.vue
├── options/            # Full configuration page
│   ├── options.html
│   ├── options.ts
│   └── OptionsApp.vue
├── components/         # Reusable Vue components
│   ├── ui/            # UI primitives (Button, Card, Dialog, etc.)
│   ├── profile/       # Profile management components
│   └── network/       # Network monitoring
├── core/              # Business logic
│   ├── schema.ts      # TypeScript type definitions
│   ├── conditions.ts  # Pattern matching engine
│   ├── pac/           # PAC script generation
│   └── security/      # 🔒 Security modules
│       ├── regexSafe.ts        # ReDoS prevention
│       ├── wildcardMatcher.ts  # Deterministic wildcards
│       └── constants.ts        # Security limits
├── utils/             # Utility functions
│   ├── crypto.ts      # AES-256-GCM encryption for credentials
│   ├── migration.ts   # Storage encryption migration
│   └── Logger.ts      # Logging utility
├── lib/               # Shared utilities
│   └── utils.ts
├── styles/
│   └── main.css       # Tailwind CSS entry point
└── manifest.json      # Chrome extension manifest

tests/                 # Vitest test suites
├── core/              # Core logic tests
├── security/          # Security tests (ReDoS, regex validation)
└── utils/             # Utility tests (crypto, Logger)
```

### Security Architecture

SwitchyMalaccamax implements multiple layers of security to prevent Regular Expression Denial of Service (ReDoS) attacks:

#### 1. **Regex Validation** (`regexSafe.ts`)
- Validates user-supplied regex patterns before compilation
- Blocks catastrophic backtracking patterns
- Enforces complexity limits (max 200 chars, 10 groups, 3 nesting depth)
- Validates against known dangerous patterns via `safe-regex` library

#### 2. **Deterministic Wildcard Matching** (`wildcardMatcher.ts`)
- Converts wildcard patterns (`*`, `**`, `?`) to safe, non-backtracking regex
- Uses possessive quantifiers to prevent exponential time complexity
- Guarantees O(n) worst-case performance

#### 3. **Execution Time Limits**
- All pattern matches complete in < 50ms (verified in tests)
- Timeout protection on all user-provided patterns
- Safe fallback behavior on validation failures

#### 4. **Test Coverage**
```bash
Test Files  6 total
Tests       150+ passed
Duration    ~500ms

✅ ReDoS attack prevention
✅ Complexity limit enforcement  
✅ Adversarial input handling
✅ Wildcard deterministic matching
✅ Credential encryption (AES-256-GCM)
✅ Edge cases and error handling
```

## 🔧 Configuration

### Profile Types

- **Direct Connection**: No proxy, direct internet access
- **Fixed Server**: Single proxy server with optional authentication
- **PAC Script**: Proxy Auto-Config script (URL or inline)
- **Auto Switch**: Rule-based automatic proxy selection
- **System Proxy**: Use OS system proxy settings

### Switch Rules

Auto Switch profiles support 7 condition types:

| Condition Type | Description | Example |
|---------------|-------------|---------|
| `HostWildcardCondition` | Wildcard hostname matching | `*.example.com` |
| `HostRegexCondition` | Regex hostname matching | `^.*\.example\.com$` |
| `UrlWildcardCondition` | Wildcard full URL matching | `https://*.example.com/*` |
| `UrlRegexCondition` | Regex full URL matching | `^https://.*\.example\.com/.*$` |
| `KeywordCondition` | Simple substring match | `example` |
| `HostLevelsCondition` | Subdomain depth matching | `minValue: 2, maxValue: 3` |
| `BypassCondition` | Always bypass proxy | — |

### Security Guarantees

All regex-based conditions are validated before use:
- ✅ Safe from catastrophic backtracking
- ✅ Complexity limits enforced
- ✅ Execution time < 50ms guaranteed
- ✅ Invalid patterns rejected with clear error messages

## 🛠️ Development

### Code Standards

- **TypeScript**: Strict mode, no implicit `any`
- **Vue 3**: Composition API with `<script setup>`
- **Security**: All user-supplied regex must use `regexSafe.ts` validation
- **Testing**: New features require corresponding tests
- **Formatting**: Prettier with 2-space indentation
- **Linting**: ESLint with TypeScript + Vue rules

### Adding New Features

1. Create feature branch: `git checkout -b feature/your-feature`
2. Implement with full type safety
3. Add tests to verify functionality and security
4. Run `npm run typecheck && npm test && npm run lint`
5. Submit pull request with clear description

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed contribution guidelines.

## 📊 Performance

| Metric | Value |
|--------|-------|
| **Build Time (dev)** | < 1s |
| **Build Time (prod)** | ~ 1.7s |
| **Hot Reload** | < 200ms |
| **Pattern Match** | < 50ms (guaranteed) |
| **Extension Size** | ~ 310 KB (gzipped) |

## Security

### Security Score: 9.2/10

Based on OWASP Top 10 audit (see [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md)):

| Category | Score |
|----------|-------|
| Broken Access Control | 9/10 |
| Code Injection | 9/10 |
| Cryptographic Failures | 9/10 |
| Vulnerable Components | 10/10 |

### Implementation Details

- **Permissions**: No host permissions requested (extension-only scope)
- **Input Validation**: User-supplied regex patterns validated before execution
- **Encryption**: AES-256-GCM with PBKDF2 (100,000 iterations) for stored credentials
- **Pattern Matching**: Deterministic algorithm with 50ms timeout enforcement
- **Dependencies**: Currently 0 known CVEs (checked via npm audit)

### Security Automation

- **Pre-commit Hook**: Runs npm audit and secret scanner before allowing commits
- **Secret Scanner**: Detects common patterns (AWS keys, API tokens, private keys, etc.)
- **GitHub Actions**: Runs security checks on push/PR (.github/workflows/security-audit.yml)
- **Dependency Review**: GitHub Action reviews dependency changes in PRs
- **Scheduled Scans**: Weekly cron job (Mondays 9 AM UTC) in GitHub Actions

See [docs/SECURITY_AUTOMATION.md](./docs/SECURITY_AUTOMATION.md) for configuration details.

### Reporting Vulnerabilities

- **Security Policy**: [SECURITY.md](./SECURITY.md)
- **Audit Report**: [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md)
- **Contact**: Report vulnerabilities via GitHub Security Advisories

## 📄 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](./LICENSE) file for details.

## Acknowledgments

Inspired by SwitchyOmega and Proxy SwitchySharp extensions.

## 📚 Documentation

- [Project Setup](./docs/PROJECT_SETUP_COMPLETE.md)
- [Security Architecture](./SECURITY.md)
- [Security Audit Report](./SECURITY_AUDIT_REPORT.md)
- [Security Automation Guide](./docs/SECURITY_AUTOMATION.md)
- [Line Endings Configuration](./docs/LINE_ENDINGS.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [API Documentation](./docs/api/migration-api-spec.md)
- [Architecture Deep-Dive](./docs/architecture/)
- [UI Specifications](./docs/ui/)
- [Development History](./docs/archive/)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](./CONTRIBUTING.md) before submitting pull requests.

## 📮 Support

- **Issues**: [GitHub Issues](https://github.com/Malaccamaxgit/SwitchyMalaccamax/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Malaccamaxgit/SwitchyMalaccamax/discussions)

---

**Note**: This extension is under active development. Features and APIs may change between releases.
