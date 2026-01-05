# SwitchyMalaccamax UI Redesign Specification
**Date**: January 3, 2026  
**Version**: 2.0  
**Status**: Design Phase

---

## 🎯 Executive Summary

Transform the bare-bones UI into a **security-focused, developer-friendly dashboard** that combines the power of ZeroOmega with 2026 design standards.

**Key Principles**:
- � **Dynamic Switching**: Automatic rule-based or manual proxy switching
- 🌙 **Dark Mode Native**: Developers work in low-light environments
- ⚡ **Speed**: <3 clicks to switch profiles or add rules
- ♿ **Accessible**: WCAG 2.1 AA compliance, keyboard-first
- 🎨 **Modern**: Glass morphism, micro-interactions, smooth transitions

---

## 📊 Current State Audit

### Popup (320px × auto)
**Functional Elements**:
- ✅ Profile list (2 profiles: Direct, System)
- ✅ Active profile indicator (bg-blue-100)
- ✅ "Configure Proxies" button
- ❌ No security status
- ❌ No quick actions
- ❌ No profile search
- ❌ No visual feedback on switch

**Issues**:
- Generic blue color scheme
- No connection status indicator
- No quick bypass toggle for current site
- Requires opening options for any configuration

### Options Page (Full screen)
**Functional Elements**:
- ✅ Profile list display
- ✅ "Add Profile" button
- ✅ Version info
- ❌ No condition editor
- ❌ No import/export
- ❌ No profile search/filter
- ❌ No auto-switch rules UI

**Issues**:
- Single-page layout (no navigation)
- No profile editing capabilities
- No way to view/edit conditions
- Alert() for "coming soon" (unprofessional)

---

## 🎨 "Hardened" Design System

### Color Palette

#### Light Mode
```css
--bg-primary: #FFFFFF       /* Pure white */
--bg-secondary: #F8FAFC     /* Slate-50 */
--bg-tertiary: #F1F5F9      /* Slate-100 */
--text-primary: #0F172A     /* Slate-900 */
--text-secondary: #475569   /* Slate-600 */
--text-tertiary: #94A3B8    /* Slate-400 */

/* Connection States */
--status-active: #10B981       /* Green-500 - Proxy active */
--status-active-bg: #D1FAE5    /* Green-100 */
--status-auto: #3B82F6         /* Blue-500 - Auto-switch */
--status-auto-bg: #DBEAFE      /* Blue-100 */
--status-direct: #6B7280       /* Gray-500 - Direct connection */
--status-direct-bg: #F3F4F6    /* Gray-100 */
--status-error: #EF4444        /* Red-500 - Connection failed */
--status-error-bg: #FEE2E2     /* Red-100 */

/* Accents */
--accent-primary: #3B82F6    /* Blue-500 */
--accent-secondary: #8B5CF6  /* Violet-500 */
--border: #E2E8F0            /* Slate-200 */
--shadow: rgba(15, 23, 42, 0.1)
```

#### Dark Mode
```css
--bg-primary: #0F172A       /* Slate-900 */
--bg-secondary: #1E293B     /* Slate-800 */
--bg-tertiary: #334155      /* Slate-700 */
--text-primary: #F1F5F9     /* Slate-100 */
--text-secondary: #CBD5E1   /* Slate-300 */
--text-tertiary: #64748B    /* Slate-500 */

/* Connection States (adjusted for dark) */
--status-active: #34D399       /* Green-400 */
--status-active-bg: #064E3B    /* Green-900 */
--status-auto: #60A5FA         /* Blue-400 */
--status-auto-bg: #1E3A8A      /* Blue-900 */
--status-direct: #9CA3AF       /* Gray-400 */
--status-direct-bg: #374151    /* Gray-800 */
--status-error: #F87171        /* Red-400 */
--status-error-bg: #7F1D1D     /* Red-900 */

/* Accents */
--accent-primary: #60A5FA    /* Blue-400 */
--accent-secondary: #A78BFA  /* Violet-400 */
--border: #334155            /* Slate-700 */
--shadow: rgba(0, 0, 0, 0.3)
```

### Typography
```css
--font-display: 'Inter', system-ui, sans-serif
--font-mono: 'JetBrains Mono', 'Fira Code', monospace

/* Scale */
--text-xs: 0.75rem   /* 12px */
--text-sm: 0.875rem  /* 14px */
--text-base: 1rem    /* 16px */
--text-lg: 1.125rem  /* 18px */
--text-xl: 1.25rem   /* 20px */
--text-2xl: 1.5rem   /* 24px */
--text-3xl: 1.875rem /* 30px */
```

