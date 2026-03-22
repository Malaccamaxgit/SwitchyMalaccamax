# Permission Justifications for Chrome Web Store

> **Concise permission statements** — Suitable for Chrome Web Store listing, privacy policy, and reviewer communication.

This document provides concise permission justification text suitable for the Chrome Web Store listing, privacy policy, and developer notes for reviewer communication.

## Short Permission Statements (Store Listing)

| Permission | Justification |
|------------|---------------|
| **proxy** | Required to apply and manage Chrome proxy settings (Direct, fixed proxy servers, and PAC scripts) when the user selects a profile. No network traffic is proxied by the extension unless the user explicitly selects a proxy profile. |
| **storage** | Used to save profiles, rules, and user settings locally. Profiles are encrypted before storage when they contain credentials. |
| **Optional host access (`<all_urls>`)** | Declared as **optional** (`optional_host_permissions`). Requested only when the user runs **Test connection** on a fixed proxy profile so the options page can perform a `fetch` through the applied proxy. Not required for switching profiles, PAC auto-switch, or normal use. The extension does not transmit browsing data to external servers. |

## Privacy Policy Snippet

> We only collect and store configuration data that you explicitly enter (proxy servers, credentials, and rules). Credentials are encrypted at rest using AES-256-GCM and never transmitted off your device. The extension does not collect or send browsing history or request payloads to external servers. Optional broad site access is only requested for the optional proxy connection test.

## Reviewer Note (Developer Response Template)

**Permissions:** `proxy`, `storage` (required). `optional_host_permissions`: `<all_urls>` (user-granted, for connection test only).

**Rationale:** The extension manages Chrome proxy settings and generates PAC scripts locally for auto-switch. Conflict detection uses `chrome.proxy.settings` (no `webRequest` permission). Exports use the File System Access API and an anchor download fallback; we do not request the `downloads` permission.

**Manifest note:** `update_url` is omitted because Chrome Web Store hosting manages updates.

**Suggested short description for submission form:**

> SwitchyMalaccamax uses `proxy` to apply user-selected profiles and `storage` for encrypted local configuration. Optional site access is requested only when the user runs the fixed-proxy connection test.

## Related Documentation

| File | Purpose |
|------|---------|
| [STORE_REVIEWER_MESSAGE.md](./STORE_REVIEWER_MESSAGE.md) | Copy-ready reviewer message |
| [SECURITY.md](../SECURITY.md) | Security overview and vulnerability reporting |
