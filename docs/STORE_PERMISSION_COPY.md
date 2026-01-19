# Chrome Web Store Permission Copy (Copy-ready)

Use the following short statements in the Chrome Web Store “Why your extension needs permission” fields.

- proxy — Required to apply user-selected proxy profiles (Direct, Fixed servers, and PAC scripts). The extension will only change proxy settings when you explicitly select a profile.

- storage — Used to persist your profiles, rules, and settings locally. Credentials are encrypted at rest with AES-256-GCM and never transmitted.

- webRequest — Used for optional monitoring and to detect proxy errors and conflicts so the UI can provide actionable diagnostics. No request modification or data exfiltration is performed.

- Host access (`<all_urls>`) — Required so auto-switch rules can evaluate hosts and URLs across sites. The extension does not collect or transmit browsing data.

Export behavior note (reviewer-friendly): Exports use the File System Access API (when available) and fall back to a user-initiated browser download; the extension does not request `downloads` permission.

---

Suggested short justification (single line, for compact fields):
"Requires `proxy` to apply user-selected proxy profiles; `webRequest` for optional error detection; `storage` to save encrypted profiles. Host access is used only for rule evaluation; no browsing data is transmitted."