### Spacing
```css
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
--space-12: 3rem     /* 48px */
```

### Border Radius
```css
--radius-sm: 0.375rem  /* 6px */
--radius-md: 0.5rem    /* 8px */
--radius-lg: 0.75rem   /* 12px */
--radius-xl: 1rem      /* 16px */
--radius-full: 9999px  /* Pill shape */
```

### Shadows
```css
--shadow-sm: 0 1px 2px 0 var(--shadow)
--shadow-md: 0 4px 6px -1px var(--shadow)
--shadow-lg: 0 10px 15px -3px var(--shadow)
--shadow-xl: 0 20px 25px -5px var(--shadow)
--shadow-inner: inset 0 2px 4px 0 var(--shadow)
```

---

## 🧩 Component Architecture

### Tech Stack Clarification
**Current Stack**: Vue 3 + TypeScript + Tailwind CSS  
**Component Library**: **Radix Vue** (Vue port of Radix UI primitives)  
> Note: Shadcn is React-only. We'll use Radix Vue for accessible headless components.

### Component Hierarchy

```
src/components/
├── ui/                          # Primitive components (Radix Vue + Tailwind)
│   ├── Button.vue
│   ├── Card.vue
│   ├── Badge.vue
│   ├── Switch.vue
│   ├── Dialog.vue
│   ├── DropdownMenu.vue
│   ├── Tabs.vue
│   ├── Input.vue
│   ├── Select.vue
│   ├── Checkbox.vue
│   ├── RadioGroup.vue
│   ├── Tooltip.vue
│   └── Toast.vue
│
├── layout/                      # Layout components
│   ├── AppShell.vue            # Main container with sidebar
│   ├── Header.vue              # Top bar with title & actions
│   ├── Sidebar.vue             # Navigation sidebar
│   └── ThemeToggle.vue         # Dark/light mode switch
│
├── profile/                     # Profile management
│   ├── ProfileCard.vue         # Individual profile display
│   ├── ProfileList.vue         # Scrollable profile list
│   ├── ProfileEditor.vue       # Create/edit profile form
│   ├── ProfileSwitcher.vue     # Quick switch dropdown
│   └── ProfileImportExport.vue # Import/export UI
│
├── conditions/                  # Auto-switch rules
│   ├── ConditionTable.vue      # Searchable rule list
│   ├── ConditionRow.vue        # Individual rule item
│   ├── ConditionEditor.vue     # Add/edit condition form
│   └── ConditionTypeSelector.vue # Dropdown for condition types
│
├── status/                      # Connection status
│   ├── ConnectionStatusCard.vue # Top-level connection info
│   ├── StatusBadge.vue         # Inline status badge
│   ├── ProxyIndicator.vue      # Current proxy indicator
│   └── RequestCounter.vue      # Request statistics
│
└── popup/                       # Popup-specific
    ├── QuickActions.vue        # Fast access buttons
    ├── ProfileQuickList.vue    # Compact profile list
    └── StatusAlert.vue         # Connection status messages
```

---

## 📐 UI Component Map

### 1. Popup (320px × 600px)

```
┌────────────────────────────────────┐
│  � SwitchyMalaccamax     ☀️ 🔔 │  Header (48px)
├────────────────────────────────────┤
│                                    │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │  Connection Status
│  ┃ 🟢 Proxy Active             ┃  │  (60px, collapsible)
│  ┃ Via Corporate VPN           ┃  │
│  ┃ 247 requests today          ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                    │
│  ┌──────────────────────────────┐ │  Quick Actions (60px)
│  │ [⚡ Toggle Bypass] [⚙️ Edit] │ │
│  └──────────────────────────────┘ │
│                                    │
│  🔍 Search profiles...             │  Search (40px)
│                                    │
│  Profiles ▼                        │  Section Header (32px)
│  ┌──────────────────────────────┐ │
│  │ ● Auto Switch      [🔄 Auto] │ │  Active Profile
│  │   via company.com rules      │ │  (highlighted)
│  └──────────────────────────────┘ │
│  ┌──────────────────────────────┐ │
│  │ ○ Corporate VPN              │ │  Inactive Profiles
│  │   SOCKS5 • 10.0.1.5:1080    │ │  (click to activate)
│  └──────────────────────────────┘ │
│  ┌──────────────────────────────┐ │
│  │ ○ Direct Connection          │ │
│  │   No proxy                   │ │
│  └──────────────────────────────┘ │
│                                    │
│  ─────────────────────────────     │  Divider
│                                    │
│  [+ New Profile] [⚙️ Settings]    │  Footer (56px)
└────────────────────────────────────┘

Interactions:
- Click profile → instant switch with toast notification
- Click "Toggle Bypass" → bypasses current site, adds to rules
- Click "Edit" → opens profile editor in options page
- Search → filters profiles in real-time
- Long-press profile → shows quick menu (edit/delete/duplicate)
```

