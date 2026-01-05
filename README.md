# SwitchyMalaccamax

> Modern Chrome Extension for intelligent proxy switching with security-first design

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)

A next-generation proxy manager built from the ground up with modern web technologies and a security-first mindset. Features intelligent pattern matching, ReDoS attack prevention, and a clean user interface powered by Vue 3 and Tailwind CSS.

## ✨ Features

- 🔒 **Security-Hardened**: ReDoS prevention with deterministic wildcard matching (< 50ms execution time)
- ⚡ **Lightning Fast**: Sub-second builds with Vite 6, hot module reloading
- 🎯 **Modern Architecture**: TypeScript 5.7+ strict mode, Vue 3 Composition API, Manifest V3
- 🧪 **Thoroughly Tested**: 47+ security tests with Vitest, comprehensive edge case coverage
- 🎨 **Clean Design**: Responsive UI with Tailwind CSS and dark mode support
- 🔧 **Developer Friendly**: Full type safety, ESLint + Prettier configuration

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
| **Testing** | Vitest | 2.1+ |
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
│   └── security/      # 🔒 Security modules
│       ├── regexSafe.ts        # ReDoS prevention
│       ├── wildcardMatcher.ts  # Deterministic wildcards
│       └── constants.ts        # Security limits
├── lib/               # Utilities
│   └── utils.ts
├── styles/
│   └── main.css       # Tailwind CSS entry point
└── manifest.json      # Chrome extension manifest

tests/                 # Vitest test suites
├── unit/
└── integration/
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
Test Files  2 passed (2)
Tests       47 passed (47)
Duration    275ms

✅ ReDoS attack prevention
✅ Complexity limit enforcement  
✅ Adversarial input handling
✅ Wildcard deterministic matching
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
| **Extension Size** | ~ 250 KB |

## 🔐 Security

Security is a core principle of SwitchyMalaccamax. We take security vulnerabilities seriously.

- **Reporting**: See [SECURITY.md](./SECURITY.md) for vulnerability disclosure policy
- **ReDoS Protection**: All regex patterns validated before execution
- **Input Sanitization**: User inputs sanitized and validated
- **Secure Defaults**: Conservative security settings by default

## 📄 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

Inspired by the SwitchyOmega and Proxy SwitchySharp extensions, rebuilt from the ground up with modern security and development practices.

## 📚 Documentation

- [Project Setup](./docs/PROJECT_SETUP_COMPLETE.md)
- [Security Architecture](./SECURITY.md)
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
