# FILE READING RULES
1. **ALWAYS READ THE FULL FILE**: When a user references a file, you must read the ENTIRE content in one go.
2. **NEVER** use `startLine: 1` and `endLine: 100`.
3. **NEVER** say "Let me continue reading".
4. If you need to search a file, use the `read_file` tool with `startLine: 1` and `endLine: 20000` immediately.
5. You have a 128k context window. Do NOT conserve space.

# SwitchyMalaccamax AI Coding Instructions

## Project Overview
Browser extension for managing proxy profiles with PAC script generation, migration from SwitchyOmega, and comprehensive profile/condition management. Built with Vue 3, TypeScript, Vite, and manifest v3.

## Architecture & Key Components

### Core Structure
- **Background Service**: [`src/background/service-worker.ts`](../src/background/service-worker.ts) - Extension lifecycle, storage management
- **Popup UI**: [`src/popup/PopupApp.vue`](../src/popup/PopupApp.vue) - Profile switching interface
- **Options UI**: [`src/options/OptionsApp.vue`](../src/options/OptionsApp.vue) - Profile/condition configuration
- **PAC Compiler**: [`src/core/pac/`](../src/core/pac/) - Critical: Generates executable PAC scripts from profiles/conditions
- **Migration System**: [`src/utils/migration.ts`](../src/utils/migration.ts) + [`src/core/migration.types.ts`](../src/core/migration.types.ts) - SwitchyOmega import functionality

### Data Flow
1. User configures profiles/conditions in Options UI
2. Data stored in `chrome.storage.local` via service worker
3. PAC compiler transforms profile data → executable PAC script
4. Chrome proxy API receives PAC script for request routing
5. Popup UI reflects active profile state

### Component Communication
**Popup ↔ Service Worker**:
- Popup sends `chrome.runtime.sendMessage({ action: 'setProxy', config, profileColor })` to apply profile
- Service worker validates message, applies proxy via `chrome.proxy.settings.set()`, updates icon
- Message validation: Checks sender ID, rate limits, validates config structure

**Options UI ↔ Storage**:
- Direct access to `chrome.storage.local` (profiles) and `chrome.storage.sync` (settings, activeProfileId)
- Options saves profiles → Service worker picks up via `chrome.storage.onChanged` listener
- Profiles encrypted with AES-256-GCM before storage (see `src/utils/crypto.ts`)

**Service Worker ↔ Chrome Proxy API**:
- Service worker monitors `chrome.proxy.settings.onChange` for conflicts
- Displays badge (`!` or `?`) if another extension takes control
- Conflict detection runs on startup, profile switch, and every 30 seconds

### Schema & Validation
- **Source of truth**: [`src/core/schema.ts`](../src/core/schema.ts) - Zod schemas for all data structures
- **Conditions**: [`src/core/conditions.ts`](../src/core/conditions.ts) - URL matching logic (host, domain, wildcard patterns)
- Always validate against Zod schemas before storage operations

## Development Workflows

### Build & Test Commands
```bash
npm run dev        # Vite dev mode - builds to dist/ with watch
npm run build      # Production build with minification
npm test           # Vitest unit tests
npm run lint       # ESLint + auto-fix
npm run format     # Prettier formatting
```

