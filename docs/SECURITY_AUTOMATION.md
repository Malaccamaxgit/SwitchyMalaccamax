# Security Automation Setup Guide

This project includes automated security checks to prevent vulnerabilities from being introduced.

## 🔒 Pre-Commit Hook

A Git pre-commit hook automatically runs before each commit to catch security issues early.

### Features:
- **NPM Audit**: Blocks commits if vulnerable dependencies are detected
- **Secret Scanner**: Prevents accidental exposure of API keys, passwords, tokens
- **TypeScript Check**: Ensures type safety on modified files

### Installation:

The pre-commit hook is located at `.git/hooks/pre-commit`. 

**On Unix/Linux/Mac:**
```bash
chmod +x .git/hooks/pre-commit
```

**On Windows:**
The hook will run automatically. If you encounter issues, ensure Git Bash is configured properly.

### Testing the Hook:

```bash
# Try committing a file with a fake secret
echo 'const apiKey = "sk-1234567890abcdefghijklmnopqrstuvwxyz"' > test.js
git add test.js
git commit -m "test"
# Should be blocked by secret scanner

# Clean up
git reset HEAD test.js
rm test.js
```

### Bypassing (Emergency Only):

If you absolutely must bypass security checks (NOT recommended):
```bash
git commit --no-verify -m "emergency commit"
```

## 🤖 GitHub Actions

### Security Audit Workflow

**File**: `.github/workflows/security-audit.yml`

Runs automatically on:
- Every push to `main` or `develop`
- Every pull request
- Weekly schedule (Mondays at 9 AM UTC)

**Checks:**
- NPM audit for vulnerable dependencies
- Secret scanner for exposed credentials
- TypeScript type checking
- Full test suite
- Production build

### Dependency Review Workflow

**File**: `.github/workflows/dependency-review.yml`

Runs on pull requests to review dependency changes:
- Flags vulnerabilities in new dependencies
- Blocks dependencies with problematic licenses (GPL-3.0, AGPL-3.0)
- Posts summary comment on PR

## 🔍 Secret Scanner

**File**: `scripts/secret-scanner.js`

A custom regex-based scanner that detects common secret patterns:

### Detected Patterns:
- **CRITICAL**: AWS keys, RSA/SSH private keys, database connection strings, GitHub tokens
- **HIGH**: API keys, generic secrets/tokens, passwords, base64 auth
- **MEDIUM**: JWT tokens

### Whitelist:
Automatically ignores common false positives:
- Example values (`example.com`, `your-api-key`)
- Test/mock data
- Masked values (`********`, `xxx`)

### Running Manually:

```bash
node scripts/secret-scanner.js
```

### Adding Custom Patterns:

Edit `scripts/secret-scanner.js` and add to `SECRET_PATTERNS`:

```javascript
{
  name: 'My Custom Secret',
  pattern: /my-pattern-here/gi,
  severity: 'HIGH',
  exclude: /test/i, // Optional: skip certain files
}
```

## 📊 Security Scorecard

Current project security status:

| Category | Score | Status |
|----------|-------|--------|
| Broken Access Control | 9/10 | ✅ Secure |
| Code Injection | 9/10 | ✅ Secure |
| Cryptographic Failures | 9/10 | ✅ Secure |
| Vulnerable Components | 10/10 | ✅ Secure |
| Insecure Design | 9/10 | ✅ Secure |
| Content Security Policy | 9/10 | ✅ Secure |
| **Overall** | **9.2/10** | **✅ LOW RISK** |

## 🚨 What To Do When Checks Fail

### NPM Audit Failure:
```bash
# View details
npm audit

# Fix automatically (may include breaking changes)
npm audit fix

# Update specific package
npm update package-name
```

### Secret Scanner Failure:
1. **Never commit real secrets** - Use environment variables
2. Replace with placeholders: `"your-api-key"`, `"example.com"`
3. Use `.env` files (ensure `.env` is in `.gitignore`)
4. Use Chrome extension storage for runtime secrets

### TypeScript Errors:
```bash
# Run type check locally
npm run typecheck

# Fix errors in reported files
# Then commit again
```

## 🔄 Continuous Monitoring

The security automation provides multiple layers of protection:

```
Developer → Pre-commit Hook → GitHub Actions → Dependency Review
  Local      (Immediate)        (CI Pipeline)    (PR Review)
```

**Best Practices:**
- Run `npm audit` regularly (at least weekly)
- Review GitHub Actions results on every PR
- Keep dependencies up to date
- Never bypass security checks without review
- Use environment variables for secrets
- Follow the principle of least privilege

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Chrome Extension Security](https://developer.chrome.com/docs/extensions/mv3/security/)
- [npm audit documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [GitHub Actions Security](https://docs.github.com/en/actions/security-guides)

## 🆘 Support

If you encounter issues with security automation:
1. Check this guide for common solutions
2. Review `SECURITY_AUDIT_REPORT.md` for vulnerability details
3. Open an issue with the security check output
