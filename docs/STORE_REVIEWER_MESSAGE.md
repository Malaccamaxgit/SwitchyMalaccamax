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
| **storage** | Persist profiles, rules, and settings locally using `chrome.storage.local`. Profiles that contain credentials are encrypted before storage using AES-256-GCM. | Required for durable profile storage and consistent user experience across browser sessions. |
| **webRequest** | Optional monitoring for network errors and to capture `onErrorOccurred` events to provide meaningful diagnostics in the UI (e.g., proxy connection errors). We do not modify network requests. | Allows the extension to detect proxy application problems and surface them to the user. |
| **Host access (`<all_urls>`)** | Auto-switch rules need to evaluate hostnames and full URLs across sites to determine the correct proxy for each request. We only evaluate patterns locally for decision-making. | Required for correct auto-switch behavior. |

## 2. No Downloads Permission

**Exports:** Profile and log exports are implemented using the File System Access API when available, and an anchor-based fallback (`<a download>`). These methods do not require `chrome.downloads` permission. The codebase does not reference `chrome.downloads`.

## 3. Privacy & Security Assurances

- The extension does not transmit browsing history, request payloads, or credentials off the user's device.
- Proxy credentials are encrypted using AES-256-GCM (PBKDF2 for key derivation). See `src/utils/crypto.ts`.
- Regex patterns are validated to prevent ReDoS. See `src/core/security/regexSafe.ts`.

## 4. Files of Interest

| File | Purpose |
|------|---------|
| `docs/STORE_PERMISSION_STATEMENTS.md` | Permission justification (short + long) |
| `docs/STORE_REVIEWER_MESSAGE.md` | Reviewer message (this file) |
| `src/lib/fileSaver.ts` | Export implementation (no downloads permission) |
| `SECURITY.md` | Security overview |

If you need additional information or a limited/temporary test build with narrower host permissions for review, we can provide it on request.

Thank you,
SwitchyMalaccamax Maintainer

## Related Documentation

| File | Purpose |
|------|---------|
| [STORE_PERMISSION_STATEMENTS.md](./STORE_PERMISSION_STATEMENTS.md) | Detailed permission justifications |
| [SECURITY.md](../SECURITY.md) | Security policy and vulnerability reporting |
