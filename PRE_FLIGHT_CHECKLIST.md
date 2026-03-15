# Pre-Flight Checklist

> **Release readiness** — Pre-release verification checklist for SwitchyMalaccamax.

## Security

### Secrets
- [ ] No hardcoded API keys, tokens, or passwords
- [ ] No `.env` files committed (patterns in `.gitignore`)
- [ ] No absolute file paths leaked
- [ ] Test fixtures use placeholder data only

### Git History
- [ ] No sensitive files ever committed
- [ ] Clean history verified

### Dependencies
- [ ] `npm audit`: 0 vulnerabilities
- [ ] All packages actively maintained
- [ ] No deprecated dependencies

## Documentation

| File | Status |
|------|--------|
| README.md | Installation, features, development setup |
| SECURITY.md | Vulnerability reporting instructions |
| LICENSE | GPL-3.0 full text included |
| CONTRIBUTING.md | Development guidelines |
| CODE_OF_CONDUCT.md | Community standards |
| CHANGELOG.md | Version history |

## Repository Health

- [ ] GitHub issue templates: Bug report + feature request
- [ ] GitHub Actions: Security audit workflow active
- [ ] Pre-commit hooks: `scripts/pre-commit-security.js` (Husky)
- [ ] Tests: 180 passing

## Summary

**Status:** Ready for public release

All security checks passed:
- 0 secrets or CVEs
- Comprehensive `.gitignore`
- GPL-3.0 legally compliant
- Documentation complete
- CI/CD automation active

## Next Steps

```bash
git add .
git commit -m "chore: pre-flight verification complete"
git push origin main
```

Post-push:
- Verify GitHub Actions pass
- Enable GitHub Security Advisories
- Add repository topics: `chrome-extension`, `proxy`, `typescript`, `vue3`, `security`