### Testing the Extension
1. Run `npm run build` (dev mode doesn't work reliably with extensions)
2. Load `dist/` folder in Chrome via `chrome://extensions` (Developer Mode)
3. Changes require rebuild + extension reload

### Key Test Files
- [`tests/core/pac-compiler.spec.ts`](../tests/core/pac-compiler.spec.ts) - PAC generation logic
- [`tests/core/conditions.spec.ts`](../tests/core/conditions.spec.ts) - URL matching patterns
- [`tests/security/`](../tests/security/) - Regex safety, fuzzing, input validation

### Testing Patterns
**Profile Selection Verification**:
- **Always verify** that selecting a profile actually applies the correct proxy configuration
- Test flow: Select profile → Check `chrome.proxy.settings.get()` → Verify mode, host, port
- Example: Selecting "Example" should result in `mode: 'fixed_servers'` with correct proxy server
- Test both immediate application AND persistence after browser restart

## Project-Specific Conventions

### TypeScript & Imports
- Use Zod schemas from `schema.ts` for all data validation
- Import Logger: `import { Logger } from '@/utils/Logger'` (not console.log)
- Path alias `@/` maps to `src/` directory
- Strict null checks enabled - handle undefined cases explicitly

### Vue Component Patterns
- Composition API with `<script setup>` syntax
- Props validated with Zod schemas via `defineProps<{ ... }>()`
- Emit events explicitly with `defineEmits<{ ... }>()`
- State management: No Vuex/Pinia - use local state + chrome.storage

### Logging Standards
```typescript
import { Logger } from '@/utils/Logger';
const logger = Logger.getInstance();

// In production: only errors logged
logger.debug('Development info');  // Not in prod
logger.error('Always logged', { context });
```

### Security Requirements
- **No eval() or Function() constructors** - blocked by CSP
- Validate all external imports (SwitchyOmega data) against schemas
- Use `safe-regex2` for user-provided regex patterns
- Run `npm run security:scan` before commits (git hooks enabled)

## Critical Implementation Notes

### PAC Compiler Rewrite (Completed)
- Old compiler used template strings - **do not revert to that approach**
- Current implementation: AST-based generation in [`src/core/pac/pac-generator.ts`](../src/core/pac/pac-generator.ts)
- Produces pure functions without eval - see [`docs/architecture/PAC_COMPILER_REWRITE.md`](../docs/architecture/PAC_COMPILER_REWRITE.md)

### Migration System (Active Feature)
- Import format: SwitchyOmega JSON exports
- Entry point: `migration.ts` → schemas in `migration.types.ts`
- UI states documented in [`docs/architecture/migration-ui-states.md`](../docs/architecture/migration-ui-states.md)
- Always validate imports with `MigrationResultSchema` before applying

### Condition Matching Logic
- **Host**: Exact match (e.g., `example.com` ≠ `www.example.com`)
- **Domain**: Matches domain + all subdomains (e.g., `example.com` matches `www.example.com`)
- **URL Wildcard**: `*` for wildcards, handled in `conditions.ts`
- See tests for edge cases with ports, paths, protocols

### Build Configuration
- **Vite**: Uses `vite.config.ts` - Chrome extension plugin auto-generates manifest
- **Output**: `dist/` directory structure matches extension requirements
- **Static assets**: `public/` copied as-is, `src/manifest.json` processed by plugin

## Common Pitfalls
1. **Don't modify schema types manually** - regenerate from Zod schemas using type inference
2. **PAC script errors break all proxying** - validate PAC output thoroughly
3. **Chrome storage quota is 10MB** - keep profiles/conditions optimized
4. **Service worker lifecycle** - storage reads must complete before worker suspends
5. **Manifest v3 restrictions** - no remote code execution, strict CSP

## Edge Cases & Known Issues

### Profile Selection Not Taking Effect
**Symptom**: User selects profile but proxy settings don't change
**Causes**:
- Another extension with higher priority is controlling proxy (check `levelOfControl`)
- System policy blocking proxy changes (enterprise/managed Chrome)
- Service worker suspended before `chrome.proxy.settings.set()` completed
**Detection**: Service worker shows red `!` badge when conflict detected
**Fix**: Call `checkProxyConflicts()` after profile switch; display conflict warning in popup

### Auto Switch Profile UI Restrictions
**Critical**: Auto Switch Profile (SwitchProfile type) should NOT show bypass list editor
- Bypass lists only apply to FixedProfile (single proxy server)
- SwitchProfile uses rule-based routing - bypass handled per-rule target profile
- UI must conditionally hide bypass section: `v-if="selectedProfile.profileType === 'FixedProfile'"`
- Violating this causes user confusion (edited bypass list has no effect)

### Built-in Profiles (Direct & System Proxy)
**Direct** and **System Proxy** are permanent built-in profiles:
- They have `isBuiltIn: true` flag and cannot be deleted
- Only the **color tag** and **showInPopup** are editable
- Profile Type dropdown is hidden for built-in profiles
- Users cannot create additional Direct or System Proxy profiles
- Direct = bypass all proxies (`mode: 'direct'`)
- System Proxy = use OS proxy settings (`mode: 'system'`)

### Profile Visibility in Popup
- Each profile has `showInPopup?: boolean` (default: true)
- Hidden profiles still function (can be referenced in Auto Switch rules)
- Hidden profiles don't appear in the quick-switch popup menu
- Useful for users with many profiles who only use a few frequently

### Test Connection Feature
**ProfileEditor**: Test Connection button verifies proxy reachability
- **Customizable test target**: User can specify test URL/IP (optional)
- **HTTP/HTTPS proxies**: Default tests `https://www.google.com/generate_204`
  - User can provide custom URL (e.g., internal server)
  - Example: `https://internal.company.com/health`
- **SOCKS4/SOCKS5 proxies**: Default tests `8.8.8.8` (Google DNS)
  - User can provide custom IP address
  - Example: `192.168.1.1` or `10.0.0.1`
- **Placeholder updates dynamically** based on selected proxy type
- **Temporary proxy application**: Applies test config, runs test, restores original
- **10-second timeout** with AbortController
- **Results**:
  - ✓ "Connected successfully" (HTTP 204 or network success)
  - ⚠️ "Proxy authentication required" (HTTP 407)
  - ✗ "Connection timeout" (10+ seconds)
  - ✗ "Connection failed" (network error)
- **Note**: Authentication not tested directly (Chrome handles auth dialogs separately)

### Authentication Field Behavior by Proxy Type
**SOCKS4**:
- Shows **username field only** (SOCKS4 protocol limitation)
- Password field hidden with explanatory note
- Hint text: "SOCKS4: Username only"
- Blue info box: "SOCKS4 only supports username authentication. Password field not available."

**HTTP/HTTPS/SOCKS5**:
- Shows **both username and password fields**
- Password field labeled "Password / API Token" for clarity
- Hint text: "Username and password or API token"
- Amber info box: Explains commercial proxy services accept API tokens in password field

### Commercial Proxy Services (API Token Authentication)
Most commercial proxy providers (Bright Data, ScraperAPI, Oxylabs, SmartProxy, etc.) use
Basic Auth where the API token is passed in the password field:
- **Username**: Service-specific identifier (e.g., "lum-customer-XXX-zone-YYY")
- **Password / API Token**: Your API key or token from the provider
- Works automatically with Chrome's proxy authentication - no special permissions needed
- Example: Bright Data uses `username:API_TOKEN@proxy.lum-superproxy.io:22225`

- **Schema Changes**: Update Zod schemas → rebuild all dependent types
- **Migration**: Ensure backward compatibility with old SwitchyOmega exports
- **UI Components**: Test in both popup (compact) and options (full-page) contexts
