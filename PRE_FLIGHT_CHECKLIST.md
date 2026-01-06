# Pre-Flight Checklist

Pre-release verification for SwitchyMalaccamax v0.1.3 (January 5, 2026)

## Security

### Secrets
- [x] No hardcoded API keys, tokens, or passwords
- [x] No `.env` files committed (patterns in `.gitignore`)
- [x] No absolute file paths leaked
- [x] Test fixtures use placeholder data only

### Git History
- [x] No sensitive files ever committed
- [x] Clean history verified

### Dependencies
- [x] `npm audit`: 0 vulnerabilities
- [x] All packages actively maintained
- [x] No deprecated dependencies

## Documentation

- [x] README.md: Installation, features, development setup
- [x] SECURITY.md: Vulnerability reporting instructions
- [x] LICENSE: GPL-3.0 full text included
- [x] CONTRIBUTING.md: Development guidelines
- [x] CODE_OF_CONDUCT.md: Community standards
- [x] CHANGELOG.md: Version history

## Repository Health

- [x] GitHub issue templates: Bug report + feature request
- [x] GitHub Actions: Security audit workflow active
- [x] Pre-commit hooks: `scripts/pre-commit-security.js` (Husky v9)
- [x] Tests: 163 passing (2 skipped intentional)

## Summary

**Status**: Ready for public release

All security checks passed:
- 0 secrets or CVEs
- 87-line `.gitignore` comprehensive
- GPL-3.0 legally compliant
- Documentation complete
- CI/CD automation active

## Next Steps

```bash
git add .
git commit -m "docs: pre-flight verification complete"
git push origin main
```

Post-push:
- Verify GitHub Actions pass
- Enable GitHub Security Advisories
- Add repository topics: `chrome-extension`, `proxy`, `typescript`, `vue3`, `security`
