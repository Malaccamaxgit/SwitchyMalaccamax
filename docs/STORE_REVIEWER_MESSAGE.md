# Chrome Web Store Reviewer Message

> **Copy-ready submission note** — Paste into Chrome Web Store "Notes for reviewer" field or developer response.

This file is a copy-ready message you can paste in the Chrome Web Store "Notes for reviewer" or in the developer response when a reviewer asks about permissions.

---

Dear Chrome Web Store Reviewer,

Thank you for reviewing SwitchyMalaccamax. Below is a concise explanation of the permissions requested and how they are used:

## 1. Permissions Requested

| Permission | Usage | Reason |
|------------|-------|--------|
| **proxy** | Applies user-selected proxy configurations (Direct, Fixed servers, or PAC scripts) via `chrome.proxy.settings.set` when the user explicitly selects or tests a profile. | Required to manage Chrome's proxy state on behalf of the user. |
| **storage** | Persist profiles, rules, and settings using `chrome.storage.local` / `sync`. Profiles that contain credentials are encrypted before storage using AES-256-GCM. | Required for durable configuration across sessions. |
| **Optional `<all_urls>`** | Declared under `optional_host_permissions`. We call `chrome.permissions.request({ origins: ['<all_urls>'] })` only when the user clicks **Test connection** on a fixed proxy profile, so the options page can `fetch` a test URL while the proxy is applied. | Not required for profile switching, PAC auto-switch, or import/export. Users can deny it and use the rest of the extension. |

## 2. Not Used

- **`webRequest`:** Removed. We do not observe or modify web requests. Conflict and control state come from `chrome.proxy.settings.get` / `onChange`.
- **`update_url`:** Omitted from the manifest; the Chrome Web Store manages updates for store-hosted builds.

## 3. No Downloads Permission

**Exports:** Profile and log exports use the File System Access API when available, and an anchor-based fallback (`<a download>`). The codebase does not use `chrome.downloads`.

## 4. Privacy & Security Assurances

- The extension does not transmit browsing history, request payloads, or credentials off the user's device.
- Proxy credentials are encrypted using AES-256-GCM (PBKDF2 for key derivation). See `src/utils/crypto.ts`.
- Regex patterns are validated to reduce ReDoS risk. See `src/core/security/regexSafe.ts`.

## 5. Files of Interest

| File | Purpose |
|------|---------|
| `docs/STORE_PERMISSION_STATEMENTS.md` | Permission justification (short + long) |
| `src/lib/optionalHostPermission.ts` | Optional `<all_urls>` request (connection test only) |
| `src/lib/fileSaver.ts` | Export implementation (no downloads permission) |
| `tests/manifest/store-compliance.spec.ts` | Automated manifest checks for store policy |
| `SECURITY.md` | Security overview |

If you need additional information or a walkthrough video, we can provide it on request.

Thank you,  
SwitchyMalaccamax Maintainer

## Related Documentation

| File | Purpose |
|------|---------|
| [STORE_PERMISSION_STATEMENTS.md](./STORE_PERMISSION_STATEMENTS.md) | Detailed permission justifications |
| [SECURITY.md](../SECURITY.md) | Security policy and vulnerability reporting |
