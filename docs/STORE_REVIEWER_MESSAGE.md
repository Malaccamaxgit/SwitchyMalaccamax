# Reviewer Message — Chrome Web Store Submission

This file is a copy-ready message you can paste in the Chrome Web Store "Notes for reviewer" or in the developer response when a reviewer asks about permissions.

---

Dear Chrome Web Store Reviewer,

Thank you for reviewing SwitchyMalaccamax. Below is a concise explanation of the permissions requested and how they are used:

1. Permissions requested
- proxy
  - Usage: The extension applies user-selected proxy configurations (Direct, Fixed servers, or PAC scripts) via `chrome.proxy.settings.set` when the user explicitly selects or tests a profile.
  - Reason: Required to manage Chrome's proxy state on behalf of the user.

- storage
  - Usage: Persist profiles, rules, and settings locally using `chrome.storage.local`. Profiles that contain credentials are encrypted before storage using AES-256-GCM.
  - Reason: Required for durable profile storage and to provide a consistent user experience across browser sessions.

- webRequest
  - Usage: Optional monitoring for network errors and to capture `onErrorOccurred` events to provide meaningful diagnostics in the UI (e.g., proxy connection errors). We do not modify network requests.
  - Reason: Allows the extension to detect proxy application problems and surface them to the user.

- Host access (`<all_urls>`)
  - Usage: Auto-switch rules need to evaluate hostnames and full URLs across sites to determine the correct proxy for each request. We only evaluate patterns locally for decision-making.
  - Reason: Required for correct auto-switch behavior.

2. No downloads permission
- Exports: Profile and log exports are implemented using the File System Access API when available, and an anchor-based fallback (`<a download>`). These methods do not require `chrome.downloads` permission. The codebase does not reference `chrome.downloads`.

3. Privacy & security assurances
- The extension does not transmit browsing history, request payloads, or credentials off the user’s device.
- Proxy credentials are encrypted using AES-256-GCM (PBKDF2 for key derivation). See `src/utils/crypto.ts`.
- Regex patterns are validated to prevent ReDoS; see `src/core/security/regexSafe.ts`.

4. Files of interest
- Permission justification (short + long): `docs/STORE_PERMISSION_STATEMENTS.md` and `docs/STORE_PERMISSION_COPY.md`
- Reviewer message (this file): `docs/STORE_REVIEWER_MESSAGE.md`
- Export implementation (no downloads permission): `src/lib/fileSaver.ts`
- Security overview: `SECURITY.md`

If you need additional information or a limited/temporary test build with narrower host permissions for review, we can provide it on request.

Thank you,
SwitchyMalaccamax Maintainer
