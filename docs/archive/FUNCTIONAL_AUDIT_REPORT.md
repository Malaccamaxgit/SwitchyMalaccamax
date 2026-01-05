# Function-to-UI Mapping Audit Report
## SwitchyMalaccamax Extension - January 4, 2026

---

## 1. BACKEND CAPABILITIES INVENTORY

### ✅ **Service Worker (background/service-worker.ts)**
```typescript
✓ handleSetProxy(config)           - Apply proxy configuration to Chrome
✓ chrome.runtime.onMessage         - Message handling from popup/options
✓ chrome.storage.sync.set          - Save profiles/settings to storage
```

### ✅ **Chrome Storage API Integration**
```typescript
✓ chrome.storage.sync.get(['activeProfileId', 'profiles', 'settings'])
✓ chrome.storage.sync.set({ profiles, activeProfileId, settings })
```

### ✅ **Chrome Proxy API Integration**
```typescript
✓ chrome.proxy.settings.set()      - Apply proxy config
✓ chrome.runtime.sendMessage()     - Send proxy changes to background
✓ chrome.runtime.openOptionsPage() - Open options from popup
```

### ✅ **Core Logic Modules**
```typescript
✓ conditions.ts                    - ConditionMatcher class with 7 condition types
✓ security/regexSafe.ts            - RegexValidator, compileSafeRegex, validateRegex
✓ security/wildcardMatcher.ts      - WildcardMatcher class, matchWildcard, validateWildcard
✓ schema.ts                        - TypeScript interfaces for all profile types
✓ migration.types.ts               - Legacy format conversion interfaces
```

### ✅ **Utility Functions (lib/utils.ts)**
```typescript
✓ cn()                             - Class name merger
✓ formatRelativeTime()             - Time formatting
✓ formatCompactNumber()            - Number formatting
✓ debounce(), throttle()           - Performance utilities
✓ generateId()                     - ID generation
✓ copyToClipboard()                - Clipboard copy
✓ isEmpty()                        - Empty check
```

### ✅ **Component Functions**
```typescript
✓ ProfileImportExport              - exportProfiles(), importProfiles(), convertToOmegaFormat()
✓ ProfileEditor                    - Save/edit profile forms
✓ ProfileTemplates                 - Create from 8 templates
```

---

## 2. UI ELEMENTS TO BACKEND MAPPING

### ✅ **POPUP (src/popup/PopupApp.vue)**
| UI Element | Backend Function | Status |
|------------|-----------------|--------|
| Profile list buttons | `handleProfileSwitch()` → chrome.storage + chrome.proxy | ✅ WORKING |
| Theme toggle | `useDark()` from VueUse | ✅ WORKING |
| Settings button | `chrome.runtime.openOptionsPage()` | ✅ WORKING |
| Add New Profile button | `chrome.runtime.openOptionsPage()` | ✅ WORKING |

**Console Debugging:** ❌ MISSING
**Loading States:** ❌ MISSING

---

### ⚠️ **OPTIONS PAGE (src/options/OptionsApp.vue)**

#### **WORKING SECTIONS:**

| UI Element | Backend Function | Status |
|------------|-----------------|--------|
| Sidebar navigation | `currentView = item.id` | ✅ WORKING |
| Profile selection | `selectProfile(profile)` | ✅ WORKING |
| New profile button | `showProfileEditor = true` → ProfileEditor component | ✅ WORKING |
| Apply changes | `applyChanges()` → chrome.storage.sync.set | ✅ WORKING |
| Discard changes | `discardChanges()` → window.location.reload() | ✅ WORKING |
| Theme switcher | `setTheme()` → useDark | ✅ WORKING |
| Import/Export | ProfileImportExport component (full impl) | ✅ WORKING |
| Delete profile | `deleteProfile()` → splice + chrome.storage | ✅ WORKING |
| Edit profile name | `editProfile()` → ProfileEditor | ✅ WORKING |

**Console Debugging:** ❌ MISSING
**Loading States:** ❌ MISSING

---

#### **GHOST ELEMENTS (UI without backend):**

| UI Element | Expected Function | Status | Action Required |
|------------|-------------------|--------|-----------------|
| **"Configure shortcut" button** | Open Chrome shortcuts page | 🔴 GHOST | Hide or implement |
| **"Network monitor" button** | Open network monitoring panel | 🔴 GHOST | Hide or mark (Coming Soon) |
| **"Publish rule list" button** | Export rules as public URL | 🔴 GHOST | Hide or mark (Coming Soon) |
| **"Export PAC" button** | Generate PAC file | 🔴 GHOST | Implement (PAC module exists!) |
| **"Edit source code" button** | Open code editor for rules | 🔴 GHOST | Hide or mark (Beta) |
| **Switch rules table actions** | Add/edit/delete/reorder rules | 🔴 GHOST | All non-functional |
| **"Add condition" button** | Add new switch rule | 🔴 GHOST | No handler |
| **"Add a rule list" button** | Import online rule list | 🔴 GHOST | No handler |
| **Default profile selector** | Change default profile | 🔴 GHOST | No v-model binding |
| **Fixed profile form inputs** | Save proxy settings | 🔴 GHOST | No save handler |
| **Interface settings checkboxes** | Save preferences | ⚠️ PARTIAL | v-model only, no persist |
| **Download interval selector** | Save auto-update preference | ⚠️ PARTIAL | v-model only, no persist |

