# Security Policy

## 🔐 Security Philosophy

SwitchyMalaccamax is built with security as a core principle. We take all security vulnerabilities seriously and strive to address them promptly.

## 🛡️ Security Features

### ReDoS (Regular Expression Denial of Service) Protection

Our extension implements comprehensive protection against ReDoS attacks:

1. **Input Validation** (`src/core/security/regexSafe.ts`)
   - All user-supplied regex patterns are validated before compilation
   - Patterns are checked against known dangerous patterns using the `safe-regex` library
   - Complexity limits enforced: max 200 chars, 10 capture groups, 3 nesting levels

2. **Deterministic Wildcard Matching** (`src/core/security/wildcardMatcher.ts`)
   - Wildcard patterns (`*`, `**`, `?`) converted to safe, non-backtracking regex
   - Uses possessive quantifiers to guarantee linear time complexity O(n)
   - No exponential backtracking possible

3. **Execution Time Guarantees**
   - All pattern matches complete in < 50ms (verified in automated tests)
   - Timeout protection on all user-provided patterns
   - Safe fallback behavior when patterns fail validation

4. **Test Coverage**
   - 47+ security-focused tests
   - Adversarial input testing with known attack patterns
   - Continuous validation of performance guarantees

### Additional Security Measures

- **Manifest V3**: Uses latest Chrome extension security model
- **Minimal Permissions**: Requests only necessary permissions
- **Content Security Policy**: Strict CSP to prevent XSS attacks
- **Input Sanitization**: All user inputs validated and sanitized
- **No eval()**: No dynamic code execution
- **TypeScript Strict Mode**: Type safety to prevent common errors

## 🚨 Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1.0 | :x:                |

## 📝 Reporting a Vulnerability

We appreciate responsible disclosure of security vulnerabilities.

### Where to Report

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, please report security issues via:

1. **GitHub Security Advisories** (preferred): Navigate to the "Security" tab and click "Report a vulnerability"
2. **Email**: Send details to [benjamin.alloul@gmail.com] with subject line "SECURITY: SwitchyMalaccamax Vulnerability"

### What to Include

Please provide the following information:

- **Description**: Clear description of the vulnerability
- **Impact**: Potential impact if exploited
- **Reproduction**: Step-by-step instructions to reproduce
- **Version**: Extension version affected (check `manifest.json`)
- **Environment**: Chrome version and OS
- **Proof of Concept**: If possible, include PoC code or screenshots
- **Suggested Fix**: If you have one

### Response Timeline

- **Acknowledgment**: Within 48 hours of report
- **Initial Assessment**: Within 5 business days
- **Status Update**: Every 7 days until resolution
- **Fix Timeline**: Critical issues within 14 days, others within 30 days

### Disclosure Policy

- We follow **coordinated disclosure**
- Security advisories published after fix is released
- Reporter credited unless anonymity requested
- We request 90 days before public disclosure to allow patching

## 🏆 Security Acknowledgments

We thank the following researchers for responsible disclosure:

*(No vulnerabilities reported yet)*

## 🔍 Security Best Practices for Users

1. **Download from Official Sources**: Only install from Chrome Web Store or official GitHub releases
2. **Review Permissions**: Check requested permissions before installation
3. **Keep Updated**: Enable automatic updates in Chrome
4. **Report Suspicious Behavior**: Contact us immediately if you notice unusual activity
5. **Verify Signatures**: Check git commit signatures for authenticity

## 🔧 Security Audit Checklist

For security auditors, please review:

- [ ] `src/core/security/regexSafe.ts` - ReDoS prevention logic
- [ ] `src/core/security/wildcardMatcher.ts` - Deterministic matching
- [ ] `src/core/conditions.ts` - Pattern matching implementation
- [ ] `tests/security/` - Security test coverage
- [ ] `src/manifest.json` - Permissions and CSP
- [ ] `src/background/service-worker.ts` - Background script security

## 📚 Security Documentation

- [Security Audit Report](./docs/development/SECURITY_AUDIT_REPORT.md)
- [Security Automation](./docs/guides/SECURITY_AUTOMATION.md)
- [Architecture Overview](./README.md#security)

## 🔒 Cryptographic Verification

### Verifying Releases

All releases are signed with GPG. To verify:

```bash
# Import signing key
gpg --keyserver keys.openpgp.org --recv-keys 598EBCC2F7CAD3BA

# Verify release
gpg --verify switchymalaccamax-v0.1.0.zip.sig switchymalaccamax-v0.1.0.zip
```

### Checksums

SHA256 checksums provided with each release in `SHA256SUMS.txt`

```bash
sha256sum -c SHA256SUMS.txt
```

## 🛠️ Security Development Guidelines

For contributors:

1. **Never bypass security checks**: Don't disable regex validation
2. **Test security**: Add tests for any pattern matching code
3. **Use TypeScript strict**: Enable all type safety checks
4. **Review dependencies**: Check `npm audit` before PR
5. **Document risks**: Note security implications in code comments

## ⚠️ Known Limitations

- **Browser Extension Sandbox**: Subject to Chrome's extension sandbox limitations
- **WebRequest API**: Network monitoring requires `webRequest` permission
- **Storage Limits**: Chrome sync storage limited to 100KB
- **Regex Validation**: Some valid patterns may be rejected if too complex

## 📞 Contact

- **Security Email**: Benjamin.alloul@gmail.com
- **GitHub Security**: Use "Security" tab above
- **PGP Key**: Available on keyservers (Key ID: 598EBCC2F7CAD3BA)

---

**Last Updated**: January 4, 2026

Thank you for helping keep SwitchyMalaccamax secure! 🙏