### 2. Options Page - Full Dashboard

```
┌──────────────────────────────────────────────────────────────────────┐
│  ☰  SwitchyMalaccamax                              🔍 Search  ☀️ 👤 │  Header (64px)
└──────────────────────────────────────────────────────────────────────┘
┌──────┬───────────────────────────────────────────────────────────────┐
│      │                                                               │
│  🏠  │  Dashboard                                                    │
│  📋  │  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  🛡️  │  ┃ Security Status                                        ┃  │
│  ⚙️  │  ┃ 🟢 All systems operational                            ┃  │
│  📊  │  ┃ ReDoS Protection: Active | Patterns: 124/124 safe     ┃  │
│  📥  │  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│  ℹ️  │                                                               │
│      │  Quick Stats                                                  │
│ 200px│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│ wide │  │ 5 Profiles   │ │ 12 Rules     │ │ 3.2K Requests│        │
│      │  │ 3 active     │ │ 8 patterns   │ │ today        │        │
│      │  └──────────────┘ └──────────────┘ └──────────────┘        │
│      │                                                               │
Sidebar│  ════════════════════════════════════════════════════════     │
(fixed)│                                                               │
│  📋  ◄─ Profiles Tab (Active)                                       │
│      │                                                               │
│      │  ┌────────────────────────────────────────────────────────┐ │
│      │  │ [+ New Profile]  [📥 Import]  [📤 Export]  [🔄 Sync] │ │
│      │  └────────────────────────────────────────────────────────┘ │
│      │                                                               │
│      │  Profiles                                           Sort: ▼  │
│      │  ┌────────────────────────────────────────────────────────┐ │
│      │  │ 🟢 Auto Switch                           [✏️] [🗑️] [⋮] │ │
│      │  │ Switch Rules • 8 conditions                             │ │
│      │  │ Last used: 2 minutes ago                                │ │
│      │  └────────────────────────────────────────────────────────┘ │
│      │  ┌────────────────────────────────────────────────────────┐ │
│      │  │ ⚪ Corporate VPN                          [✏️] [🗑️] [⋮] │ │
│      │  │ Fixed Server • SOCKS5 10.0.1.5:1080                    │ │
│      │  │ Last used: 1 hour ago                                   │ │
│      │  └────────────────────────────────────────────────────────┘ │
│      │  ┌────────────────────────────────────────────────────────┐ │
│      │  │ ⚪ Direct Connection                      [✏️] [🗑️] [⋮] │ │
│      │  │ System • No proxy                                       │ │
│      │  │ Last used: Never                                        │ │
│      │  └────────────────────────────────────────────────────────┘ │
│      │                                                               │
└──────┴───────────────────────────────────────────────────────────────┘

Sidebar Navigation:
🏠 Dashboard    - Overview & quick stats
📋 Profiles     - Manage proxy profiles ◄─ ACTIVE
🛡️ Auto Switch  - Condition rules
⚙️ Settings     - Preferences & options
📊 Logs         - Request history
📥 Import/Export - Backup & migration
ℹ️ About        - Version & help
```

### 3. Profile Editor (Modal/Slide-in)

```
┌─────────────────────────────────────────────────────────────┐
│  Edit Profile: Corporate VPN                          [✕]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Basic Info                                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Profile Name: Corporate VPN                         │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Color: 🔵 Blue    Icon: 🏢 Building                │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  Proxy Settings                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Type: ▼ SOCKS5                                      │  │
│  │ Host: 10.0.1.5                                      │  │
│  │ Port: 1080                                          │  │
│  │ ☐ Requires authentication                           │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  Bypass Rules (Optional)                                    │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ localhost                                           │  │
│  │ 127.0.0.1                                           │  │
│  │ <local>                                             │  │
│  │ [+ Add pattern]                                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ─────────────────────────────────────────────────────     │
│                                                             │
│  [Cancel]                 [Test Connection]  [Save]        │
└─────────────────────────────────────────────────────────────┘
```

