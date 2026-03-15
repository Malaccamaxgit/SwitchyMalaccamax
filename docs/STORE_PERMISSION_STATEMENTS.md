# Permission Justifications for Chrome Web Store

> **Concise permission statements** — Suitable for Chrome Web Store listing, privacy policy, and reviewer communication.

This document provides concise permission justification text suitable for the Chrome Web Store listing, privacy policy, and developer notes for reviewer communication.

## Short Permission Statements (Store Listing)

| Permission | Justification |
|------------|---------------|
| **proxy** | Required to apply and manage Chrome proxy settings (Direct, fixed proxy servers, and PAC scripts) when the user selects a profile. No network traffic is proxied by the extension unless the user explicitly selects a proxy profile. |
| **storage** | Used to save profiles, rules, and user settings locally. Profiles are encrypted before storage when they contain credentials. |
| **webRequest** | Used for optional request monitoring and to detect proxy application errors/conflicts to provide meaningful diagnostics in the UI. No request modification is performed. |
| **Host permissions (`<all_urls>`)** | Needed so rule matching can evaluate requests for all hosts (used by auto-switch rules and conflict detection). The extension does not transmit or exfiltrate browsing data. |

## Privacy Policy Snippet

> We only collect and store configuration data that you explicitly enter (proxy servers, credentials, and rules). Credentials are encrypted at rest using AES-256-GCM and never transmitted off your device. The extension does not collect or send browsing history or request payloads to external servers.

## Reviewer Note (Developer Response Template)

**Permissions:** `proxy`, `webRequest`, `storage`, `host_permissions: "<all_urls>"`

**Rationale:** The extension manages Chrome proxy settings and provides rule-based auto-switching which requires evaluating URLs/hosts for matches. `webRequest` is used only for monitoring and error capture (no modifications). Exports use the File System Access API and an anchor download fallback; we do not request the `downloads` permission.

**Suggested short description for submission form:**

> SwitchyMalaccamax requires the `proxy` permission to apply user-selected proxy profiles and `webRequest` to detect proxy errors and conflicts. `storage` is used to persist encrypted configurations. Host access is used only for rule evaluation; no browsing data is transmitted.

## Related Documentation

| File | Purpose |
|------|---------|
| [STORE_REVIEWER_MESSAGE.md](./STORE_REVIEWER_MESSAGE.md) | Copy-ready reviewer message |
| [SECURITY.md](../SECURITY.md) | Security overview and vulnerability reporting |