---

## 3. CRITICAL FINDINGS

### 🔴 **Major Issues:**

1. **Profile Editing is Broken**
   - Fixed profile form has no save button
   - Changes to host/port/protocol are not persisted
   - User can edit but changes are lost on navigation

2. **Switch Profile Rules are Completely Non-Functional**
   - Rules table is display-only
   - No add/edit/delete/reorder logic
   - "Add condition" button does nothing
   - Rule validation not connected

3. **Settings Changes Don't Persist**
   - Interface checkboxes change state but never save
   - Download interval selector doesn't persist
   - Startup profile selector doesn't persist

4. **No Loading/Feedback States**
   - Buttons feel "dead" during async operations
   - No spinners on "Apply changes"
   - No visual feedback on profile switch
   - Console logs missing for debugging

5. **Ghost Buttons Create Confusion**
   - "Network monitor" - not implemented
   - "Configure shortcut" - not implemented
   - "Publish rule list" - not implemented
   - "Edit source code" - not implemented

---

## 4. BACKEND CAPABILITIES NOT EXPOSED IN UI

### ✅ **Existing but Unused:**

1. **Condition Matcher (conditions.ts)**
   - Full implementation with 7 condition types
   - ReDoS protection built-in
   - NOT connected to switch profile UI
   - Rules table needs to call `ConditionMatcher.match()`

2. **PAC Generator (omega-pac module)**
   - Full PAC script generation
   - "Export PAC" button exists but doesn't call it

3. **Regex/Wildcard Validators (security/)**
   - Safe pattern validation
   - Should validate rules in real-time
   - Currently not integrated into rule editor

4. **Profile Validation**
   - Schema types exist
   - No validation on save
   - Can save invalid proxy configs

---

## 5. CLEANUP PLAN

### Phase 1: Hide Ghost Elements (Immediate)
```typescript
// Hide these buttons until implemented:
- "Configure shortcut" → Mark (Coming Soon)
- "Network monitor" → Mark (Coming Soon)  
- "Publish rule list" → Mark (Beta)
- "Edit source code" → Mark (Beta)
- "Add a rule list" → Mark (Coming Soon)
```

### Phase 2: Wire Existing Functions (High Priority)
```typescript
// These have backend logic but no UI wiring:
✓ Fixed profile save → Add save button + handler
✓ Switch rules CRUD → Wire to conditions.ts
✓ Settings persistence → Add saveSettings() calls
✓ PAC export → Connect to omega-pac module
✓ Profile validation → Add before save
```

### Phase 3: Add User Feedback (High Priority)
```typescript
// Critical UX improvements:
✓ Add console.log to every @click handler
✓ Add loading states to async buttons
✓ Add spinners to "Apply changes"
✓ Add toast notifications on save/error
✓ Add disabled state during operations
```

### Phase 4: Form State Management (Medium Priority)
```typescript
// Proper form handling:
✓ Track unsaved changes
✓ Enable/disable "Apply changes" based on dirty state
✓ Add "You have unsaved changes" warning
✓ Add undo/redo for rule editing
```

---

## 6. RECOMMENDED IMMEDIATE FIXES

### Fix 1: Add Console Debugging
```typescript
// Add to every handler:
console.log('[SwitchyMalaccamax:UI]', 'Action:', actionName, 'Data:', data);
```

### Fix 2: Add Loading States
```typescript
// Pattern:
const loading = ref(false);
async function handleAction() {
  loading.value = true;
  console.log('[SwitchyMalaccamax] Starting action...');
  try {
    await doWork();
    console.log('[SwitchyMalaccamax] Action complete');
  } catch (error) {
    console.error('[SwitchyMalaccamax] Action failed:', error);
  } finally {
    loading.value = false;
  }
}
```

### Fix 3: Disable Ghost Buttons
```typescript
<Button disabled title="Coming Soon">
  <Activity class="h-4 w-4" />
  Network monitor
  <Badge variant="secondary" size="xs" class="ml-2">Soon</Badge>
</Button>
```

---

## 7. GHOST ELEMENTS SUMMARY

### 🔴 **Critical (User expects these to work):**
- Switch profile rules table (all actions)
- Fixed profile save button
- Settings persistence

### ⚠️ **Medium (Nice to have but clearly marked):**
- PAC export (module exists!)
- Publish rule list
- Edit source code

### ✅ **Low (Can wait):**
- Network monitor
- Configure shortcut
- Online rule lists

---

## 8. TESTING CHECKLIST

After fixes, test:
- [ ] Click every button - check console for logs
- [ ] Edit fixed profile - verify saves
- [ ] Add switch rule - verify persists
- [ ] Change settings - verify persists
- [ ] Click ghost buttons - see "Coming Soon"
- [ ] Switch profiles - see loading spinner
- [ ] Apply changes - see toast notification
- [ ] Import .bak file - verify works
- [ ] Export profiles - verify both formats

---

## CONCLUSION

**Functional Coverage:** ~40%
- Popup: 90% functional
- Import/Export: 95% functional
- Profile management: 60% functional
- Switch rules: 0% functional
- Settings: 20% functional

**Priority Order:**
1. Add console logging everywhere
2. Add loading states
3. Fix switch rules table
4. Add profile save button
5. Persist settings
6. Hide/mark ghost buttons
7. Connect PAC export