### 4. Condition Table (Auto Switch Rules)

```
┌───────────────────────────────────────────────────────────────┐
│  Auto Switch Rules                     [+ Add Rule] [⋮ More] │
├───────────────────────────────────────────────────────────────┤
│  🔍 Search rules...                                Sort: ▼    │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ ✓  Type         Pattern              Profile       [⋮]  │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ ✓  Host Wildcard  *.company.com       Corporate VPN  ⋮  │ │
│  │    Last matched: 2 min ago • 124 hits today            │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ ✓  URL Regex   ^https://github\.com   Direct       ⋮  │ │
│  │    Last matched: 5 min ago • 43 hits today              │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ ✓  Host Levels  2-3                    Corporate    ⋮  │ │
│  │    Matches 2-3 subdomain levels • Last matched: Never   │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │ ✓  Bypass       <local>                Direct       ⋮  │ │
│  │    Local hostnames • Last matched: Never                │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  Showing 4 of 12 rules • 2 active, 1 warning, 9 inactive     │
└───────────────────────────────────────────────────────────────┘
```

---

## 🎭 Micro-Interactions & Animations

### Profile Switch
```css
/* Before: Profile card in popup */
.profile-card {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* On click: Scale + color shift */
.profile-card:active {
  transform: scale(0.98);
  background: var(--security-protected-bg);
}

/* After: Toast notification slides in */
@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.toast-success {
  animation: slideInRight 300ms ease-out;
}
```

### Toast Notification
```
┌──────────────────────────────┐
│ ✓ Switched to Corporate VPN  │
│   SOCKS5 • 10.0.1.5:1080    │
│   [Undo]                     │
└──────────────────────────────┘
Duration: 3 seconds
Position: Bottom-right
```

### Search Input
```css
/* Focus state: Glow effect */
.search-input:focus {
  box-shadow: 0 0 0 3px var(--accent-primary-alpha-20);
  border-color: var(--accent-primary);
}
```

### Loading States
```
Profile switching:
┌────────────────────┐
│ ⏳ Switching...    │  Spinner animation
└────────────────────┘

Testing connection:
┌────────────────────┐
│ 🔄 Testing...      │  Pulse animation
└────────────────────┘

Success:
┌────────────────────┐
│ ✓ Connected!       │  Scale + fade in
└────────────────────┘

Error:
┌────────────────────┐
│ ✕ Connection failed│  Shake animation
└────────────────────┘
```

### Skeleton Loading
```
Loading profile list:
┌─────────────────────────────┐
│ ░░░░░░░░░░░░░░░             │  Shimmer effect
│ ░░░░░░░░                    │  (animated gradient)
└─────────────────────────────┘
```

---

## ♿ Accessibility Features

### Keyboard Navigation

#### Popup
```
Tab       → Navigate between profiles
Enter     → Activate profile
Space     → Activate profile
Ctrl+F    → Focus search
Esc       → Close popup
Ctrl+O    → Open options
Arrows    → Navigate profile list
Home/End  → First/last profile
```

#### Options Page
```
Ctrl+K    → Command palette (quick actions)
Ctrl+F    → Focus search
Ctrl+N    → New profile
Ctrl+S    → Save changes
Ctrl+Z    → Undo
Arrows    → Navigate tables/lists
Enter     → Edit selected item
Delete    → Delete selected item
Esc       → Close modal/cancel
```

### Screen Reader Support
```html
<!-- Example: Profile card -->
<button
  role="radio"
  aria-checked="true"
  aria-label="Auto Switch profile, currently active, 8 conditions, last used 2 minutes ago"
>
  <span aria-hidden="true">🟢</span>
  <span>Auto Switch</span>
</button>

<!-- Example: Security status -->
<div role="status" aria-live="polite">
  <span class="sr-only">Security status:</span>
  Protected. ReDoS protection active.
  124 of 124 patterns validated as safe.
</div>

<!-- Example: Loading state -->
<div role="status" aria-live="polite" aria-busy="true">
  <span class="sr-only">Switching profile...</span>
  <svg aria-hidden="true"><!-- Spinner --></svg>
</div>
```

### Focus Indicators
```css
/* High-contrast focus ring */
*:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* Focus within container */
.profile-card:focus-within {
  box-shadow: 0 0 0 3px var(--accent-primary-alpha-20);
}
```

