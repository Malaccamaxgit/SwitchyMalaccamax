# Contributing to SwitchyMalaccamax

> **Community contributions** — Guidelines for code, documentation, and bug reports.

Thanks for your interest in contributing to SwitchyMalaccamax.

## Getting Started

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 18+ |
| npm | 9+ |
| Git | Latest |
| Chrome/Chromium | 88+ |
| Knowledge | TypeScript, Vue 3 |

### Setup

```bash
# Fork and clone
git clone https://github.com/your-username/SwitchyMalaccamax.git
cd SwitchyMalaccamax

# Install dependencies
npm install

# Start development
npm run dev

# Run tests
npm test

# Build
npm run build
```

## Development Workflow

### Branch Naming

| Prefix | Purpose |
|--------|---------|
| `feature/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation |
| `refactor/` | Code refactoring |
| `test/` | Test updates |

### Before Submitting

```bash
npm test          # All tests must pass
npm run typecheck # No TypeScript errors
npm run lint      # Code must pass linting
```

### Pull Requests

1. Create a branch from `main`
2. Make your changes
3. Add tests if applicable
4. Ensure all checks pass
5. Submit PR with clear description

## Code Standards

### TypeScript

- Use strict mode (enabled by default)
- Avoid `any` types
- Prefer interfaces for object shapes

### Security

**IMPORTANT:** All user-supplied regex patterns must be validated:

```typescript
import { validateRegex } from '@/core/security';

const validation = validateRegex(userPattern);
if (!validation.isValid) {
  throw new Error(validation.error);
}
```

Do not create RegExp directly from user input — this creates ReDoS vulnerabilities.

### Vue Components

- Use Composition API with `<script setup>`
- Define prop types with TypeScript interfaces
- Keep components focused and small

## Testing

| Requirement | Description |
|-------------|-------------|
| New features | Must include tests |
| Bug fixes | Must include regression tests |
| Security code | Must include adversarial tests |
| Coverage | Aim for >80% |

Run tests: `npm test`

### Test Structure

```typescript
import { describe, it, expect } from 'vitest';

describe('ProfileManager', () => {
  describe('createProfile', () => {
    it('should create a valid profile', () => {
      // Arrange
      const data = { name: 'Test', type: 'direct' };

      // Act
      const profile = createProfile(data);

      // Assert
      expect(profile.name).toBe('Test');
    });
  });
});
```

### Security Tests

Security-critical code requires adversarial testing:

```typescript
it('should prevent ReDoS with catastrophic backtracking', () => {
  const maliciousPattern = '(a+)+$';
  const validation = validateRegex(maliciousPattern);

  expect(validation.isValid).toBe(false);
  expect(validation.error).toContain('unsafe');
});
```

## Commit Messages

### Format

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

| Type | Purpose |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting (no code change) |
| `refactor` | Code restructuring |
| `test` | Adding tests |
| `chore` | Maintenance |
| `security` | Security improvements |

### Examples

```
feat(profiles): add PAC script profile type

Implement support for Proxy Auto-Config (PAC) scripts with
URL and inline script options.

Closes #123
```

```
security(regex): add ReDoS prevention for URL patterns

- Validate all regex patterns before compilation
- Enforce complexity limits
- Add adversarial input tests

Fixes CVE-2024-XXXXX
```

## Bug Reports

### Before Submitting

1. Search existing issues
2. Verify it's reproducible
3. Test on latest version
4. Check if it's a Chrome issue

### Template

```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to...
2. Click on...
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- Extension Version: 0.1.0
- Chrome Version: 120.0.0
- OS: Windows 11

**Screenshots**
(if applicable)
```

## Feature Requests

### Template

```markdown
**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches you've thought about

**Additional Context**
Mockups, examples, references
```

## Security Vulnerabilities

**DO NOT open public issues for security vulnerabilities!**

See [SECURITY.md](./SECURITY.md) for responsible disclosure process.

## Documentation

| Requirement | Description |
|-------------|-------------|
| README.md | Update for user-facing changes |
| JSDoc | Add comments for public APIs |
| Migration guides | Update for breaking changes |
| Inline comments | Document complex logic |

### JSDoc Example

```typescript
/**
 * Validates a regex pattern for ReDoS vulnerabilities
 *
 * @param pattern - User-supplied regex pattern string
 * @returns Validation result with isValid flag and optional error
 *
 * @example
 * const result = validateRegex('.*example.com');
 * if (result.isValid) {
 *   const regex = new RegExp(result.pattern);
 * }
 */
export function validateRegex(pattern: string): ValidationResult {
  // ...
}
```

## Release Process

1. Version bump in `package.json` and `manifest.json`
2. Update CHANGELOG.md
3. Run full test suite
4. Build and test extension manually
5. Create git tag: `git tag -a v0.1.0 -m "Release v0.1.0"`
6. Push tag: `git push origin v0.1.0`
7. Create GitHub release with notes
8. Submit to Chrome Web Store (maintainers only)

## Questions

| Type | Where |
|------|-------|
| General Questions | GitHub Discussions |
| Bug Reports | GitHub Issues |
| Security Issues | See SECURITY.md |
| Pull Requests | Tag a maintainer |

## Thank You

Your contributions make SwitchyMalaccamax better for everyone.

---

**Last Updated:** March 2026
