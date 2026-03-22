# Privacy Policy

> **No data collection** — All data stored locally, encrypted, never transmitted.

**Last Updated:** March 2026

## Data Collection

SwitchyMalaccamax **does not collect, transmit, or share any user data**.

## Data Storage

All extension data is stored **locally on your device** using Chrome's storage API:

| Data Type | Storage | Encryption |
|-----------|---------|------------|
| Proxy configurations | `chrome.storage.local` | AES-256-GCM for credentials |
| User preferences | `chrome.storage.local` | None |
| Application logs | `chrome.storage.local` | None |

**Encrypted Data:** Proxy credentials (username/password) are encrypted using AES-256-GCM before storage.

## Data Transmission

This extension **does not**:

- Send data to external servers
- Use analytics or tracking services
- Contact third-party APIs
- Include advertisements
- Collect telemetry

## Permissions Used

| Permission | Purpose |
|------------|---------|
| `proxy` | Manage Chrome's proxy settings (core functionality) |
| `storage` | Save configurations locally |
| Optional `<all_urls>` (site access) | Offered when you use **Test connection** on a fixed proxy so the options page can reach your test URL through the proxy. Auto-switch uses PAC inside Chrome; you can keep this permission off if you do not run that test. |

## Third-Party Services

None. All code runs locally within the extension.

## Chrome Sync

If you enable Chrome Sync, your settings may sync across your Chrome browsers via Google's sync service. This is controlled by your Chrome settings, not by this extension.

## Open Source

SwitchyMalaccamax is open source. Review the source code at:
https://github.com/Malaccamaxgit/SwitchyMalaccamax

## Changes to This Policy

Updates will be posted to this page with a new "Last Updated" date.

## Contact

For privacy concerns: benjamin.alloul@gmail.com