### Color Contrast
All color combinations meet WCAG 2.1 AA standards:
- Text on background: ≥4.5:1 ratio
- Large text: ≥3:1 ratio
- Interactive elements: ≥3:1 ratio

---

## 🌙 Dark Mode Implementation

### Toggle Component
```vue
<!-- ThemeToggle.vue -->
<template>
  <button
    @click="toggleTheme"
    aria-label="Toggle dark mode"
    class="theme-toggle"
  >
    <Transition name="theme-icon" mode="out-in">
      <SunIcon v-if="isDark" key="sun" />
      <MoonIcon v-else key="moon" />
    </Transition>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const isDark = ref(false);

onMounted(() => {
  // Check system preference
  isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Check saved preference
  const saved = localStorage.getItem('theme');
  if (saved) isDark.value = saved === 'dark';
  
  applyTheme();
});

watch(isDark, applyTheme);

function toggleTheme() {
  isDark.value = !isDark.value;
}

function applyTheme() {
  document.documentElement.classList.toggle('dark', isDark.value);
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
}
</script>
```

### CSS Variables Strategy
```css
/* Use CSS custom properties for theming */
:root {
  --bg-primary: #FFFFFF;
  --text-primary: #0F172A;
  /* ... light mode colors ... */
}

:root.dark {
  --bg-primary: #0F172A;
  --text-primary: #F1F5F9;
  /* ... dark mode colors ... */
}

/* Components use variables */
.card {
  background: var(--bg-primary);
  color: var(--text-primary);
}
```

### Smooth Transition
```css
/* Prevent flash on load */
@media (prefers-color-scheme: dark) {
  :root:not(.light) {
    /* Apply dark colors immediately */
  }
}

/* Smooth transition when toggling */
* {
  transition: background-color 200ms ease,
              color 200ms ease,
              border-color 200ms ease;
}
```

---

## 📱 Responsive Design

### Breakpoints
```css
--mobile: 320px   /* Popup size */
--tablet: 768px
--desktop: 1024px
--wide: 1440px
```

### Popup (Fixed 320px)
- Single column layout
- Collapsible sections
- Bottom sheet for actions

### Options Page
```css
/* Mobile: Sidebar becomes bottom nav */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 64px;
    flex-direction: row;
  }
}

/* Desktop: Fixed sidebar */
@media (min-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    width: 200px;
    height: 100vh;
    flex-direction: column;
  }
}
```

---

## 🎯 Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Install Radix Vue + dependencies
- [ ] Create design token file (CSS variables)
- [ ] Build primitive UI components (Button, Card, Badge, etc.)
- [ ] Implement dark mode system
- [ ] Create AppShell layout

### Phase 2: Core Components (Week 2)
- [ ] ProfileCard + ProfileList
- [ ] ProfileEditor modal
- [ ] SecurityStatusCard
- [ ] ConditionTable
- [ ] Toast notification system

### Phase 3: Pages (Week 3)
- [ ] Redesign Popup
- [ ] Redesign Options Dashboard
- [ ] Implement routing (Profile/Rules/Settings tabs)
- [ ] Connect to existing logic (conditions.ts, schema.ts)

### Phase 4: Polish (Week 4)
- [ ] Micro-interactions
- [ ] Loading states
- [ ] Error boundaries
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] User testing

---

## 📦 Dependencies to Install

```json
{
  "dependencies": {
    "radix-vue": "^1.9.0",
    "@vueuse/core": "^11.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-vue-next": "^0.460.0"
  }
}
```

**Library Choices**:
- **Radix Vue**: Accessible headless components
- **VueUse**: Composition utilities (dark mode, local storage, etc.)
- **CVA**: Component variant management
- **clsx + tailwind-merge**: Conditional class names
- **Lucide**: Modern icon set (24,000+ icons)

---

## 🎨 Sample Component Code

### Button.vue (Primitive)
```vue
<template>
  <button
    :class="buttonClass"
    :disabled="disabled"
    :aria-busy="loading"
    v-bind="$attrs"
  >
    <span v-if="loading" class="spinner" aria-hidden="true"></span>
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300',
        ghost: 'hover:bg-slate-100 hover:text-slate-900',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-11 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

type ButtonVariants = VariantProps<typeof buttonVariants>;

interface Props extends ButtonVariants {
  disabled?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  loading: false,
});

const buttonClass = computed(() =>
  cn(buttonVariants({ variant: props.variant, size: props.size }))
);
</script>
```

