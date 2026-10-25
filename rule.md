# 🔒 Enterprise Engineering & Architecture Specification (`rule.md`)

> [!IMPORTANT]
> **PROPRIETARY & CONFIDENTIAL — INTERNAL COMPANY USE ONLY**  
> **Package**: `my Design System` (my Design System Enterprise UI Design System & Component Library)  
> **Classification**: **Strictly Private / Company Proprietary Property**  
> **Notice**: This library and its underlying source code are the exclusive intellectual property of the company. Developed specifically for internal my Design System enterprise applications, micro-frontends, management portals, and executive dashboards. **Unauthorized distribution, public publication, or external npm release is strictly prohibited.**

---

## 📋 Table of Contents

1. [🔒 Enterprise Security, Governance & Proprietary Rules](#1--enterprise-security-governance--proprietary-rules)
2. [🏗️ Core Architecture & Server-Side Data Binding Vision](#2--core-architecture--server-side-data-binding-vision)
3. [📏 Coding Standards & Component Development Patterns](#3--coding-standards--component-development-patterns)
4. [🏷️ Naming Conventions & Props Contract](#4--naming-conventions--props-contract)
5. [📁 Enterprise Project Architecture](#5--enterprise-project-architecture)
6. [📊 Enterprise Data Grid Standard (`DataTable` & `ServerDataTable`)](#6--enterprise-data-grid-standard-datatable--serverdatatable)
7. [⏱️ Enterprise Audit Timeline Standard (`Timeline` & `TimelineModal`)](#7--enterprise-audit-timeline-standard-timeline--timelinemodal)
8. [📋 Reusable Utilities & Copy Component Standard (`CopyButton`)](#8--reusable-utilities--copy-component-standard-copybutton)
9. [📱 Responsive Mobile & Desktop Hybrid Guidelines](#9--responsive-mobile--desktop-hybrid-guidelines)
10. [⌨️ Keyboard Navigation & Accessibility (A11y)](#10--keyboard-navigation--accessibility-a11y)
11. [🎨 Enterprise Theme Engine & Design Tokens](#11--enterprise-theme-engine--design-tokens)
12. [⚡ Performance, Event Handling & Micro-Animations](#12--performance-event-handling--micro-animations)
13. [📦 Package Export Verification & Build Workflow](#13--package-export-verification--build-workflow)

---

## 1. 🔒 Enterprise Security, Governance & Proprietary Rules

- **Strict Proprietary Boundary**: This UI design system is built exclusively for internal enterprise deployment across company applications and micro-frontends.
- **Zero Third-Party Telemetry**: Components MUST NOT contain analytics scripts, tracking pixels, or external CDN dependencies that expose user interaction or internal network activity outside company infrastructure.
- **Offline & Air-Gapped Ready**: All fonts, styling tokens, icons (`lucide-react`), and theme variables MUST operate 100% offline within air-gapped corporate intranets and private networks.
- **Sanitized Mock Data**: Internal data fixtures (`src/data/mock.js`) used for developer previews MUST use simulated corporate accounts and sanitized sample records.

---

## 2. 🏗️ Core Architecture & Server-Side Data Binding Vision

- **Zero-Config Integration**: Internal application developers must be able to import any component directly without requiring complex CSS loader configurations or build tool setup.
- **Auto-Theme Injection Engine**: Upon component mounting, the library automatically verifies and injects company CSS design variables into the document `<head>` if missing (`autoInit.js`).
- **Standardized Server-Side Data Binding**:
  - `useServerDataBinding`: Universal hook for handling remote pagination, sorting, search debounce, and filter synchronization.
  - `ServerDataProvider`: Global context provider configuring REST API endpoints (`/api/v1/licenses`, `/api/v1/users`, plus `reports`/`materials` for `ReportPage`/`HomeDashboard`).
  - `ServerDataTable`: Zero-boilerplate wrapper around `DataTable` with built-in remote fetch, loading overlays, and error retry handlers.
  - `AsyncDropdown` & `AsyncMultiSelectDropdown`: Remote options fetching with search debounce, caching, and infinite scroll pagination.
- **Frontend-Only, Backend-Agnostic Boundary**: This is a UI component library — it contains **no database code, no server code, and no bundled authentication logic**. `serverDataAdapter.js`'s REST adapters (`createRestAdapter`, `createCreateAdapter`, `createUpdateAdapter`, `createDeleteAdapter`) are the *only* place the library talks to a network, and they only ever call a URL/headers/payload the consumer configured — the library never assumes a specific backend stack. Every page that supports backend wiring (`LicensePage`, `UsersPage`, `MasterListPage` + its three presets, `ReportPage`, `HomeDashboard`, `SlsReportDashboard`) falls back to local in-memory mock state when no fetcher/callback is supplied, so the library remains fully demoable/buildable with zero backend present.
- **Real-Backend Hardening in `serverDataAdapter.js`**: every adapter's `headers` option accepts either a plain object or a `() => Object | Promise<Object>` function (for tokens that must be re-read/refreshed per request), response bodies are parsed defensively (empty `204`-style bodies never throw on `JSON.parse`), and non-2xx responses are turned into an `Error` carrying the backend's own `message`/`error`/`detail` field (falling back to a generic `HTTP {status}` message) plus a `.status` property — so page-level `onToast(err.message)` handlers surface real backend errors, not opaque ones.
- **No Authentication in This Library — By Design**: `LoginForm`/`LoginPasswordForm` (`src/pages/auth/`) are demo-only UI shells (hardcoded known-emails check, "any non-empty password" acceptance) and **must not** be wired to real credential-checking logic inside this library. Auth is entirely the consuming app's responsibility — these two components exist to show the two-step sign-in *screen layout*, not to gate access. Do not "fix" this by adding real auth here; if a future task asks for it, treat it as an explicit, separate scope decision, not an implied bug fix.

---

## 3. 📏 Coding Standards & Component Development Patterns

- **Functional React Standard**: All components use modern React functional syntax with hooks (`useMemo`, `useCallback`, `useState`, `useRef`, `useEffect`).
- **Pure Component Rendering**: Component render functions must remain free of side-effects. DOM manipulations and focus management must be encapsulated in `useEffect`.
- **Early Guard Clauses**: Maintain clean control flow using early returns for loading, error, or empty states.
- **Required-Field Validation Must Reject Whitespace-Only Input**: Any `submitDisabled`/required-field check on a text field must use `!value?.trim()`, not `!value` — a value of `"   "` is truthy and must not be treated as valid. This is the standard across every form modal in `feature/` (license, master-data, user, and password forms); when adding a new required text field, follow the same pattern.

```jsx
// GOOD: Clean early return pattern for enterprise components
if (loading) {
  return <SkeletonTable rows={10} columns={8} />;
}
if (error) {
  return <ErrorMessage message={error} onRetry={refetch} />;
}
if (!data || data.length === 0) {
  return <EmptyState message={emptyMessage} onClearFilters={handleClear} />;
}
```

---

## 4. 🏷️ Naming Conventions & Props Contract

### Files & Directory Structure
- **React Components**: `PascalCase.jsx` (e.g., `DataTable.jsx`, `Timeline.jsx`, `InputGroup.jsx`, `SegmentedControl.jsx`, `MobileCardList.jsx`, `MobileTableWrapper.jsx`).
- **Utilities & Hooks**: `camelCase.js` (e.g., `useServerDataBinding.js`, `serverDataAdapter.js`, `cn.js`).
- **Build Scripts**: `kebab-case.mjs` (e.g., `verify-package-exports.mjs`, `copy-theme-css.mjs`).
- **bool**: `values` (e.g., `true: 1`),
### Component Props Contract
- **Boolean Flags**: Explicit affirmative names: `selectable`, `stickyHeader`, `truncateText`, `isLink`, `copyable`, `serverSide`, `disablePastDates`, `showTime`.
- **Event Callbacks**: Prefix with `on`: `onRowClick`, `onSelectedKeysChange`, `onCellClick`, `onSortChange`, `onPageChange`, `onTimeline`, `onClearFilters`, `onMobileClose`.
- **Data Collections**: Plural nouns: `columns`, `data`, `selectedKeys`, `contextMenuItems`, `visibleColumns`, `items`, `entries`, `primaryFields`, `secondaryFields`.
- **Content Slots**: Descriptive slot names: `addonLeft`, `addonRight` (InputGroup), `requiredText` (FormGroup/InputField/Dropdown), `defaultMobileView` (MobileTableWrapper).

### New Props Reference

| Prop | Component(s) | Type | Description |
|------|-------------|------|-------------|
| `requiredText` | `FormGroup`, `InputField`, `Dropdown`, `DatePicker`, `DateRangePicker`, `InputGroup`, `SegmentedControl` | `string` | Red badge text appended to label (e.g. `"(required)"`). |
| `addonLeft` | `InputGroup` | `string \| ReactNode` | Left add-on slot (e.g. `"₹"` currency prefix). |
| `addonRight` | `InputGroup` | `string \| ReactNode` | Right add-on slot (e.g. `"Days"` suffix or icon button). |
| `defaultMobileView` | `MobileTableWrapper` | `"card" \| "table"` | Initial mobile view mode. Default `"card"`. |
| `disablePastDates` | `DatePicker`, `DateRangePicker` | `boolean` | Prevents selection of past dates. Default `true`. |
| `showTime` | `DatePicker` | `boolean` | Enables datetime-local input type. Default `false`. |
| `autoHeight` / `maxHeight` / `minHeight` / `heightOffset` | `DataTable` | `boolean` / `number\|string` / `number` / `number` | Self-bounding sizing: `DataTable` measures its own offset from the top of the viewport and sets an explicit height, so the header stays pinned and only the row area scrolls regardless of the host page's CSS. Set `maxHeight` for a fixed size (e.g. inside a `Modal`), or `autoHeight={false}` to fall back to pure flexbox sizing (requires a bounded-height flex ancestor chain). |
| `sortKey` / `sortDirection` / `onSortChange` | `DataTable` | `string` / `"asc"\|"desc"` / `(key, direction) => void` | Controlled-sort mode. Presence of `onSortChange` switches `DataTable` from managing its own sort state to calling this on header click and rendering whatever `sortKey`/`sortDirection` is passed back in — **required for server-side sorting** to actually re-trigger a fetch. `useServerDataBinding`'s `tableProps` bundle wires this automatically. |
| `onPageSizeChange` / `pageSizeOptions` | `Pagination` | `(size: number) => void` / `number[]` | When `onPageSizeChange` is provided, `Pagination` renders a working "rows per page" `<select>` (default options `[10, 20, 50, 100]`). Omit it and `Pagination` renders only the prev/next controls, exactly as before. |
| `error` / `onRetry` | `MobileTableWrapper`, `MobileCardList`, `ReportWidget` | `string \| Error` / `() => void` | Same error-state contract `DataTable` already had: when `error` is set, the component renders an inline error message in place of its normal content, with a "Retry Request" button if `onRetry` is also given. Added so mobile views and dashboard widgets don't silently show nothing on a failed server fetch — always pass these through on any responsive/server-bound screen, not just the desktop `DataTable`. |
| `fetcher` / `serverSide` / `endpointKey` / `onCreate` / `onUpdate` / `onDelete` / `initialData` | `LicenseTypePage`, `LicenseTermPage`, `ProductTypePage` | see `MasterListPage` | These three masters presets now forward the full `MasterListPage` server-binding contract instead of only `onToast` — each just supplies its own default `endpointKey` (`"licenseTypes"` / `"licenseTerms"` / `"productTypes"`), columns, and `FormModal`. |
| `renewalFetcher` / `trendFetcher` | `SlsReportDashboard` | `() => Promise<Array>` | Per-widget async data loaders (independent of each other). Each drives that widget's own `loading`/`error` state via `ReportWidget`, and is re-invoked on that widget's Reload button. |
| `user` / `onUpdateProfile` / `onChangePassword` | `UserProfilePage` | `object` / `(patch) => Promise<void>` / `(password) => Promise<void>` | Deliberately **not** named `fetcher`/`onUpdate` like the CRUD pages — this page edits a single already-authenticated user's own profile fields, not a list of entities, so it gets its own narrower callback shape. Still falls back to local demo state when omitted. |

---

## 5. 📁 Enterprise Project Architecture

```text
SLS-Library-master/
├── scripts/                      # Build automation & verification tools
│   ├── copy-theme-css.mjs        # Theme CSS bundling script
│   └── verify-package-exports.mjs# Package export audit script
├── src/
│   ├── components/
│   │   ├── common/               # Atomic UI Primitives
│   │   │   ├── DataTable.jsx     # Enterprise data grid with computed scroll width
│   │   │   ├── MobileTableWrapper.jsx  # Responsive table/card wrapper with view mode toggle
│   │   │   ├── MobileCardList.jsx      # Progressive disclosure mobile card list
│   │   │   ├── BottomSheet.jsx   # Mobile bottom sheet overlay
│   │   │   ├── InputGroup.jsx    # Input with addonLeft/addonRight slots
│   │   │   ├── SegmentedControl.jsx    # Toggle button group component
│   │   │   ├── DatePicker.jsx    # Date/datetime input with showPicker() trigger
│   │   │   ├── DateRangePicker.jsx     # Dual-month range picker with presets
│   │   │   ├── Timeline.jsx      # Audit history timeline
│   │   │   ├── Button.jsx        # Action buttons
│   │   │   ├── CopyButton.jsx    # Clipboard copy utility
│   │   │   ├── Tooltip.jsx       # Smart overflow tooltips
│   │   │   ├── TruncatedText.jsx # Text truncation with tooltips
│   │   │   └── ...               # Badge, Modal, SearchBox, Loader, etc.
│   │   ├── feature/              # Enterprise Modules
│   │   │   ├── license/          # LicenseToolbar, LicenseFormModal, LicenseFilter, etc.
│   │   │   └── ...               # TimelineModal, InvoicePreviewModal, etc.
│   │   └── layout/               # Layout Containers
│   │       ├── Sidebar.jsx       # 10-item nav (w-56/w-16 desktop, overlay mobile)
│   │       ├── Header.jsx        # App header with ThemeSwitcher
│   │       ├── MainLayout.jsx    # Full-screen 100dvh layout
│   │       └── ...               # Panel, TableToolbar, Footer
│   ├── data/                     # Simulated Internal Data Fixtures (mock.js)
│   ├── lib/                      # Enterprise Server Binding Hooks & Adapters
│   ├── pages/                    # Pre-Composed Full Page Modules (LicensePage, UsersPage)
│   ├── theme/                    # Theme Engine Tokens & Provider (ThemeProvider, theme.css)
│   ├── index.js                  # Main library entry point
│   └── index.d.ts                # TypeScript definition file
├── DOCUMENTATION.md              # Complete Component Usage Manual
├── README.md                     # Comprehensive Developer Quickstart Guide
└── rule.md                       # Proprietary Enterprise Engineering Specification
```

---

## 6. 📊 Enterprise Data Grid Standard (`DataTable` & `ServerDataTable`)

- **Self-Bounding Viewport Sizing (`autoHeight`)**:
  - `DataTable` no longer depends on every ancestor element providing a correct `flex` + `min-h-0` height chain down from the page root. By default (`autoHeight={true}`), it measures its own distance from the top of the viewport on mount/resize/scroll/body-resize and sets an explicit `height`/`maxHeight` on its root element, so the header stays pinned and only the row area scrolls — regardless of the host page's CSS.
  - Pass `maxHeight` to pin an exact size (e.g. inside a `Modal`), or `autoHeight={false}` to opt back into pure flexbox sizing for cases where the table must exactly fill a bounded flex parent instead of "down to near the bottom of the viewport."
  - This exists specifically because `DataTable` is a published library component consumed by arbitrary host apps — it must not silently break (whole page scrolls, header un-pins) just because a consumer's CSS doesn't replicate this repo's own `flex flex-col` layout chain.
- **Controlled Sort for Server-Side Data (`sortKey` / `sortDirection` / `onSortChange`)**:
  - `DataTable` supports an uncontrolled (internal `sortConfig` state, client-side sort) mode and a controlled mode. Passing `onSortChange` switches it to controlled mode: clicking a sortable header calls `onSortChange(columnKey, direction)` instead of mutating internal state, and the table renders whatever `sortKey`/`sortDirection` is passed back in.
  - **This is required for `serverSide` sorting to work at all** — with `serverSide={true}`, `DataTable` never locally re-sorts `data` (it assumes the caller/server already applied sort), so without controlled-sort wiring, clicking a header column changes the arrow icon but does nothing else.
  - `useServerDataBinding`'s `tableProps` bundle (`{ data, loading, sortKey, sortDirection, onSortChange: setSort, serverSide: true, error, onRetry }`) is the standard, tested way to wire this — prefer spreading it over hand-wiring `sortKey`/`sortDirection`/`onSortChange` yourself.
- **Known Non-Functional Props (do not add usage relying on these without also implementing them)**:
  - `DataTable` currently accepts, but does not read anywhere in its render logic, the following props: top-level `onCellClick` (use each column's own `col.onCellClick` instead), `pagination` (compose `Pagination` alongside `DataTable` instead), `onSearchChange` (own the search input yourself and feed `searchValue` in), `truncateText`, `textWrap`, `mobileCardView`, and `primaryFields` (the latter two are real, functional props on `MobileTableWrapper`/`MobileCardList`, not on `DataTable` itself).
  - Treat any of the above as a documented gap, not a hidden feature — if a task requires actually wiring one of them up, do so deliberately and update `DOCUMENTATION.md` accordingly rather than assuming it already works.
- **Computed Horizontal Scroll Width**:
  - `DataTable` dynamically calculates `totalColWidth` by summing all column widths (with a minimum floor of 850px).
  - Sets `style={{ minWidth: totalColWidth }}` on the `<table>` element to guarantee proper horizontal scrolling on mobile and narrow viewports.
  - Replaced static `min-w-max` Tailwind class with computed pixel value for predictable cross-browser behavior.
- **Touch Scrolling**:
  - Table scroll container uses `[-webkit-overflow-scrolling:touch] [touch-action:pan-x_pan-y] overscroll-contain` for smooth 60 FPS momentum scrolling on iOS and Android.
- **Instant Keyboard Navigation Standard**:
  - Vertical keyboard navigation (`ArrowUp`/`ArrowDown`) uses `behavior: "auto"` to instantly snap rows into view without smooth scroll bouncing or keypress race conditions.
- **Rich Empty State Standard**:
  - Empty search or filter results render a rich empty state card with a search icon, friendly title, message, and a primary **"Clear All Filters"** action button.
- **Keyboard Navigation Helper Footer**:
  - Data grids render a subtle keyboard shortcut hint bar at the bottom:
    `↑↓ Navigate | Shift + Click Multi-select | Esc Deselect`
- **15-Column Standard Layout**: The `LicensePage` data grid enforces the exact 15-column sequence and header labeling matching internal corporate app standards:
  1. `ACCOUNT`, 2. `NAME`, 3. `STATUS`, 4. `TYPE`, 5. `TERM`, 6. `KEY` (`CopyButton`), 7. `ISSUE`, 8. `ACTIVE`, 9. `EXPIRY`, 10. `SITE`, 11. `LAST PI`, 12. `LAST INVOICE`, 13. `AMOUNT`, 14. `PAYMENT`, 15. `IS ACTIVE`
- **Header Legibility & Single-Line Rule**:
  - All header cells (`<th>`) enforce `whitespace-nowrap` to prevent line breaks.
- **Smart Overflow Tooltips & Viewport-Fixed Positioning (`Tooltip.jsx`)**:
  - Automatically measures text overflow (`scrollWidth > clientWidth`).
  - Displays **100% full content** on hover using fixed positioning (`z-[9999]`).
  - **Touch-Device Auto Disable**: Automatically disables hover-triggered tooltips on touch devices (`matchMedia("(hover: none)")`) to prevent sticky touch states.

---

## 7. ⏱️ Enterprise Audit Timeline Standard (`Timeline` & `TimelineModal`)

- **Audit History Layout**:
  - Left vertical accent bar line with circular node rings.
  - Timestamps (`03-JUL-26 14:16 🕒`) displayed alongside nodes.
  - Callout pointer arrows pointing to right-hand audit cards.
- **Before vs After Audit Table**:
  - Cards render a 2-column grid comparing `Before` and `After` states.
  - Highlighted status formatting: red text for deactivated IDs (e.g. `Deactivate (0000000000)`) and green text for active states (`Activate`).
- **Toolbar Trigger**:
  - Toggled directly from the toolbar's Timeline button (`ListChecks` icon) at any time.

---

## 8. 📋 Reusable Utilities & Copy Component Standard (`CopyButton`)

- **`CopyButton` Component**:
  - Universal icon button for copying values (`text` or `value`) to clipboard using `navigator.clipboard.writeText` with legacy DOM fallback.
  - Displays a temporary `Check` icon and `"Copied!"` feedback tooltip.
- **`TruncatedText` Component (`TruncatedText.jsx`)**:
  - Reusable component for truncating long text strings with ellipses (`...`) and hover tooltips.
- **Built-in Grid Integration**:
  - `DataTable` natively supports `copyable: true` on column definitions, automatically rendering a `CopyButton` pinned to the right of cell text.

---

## 9. 📱 Responsive Mobile & Desktop Hybrid Guidelines

- **Dynamic Viewport Heights (`dvh`)**:
  - Layout wrappers (`MainLayout`), overlays (`Modal`, `SlideOverModal`), and mobile drawers (`BottomSheet`) use `dvh` to prevent browser URL-bar clipping on iOS Safari and Chrome.
- **Body Overflow Scroll Lock**:
  - Overlays (`Modal`, `BottomSheet`, `SlideOverModal`) automatically set `document.body.style.overflow = "hidden"` when open, preventing background scroll bleed.
- **Mobile View Mode Toggle (`MobileTableWrapper`)**:
  - On screens `< 768px`, the `MobileTableWrapper` renders a toolbar with a **View Mode Toggle** button.
  - Users can switch between **Card View** (progressive disclosure `MobileCardList`) and **Table View** (full horizontally scrollable `DataTable`).
  - `defaultMobileView` prop controls the initial view mode (`"card"` or `"table"`).
- **No Virtual Windowing on Mobile**:
  - `MobileCardList` renders all cards directly in the DOM without virtual windowing.
  - Virtual windowing was removed because it caused layout-shifting blinking and flickering during rapid touch scrolling. Native momentum scrolling (`-webkit-overflow-scrolling: touch`) provides stable 60 FPS performance.
- **Floating Mobile Bulk Selection Bar**:
  - When `selectedKeys.length > 0` on mobile, a floating glassmorphism selection bar anchors to the bottom of the screen (`Count Selected` + `Clear` button).
- **Labeled Mobile Action Drawer**:
  - Mobile action expand drawer renders explicit text labels alongside action icons (`[Icon] Action Name`), eliminating icon guessing on touch screens.
- **Desktop Logical Action Grouping**:
  - Desktop toolbar actions are organized into distinct functional clusters separated by vertical divider lines.
- **Responsive Sidebar Navigation**:
  - **Desktop**: `w-56` expanded, `w-16` collapsed with pin/hover auto-expand.
  - **Mobile**: Off-canvas overlay drawer with dark backdrop blur and close button.
  - 10 default nav items: Licenses, License Type, Product Type, License Term, Report, Reminders, Status Map, Reminder Config, User Activity, Users.
- **Responsive Date Pickers**:
  - `DateRangePicker` hides the 2nd month grid on screens `< 640px` to fit mobile viewports.
  - `DatePicker` and `DateRangePicker` support `disablePastDates` to prevent past date selection.
- **Touch-Friendly Form Controls**:
  - All form inputs use 44px minimum tap targets (`h-11 md:h-10 min-h-[44px]`).
  - `InputGroup` with `addonLeft`/`addonRight` and `SegmentedControl` are fully responsive across mobile screens.
  - `LicenseFormModal` 12-field grid collapses from 2 columns to 1 column on mobile (`grid-cols-1 sm:grid-cols-2`).
- **Modal Max-Width Sizing**:
  - Modals use centered max-width sizing (`sm` ~384px, `md` ~448px, `lg` ~576px, `xl` ~768px).
  - No desktop full-screen stretching.

---

## 10. ⌨️ Keyboard Navigation & Accessibility (A11y)

### Nested Overlay Escape-Key Stacking
- `Modal`, `BottomSheet`, and `SlideOverModal` each maintain their own module-level stack of currently-open instances. Pressing `Escape` only calls `onClose` on the **top-most** open instance of that component type.
- This matters because `ConfirmDialog` and `FormModal` both compose `Modal` internally — a very common real flow is opening a `ConfirmDialog` (e.g. "delete this?") on top of an already-open `FormModal` (an edit form). Without the stack, `Escape` would close both at once and silently discard the underlying form's state. With it, `Escape` closes only the confirmation on top.
- When building a new overlay component, follow this same per-component-type stack pattern rather than a single global "any escape closes any open overlay" listener.

### Standard Data Grid Keyboard Controls
- **`ArrowUp` / `ArrowDown`**: Move row selection cursor up/down.
- **`ArrowLeft` / `ArrowRight`**: Smoothly scroll table left/right horizontally (200px per press).
- **`Shift + ArrowUp` / `Shift + ArrowDown`**: Range selection expansion.
- **`Space`**: Toggle row checkbox selection.
- **`Enter`**: Execute row primary action (`onRowClick`).
- **`Escape`**: Dismiss popovers, close modals, or clear row selection.

---

## 11. 🎨 Enterprise Theme Engine & Design Tokens

- **CSS Variable Token Architecture**: All component colors, backgrounds, borders, and typography consume CSS variable design tokens (`bg-card`, `text-ink-primary`, `border-card-border`, `text-accent`).
- **6 Company-Approved Themes**:
  1. `narnix-edge` *(Default - Dark Cyan Glassmorphism)*
  2. `slate-navy` *(Corporate Navy Blue)*
  3. `arctic-white` *(Clean Light Mode)*
  4. `carbon-pro` *(Developer IDE Dark Mode)*
  5. `vipul` *(Vibrant Brand Accent)*
  6. `amber-sunrise` *(Warm Orange Accent)*

---

## 12. ⚡ Performance, Event Handling & Micro-Animations

- **Clean Console Standard**: Zero console warnings or Chrome `[Violation]` notices.
- **Event Propagation Guard**: Cell checkboxes, action links, and copy buttons MUST invoke `e.stopPropagation()` to prevent unwanted row selection toggles.
- **Smooth Micro-Animations**: Buttons, badges, dropdowns, and modals feature 150ms-200ms cubic-bezier transition curves.
- **No Virtual Windowing**: Mobile card lists render all items directly in the DOM. Virtual windowing was removed due to layout-shifting blinking artifacts during touch scrolling.

---

## 13. 📦 Package Export Verification & Build Workflow

Before releasing package updates, run:

```bash
# 1. Compile production JS bundles & copy theme CSS
npm run build

# 2. Audit package exports & theme definitions
npm run verify:package
```
