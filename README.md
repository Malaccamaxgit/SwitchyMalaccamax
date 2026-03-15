# SwitchyMalaccamax

> **Modern proxy switcher for Chrome** — Intelligent rule-based auto-switching with security-first design.

A complete rewrite of SwitchyOmega built with TypeScript, Vue 3, and Vite. Manage multiple proxy profiles with ReDoS-safe pattern matching and AES-256-GCM credential encryption.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Version](https://img.shields.io/github/package-json/v/Malaccamaxgit/SwitchyMalaccamax?color=blue)](https://github.com/Malaccamaxgit/SwitchyMalaccamax)
[![Tests](https://img.shields.io/github/actions/workflow/status/Malaccamaxgit/SwitchyMalaccamax/ci.yml?label=tests)](https://github.com/Malaccamaxgit/SwitchyMalaccamax/actions)

---

## Features

- **Manual & Auto Switching** — Quick profile switching or rule-based automatic routing
- **5 Profile Types** — Direct, Fixed Server, PAC Script, Auto Switch, System Proxy
- **7 Condition Types** — Wildcards, regex, keywords, host levels, URL patterns, bypass rules, CIDR matching
- **Secure Credential Storage** — AES-256-GCM encryption with PBKDF2 key derivation
- **ReDoS Protection** — All user-supplied regex patterns validated before compilation
- **PAC Export** — Generate standards-compliant `.pac` files for use in browsers or proxy systems
- **Import/Export** — Backup and restore configurations (File System Access API; no `downloads` permission required)

---

## Quick Start

### Installation (Users)

1. Download the latest release from [GitHub Releases](https://github.com/Malaccamaxgit/SwitchyMalaccamax/releases)
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked**
5. Select the `dist/` folder

### Development Setup

```bash
# Clone and install
git clone https://github.com/Malaccamaxgit/SwitchyMalaccamax.git
cd SwitchyMalaccamax
npm install

# Development with hot reload
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

---

## Usage

Click the extension icon in your toolbar to:
- Switch between configured proxy profiles instantly
- Access the options page for detailed configuration

### Auto Switch Conditions

Auto Switch profiles evaluate requests using these matching conditions:

| Type | Description | Example |
|------|-------------|---------|
| **Host Wildcard** | Match hostnames with `*` and `?` | `*.example.com` |
| **Host Regex** | Match hostnames with regex | `^api\.example\.com$` |
| **URL Wildcard** | Match full URLs | `https://*.example.com/*` |
| **URL Regex** | Match full URLs with regex | `^https://.*\.example\.com/.*$` |
| **Keyword** | Simple substring match | `example` |
| **Host Levels** | Match by subdomain depth | Min: 2, Max: 3 |
| **Bypass** | Always use direct connection | `<local>`, `127.0.0.1` |

---

## Security

This extension implements defense-in-depth security:

| Feature | Implementation |
|---------|---------------|
| **ReDoS Prevention** | User regex validated via `safe-regex`; catastrophic backtracking patterns rejected |
| **Credential Encryption** | AES-256-GCM with PBKDF2 (100,000 iterations); per-installation key derivation |
| **Deterministic Matching** | Wildcard matcher uses O(n+m) algorithm; no regex backtracking |
| **Content Security Policy** | Strict CSP blocks inline scripts and external resources |
| **Input Validation** | All patterns validated against complexity limits before use |

See [SECURITY.md](./SECURITY.md) for the full security policy and vulnerability reporting.

---

## Development Commands

```bash
npm run dev          # Development mode with hot reload
npm run build        # Production build → dist/
npm test             # Run test suite (180 tests)
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint
npm run format       # Prettier code formatting
```

---

## Project Structure

```
src/
├── background/           # Service worker (proxy API, message handling)
├── popup/                # Quick switch popup UI
├── options/              # Configuration page
├── components/           # Reusable Vue components
├── core/                 # Business logic
│   ├── schema.ts         # Type definitions
│   ├── conditions.ts     # Condition matching engine
│   ├── pac/              # PAC script generation
│   └── security/         # ReDoS prevention, wildcard matcher
└── utils/                # Crypto, logging, migrations

tests/                    # Vitest test suites (180 tests)
```

---

## Documentation

### Guides
- [Pre-flight Checklist](./docs/guides/PRE_FLIGHT_CHECKLIST.md) — Release readiness checklist
- [Security Automation](./docs/guides/SECURITY_AUTOMATION.md) — Security tooling setup

### Architecture
- [PAC Export Feature](./docs/architecture/PAC_EXPORT_FEATURE.md) — PAC script generation implementation
- [PAC Compiler Fix](./docs/architecture/PAC_COMPILER_FIX.md) — PAC compiler bug fixes
- [PAC Compiler Migration](./docs/architecture/PAC_COMPILER_MIGRATION.md) — PAC system migration
- [PAC Compiler Rewrite](./docs/architecture/PAC_COMPILER_REWRITE.md) — PAC compiler rewrite
- [PAC Output Example](./docs/architecture/PAC_OUTPUT_EXAMPLE.md) — Sample PAC output
- [Profile Editor Fixes](./docs/architecture/PROFILE_EDITOR_FIXES.md) — Profile editor UX fixes

### Development
- [Security Audit Report](./docs/development/SECURITY_AUDIT_REPORT.md) — OWASP audit findings & remediation
- [Security Fixes](./docs/development/SECURITY_FIXES.md) — Security implementation history

### Store Submission
- [Store Permission Statements](./docs/STORE_PERMISSION_STATEMENTS.md) — Chrome Web Store permission justification
- [Store Reviewer Message](./docs/STORE_REVIEWER_MESSAGE.md) — Reviewer notes template

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Language** | TypeScript 5.7 (strict mode) |
| **Framework** | Vue 3 Composition API |
| **Build Tool** | Vite 6 + @crxjs/vite-plugin |
| **Test Runner** | Vitest (180 tests) |
| **CSS** | Tailwind CSS |
| **Crypto** | Web Crypto API (AES-GCM, PBKDF2) |
| **Target** | Chrome Manifest V3 |

---

## License

GNU General Public License v3.0 — see [LICENSE](./LICENSE) for details.

---

**Issues**: [GitHub Issues](https://github.com/Malaccamaxgit/SwitchyMalaccamax/issues)
**Discussions**: [GitHub Discussions](https://github.com/Malaccamaxgit/SwitchyMalaccamax/discussions)