### ConnectionStatusCard.vue
```vue
<template>
  <Card class="connection-status-card">
    <div class="flex items-start gap-3">
      <div :class="statusIconClass">
        <component :is="statusIcon" class="h-6 w-6" />
      </div>
      
      <div class="flex-1">
        <h3 class="text-lg font-semibold">{{ statusTitle }}</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {{ statusMessage }}
        </p>
        
        <div class="flex items-center gap-4 mt-3 text-xs">
          <Badge :variant="modeVariant">
            <component :is="modeIcon" class="h-3 w-3 mr-1" />
            {{ connectionMode }}
          </Badge>
          
          <span class="text-gray-500">
            {{ requestCount }} requests today
          </span>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        @click="collapsed = !collapsed"
        aria-label="Toggle details"
      >
        <ChevronUp v-if="!collapsed" class="h-4 w-4" />
        <ChevronDown v-else class="h-4 w-4" />
      </Button>
    </div>
    
    <Transition name="expand">
      <div v-if="!collapsed" class="mt-4 pt-4 border-t">
        <dl class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt class="text-gray-500">Active Profile</dt>
            <dd class="font-medium mt-1">{{ activeProfile }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Requests Today</dt>
            <dd class="font-medium mt-1">{{ requestCount }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Last Switched</dt>
            <dd class="font-medium mt-1">{{ lastSwitched }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Proxy Type</dt>
            <dd class="font-medium mt-1">{{ proxyType }}</dd>
          </div>
        </dl>
      </div>
    </Transition>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Activity, Zap, Circle, AlertTriangle, ChevronUp, ChevronDown } from 'lucide-vue-next';

interface Props {
  status: 'active' | 'auto' | 'direct' | 'error';
  activeProfile: string;
  connectionMode: 'Manual' | 'Auto Switch' | 'Direct';
  requestCount: number;
  lastSwitched: string;
  proxyType: string;
}

const props = defineProps<Props>();
const collapsed = ref(false);

const statusConfig = {
  active: {
    icon: Activity,
    title: 'Proxy Active',
    message: 'All traffic routed through proxy server',
    iconClass: 'text-green-500 bg-green-100 dark:bg-green-900/20',
  },
  auto: {
    icon: Zap,
    title: 'Auto Switch',
    message: 'Automatically switching based on rules',
    iconClass: 'text-blue-500 bg-blue-100 dark:bg-blue-900/20',
  },
  direct: {
    icon: Circle,
    title: 'Direct Connection',
    message: 'Not using proxy',
    iconClass: 'text-gray-500 bg-gray-100 dark:bg-gray-800',
  },
  error: {
    icon: AlertTriangle,
    title: 'Connection Error',
    message: 'Failed to connect to proxy',
    iconClass: 'text-red-500 bg-red-100 dark:bg-red-900/20',
  },
};

const currentStatus = computed(() => statusConfig[props.status]);
const statusIcon = computed(() => currentStatus.value.icon);
const statusTitle = computed(() => currentStatus.value.title);
const statusMessage = computed(() => currentStatus.value.message);
const statusIconClass = computed(() => `flex items-center justify-center w-12 h-12 rounded-lg ${currentStatus.value.iconClass}`);

const modeIcon = computed(() => props.connectionMode === 'Auto Switch' ? Zap : Activity);
const modeVariant = computed(() => props.connectionMode === 'Auto Switch' ? 'default' : 'secondary');
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 200ms ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 300px;
}
</style>
```

---

## 🎬 Next Steps

1. **Review & Approve** this design specification
2. **Install dependencies** (Radix Vue, VueUse, Lucide icons)
3. **Create design tokens** (CSS variables file)
4. **Build primitive components** (Button, Card, Badge, etc.)
5. **Implement layouts** (AppShell, Header, Sidebar)
6. **Build feature components** (ProfileCard, ConditionTable, etc.)
7. **Redesign pages** (Popup, Options)
8. **Add micro-interactions**
9. **Accessibility audit**
10. **User testing**

---

## 📝 Notes

- **Vue 3, not React**: Using Radix Vue instead of Shadcn
- **Tailwind CSS**: Already configured, no changes needed
- **TypeScript**: Strict typing for all components
- **Composition API**: All components use `<script setup>`
- **Security-First**: Visual indicators for ReDoS protection
- **Developer-Focused**: Dark mode, keyboard shortcuts, power user features

---

**Ready to proceed with implementation?** Let me know which phase to start with!
