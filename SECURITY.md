# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this extension, please report it responsibly:

1. **GitHub Security Advisories** (preferred): Go to the "Security" tab → "Advisories" → "Report a vulnerability"
2. **Email**: Send details to **benjam.alloul@gmail.com** with subject `SECURITY: SwitchyMalaccamax`

**Please do not open public GitHub issues for security vulnerabilities.**

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Affected version (check `manifest.json`)
- Your Chrome/OS version (if relevant)
- Proof of concept code or screenshots (if available)

### Response Expectations

This is a solo-maintained open source project. I will review security reports on a **best-effort basis** as time permits. There are no guaranteed response timelines or SLAs.

## Security Features

This extension includes the following security implementations:

### ReDoS (Regular Expression Denial of Service) Prevention

- All user-supplied regex patterns are validated using the `safe-regex` library before compilation
- Complexity limits enforced: max 200 characters, 10 capture groups, 3 nesting levels
- Wildcard patterns (`*`, `?`) are converted to deterministic regex without backtracking
- Pattern matching execution time is limited to < 50ms (verified in tests)

Implementation: [`src/core/security/regexSafe.ts`](./src/core/security/regexSafe.ts) and [`src/core/security/wildcardMatcher.ts`](./src/core/security/wildcardMatcher.ts)

### Credential Encryption

- Proxy credentials (username/password) are encrypted using AES-256-GCM
- Key derivation uses PBKDF2 with 100,000 iterations
- Per-user random salt (32 bytes) stored in `chrome.storage.local`
- Random IV for each encryption operation

Implementation: [`src/utils/crypto.ts`](./src/utils/crypto.ts)

### Other Measures

- **Content Security Policy**: Strict CSP in manifest prevents inline script execution
- **Input Sanitization**: All user inputs validated before use
- **Minimal Permissions**: Extension requests only `proxy` and `storage` permissions
- **No eval()**: No dynamic code execution
- **TypeScript Strict Mode**: Type checking prevents common errors

## Supported Versions

Security updates are provided for version 0.1.x. Earlier versions are not supported.

## Security Testing

The codebase includes 163 automated tests, including:
- Security-focused fuzzing tests for PAC generator
- ReDoS attack prevention tests
- Wildcard matcher performance tests
- Credential encryption/decryption roundtrip tests

Run tests: `npm test`

## Dependencies

Dependencies are checked for known vulnerabilities:
- Automated: GitHub Dependabot alerts enabled
- Manual: `npm audit` run during development

Current status: 0 known vulnerabilities

## Limitations

- **Chrome Extension Sandbox**: Subject to Chrome's extension sandbox limitations
- **Storage Limits**: Chrome sync storage limited to 100KB
- **Pattern Complexity**: Some valid but highly complex regex patterns may be rejected by safety checks

## Contact

- **Security Issues**: benjam.alloul@gmail.com
- **General Issues**: [GitHub Issues](https://github.com/Malaccamaxgit/SwitchyMalaccamax/issues)

---

**Last Updated**: January 5, 2026
