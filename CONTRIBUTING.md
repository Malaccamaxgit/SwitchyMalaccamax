# Contributing

Thanks for your interest in contributing to SwitchyMalaccamax.

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Git
- Chrome/Chromium 88+
- Basic knowledge of TypeScript and Vue 3

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

## Development

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `test/` - Test updates

### Before Submitting

```bash
npm test              # All tests must pass
npm run typecheck     # No TypeScript errors
npm run lint          # Code must pass linting
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

**IMPORTANT**: All user-supplied regex patterns must be validated:

```typescript
import { validateRegex } from '@/core/security';

const validation = validateRegex(userPattern);
if (!validation.isValid) {
  throw new Error(validation.error);
}
```

Do not create RegExp directly from user input - this creates ReDoS vulnerabilities.

### Vue Components

- Use Composition API with `<script setup>`
- Define prop types with TypeScript interfaces
- Keep components focused and small

## Testing

- Write tests for new features
- Update tests when changing existing code
- Security-critical code needs security tests

Run tests: `npm test`

## Questions?

Open an issue for questions or clarifications.
import { WildcardMatcher } from '@/core/security';

const matcher = new WildcardMatcher(userPattern);
const isMatch = matcher.test(hostname);

// ❌ Bad - Manual regex conversion
const regex = new RegExp(userPattern.replace(/\*/g, '.*'));
```

#### Complexity Limits

Enforce these limits on all user inputs:
- Max pattern length: 200 characters
- Max capture groups: 10
- Max nesting depth: 3
- Execution time: < 50ms (guaranteed)

### Code Style

#### Formatting

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Trailing commas**: Required in multiline
- **Max line length**: 100 characters (soft limit)

Run `npm run format` to auto-format code with Prettier.

#### Naming Conventions

```typescript
// Classes: PascalCase
class ProfileManager {}

// Interfaces/Types: PascalCase
interface Profile {}
type ProfileType = 'direct' | 'fixed';

// Functions/Variables: camelCase
function createProfile() {}
const profileCount = 10;

// Constants: UPPER_SNAKE_CASE
const MAX_PROFILES = 50;

// Files: kebab-case
// profile-manager.ts
// network-monitor.vue
```

#### Component Naming

```typescript
// Single-word components must be prefixed
// ✅ Good
TheHeader.vue
AppSidebar.vue
BaseButton.vue

// ❌ Bad
Header.vue
Sidebar.vue
Button.vue

// Multi-word components: PascalCase
ProfileEditor.vue
NetworkMonitor.vue
```

### File Organization

```typescript
// ✅ Good - Organized imports
// 1. Vue/External libraries
import { ref, computed } from 'vue';
import { Button, Card } from '@/components/ui';

// 2. Internal utilities/types
import type { Profile } from '@/core/schema';
import { validateRegex } from '@/core/security';

// 3. Local imports
import ProfileCard from './ProfileCard.vue';

// ❌ Bad - Random order
import ProfileCard from './ProfileCard.vue';
import { ref } from 'vue';
import type { Profile } from '@/core/schema';
```

## 🧪 Testing Requirements

### Test Coverage

- New features MUST include tests
- Bug fixes MUST include regression tests
- Security features MUST include adversarial tests
- Aim for > 80% code coverage

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

    it('should reject invalid profiles', () => {
      // ...
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

it('should complete in < 50ms', () => {
  const start = performance.now();
  matcher.test(adversarialInput);
  const duration = performance.now() - start;
  
  expect(duration).toBeLessThan(50);
});
```

## 📝 Commit Messages

### Format

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance
- `security`: Security improvements

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

## 🐛 Bug Reports

### Before Submitting

1. Search existing issues
2. Verify it's reproducible
3. Test on latest version
4. Check if it's a Chrome issue

### Bug Report Template

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

**Console Logs**
(if applicable)
```

## ✨ Feature Requests

### Feature Request Template

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

## 🔐 Security Vulnerabilities

**DO NOT open public issues for security vulnerabilities!**

See [SECURITY.md](./SECURITY.md) for responsible disclosure process.

## 📚 Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for public APIs
- Update migration guides for breaking changes
- Include inline comments for complex logic

### JSDoc Example

```typescript
/**
 * Validates a regex pattern for ReDoS vulnerabilities
 * 
 * @param pattern - User-supplied regex pattern string
 * @returns Validation result with isValid flag and optional error
 * @throws Never throws - returns validation object instead
 * 
 * @example
 * ```ts
 * const result = validateRegex('.*example.com');
 * if (result.isValid) {
 *   const regex = new RegExp(result.pattern);
 * }
 * ```
 */
export function validateRegex(pattern: string): ValidationResult {
  // ...
}
```

## 📦 Release Process

1. Version bump in `package.json` and `manifest.json`
2. Update CHANGELOG.md
3. Run full test suite
4. Build and test extension manually
5. Create git tag: `git tag -a v0.1.0 -m "Release v0.1.0"`
6. Push tag: `git push origin v0.1.0`
7. Create GitHub release with notes
8. Submit to Chrome Web Store (maintainers only)

## ❓ Questions?

- **General Questions**: Open a GitHub Discussion
- **Bug Reports**: Open a GitHub Issue
- **Security Issues**: See [SECURITY.md](./SECURITY.md)
- **Pull Requests**: Tag a maintainer for review

## 🙏 Thank You!

Your contributions make SwitchyMalaccamax better for everyone. Thank you for taking the time to contribute!

---

**Last Updated**: January 4, 2026
