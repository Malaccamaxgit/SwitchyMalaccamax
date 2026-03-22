# Security Policy

> **Defense-in-depth** — ReDoS prevention, AES-256-GCM encryption, and minimal permissions.

## Reporting a Vulnerability

If you discover a security vulnerability in this extension, please report it responsibly:

1. **GitHub Security Advisories** (preferred): Go to the "Security" tab → "Advisories" → "Report a vulnerability"
2. **Email**: Send details to **benjamin.alloul@gmail.com** with subject `SECURITY: SwitchyMalaccamax`

**Please do not open public GitHub issues for security vulnerabilities.**

### What to Include

| Item | Description |
|------|-------------|
| Description | Vulnerability description |
| Reproduction | Steps to reproduce |
| Affected version | Check `manifest.json` |
| Environment | Chrome/OS version (if relevant) |
| Evidence | Proof of concept code or screenshots |

### Response Expectations

This is a solo-maintained open source project. Security reports are reviewed on a **best-effort basis** as time permits. There are no guaranteed response timelines or SLAs.

## Security Features

### ReDoS (Regular Expression Denial of Service) Prevention

| Measure | Implementation |
|---------|---------------|
| Pattern validation | `safe-regex` heuristic before compilation (reduces risk; not a formal proof) |
| Complexity limits | Max **256** chars, caps on alternations (`\|`) and quantifiers (`*+?{}`) per [`SECURITY_LIMITS`](./src/core/security/constants.ts) |
| Wildcard handling | Deterministic regex without backtracking |
| Execution time | < 50ms (verified in tests) |

**Implementation:** [`src/core/security/regexSafe.ts`](./src/core/security/regexSafe.ts), [`src/core/security/wildcardMatcher.ts`](./src/core/security/wildcardMatcher.ts)

### Credential Encryption

| Measure | Implementation |
|---------|---------------|
| Algorithm | AES-256-GCM |
| Key derivation | PBKDF2 with 100,000 iterations |
| Salt | Per-user random salt (32 bytes) in `chrome.storage.local` |
| IV | Random IV for each encryption operation |

**Threat model:** Credentials are protected against **casual inspection** of extension storage (local obfuscation). A **determined attacker** with access to the machine, a compromised browser profile, or debug APIs may still recover data. This is **not** a substitute for OS-level access control or a password manager.

**Implementation:** [`src/utils/crypto.ts`](./src/utils/crypto.ts)

### Other Measures

| Measure | Description |
|---------|-------------|
| **Content Security Policy** | Strict CSP in manifest prevents inline script execution |
| **Input Sanitization** | All user inputs validated before use |
| **Minimal Permissions** | Required: `proxy`, `storage`. Optional: `<all_urls>` for proxy connection tests only |
| **No eval()** | No dynamic code execution |
| **TypeScript Strict Mode** | Type checking prevents common errors |
| **Permission statements** | See [`docs/STORE_PERMISSION_STATEMENTS.md`](./docs/STORE_PERMISSION_STATEMENTS.md) |

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x | ✅ Yes |
| < 0.1.0 | ❌ No |

## Security Testing

The codebase includes a growing automated test suite, including:

| Test Suite | Purpose |
|------------|---------|
| PAC fuzzing | Security-focused fuzzing for PAC generator |
| ReDoS prevention | Adversarial regex pattern tests |
| Wildcard matcher | Performance and deterministic matching |
| Crypto roundtrip | Encryption/decryption verification |

Run tests: `npm test`

## Dependencies

Dependencies are checked for known vulnerabilities:

| Method | Frequency |
|--------|-----------|
| GitHub Dependabot | Automated alerts enabled |
| `npm audit` | Manual run during development |

**Current status:** 0 known vulnerabilities

## Limitations

| Limitation | Description |
|------------|-------------|
| Chrome Sandbox | Subject to Chrome extension sandbox limitations |
| Storage Limits | Chrome sync storage limited to 100KB |
| Pattern Complexity | Complex regex patterns may be rejected by safety checks |

## Contact

| Issue Type | Contact |
|------------|---------|
| Security Issues | benjamin.alloul@gmail.com |
| General Issues | [GitHub Issues](https://github.com/Malaccamaxgit/SwitchyMalaccamax/issues) |

---

**Last Updated:** March 2026
