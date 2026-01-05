# SwitchyMalaccamax - Chrome Extension Development Guide

## Project Overview
Modern Chrome Extension (Manifest V3) for intelligent proxy switching with security-first design.

## Technology Stack
- **Language:** TypeScript 5.7+ (strict mode)
- **Build:** Vite 6+ with @crxjs/vite-plugin
- **Testing:** Vitest 2+
- **UI:** Vue 3 (Composition API) + Tailwind CSS
- **Target:** Chrome Extension Manifest V3

## Project Structure
```
src/
├── background/          # Service worker
├── popup/              # Quick switch UI
├── options/            # Configuration page
├── core/               # Proxy logic
│   ├── security/       # ReDoS prevention
│   └── pac/            # PAC generator
└── manifest.json       # Extension manifest

tests/                  # Vitest tests
```

## Development Guidelines
- Use strict TypeScript with no implicit any
- All regex patterns MUST use regexSafe.ts validation
- Implement ReDoS prevention in pattern matching
- Vue 3 Composition API for all components
- Hot module reloading enabled via Vite

## Security Requirements
- Validate all user-supplied regex patterns
- Enforce complexity limits on patterns
- Use deterministic wildcard matching (no regex alternations)
- Test adversarial inputs (< 50ms execution time)
