# my Design System (`my Design System`) — Complete Documentation

`my Design System` is a zero-config, themeable React component library: buttons, form fields, dropdowns, a full-featured data grid, modals, layout shells, a theme engine, server-data-binding hooks, and a set of pre-built feature modals and full pages for a license-management product. Every component and utility documented below is a **named export of the package** — import it straight from `'my Design System'`, no sub-path imports and no manual CSS import required.

This document is a complete reference: every component, page, theme, hook, and utility that the package exports has an entry here, with its exact props (read directly from the current source, not guessed), a runnable example, and any real gotchas worth knowing before you use it. If something in the code doesn't do what its prop name implies (a few `DataTable` props are currently no-ops, for example), that's called out explicitly rather than glossed over — so you don't waste time debugging a prop that was never wired up.

For a short quickstart and project overview instead, see [README.md](./README.md).

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Theming](#theming)
3. [Layout](#layout)
4. [Buttons & Actions](#buttons--actions)
5. [Form Inputs](#form-inputs)
6. [Data Display](#data-display)
7. [Tables & Data Grids](#tables--data-grids)
8. [Overlays & Feedback](#overlays--feedback)
9. [Feature Modals & Widgets](#feature-modals--widgets)
10. [Ready-to-Use Pages](#ready-to-use-pages)
11. [Server Data Binding & Utilities](#server-data-binding--utilities)

---

## Getting Started

### Install

```bash
npm install my Design System
```

### Import and use

```jsx
import { Button } from 'my Design System';

function Example() {
  return <Button variant="primary">Click me</Button>;
}
```

That's it — no CSS import, no build-tool configuration, no wrapping provider required for a component to render correctly. The moment you import anything from `'my Design System'`, the package's entry point runs a one-time side effect that injects the theme's CSS into `document.head` for you (see **Zero-config CSS injection** under [Theming](#theming) for exactly how, and how to opt out for SSR).

### Optional: theming

Every component works with sensible default styling out of the box. If you want to offer a theme picker, or start on a specific built-in theme, wrap your app in `ThemeProvider`:

```jsx
import { ThemeProvider, ThemeSwitcher } from 'my Design System';

function App({ children }) {
  return (
    <ThemeProvider defaultTheme="narnix-edge">
      <ThemeSwitcher />
      {children}
    </ThemeProvider>
  );
}
```

See [Theming](#theming) for the full list of built-in themes and what `ThemeProvider`'s props actually do.

### TypeScript

The package ships type declarations (`dist/index.d.ts`, referenced via the `types` field in `package.json`), so props are type-checked and autocompleted in editors without any extra setup.

### How to read this document

Every entry follows the same shape: a one/two-sentence description, an **Import** line, a **Props** table (or **Parameters**/**Returns** for hooks and plain functions), a runnable **Example**, and — only when there's something genuinely worth knowing — a **Notes** section. Props tables are transcribed directly from each component's current source code, including default values and exact callback signatures, so you can trust them over guessing from the component name.

---

## Theming

### `ThemeProvider`

Wraps your app (or a subtree) and makes a color theme available via CSS custom properties + React context. It renders a `<div data-sls-theme-root className="m2m-ui-root ...">` wrapper around `children` and applies the active theme's CSS variables to that wrapper's inline styles every time the theme changes. If `global` is `true` (the default), it *also* applies the same variables to `document.documentElement`, so the whole page (not just the wrapped subtree) picks up the theme.

**Import**
```jsx
import { ThemeProvider, useTheme } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `theme` | `string` | `undefined` | Controlled theme key. If passed, the provider becomes controlled — internal `setTheme` calls still fire `onThemeChange`, but the active theme always resolves from this prop, not internal state. |
| `defaultTheme` | `string` | `undefined` | Initial theme key for uncontrolled usage (used only on first render, via `theme ?? defaultTheme ?? DEFAULT_THEME`). |
| `onThemeChange` | `Function` | `undefined` | Called with the resolved theme key (`string`) whenever `setTheme` is invoked (e.g. from `ThemeSwitcher`). |
| `global` | `boolean` | `true` | See below. |
| `children` | `ReactNode` | — | App content. |

**What `global` actually controls (read from source):**
- `global={true}` (default): the theme's CSS variables are written to **both** the provider's own root `<div>` **and** `document.documentElement`. This means anything on the page — including markup outside the `ThemeProvider`, or plain HTML/CSS in the host app that happens to reference the same `--accent-primary`-style variable names — will also pick up the active theme, since the variables cascade from the document root.
- `global={false}`: the theme's CSS variables are written **only** to the provider's own root `<div>`. Styling is scoped to that subtree, which lets you mount multiple `ThemeProvider`s with different themes on the same page without them fighting over `document.documentElement`.

**Theme persistence:** `ThemeProvider` does **not** persist the selected theme to `localStorage` (or anywhere else) on its own — the active theme lives only in React state (`internalTheme`) and resets to `defaultTheme`/`DEFAULT_THEME` on every full page reload. If you want the user's theme choice to survive a reload, wire it up yourself, e.g. read/write `localStorage` in your own wrapper using `defaultTheme` (to restore) and `onThemeChange` (to save):

```jsx
import * as React from 'react';
import { ThemeProvider } from 'my Design System';

function PersistedThemeProvider({ children }) {
  const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
  return (
    <ThemeProvider
      defaultTheme={saved || undefined}
      onThemeChange={(key) => localStorage.setItem('theme', key)}
    >
      {children}
    </ThemeProvider>
  );
}
```

**`useTheme()` hook** — must be called inside a `ThemeProvider` (throws otherwise). Returns:

| Field | Type | Description |
|---|---|---|
| `theme` | `string` | The currently active, resolved theme key. |
| `setTheme` | `(key: string) => void` | Switches the active theme (resolves aliases/unknown keys via `resolveThemeKey`). |
| `themes` | `Object` | The full `THEMES` token map (see `tokens.js` below), keyed by theme key. |

**Example**
```jsx
import { ThemeProvider, ThemeSwitcher } from 'my Design System';

function App() {
  return (
    <ThemeProvider defaultTheme="carbon-pro" onThemeChange={(key) => console.log('theme →', key)}>
      <ThemeSwitcher />
      {/* rest of your app */}
    </ThemeProvider>
  );
}
```

---

### `ThemeSwitcher`

A small dropdown button (not a button group) that lists every theme in `themes` and lets the user pick one. Must be rendered inside a `ThemeProvider` (it calls `useTheme()` internally).

**Import**
```jsx
import { ThemeSwitcher } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | `undefined` | Extra classes merged onto the trigger button's wrapper. |

**What it renders:** a pill-shaped trigger button (palette icon + current theme's `label` + chevron) that, on click, opens a right-aligned popover listing every key in `themes` with its `label`; the active one shows a checkmark. Clicking an entry calls `setTheme(key)` from context and closes the popover. Clicking outside also closes it.

**Example**
```jsx
import { ThemeProvider, ThemeSwitcher } from 'my Design System';

<ThemeProvider>
  <ThemeSwitcher />
</ThemeProvider>
```

---

### `tokens.js` — theme definitions

`src/theme/tokens.js` is the single source of truth for every built-in theme. It defines **4 themes**, each labelled by what it looks like rather than by a number — a switcher reading "Theme 3" tells you nothing about what you are about to pick:

| Theme key | `label` shown in `ThemeSwitcher` | `colorScheme` | Character |
|---|---|---|---|
| `slate-navy` | "Light Navy" | `light` | Deep navy chrome (`#0d1b2e`) over a light gray canvas; blue accent (`#1d4ed8`). |
| `arctic-white` | "Light" | `light` | Nearly all-white chrome and canvas, slate-blue accent (`#2563eb`). |
| `carbon-pro` | "Dark" | `dark` | Near-black UI (`#161b22` chrome, `#1c2128` canvas) with a light-blue accent (`#58a6ff`). |
| `narnix-edge` | "Dark Teal" | `dark` | Deep blue-black (`#061828`) with a teal accent (`#00c9a7`). **The `DEFAULT_THEME`.** |

Other exports from `tokens.js`:

| Export | Description |
|---|---|
| `CSS_VAR_MAP` | Maps each token key (e.g. `chromeBg`, `accentPrimary`, `textPrimary`) to its CSS custom property name (e.g. `--chrome-bg`, `--accent-primary`, `--text-primary`). |
| `THEMES` | The object of all 4 theme definitions keyed by theme key, as shown above. Each theme also carries a `barColors` array (7 hex colors, used for chart bars) that isn't in `CSS_VAR_MAP` and is applied separately. |
| `DEFAULT_THEME` | `"narnix-edge"`. |
| `THEME_ALIASES` | `{ light: "arctic-white", dark: "carbon-pro" }` — lets you pass the generic strings `"light"`/`"dark"` anywhere a theme key is expected. |
| `resolveThemeKey(key)` | Returns `key` if it's a valid theme key, else the alias target, else `DEFAULT_THEME`. |
| `applyTheme(el, key)` | Resolves `key`, then writes every `CSS_VAR_MAP` variable (and, if present, `--bar-color-0`…`--bar-color-N` from `barColors`) onto `el.style`, plus sets `el.style.colorScheme` and `el.dataset.theme = key`. This is the low-level function `ThemeProvider` calls internally. |

**CSS variable naming convention:** raw runtime variables are kebab-case CSS custom properties like `--chrome-bg`, `--card-bg`, `--card-border`, `--accent-primary`, `--text-primary`, `--text-secondary`, `--text-muted`, `--text-on-chrome`, `--icon-idle`, `--icon-active`, `--status-online`, `--status-online-bg`, `--sidebar-border`, `--nav-active-bg`, `--tag-bg`, `--input-bg`, etc. (the full list is `CSS_VAR_MAP` above). `src/theme.css` then re-maps these through Tailwind v4's `@theme inline` block into `--color-*` design tokens (e.g. `--color-canvas: var(--canvas-bg)`, `--color-ink-primary: var(--text-primary)`), which is what actually generates the Tailwind utility classes used throughout the library's components — `bg-canvas`, `bg-card`, `bg-chrome`, `text-ink-primary`, `text-ink-secondary`, `text-ink-muted`, `text-ink-onchrome`, `border-card-border`, `bg-accent`, `text-accent`, `bg-accent-muted`, `text-status-online`, `bg-status-online-bg`, etc. In short: **CSS variables are named after the raw color role** (`--accent-primary`), **Tailwind utilities are named after the semantic ink/surface role** (`text-ink-primary`, `bg-card`) — they aren't literally `--bg-card` or `--text-ink-primary` as CSS variable names, those are the derived Tailwind class names.

---

### Zero-config CSS injection

You never need to `import 'my Design System/theme.css'` to get styled components. The package's entry point (`src/index.js`) imports `./lib/autoInit.js` before anything else, and that module runs a side effect the moment *any* component is imported from `my Design System`: it inlines `theme.css` as a string (via Vite's `?inline` import) and injects it into `document.head` as a `<style id="my Design System-theme">` tag (guarded so it only runs once, and wrapped in a `typeof document !== "undefined"` check so it's a no-op during SSR). This is why the package's `sideEffects` field in `package.json` explicitly whitelists `dist/*.js`, `dist/*.cjs`, and `*.css` — bundlers must not tree-shake this import away.

For advanced cases where you can't rely on this runtime injection — for example, server-side rendering (where there's no `document` on the first pass and you need the CSS present in the initial HTML to avoid a flash of unstyled content), or if you want to `@import` the tokens into your own Tailwind build — the package also publishes the raw stylesheet at the `./theme.css` subpath (see `exports["./theme.css"]` in `package.json`), so you can opt in manually:

```jsx
import 'my Design System/theme.css';
```

---

## Layout

The layout components are the structural shell of an my Design System app: a shell with a sidebar + header + content area (`MainLayout`), a centered card shell for sign-in screens (`AuthLayout`), plus the individual chrome pieces (`Header`, `Sidebar`, `Footer`, `ProfileMenu`) that you slot into `MainLayout`. None of them fetch data or manage routing themselves — they are presentational containers that receive already-rendered React nodes (or data arrays) as props and leave state/navigation to your app.

### `MainLayout`

The top-level application shell. Renders a full-height (`100dvh`) flex row containing whatever you pass as `sidebar`, then a column with `header`, a scrollable `children` content area, and `footer`.

**Import**
```jsx
import { MainLayout } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `sidebar` | `ReactNode` | `undefined` | Rendered as-is on the left edge of the shell (typically a `<Sidebar />`). |
| `header` | `ReactNode` | `undefined` | Rendered at the top of the main column (typically a `<Header />`). |
| `footer` | `ReactNode` | `undefined` | Rendered at the bottom of the main column (typically a `<Footer />`). |
| `children` | `ReactNode` | `undefined` | Page content, rendered inside a scrollable `<main>` with padding. |
| `className` | `string` | `undefined` | Extra classes merged onto the outer wrapper via `cn()`. |

**Example**
```jsx
import { MainLayout, Sidebar, Header, Footer, ProfileMenu } from 'my Design System';

function AppShell({ children }) {
  return (
    <MainLayout
      sidebar={<Sidebar />}
      header={<Header title="my Design System" profileMenu={<ProfileMenu />} />}
      footer={<Footer />}
    >
      {children}
    </MainLayout>
  );
}
```

**Notes**
- The outer wrapper has `bg-canvas` and `overflow-hidden`; the `<main>` region is the only part that scrolls (`overflow-hidden` + `min-h-0 flex flex-col` on itself, so a scrollable child like a `DataTable` needs `flex-1 min-h-0` to fill it).

---

### `AuthLayout`

Full-viewport shell for sign-in/sign-up/reset screens: a decorative brand panel on the left (large screens only — gradient `bg-chrome` background, blurred accent blobs, a subtle dot-grid, headline, and a short feature list) next to a centered form card containing `children`. Purely presentational — every color comes from the active theme's CSS variables, so it reskins automatically across all 4 built-in themes with no extra config.

**Import**
```jsx
import { AuthLayout } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `logo` | `ReactNode` | built-in `brandName` mark | Overrides the default logo mark, used both in the brand panel and in the compact mobile header (shown when the brand panel is hidden). |
| `brandName` | `string` | `"my Design System"` | Used to build the default `logo` mark when you don't pass your own. |
| `title` | `string` | `"Manage every software license from one screen."` | Headline shown in the brand panel. |
| `subtitle` | `string` | a short SLS-flavored blurb | Supporting text under the headline in the brand panel. |
| `features` | `Array<{ icon: ReactNode, label: string }>` | 3 built-in SLS-flavored bullets | Feature list rendered in the brand panel. Pass `[]` to hide it. |
| `showBrandPanel` | `boolean` | `true` | Set `false` to always render the simple centered single-column layout (brand panel is already hidden below the `lg` breakpoint regardless of this prop). |
| `topRight` | `ReactNode` | `undefined` | Rendered top-right of the form panel — a natural place for a `<ThemeSwitcher />` if you've wrapped your app in `ThemeProvider`, or a "Back to site" link. Not rendered by default (no `ThemeProvider` dependency). |
| `footer` | `ReactNode` | `undefined` | Small centered text/links rendered below the card (e.g. a copyright line). |
| `children` | `ReactNode` | `undefined` | Rendered inside the rounded, elevated form card. |
| `className` | `string` | `undefined` | Extra classes merged onto the outer full-height wrapper. |

**Example**
```jsx
import { AuthLayout, ThemeSwitcher } from 'my Design System';

function SignInScreen() {
  return (
    <AuthLayout topRight={<ThemeSwitcher />}>
      {/* your form fields go here */}
    </AuthLayout>
  );
}
```

**Notes**
- `LoginForm` and `LoginPasswordForm` (see Ready-to-Use Pages) already wrap themselves in `AuthLayout` using its defaults, so you typically don't need to nest it yourself when using those pages — build a custom sign-up/reset-password screen with `AuthLayout` directly when you need one.
- `topRight` deliberately isn't auto-populated with a `ThemeSwitcher` — `useTheme()`/`ThemeSwitcher` throw if used outside a `ThemeProvider`, and `AuthLayout` has no way to know whether your app has one. Pass it in yourself when you do.

---

### `Header`

The top app bar: mobile menu button, an optional brand mark, title, an optional search slot, action buttons, and a profile menu slot.

**Import**
```jsx
import { Header } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | `"my Design System Dashboard"` | Text shown in the header (truncates on overflow). |
| `logo` | `ReactNode` | `undefined` | A brand mark, rendered at the very start of the bar — after the mobile-sidebar button, before the title. Worth filling on any layout whose `Sidebar` becomes a drawer on small screens: the sidebar is where the mark normally lives, so a closed drawer takes it off the screen entirely and the top bar is the only place left for it. Scope it to the breakpoints that need it (see Notes). |
| `search` | `ReactNode` | `undefined` | Rendered in a `max-w-sm` box, hidden below the `md` breakpoint. |
| `profileMenu` | `ReactNode` | `undefined` | Rendered at the far right (typically `<ProfileMenu />`). |
| `actions` | `ReactNode` | `undefined` | Rendered between `search` and `profileMenu` (e.g. `<ThemeSwitcher />`). |
| `onOpenMobileSidebar` | `Function` | `undefined` | If provided, a hamburger button appears (mobile only, `md:hidden`) that calls this on click. |
| `className` | `string` | `undefined` | Extra classes merged onto the `<header>`. |

**Example**
```jsx
import { Header, ProfileMenu, ThemeSwitcher } from 'my Design System';

<Header
  title="my Design System Dashboard"
  // Mobile only — the sidebar carries the mark from `md:` up, and showing it
  // in both places at once just duplicates it.
  logo={<div className="md:hidden"><BrandMark /></div>}
  actions={<ThemeSwitcher />}
  profileMenu={<ProfileMenu />}
  onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
/>
```

**Notes**

- Scope `logo` to the breakpoints that actually need it. In the usual pairing with `Sidebar`, that's `md:hidden`: the sidebar shows the mark itself from `md:` up, and rendering it here too would show it twice. Below `md:` the sidebar is a drawer, so this is the only copy on screen.
- Give it the mark alone, without a wordmark, on small screens — a wordmark competes with `title` for a phone's width. `SlsLogo`-style components usually expose a `collapsed` prop for exactly this.
- With the drawer open on mobile the sidebar's own mark is what shows; the drawer is wider than this slot's position, so the two never appear side by side.
- The bar is `h-12` below `sm:` so that `control-lg` (44px) touch targets fit inside it; it was `h-10` (40px), which left them overhanging by ~2px.

---

### `Sidebar`

The collapsible, hover-to-peek left navigation rail. Desktop behavior: collapses to a 60px icon rail and expands to 240px on hover, or stays pinned open once a nav item is clicked (or the pin button is toggled). On small/touch screens it instead renders as a full-screen slide-in drawer controlled by `mobileOpen`/`onMobileClose`.

The component file also exports a constant, `DEFAULT_SIDEBAR_ITEMS`, which is the fallback nav list used when no `items` prop is passed.

**Import**
```jsx
import { Sidebar, DEFAULT_SIDEBAR_ITEMS } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `Array<{ key, label, icon, active?, badge?, badgeTone?, onClick? }>` | `DEFAULT_SIDEBAR_ITEMS` | Nav entries rendered as buttons. `icon` is a rendered node (e.g. a `lucide-react` icon element); `badgeTone: "accent"` gives a filled accent pill, anything else gives a neutral pill. |
| `collapsed` | `boolean` | `undefined` (uncontrolled) | Controls the pinned/collapsed state. If provided, the sidebar becomes controlled and `onCollapsedChange` is used to request changes. |
| `onCollapsedChange` | `Function` | `undefined` | Called with the next `collapsed` boolean whenever the user pins/unpins the sidebar or clicks a nav item while unpinned. |
| `logo` | `ReactNode \| Function` | `<span>my Design System</span>` | Rendered in the header row. If a function, called as `logo({ collapsed, isExpanded })`; if a valid element, cloned with those same two props injected. |
| `mobileOpen` | `boolean` | `false` | Whether the mobile drawer is open (mobile/touch viewports only). |
| `onMobileClose` | `Function` | `undefined` | Called when the mobile drawer's backdrop, close button, or a nav item (after navigating) is clicked. |
| `className` | `string` | `undefined` | Extra classes merged onto the `<aside>`. |

**`DEFAULT_SIDEBAR_ITEMS`** — the actual default array (10 items), each `{ key, label, icon }` with an 18px `lucide-react` icon:

| key | label | icon |
|---|---|---|
| `licenses` | Licenses | `BadgeCheck` |
| `licenseType` | License Type | `FileText` |
| `productType` | Product Type | `FileCode` |
| `licenseTerm` | License Term | `Clock` |
| `report` | Report | `BarChart3` |
| `reminders` | Reminders | `CalendarClock` |
| `statusMap` | Status Map | `Map` |
| `reminderConfig` | Reminder Config | `Briefcase` |
| `userActivity` | User Activity | `UserCheck` |
| `users` | Users | `User` |

**Example**
```jsx
import { Sidebar, DEFAULT_SIDEBAR_ITEMS } from 'my Design System';

const items = DEFAULT_SIDEBAR_ITEMS.map((item) => ({
  ...item,
  active: item.key === currentRoute,
  onClick: () => navigate(item.key),
}));

<Sidebar
  items={items}
  mobileOpen={mobileOpen}
  onMobileClose={() => setMobileOpen(false)}
/>
```

**Notes**
- Desktop pin state is internal (`internalPinned`) unless you pass `collapsed`/`onCollapsedChange` to control it yourself.
- Mobile vs. desktop rendering is auto-detected via `window.innerWidth < 768` and `(hover: none)`; there's no prop to force one mode.

---

### `Footer`

A thin bottom bar for the main content column. Renders `children` if provided, otherwise a default copyright line.

**Import**
```jsx
import { Footer } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | `© {currentYear} my Design System — Software License System` | Custom footer content; overrides the default text. |
| `className` | `string` | `undefined` | Extra classes merged onto the `<footer>`. |
| `...props` | `any` | — | Any other DOM props are spread onto the `<footer>` element. |

**Example**
```jsx
import { Footer } from 'my Design System';

<Footer /> {/* renders "© 2026 my Design System — Software License System" */}
<Footer>Custom footer text</Footer>
```

---

### `ProfileMenu`

An avatar button in the header that opens a popover card with the user's name/role/email, a "Manage your SLS Account" action, and a sign-out button.

**Import**
```jsx
import { ProfileMenu } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `user` | `{ name, email, role? }` | `{ name: "Super Admin", email: "admin@my Design System.com" }` | Fallback user object used if `name`/`email`/`role` aren't passed directly. |
| `name` | `string` | `undefined` | Overrides `user.name` if provided. |
| `email` | `string` | `undefined` | Overrides `user.email` if provided. |
| `role` | `string` | `undefined` | Overrides `user.role` if provided. When set, this — not the name — is what shows in the compact header trigger (see Notes); it's also shown as a small pill under the name inside the popover. Omit it entirely to fall back to the pre-role behavior of showing the name in the trigger. |
| `avatarUrl` | `string` | `undefined` | If provided, rendered as an `<img>` instead of the default `User` icon. |
| `onManageAccount` | `Function` | `() => alert("Opening SLS Account Settings...")` | Called when "Manage your SLS Account" is clicked. |
| `onSignOut` | `Function` | `() => setOpen(false)` (just closes the menu) | Called when "Sign out" is clicked. |
| `className` | `string` | `undefined` | Extra classes merged onto the root wrapper. |

**Example**
```jsx
import { ProfileMenu } from 'my Design System';

<ProfileMenu
  name="Priya Sharma"
  role="Super Administrator"
  email="priya.sharma@my Design System.com"
  onSignOut={() => doLogout()}
/>
```

**Notes**
- The popover closes automatically on outside click (`mousedown` listener on `document`).
- The pencil "edit avatar" badge inside the expanded popover is hardcoded to `alert("Change avatar profile picture")` — there's no prop hook for it yet.
- **The header bar's trigger shows `role`, not `name`, whenever a role is given.** A header is tight on horizontal space, and a full name (worse, an email — a common mistake when an app has no separate display name and passes its session identifier as `name`) is the least useful thing to spend that space on; what's actually worth knowing at a glance is what the signed-in account is allowed to do. The full name is still always shown first inside the popover, with the role underneath it as a small pill and the email below that — nothing is hidden, it just isn't all fighting for room in the header bar at once. Pass no `role` at all to keep the original name-in-the-trigger behavior.

---

## Buttons & Actions

### `Button`

The general-purpose button used throughout the app for primary and secondary actions. It handles loading state, leading/trailing icons, and full-width layout for you, so reach for it instead of a bare `<button>` any time you need consistent styling.

**Import**
```jsx
import { Button } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger' \| 'add' \| 'cancel'` | `'primary'` | Visual style. `danger` is red (destructive actions), `add` is green, `cancel` is an outlined muted button meant to pair with `danger`/`primary` in dialogs. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Controls height/padding/font-size (`sm` = 36px/32px on desktop, `md` = 44px/40px, `lg` = 48px). |
| `icon` | `ReactNode` | `undefined` | Element rendered before the children. Hidden automatically while `loading` is true (replaced by the spinner). |
| `trailingIcon` | `ReactNode` | `undefined` | Element rendered after the children. Hidden while `loading` is true. |
| `loading` | `boolean` | `undefined` | Shows a small spinning circle in place of `icon` and disables the button (`disabled` becomes `true` internally). |
| `fullWidth` | `boolean` | `undefined` | When true, adds `w-full` so the button stretches to its container's width. |
| `disabled` | `boolean` | `undefined` | Disables the button. The button is also disabled whenever `loading` is true, regardless of this prop. |
| `className` | `string` | `undefined` | Extra classes merged onto the root `<button>`. |
| `children` | `ReactNode` | — | Button label/content. |
| `...props` | `any` | — | All other props (e.g. `onClick`, `type`, `aria-*`) are spread onto the underlying `<button>`. |

`Button` also forwards its `ref` to the underlying `<button>` element (`React.forwardRef`).

**Example**
```jsx
import { useState } from 'react';
import { Button } from 'my Design System';
import { Save } from 'lucide-react';

function SaveDeviceButton({ onSave }) {
  const [saving, setSaving] = useState(false);

  async function handleClick() {
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Button variant="primary" icon={<Save size={16} />} loading={saving} onClick={handleClick}>
      Save device
    </Button>
  );
}
```

**Notes**

- Passing both `loading` and `disabled` is redundant but harmless — the button is disabled if either is truthy.
- `variant="cancel"` and `variant="danger"`/`variant="primary"` are the pairing used inside `ConfirmDialog`'s footer, so use the same combination for consistency in your own dialogs.

---

### `IconButton`

A round, icon-only button for toolbar actions (edit, delete, more-options, etc.) where a text label would be too heavy. It always sets `aria-label` and `title` from the `label` prop so icon-only buttons stay accessible.

**Import**
```jsx
import { IconButton } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `icon` | `ReactNode` | `undefined` | The icon element to render inside the circular button. |
| `label` | `string` | `undefined` | Used as both `aria-label` and `title` (tooltip on hover) — required for accessibility since there is no visible text. |
| `variant` | `'idle' \| 'active' \| 'danger'` | `'idle'` | `idle` is a muted icon that highlights on hover, `active` renders permanently highlighted (e.g. current filter/tab), `danger` tints the icon red. |
| `size` | `'xs' \| 'sm' \| 'md'` | `'md'` | Button diameter: `xs` ≈ 36px (26px desktop), `sm` ≈ 40px (30px desktop), `md` ≈ 44px (32px desktop). |
| `className` | `string` | `undefined` | Extra classes merged onto the root `<button>`. |
| `...props` | `any` | — | Spread onto the `<button>` (e.g. `onClick`, `disabled`). |

`IconButton` forwards its `ref` to the underlying `<button>`.

**Example**
```jsx
import { IconButton } from 'my Design System';
import { Pencil, Trash2 } from 'lucide-react';

function DeviceRowActions({ device, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-1">
      <IconButton icon={<Pencil size={16} />} label="Edit device" onClick={() => onEdit(device)} />
      <IconButton
        icon={<Trash2 size={16} />}
        label="Delete device"
        variant="danger"
        onClick={() => onDelete(device)}
      />
    </div>
  );
}
```

**Notes**

- Because `label` drives `aria-label`, always pass a descriptive label even though no text is visible — screen readers rely on it entirely.

---

### `FloatingAddButton`

A fixed-position circular "+" button pinned to the bottom-right corner of the viewport, used as the primary "create new" action on list/table pages (mobile-first FAB pattern).

**Import**
```jsx
import { FloatingAddButton } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | `'"Add"'` | Used as `aria-label` and `title`. The button itself always shows a `Plus` icon, not text. |
| `className` | `string` | `undefined` | Extra classes merged onto the root `<button>`. |
| `...props` | `any` | — | Spread onto the `<button>` (e.g. `onClick`). |

`FloatingAddButton` forwards its `ref` to the underlying `<button>`.

**Example**
```jsx
import { useState } from 'react';
import { FloatingAddButton } from 'my Design System';
import { Modal } from 'my Design System';

function DeviceListPage() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      {/* ...device table... */}
      <FloatingAddButton label="Add device" onClick={() => setAddOpen(true)} />
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add device" size="md">
        {/* form fields */}
      </Modal>
    </>
  );
}
```

**Notes**

- The button is `position: fixed` at `bottom-4 right-4` (larger offset `bottom-6 right-6` from the `sm` breakpoint up) with a high `z-40` stacking order — only render one per page/view to avoid overlapping FABs.

---

### `ToggleButtonGroup`

A minimal, unstyled-label segmented control rendered as a row of connected tab-like buttons, used for small binary/ternary switches (e.g. "Grid / List" view toggles) where you don't need a `FormGroup` label wrapper.

**Import**
```jsx
import { ToggleButtonGroup } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `options` | `Array<{ value: string, label: ReactNode }>` | — (required) | The list of choices rendered as buttons, in order. |
| `value` | `string` | — (required) | The currently selected option's `value`. Matched by strict equality against each `opt.value`. |
| `onChange` | `(value: string) => void` | — (required) | Called with the clicked option's `value` when a button is pressed. |
| `className` | `string` | `undefined` | Extra classes merged onto the root container (`role="tablist"`). |

**Example**
```jsx
import { useState } from 'react';
import { ToggleButtonGroup } from 'my Design System';

function DeviceViewToggle() {
  const [view, setView] = useState('grid');

  return (
    <ToggleButtonGroup
      options={[
        { value: 'grid', label: 'Grid' },
        { value: 'list', label: 'List' },
      ]}
      value={view}
      onChange={setView}
    />
  );
}
```

**Notes**

- This is a fully controlled component — it has no internal state, so `value` must be supplied from the parent and updated in `onChange`, or the selection will never visually change.
- Renders `role="tablist"` / `role="tab"` with `aria-selected`, so it's intended for tab-like switching UI rather than a generic multi-select.

---

### `SegmentedControl`

A labeled segmented control (pill-style toggle group) that wraps its buttons in the shared `FormGroup` layout, so it comes with an optional field label, required-marker, and inline error/hint text — use it inside forms where `ToggleButtonGroup` would otherwise need a hand-built label.

**Import**
```jsx
import { SegmentedControl } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | `undefined` | Optional field label rendered above the control via `FormGroup`. |
| `required` | `boolean` | `undefined` | Shows a red `*` after the label (only used when `requiredText` is not set). |
| `requiredText` | `string` | `undefined` | Custom required badge text (e.g. `"(required)"`) shown after the label instead of the `*`. |
| `error` | `string` | `undefined` | Error message rendered below the control via `FormGroup`'s `ValidationMessage`. |
| `options` | `Array<{ value: string, label: ReactNode }> \| Array<string>` | `[]` | Options can be objects with `value`/`label`, or plain strings (in which case the string itself is used as both value and label). |
| `value` | `string` | `undefined` | The currently selected option's value. |
| `onChange` | `(value: string) => void` | `() => {}` | Called with the clicked option's value. |
| `className` | `string` | `undefined` | Extra classes merged onto the outer `FormGroup` container. |

**Example**
```jsx
import { useState } from 'react';
import { SegmentedControl } from 'my Design System';

function DateModeField() {
  const [mode, setMode] = useState('issue');

  return (
    <SegmentedControl
      label="Date type"
      required
      options={[
        { value: 'issue', label: 'Issue Date' },
        { value: 'activation', label: 'Activation Date' },
      ]}
      value={mode}
      onChange={setMode}
    />
  );
}
```

**Notes**

- Like `ToggleButtonGroup`, this is fully controlled — `value` and `onChange` must be wired up by the parent.
- `options` can be a simple array of strings (`['A', 'B']`) when the value and display label are identical, or an array of `{ value, label }` objects when they differ.

---

### `CopyButton`

A small icon button that copies text to the clipboard and shows a tooltip that flips from "Copy to clipboard" to "Copied!" (with a checkmark icon) for two seconds. Use it anywhere a device ID, token, or other value needs a one-click copy affordance.

**Import**
```jsx
import { CopyButton } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `text` | `string` | `undefined` | The text to copy. Takes precedence over `value` when both are given (`text ?? value ?? ''`). |
| `value` | `string` | `undefined` | Alternative prop name for the text to copy, used if `text` is not provided. |
| `label` | `string` | `undefined` | Optional visible text label rendered next to the icon. Also used as the `aria-label` fallback when `tooltipText` isn't otherwise descriptive. |
| `onCopy` | `(copiedText: string) => void` | `undefined` | Called with the copied string right after a successful copy. |
| `size` | `number` | `14` | Icon size in pixels for both the `Copy` and `Check` icons. |
| `tooltipText` | `string` | `'"Copy to clipboard"'` | Tooltip content shown before copying. |
| `copiedText` | `string` | `'"Copied!"'` | Tooltip content shown for 2 seconds after a successful copy. |
| `className` | `string` | `undefined` | Extra classes merged onto the button. |
| `...props` | `any` | — | Spread onto the `<button>`. |

There is also a convenience export, `CopyableText`, from the same file:

| Prop | Type | Default | Description |
|---|---|---|---|
| `text` | `string` | — (required) | Text displayed (in monospace) and copied. |
| `truncate` | `boolean` | `true` | Truncates the displayed text with an ellipsis when it overflows. |
| `className` | `string` | `undefined` | Extra classes on the wrapping container. |
| `size` | `number` | `14` | Icon size passed through to the internal `CopyButton`. |

**Example**
```jsx
import { CopyButton, CopyableText } from 'my Design System';

function DeviceIdCell({ device }) {
  return (
    <div className="flex items-center gap-2">
      {/* Icon-only copy button */}
      <CopyButton text={device.imei} onCopy={(copied) => console.log('copied', copied)} />

      {/* Or the text + built-in copy button combo */}
      <CopyableText text={device.imei} />
    </div>
  );
}
```

**Notes**

- If the Clipboard API isn't available (older browsers / non-secure contexts), `CopyButton` falls back to a hidden `<textarea>` + `document.execCommand('copy')`.
- Clicking the button calls `stopPropagation()`/`preventDefault()` on the click event first, so it's safe to place a `CopyButton` inside a clickable table row without also triggering the row's click handler.
- If both `text` and `value` resolve to an empty/falsy string, clicking does nothing (no copy attempt, no callback).

---

## Form Inputs

Standard form field components — labeled inputs, dropdowns, date pickers, and the shared validation/layout scaffolding they all sit on top of.

### `InputField`

A standard labeled text input with optional icon, hint text, and validation error display. Reach for this any time you need a basic single-line text/number/email/etc. field wrapped in the shared form-field chrome (label, required marker, hint, error).

**Import**
```jsx
import { InputField } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Field label rendered above the input. |
| `required` | `boolean` | — | Shows a `*` next to the label. Ignored (not shown) if `requiredText` is set. |
| `requiredText` | `string` | — | Custom text badge shown instead of the `*` (e.g. `"(required)"`). |
| `error` | `string` | — | Validation error text. Renders below the input and switches the border to the error color; also sets `aria-invalid`. |
| `hint` | `string` | — | Helper text shown below the input. Hidden automatically whenever `error` is set. |
| `icon` | `ReactNode` | — | Icon rendered inside the input on the left; adds left padding to the input automatically. |
| `id` | `string` | auto-generated via `React.useId()` | Input `id` (and label `htmlFor`). Supply your own if you need to reference it elsewhere. |
| `className` | `string` | — | Extra classes merged onto the `<input>` element itself. |
| `ref` | `Ref<HTMLInputElement>` | — | Forwarded to the underlying `<input>`. |
| `...props` | any | — | All other props (e.g. `value`, `onChange`, `type`, `placeholder`, `disabled`, `name`) are spread directly onto the native `<input>`. |

**Example**
```jsx
import { useState } from 'react';
import { InputField } from 'my Design System';

function ProfileForm() {
  const [name, setName] = useState('');

  return (
    <InputField
      label="Full name"
      required
      placeholder="Jane Doe"
      value={name}
      onChange={(e) => setName(e.target.value)}
      error={name.trim() === '' ? 'Name is required' : undefined}
      hint="This is how your name will appear on reports."
    />
  );
}
```

**Notes**

`InputField` is a fully uncontrolled-passthrough component for `value`/`onChange` — it does not manage its own value state, so you must supply both (or neither, for an uncontrolled input with `defaultValue`). Since it's built with `React.forwardRef`, you can pass a `ref` straight through to the native `<input>` for focus management.

---

### `InputGroup`

A text input with optional left/right "addon" content (a currency symbol, unit label, icon button, etc.) attached to its edges, useful for fields like `"₹ 1000"` or `"3 Days"`. Unlike `InputField`, `value`/`onChange`/`type` are named props rather than pass-through spread props.

**Import**
```jsx
import { InputGroup } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Field label rendered above the input. |
| `required` | `boolean` | — | Shows a `*` next to the label (unless `requiredText` is set). |
| `requiredText` | `string` | — | Custom required-state badge text. |
| `error` | `string` | — | Validation error text rendered below the field; also switches the border color. |
| `addonLeft` | `ReactNode` | — | Content rendered in a bordered box on the left edge (e.g. `"₹"`). |
| `addonRight` | `ReactNode` | — | Content rendered in a bordered box on the right edge (e.g. `"Days"` or an icon button). |
| `value` | `string \| number` | — | Current input value. Internally coalesced to `""` if `null`/`undefined` so the input always stays controlled. |
| `onChange` | `(event) => void` | `() => {}` | Native change handler; receives the raw DOM change event (read `event.target.value`). |
| `placeholder` | `string` | — | Placeholder text. |
| `type` | `string` | `"text"` | Native input `type` attribute. |
| `disabled` | `boolean` | — | Disables the input and dims/greys out the whole control. |
| `className` | `string` | — | Passed down to the outer `FormGroup` wrapper. |
| `id` | `string` | auto-generated via `React.useId()` | Input `id` / label `htmlFor`. |
| `ref` | `Ref<HTMLInputElement>` | — | Forwarded to the underlying `<input>`. |
| `...props` | any | — | Any other native input attributes are spread onto the `<input>`. |

**Example**
```jsx
import { useState } from 'react';
import { InputGroup } from 'my Design System';

function LeaveForm() {
  const [days, setDays] = useState('');

  return (
    <InputGroup
      label="Duration"
      type="number"
      value={days}
      onChange={(e) => setDays(e.target.value)}
      addonRight="Days"
      placeholder="0"
    />
  );
}
```

**Notes**

Because `onChange` here receives the raw DOM event (not the value directly), it differs from components like `MultiSelectDropdown` or `DynamicRowList` whose `onChange` hands back a plain value/array — always check the specific component's signature before wiring it up.

---

### `PasswordInput`

A password field with a built-in show/hide toggle button (eye icon). Use it anywhere you'd use `InputField` but for password entry.

**Import**
```jsx
import { PasswordInput } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Field label. |
| `required` | `boolean` | — | Shows a `*` next to the label. |
| `error` | `string` | — | Validation error text rendered below the field. |
| `hint` | `string` | — | Helper text, hidden when `error` is present. |
| `icon` | `ReactNode` | — | Optional leading icon (e.g. `<Lock size={16} />`), same slot pattern as `InputField`. Automatically adds left padding to the input. The show/hide toggle stays pinned on the right regardless. |
| `id` | `string` | auto-generated via `React.useId()` | Input `id` / label `htmlFor`. |
| `className` | `string` | — | Extra classes merged onto the `<input>` element. |
| `ref` | `Ref<HTMLInputElement>` | — | Forwarded to the underlying `<input>`. |
| `...props` | any | — | Spread onto the native `<input>` (e.g. `value`, `onChange`, `name`, `placeholder`, `autoComplete`). Note: `type` is controlled internally and cannot be overridden. |

**Example**
```jsx
import { useState } from 'react';
import { PasswordInput, PasswordStrengthMeter } from 'my Design System';

function SignupPasswordField() {
  const [password, setPassword] = useState('');

  return (
    <div>
      <PasswordInput
        label="Password"
        required
        placeholder="Enter a strong password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="new-password"
      />
      <PasswordStrengthMeter password={password} />
    </div>
  );
}
```

**Notes**

Visibility state (`visible`) is purely internal `useState` — there's no prop to control it from outside. The toggle button has `aria-label="Show password"`/`"Hide password"` depending on state, so it's screen-reader friendly out of the box.

---

### `PasswordStrengthMeter`

A small visual strength bar + label ("Weak" / "Medium" / "Strong") that scores a password string. Pair it directly under a `PasswordInput` to give users live feedback while typing.

**Import**
```jsx
import { PasswordStrengthMeter } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `password` | `string` | — | The password value to score. If falsy (empty string, `undefined`, etc.), the component renders `null` (nothing). |
| `className` | `string` | — | Extra classes merged onto the outer wrapper `div`. |

**Example**
```jsx
import { useState } from 'react';
import { PasswordInput, PasswordStrengthMeter } from 'my Design System';

function ChangePasswordForm() {
  const [password, setPassword] = useState('');

  return (
    <>
      <PasswordInput label="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <PasswordStrengthMeter password={password} />
    </>
  );
}
```

**Notes**

The scoring is a simple heuristic, not a cryptographic strength check: it awards one point each for length ≥ 8, length ≥ 12, having both upper and lower case letters, containing a digit, and containing a special character (max score 5). A score of 0–1 is "Weak", 2–3 is "Medium", 4–5 is "Strong". This is client-side UX guidance only — enforce real password policy on the server.

---

### `Checkbox`

A styled checkbox with an optional inline label, built on a visually-hidden native `<input type="checkbox">` for full accessibility and keyboard support.

**Import**
```jsx
import { Checkbox } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Optional label text rendered to the right of the box. |
| `checked` | `boolean` | — | Whether the checkbox is checked. This component is fully controlled — you must manage this state yourself and update it in `onChange`. |
| `id` | `string` | auto-generated via `React.useId()` | Checkbox `id` (and the wrapping `<label>`'s `htmlFor`). |
| `className` | `string` | — | Extra classes merged onto the visible box `<span>` (not the wrapper). |
| `ref` | `Ref<HTMLInputElement>` | — | Forwarded to the native `<input type="checkbox">`. |
| `...props` | any | — | Spread onto the native checkbox input (e.g. `onChange`, `disabled`, `name`, `value`). |

**Example**
```jsx
import { useState } from 'react';
import { Checkbox } from 'my Design System';

function NotifyToggle() {
  const [notify, setNotify] = useState(true);

  return (
    <Checkbox
      label="Email me when this device goes offline"
      checked={notify}
      onChange={(e) => setNotify(e.target.checked)}
    />
  );
}
```

**Notes**

Since `checked` has no default value, always pass it explicitly — otherwise React will treat the underlying `<input>` as uncontrolled and warn if you later start passing `checked`. The whole clickable area is the `<label>`, so clicking the text also toggles the box.

---

### `Dropdown`

A single-select dropdown with a searchable option list, keyboard navigation (arrow keys, Enter, Escape), and click-outside-to-close behavior. Use it for a standard "pick one from a static list" field. If you pass `fetchOptions`, it transparently delegates to `AsyncDropdown` instead, so the same component works for both static and remote-backed data.

**Import**
```jsx
import { Dropdown } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Field label. |
| `required` | `boolean` | — | Shows a `*` next to the label. |
| `requiredText` | `string` | — | Custom required-state badge text. |
| `error` | `string` | — | Validation error text rendered below the field. |
| `options` | `Array<{ value, label, disabled? }>` | 3 built-in placeholder options (`option1`/`option2`/`option3`) | The list of selectable options. **You almost always want to pass your own list** — the default is only a boilerplate fallback. |
| `fetchOptions` | `(query: string) => Promise<Array<{value,label}>>` | — | If provided, `Dropdown` renders `AsyncDropdown` instead of the static list, forwarding `label`, `value`, `onChange`, `placeholder`, `disabled`, `className` to it. See `AsyncDropdown` below for the async contract. |
| `value` | `string \| number` | — | Currently selected option's `value`. |
| `onChange` | `(value) => void` | `() => {}` | Called with the selected option's raw `value` (not the whole option object) when the user picks an item. |
| `placeholder` | `string` | `"Select..."` | Text shown in the trigger button when nothing is selected. |
| `searchable` | `boolean` | `true` | Whether to show the in-panel search box and filter `options` by label (case-insensitive substring match). Has no effect in async mode (search is always shown there). |
| `disabled` | `boolean` | — | Disables the trigger button. |
| `className` | `string` | — | Passed to the outer `FormGroup` wrapper. |

**Example**
```jsx
import { useState } from 'react';
import { Dropdown } from 'my Design System';

function DeviceStatusFilter() {
  const [status, setStatus] = useState('online');

  return (
    <Dropdown
      label="Status"
      options={[
        { value: 'online', label: 'Online' },
        { value: 'offline', label: 'Offline' },
        { value: 'maintenance', label: 'Maintenance', disabled: true },
      ]}
      value={status}
      onChange={setStatus}
      placeholder="Select a status"
    />
  );
}
```

**Notes**

Every time the dropdown is reopened, its internal keyboard-focus index resets to `0`, so a stale highlight left over from a previous open (e.g. from arrowing down to item 5 last time) never carries over into the next open — the option under Enter always matches what's visually highlighted. Keyboard support: when closed, `ArrowDown`/`ArrowUp`/`Enter`/`Space` opens the panel; when open, `ArrowUp`/`ArrowDown` move the highlight, `Enter` selects the highlighted (non-disabled) option, and `Escape` closes it.

---

### `MultiSelectDropdown`

A multi-select dropdown that renders chosen options as removable "chip" tags inside the trigger, with a checkbox list and search. Like `Dropdown`, passing `fetchOptions` switches it to remote/async mode (`AsyncMultiSelectDropdown`) automatically.

Its menu is portalled to `document.body` and positioned `fixed` against the trigger — identical to `Dropdown`, so the two look and stack the same when they sit side by side in one form or filter panel. That is what lets it open over a scrolling panel, a modal or a table cell instead of being clipped by that ancestor's `overflow`. The menu carries `data-portal-popover="true"`, which any outside-click-to-close container should treat as inside: visually the menu *is* inside, it only left the DOM subtree to avoid being clipped.

**Import**
```jsx
import { MultiSelectDropdown } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Field label. |
| `required` | `boolean` | — | Shows a `*` next to the label. |
| `error` | `string` | — | Validation error text. |
| `options` | `Array<{ value, label }>` | 3 built-in placeholder options (`opt1`/`opt2`/`opt3`) | The selectable option list in static mode. |
| `fetchOptions` | `(query: string) => Promise<Array<{value,label}>>` | — | If provided, renders `AsyncMultiSelectDropdown` instead, forwarding `label`, `value`, `onChange`, `placeholder`, `className`. |
| `value` | `Array<string \| number> \| null \| undefined` | `[]` | Currently selected values. **Accepts `null` as well as `undefined`** — internally normalized to `[]` (`safeValue`) whenever it isn't an array, so it's safe to pass `value={null}` (e.g. from an API field that hasn't loaded yet) without the component crashing. |
| `onChange` | `(nextValues: Array) => void` | `() => {}` | Called with the *entire* next array of selected values whenever an option is toggled on/off or a chip is removed. |
| `placeholder` | `string` | `"Select..."` | Text shown when no options are selected. |
| `className` | `string` | — | Passed to the outer `FormGroup` wrapper. |

**Example**
```jsx
import { useState } from 'react';
import { MultiSelectDropdown } from 'my Design System';

function TagsField() {
  const [tags, setTags] = useState(null); // null is fine — normalized to []

  return (
    <MultiSelectDropdown
      label="Tags"
      options={[
        { value: 'critical', label: 'Critical' },
        { value: 'battery-low', label: 'Battery Low' },
        { value: 'firmware', label: 'Firmware' },
      ]}
      value={tags}
      onChange={setTags}
      placeholder="Choose tags..."
    />
  );
}
```

**Notes**

Because `onChange` always receives the full updated array (not a single toggled value), the simplest wiring is `onChange={setTags}` as shown above. Passing `value={null}` used to be unsafe in older versions of this component; it is now handled safely and treated the same as an empty array.

---

### `AsyncDropdown`

A single-select dropdown whose options come from a remote/async source instead of a static array, with debounced search-as-you-type and a loading/error/empty state built in. `Dropdown` renders this automatically when you give it a `fetchOptions` prop, but you can also use it directly if you want its slightly different visual style or its two-argument `onChange`.

**Import**
```jsx
import { AsyncDropdown } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `loadOptions` | `(searchQuery: string) => Promise<Array<{value,label}> \| { options: [...] } \| { data: [...] }>` | — | **Required.** Called to fetch options. Receives the current search-box text (an empty string on first open). Return either a plain array of `{ value, label }` objects, or an object with an `options` or `data` array property — all three shapes are accepted. |
| `value` | `string \| number` | — | Currently selected value. |
| `onChange` | `(selectedValue, selectedOption \| null) => void` | — | Called with the raw selected `value` **and** the full matched option object (or `(null, null)` when the user clicks the clear "×" button). |
| `label` | `string` | — | Field label, rendered as a small uppercase caption above the trigger (this component does not use `FormGroup`, so there's no built-in error/hint row). |
| `placeholder` | `string` | `"Select an option..."` | Text shown when nothing is selected. |
| `debounceMs` | `number` | `300` | Debounce delay (ms) between the user typing in the search box and `loadOptions` being called. |
| `disabled` | `boolean` | `false` | Disables the trigger button. |
| `className` | `string` | — | Extra classes on the outer wrapper. |

**Example**
```jsx
import { useState } from 'react';
import { AsyncDropdown } from 'my Design System';

function AssignDeviceOwner() {
  const [ownerId, setOwnerId] = useState(null);

  async function loadUsers(query) {
    const res = await fetch(`/api/users?search=${encodeURIComponent(query)}`);
    const users = await res.json();
    return users.map((u) => ({ value: u.id, label: u.fullName }));
  }

  return (
    <AsyncDropdown
      label="Assign to"
      loadOptions={loadUsers}
      value={ownerId}
      onChange={(value) => setOwnerId(value)}
      placeholder="Search users..."
    />
  );
}
```

**Notes**

Matching between `value` and the fetched options is done with `String(opt.value) === String(value)`, so numeric and string ids match interchangeably. Options are fetched once automatically the first time the panel opens (with an empty query), and again on every subsequent keystroke after the `debounceMs` delay; in-flight requests are tracked with a request-id ref so a slow, stale response can never overwrite a newer one. Fetch errors are caught and shown inline with a "Retry" button that re-runs `loadOptions` with the current search text.

---

### `AsyncMultiSelectDropdown`

The multi-select counterpart to `AsyncDropdown` — same debounced remote search and loading/error/empty states, but lets the user pick multiple items and shows a "N items selected" summary instead of chips. `MultiSelectDropdown` renders this automatically when given a `fetchOptions` prop.

**Import**
```jsx
import { AsyncMultiSelectDropdown } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `loadOptions` | `(searchQuery: string) => Promise<Array<{value,label}> \| { options: [...] } \| { data: [...] }>` | — | **Required.** Same fetch contract as `AsyncDropdown.loadOptions` — called with the current search text; accepts a bare array or an object with `.options`/`.data`. |
| `value` | `Array<string \| number>` | `[]` | Currently selected values. |
| `onChange` | `(nextValues: Array) => void` | — | Called with the full next array of selected values, both when toggling an option and when clicking "clear all" (called with `[]`). |
| `label` | `string` | — | Field label caption above the trigger (no `FormGroup`/error row here either). |
| `placeholder` | `string` | `"Select items..."` | Text shown when nothing is selected. |
| `debounceMs` | `number` | `300` | Debounce delay (ms) for search-triggered fetches. |
| `disabled` | `boolean` | `false` | Disables the trigger button. |
| `className` | `string` | — | Extra classes on the outer wrapper. |

**Example**
```jsx
import { useState } from 'react';
import { AsyncMultiSelectDropdown } from 'my Design System';

function AssignDeviceGroups() {
  const [groupIds, setGroupIds] = useState([]);

  async function loadGroups(query) {
    const res = await fetch(`/api/groups?search=${encodeURIComponent(query)}`);
    return res.json(); // -> [{ value, label }, ...]
  }

  return (
    <AsyncMultiSelectDropdown
      label="Device groups"
      loadOptions={loadGroups}
      value={groupIds}
      onChange={setGroupIds}
      placeholder="Search groups..."
    />
  );
}
```

**Notes**

Selection comparisons are done as strings internally (`String(value)`), so mixed numeric/string ids work fine, but the array you get back in `onChange` preserves whatever type each option's `value` originally was (numbers stay numbers, from `[...value, optValue]`). Fetching behavior (debounce, initial fetch on open, stale-response discarding, retry-on-error) mirrors `AsyncDropdown` exactly.

---

### `DatePicker`

A single date (or date+time) field that opens the browser's native date picker UI, dressed up with the library's shared input chrome and a calendar icon button. It also tolerates several incoming string formats and normalizes them for the native input.

**Import**
```jsx
import { DatePicker } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Field label. |
| `required` | `boolean` | — | Shows a `*` next to the label. |
| `requiredText` | `string` | — | Custom required-state badge text. |
| `error` | `string` | — | Validation error text. |
| `value` | `string \| ""` | — | The date value. Accepts: a plain `"YYYY-MM-DD"` (or ISO `"YYYY-MM-DDTHH:mm..."`, which gets its time portion stripped when `showTime` is false) string, or a custom `"DD-MMM-YYYY"` / `"DD-MMM-YYYY HH:mm:ss"` string (e.g. `"30-Jul-2026 17:32:30"`), which is converted internally to the `YYYY-MM-DD`/`YYYY-MM-DDTHH:mm` shape the native input requires. Falsy values render as an empty field. |
| `onChange` | `(value: string) => void` | `() => {}` | Called with the raw native `<input>` value string, i.e. `"YYYY-MM-DD"` for a date, or `"YYYY-MM-DDTHH:mm"` for a datetime-local — **not** a `Date` object. |
| `showTime` | `boolean` | `false` | When `true`, uses a `datetime-local` native input (date + time) instead of a plain `date` input. |
| `type` | `string` | derived (`"date"` or `"datetime-local"`) | Overrides the native input `type` outright if you need something else; otherwise it's computed from `showTime`. |
| `iconPosition` | `"left" \| "right"` | `"right"` | Which side the calendar icon renders on. When `"right"`, the icon is a clickable button that also opens the picker; when `"left"`, it's purely decorative and the picker opens by clicking anywhere in the field. |
| `min` | `string` | — | Native `min` attribute (`YYYY-MM-DD` or `YYYY-MM-DDTHH:mm`). Overrides the auto-computed `disablePastDates` minimum if supplied. |
| `max` | `string` | — | Native `max` attribute. |
| `disabled` | `boolean` | — | Disables the field and the calendar button. |
| `disablePastDates` | `boolean` | `true` | When `true` (the default) and `min` isn't explicitly set, automatically sets `min` to today's date, preventing selection of past dates. |
| `className` | `string` | — | Passed to the outer `FormGroup` wrapper. |

**Example**
```jsx
import { useState } from 'react';
import { DatePicker } from 'my Design System';

function ScheduleMaintenanceForm() {
  const [scheduledFor, setScheduledFor] = useState('');

  return (
    <DatePicker
      label="Scheduled date"
      required
      showTime
      value={scheduledFor}
      onChange={setScheduledFor}
      disablePastDates
    />
  );
}
```

**Notes**

`disablePastDates` defaults to `true`, which is a change worth knowing about if you need to allow past-dated entries (e.g. a "device installed on" field) — pass `disablePastDates={false}` explicitly. Clicking anywhere in the field body opens the native picker via `showPicker()` (falling back to `.focus()` in browsers that don't support `showPicker`). `DatePicker` is also exported under the alias `DayDatePicker` (same component, same props).

---

### `DateRangePicker`

A two-month calendar popover for picking a `from`/`to` date range, with a sidebar of common presets (This Month, Last Month, This Quarter, This Year, financial year, etc.) and Apply/Clear/Cancel actions so changes are staged until confirmed.

**Import**
```jsx
import { DateRangePicker } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Field label. |
| `required` | `boolean` | — | Shows a `*` next to the label. |
| `requiredText` | `string` | — | Custom required-state badge text. |
| `error` | `string` | — | Validation error text. |
| `value` | `{ from, to } \| "DD-MMM-YYYY - DD-MMM-YYYY"` | — | The **current** API. Each of `from`/`to` may be a `Date` object, a timestamp (`number`), or a string — including a plain `"YYYY-MM-DD"` (parsed using local date components, not `new Date(str)`, so it can't shift a day backward in timezones behind UTC), a `"DD-MMM-YYYY"` string, or an already-formatted `"DD-MMM-YYYY"`/`"YYYY-MM-DD"`-ish value. You may alternatively pass a single combined string like `"31-Jul-2026 - 05-Aug-2026"` (split on `" - "`). |
| `startDate` / `endDate` | `Date \| string \| number` | — | **Legacy** two-prop API, kept for backward compatibility. If either is provided (and `value` is not), the component builds `{ from: startDate, to: endDate }` internally and — importantly — calls `onChange(from, to)` with two positional arguments instead of one object (see `onChange` below). |
| `onChange` | `({from, to}) => void` **or** `(from, to) => void` | `() => {}` | Called when the user clicks **Apply** or **Clear**. Shape depends on which API you're using: if you passed `value`, you get a single `{ from, to }` object (both `Date` objects, or `null`/`null` after Clear); if you used the legacy `startDate`/`endDate` props, you get two positional arguments `(from, to)` instead. |
| `disablePastDates` | `boolean` | `false` | Disables calendar days before today in both month grids. |
| `className` | `string` | — | Passed to the outer `FormGroup` wrapper. |

**Example**
```jsx
import { useState } from 'react';
import { DateRangePicker } from 'my Design System';

function ReportRangeFilter() {
  const [range, setRange] = useState({ from: null, to: null });

  return (
    <DateRangePicker
      label="Report period"
      value={range}
      onChange={setRange}
      disablePastDates={false}
    />
  );
}
```

**Notes**

Selections are staged: clicking days updates internal `pending` state only, and nothing is committed to your `onChange` until the user clicks **Apply** (or **Clear**, which commits `{ from: null, to: null }`). The **Apply** button is disabled until at least a `from` date is picked. Picking a preset from the sidebar (e.g. "This Month") immediately stages that computed range without needing manual day clicks. Watch the `onChange` signature carefully — it differs between the `value` API (which takes a `{ from, to }` object) and the legacy `startDate`/`endDate` API; mixing them up is the most common integration mistake.

---

### `SearchBox`

A compact search input with a leading search icon, a clear ("×") button that appears once there's text, an optional filter-trigger icon button, and an optional `⌘K`/`Ctrl+K` keyboard shortcut to focus it.

**Import**
```jsx
import { SearchBox } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | — | Current search text (coalesced to `""` if `null`/`undefined`). |
| `onChange` | `(value: string) => void` | — | Called with the new text string directly (not an event) on every keystroke, on clicking the clear button (`onChange("")`), and on pressing `Escape` (`onChange("")`, which also blurs the input). |
| `onFilterClick` | `() => void` | — | If provided, renders a filter (sliders) icon button on the right that calls this when clicked. Omit it to hide the button entirely. |
| `placeholder` | `string` | `"Search Data"` | Placeholder text. |
| `enableShortcut` | `boolean` | `true` | Whether `Ctrl+K` (Windows/Linux) or `⌘K` (Mac) globally focuses and selects this input's text. |
| `showShortcutKey` | `boolean` | `true` | Whether to display the little `⌘K`/`Ctrl+K` badge inside the box (only shown when the box is empty and `enableShortcut` is true). Purely cosmetic — set to `false` to hide the badge while keeping the shortcut itself active. |
| `className` | `string` | — | Extra classes on the outer wrapper `div`. |
| `ref` | `Ref<HTMLInputElement>` | — | Forwarded to the native `<input>`. |
| `...props` | any | — | Any other native input attributes are spread onto the `<input>` (note: a custom `onKeyDown` you pass is still called after the component's own `Escape` handling runs). |

**Example**
```jsx
import { useState } from 'react';
import { SearchBox } from 'my Design System';

function DeviceListToolbar() {
  const [query, setQuery] = useState('');

  return (
    <SearchBox
      value={query}
      onChange={setQuery}
      onFilterClick={() => console.log('open filters panel')}
      placeholder="Search devices..."
    />
  );
}
```

**Notes**

The Mac-vs-Windows keyboard badge is detected client-side via `React.useSyncExternalStore` (returning `false` during SSR/server render, so it won't mismatch on hydration). Since `onChange` here hands back a plain string rather than an event, this component's callback signature is closer to `MultiSelectDropdown`/`Dropdown` than to `InputField`/`InputGroup`.

---

### `FormGroup`

The shared layout wrapper used internally by nearly every field component in this library (`InputField`, `InputGroup`, `PasswordInput`, `Dropdown`, `DatePicker`, `DateRangePicker`, etc.): it renders the label row (with required marker), your field control, an optional hint, and a validation error message. Use it directly when building a custom field that isn't already covered by one of the built-in inputs.

**Import**
```jsx
import { FormGroup } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Label text. If omitted, no label row is rendered at all. |
| `htmlFor` | `string` | — | `id` of the control the label points to (sets the label's `htmlFor`). |
| `required` | `boolean` | — | Shows a `*` after the label. Ignored visually if `requiredText` is set. |
| `requiredText` | `string` | — | Custom required-state badge shown instead of the `*`. |
| `error` | `string` | — | Passed straight through to an internal `ValidationMessage`; renders the error row (with alert icon) below `children` when truthy. |
| `hint` | `string` | — | Helper text shown below `children`, but only when `error` is not set. |
| `className` | `string` | — | Extra classes on the outer wrapper `div`. |
| `children` | `ReactNode` | — | The actual field control(s) to render between the label and the hint/error row. |
| `...props` | any | — | Spread onto the outer wrapper `div` (e.g. `style`, `data-*` attributes). |

**Example**
```jsx
import { FormGroup } from 'my Design System';

function CustomColorSwatchField({ color, onChange, error }) {
  return (
    <FormGroup label="Brand color" required error={error}>
      <input type="color" value={color} onChange={(e) => onChange(e.target.value)} />
    </FormGroup>
  );
}
```

**Notes**

`FormGroup` doesn't manage any state or validation logic itself — it's purely presentational scaffolding. Its `error`/`hint` mutual-exclusivity (hint is hidden whenever `error` is truthy) is the same behavior you'll see reflected across every field component built on top of it.

---

### `ValidationMessage`

The small red error line (alert-circle icon + text) used under form fields throughout the library. Renders nothing at all if there's no message, so it's safe to always render unconditionally with a possibly-empty `error` value.

**Import**
```jsx
import { ValidationMessage } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | The error message content. If falsy (`undefined`, `null`, `""`, `false`), the component renders `null` — nothing is output, not even an empty wrapper. |
| `className` | `string` | — | Extra classes merged onto the `<p>` element. |
| `...props` | any | — | Spread onto the `<p>` element (e.g. `id`, `role`, `data-*`). |

**Example**
```jsx
import { ValidationMessage } from 'my Design System';

function CustomField({ error, children }) {
  return (
    <div>
      {children}
      <ValidationMessage>{error}</ValidationMessage>
    </div>
  );
}
```

**Notes**

This is the same component `FormGroup` uses internally for its `error` prop, so most of the time you won't need to reach for `ValidationMessage` directly — only when building a fully custom field layout that doesn't go through `FormGroup`.

---

### `FormModal`

A `Modal` preconfigured as a form dialog: it wraps its `children` in a `<form>` element, wires the form's submit event (and a primary footer button) to your `onSubmit`, and gives you a standard Cancel/Submit footer with loading and disabled states for free.

**Import**
```jsx
import { FormModal } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | Whether the modal is visible. When `false`, nothing is rendered (no portal, no DOM nodes). |
| `onClose` | `() => void` | — | Called when the backdrop, the header × button, the Cancel button, or `Escape` is used to dismiss the modal. |
| `onSubmit` | `() => void` | — | Called both when the Submit footer button is clicked and when the inner `<form>`'s native submit fires (e.g. pressing Enter in a text field) — `preventDefault()` is called on the form submit automatically, so it won't reload the page. |
| `title` | `string` | — | Modal header title. If omitted, no header row (and no × button) is rendered. |
| `size` | `"sm" \| "md" \| "lg" \| "xl"` | `"md"` | Controls the modal's max width (`sm` ~384px, `md` ~448px, `lg` ~576px, `xl` ~768px). |
| `submitLabel` | `string` | `"Ok"` | Text on the primary (submit) footer button. |
| `cancelLabel` | `string` | `"Close"` | Text on the secondary (cancel) footer button. |
| `submitting` | `boolean` | — | When `true`, shows a loading spinner on the Submit button and disables the Cancel button (prevents closing mid-submit). |
| `submitDisabled` | `boolean` | — | Disables the Submit button independently of `submitting` (e.g. while the form is invalid). |
| `children` | `ReactNode` | — | Form field contents, laid out in a vertical flex column with gaps. |

**Example**
```jsx
import { useState } from 'react';
import { FormModal, InputField } from 'my Design System';

function AddDeviceModal({ open, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await fetch('/api/devices', { method: 'POST', body: JSON.stringify({ name }) });
      onCreated();
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Add device"
      submitLabel="Create"
      submitting={submitting}
      submitDisabled={name.trim() === ''}
    >
      <InputField label="Device name" required value={name} onChange={(e) => setName(e.target.value)} />
    </FormModal>
  );
}
```

**Notes**

`FormModal` is built on top of the base `Modal` component, so it also inherits the "only the top-most modal closes on Escape" stacking behavior — safe to open a `ConfirmDialog` (or another modal) on top of a `FormModal` without it accidentally closing the form underneath. Because `onSubmit` takes no arguments, read your form field values from your own component state (as in the example) rather than expecting a submit event or form-data object to be passed in.

---

### `DynamicRowList`

Renders an editable list of rows (e.g. line items, contact entries) with an "Add row" button and a per-row remove button, delegating the actual row UI to a `renderRow` function you supply. Useful for "add multiple of X" form sections.

**Import**
```jsx
import { DynamicRowList } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `Array<object>` | `[]` | The current array of row data objects. |
| `onChange` | `(nextItems: Array) => void` | — | Called with the **full next array** any time a row is added, updated, or removed — this is your single hook for receiving updates from all three mutation paths. |
| `createItem` | `() => object` | — | **Required for the Add button to work.** Called (with no arguments) to produce a new blank row object when "Add row" is clicked; the result is appended to `items` and passed to `onChange`. |
| `renderRow` | `(item, index, updateRow) => ReactNode` | — | Renders each row's contents. Receives the row's data object, its index, and an `updateRow(patch)` callback that shallow-merges `patch` into that row (`{ ...item, ...patch }`) and calls `onChange` with the updated array. If omitted, rows render empty. |
| `addLabel` | `string` | `"Add row"` | Label text on the add button. |
| `minRows` | `number` | `0` | The remove button for a row is disabled once `items.length <= minRows`, preventing the list from shrinking below this size. |
| `className` | `string` | — | Extra classes on the outer wrapper `div`. |

**Example**
```jsx
import { useState } from 'react';
import { DynamicRowList, InputField } from 'my Design System';

function ContactsField() {
  const [contacts, setContacts] = useState([{ name: '', phone: '' }]);

  return (
    <DynamicRowList
      items={contacts}
      onChange={setContacts}
      createItem={() => ({ name: '', phone: '' })}
      minRows={1}
      addLabel="Add contact"
      renderRow={(item, index, updateRow) => (
        <div className="flex gap-2">
          <InputField
            placeholder="Name"
            value={item.name}
            onChange={(e) => updateRow({ name: e.target.value })}
          />
          <InputField
            placeholder="Phone"
            value={item.phone}
            onChange={(e) => updateRow({ phone: e.target.value })}
          />
        </div>
      )}
    />
  );
}
```

**Notes**

All three mutation paths — adding a row, updating a row via `updateRow(patch)`, and removing a row — consistently call `onChange?.(...)` with the resulting array, so `onChange` is the one place to hook in to persist or validate the list as a whole; there's no separate `onAdd`/`onRemove` callback. `DynamicRowList` itself holds no state — `items` must come from you (typically `useState` as shown above), making it a fully controlled component. Note that `createItem` is called with no arguments, so if new rows need to reference `items.length` or an id counter, compute that inside your own `createItem` closure.


---

## Data Display

### `Badge`

A small label used to show a status word or short tag (e.g. "Online", "Warning", "Live") inline with other content. Pill-shaped by default; see `shape` for the softly-rectangular variant a badge carrying a figure wants.

**Import**
```jsx
import { Badge } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `tone` | `"neutral" \| "online" \| "warn" \| "offline" \| "live" \| "accent"` | `"neutral"` | Selects the color scheme. Each tone maps to a themed background/text class pair (e.g. `online` uses the "status online" colors, `live` uses the "live" colors). |
| `shape` | `"pill" \| "control"` | `"pill"` | Corner radius. `pill` is fully rounded and suits a badge naming a **state** ("Active", "Expired"). `control` is the radius the scale gives buttons, inputs and tags (`--radius-control`, 8px) and suits one carrying a **figure** — a total or a count — where a fully-rounded chip reads softer than the number deserves. An unrecognised value falls back to `pill`. |
| `className` | `string` | `undefined` | Extra classes merged onto the root `<span>`. Note it is merged with `clsx`, **not** tailwind-merge — passing a `rounded-*` here will not replace the shape's own radius, it will sit alongside it and let stylesheet order pick the winner. Use `shape` instead. |
| `children` | `ReactNode` | — | The label content. |
| `...props` | `any` | — | All other props (e.g. `onClick`, `title`, `data-*`) are spread onto the root `<span>`. |

**Example**
```jsx
import { Badge } from 'my Design System';

function DeviceStatusBadge({ status }) {
  const toneByStatus = {
    ONLINE: 'online',
    OFFLINE: 'offline',
    DEGRADED: 'warn',
  };

  return <Badge tone={toneByStatus[status] || 'neutral'}>{status}</Badge>;
}
```

**Notes**

`tone` values that aren't one of the six known keys will resolve to `undefined` styling since `toneClasses[tone]` has no fallback — stick to the documented set.

---

### `Card`

A simple bordered, padded container with the library's card surface styling (background, border, shadow, rounded corners). Use it as the base wrapper for any block of content that should look like a "card" in the UI.

**Import**
```jsx
import { Card } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `padded` | `boolean` | `true` | When `true`, adds internal padding (`p-3` on small screens, `p-4` on `sm:` and up). Set to `false` for a card with no inner padding (e.g. when a child component supplies its own padding). |
| `className` | `string` | `undefined` | Extra classes merged onto the root `<div>`. |
| `children` | `ReactNode` | — | Card content. |
| `ref` | `React.Ref` | — | `Card` is built with `React.forwardRef`, so a ref forwards to the root `<div>`. |
| `...props` | `any` | — | Spread onto the root `<div>` (e.g. `onClick`, `id`). |

**Example**
```jsx
import { Card } from 'my Design System';

function SummaryCard({ title, value }) {
  return (
    <Card className="flex flex-col gap-1">
      <span className="text-xs text-ink-muted">{title}</span>
      <span className="text-2xl font-semibold">{value}</span>
    </Card>
  );
}
```

---

### `Panel`

A structured content panel with an optional titled header row (title + right-aligned actions) and a scrollable, flex-column body. Reach for `Panel` instead of `Card` when you need a header bar with a title and action buttons, and a body area that should flex to fill available height (e.g. a panel that hosts a `DataTable`).

**Import**
```jsx
import { Panel } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `ReactNode` | `undefined` | If truthy, renders a header row with this title. If omitted/falsy, no header row is rendered at all. |
| `actions` | `ReactNode` | `undefined` | Rendered on the right side of the header row (only shown when `title` is also set, since the header row itself is conditional on `title`). |
| `className` | `string` | `undefined` | Extra classes merged onto the root `<div>`. |
| `children` | `ReactNode` | — | Panel body content, rendered inside a `flex flex-col` scroll container. |
| `...props` | `any` | — | Spread onto the root `<div>`. |

**Example**
```jsx
import { Panel } from 'my Design System';
import { Button } from 'my Design System';

function DevicesPanel({ onAddDevice, children }) {
  return (
    <Panel
      title="Devices"
      actions={<Button size="sm" onClick={onAddDevice}>Add Device</Button>}
    >
      {children}
    </Panel>
  );
}
```

**Notes**

The root element is `flex flex-col flex-1 min-h-0 h-full` — `Panel` is designed to be dropped into a flex layout where its parent has a bounded height, so its body can scroll internally rather than pushing the page taller.

---

### `Tabs`

A horizontal tab strip. It is fully controlled — the parent owns the selected tab value and passes it back in via `value`; `Tabs` never tracks selection state itself. Supports Left/Right arrow-key navigation while the tab list has focus.

**Import**
```jsx
import { Tabs } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `Array<{ value: string, label: ReactNode, icon?: ReactNode }>` | a 3-item boilerplate array (`tab1`/`tab2`/`tab3`) | The list of tabs to render. `icon` (if present) is rendered before `label`. |
| `value` | `string` | `"tab1"` | The currently active tab's `value`. Must match one of `items[].value` for active styling / arrow-key navigation to work. |
| `onChange` | `(value: string) => void` | `() => {}` | Called with the newly selected tab's `value`, both on click and on Arrow Left/Right navigation. |
| `className` | `string` | `undefined` | Extra classes merged onto the root `[role="tablist"]` `<div>`. |

**Example**
```jsx
import * as React from 'react';
import { Tabs } from 'my Design System';

function DeviceDetailTabs() {
  const [tab, setTab] = React.useState('overview');

  const items = [
    { value: 'overview', label: 'Overview' },
    { value: 'events', label: 'Events' },
    { value: 'settings', label: 'Settings' },
  ];

  return (
    <div>
      <Tabs items={items} value={tab} onChange={setTab} />
      {tab === 'overview' && <OverviewPanel />}
      {tab === 'events' && <EventsPanel />}
      {tab === 'settings' && <SettingsPanel />}
    </div>
  );
}
```

**Notes**

If `value` doesn't match any `items[].value`, arrow-key navigation silently does nothing (the internal index lookup returns `-1` and the handler bails out early), though clicking a tab still works normally.

---

### `Breadcrumbs`

A breadcrumb trail navigation bar with an optional leading home icon and a customizable separator between items. The last item in `items` is always rendered as the current, non-interactive page label.

**Import**
```jsx
import { Breadcrumbs } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `Array<{ key?: string, label: ReactNode, href?: string, onClick?: (e) => void, icon?: ReactNode }>` | `[]` | The breadcrumb trail, in order. The last entry is rendered as plain bold text (current page). Earlier entries render as an `<a href={item.href}>` if `href` is set, otherwise as a `<button onClick={item.onClick}>`. |
| `separator` | `ReactNode` | a `<ChevronRight>` icon | The element rendered between breadcrumb items (and between the home icon and the first item). |
| `showHomeIcon` | `boolean` | `true` | Whether to render a leading `Home` icon before the trail. |
| `className` | `string` | `undefined` | Extra classes merged onto the root `<nav>`. |

**Example**
```jsx
import { Breadcrumbs } from 'my Design System';
import { useNavigate } from 'react-router-dom';

function DeviceBreadcrumbs({ deviceName }) {
  const navigate = useNavigate();

  return (
    <Breadcrumbs
      items={[
        { key: 'devices', label: 'Devices', href: '/devices' },
        { key: 'detail', label: deviceName },
      ]}
    />
  );
}
```

**Notes**

If `items` is empty (or not passed), the component renders `null` entirely — including the home icon — so it's safe to render unconditionally while data is still loading, as long as you pass `[]`.

---

### `Timeline`

A vertical audit-log / activity timeline: each entry shows a date/time on the left, a connecting dot-and-line axis in the middle, and a card on the right with a title and a small before/after diff table.

**Import**
```jsx
import { Timeline } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `Array<TimelineItem>` | `[]` | The timeline entries, rendered top to bottom in array order (not re-sorted). See shape below. |
| `className` | `string` | `undefined` | Extra classes merged onto the root `<div>`. |

Each `TimelineItem` supports:

| Field | Type | Description |
|---|---|---|
| `id` | `string \| number` | Optional React key (falls back to array index). |
| `date` | `string` | Shown in bold monospace on the left (e.g. `"03-JUL-26"`). |
| `time` | `string` | Optional, shown under `date` with a clock icon. |
| `relative` | `string` | Optional relative-time caption shown under `time` (e.g. `"3 months ago"`) — the exact `date`/`time` still shows above it for when a reader needs the precise value. |
| `title` | `ReactNode` | The card heading. |
| `kind` | `"created" \| "changed" \| "deleted" \| "document" \| "note"` | Optional. Grades the event's node with a distinct icon and ring color instead of the default plain accent dot, so a long history reads down its spine without opening a single card: `created`→green `FilePlus2`, `changed`→amber `PencilLine`, `deleted`→red `Trash2`, `document`→accent `Receipt`, `note`→neutral `Dot`. Left off, the node falls back to the original plain dot look — fully backward compatible with callers that don't pass it. |
| `description` | `string` | Optional prose sentence shown instead of a diff table, for events that already read naturally as a sentence (e.g. "Invoice INV-2044 emailed to accounts@acme.com") — only rendered when there's no `changes`/`change`/`before`/`after` diff to show alongside it. |
| `changes` | `Array<{ label?: string, before?: ReactNode, after?: ReactNode, reason?: string }>` | Full multi-row diff table. If provided, this takes precedence over `change` and the `before`/`after` shortcut below. A `Field` column is only rendered if `changes[0].label` is set. |
| `change` | `{ label?: string, before?: ReactNode, after?: ReactNode, reason?: string }` | Singular alternative to `changes`, for a single-row diff — used only if `changes` is not provided. |
| `before`, `after` | `ReactNode` | Simplest shortcut for a single-row diff with no field label. Used only if neither `changes` nor `change` is provided; missing values default to `"-"`. |
| `reason` | `string` | Optional, at either the item level or on an individual `changes`/`change` row (item-level `reason` wins if both are set). Rendered on its own line with a ticket icon — e.g. the ticket number a change was made under — so it reads as a lookup-able value rather than trailing off the end of a sentence. |

**Example**
```jsx
import { Timeline } from 'my Design System';

function LicenseAuditTrail({ auditEntries }) {
  const items = auditEntries.map((entry) => ({
    id: entry.id,
    date: entry.dateLabel,
    time: entry.timeLabel,
    title: entry.action,
    changes: entry.fieldChanges, // [{ label, before, after }]
  }));

  return <Timeline items={items} />;
}
```

**Notes**

- When `items` is empty, `Timeline` renders a centered "No timeline history available." message instead of an empty container.
- Diff cell values are auto-highlighted: any string containing `"Deactivate"` or `"0000000000"` gets the `(0000000000)` portion highlighted in the "offline" color, and any string equal to `"Activate"` or containing `"Active"` is highlighted in the "online" color. This is baked-in formatting logic, not configurable per item.
- **A diff value that parses as JSON is pretty-printed automatically.** Before applying the highlight rule above, each `before`/`after` value is tested against `JSON.parse` (only if it starts with `{` or `[`); if it parses successfully, it's rendered as indented, monospace `JSON.stringify(value, null, 2)` inside a scrollable box instead of as a raw string — a full JSON document as one unbroken line would otherwise set the whole diff table's width. A falsy value (`undefined`/`null`/`""`) always renders as a muted italic `"-"`, before either the JSON or highlight checks run.

---

### `Tooltip`

A floating, theme-aware tooltip that wraps any child element/component and shows full, untruncated content on hover, click, or focus. Positioned with `getBoundingClientRect()` + `position: fixed`, so it renders above overflow/clipping containers.

**Import**
```jsx
import { Tooltip } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `content` | `ReactNode` | — | Tooltip body. If falsy, the tooltip is disabled and `children` render as-is with no wrapper behavior. |
| `children` | `ReactNode` | — | The element(s) the tooltip is attached to. |
| `position` | `"top" \| "bottom" \| "left" \| "right"` | `"top"` | Which side of `children` the tooltip appears on. |
| `trigger` | `"hover" \| "click" \| "focus" \| "manual"` | `"hover"` | How the tooltip opens. `"manual"` means only the `open` prop controls visibility. |
| `delay` | `number` | `150` | Milliseconds to wait before showing on hover (only applies when `trigger="hover"`; `delay > 0` gates a `setTimeout`). |
| `onlyIfOverflow` | `boolean` | `false` | If `true`, the tooltip only opens when the child's content is actually overflowing/truncated (measured via `scrollWidth`/`scrollHeight` vs `clientWidth`/`clientHeight` on open). |
| `showArrow` | `boolean` | `true` | Whether to render the small directional arrow pointer. |
| `open` | `boolean` | `undefined` | Controlled-open override. When provided (not `undefined`), the tooltip's visibility is driven entirely by this prop instead of internal hover/click state — pair with `trigger="manual"`. |
| `disabled` | `boolean` | `false` | Fully disables the tooltip (renders `children` with no wrapper behavior). |
| `className` | `string` | `undefined` | Extra classes merged onto the floating tooltip bubble. |
| `...props` | `any` | — | Spread onto the wrapping `<div>` around `children`. |

**Example**
```jsx
import { Tooltip } from 'my Design System';

function DeviceIdCell({ fullId, shortId }) {
  return (
    <Tooltip content={fullId} position="right">
      <span className="font-mono">{shortId}</span>
    </Tooltip>
  );
}
```

**Notes**

- On touch devices (`matchMedia('(hover: none)')`), a `trigger="hover"` tooltip is automatically switched off (no open/close handlers are attached) so it doesn't get stuck open after a tap.
- `content` is always rendered in full — `Tooltip` never truncates or shortens what you pass it; pair it with `TruncatedText` if you want ellipsis-on-overflow with a tooltip showing the full string.

---

### `TruncatedText`

Displays a single line of text that's clipped with an ellipsis when it doesn't fit its container, and (by default) shows the full text in a `Tooltip` on hover. Also supports hard character-count truncation.

**Import**
```jsx
import { TruncatedText } from 'my Design System';
// Aliased exports also available:
import { EllipsisText, Ellipsis } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `text` | `string \| number` | `undefined` | The string to display/truncate. Takes precedence over `children` when both are given. |
| `children` | `ReactNode` | — | Used as the source text if `text` is not provided and `children` is a string or number; otherwise rendered as-is (e.g. you can pass pre-rendered JSX as `children` while still copying the plain string via `text`, matching the pattern `DataTable` uses internally). |
| `maxLength` | `number` | `undefined` | If set, hard-truncates the text to this many characters (counted with `Array.from` so multi-byte/emoji characters aren't split) and appends `"..."`. |
| `showTooltip` | `boolean` | `true` | Whether hovering shows a `Tooltip` with the full text. |
| `tooltipPosition` | `"top" \| "bottom" \| "left" \| "right"` | `"top"` | Passed through to the internal `Tooltip`'s `position`. |
| `className` | `string` | `undefined` | Extra classes on the rendered text element. |
| `as` | `React.ElementType` | `"span"` | The tag/component used to render the text. |
| `...props` | `any` | — | Spread onto the rendered text element. |

**Example**
```jsx
import { TruncatedText } from 'my Design System';

function DeviceNameCell({ name }) {
  return <TruncatedText text={name} className="max-w-[220px]" />;
}

// Hard-truncate to 40 characters with no tooltip:
function ShortNote({ note }) {
  return <TruncatedText text={note} maxLength={40} showTooltip={false} />;
}
```

**Notes**

- When `showTooltip` is `true` and no `maxLength` was applied (CSS-only truncation), the underlying `Tooltip` is given `onlyIfOverflow` so it only pops up if the text is actually clipped by its container — not on every hover.
- If `showTooltip` is `false`, a native `title` attribute with the full text is added instead, but only when the text was hard-truncated via `maxLength`.

---

### `Loader`

A simple spinner, optionally as a full-page overlay. Used for both inline loading indicators and page/section-blocking loading states.

**Import**
```jsx
import { Loader } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `fullPage` | `boolean` | `undefined` (falsy) | When truthy, wraps the spinner in a `fixed inset-0` overlay (`z-50`, blurred translucent background) that covers the whole viewport. When falsy, just renders the spinner in place. |
| `label` | `string` | `"Loading..."` | Text shown under the spinner. Pass `""`/`null`/`undefined` to hide the label entirely. |
| `className` | `string` | `undefined` | Extra classes on the spinner's wrapping `<div>` (applies whether or not `fullPage` is set). |

**Example**
```jsx
import { Loader } from 'my Design System';

function DeviceListSection({ loading, devices }) {
  if (loading) return <Loader label="Loading devices..." />;
  return <DeviceList devices={devices} />;
}

// Full-page blocking loader, e.g. during initial app boot:
function AppBootLoader() {
  return <Loader fullPage label="Starting up..." />;
}
```

---

### `Skeleton`

The base placeholder-loading building block: an animated pulsing block. `SkeletonCard` and `SkeletonTable` are built from it, but it's also exported directly for building custom skeleton layouts.

**Import**
```jsx
import { Skeleton } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"rectangular" \| "circular" \| "text"` | `"rectangular"` | Shape preset. `"circular"` gives full rounding (use with an explicit `h-*`/`w-*` className to make a circle avatar placeholder); `"text"` gives a `h-4` line with small vertical margins; `"rectangular"` gives a generically rounded block. |
| `className` | `string` | `undefined` | Extra classes — this is where you typically set width/height, since the component has no default size. |
| `...props` | `any` | — | Spread onto the root `<div>`. |

**Example**
```jsx
import { Skeleton } from 'my Design System';

function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton variant="circular" className="h-10 w-10" />
      <div className="flex flex-col gap-2">
        <Skeleton variant="text" className="w-32" />
        <Skeleton variant="text" className="w-20" />
      </div>
    </div>
  );
}
```

---

### `SkeletonCard`

A ready-made skeleton placeholder shaped like a typical summary card (header row with a title + trailing pill, then a two-column stat grid). Use it while a `Card` full of data is loading.

**Import**
```jsx
import { SkeletonCard } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | `undefined` | Extra classes merged onto the root card `<div>`. |

**Example**
```jsx
import { SkeletonCard } from 'my Design System';

function DeviceSummaryCard({ loading, summary }) {
  if (loading) return <SkeletonCard />;
  return <RealSummaryCard summary={summary} />;
}
```

**Notes**

The internal layout (header + 2-column grid) is fixed and not configurable via props — if your real card has a different shape, build a custom skeleton from the base `Skeleton` component instead.

---

### `SkeletonTable`

A ready-made skeleton placeholder that mimics a `DataTable`'s header + rows, for showing a loading state before real column/row data is available (e.g. before you know your column count).

**Import**
```jsx
import { SkeletonTable } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `rows` | `number` | `5` | Number of placeholder body rows to render. |
| `columns` | `number` | `4` | Number of placeholder header/body columns to render. |
| `className` | `string` | `undefined` | Extra classes merged onto the root `<div>` (which wraps a bordered `<table>`). |

**Example**
```jsx
import { SkeletonTable } from 'my Design System';

function DevicesTableSection({ loading, columns, rows }) {
  if (loading) return <SkeletonTable rows={8} columns={columns.length} />;
  return <DataTable columns={columns} data={rows} />;
}
```

**Notes**

Body-cell skeleton widths vary by column index (`w-36`, `w-24`, `w-16`, then `w-28` for all remaining columns) purely for visual variety — this isn't tied to your real column widths.

---

### `RowSelectCheckbox`

A small wrapper around the library's `Checkbox` that adds proper tri-state (`indeterminate`) support, since native checkboxes only expose `indeterminate` as an imperative DOM property, not an HTML attribute. This is what `DataTable` itself is modeled after for its row/select-all checkboxes (`DataTable` actually renders its own internal copy of this same logic, not this exported component).

**Import**
```jsx
import { RowSelectCheckbox } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `checked` | `boolean` | — | Whether the checkbox is checked. |
| `indeterminate` | `boolean` | — | When `true`, sets the checkbox's DOM `.indeterminate` property (rendered as a dash/partial state by the browser) via a `ref` + `useEffect`, overriding the visual `checked` state. |
| `onChange` | `(e: React.ChangeEvent) => void` | — | Called with the native change event when the checkbox is toggled. Optional — if omitted, clicks are silently swallowed (`onChange?.(e)`). |
| `label` | `string` | `"Select row"` | Accessible label, applied as `aria-label` on the checkbox input. |

**Example**
```jsx
import { RowSelectCheckbox } from 'my Design System';

function BulkSelectHeader({ allSelected, someSelected, onToggleAll }) {
  return (
    <RowSelectCheckbox
      checked={allSelected}
      indeterminate={!allSelected && someSelected}
      onChange={onToggleAll}
      label="Select all rows"
    />
  );
}
```

**Notes**

This is a low-level building block mainly useful if you're composing a custom table/list UI yourself. If you're using `DataTable`, its own `selectable`/`selectedKeys`/`onSelectedKeysChange` props already wire this behavior up for you — you don't need to reach for `RowSelectCheckbox` directly.

---

### `BarChart`

A themed grouped (or horizontal) bar chart, drawn by Recharts under the hood so axis ticks, label collision, resize, and hit-testing are handled by a real charting library instead of hand-rolled SVG. Colors, fonts, grid lines, and the tooltip all come from the active theme's CSS variables, so a chart re-skins itself the moment the theme changes with no JavaScript listening for it.

**Import**
```jsx
import { BarChart } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `Array<{ label: string, values: number[] }>` | `[]` | One entry per category. `values[i]` corresponds to `series[i]`; entries whose `values` isn't an array are filtered out before rendering. |
| `series` | `string[]` | `[]` | Series names, in the same order as each row's `values`. If omitted, a single series named `"Value"` is used. |
| `formatValue` | `(n: number) => string` | `(n) => String(n)` | Formats Y-axis ticks (or X-axis ticks in `horizontal` mode), the tooltip's values, and the optional bar-top value labels. |
| `height` | `number` | `280` | Pixel height of the plot area. |
| `showValues` | `boolean` | `false` | Prints each bar's numeric value just outside it (`top` in vertical mode, `right` in `horizontal` mode). |
| `horizontal` | `boolean` | `false` | Lays bars out left-to-right (categories on the Y axis) instead of the default bottom-to-top layout. |
| `className` | `string` | — | Extra classes on the outer chart wrapper. |
| `emptyMessage` | `string` | `"No data to chart"` | Shown centered in a fixed-height box instead of a chart when there's no usable data. |
| `...props` | `any` | — | Spread onto the outer chart wrapper `<div>`. |

**Example**
```jsx
import { BarChart } from 'my Design System';

function LicensesByAccountChart({ accounts }) {
  return (
    <BarChart
      data={accounts.map((a) => ({ label: a.name, values: [a.active, a.inactive] }))}
      series={['Active', 'Inactive']}
      formatValue={(n) => n.toLocaleString('en-IN')}
      showValues
    />
  );
}
```

**Notes**

- Bar-entry animation is deliberately disabled (`isAnimationActive={false}`). This works around a confirmed Recharts (3.10.1) bug where a grouped bar chart draws its grid, axes, and legend but the bar shapes themselves never appear — reproduced specifically with two series where most categories have one value at exactly `0` (e.g. an "Active vs Inactive per account" chart where most accounts have zero inactive licenses). Disabling the entry animation sidesteps whatever in Recharts' animation state machine fails to fire in that case.
- Category labels tilt at `-35°` automatically once there are more than 6 categories in the (non-`horizontal`) default layout, since flat labels become unreadable once they crowd — the plot area also gains extra bottom margin to make room.
- The legend is only rendered when `series.length > 1` — a single-series chart has nothing worth labeling.
- Every color, including the per-series palette, comes from `chartTheme.jsx` (see below) rather than being configurable per-chart, so every `BarChart`/`DonutChart` in an app reads as one consistent family.

---

### `DonutChart`

A donut chart with the total shown in the middle and a legend that lists each slice's value *and* percentage share in a lined-up column — something Recharts' own built-in legend can't do, which is why the legend here is ordinary markup rather than a Recharts component. A donut rather than a pie on purpose: the hole gives somewhere to put the total (usually the number people actually came for), and comparing arc lengths reads easier than comparing wedge areas.

**Import**
```jsx
import { DonutChart } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `Array<{ label: string, value: number }>` | `[]` | Slice data. Values are clamped to `≥ 0` and any slice whose resulting value is `0` is filtered out entirely (a zero-value slice has no arc to draw). |
| `centerLabel` | `string` | — | Small caption shown under the center figure. Omit for no caption. |
| `centerValue` | `string` | the formatted sum of all slice values | Overrides the computed total shown in the center of the ring. |
| `formatValue` | `(n: number) => string` | `(n) => String(n)` | Formats the center figure (when `centerValue` isn't set), each legend row's value, and the tooltip. |
| `height` | `number` | `200` | Both the width and height of the ring itself, in pixels (the chart is always square). |
| `className` | `string` | — | Extra classes on the outer wrapper (which lays the ring and the legend out side by side, wrapping on narrow containers). |
| `emptyMessage` | `string` | `"No data to chart"` | Shown instead of the ring when every slice is zero/filtered out (i.e. the total is `0`). |
| `...props` | `any` | — | Spread onto the outer wrapper `<div>`. |

**Example**
```jsx
import { DonutChart } from 'my Design System';

function LicenseStatusBreakdown({ counts }) {
  // counts: { active: 412, expiring: 38, expired: 12, deactivated: 9 }
  return (
    <DonutChart
      data={[
        { label: 'Active', value: counts.active },
        { label: 'Expiring soon', value: counts.expiring },
        { label: 'Expired', value: counts.expired },
        { label: 'Deactivated', value: counts.deactivated },
      ]}
      centerLabel="Total licenses"
    />
  );
}
```

**Notes**

- Each legend row shows the raw value *and* `Math.round((value / total) * 100)}%` of the total, so the two numbers are always internally consistent with what's actually drawn (as opposed to a percentage computed against some other total the caller might have in mind).
- The center figure sits over the ring as ordinary absolutely-positioned text (not inside the SVG), specifically so it can use the app's real type styles rather than SVG `<text>` styling.
- Slice colors cycle through the same `CHART_SERIES_COLOURS` palette `BarChart` uses, in `data` order, so a status color stays consistent if you happen to render the same categories in both chart types on one page.

---

### `chartTheme.jsx` — shared chart styling

Not a component itself — a small internal module that `BarChart` and `DonutChart` both import from, so every chart in the library shares one palette, one axis style, and one tooltip design. Exported directly in case you're composing a custom chart straight out of Recharts and want it to visually match.

**Import**
```jsx
import { CHART_SERIES_COLOURS, chartAxisStyle, ChartTooltip } from 'my Design System';
```

**Exports**

| Export | Type | Description |
|---|---|---|
| `CHART_SERIES_COLOURS` | `string[]` (6 hex colors) | The fixed per-series palette every chart cycles through in order (`#3b82f6` blue, `#10b981` emerald, `#f59e0b` amber, `#ef4444` rose, `#8b5cf6` purple, `#6b7280` neutral grey). Swap these for `"var(--accent-primary)"`-style theme tokens in your own fork if you'd rather charts track the active theme's accent instead of a fixed palette. |
| `chartAxisStyle()` | `() => object` | Returns a Recharts axis-props object (`stroke`, `tick`, `tickLine: false`, `axisLine`) themed from `--text-muted`/`--card-border`, meant to be spread onto a Recharts `<XAxis>`/`<YAxis>`. |
| `ChartTooltip` | `React.Component` | A themed replacement for Recharts' default tooltip (which renders as an inline-styled white box that looks wrong on every dark theme). Props: `active`, `payload`, `label` (all supplied by Recharts itself when passed as a chart's `<Tooltip content={<ChartTooltip .../>} />`), and `formatValue` (`(n) => string`, default `(n) => String(n)`) to format each series' value in the tooltip body. |

**Example**
```jsx
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { chartAxisStyle, ChartTooltip, CHART_SERIES_COLOURS } from 'my Design System';

// A custom chart that still matches the rest of the app's chart styling:
function CustomTrendChart({ data }) {
  const axis = chartAxisStyle();
  return (
    <ResponsiveContainer width="100%" height={240}>
      <RechartsBarChart data={data}>
        <XAxis dataKey="label" {...axis} />
        <YAxis {...axis} />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey="value" fill={CHART_SERIES_COLOURS[0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
```

**Notes**

Reach for `BarChart`/`DonutChart` first — this module is only worth importing directly when neither of those two chart shapes fits and you need a bespoke Recharts composition that still looks native to the library.

---

## Tables & Data Grids

### `DataTable`

The flagship data grid component: a fully client-driven (or server-side-ready) table with sorting, row selection, resizable columns, sticky header, per-column render/copy/link behavior, keyboard navigation, right-click context menus, and automatic viewport-aware height sizing. Reach for this whenever you need to show tabular data with any of those interactions — it's the base every other table component in this library (`ServerDataTable`, `MobileTableWrapper`) is built on top of.

**Import**
```jsx
import { DataTable } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `columns` | `Array<Column>` | `[]` | Column definitions — see **Column shape** below. |
| `data` | `Array<object>` | `[]` | Row data. |
| `rowKey` | `string \| (row, index) => string \| number` | `"id"` | Either the row property name to use as the unique key, or a function that computes it. Used for selection tracking and React `key`s. |
| `selectable` | `boolean` | `false` | Enables the leading checkbox column, row selection highlighting, and selection via click/keyboard. |
| `selectedKeys` | `Array<string \| number>` | `[]` | Controlled list of currently-selected row keys. |
| `onSelectedKeysChange` | `(newKeys: Array<string \| number>) => void` | `undefined` | Called with the full next selection array whenever selection changes (checkbox click, row click when `selectable` and no `onRowClick`, Shift/Ctrl/Cmd-click for multi-select, Space bar, Shift+Arrow range extension, "select all" header checkbox, or Escape to clear). |
| `onRowClick` | `(row) => void` | `undefined` | Called on a plain row click/Enter key. Note: a plain click only calls `onRowClick` (selection is *not* toggled) — selection on click only happens when `onRowClick` is not provided, or when the click is a Shift/Ctrl/Cmd-click. |
| `onCellClick` | — | — | Declared in the function signature but **not read anywhere in the render logic** — it currently has no effect. Per-cell click behavior is instead driven by each column's own `onCellClick` field (see Column shape). |
| `loading` | `boolean` | `false` | Shows a `Loader` row (label changes to "Fetching from server..." when `serverSide` is also `true`) instead of the table body. |
| `error` | `string \| Error \| null` | `null` | Shows an inline error message row instead of data. Accepts a plain string or an `Error`-like object (reads `.message`); falls back to `"Failed to load data."` for anything else truthy. |
| `onRetry` | `() => void` | `undefined` | If provided alongside `error`, renders a "Retry Request" button that calls it. |
| `emptyMessage` | `string` | `"No data available in table"` | Shown under the "No Records Found" heading when `data` (after filtering/search) is empty. |
| `onClearFilters` | `() => void` | `undefined` | If provided, shows a "Clear All Filters" button in the empty state. |
| `stickyHeader` | `boolean` | `true` | Whether the header row sticks to the top of the scrolling body (`sticky top-0`). |
| `striped` | `boolean` | `false` | Alternates a subtle background tint on odd rows (skipped for selected rows). |
| `dense` | `boolean` | `false` | Reduces body cell padding/font size, and the header row's own padding by a smaller amount, for a more compact table overall. |
| `headerAlign` | `"auto" \| "center" \| "right"` | `"auto"` | Table-wide default alignment for both header labels and body cells. `"auto"` leaves a column unaligned (left) unless its own `align` says otherwise. `"center"`/`"right"` forces every column that doesn't set its own `align` — header and body cell move together, so a numeric column can still declare `align: "right"` and keep that even when the table default is `"center"`. |
| `className` | `string` | `undefined` | Extra classes on the table's outer wrapper `<div>`. |
| `pagination` | — | — | Accepted in the function signature but currently **unused** — `DataTable` does not render pagination itself. Use `Pagination` alongside it (see `ServerDataTable` for the pattern), or wire `PaginationProps` yourself. |
| `searchable` | `boolean` | `false` | Enables built-in client-side search filtering (only takes effect when `serverSide` is `false` — see below). |
| `searchValue` | `string` | `""` | The current search text, matched case-insensitively against the stringified value of every field on each row. |
| `onSearchChange` | — | — | Declared in props but **DataTable never calls it** — `DataTable` doesn't render a search input itself; you own the input (e.g. via `TableToolbar` + `SearchBox`) and feed `searchValue` in. |
| `serverSide` | `boolean` | `false` | When `true`, disables all client-side processing: `data` is used as-is (no local search filtering, no local sorting) since the caller/server is assumed to already have applied search, filters, and sort. |
| `truncateText` | `boolean` | `true` | Declared in the function signature but **not read anywhere in the render logic** — currently has no observable effect. |
| `textWrap` | `"truncate" \| ...` | `"truncate"` | Declared in the function signature but **not read anywhere in the render logic** — currently has no observable effect. |
| `columnVisibility` | `Record<columnKey, boolean>` | `{}` | Map of column key → visible. Any column whose key maps to exactly `false` is filtered out of both the header and body; all other columns (including keys not present in the map) render normally. |
| `resizableColumns` | `boolean` | `true` | Shows a drag handle on the right edge of each header cell for manual column-width resizing (mouse drag; min width 60px). |
| `onColumnResize` | `(columnKey, newWidth: number) => void` | `undefined` | Called continuously while dragging a column's resize handle, with the new width in pixels. |
| `contextMenuItems` | `Array<{ label: ReactNode, icon?: ReactNode, danger?: boolean, onClick?: (row) => void }>` | `[]` | If non-empty (or `onContextMenu` is set), right-clicking a row opens a floating menu with these items instead of the browser's native context menu. `danger: true` items render in the "offline" (red-ish) color. |
| `onContextMenu` | `(row, e: React.MouseEvent) => void` | `undefined` | Called (in addition to opening the menu, if `contextMenuItems` is also non-empty) whenever a row is right-clicked. Having this set alone (with an empty `contextMenuItems`) is enough to enable `preventDefault`-ing the native browser menu. |
| `mobileCardView` | — | — | Declared in the function signature but **not read anywhere in the render logic** — currently has no effect. For responsive card/table switching, use `MobileTableWrapper` instead. |
| `primaryFields` | — | — | Declared in the function signature but **not read anywhere in the render logic** — currently has no effect on `DataTable` itself (it *is* a real, used prop on `MobileCardList`/`MobileTableWrapper`, documented separately below). |
| `sortKey` | `string \| null` | `undefined` | Controlled sort column key. Only takes effect (see `onSortChange`) when `onSortChange` is also provided. |
| `sortDirection` | `"asc" \| "desc"` | `undefined` | Controlled sort direction. Same controlled-mode caveat as `sortKey`. |
| `onSortChange` | `(columnKey: string, direction: "asc" \| "desc") => void` | `undefined` | **Presence of this prop is what switches DataTable into controlled-sort mode.** When set, clicking a sortable column header no longer updates any internal state — it just calls `onSortChange(col.key, nextDirection)`, and the table renders whatever `sortKey`/`sortDirection` you pass back in (defaulting to `null`/`"asc"` if you don't). This is required for `serverSide` sorting, since the fetch itself must be re-triggered with the new sort. If `onSortChange` is omitted entirely, `DataTable` manages sort state internally exactly as before (uncontrolled mode) — this is the default when you don't pass a `fetcher`/use `serverSide`. |
| `autoHeight` | `boolean` | `true` | When `true` (and `maxHeight` is not set), `DataTable` measures its own distance from the top of the viewport on mount/resize/scroll/body-resize and sets an explicit `height`/`maxHeight` style on its root element so the header can stay pinned (`stickyHeader`) while only the row area scrolls — regardless of the surrounding page's CSS. Set `autoHeight={false}` to disable this and fall back to pure flexbox sizing, which requires the table to sit inside a `flex flex-col` ancestor chain that itself has a bounded height (the component's own root already carries `flex-1 min-h-0`, so it will fill whatever bounded flex parent you give it). |
| `maxHeight` | `number \| string` | `undefined` | Pins an exact height (e.g. `400`, `"60vh"`) on the root element, applied to both `height` and `maxHeight` inline styles. When set, this bypasses the automatic viewport calculation entirely (the `autoHeight` effect becomes a no-op) — useful inside a modal or other fixed-size container. |
| `minHeight` | `number` | `240` | Floor for the auto-calculated height (in pixels) — only relevant when `autoHeight` is `true` and `maxHeight` is unset. |
| `heightOffset` | `number` | `16` | Extra gap (in pixels) subtracted from the available viewport space when auto-calculating height — only relevant when `autoHeight` is `true` and `maxHeight` is unset. |

**Column shape**

Every entry in the `columns` array is an object read as follows by the render code:

| Field | Type | Description |
|---|---|---|
| `key` | `string` | **Required.** Used as the React key, the default cell value lookup (`row[col.key]`), the sort field, and the `columnVisibility` lookup key. |
| `header` / `label` | `ReactNode` | Column header text. Checked in that order — `header` wins if both are set, then `label`, then the raw `key` is shown as a last resort. |
| `render` | `(row) => ReactNode` | Custom cell renderer. If provided, its return value is used as the cell content instead of `row[col.key]`, and it also suppresses the automatic link-wrapping behavior described under `href`/`onCellClick` below (i.e. `render` takes full control of the cell's markup). |
| `sortable` | `boolean` | If `true`, the header renders as a clickable button with a sort direction indicator icon (up/down chevron when active on this column, a neutral double-chevron otherwise), and clicking it triggers sorting on `col.key`. |
| `copyable` | `boolean` | If `true`, renders the cell's text alongside a `CopyButton` that copies the raw underlying value (`row[col.key]`, stringified). Also auto-enabled (even without setting this) when `col.key === "key"` and there's no `render` and `copyable` isn't explicitly `false`. |
| `isCopyable` | `boolean` | Alternate spelling accepted for the same behavior as `copyable`. |
| `align` | `"left" \| "right" \| "center"` | Text alignment for both header and cell (only `"right"` and `"center"` add classes; anything else — including omitted — is left-aligned). |
| `width` | `number \| string` | Fixed column width (used for the `<th>`/`<td>` inline `width` style, and as a fallback when computing the table's total scrollable width). Overridden live by drag-resizing if `resizableColumns` is on. |
| `minWidth` | `number \| string` | Minimum column width (`<th>`/`<td>` inline `minWidth` style; numbers are rendered as `"Npx"`). Also used as a width fallback (after `width`) when computing total table width. |
| `className` | `string` | Extra classes merged onto each `<td>` in this column. |
| `href` | `string \| (row) => string` | If set (and there's no `render`), the cell content is wrapped in an `<a>` pointing at this URL (or the string returned by calling it with `row`, if it's a function). |
| `target` | `string` | If `col.target === "_blank"` and the cell has a click handled via `href`/`onCellClick` (see below), the link opens via `window.open(url, "_blank")` instead of `window.location.href = url`. |
| `onCellClick` | `(row, columnKey, e: React.MouseEvent) => void` | If set (and there's no `render`), the cell is wrapped in a clickable `<a>` and this fires on click instead of navigating via `href` (click event propagation to the row is stopped either way). |
| `maxLength` | `number` | Passed through to the internal `TruncatedText` wrapper used for copyable cells, to hard-truncate the displayed text. |

A cell is treated as "linkable" (and wrapped in an `<a>`) whenever `col.isLink`, `col.href`, or a function `col.onCellClick` is truthy — but **only if `col.render` is not set**; a custom `render` always wins.

**Example**
```jsx
import * as React from 'react';
import { DataTable, Badge } from 'my Design System';

function DevicesTable({ devices, loading, error, onRetry }) {
  const [selectedKeys, setSelectedKeys] = React.useState([]);
  const [sortKey, setSortKey] = React.useState('lastSeen');
  const [sortDirection, setSortDirection] = React.useState('desc');

  const columns = [
    { key: 'deviceId', header: 'Device ID', sortable: true, copyable: true, width: 160 },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      onCellClick: (row) => console.log('open device', row.deviceId),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => (
        <Badge tone={row.status === 'ONLINE' ? 'online' : 'offline'}>{row.status}</Badge>
      ),
    },
    { key: 'lastSeen', header: 'Last Seen', sortable: true, align: 'right' },
  ];

  return (
    <DataTable
      columns={columns}
      data={devices}
      rowKey="deviceId"
      selectable
      selectedKeys={selectedKeys}
      onSelectedKeysChange={setSelectedKeys}
      sortKey={sortKey}
      sortDirection={sortDirection}
      onSortChange={(key, direction) => {
        setSortKey(key);
        setSortDirection(direction);
      }}
      loading={loading}
      error={error}
      onRetry={onRetry}
      emptyMessage="No devices match your filters."
      striped
      contextMenuItems={[
        { label: 'Copy ID', onClick: (row) => navigator.clipboard.writeText(row.deviceId) },
        { label: 'Delete', danger: true, onClick: (row) => console.log('delete', row.deviceId) },
      ]}
    />
  );
}
```

**Notes**

- **Keyboard navigation**: with focus on the table's scroll region, `ArrowUp`/`ArrowDown` move a "focused row" highlight (and extend selection when held with Shift, if `selectable`); `Home`/`End` jump to the first/last row; `ArrowLeft`/`ArrowRight` (or Alt+Left/Right) scroll the table horizontally by 200px; `Space` toggles selection on the focused row; `Enter` triggers `onRowClick` if set, otherwise toggles selection; `Escape` clears focus, closes any open context menu, and clears the entire selection. All of this is skipped when the event target is an interactive element inside a cell (button, link, input, etc.) so nested controls keep their native keyboard behavior.
- **Sizing model**: by default (`autoHeight` true, no `maxHeight`) the table sizes itself to fill from its current position down to near the bottom of the viewport, so you can drop it into almost any layout and get a scrollable body with a pinned header for free. If you need an exact size (e.g. inside a `Modal`), pass `maxHeight`. If you'd rather size it purely via CSS flexbox, pass `autoHeight={false}` and make sure its parent chain provides a bounded height.
- **Recommended props are effectively dead code right now**: `onCellClick` (top-level), `pagination`, `onSearchChange`, `truncateText`, `textWrap`, `mobileCardView`, and `primaryFields` are all accepted in the function signature but never read anywhere in the component body — passing them has no effect. Use each column's own `onCellClick`/`href` for cell-level clicks, pair `DataTable` with `Pagination` externally for paging, drive `searchValue` from your own search input, and use `MobileTableWrapper`/`MobileCardList` (which do read `primaryFields`) for responsive card views.
- For server-driven sorting/paging, see `ServerDataTable` below, which wires `sortKey`/`sortDirection`/`onSortChange`/`serverSide` for you automatically.

---

### `ServerDataTable`

A zero-boilerplate wrapper that combines `useServerDataBinding`, `DataTable`, `Pagination`, `TableToolbar`, and `SearchBox` into one server-backed data grid. Give it a `fetcher` function and it handles paging, sorting, search debouncing, loading, and error/retry state for you.

**Import**
```jsx
import { ServerDataTable } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `fetcher` | `(params: { page, pageSize, sortKey, sortDirection, search, filters }) => Promise<{ data: Array, total: number } \| Array>` | — | **Required.** Called whenever page/pageSize/sort/debounced-search change. May return either `{ data, total }` or a bare array (in which case `total` falls back to `data.length`). |
| `columns` | `Array<Column>` | `[]` | Same column shape as `DataTable`. |
| `initialPage` | `number` | `1` | Starting page number. |
| `initialPageSize` | `number` | `10` | Starting page size. |
| `initialSortKey` | `string \| null` | `null` | Starting sort column. |
| `initialSortDirection` | `string \| null` | `null` | Starting sort direction. |
| `initialSearch` | `string` | `""` | Starting search text. |
| `initialFilters` | `object` | `{}` | Starting filters object, forwarded to `fetcher` as `params.filters` (there's no built-in filter UI here — you'd pair this with `FilterPanel`/`ColumnFilterDropdown` externally and call the underlying hook's `setFilter`/`setFilters` yourself if you need live filter changes). |
| `showSearch` | `boolean` | `true` | Whether to render the built-in `SearchBox` in the toolbar. |
| `searchPlaceholder` | `string` | `"Search server records..."` | Placeholder text for the built-in search box. |
| `showPagination` | `boolean` | `true` | Whether to render the `Pagination` control below the table. |
| `onRowClick` | `(row) => void` | `undefined` | Passed straight through to `DataTable`. |
| `selectable` | `boolean` | `false` | Passed straight through to `DataTable`. |
| `selectedKeys` | `Array` | `undefined` | Passed straight through to `DataTable`. |
| `onSelectedKeysChange` | `(keys) => void` | `undefined` | Passed straight through to `DataTable`. |
| `rowKey` | `string \| (row, index) => string \| number` | `undefined` | Passed straight through to `DataTable` (falls back to `DataTable`'s own `"id"` default if omitted). |
| `toolbarActions` | `ReactNode` | `undefined` | Extra controls rendered in the toolbar, to the right of the built-in Refresh button. |
| `className` | `string` | `undefined` | Applied to the root wrapping `<div>` (a `flex flex-col` column containing the toolbar, table, and pagination). |
| `...restProps` | `any` | — | Any other props are spread directly onto the inner `DataTable` (e.g. `striped`, `dense`, `emptyMessage`, `contextMenuItems`, `resizableColumns`, `autoHeight`, `maxHeight`, etc.). |

**Example**
```jsx
import { ServerDataTable } from 'my Design System';

async function fetchDevices({ page, pageSize, sortKey, sortDirection, search }) {
  const res = await fetch(
    `/api/devices?page=${page}&pageSize=${pageSize}&sort=${sortKey ?? ''}:${sortDirection ?? ''}&q=${encodeURIComponent(search)}`
  );
  const json = await res.json();
  return { data: json.items, total: json.total };
}

function DevicesServerTable() {
  const columns = [
    { key: 'deviceId', header: 'Device ID', sortable: true, copyable: true },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'status', header: 'Status', align: 'center' },
  ];

  return (
    <ServerDataTable
      fetcher={fetchDevices}
      columns={columns}
      rowKey="deviceId"
      initialPageSize={20}
      searchPlaceholder="Search devices..."
      striped
    />
  );
}
```

**Notes**

- Internally, `ServerDataTable` always renders `DataTable` with `serverSide={true}`, and wires `sortKey`/`sortDirection`/`onSortChange` to the hook's controlled-sort state — so clicking a sortable header re-runs `fetcher` with the new sort automatically.
- The built-in "Refresh" button (always shown next to `toolbarActions`) calls the same `refetch` used for `onRetry`, and shows a spinning icon while `loading` is `true`.
- If you need more control than this wrapper offers (e.g. a custom filter UI wired into the fetch, or a different toolbar layout), use the `useServerDataBinding` hook directly together with `DataTable` and `Pagination` — its return value includes ready-to-spread `tableProps` (`{ data, loading, sortKey, sortDirection, onSortChange, serverSide: true, error, onRetry }`) and `paginationProps` (`{ page, pageSize, total, onPageChange, onPageSizeChange }`) bundles for exactly this purpose.

---

### `Pagination`

A compact prev/next pagination control showing "start-end of total", with an optional page-size `<select>`. Fully controlled — it computes page count from `total`/`pageSize` but never tracks its own state.

**Import**
```jsx
import { Pagination } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `page` | `number` | `1` | Current 1-indexed page number. |
| `pageSize` | `number` | `10` | Rows per page. If `pageSize <= 0`, it's treated as `1` internally for the range/page-count math. |
| `total` | `number` | `50` | Total row count across all pages. |
| `onPageChange` | `(newPage: number) => void` | `() => {}` | Called with the target page when the prev/next buttons are clicked. Prev clamps to `Math.max(1, page - 1)`; Next clamps to `Math.min(pageCount, page + 1)`, where `pageCount = Math.max(1, Math.ceil(total / pageSize))`. |
| `onPageSizeChange` | `(newSize: number) => void` | `undefined` | **Only when provided**, `Pagination` renders a "Rows per page" `<select>` next to the prev/next buttons, populated from `pageSizeOptions`. Selecting a new value calls this with the numeric size. If omitted, no page-size selector is rendered at all — `Pagination` looks exactly like just the prev/next buttons and the count text. |
| `pageSizeOptions` | `Array<number>` | `[10, 20, 50, 100]` | The options listed in the page-size `<select>` (only relevant when `onPageSizeChange` is provided). |
| `className` | `string` | `undefined` | Extra classes merged onto the root `<nav>`. |

**Example**
```jsx
import * as React from 'react';
import { Pagination } from 'my Design System';

function DevicesPager({ total }) {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);

  return (
    <Pagination
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={setPage}
      onPageSizeChange={(newSize) => {
        setPageSize(newSize);
        setPage(1); // reset to first page when page size changes
      }}
      pageSizeOptions={[10, 20, 50, 100]}
    />
  );
}
```

**Notes**

- The real controlled props are `page` / `pageSize` / `total` / `onPageChange` — there is no `currentPage` or `totalPages` prop.
- The Previous button is disabled when `page === 1`; the Next button is disabled when `page >= pageCount`. Neither button is ever hidden, just disabled.
- When pairing with `useServerDataBinding`, its `paginationProps` bundle already includes a matching `onPageSizeChange` that resets to page 1 on size change — spread it directly: `<Pagination {...paginationProps} />`.

---

### `TableToolbar`

A thin responsive layout shell for a toolbar row above a table: a left-aligned, flexible "start" area (e.g. search box) and a right-aligned "end" area (e.g. filter/column buttons), stacking vertically on narrow screens.

**Import**
```jsx
import { TableToolbar } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `start` | `ReactNode` | `undefined` | Rendered in the left/flexible area. Only rendered (with its wrapper) when truthy. |
| `end` | `ReactNode` | `undefined` | Rendered in the right-aligned area (wraps to full width on mobile, right-justified on `sm:` and up). Only rendered when truthy. |
| `className` | `string` | `undefined` | Extra classes on the root `<div>`. |
| `...props` | `any` | — | Spread onto the root `<div>`. |

**Example**
```jsx
import { TableToolbar, SearchBox, ColumnFilterDropdown } from 'my Design System';

function DevicesToolbar({ search, onSearchChange, columns, visibleColumns, onVisibleColumnsChange }) {
  return (
    <TableToolbar
      start={<SearchBox value={search} onChange={onSearchChange} placeholder="Search devices..." />}
      end={
        <ColumnFilterDropdown
          columns={columns}
          visible={visibleColumns}
          onChange={onVisibleColumnsChange}
        />
      }
    />
  );
}
```

---

### `ColumnFilterDropdown`

A "choose visible columns" control: a grid/columns icon button that opens a checklist popover (desktop) or a `BottomSheet` (mobile, via a `(max-width: 767px)` media query) letting the user toggle which columns are shown, with quick "All"/"Clear" actions.

**Import**
```jsx
import { ColumnFilterDropdown } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `columns` | `Array<{ key: string, label?: string, header?: string }>` | a 3-item boilerplate (`id`/`name`/`status`) | The full set of toggleable columns. Each row's label is `col.label`, falling back to `col.header`, then `col.key`. |
| `visible` | `Array<string>` | `["id", "name", "status"]` | The currently visible column keys. |
| `onChange` | `(newVisible: Array<string>) => void` | `() => {}` | Called with the full next array of visible keys on any toggle, "All" (sets to every column's key), or "Clear" (sets to `[]`). |
| `className` | `string` | `undefined` | Extra classes on the root wrapping `<div>`. |

**Example**
```jsx
import * as React from 'react';
import { ColumnFilterDropdown, DataTable } from 'my Design System';

function DevicesTableWithColumnToggle({ data }) {
  const columns = [
    { key: 'deviceId', header: 'Device ID' },
    { key: 'name', header: 'Name' },
    { key: 'status', header: 'Status' },
    { key: 'lastSeen', header: 'Last Seen' },
  ];
  const [visible, setVisible] = React.useState(columns.map((c) => c.key));

  const columnVisibility = Object.fromEntries(
    columns.map((c) => [c.key, visible.includes(c.key)])
  );

  return (
    <div>
      <div className="flex justify-end mb-2">
        <ColumnFilterDropdown columns={columns} visible={visible} onChange={setVisible} />
      </div>
      <DataTable columns={columns} data={data} columnVisibility={columnVisibility} />
    </div>
  );
}
```

**Notes**

Pair this directly with `DataTable`'s `columnVisibility` prop as shown above — `ColumnFilterDropdown` only manages the *list* of visible keys; you're responsible for converting that array into the `{ [key]: boolean }` map `DataTable` expects.

---

### `FilterPanel`

A floating "advanced search" popover shell (Gmail-style) — a positioned card with a header (title, active-filter count badge, reset/close buttons), a scrollable 2-column grid body for your own filter fields, and a bottom action row with Search/Clear buttons. Closes on outside click or Escape.

**Import**
```jsx
import { FilterPanel } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | Whether the panel is visible. When falsy, the component renders `null` entirely. |
| `onClose` | `() => void` | `undefined` | Called on outside click, Escape key, and (if `onSearch` is also set) after a successful search submit. Also controls whether the close (`X`) button is rendered at all. |
| `onSearch` | `() => void` | `undefined` | If provided, renders the "Search" primary button; clicking it calls `onSearch()` then `onClose()`. |
| `onClear` | `() => void` | `undefined` | If provided, renders both a small "Reset" link in the header and a "Clear" button in the footer, both calling this. |
| `children` | `ReactNode` | — | Your filter form fields, laid out in a `grid-cols-1 sm:grid-cols-2` scrollable area. |
| `className` | `string` | `undefined` | Extra classes merged onto the panel's root `<div>`. |
| `activeCount` | `number` | `0` | When `> 0`, shows an accent `Badge` with `"{activeCount} active"` in the header. |
| `title` | `string` | `"Advanced Search Filter"` | Header title text (also used as the `aria-label` on the `role="dialog"` root). |
| `position` | `string` | `"absolute top-full left-0 z-[100] mt-2 shadow-floating"` | Raw className fragment controlling the panel's positioning relative to its offset parent — override this if you need it anchored somewhere other than directly below-left of a relatively-positioned trigger. |
| `layout` | `"grid" \| "rows"` | `"grid"` | `"grid"` lays `children` out as `grid-cols-1 sm:grid-cols-2`. `"rows"` stacks them as a single full-width column instead — required by `FilterField` (see below), whose label/control row only lines up correctly at full width. |
| `actionAlign` | `"start" \| "end"` | `"start"` | Where the Search/Clear button group sits in the footer. `"start"` (default) keeps it on the left, matching the reference Gmail-style layout. `"end"` moves it to the right — the more conventional place for a dialog's confirm action — and also reverses the button order within the group so the primary Search button still lands closest to the panel's edge. |
| `searchLabel` | `string` | `"Search"` | Text on the primary Search button. |
| `clearLabel` | `string` | `"Clear"` | Text on the footer Clear button. |

**Example**
```jsx
import * as React from 'react';
import { FilterPanel } from 'my Design System';
import { Button, InputField, Dropdown } from 'my Design System';

function DevicesFilterButton() {
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState('');
  const [site, setSite] = React.useState('');

  const activeCount = [status, site].filter(Boolean).length;

  return (
    <div className="relative">
      <Button aria-label="Filters" onClick={() => setOpen((v) => !v)}>
        Filters {activeCount > 0 && `(${activeCount})`}
      </Button>
      <FilterPanel
        open={open}
        onClose={() => setOpen(false)}
        onSearch={() => console.log('run search', { status, site })}
        onClear={() => {
          setStatus('');
          setSite('');
        }}
        activeCount={activeCount}
      >
        <InputField label="Site" value={site} onChange={(e) => setSite(e.target.value)} />
        <Dropdown
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'ONLINE', label: 'Online' },
            { value: 'OFFLINE', label: 'Offline' },
          ]}
        />
      </FilterPanel>
    </div>
  );
}
```

**Notes**

The outside-click handler explicitly ignores clicks on any `button[aria-label="Filters"]` element, so it's safe to use a trigger button with that exact `aria-label` without the panel immediately re-closing itself on the same click that opened it. It also ignores clicks inside any `[data-portal-popover]` element — a `Dropdown`'s option menu renders through a portal, so it sits visually on top of the filter panel without being a DOM descendant of it; without this exception, picking a dropdown option inside a `FilterPanel` would read as an outside click and dismiss the whole panel underneath it.

---

### `FilterField`

One labelled row for use inside a `FilterPanel`: label on the left, control on the right (rather than `FormGroup`'s label-above-control layout). A filter panel is scanned rather than filled in top-to-bottom, so its labels need to line up in a column of their own — that's a different layout, not a variant of the same one, which is why this is a separate component from `FormGroup` rather than a prop on it. Any control can sit inside it — `Dropdown`, `InputField`, `DatePicker` — since `FilterField` only owns the label and the alignment.

**Import**
```jsx
import { FilterField, FilterToggle } from 'my Design System';
```

**`FilterField` props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `ReactNode` | — | Shown on the left (right-aligned at `sm:` and up). |
| `htmlFor` | `string` | — | Id of the inner control, so clicking the label focuses it. |
| `className` | `string` | — | Extra classes on the root row. |
| `children` | `ReactNode` | — | The control itself. |
| `...props` | `any` | — | Spread onto the root `<div>`. |

**`FilterToggle` props** — a full-width on/off row (label + `Checkbox` on a tinted bar), for a filter that's a plain switch rather than a value picker:

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `ReactNode` | — | Row label. |
| `checked` | `boolean` | `false` | Current toggle state. |
| `onChange` | `(checked: boolean) => void` | — | Called with the new boolean directly (not the raw change event). |
| `className` | `string` | — | Extra classes on the root row. |
| `...props` | `any` | — | Spread onto the root `<div>`. |

**Example**
```jsx
import * as React from 'react';
import { FilterPanel, FilterField, FilterToggle, Dropdown, DatePicker } from 'my Design System';

function DevicesFilterPanel({ open, onClose, filters, onChange, onSearch, onClear }) {
  return (
    <FilterPanel open={open} onClose={onClose} onSearch={onSearch} onClear={onClear} layout="rows">
      <FilterField label="Status" htmlFor="status-filter">
        <Dropdown
          id="status-filter"
          options={[{ value: 'ONLINE', label: 'Online' }, { value: 'OFFLINE', label: 'Offline' }]}
          value={filters.status}
          onChange={(v) => onChange({ ...filters, status: v })}
        />
      </FilterField>
      <FilterField label="Installed after" htmlFor="installed-after">
        <DatePicker
          id="installed-after"
          value={filters.installedAfter}
          onChange={(v) => onChange({ ...filters, installedAfter: v })}
        />
      </FilterField>
      <FilterToggle
        label="Only show devices needing attention"
        checked={filters.needsAttention}
        onChange={(checked) => onChange({ ...filters, needsAttention: checked })}
      />
    </FilterPanel>
  );
}
```

**Notes**

Pass `layout="rows"` on the surrounding `FilterPanel` when using `FilterField` — its label only lines up correctly at full row width; the panel's default two-column `grid` layout will squeeze each `FilterField` row down to half width and misalign the label column between rows.

---

### `DataFilter`

A generic, data-driven filter popover: rather than hand-writing a dropdown per filterable column (as `LicenseFilter`/`ReportFilter`/`UsersFilter` do), `DataFilter` derives both *which* columns are filterable and *what values* each dropdown offers straight from the rows you give it — so a page's filters can never offer an option that doesn't actually exist in that page's data. Built on `FilterPanel` + `Dropdown`.

**Import**
```jsx
import { DataFilter, applyDataFilter, countActiveFilters } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — | Whether the panel is visible. Renders `null` when falsy. |
| `onClose` | `() => void` | — | Forwarded to the underlying `FilterPanel`. |
| `rows` | `Array<object>` | `[]` | The page's full, pre-filter dataset. Both auto-derived fields and their option lists come from scanning these rows. |
| `fields` | `Array<{ key, label, formatLabel?, options? }>` | auto-derived from `rows` | Explicitly controls which columns are filterable and their order. `formatLabel(value)` relabels a derived option (e.g. render a boolean as "Active"/"Deactivated"); `options` (an array of `{value,label}`) skips derivation for that field entirely and uses your list as-is. Omit `fields` to fall back to full auto-derivation (see Notes). |
| `values` | `Record<string, string>` | `{}` | Current filter values, keyed by field `key`. A value of `"all"` (or an empty/falsy value) means that field isn't currently filtering. |
| `onChange` | `(nextValues: object) => void` | `() => {}` | Called with the full merged values object whenever any dropdown changes. |
| `title` | `string` | `"Filter Records"` | Forwarded to `FilterPanel`. |
| `onSearch` | `() => void` | — | Forwarded to `FilterPanel` (renders the Search button if set). |
| `onClear` | `() => void` | — | Forwarded to `FilterPanel` (renders Reset/Clear if set). |
| `className` | `string` | — | Forwarded to `FilterPanel`. |

**Companion functions** (also exported, and usable independently of the component):

| Function | Signature | Description |
|---|---|---|
| `applyDataFilter` | `(rows: Array, values: object) => Array` | Filters `rows` down to only those matching every active (non-`"all"`, non-empty) entry in `values`, by exact string equality on `row[key]`. Returns `rows` unchanged if `values` is falsy or has no active entries. |
| `countActiveFilters` | `(values: object) => number` | Counts how many entries in `values` are currently active (for feeding a `FilterPanel`'s `activeCount` badge). |

**Example**
```jsx
import * as React from 'react';
import { DataFilter, applyDataFilter, countActiveFilters, Button } from 'my Design System';

function DevicesToolbar({ allDevices }) {
  const [open, setOpen] = React.useState(false);
  const [values, setValues] = React.useState({});

  const filtered = applyDataFilter(allDevices, values);

  return (
    <div className="relative">
      <Button aria-label="Filters" onClick={() => setOpen((v) => !v)}>
        Filters {countActiveFilters(values) > 0 && `(${countActiveFilters(values)})`}
      </Button>
      <DataFilter
        open={open}
        onClose={() => setOpen(false)}
        rows={allDevices}
        values={values}
        onChange={setValues}
        onClear={() => setValues({})}
      />
      {/* render `filtered` in your table */}
    </div>
  );
}
```

**Notes**

- **Auto-derivation rules** (used whenever `fields` is omitted): every key present on `rows[0]` is a filter candidate, except a fixed skip-list of identifier/free-text-ish keys (`id`, `_id`, `__v`, `key`, `licenseKey`, `description`, `notes`, `details`, `remarks`, `comment`) and any key whose distinct value count is `≤ 1` (nothing to filter) or `> 40` (too many distinct values to be a useful dropdown — e.g. a unique-per-row field). Surviving keys get a humanized label (`camelCase`/`snake_case`/`kebab-case` → `Title Case With Spaces`).
- Option lists for both auto-derived and explicit (no-`options`) fields are built the same way: distinct non-null/non-empty/non-object values of that field across `rows`, sorted with locale-aware numeric comparison, each prefixed with an `{ value: "all", label: "All" }` entry.
- Reach for `LicenseFilter`/`ReportFilter`/`UsersFilter`-style hand-written filters instead of `DataFilter` when a screen's filters need field remapping, cross-field logic (e.g. Site options narrowed by the currently-selected Account), or free-text fields alongside dropdowns — `DataFilter` is deliberately the generic, no-configuration option for screens that just need "a dropdown per column."

---

### `MobileTableWrapper`

A responsive switcher: renders a normal `DataTable` on desktop (`> 768px`), and on mobile switches to a touch-optimized toolbar (search, filter, sort, view-toggle buttons) plus either a `MobileCardList` or an inline `DataTable`, depending on the user's chosen view. Also includes an automatic column-to-config normalizer so you can pass either full column objects, plain string keys, or nothing at all (auto-generated from the first data row).

**Import**
```jsx
import { MobileTableWrapper } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `columns` | `Array<Column \| string>` | `undefined` | Column definitions, same shape as `DataTable`'s, or a plain array of key strings (each auto-expanded into a full column config: header from `autoHeader(key)`, `sortable: true`, a heuristically-guessed `width`, `truncate`/`copyable` flags based on the key name). |
| `data` | `Array<object>` | — | Row data. |
| `rowKey` | `string \| (row, index) => string \| number` | — | Passed through to `DataTable`/`MobileCardList`. |
| `loading` | `boolean` | — | Passed through to `DataTable`/`MobileCardList`. |
| `error` | `string \| Error` | — | Passed through to `DataTable`/`MobileCardList` on every render path (desktop, mobile table view, mobile card view) — shows the same inline error UI with a "Retry Request" button as `DataTable`. |
| `onRetry` | `() => void` | — | Passed through alongside `error`; called when the user taps "Retry Request" on any render path. |
| `emptyMessage` | `string` | — | Passed through to `DataTable`/`MobileCardList`. |
| `visibleColumns` | `any` | — | Passed straight through as a prop named `visibleColumns` to the desktop `DataTable` call — note `DataTable` itself does not read a `visibleColumns` prop (it uses `columnVisibility` instead), so this currently has no visible effect there. |
| `autoColumns` | `boolean` | `false` | Forces auto-generation of columns from `Object.keys(data[0])` even if `columns` was also passed. (Auto-generation also happens automatically whenever `columns` is empty/undefined.) |
| `sortKey` | `string` | — | Passed through to `DataTable` (controlled sort). |
| `sortDirection` | `string` | — | Passed through to `DataTable` (controlled sort). |
| `onSortChange` | `(key, direction) => void` | — | Passed through to `DataTable` (controlled sort). |
| `selectable` | `boolean` | — | Passed through to both the `DataTable` and `MobileCardList` render paths. |
| `selectedKeys` | `Array` | — | Passed through to both render paths. |
| `onSelectedKeysChange` | `(keys) => void` | — | Passed through to both render paths. |
| `onRowClick` | `(row) => void` | — | Passed through to both render paths. |
| `className` | `string` | — | Passed through to the `DataTable` render paths only. |
| `dense` | `boolean` | — | Passed through to both `DataTable` render paths (desktop and mobile "table" view) — reduces body cell padding/font size for a more compact table. Has no effect on mobile "card" view. |
| `headerAlign` | `"auto" \| "center" \| "right"` | — | Passed through to the `DataTable` render paths only — table-wide default alignment for both header labels and body cells (see `DataTable`'s own prop docs above). Has no effect on mobile "card" view. |
| `primaryFields` | `Array<string>` | `[]` | Mobile card list: which column keys form the bold "title" line(s) of each card. If left empty, auto-resolves to the first non-copyable, non-`id` column. |
| `secondaryFields` | `Array<string>` | `[]` | Mobile card list: which column keys appear in the expandable detail section. If left empty, auto-resolves to every remaining column not already in the (resolved) `primaryFields`, excluding `id`. |
| `actionMenuItems` | `Array<{ label, icon?, danger?, onClick }>` | `[]` | Mobile card list: items shown in the per-row 3-dot action `BottomSheet`. |
| `filterOptions` | `ReactNode` | `undefined` | If provided, shows a filter icon button in the mobile toolbar that opens a `BottomSheet` containing this content. |
| `sortOptions` | `Array<{ value, label }>` | `undefined` | If provided together with `onSortSelect`, shows a sort icon button opening a `BottomSheet` list of sort choices. |
| `currentSort` | `any` | — | Which `sortOptions[].value` is currently active (highlighted with an "Active" tag in the sheet). |
| `onSortSelect` | `(value) => void` | — | Called when a sort option is tapped (closes the sort sheet automatically). |
| `mobileSearchValue` | `string` | — | Controlled search text for the mobile search input. If omitted, the component manages its own internal search state instead. |
| `onMobileSearchChange` | `(value: string) => void` | — | Controlled search change handler, paired with `mobileSearchValue`. |
| `bulkActions` | `Array<{ label, icon?, danger?, onClick }>` | `[]` | Mobile card list: floating bulk-action bar shown when `selectable` and at least one row is selected. |
| `loadMore` | `{ loadingMore?: boolean, onLoadMore?: () => void, hasMore?: boolean }` | `undefined` | Mobile card list: enables an infinite-scroll-style "Load More Records" button at the bottom of the list. |
| `hideMobileSearch` | `boolean` | `false` | Hides the mobile search input entirely. |
| `defaultMobileView` | `"card" \| "table"` | `"card"` | Which view the mobile view-toggle starts on (uncontrolled mode only — ignored once `viewMode` is passed). |
| `viewMode` | `"card" \| "table"` | — | Controlled current view. Pair with `onViewModeChange` — most useful together with `hideMobileControls` and an externally-rendered `MobileViewControls` (see below). Omit both to let the component manage this itself. |
| `onViewModeChange` | `(mode: "card" \| "table") => void` | — | Controlled view-change handler, paired with `viewMode`. |
| `hideMobileControls` | `boolean` | `false` | Hides the Sort and view-toggle buttons from this component's own mobile toolbar. Use when a page renders `MobileViewControls` itself elsewhere (e.g. next to its own pagination) instead. |
| `hideMobileToolbar` | `boolean` | `false` | Drops this component's sticky mobile toolbar altogether — search, filter, sort and view toggle. Set it when the screen renders `MobileTableToolbar` above the table instead, which is the arrangement to prefer: suppressing the parts one flag at a time (`hideMobileControls` + `hideMobileSearch`) still leaves the empty bordered bar behind. |

**Example**
```jsx
import { MobileTableWrapper } from 'my Design System';

function DevicesResponsiveTable({ devices, loading }) {
  const columns = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'site', header: 'Site' },
    { key: 'status', header: 'Status' },
    { key: 'lastSeen', header: 'Last Seen' },
  ];

  return (
    <MobileTableWrapper
      columns={columns}
      data={devices}
      rowKey="id"
      loading={loading}
      primaryFields={['name']}
      secondaryFields={['site', 'lastSeen']}
      actionMenuItems={[
        { label: 'View Details', onClick: (row) => console.log('view', row.id) },
      ]}
      emptyMessage="No devices found."
    />
  );
}
```

**Notes**

- The mobile/desktop breakpoint is a hard-coded `(max-width: 767px)` media query, matching this library's Tailwind `md:` breakpoint convention — it's not configurable via a prop.
- On mobile in "table" view mode, `MobileTableWrapper` still renders the full `DataTable` (just inside a scrollable wrapper `<div>`), not a simplified variant — so all `DataTable` interactions (resize, context menu, etc.) remain available there too.

---

### `MobileTableToolbar`

The one mobile toolbar a table screen wears. Reach for this on every phone-facing table rather than assembling search/filter/sort/view per screen — that's how a codebase ends up with several different mobile toolbars that each expose a different subset of the controls.

Layout:

```
[ search................ ] [filter] [sort] [view]
[            pagination            ]
```

and, while rows are selected, the first row is **replaced** by a contextual action bar (Material's contextual action bar, iOS's edit-mode toolbar):

```
[x] 2 selected                     [edit] [delete]
```

Replacing rather than stacking is deliberate — while a selection exists the actions that apply to it are the only ones that matter, and a phone has no room for both sets.

**Import**
```jsx
import { MobileTableToolbar } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `searchValue` | `string` | — | Current search text. |
| `onSearchChange` | `(value: string) => void` | — | The search field renders **only** when this is supplied. |
| `searchPlaceholder` | `string` | `"Search Data"` | Also used as the field's `aria-label`. |
| `hideSearch` | `boolean` | `false` | Hides the search field even when `onSearchChange` is given. |
| `filterOptions` | `ReactNode` | — | Content of the filter `BottomSheet` — typically `useResourceFilters`'s `mobileFilterOptions`. The filter button renders only when this is supplied. |
| `activeFilterCount` | `number` | `0` | Above zero, shows a count badge on the filter button and adds the count to its `aria-label`. |
| `sortOptions` | `Array<{ value, label }>` | — | Sort renders only when **both** this and `onSortSelect` are supplied. |
| `currentSort` | `string \| null` | — | Which option is active (marked "Active" in the sheet). |
| `onSortSelect` | `(value) => void` | — | Called with the picked option; closes the sheet. |
| `viewMode` | `"card" \| "table"` | — | Pair with `MobileTableWrapper`'s `viewMode`. |
| `onViewModeChange` | `(mode) => void` | — | The view toggle renders only when this is supplied. Called with the next mode as a plain value. |
| `selectedCount` | `number` | `0` | Above zero, the contextual action bar replaces the controls row. |
| `onClearSelection` | `() => void` | — | The `x` in the contextual bar. |
| `selectionActions` | `Array<Action>` | `[]` | `{ key?, label, icon?, onClick?, danger?, requiresSingle? }`. `danger` gets the destructive treatment; `requiresSingle` hides the action unless exactly one row is selected (Edit, typically). |
| `pagination` | `ReactNode` | — | Rendered on its own row underneath, so it keeps full width on a phone. |
| `className` | `string` | — | On the wrapper. Pass `md:hidden` when the screen shows a desktop toolbar instead. |

**Example** — the arrangement every screen in the SLS app uses:
```jsx
import { MobileTableToolbar, MobileTableWrapper, Pagination, useResourceFilters, useServerResource } from 'my Design System';

function LicensesScreen() {
  const [viewMode, setViewMode] = React.useState('card');
  const [selectedKeys, setSelectedKeys] = React.useState([]);
  const { data, filters, setFilters, sortKey, setSort, page, setPage, pageSize, total } =
    useServerResource(licensesService, { search });
  const { mobileFilterOptions, activeCount } = useResourceFilters({
    path: '/api/licenses', fields: FILTER_FIELDS, filters, setFilters,
  });

  return (
    <>
      {/* Desktop toolbar */}
      <div className="hidden md:block">{/* ... */}</div>

      <MobileTableToolbar
        className="md:hidden"
        searchValue={search}
        onSearchChange={setSearch}
        filterOptions={mobileFilterOptions}
        activeFilterCount={activeCount}
        sortOptions={sortOptions}
        currentSort={sortKey}
        onSortSelect={(v) => setSort(v, 'asc')}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedCount={selectedKeys.length}
        onClearSelection={() => setSelectedKeys([])}
        selectionActions={[
          { key: 'edit', label: 'Edit', icon: <Pencil size={15} />, requiresSingle: true, onClick: openEdit },
          { key: 'delete', label: 'Delete', icon: <Trash2 size={15} />, danger: true, onClick: confirmDelete },
        ]}
        pagination={<Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />}
      />

      <MobileTableWrapper
        /* ... */
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        hideMobileToolbar
      />
    </>
  );
}
```

**Notes**

- Pair it with `hideMobileToolbar` on `MobileTableWrapper`, or the wrapper renders its own search/filter/sort/view row too and the screen shows each control twice.
- `viewMode`/`onViewModeChange` must be the *same pair* passed to `MobileTableWrapper` — that's what makes this toggle drive the card/table content below it.
- The filter and sort sheets are self-contained: their open/closed state lives here, so only `viewMode` has to be threaded between the two components.
- Pagination stays visible in selection mode; only the controls row is replaced.

---

### `MobileViewControls`

The Sort and Card/Table view-toggle buttons `MobileTableWrapper` renders in its own mobile toolbar by default, pulled out into a standalone component so a page can place them somewhere else instead — next to its own pagination row, for example, rather than up in the search/filter toolbar.

**Import**
```jsx
import { MobileViewControls } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `viewMode` | `"card" \| "table"` | — | Current view. Must be the same value passed as `MobileTableWrapper`'s `viewMode`. |
| `onViewModeChange` | `(mode: "card" \| "table") => void` | — | Called with the next view when the toggle is tapped. Must be the same handler passed as `MobileTableWrapper`'s `onViewModeChange`. |
| `sortOptions` | `Array<{ value, label }>` | — | If given together with `onSortSelect`, renders a Sort button opening a `BottomSheet` list of choices. Omit either and the button doesn't render. |
| `currentSort` | `any` | — | Which `sortOptions[].value` is active (highlighted with an "Active" tag). |
| `onSortSelect` | `(value) => void` | — | Called when a sort option is tapped (closes the sheet automatically). |
| `className` | `string` | — | Applied to the button row's wrapper `<div>`. |

**Example** — moving the controls next to a page's own pagination:
```jsx
import { MobileTableWrapper, MobileViewControls, Pagination } from 'my Design System';

function DevicesPage() {
  const [viewMode, setViewMode] = React.useState('card');

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="md:hidden flex items-center gap-2">
          <MobileViewControls
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortOptions={[{ value: 'name', label: 'Name' }]}
            onSortSelect={(value) => setSortKey(value)}
          />
        </div>
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      </div>

      <MobileTableWrapper
        columns={columns}
        data={devices}
        rowKey="id"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        hideMobileControls
      />
    </>
  );
}
```

**Notes**

- Once `hideMobileControls` is set, `MobileTableWrapper` no longer reads `sortOptions`/`currentSort`/`onSortSelect` for anything — only `MobileViewControls` needs them now. `viewMode`/`onViewModeChange` is the only pair that still has to be threaded to both.
- The Sort `BottomSheet` is fully self-contained here — its open/closed state lives in `MobileViewControls`, not in `MobileTableWrapper`.

---

### `MobileCardList`

A touch-optimized, progressive-disclosure card list for showing tabular row data on small screens: each row becomes a card with a primary line, an optional expandable "secondary fields" section, a 3-dot action menu (via `BottomSheet`), long-press-to-select, and a floating bulk-action bar.

**Import**
```jsx
import { MobileCardList } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `Array<object>` | `[]` | Row data. |
| `rowKey` | `(row, index) => string \| number` | `undefined` | Function used to derive each card's key/selection identity. Falls back to `row.id`, then array index, if omitted. |
| `columns` | `Array<Column>` | `[]` | Same column shape as `DataTable` (`render`, `href`/`onCellClick`, `copyable`/`isCopyable`, `maxLength`, `header`/`key` are all read). Used to look up field values/labels for both the auto-detected header fields and `primaryFields`/`secondaryFields`. |
| `primaryFields` | `Array<string>` | `[]` | Column keys shown as the card's bold title (first entry) and secondary lines (remaining entries), used only when there's no `account`/`name` column match (see Notes). |
| `secondaryFields` | `Array<string>` | `[]` | Column keys shown in the expandable detail section underneath the card header. The expand/collapse chevron only appears at all when this array is non-empty. |
| `actionMenuItems` | `Array<{ label, icon?, danger?, onClick: (row) => void }>` | `[]` | If non-empty, shows a 3-dot button on each card that opens a `BottomSheet` with these actions for that row. |
| `onRowClick` | `(row) => void` | `undefined` | Called when a card is tapped (and it wasn't a long-press). If not provided and the card has secondary fields, tapping instead toggles the expand/collapse accordion. |
| `emptyMessage` | `string` | `"No records found."` | Message shown in the empty state. |
| `onClearFilters` | `() => void` | `undefined` | If provided, shows a "Clear All Filters" button in the empty state. |
| `loading` | `boolean` | — | Shows a centered spinner + "Loading records..." message instead of the list, but only when `data` is also empty (`loading && totalCount === 0`). |
| `error` | `string \| Error` | — | When set, replaces the list with an inline error message (same visual treatment as `DataTable`'s error state), checked before the empty-state branch. |
| `onRetry` | `() => void` | — | If provided alongside `error`, shows a "Retry Request" button inside the error state. |
| `loadingMore` | `boolean` | — | Shows a spinner inside the "Load More" button instead of its label. |
| `onLoadMore` | `() => void` | — | If provided together with `hasMore`, renders a "Load More Records" button at the bottom. |
| `hasMore` | `boolean` | — | Gates whether the "Load More" button (vs. a "Showing all N records" footer, shown only when there are more than 10 rows) is rendered. |
| `selectable` | `boolean` | `false` | Enables long-press-to-select (380ms hold, with a haptic buzz) and tap-to-select on the leading checkbox. |
| `selectedKeys` | `Array<string \| number>` | `[]` | Controlled selection list. |
| `onSelectedKeysChange` | `(keys) => void` | `undefined` | Called with the next full selection array. Selection toggling is a no-op entirely if this isn't provided. |
| `bulkActions` | `Array<{ label, icon?, danger?, onClick: (selectedKeys) => void }>` | `[]` | Shown in a floating pill bar fixed to the bottom of the screen whenever `selectable` is on and at least one row is selected. |
| `className` | `string` | `undefined` | Extra classes on the root scrollable `<div>`. |

**Example**
```jsx
import * as React from 'react';
import { MobileCardList } from 'my Design System';

function DevicesCardList({ devices }) {
  const [selectedKeys, setSelectedKeys] = React.useState([]);

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'site', header: 'Site' },
    { key: 'status', header: 'Status' },
    { key: 'lastSeen', header: 'Last Seen' },
  ];

  return (
    <MobileCardList
      data={devices}
      rowKey={(row) => row.id}
      columns={columns}
      primaryFields={['name']}
      secondaryFields={['site', 'lastSeen']}
      selectable
      selectedKeys={selectedKeys}
      onSelectedKeysChange={setSelectedKeys}
      bulkActions={[
        { label: 'Delete', danger: true, onClick: (keys) => console.log('delete', keys) },
      ]}
      actionMenuItems={[
        { label: 'View Details', onClick: (row) => console.log('view', row.id) },
      ]}
    />
  );
}
```

**Notes**

- Card header content has a special case: if `columns` contains a column with `key === "account"` or `key === "name"`, the card automatically renders an "account/name/status/type" layout (using those specific column keys, plus `status` and `type` if present) instead of using `primaryFields` at all. `primaryFields` is only used as the header layout when there's no `account`/`name` column present.
- The expand/collapse chevron and tap-to-expand behavior only activate when `secondaryFields.length > 0` (referred to internally as "high density" mode); otherwise tapping a card only fires `onRowClick` (if provided).
- A `secondaryFields` value always wraps once expanded, even if the column's own `render` (e.g. `TruncatedText`, shared with `DataTable`'s fixed-width cells) would otherwise clip it to one line — there's no width constraint here forcing single-line truncation, and the user already tapped to see everything. This is done by overriding a nested `truncate`'s CSS back to wrapping, so it holds regardless of what a given column's `render` returns.
- Long-press selection uses a 380ms timer (`setTimeout`) and calls `navigator.vibrate()` if available — it's a no-op (silently caught) in environments without haptic support.
- This component is normally consumed indirectly via `MobileTableWrapper`, which also supplies `normalizeColumns`-generated columns and resolves sensible `primaryFields`/`secondaryFields` automatically — using `MobileCardList` directly is mainly useful if you want a mobile card list without ever rendering a full `DataTable`.


---

## Overlays & Feedback

### `Modal`

The standard centered dialog box, used for forms and detail views. It renders via a React portal into `document.body`, dims the page with a backdrop, locks body scroll while open, and supports an optional header (with title + close button) and footer (for action buttons).

**Import**
```jsx
import { Modal } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — (required) | Controls visibility. When `false` (or when `document` is unavailable, e.g. SSR), the component renders `null`. |
| `onClose` | `() => void` | — (required) | Called when the backdrop is clicked, the header's close (X) button is clicked, or Escape is pressed while this modal is the top-most open one. |
| `title` | `ReactNode` | `undefined` | When provided, renders the header bar (title text + close button). Omit it to render a modal with no header. |
| `footer` | `ReactNode` | `undefined` | When provided, renders a footer bar below the body — typically a row of `Button`s. |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Max width of the dialog: `sm` ≈ 384px, `md` ≈ 448px, `lg` ≈ 576px, `xl` ≈ 768px. Falls back to `md` if an unrecognized value is passed. |
| `children` | `ReactNode` | — | Body content, rendered in a scrollable area between the header and footer. |
| `className` | `string` | `undefined` | Extra classes merged onto the dialog box (not the backdrop). |

**Example**
```jsx
import { useState } from 'react';
import { Modal, Button } from 'my Design System';

function AddDeviceModal({ open, onClose, onSave }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add device"
      size="md"
      footer={
        <>
          <Button variant="cancel" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onSave}>Save</Button>
        </>
      }
    >
      <p className="text-sm text-ink-secondary">Form fields go here.</p>
    </Modal>
  );
}
```

**Notes**

- `Modal` keeps a small internal stack of currently-open modal instances. Pressing Escape only closes the top-most one — e.g. if a `ConfirmDialog` (which renders `Modal` internally) is opened on top of an already-open form `Modal`, Escape closes just the `ConfirmDialog`, leaving the form modal underneath open.
- While any `Modal` is open, `document.body`'s `overflow` style is set to `hidden` (and restored on close) to prevent background scrolling.
- Clicking the backdrop calls `onClose` the same as the close button — if you need a "can't dismiss by clicking outside" modal, you'll need to guard inside your own `onClose` handler.

---

### `SlideOverModal`

A panel that slides in from the right edge of the screen and spans the full viewport height — useful for detail/edit panels where a centered `Modal` would feel too disconnected from the triggering row, or where you want more vertical room.

**Import**
```jsx
import { SlideOverModal } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — (required) | Controls visibility; renders `null` when `false` or when `document` is unavailable. |
| `onClose` | `() => void` | — (required) | Called when the backdrop is clicked, the close (X) button is clicked (only rendered if `title` is set), or Escape is pressed while this panel is the top-most open one. |
| `title` | `ReactNode` | `undefined` | When provided, renders a header bar with the title and a close button. Without it, there is no header or close button in the header area. |
| `width` | `string` | `'"480px"'` | CSS pixel width string, e.g. `"600px"`. The actual rendered width is clamped to `window.innerWidth - 16` so the panel never overflows a narrow viewport. |
| `children` | `ReactNode` | — | Body content, rendered in a scrollable area. |
| `className` | `string` | `undefined` | Extra classes merged onto the sliding panel element. |

**Example**
```jsx
import { useState } from 'react';
import { SlideOverModal } from 'my Design System';

function DeviceDetailPanel({ device, open, onClose }) {
  return (
    <SlideOverModal open={open} onClose={onClose} title={device?.name} width="560px">
      <dl className="text-sm">
        <dt className="text-ink-muted">IMEI</dt>
        <dd>{device?.imei}</dd>
      </dl>
    </SlideOverModal>
  );
}
```

**Notes**

- `width` must be a numeric-pixel string like `"480px"` — it's parsed with `parseInt(width)` and re-applied as `px`, so unitless strings like `"480"` also work, but percentage/`rem` values will not behave as expected.
- Like `Modal`, `SlideOverModal` tracks its own stack of open instances so Escape only closes the top-most panel when panels are nested.
- Body scroll is locked (`document.body.style.overflow = "hidden"`) while any instance is open.

---

### `BottomSheet`

A panel that slides up from the bottom of the screen with a small drag-handle bar at the top — the mobile-oriented equivalent of `Modal`/`SlideOverModal`, intended for filters, sort options, and action menus on small screens. It's hidden entirely at the `md` breakpoint and above (`md:hidden`), so it's meant to be paired with a desktop `Modal`/dropdown shown at larger widths.

**Import**
```jsx
import { BottomSheet } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — (required) | Controls visibility; renders `null` when `false` or when `document` is unavailable. |
| `onClose` | `() => void` | — (required) | Called when the backdrop is clicked, the close (X) button is clicked (only shown if `title` is set), or Escape is pressed while this sheet is the top-most open one. |
| `title` | `ReactNode` | `undefined` | When provided, renders a header bar with the title and a close button. |
| `children` | `ReactNode` | — | Body content, rendered in a scrollable area below the handle/header. |
| `className` | `string` | `undefined` | Extra classes merged onto the sheet element. |

**Example**
```jsx
import { useState } from 'react';
import { BottomSheet, Button } from 'my Design System';

function FilterSheet({ open, onClose }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Filter devices">
      <div className="flex flex-col gap-3">
        {/* filter controls */}
        <Button variant="primary" onClick={onClose}>Apply</Button>
      </div>
    </BottomSheet>
  );
}
```

**Notes**

- Fixed at `z-[70]` and rendered with `md:hidden` — it never displays at the `md` breakpoint or wider, regardless of `open`, so plan a separate desktop UI (e.g. a `Modal`) for the same feature.
- Like `Modal` and `SlideOverModal`, `BottomSheet` maintains its own open-instance stack so Escape only dismisses the top-most sheet when sheets are stacked.
- The sheet's max height is capped at `85dvh` with internal scrolling for the body content.

---

### `ConfirmDialog`

A pre-built confirmation dialog (built on top of `Modal`, always at `size="sm"`) for "are you sure?" prompts before a destructive or important action — delete a device, deactivate a license, etc. Just supply a message and the two callbacks.

**Import**
```jsx
import { ConfirmDialog } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — (required) | Controls visibility (passed straight through to the internal `Modal`). |
| `title` | `ReactNode` | `undefined` | Dialog header title. |
| `message` | `ReactNode` | `undefined` | Body text, rendered inside a `<p>`. |
| `confirmLabel` | `string` | `'"Ok"'` | Label for the confirm button. |
| `cancelLabel` | `string` | `'"Close"'` | Label for the cancel button. |
| `tone` | `'default' \| 'danger'` | `'default'` | When `'danger'`, the confirm button uses `Button`'s `danger` variant (red); otherwise it uses `primary`. |
| `onConfirm` | `() => void` | `undefined` | Called when the confirm button is clicked. |
| `onClose` | `() => void` | `undefined` | Called when the cancel button is clicked, the backdrop is clicked, the header's close (X) is clicked, or Escape is pressed (subject to the modal-stack rule below). |
| `loading` | `boolean` | `undefined` | Passed to the confirm `Button`'s `loading` prop — shows a spinner and disables the confirm button while an async confirm action is in flight. |

**Example**
```jsx
import { useState } from 'react';
import { ConfirmDialog } from 'my Design System';

function DeleteDeviceButton({ device, onDeleted }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onDeleted(device.id);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)}>Delete</button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title="Delete device?"
        message={`This will permanently remove ${device.name}. This action cannot be undone.`}
        tone="danger"
        confirmLabel="Delete"
        loading={loading}
      />
    </>
  );
}
```

**Notes**

- `ConfirmDialog` renders a `Modal` internally and inherits its Escape-key stacking behavior: if you open a `ConfirmDialog` on top of another already-open `Modal` (e.g. confirming deletion from within an edit form modal), pressing Escape closes only the `ConfirmDialog`, not the modal beneath it.
- There is no built-in "closing" vs "confirming" distinction in the close handler — both the cancel button and the backdrop/X call the same `onClose`, so use `onConfirm` exclusively for the destructive action.

---

### `Toast`

The toast/snackbar renderer. `Toast` itself is a **presentational list component** — it takes an array of toast objects and an `onDismiss` callback and renders each one (it holds no state of its own beyond each item's countdown). For actually queuing toasts from anywhere in the app, use the accompanying `ToastProvider` + `useToast()` hook exported from the same module, which manage the toast array and render `Toast` for you.

**Import**
```jsx
import { Toast, ToastProvider, useToast } from 'my Design System';
```

**`Toast` props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `toasts` | `Array<{ id, message, tone?, duration? }>` | `[]` | The toasts to render. Returns `null` if empty. |
| `onDismiss` | `(id) => void` | `undefined` | Called (per toast) when its timer expires or its close button is clicked. |
| `className` | `string` | `undefined` | Extra classes merged onto the desktop toast stack container only. |

Each entry in `toasts` (rendered internally as a `ToastItem`) supports:

| Field | Type | Default | Description |
|---|---|---|---|
| `id` | `string \| number` | — (required) | Unique key, also passed back to `onDismiss`. |
| `message` | `ReactNode` | — (required) | Toast body text. |
| `tone` | `'success' \| 'error' \| 'warn' \| 'info'` | `'info'` | Controls the icon (`CheckCircle2`/`XCircle`/`AlertTriangle`/`Info`), border color, and progress-bar color. |
| `duration` | `number` (ms) | `3000` | How long before the toast auto-dismisses. A shrinking progress bar animates across this duration. |

**`useToast()` API** (only usable inside a `ToastProvider`)

| Method | Signature | Description |
|---|---|---|
| `toast(message, options?)` | `(message, { tone?, duration? }) => id` | Shorthand — same as `toast.show`. |
| `toast.show(message, options?)` | same as above | Queues a toast with `tone: 'info'` by default. |
| `toast.success(message, options?)` | — | Queues a toast with `tone: 'success'`. |
| `toast.error(message, options?)` | — | Queues a toast with `tone: 'error'`. |
| `toast.warn(message, options?)` | — | Queues a toast with `tone: 'warn'`. |
| `toast.info(message, options?)` | — | Queues a toast with `tone: 'info'`. |
| `toast.dismiss(id)` | `(id) => void` | Dismisses a toast early, before its timer elapses. |

**Example**
```jsx
// App root
import { ToastProvider } from 'my Design System';

function App({ children }) {
  return <ToastProvider>{children}</ToastProvider>;
}
```

```jsx
// Anywhere inside the ToastProvider tree
import { useToast } from 'my Design System';

function SaveDeviceForm({ device, saveDevice }) {
  const toast = useToast();

  async function handleSubmit() {
    try {
      await saveDevice(device);
      toast.success('Device saved');
    } catch (err) {
      toast.error(err.message || 'Failed to save device', { duration: 5000 });
    }
  }

  return <button onClick={handleSubmit}>Save</button>;
}
```

**Notes**

- `useToast()` throws (`"useToast must be used within a <ToastProvider>"`) if called outside a `ToastProvider` — wrap your app (or at least the relevant subtree) once, near the root.
- Toasts render in two independent positions depending on viewport: desktop (`md` and up) shows them stacked in the upper-right corner below the header; mobile shows them stacked bottom-center. Both are rendered simultaneously in the DOM (one hidden via `md:hidden` / `hidden md:flex`), so `className` on `Toast` only affects the desktop container.
- Each toast auto-dismisses via its own `duration` timer (default 3000ms) and shows a linear progress bar counting down; a manual close (X) button is also available on every toast.
- If you use `Toast` directly (without `ToastProvider`), you're responsible for maintaining the `toasts` array and `id` generation yourself.

---

### `ErrorBoundary`

A class-based React error boundary that catches JavaScript errors thrown during rendering anywhere in its child tree and displays a fallback UI (with a "Try Again" reset button and expandable error details) instead of letting the whole app crash.

**Import**
```jsx
import { ErrorBoundary } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | The subtree to protect. Rendered normally as long as no descendant has thrown. |
| `fallback` | `ReactNode \| (({ error, reset }) => ReactNode)` | `undefined` | Custom fallback UI. If it's a function, it's called with `{ error, reset }` (where `reset` clears the error state, equivalent to clicking "Try Again"); if it's any other node, it's rendered as-is. When omitted, the built-in default fallback UI is used. |
| `title` | `string` | `'"Something went wrong"'` | Heading text in the default fallback UI (ignored if `fallback` is supplied). |
| `description` | `string` | `'"An unexpected error occurred in this component. You can retry loading or clear filters."'` | Body text in the default fallback UI (ignored if `fallback` is supplied). |
| `className` | `string` | `undefined` | Extra classes merged onto the default fallback UI's root container (ignored if `fallback` is supplied). |
| `onError` | `(error, errorInfo) => void` | `undefined` | Called from `componentDidCatch` with the thrown error and React's `errorInfo` (including `componentStack`) — use this to log to an error-tracking service. |
| `onReset` | `() => void` | `undefined` | Called after internal error state is cleared (i.e. after "Try Again" is clicked or `reset()` is invoked from a function `fallback`) — use this to reset the data/state that caused the crash. |

**Example**
```jsx
import { ErrorBoundary } from 'my Design System';

function DeviceDashboard() {
  return (
    <ErrorBoundary
      title="Couldn't load devices"
      onError={(error, errorInfo) => reportToSentry(error, errorInfo)}
      onReset={() => window.location.reload()}
    >
      <DeviceTable />
    </ErrorBoundary>
  );
}
```

```jsx
// Custom fallback using the render-prop form
import { ErrorBoundary } from 'my Design System';

function ReportSection() {
  return (
    <ErrorBoundary fallback={({ error, reset }) => (
      <div className="p-4 text-sm text-red-600">
        Report failed to render: {error?.message}
        <button onClick={reset}>Retry</button>
      </div>
    )}>
      <ReportChart />
    </ErrorBoundary>
  );
}
```

**Notes**

- Implemented with the standard React error-boundary pair — `static getDerivedStateFromError(error)` sets `hasError`/`error` to trigger the fallback render, and `componentDidCatch(error, errorInfo)` captures `errorInfo` and fires `onError`. This means it only catches errors thrown during rendering, in lifecycle methods, and in constructors of the component tree below it — it does **not** catch errors from event handlers, async code, or server-side rendering.
- The default (non-custom) fallback includes a "View Error Logs" / "Hide Error Logs" toggle that reveals the error's `toString()` and component stack trace in a monospace block — handy for local debugging.
- "Try Again" (or a function `fallback`'s `reset()`) only clears the boundary's internal error state; it does not remount or refetch data for you unless you handle that in `onReset`.


---

## Feature Modals & Widgets

These are business-logic components built on top of `my Design System`'s common primitives (`Modal`, `FormModal`, `ConfirmDialog`, `FilterPanel`, `InputField`, `Dropdown`, etc.). They are shipped pre-wired for a license-management product — most are modals for adding, editing, confirming, or previewing license/user/report records. All components below are named exports of the package:

```jsx
import { LicenseFormModal, DeleteLicenseModal /* ...etc */ } from 'my Design System';
```

### License Management

#### `LicenseFormModal`

Add/Edit form for a license record with 12 fields (name, type, term, duration, date range, license count, subscription/renewal amounts, issue date, timezone, activation mode, and three reminder-day inputs). Renders as an "Add License" modal when `license` is not supplied, or "Edit License" when it is.

**Import**
```jsx
import { LicenseFormModal } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — (required) | Controls modal visibility. |
| `onClose` | `() => void` | — (required) | Called when the modal is dismissed (backdrop click, Escape, header X, or Close/Cancel button). |
| `license` | `object \| null \| undefined` | `undefined` | Existing license to edit. When falsy, the form starts blank/defaulted and the title reads "Add License"; when provided, title reads "Edit License" and the form is seeded from it. The internal form shape is `{ name, type, term, duration, dateRange, numLicenses, subscriptionAmount, renewalAmount, issueDate, timezone, activationMode, reminder1, reminder2, reminder3 }`. |
| `onSave` | `(form: object) => void` | — (required) | Called with the full form object when the submit button is clicked (button label comes from `FormModal`'s default, "Ok"). The modal does **not** close itself on save — call `onClose()` yourself inside `onSave` if desired. |
| `typeOptions` | `Array<{ value, label }>` | `DEFAULT_LICENSE_TYPE_OPTIONS` (4 placeholder license-type strings, e.g. `"EF-1M-5M-3Y-PO-CPCB"`) | Options for the "License Type" dropdown. **Pass your app's real license-types master list here** — the built-in default is only boilerplate for this library's own demo; without a real list, every new license defaults to (and can only be saved with) a type that likely doesn't exist in your system. |
| `termOptions` | `Array<{ value, label }>` | `DEFAULT_TERM_OPTIONS` (`Free`, `Yearly`, `Monthly`, `Quarterly`, `2-Year`, `"7 day(s)"`, `Custom`) | Options for the "License Term" dropdown. Same reasoning as `typeOptions` — pass your real term list. |

**Example**
```jsx
import { useState } from 'react';
import { LicenseFormModal } from 'my Design System';

function LicenseEditorExample({ licenseTypes, licenseTerms }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = "add" mode

  return (
    <>
      <button onClick={() => { setEditing(null); setOpen(true); }}>Add License</button>

      <LicenseFormModal
        open={open}
        onClose={() => setOpen(false)}
        license={editing}
        typeOptions={licenseTypes.map((t) => ({ value: t.name, label: t.name }))}
        termOptions={licenseTerms.map((t) => ({ value: t.name, label: t.name }))}
        onSave={(form) => {
          console.log('Saving license', form);
          // POST/PUT to your API here
          setOpen(false);
        }}
      />
    </>
  );
}
```

**Notes**
- The primary (submit) button is disabled while `form.name` is empty or whitespace-only (`!form.name?.trim()`) — a license name of `"   "` will not enable Save.
- Whenever `license` or `open` changes, the internal form state resets from `license` (or blank defaults derived from the first entry in `typeOptions`/`termOptions`), so reopening the modal for a different record won't leak the previous record's edits.
- `dateRange` is normalized internally from the `DateRangePicker`'s `{ from, to }` Date objects into a `"DD-MMM-YYYY - DD-MMM-YYYY"` string before being stored in form state.
- **Selecting certain terms auto-fills and locks Duration.** An internal `TERM_DURATION_DAYS` map (`Yearly`→365, `Monthly`→31, `Quarterly`→91, `"Half Year"`→182, `"2-Year"`→730, `"7 day(s)"`→7) overwrites the `duration` field the instant a matching term is picked, and the Duration `InputGroup` becomes disabled while that term is selected — only `Free`, `Custom`, or any other term you add that isn't in the map leaves Duration open to type a day count directly. If your `termOptions` includes a fixed-length term under a different label, it simply won't auto-fill/lock Duration since it won't match a key in that map — this behavior isn't itself configurable via props.

---

#### `DeleteLicenseModal`

Confirmation modal for deleting a license record; requires the user to type a non-blank reason before the delete button enables.

**Import**
```jsx
import { DeleteLicenseModal } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — (required) | Controls modal visibility. |
| `onClose` | `() => void` | — (required) | Called on Close/Cancel/backdrop/Escape. |
| `onConfirm` | `(reason: string) => void` | — (required) | Called with the typed reason when "Ok" is clicked. The modal clears its internal `reason` field immediately after calling this, but does **not** call `onClose` for you. |

**Example**
```jsx
import { useState } from 'react';
import { DeleteLicenseModal } from 'my Design System';

function DeleteLicenseExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Delete License</button>
      <DeleteLicenseModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={(reason) => {
          console.log('Deleting because:', reason);
          setOpen(false);
        }}
      />
    </>
  );
}
```

**Notes**
- The "Ok" button is disabled until `reason.trim()` is truthy — whitespace-only input (e.g. `"   "`) keeps the button disabled, only real, non-blank text enables it.
- The `reason` field resets to `""` automatically whenever `open` becomes `true`, so reopening the modal never shows a stale reason from a previous delete attempt.

---

#### `ActivateLicenseModal`

Small modal that collects an activation date and confirms activating a license (or licenses).

**Import**
```jsx
import { ActivateLicenseModal } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — (required) | Controls modal visibility. |
| `onClose` | `() => void` | — (required) | Called on Close/backdrop/Escape. |
| `onConfirm` | `(date: string) => void` | — (required) | Called with the selected date value (the raw string from the underlying `DatePicker`, e.g. `"2026-08-10"`) when "Ok" is clicked. |

**Example**
```jsx
import { useState } from 'react';
import { ActivateLicenseModal } from 'my Design System';

function ActivateLicenseExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Activate License</button>
      <ActivateLicenseModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={(date) => {
          console.log('Activating on', date);
          setOpen(false);
        }}
      />
    </>
  );
}
```

**Notes**
- The "Ok" button (`variant="add"`, green) is disabled until a date is picked (`disabled={!date}`).
- The date resets to `null` every time the modal opens, so a previously selected date never carries over.

---

#### `DeactivateLicenseModal`

Thin wrapper around the shared `ConfirmDialog` (danger tone) for confirming deactivation of one or more licenses; the message pluralizes automatically.

**Import**
```jsx
import { DeactivateLicenseModal } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — (required) | Controls modal visibility. |
| `onClose` | `() => void` | — (required) | Called on Close/backdrop/Escape. |
| `onConfirm` | `() => void` | — (required) | Called when the danger "Ok" button is clicked. Receives no arguments. |
| `count` | `number` | `1` | Number of licenses being deactivated; drives the confirmation message wording, e.g. `"Are you sure you want to deactivate 3 licenses?"` (singular "license" when `count` is 1). |

**Example**
```jsx
import { useState } from 'react';
import { DeactivateLicenseModal } from 'my Design System';

function DeactivateLicenseExample() {
  const [open, setOpen] = useState(false);
  const selectedCount = 3;

  return (
    <>
      <button onClick={() => setOpen(true)}>Deactivate Selected</button>
      <DeactivateLicenseModal
        open={open}
        onClose={() => setOpen(false)}
        count={selectedCount}
        onConfirm={() => {
          console.log('Deactivating', selectedCount, 'licenses');
          setOpen(false);
        }}
      />
    </>
  );
}
```

**Notes**
- No built-in loading state is wired up (the underlying `ConfirmDialog` accepts a `loading` prop but `DeactivateLicenseModal` doesn't forward one), and this component does not close itself after `onConfirm` — call `onClose()` yourself.

---

#### `LicenseStatusCell`

The STATUS column cell for a license table: rather than echoing a bare stored status string, it shows where the license actually stands right now — a live license inside its warning window reads as "About to expire in 6 days" instead of a plain "Active", with an icon and color graded by urgency. Built on `lib/licenseExpiry.js`'s pure lifecycle functions (see that entry under [Server Data Binding & Utilities](#server-data-binding--utilities)).

**Import**
```jsx
import { LicenseStatusCell, getLicenseRowTone } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `row` | `object` | — (required) | The license record. Passed straight through to `getLicenseLifecycle`/`getExpiryUrgency`/`describeExpiry` from `lib/licenseExpiry.js`. |
| `warnWithinDays` | `number` | `DEFAULT_WARN_WITHIN_DAYS` (30) | How many days out a live license counts as "expiring" rather than plain "active". |
| `now` | `Date` | current time | Override for "the current moment" — mainly useful in tests/storybook so a fixture doesn't silently go stale. |
| `showTooltip` | `boolean` | `true` | When `true`, wraps the cell content in a `Tooltip` showing the exact date (via `describeExpiry`) on hover. When `false`, renders the bare icon+label with no tooltip wrapper. |
| `className` | `string` | — | Extra classes merged onto the cell's `<span>`. |

**Also exported: `getLicenseRowTone(row, options)`** — `(row, { warnWithinDays?, now? }) => "warn" | null`. Returns `"warn"` when the license's lifecycle state is `"expiring"`, otherwise `null`. Meant to be plugged straight into `DataTable`/`MobileTableWrapper`'s `getRowTone` prop so the whole row (not just the status cell) gets a warning tint — but only rows that actually need attention, since tinting expired rows too would leave most of a mature account's table colored, and a highlight covering everything highlights nothing.

**Example**
```jsx
import { DataTable, LicenseStatusCell, getLicenseRowTone } from 'my Design System';

function LicensesTable({ licenses }) {
  const columns = [
    { key: 'name', header: 'Name' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <LicenseStatusCell row={row} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={licenses}
      getRowTone={(row) => getLicenseRowTone(row)}
    />
  );
}
```

**Notes**
- The icon carries meaning alongside color, deliberately — states stay distinguishable for a reader who doesn't see red/green as different colors, which color alone wouldn't provide for "Active" vs. "Expired".
- Grading only applies to the `"expiring"` state: `active`, `expired`, `deactivated`, and `unknown` each render one fixed icon/color regardless of `warnWithinDays`. Within `"expiring"`, four urgency bands escalate inside one color family — `low` (a `Clock` icon, muted) → `medium`/`high` (amber `AlertTriangle`, increasing opacity) → `critical` (an `AlertTriangle` in the same red used for `expired`, since a license expiring today is functionally the same problem as one already gone). This reads at a glance in a way a table of unrelated per-level colors wouldn't.
- `deactivated` is rendered in a neutral secondary-ink color rather than a status color — a license someone switched off on purpose isn't a problem to flag, and giving it a status color would put it in visual competition with rows that actually need attention.
- The countdown (e.g. "About to expire in 6 days") is the headline text specifically because it's the number a reader acts on; the exact date is a hover away via the tooltip rather than in the cell itself, keeping the column narrow.

---

#### `UpdatePropertyModal`

Assigns a license to an Account + Site (or a raw Device when the site itself isn't tracked — the two are mutually exclusive), and, for EnviroFront/OCEMS license types specifically, an EF Account and a license to link as a parent.

**Import**
```jsx
import { UpdatePropertyModal } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — (required) | Controls modal visibility. |
| `onClose` | `() => void` | — (required) | Called on Close/backdrop/Escape. The modal does **not** call this for you after `onSave` — close it yourself inside `onSave` if desired, same as every other feature modal in the library. |
| `onSave` | `(payload: { account, site, device, efAccount, parentLicense }) => void` | — (required) | Called with the resolved property object when "Ok" is clicked. `device` is `null` whenever `site` is set (they're mutually exclusive); `efAccount` is `null` unless the license type starts with `"OC"`; `parentLicense` is `null` unless the license type starts with `"OC"`/`"EF"` **and** something other than the "None" placeholder is selected. |
| `license` | `object` | — | The license being edited/assigned. Its `type` field decides which extra fields render (see Notes), and its `account`/`site`/`device`/`efAccount`/`parentLicense` fields seed the form every time the modal opens. |
| `accounts` | `Array<{ value, label }>` | `[]` | Options for the Account dropdown. |
| `sitesByAccount` | `Record<string, Array<{ value, label }>>` | `{}` | Site options, keyed by account. The Site dropdown's options are `sitesByAccount[account] || []` — it stays disabled until an account is chosen. |
| `efAccounts` | `Array<{ value, label }>` | `[]` | Options for the "EF Account" dropdown (OCEMS licenses only — see Notes). |
| `linkLicenseOptions` | `Array<{ value, label }>` | `[]` | Options for the "Link License" dropdown (OCEMS/EnviroFront licenses only). Internally prefixed with a synthetic `{ value: " ", label: "None" }` entry so "no parent license" is always selectable. |

**Example**
```jsx
import { useState } from 'react';
import { UpdatePropertyModal } from 'my Design System';

function UpdatePropertyExample({ license, accounts, sitesByAccount, efAccounts, linkLicenseOptions }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Update Property</button>
      <UpdatePropertyModal
        open={open}
        onClose={() => setOpen(false)}
        license={license}
        accounts={accounts}
        sitesByAccount={sitesByAccount}
        efAccounts={efAccounts}
        linkLicenseOptions={linkLicenseOptions}
        onSave={(payload) => {
          console.log('Updating license property', payload);
          setOpen(false);
        }}
      />
    </>
  );
}
```

**Notes**
- **Site vs. Device are mutually exclusive**, matching the reference app: picking a site clears and disables the Device field, and typing into Device clears and disables Site — a license's property is stored against one or the other, never both, so only one is ever live at a time.
- **EF Account and Link License are conditional on `license.type`.** EF Account shows only when the type starts with `"OC"` (OCEMS); Link License shows for either `"OC"` (OCEMS) or `"EF"` (EnviroFront) prefixes. A license type outside those two families gets neither field.
- Changing Account resets Site to `null` (a site belongs to exactly one account, so the previous selection can't carry over).
- Submit is disabled until `account` is chosen **and** at least one of `site`/`device` has a value.
- All five fields reset from `license` every time the modal opens, so reopening it for a different license never leaks the previous one's values.

---

#### `LicenseFilter`

Gmail-style floating advanced-search popover for filtering the license list (product, account, site, license type, term, device serial, status, and proforma invoice).

**Import**
```jsx
import { LicenseFilter } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — (required) | Whether the panel is shown. The component returns `null` entirely when `false` (it is not merely visually hidden). |
| `onClose` | `() => void` | — (required) | Forwarded to the underlying `FilterPanel`; called on outside click, Escape, or the panel's own close (X) button. |
| `filters` | `object` | `{}` | Current filter values, keyed by `product`, `account`, `site`, `type`, `term`, `device`, `status`, `pi`. |
| `onChange` | `(nextFilters: object) => void` | — (required) | Called with the merged filters object every time any field changes (the component always spreads `{ ...filters, ...patch }` for you). |
| `onSearch` | `() => void` | — | Forwarded to `FilterPanel`'s Search button; also auto-closes the panel when clicked. |
| `onClear` | `() => void` | — | Forwarded to `FilterPanel`'s Reset/Clear controls. |
| `rows` | `Array<object>` | `[]` | The license table's current (pre-filter) rows. Account, Site, License Type, Status, and Proforma Invoice option lists are all derived from these — distinct non-empty values, sorted, prefixed with an "All ___" entry — the same pattern `ReportFilter`/`UsersFilter`/`DataFilter` use. Without `rows`, those five dropdowns render with empty option lists. |

**Example**
```jsx
import { useState } from 'react';
import { LicenseFilter } from 'my Design System';

function LicenseFilterExample({ licenses }) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({});

  return (
    <div style={{ position: 'relative' }}>
      <button aria-label="Filters" onClick={() => setOpen((v) => !v)}>Filters</button>
      <LicenseFilter
        open={open}
        onClose={() => setOpen(false)}
        rows={licenses}
        filters={filters}
        onChange={setFilters}
        onSearch={() => console.log('Searching with', filters)}
        onClear={() => setFilters({})}
      />
    </div>
  );
}
```

**Notes**
- Account, Site, License Type, and Status dropdown options come from `row.account`/`row.site`/`row.type`/`row.status`; the Proforma Invoice dropdown's options come from **`row.lastPi`**, not `row.pi` — a common trip-up if your row shape names that field differently, since the filter key itself is still `pi` in `filters`/`onChange`, only the *source column* on `rows` is `lastPi`. `product`, `term`, and `device` remain free-text `InputField`s, not derived from `rows`.
- The badge at the top of the panel ("N active") counts filter values that are set and not equal to `""` or `"all"`.
- Because `FilterPanel` positions itself `absolute`, wrap the trigger button and `LicenseFilter` in a `position: relative` container, as shown above.

---

#### `TimelineModal`

Read-only modal showing an audit-history timeline (who changed what and when) for a license, with events graded by kind (created/changed/deleted/document/note) and full before/after diff tables per change.

**Import**
```jsx
import { TimelineModal } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — (required) | Controls modal visibility. |
| `onClose` | `() => void` | — (required) | Called on Close button/backdrop/Escape. |
| `entries` | `Array<TimelineEntry>` | `[]` | Timeline items rendered via the shared `Timeline` component (see its own entry above for the full field list — `kind`, `description`, `change`/`changes`, `relative`, and a per-change `reason` are all supported here too, since `TimelineModal` passes `entries` straight through). |
| `loading` | `boolean` | `false` | Shows a `Loader` ("Fetching license timeline...") in place of the timeline body — use this while an async fetch for `entries` is in flight. |
| `subtitle` | `string` | — | Optional line rendered above the timeline body, in a bordered paragraph, naming which record this history belongs to (e.g. `"License: ACME-2024-001"`). Omitted entirely when not set. |

**Example**
```jsx
import { useState } from 'react';
import { TimelineModal } from 'my Design System';

function TimelineExample({ license, entries, loading }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>View Timeline</button>
      <TimelineModal
        open={open}
        onClose={() => setOpen(false)}
        entries={entries}
        loading={loading}
        subtitle={`License: ${license?.name ?? ''}`}
      />
    </>
  );
}
```

**Notes**
- Purely presentational — no `onSave`/`onConfirm`. It only reads `entries`/`loading`.
- **The empty state is `TimelineModal`'s own, not `Timeline`'s.** When `!loading && entries.length === 0`, it shows a dedicated `History` icon + "No activity yet" / "Nothing has happened here since it was created." empty state — the underlying `Timeline` component's own generic "No timeline history available." fallback is effectively unreachable through this modal, since `TimelineModal` intercepts the empty case before `Timeline` ever renders.

---

#### `HistoryPiInvoiceModal`

Tabbed history modal for a license's Performa (proforma) and Tax invoice records, each tab its own table with per-row View/Delete actions.

**Import**
```jsx
import { HistoryPiInvoiceModal } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — (required) | Controls modal visibility. The active tab resets to `"pi"` every time the modal opens. |
| `onClose` | `() => void` | — (required) | Called on Close button/backdrop/Escape. |
| `piRecords` | `Array<{ id, name, number, timestamp, fileName? }>` | `[]` | Rows for the "Performa Invoice" tab. |
| `tiRecords` | `Array<{ id, name, number, timestamp, fileName? }>` | `[]` | Rows for the "Tax Invoice" tab. |
| `loading` | `boolean` | `false` | Shows a `Loader` ("Fetching history of Pi and invoice...") in place of the active tab's table. |
| `onView` | `(record) => void` | — | Handler for the Eye icon-button on each row. |
| `onDelete` | `(record) => void` | — | Handler for the danger Trash2 icon-button on each row. |

**Example**
```jsx
import { useState } from 'react';
import { HistoryPiInvoiceModal } from 'my Design System';

function HistoryExample({ piRecords, tiRecords, loading }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>View Invoice History</button>
      <HistoryPiInvoiceModal
        open={open}
        onClose={() => setOpen(false)}
        piRecords={piRecords}
        tiRecords={tiRecords}
        loading={loading}
        onView={(record) => console.log('viewing', record)}
        onDelete={(record) => console.log('deleting', record)}
      />
    </>
  );
}
```

**Notes**
- Each tab's table shows Name / "Pi No." (or "Tax Invoice No." on the Tax Invoice tab) / Timestamp / Action columns. Timestamp accepts either a display-ready string or a .NET-style wire-format `/Date(1735689600000)/` value and formats either the same way.
- Empty state text is per-tab: "No performa invoices for this license." on the Performa tab, "No tax invoices for this license." on the Tax Invoice tab.
- There's no built-in concept of invoice status/paid-vs-pending here — if your app needs a status badge per row, add a column to your own table wrapper or fold the status into `name`/render it via a custom column, since `HistoryPiInvoiceModal`'s columns are fixed, not configurable.

---

#### `SingleLicensePreviewModal`

Slide-over panel showing a quick read-only detail view of one license (account, name, type/issue/activation/expiry, site, and a copy-to-clipboard license key block).

**Import**
```jsx
import { SingleLicensePreviewModal } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — (required) | Controls slide-over visibility (passed straight to `SlideOverModal`). |
| `onClose` | `() => void` | — (required) | Called on Close/backdrop/Escape. |
| `license` | `object \| null` | — (required) | The license to display. Reads `key` or `id` (for the license key block), `status`, `account`, `name`, `type`, `issue`, `actDate`/`activeDate`, `expiry`, `site`. **If `license` is falsy, the component renders `null` entirely** — the slide-over won't even mount, regardless of `open`. |
| `onToast` | `(message: string) => void` | — | Called with `"License Key copied to clipboard!"` after a successful clipboard copy. Optional — wire this to your app's toast/snackbar system. |

**Example**
```jsx
import { useState } from 'react';
import { SingleLicensePreviewModal } from 'my Design System';

function LicensePreviewExample() {
  const [open, setOpen] = useState(false);
  const [license] = useState({
    id: 'LIC-1042',
    key: 'EF-1M-5M-3Y-PO-CPCB-XXXX-YYYY',
    status: 'Active',
    account: 'Aaxis Nano',
    name: 'EnviroFRONT Web License',
    type: 'EF-1M-5M-3Y-PO-CPCB',
    issue: '30-Jul-2026',
    actDate: '31-Jul-2026',
    expiry: '30-Jul-2027',
    site: 'Gmr Airport Hyderabad',
  });

  return (
    <>
      <button onClick={() => setOpen(true)}>Preview License</button>
      <SingleLicensePreviewModal
        open={open}
        onClose={() => setOpen(false)}
        license={license}
        onToast={(msg) => console.log('Toast:', msg)}
      />
    </>
  );
}
```

**Notes**
- Because the component bails out early with `if (!license) return null`, always guard the trigger so `license` is set before `open` becomes `true` (e.g. select a row first).
- The status badge tone is "online" for `"Active"`, "offline" for `"Expired"`, and "warn" for anything else.

---

#### `ExternalDeviceInfoModal`

Read-only modal showing whatever external-device fields a license record carries (device ID, serial number, model, IMEI, IP/MAC address, etc.), with copy buttons on the identifying fields. Deliberately shows an explicit empty state rather than inventing placeholder values when a backend doesn't yet return device data — so the modal is ready the moment an API starts populating these fields, with no changes needed here.

**Import**
```jsx
import { ExternalDeviceInfoModal } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — (required) | Controls modal visibility (`size="md"`, title "External Device Info"). |
| `onClose` | `() => void` | — (required) | Called on Close button/backdrop/Escape. |
| `license` | `object \| null` | — | The selected license. Device fields are read from `license.device` if present (nested shape), otherwise straight off `license` itself (flat shape) — so either backend convention works with no prop to configure it. |
| `onToast` | `(message: string) => void` | — | Called with `"{Field} copied!"` after a successful field copy. |

**Example**
```jsx
import { useState } from 'react';
import { ExternalDeviceInfoModal } from 'my Design System';

function DeviceInfoExample({ selectedLicense }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>External Device Info</button>
      <ExternalDeviceInfoModal
        open={open}
        onClose={() => setOpen(false)}
        license={selectedLicense}
        onToast={(msg) => console.log('Toast:', msg)}
      />
    </>
  );
}
```

**Notes**
- Renders a fixed, ordered list of fields — Device ID, Device Name, Serial Number, Model, Manufacturer, Firmware Version, IMEI, SIM Number, IP Address, MAC Address, Last Seen, Site — skipping any field whose value is empty, `null`, `undefined`, or the literal placeholder string `"-"`. There's no prop to add custom fields.
- Device ID, Serial Number, and IMEI render with a `CopyButton` next to them; the rest are plain text.
- Three distinct states: no `license` selected ("Select a license to view its device."), a `license` with no populated device fields (a dedicated "No device information" empty state with a `HardDrive` icon), and a populated device (header row with name/account/online-offline `Badge`, then the field list).
- The online/offline `Badge` only renders when `device.status` has a value — there's no forced default badge when status is unknown.

---

#### `LicenseRenewalModal`

A license's (or, when browsing across licenses, an account's) full renewal-stream history as a paginated, filterable `DataTable` inside a large `Modal` — not the slide-over list this used to be. Supports optional per-row edit/delete and a "Manage Streams" escape hatch.

**Import**
```jsx
import { LicenseRenewalModal } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — (required) | Controls modal visibility (`size="xl"`). Filters, search, and selection all reset every time it opens. |
| `onClose` | `() => void` | — (required) | Called on Close/backdrop/Escape. |
| `rows` | `Array<{ id, accountName, name, key, value, licenseKey, ticketNo, timestamp }>` | `[]` | The renewal-stream rows for the table. |
| `total` | `number` | `rows.length` | Total row count across all pages, for `Pagination`. |
| `page` | `number` | `1` | Current page (controlled). |
| `pageSize` | `number` | `20` | Rows per page. |
| `onPageChange` | `(page: number) => void` | — | Called when the page changes. |
| `loading` | `boolean` | `false` | Forwarded to the internal `DataTable`. |
| `error` | `string \| Error \| null` | `null` | Forwarded to the internal `DataTable`. |
| `onRetry` | `() => void` | — | Forwarded to the internal `DataTable`. |
| `onSearch` | `(filters: { product, account, from, to }) => void` | — | Called with the current filter values when the built-in `FilterPanel`'s Search is clicked; called with `null` when Clear is clicked. |
| `productOptions` | `Array<{ value, label }>` | `[]` | Options for the filter panel's Product dropdown. The Product dropdown itself only renders at all when this array is non-empty. |
| `accountOptions` | `Array<{ value, label }>` | `[]` | Options for the filter panel's Account dropdown. |
| `onProductChange` | `(value) => void` | — | Called when the Product filter changes (the modal also resets its own internal Account selection when this fires). |
| `onEditRow` | `(row) => void` | — | If provided (with or without `onDeleteRow`), the table becomes single-row-selectable and an Edit icon-button toolbar appears above it, enabled only while exactly one row is selected. |
| `onDeleteRow` | `(row) => void` | — | Same selection-enabling behavior as `onEditRow`, wired to a Delete icon-button instead. |
| `onManage` | `() => void` | — | If provided, shows a "Manage Streams" footer button (typically used to open `ManageRenewalStreamModal`). Omit to hide it entirely. |

**Example**
```jsx
import { useState } from 'react';
import { LicenseRenewalModal, RenewalStreamFormModal } from 'my Design System';

function RenewalExample({ streamRows, total, page, pageSize, productOptions, accountOptions, licenseTypeOptions }) {
  const [open, setOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [pageState, setPageState] = useState(page);

  return (
    <>
      <button onClick={() => setOpen(true)}>Renewal Streams</button>
      <LicenseRenewalModal
        open={open}
        onClose={() => setOpen(false)}
        rows={streamRows}
        total={total}
        page={pageState}
        pageSize={pageSize}
        onPageChange={setPageState}
        productOptions={productOptions}
        accountOptions={accountOptions}
        onSearch={(filters) => console.log('applying filters', filters)}
        onEditRow={(row) => setEditingRow(row)}
        onDeleteRow={(row) => console.log('delete', row)}
      />
      <RenewalStreamFormModal
        open={!!editingRow}
        onClose={() => setEditingRow(null)}
        row={editingRow}
        licenseTypeOptions={licenseTypeOptions}
        onSave={(updated) => { console.log('saving', updated); setEditingRow(null); }}
      />
    </>
  );
}
```

**Notes**
- Table columns: Account, Name, Key (capitalized), Value (special-cased — the `"active"` key renders a green `CircleCheck`/red `CircleX` icon instead of raw text; everything else renders through `TruncatedText`), License Key (monospace), Ticket No, Timestamp (formatted; also accepts a .NET-style `/Date(ms)/` wire value).
- The built-in filter panel defaults to the current calendar year (`{ from: Jan 1, to: Dec 31 }` plus `product: null, account: null`) and is fully wired to `onSearch`/`onProductChange` — unlike an earlier version of this component, this is not a placeholder UI shell.
- `emptyMessage` is fixed at `"No renewal stream recorded for this license."`.
- Pair with `RenewalStreamFormModal` (below) for the actual edit form triggered by `onEditRow`, and `ManageRenewalStreamModal` for the simpler add/remove-rows flow behind `onManage`.

---

#### `RenewalStreamFormModal`

The edit form for a single renewal-stream row, opened from `LicenseRenewalModal`'s `onEditRow`. The "Value" field's control adapts to which stream `key` is being edited, since a renewal stream's value means different things depending on what it's tracking (an on/off state vs. a data rate vs. a plain figure).

**Import**
```jsx
import { RenewalStreamFormModal } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — (required) | Controls modal visibility (`size="md"`, title "Edit Renewal Stream"). |
| `onClose` | `() => void` | — (required) | Called on Close/backdrop/Escape. |
| `row` | `{ id, key, value, ticketNo, timestamp }` | — | The stream row being edited. The component renders nothing (`null`) if `row` is falsy — always pair `open` with a truthy `row`, as shown in `LicenseRenewalModal`'s example above. Internal form state resets from `row` every time the modal opens. |
| `licenseTypeOptions` | `Array<{ value, label }>` | `[]` | Options for the Value dropdown, used only when `row.key === "datarate"`. |
| `onSave` | `(updated: { id, key, value, ticketNo, timestamp }) => void` | — | Called with the full updated row on submit. |

**Example**
```jsx
import { RenewalStreamFormModal } from 'my Design System';

function EditStreamRow({ row, onClose, onSave, licenseTypeOptions }) {
  return (
    <RenewalStreamFormModal
      open={!!row}
      onClose={onClose}
      row={row}
      licenseTypeOptions={licenseTypeOptions}
      onSave={onSave}
    />
  );
}
```

**Notes**
- The Value field's control type is derived entirely from `row.key`: a `SegmentedControl` ("Active"/"Deactivated") when `key === "active"`; a `Dropdown` built from `licenseTypeOptions` when `key === "datarate"`; a plain `InputField` for any other key.
- Also renders a "Ticket No" `InputField` and a "Timestamp" `DatePicker` — the timestamp is normalized on load, accepting a .NET-style `/Date(ms)/` wire value in addition to a plain date string, and converted to `yyyy-MM-dd` for the native date input.

---

#### `ManageRenewalStreamModal`

Form modal for adding/editing/removing renewal stream rows (name + amount) using a dynamic row list.

**Import**
```jsx
import { ManageRenewalStreamModal } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — (required) | Controls modal visibility. |
| `onClose` | `() => void` | — (required) | Called on Close/backdrop/Escape. |
| `streams` | `Array<{ label: string, amount: string\|number }>` | falls back to `[{ label: "", amount: "" }]` internally | Initial rows. Re-synced into internal state whenever `streams` or `open` changes. |
| `onSave` | `(rows: Array<{label, amount}>) => void` | — (required) | Called with the current row array when "Ok" is clicked. |

**Example**
```jsx
import { useState } from 'react';
import { ManageRenewalStreamModal } from 'my Design System';

function ManageStreamsExample() {
  const [open, setOpen] = useState(false);
  const [streams, setStreams] = useState([{ label: 'Annual Renewal', amount: 25000 }]);

  return (
    <>
      <button onClick={() => setOpen(true)}>Manage Streams</button>
      <ManageRenewalStreamModal
        open={open}
        onClose={() => setOpen(false)}
        streams={streams}
        onSave={(rows) => {
          setStreams(rows);
          setOpen(false);
        }}
      />
    </>
  );
}
```

**Notes**
- Rows can be freely added ("Add stream" button) or removed (trash icon per row); there is no minimum-row enforcement and no required-field validation on stream name/amount — the submit button is always enabled.
- Does not auto-close on save; call `onClose()` yourself inside `onSave` as shown above.

---

#### `ValidateTicketModal`

Small modal that asks the user to type a support-ticket number before confirming an action.

**Import**
```jsx
import { ValidateTicketModal } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — (required) | Controls modal visibility. |
| `onClose` | `() => void` | — (required) | Called on Close/backdrop/Escape. |
| `onConfirm` | `(ticket: string) => void` | — (required) | Called with the typed ticket number when "Ok" is clicked. |

**Example**
```jsx
import { useState } from 'react';
import { ValidateTicketModal } from 'my Design System';

function ValidateTicketExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Validate Ticket</button>
      <ValidateTicketModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={(ticket) => {
          console.log('Validating ticket', ticket);
          setOpen(false);
        }}
      />
    </>
  );
}
```

**Notes**
- The "Ok" button is disabled until `ticket.trim()` is truthy — a whitespace-only ticket number will not enable the button.
- `ticket` resets to `""` every time the modal opens.

---

#### `CancelPiModal`

Thin wrapper around `ConfirmDialog` (danger tone) for confirming cancellation of a proforma invoice.

**Import**
```jsx
import { CancelPiModal } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — (required) | Controls modal visibility. |
| `onClose` | `() => void` | — (required) | Called on Close/backdrop/Escape. |
| `onConfirm` | `() => void` | — (required) | Called when the danger "Ok" button is clicked. Receives no arguments. |
| `invoiceNo` | `string` | — | Invoice number shown in the confirmation message, e.g. `"Are you sure you want to cancel PIC260010?"`. Falls back to the generic phrase `"this performa invoice"` when omitted. |

**Example**
```jsx
import { useState } from 'react';
import { CancelPiModal } from 'my Design System';

function CancelPiExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Cancel Invoice</button>
      <CancelPiModal
        open={open}
        onClose={() => setOpen(false)}
        invoiceNo="PIC260010"
        onConfirm={() => {
          console.log('Cancelling PIC260010');
          setOpen(false);
        }}
      />
    </>
  );
}
```

---

#### `SelectionRowPreviewModal`

Slide-over panel for reviewing and trimming the licenses that will go onto a generated document (proforma, tax invoice, revision, or cancellation) before confirming — with a document-type picker, a local name search, and the ability to drop individual licenses out of *this* document without touching the caller's underlying selection.

**Import**
```jsx
import { SelectionRowPreviewModal } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — (required) | Controls slide-over visibility (`width="480px"`). Local search, per-item removals, and the chosen document type all reset every time it opens. |
| `onClose` | `() => void` | — (required) | Called on Close/backdrop/Escape. |
| `licenses` | `Array<{ id, name, account }>` | `[]` | Candidate license rows (typically the table's current selection). |
| `documentTypes` | `Array<{ value, label, disabled? }>` | `DEFAULT_DOCUMENT_TYPES` — `Proforma`→"Performa Invoice", `"Tax (Manual)"`→"Tax Invoice (Manual)", `Tax`→"Tax Invoice", `Revise`→"Revise", `Cancel`→"Cancel Pi" | Options for the document-type dropdown at the top of the panel. |
| `onConfirm` | `(documentType: string, keptLicenses: Array) => void` | — | Called with the selected document type and whichever licenses remain (after any local removals/search) when "Ok" is clicked. |

**Example**
```jsx
import { useState } from 'react';
import { SelectionRowPreviewModal } from 'my Design System';

function SelectionPreviewExample({ selectedLicenses }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Preview Selection</button>
      <SelectionRowPreviewModal
        open={open}
        onClose={() => setOpen(false)}
        licenses={selectedLicenses}
        onConfirm={(documentType, keptLicenses) => {
          console.log('Generating', documentType, 'for', keptLicenses);
          setOpen(false);
        }}
      />
    </>
  );
}
```

**Notes**
- Title is a plain "Selected License"; the count shows in the body instead, as `Total: N` (and `· showing M` once the local search narrows what's displayed).
- Each row has its own remove (×) `IconButton` that drops it out of the document being built *locally* (tracked in internal state) — it does not call back into `licenses` or otherwise mutate the caller's selection, so closing and reopening the modal with the same `licenses` starts fresh.
- "Ok" is disabled whenever nothing is left to invoice (`kept.length === 0`) or no document type is chosen.
- Two distinct empty states: "Nothing left to invoice" (everything was removed) vs. "No matching licenses" (the local search excludes everything currently kept).

---

#### `LicenseToolbar`

Standalone action toolbar for a license table/list — desktop shows grouped icon buttons, mobile collapses into an expandable "More Actions" drawer with labeled buttons. Not a modal; it's an always-visible row of action triggers you wire up to open the various license modals above.

**Import**
```jsx
import { LicenseToolbar } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `selectedCount` | `number` | `0` | Number of currently selected license rows. Drives which action buttons are enabled. |
| `onViewDetails` | `() => void` | — | Handler for "View Details". Also, if omitted (falsy), the View Details icon button is hidden entirely on desktop (still listed but hidden via `show: !!onViewDetails` on mobile). |
| `onAdd` | `() => void` | `() => {}` | Handler for "Add License". Always enabled. |
| `onEdit` | `() => void` | `() => {}` | Handler for "Edit". Enabled only when `selectedCount === 1`. |
| `onDelete` | `() => void` | `() => {}` | Handler for "Delete". Enabled when `selectedCount > 0`. |
| `onActivate` | `() => void` | `() => {}` | Handler for "Activate". Enabled when `selectedCount > 0`. |
| `onDeactivate` | `() => void` | `() => {}` | Handler for "Deactivate". Enabled when `selectedCount > 0`. |
| `onUpdateProperty` | `() => void` | `() => {}` | Handler for "Update Property". Enabled only when `selectedCount === 1`. |
| `onRenewal` | `() => void` | `() => {}` | Handler for "License Renewal". Enabled only when `selectedCount === 1`. |
| `onHistory` | `() => void` | `() => {}` | Handler for "Get History Pi And Invoice". Enabled only when `selectedCount === 1`. |
| `onTimeline` | `() => void` | `() => {}` | Handler for "Timeline". Always enabled. |
| `onInvoice` | `() => void` | `() => {}` | Handler for **"Row Selection Preview"** (not "Invoice Preview" — the button's actual label, wired to `SelectionRowPreviewModal`, not `InvoicePreviewModal`). Enabled when `selectedCount > 0`. |
| `onDownload` | `() => void` | `() => {}` | Handler for "Download Data". Always enabled. |
| `onFilter` | `() => void` | — | Handler for a "Filter Datatable" button. If omitted (falsy), the button is hidden entirely — same pattern as `onViewDetails`. Always enabled when shown. |
| `onExternalDeviceInfo` | `() => void` | `() => {}` | Handler for "External Device Info". Enabled only when `selectedCount === 1`. |
| `actions` | `Array<string>` | `ALL_ACTIONS` — every action key listed below | Restricts which action buttons render, in both the desktop icon groups and the mobile drawer. Pass a subset for a screen that doesn't need the full license-lifecycle toolbar — e.g. `actions={['add', 'edit', 'delete']}` for a master-data list. The action keys are: `view`, `property`, `activate`, `deactivate`, `renewal`, `history`, `timeline`, `offlinePayment`, `invoice`, `download`, `externalDevice`, `add`, `edit`, `delete`, `filter`. Note that `view` and `filter` additionally require their handler (`onViewDetails`/`onFilter`) to be truthy even when listed in `actions` — listing the key alone isn't enough for those two. |
| `order` | `Array<string>` | — (falls back to the fixed grouped layout below) | Overrides display order on top of `actions` — pass action keys in the exact sequence to render them, on both the desktop row and the mobile drawer. Keys not also present in `actions` are silently skipped. When given, buttons render as one flat row/drawer with no group dividers, since the dividers only make sense for the default grouping. |
| `className` | `string` | — | Extra classes on the root container. |

**Example**
```jsx
import { useState } from 'react';
import {
  LicenseToolbar,
  LicenseFormModal,
  DeleteLicenseModal,
  ActivateLicenseModal,
  DeactivateLicenseModal,
} from 'my Design System';

function LicenseTableToolbarExample({ selectedIds }) {
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <LicenseToolbar
        selectedCount={selectedIds.length}
        onAdd={() => setAddOpen(true)}
        onDelete={() => setDeleteOpen(true)}
        onActivate={() => console.log('Activate', selectedIds)}
        onDeactivate={() => console.log('Deactivate', selectedIds)}
        onTimeline={() => console.log('Show timeline')}
      />
      <LicenseFormModal open={addOpen} onClose={() => setAddOpen(false)} onSave={() => setAddOpen(false)} />
      <DeleteLicenseModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={() => setDeleteOpen(false)} />
    </>
  );
}
```

**Icon-to-action reference**

| Action key | Icon | Label |
|---|---|---|
| `view` | `Eye` | View Details |
| `property` | `Tag` | Update Property |
| `activate` | `Check` | Activate |
| `deactivate` | `UserCog` | Deactivate |
| `renewal` | `Diamond` | License Renewal |
| `history` | `Briefcase` | Get History Pi And Invoice |
| `timeline` | `ListChecks` | Timeline |
| `offlinePayment` | `Wallet` | Offline payment (always disabled — see Notes) |
| `invoice` | `Network` | Row Selection Preview |
| `download` | `Download` | Download |
| `externalDevice` | `HardDrive` | External Device Info |
| `add` | `Plus` | Add License |
| `edit` | `Pencil` | Edit |
| `delete` | `Trash2` | Delete (danger styling) |
| `filter` | `SlidersHorizontal` | Filter Datatable |

**Notes**
- "Offline Payment" is permanently disabled (no handler prop exists for it) — it's a stub/placeholder button in both the desktop and mobile layouts.
- Not a modal itself — it's a plain flex/grid toolbar; there is no `open`/`onClose` pair.
- Use `actions` when reusing this toolbar for a master-data screen (types/terms/products) that has no license-lifecycle concept — pass just the keys that make sense (typically `['add', 'edit', 'delete']`, optionally with `'filter'` alongside `onFilter`) rather than rendering the full 15-button set with most of them permanently disabled.
- Use `order` when a screen needs a specific button sequence instead of the default grouping (e.g. `order={['edit', 'delete', 'property', 'activate', 'deactivate', 'history', 'invoice', 'timeline', 'download', 'renewal']}`) — `actions` still controls which buttons exist, `order` only controls the sequence they render in.

### Master Data (Types/Terms/Products)

#### `LicenseTypeFormModal`

Add/Edit form for a license type, capturing name, description, product, and product type.

**Import**
```jsx
import { LicenseTypeFormModal } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — (required) | Controls modal visibility. |
| `onClose` | `() => void` | — (required) | Called on Close/backdrop/Escape. |
| `item` | `object \| null \| undefined` | `undefined` | Existing license type to edit (`{ name, description, product, productType }`). When falsy, title reads "Add License Type" and the form defaults to `{ name: "", description: "", product: "EnviroFRONT", productType: "Web Application" }`. When provided, title reads "Edit License Type". |
| `onSave` | `(form: object) => void` | — (required) | Called with the form object when "Ok" is clicked. |

**Example**
```jsx
import { useState } from 'react';
import { LicenseTypeFormModal } from 'my Design System';

function LicenseTypeExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Add License Type</button>
      <LicenseTypeFormModal
        open={open}
        onClose={() => setOpen(false)}
        onSave={(form) => {
          console.log('Saving license type', form);
          setOpen(false);
        }}
      />
    </>
  );
}
```

**Notes**
- The submit button is disabled while `form.name` is empty or whitespace-only (`!form.name?.trim()`) — matches the current fixed validation behavior (spaces alone won't enable Save).
- "Product" and "Product Type" dropdowns are pre-seeded with fixed demo option lists (`EnviroFRONT`/`OCEMS`/`SolarFRONT`, and `Web Application`/`Mobile Application`/`Desktop Service`) baked directly into this component — there are no props to override those lists.

---

#### `LicenseTermFormModal`

Small Add/Edit form for a single license-term name (e.g. "Yearly", "Monthly").

**Import**
```jsx
import { LicenseTermFormModal } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — (required) | Controls modal visibility. |
| `onClose` | `() => void` | — (required) | Called on Close/backdrop/Escape. |
| `item` | `{ name: string } \| null \| undefined` | `undefined` | Existing term to edit. Falsy → title "Add License Term", blank field. Provided → title "Edit License Term", pre-filled. |
| `onSave` | `(payload: { name: string }) => void` | — (required) | Called with `{ name }` when "Ok" is clicked. |

**Example**
```jsx
import { useState } from 'react';
import { LicenseTermFormModal } from 'my Design System';

function LicenseTermExample() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  return (
    <>
      <button onClick={() => { setEditing(null); setOpen(true); }}>Add Term</button>
      <button onClick={() => { setEditing({ name: 'Yearly' }); setOpen(true); }}>Edit "Yearly"</button>
      <LicenseTermFormModal
        open={open}
        onClose={() => setOpen(false)}
        item={editing}
        onSave={({ name }) => {
          console.log('Saving term', name);
          setOpen(false);
        }}
      />
    </>
  );
}
```

**Notes**
- The submit button is disabled while `name.trim()` is falsy — a whitespace-only term name will not enable Save.
- Rendered at `size="sm"`, a compact single-field modal.

---

#### `ProductTypeFormModal`

Small Add/Edit form for a single product name (e.g. "SLS Pro").

**Import**
```jsx
import { ProductTypeFormModal } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — (required) | Controls modal visibility. |
| `onClose` | `() => void` | — (required) | Called on Close/backdrop/Escape. |
| `item` | `{ name: string } \| null \| undefined` | `undefined` | Existing product to edit. Falsy → title "Add Product", blank field. Provided → title "Edit Product", pre-filled. |
| `onSave` | `(payload: { name: string }) => void` | — (required) | Called with `{ name }` when "Ok" is clicked. |

**Example**
```jsx
import { useState } from 'react';
import { ProductTypeFormModal } from 'my Design System';

function ProductTypeExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Add Product</button>
      <ProductTypeFormModal
        open={open}
        onClose={() => setOpen(false)}
        onSave={({ name }) => {
          console.log('Saving product', name);
          setOpen(false);
        }}
      />
    </>
  );
}
```

**Notes**
- The submit button is disabled while `name.trim()` is falsy — whitespace-only product names are rejected, matching the current fixed validation behavior.

### Users

#### `UserFormModal`

Add/Edit form for a user record: name, email, role dropdown, and an "Active" checkbox.

**Import**
```jsx
import { UserFormModal } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — (required) | Controls modal visibility. |
| `onClose` | `() => void` | — (required) | Called on Close/backdrop/Escape. |
| `user` | `object \| null \| undefined` | `undefined` | Existing user to edit (`{ name, email, role, status, products }`). Falsy → title "Add User", form defaults to `{ name: "", email: "", role: "Viewer", products: [] }`. Provided → title "Edit User". |
| `onSave` | `(form: object) => void` | — (required) | Called with the form object when "Ok" is clicked. |

**Example**
```jsx
import { useState } from 'react';
import { UserFormModal } from 'my Design System';

function UserFormExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Add User</button>
      <UserFormModal
        open={open}
        onClose={() => setOpen(false)}
        onSave={(form) => {
          console.log('Saving user', form);
          setOpen(false);
        }}
      />
    </>
  );
}
```

**Notes**
- The submit button is disabled unless **both** `form.name.trim()` and `form.email.trim()` are non-blank (`!form.name?.trim() || !form.email?.trim()`) — whitespace-only name or email keeps Save disabled.
- The "Active" checkbox is derived from `form.status !== "Deactivated"`; toggling it writes `status: "Active"` or `status: "Deactivated"` back into the form (there's no separate boolean `active` field).
- "Role" options are a fixed list baked into the component: `Super Admin`, `Admin`, `Viewer`.

---

#### `UsersFilter`

Floating filter popover for the users list: name (free text), status, and role.

**Import**
```jsx
import { UsersFilter } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — (required) | Whether the panel is shown; the component returns `null` when `false`. |
| `onClose` | `() => void` | — (required) | Forwarded to the underlying `FilterPanel` — closes on outside click, Escape, or the panel's own X button. |
| `filters` | `{ name?, status?, role? }` | — (required, no default — accessed directly as `filters.name` etc.) | Current filter values. |
| `onChange` | `(nextFilters: object) => void` | — (required) | Called with `{ ...filters, ...patch }` whenever a field changes. |
| `onSearch` | `() => void` | — | Forwarded to the panel's Search button. |
| `onClear` | `() => void` | — | Forwarded to the panel's Reset/Clear controls. |
| `rows` | `Array<object>` | `[]` | The users table's current rows. Status and Role dropdown options are derived from these — distinct non-empty `status`/`role` values, sorted, prefixed with an "All" entry — the same pattern `LicenseFilter`/`ReportFilter` use. Without `rows`, both dropdowns render with empty option lists. |

**Example**
```jsx
import { useState } from 'react';
import { UsersFilter } from 'my Design System';

function UsersFilterExample({ users }) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({});

  return (
    <div style={{ position: 'relative' }}>
      <button aria-label="Filters" onClick={() => setOpen((v) => !v)}>Filters</button>
      <UsersFilter
        open={open}
        onClose={() => setOpen(false)}
        rows={users}
        filters={filters}
        onChange={setFilters}
        onSearch={() => console.log('Searching users with', filters)}
        onClear={() => setFilters({})}
      />
    </div>
  );
}
```

**Notes**
- `onClose` is genuinely wired through to `FilterPanel` in the current version — the popover's X button, outside-click, and Escape key all work correctly. (Previously `onClose` was accepted but not forwarded, so those affordances silently did nothing; this is now fixed.)
- Because `filters` is read directly (`filters.name`, no `filters ?? {}` fallback), always pass an object (even `{}`) rather than leaving `filters` undefined.

### Profile & Account

#### `ChangePasswordModal`

Form modal to set a new password, with a live strength meter and a confirm-password mismatch message. Optionally also collects and re-verifies the user's current password first.

**Import**
```jsx
import { ChangePasswordModal } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — (required) | Controls modal visibility. |
| `onClose` | `() => void` | — (required) | Called on Close/backdrop/Escape. |
| `onSave` | `(password: string, currentPassword: string) => void` | — (required) | Called with the new password and, when `requireCurrent` is set, the typed current password (`""` otherwise) when "Ok" is clicked. The second argument is new — older single-argument callers (`onSave={(password) => ...}`) still work unmodified, since a JS function simply ignores extra arguments it doesn't declare. |
| `requireCurrent` | `boolean` | `false` | When `true`, adds a "Current Password" `PasswordInput` (with `autoComplete="current-password"`) above the New/Confirm fields, and additionally disables Submit while that field is blank. |

**Example**
```jsx
import { useState } from 'react';
import { ChangePasswordModal } from 'my Design System';

function ChangePasswordExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Change Password</button>
      <ChangePasswordModal
        open={open}
        onClose={() => setOpen(false)}
        requireCurrent
        onSave={(password, currentPassword) => {
          console.log('Changing password, verifying against', currentPassword);
          setOpen(false);
        }}
      />
    </>
  );
}
```

**Notes**
- The submit button is disabled when the trimmed password is empty (`!password.trim()`), the confirm field is non-empty and doesn't match, or (with `requireCurrent`) the current-password field is blank. Passwords are now trimmed for this emptiness check — an earlier version of this modal checked the raw falsy value only, which let a whitespace-only password enable Submit; that gap is closed.
- `password`, `confirm`, and (when applicable) `current` all reset to `""` every time the modal opens.
- Does not close itself after save — call `onClose()` inside `onSave` as shown.

---

#### `PermissionEditor`

Inline (non-modal) checkbox list for toggling a fixed set of permission flags, with its own Save button.

**Import**
```jsx
import { PermissionEditor } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `permissions` | `string[]` | falls back to `[]` internally | Currently-granted permission labels. Must be a subset of the fixed list: `"View Licenses"`, `"Edit Licenses"`, `"Delete Licenses"`, `"Manage Users"`, `"View Reports"`, `"Manage Billing"`. Re-synced into internal state whenever `permissions` changes. |
| `onSave` | `(selected: string[]) => void` | — (required) | Called with the full array of currently-checked permission labels when "Save Permissions" is clicked. |

**Example**
```jsx
import { PermissionEditor } from 'my Design System';

function PermissionEditorExample() {
  return (
    <PermissionEditor
      permissions={['View Licenses', 'View Reports']}
      onSave={(selected) => console.log('Saving permissions', selected)}
    />
  );
}
```

**Notes**
- Not a modal — it's a plain block you place inside your own panel/modal/page (e.g. inside a profile drawer). There's no `open`/`onClose`.
- The permission list itself (`ALL_PERMISSIONS`) is hardcoded in the component; there's no prop to add custom permissions.

---

#### `ProfileActions`

Small vertical list of text links ("Rename user", "Change permission", "Change password") — a menu, not a modal.

**Import**
```jsx
import { ProfileActions } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `onRename` | `() => void` | — | Called when "Rename user" is clicked. Safe to omit (called via optional chaining). |
| `onChangePermission` | `() => void` | — | Called when "Change permission" is clicked. |
| `onChangePassword` | `() => void` | — | Called when "Change password" is clicked. |

**Example**
```jsx
import { useState } from 'react';
import { ProfileActions, ChangePasswordModal } from 'my Design System';

function ProfileActionsExample() {
  const [pwOpen, setPwOpen] = useState(false);

  return (
    <>
      <ProfileActions
        onRename={() => console.log('Rename user')}
        onChangePermission={() => console.log('Open permission editor')}
        onChangePassword={() => setPwOpen(true)}
      />
      <ChangePasswordModal open={pwOpen} onClose={() => setPwOpen(false)} onSave={() => setPwOpen(false)} />
    </>
  );
}
```

**Notes**
- All three action props are optional; clicking a link with no handler simply does nothing (`a.onClick?.()`).

### Reports

#### `ReportFilter`

Floating filter popover for the reports view: product, account, site, invoice, payment status, and a date range.

**Import**
```jsx
import { ReportFilter } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — (required) | Whether the panel is shown; the component returns `null` when `false`. |
| `onClose` | `() => void` | — (required) | Forwarded to the underlying `FilterPanel` — closes on outside click, Escape, or the panel's own X button. |
| `filters` | `{ product?, account?, site?, invoice?, payment?, range?: {from, to} }` | — (required, accessed directly, no internal fallback) | Current filter values. |
| `onChange` | `(nextFilters: object) => void` | — (required) | Called with `{ ...filters, ...patch }` on every field change. |
| `onSearch` | `() => void` | — | Forwarded to the panel's Search button. |
| `onClear` | `() => void` | — | Forwarded to the panel's Reset/Clear controls. |
| `rows` | `Array<object>` | `[]` | Source data rows used purely to derive dropdown option lists for Product/Account/Site/Invoice/Payment (deduplicated by that column's value — see Notes). |
| `keys` | `{ product?, account?, site?, invoice?, payment? }` | `{ product: "product", account: "account", site: "site", invoice: "invoice", payment: "payment" }` | Remaps which field on each `rows` entry backs a given dropdown, for datasets whose columns are named differently than the defaults. Merged over the default map, so you only need to override the fields that differ — e.g. passing just `site: "siteName"` derives the Site dropdown from `row.siteName` instead of `row.site`, while Product/Account/Invoice/Payment keep reading their default field names. |

**Example**
```jsx
import { useState } from 'react';
import { ReportFilter } from 'my Design System';

function ReportFilterExample() {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({ range: { from: null, to: null } });
  const rows = [
    { product: 'EnviroFRONT', account: 'Aaxis Nano', site: 'Noida Plant 3', invoice: 'PIC260010', payment: 'Paid' },
    { product: 'OCEMS', account: 'my Design System', site: 'Gmr Airport Hyderabad', invoice: 'PIC260600', payment: 'Pending' },
  ];

  return (
    <div style={{ position: 'relative' }}>
      <button aria-label="Filters" onClick={() => setOpen((v) => !v)}>Filters</button>
      <ReportFilter
        open={open}
        onClose={() => setOpen(false)}
        filters={filters}
        onChange={setFilters}
        onSearch={() => console.log('Searching report with', filters)}
        onClear={() => setFilters({ range: { from: null, to: null } })}
        rows={rows}
      />
    </div>
  );
}
```

**Notes**
- `onClose` is genuinely wired through to `FilterPanel` in the current version — outside click, Escape, and the X button all correctly close the panel. (Previously accepted but not forwarded; now fixed.)
- Product/Account/Site/Invoice, **and Payment**, are all computed from `rows` the same way — the unique, non-empty values of that column via `uniqueOptions(rows, key)` (using the resolved key from `keys`) — none of the five dropdowns are static lists baked into the component, unlike `LicenseFilter`'s free-text fields. (Payment is not a fixed `Paid`/`Pending` dropdown, despite that being the natural assumption from the field's name — whatever values actually show up in your rows' payment field are what gets offered.)
- The date field uses `DateRangePicker`; pass `filters.range` as `{ from, to }` (Date objects or parseable strings), defaulting to `{ from: null, to: null }` if unset.

---

#### `InvoicePdfViewer`

Placeholder/stand-in PDF page viewer with Prev/Next page controls (does not render an actual PDF — intended to be swapped for a real pdf.js-powered viewer, but ships as a page-count-aware placeholder).

**Import**
```jsx
import { InvoicePdfViewer } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `pageCount` | `number` | `2` | Total number of pages. Coerced to at least `1` (`Math.max(1, Number(pageCount) || 1)`). |
| `invoiceNo` | `string` | — | Displayed as the document title, e.g. `"PIC260010 — page 1"`. Falls back to `"Invoice"` if omitted. |
| `className` | `string` | — | Extra classes on the root container. |

**Example**
```jsx
import { InvoicePdfViewer } from 'my Design System';

function InvoicePdfExample() {
  return <InvoicePdfViewer invoiceNo="PIC260010" pageCount={4} />;
}
```

**Notes**
- Not a modal — typically rendered inside `InvoicePreviewModal`'s "pdf" tab.
- Internal page state clamps itself back into range whenever `pageCount` changes, so switching to a shorter document won't leave the viewer stuck past the last page.

---

#### `ExcelPreviewViewer`

Renders an array of plain objects as an HTML table — a stand-in preview for a renewal Excel export.

**Import**
```jsx
import { ExcelPreviewViewer } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `rows` | `Array<object>` | `[]` | Row data. Column headers are derived from `Object.keys()` of the **first** object found in the array, so every row should share the same shape. |

**Example**
```jsx
import { ExcelPreviewViewer } from 'my Design System';

function ExcelPreviewExample() {
  const rows = [
    { License: 'EF-1M-5M-3Y-PO-CPCB', Account: 'Aaxis Nano', RenewalAmount: 25000 },
    { License: 'DC-11-XX-11F-PR-CAA', Account: 'my Design System', RenewalAmount: 18000 },
  ];
  return <ExcelPreviewViewer rows={rows} />;
}
```

**Notes**
- Not a modal — typically rendered inside `InvoicePreviewModal`'s "excel" tab.
- Shows "No renewal Excel data to preview." when `rows` is empty or contains no plain-object rows.

---

#### `ReportTablePanel`

A complete, self-contained report table: fetches its own paginated data, owns its own filter popover (dropdowns you configure + a built-in date range), and renders through `MobileTableWrapper`. This is the full, filterable report — contrast with `ResourceTable` (below, under Dashboard Widgets), which is a lightweight six-row *preview* of a resource with a "View all" link rather than real pagination/filters.

**Import**
```jsx
import { ReportTablePanel } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | — (required) | Panel heading, also used in the filter popover's title (`"Filter {title}"`) and the default fetch-error message. |
| `columns` | `Array<Column>` | — (required) | `MobileTableWrapper` column definitions (same shape as `DataTable`'s `columns`). |
| `fetchPage` | `({ page, pageSize, filters, dateRange }) => Promise<{ items: Array, total: number }>` | — (required) | Called on mount and whenever page, filters, or the date range change. A thrown/rejected call is caught and shown inline with a Retry button. |
| `filterFields` | `Array<{ key, label, options: Array<{value,label}> }>` | `[]` | Extra dropdown filters shown in the popover alongside the built-in date range — one `FilterField` + `Dropdown` rendered per entry, in order. |
| `defaultDateRange` | `{ from: Date, to: Date } \| null` | `null` | Initial date filter value, and what it resets to when "Clear" is clicked. |
| `pageSize` | `number` | `20` | Rows per page. |
| `emptyMessage` | `string` | `"No records found."` | Forwarded to `MobileTableWrapper`. |
| `note` | `string` | — | Optional caveat line rendered above the table — useful for a report whose backend isn't fully reliable yet, so the caveat travels with the component rather than living only in a code comment. |
| `dense` | `boolean` | — | Forwarded to the inner `MobileTableWrapper` — reduces body cell padding/font size for a more compact table. |
| `headerAlign` | `"auto" \| "center" \| "right"` | — | Forwarded to the inner `MobileTableWrapper` — table-wide default alignment for both header labels and body cells. |

**Example**
```jsx
import { ReportTablePanel } from 'my Design System';

function LicenseExpiryReport({ fetchExpiryReportPage, licenseTypes }) {
  return (
    <ReportTablePanel
      title="License Expiry Report"
      columns={[
        { key: 'licenseName', header: 'License Name' },
        { key: 'accountName', header: 'Account Name' },
        { key: 'expiryDate', header: 'Expiry Date' },
        { key: 'daysLeft', header: 'Days Left', align: 'right' },
      ]}
      fetchPage={fetchExpiryReportPage}
      filterFields={[
        { key: 'licenseType', label: 'License Type', options: licenseTypes.map((t) => ({ value: t.name, label: t.name })) },
      ]}
      defaultDateRange={{ from: new Date(new Date().getFullYear(), 0, 1), to: new Date() }}
      pageSize={25}
    />
  );
}
```

**Notes**
- Self-contained UI: `Panel` (title + body) + `Pagination` + a "Filter (N)" toggle button that opens a `FilterPanel` built from `filterFields` plus a `DateRangePicker`. Clicking Search resets to page 1 and closes the popover; Clicking Clear resets both the extra filters and the date range to `defaultDateRange`.
- `MobileTableWrapper`'s `primaryFields` is auto-derived as the first two `columns` keys, and the table always renders in `serverSide` mode (no client-side re-filtering of an already-paginated page).
- Since each instance manages its own fetch/paging/filter state independently, a page built from several `ReportTablePanel`s (e.g. a multi-report dashboard) needs no shared state at all — each panel is a drop-in unit.

### Dashboard Widgets

#### `LicenseTrendChart`

Lightweight inline SVG line chart comparing total license count vs. account-wise license count over time — no external chart library dependency.

**Import**
```jsx
import { LicenseTrendChart } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `Array<{ label: string, total: number, accountWise: number }>` | `[]` | One point per period. `total`/`accountWise` are coerced with `Number(...) || 0`. The chart's Y-axis max is `Math.max(1, ...totals)`, so the line is scaled to the largest `total` value in the series (not `accountWise`). |

**Example**
```jsx
import { LicenseTrendChart } from 'my Design System';

function TrendExample() {
  const data = [
    { label: 'Jan', total: 120, accountWise: 80 },
    { label: 'Feb', total: 135, accountWise: 90 },
    { label: 'Mar', total: 150, accountWise: 95 },
  ];
  return <LicenseTrendChart data={data} />;
}
```

**Notes**
- Purely presentational — no click handlers or tooltips; renders a solid line for "Total license" and a dashed line for "Account-wise", plus a text legend and per-point labels underneath.

---

#### `UpcomingRenewalChart`

Lightweight inline bar chart of upcoming renewal counts/amounts per period.

**Import**
```jsx
import { UpcomingRenewalChart } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `Array<{ label: string, value: number }>` | `[]` | One bar per entry. `value` is coerced with `Number(v.value) || 0`. Bars are scaled against `Math.max(1, ...values)`. |

**Example**
```jsx
import { UpcomingRenewalChart } from 'my Design System';

function RenewalChartExample() {
  const data = [
    { label: 'Aug', value: 12 },
    { label: 'Sep', value: 8 },
    { label: 'Oct', value: 15 },
  ];
  return <UpcomingRenewalChart data={data} />;
}
```

**Notes**
- Each bar shows its numeric value above it and its `label` below; bars use `key={d.label}`, so labels should be unique within one `data` array.

---

#### `ResourceTable`

A dashboard panel that fetches and shows a short preview slice of a resource — a title, up to `limit` rows, and (when there's more data than that) a "View all N" link. The lightweight sibling of `ReportTablePanel`: no filters, no real pagination, just enough of a peek to justify the panel and hand off to a full report/list screen.

**Import**
```jsx
import { ResourceTable } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | — (required) | Panel heading. |
| `path` | `string` | — (required) | API resource path, e.g. `"/api/reports"`, fetched through the shared API client. |
| `columns` | `Array<Column>` | — (required) | `MobileTableWrapper` column definitions. |
| `limit` | `number` | `6` | Rows fetched and shown — a short preview, not the full dataset. |
| `sortKey` | `string` | — | Server-side sort column; sent as a query param only when set. |
| `sortDirection` | `"asc" \| "desc"` | `"asc"` | — |
| `rowKey` | `(row) => string \| number` | `(r) => r.id` | — |
| `emptyMessage` | `string` | `"Nothing to show."` | — |
| `onOpenFull` | `() => void` | — | If provided **and** the resource's total count exceeds the number of rows shown, renders a "View all N" ghost button in the panel header (N formatted with `Intl.NumberFormat("en-IN")`). Omitted or with nothing extra to show, no button renders. |
| `client` | api client | `getApiClient()` | Override for the API client the fetch goes through — mainly useful in tests. |

**Example**
```jsx
import { ResourceTable } from 'my Design System';
import { useNavigate } from 'react-router-dom';

function RecentReportsPanel() {
  const navigate = useNavigate();

  return (
    <ResourceTable
      title="Recent Reports"
      path="/api/reports"
      columns={[
        { key: 'invoice', header: 'Invoice' },
        { key: 'account', header: 'Account' },
        { key: 'amount', header: 'Amount', align: 'right' },
      ]}
      limit={6}
      sortKey="createdAt"
      sortDirection="desc"
      onOpenFull={() => navigate('/reports')}
    />
  );
}
```

**Notes**
- Fetches once on mount as `GET {path}?page=1&limit={limit}[&sortKey=...&sortDir=...]` and shows loading/error (with Retry) states through `MobileTableWrapper` in `serverSide` mode — there's no refetch-on-prop-change beyond the initial mount, so remounting the component (e.g. via a changed `key`) is the way to force a refresh.
- Reach for `ReportTablePanel` instead when a screen needs real pagination and filters rather than a fixed-size preview with a "view all" escape hatch.

---

#### `ChartWithData`

Pairs a chart with the literal numbers it's plotting, shown as a compact scrollable table underneath — so the same panel serves both an at-a-glance visual and the exact figures, without a reader needing to hover every bar/slice to get a real number.

**Import**
```jsx
import { ChartWithData } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | — (required) | Panel heading. |
| `chart` | `ReactNode` | — (required) | The chart element rendered above the table — typically a `BarChart`, `DonutChart`, `LicenseTrendChart`, or `UpcomingRenewalChart`. |
| `columns` | `Array<Column>` | — (required) | `MobileTableWrapper` column definitions for the data table shown under the chart. |
| `rows` | `Array<object>` | — (required) | The same data the chart was given, rendered as a table beneath it (scrolls internally, capped at a fixed max height — not paginated). |
| `rowKey` | `(row) => string \| number` | — (required) | — |
| `emptyMessage` | `string` | `"No data."` | — |
| `dense` | `boolean` | — | Forwarded to the inner `MobileTableWrapper` — reduces body cell padding/font size for a more compact table. |
| `headerAlign` | `"auto" \| "center" \| "right"` | — | Forwarded to the inner `MobileTableWrapper` — table-wide default alignment for both header labels and body cells. |

**Example**
```jsx
import { ChartWithData, BarChart } from 'my Design System';

function LicensesByAccountPanel({ accounts }) {
  return (
    <ChartWithData
      title="Licenses by Account"
      chart={
        <BarChart
          data={accounts.map((a) => ({ label: a.name, values: [a.active, a.inactive] }))}
          series={['Active', 'Inactive']}
        />
      }
      columns={[
        { key: 'name', header: 'Account' },
        { key: 'active', header: 'Active', align: 'right' },
        { key: 'inactive', header: 'Inactive', align: 'right' },
      ]}
      rows={accounts}
      rowKey={(row) => row.name}
    />
  );
}
```

**Notes**
- Purely presentational — no fetching, and no `loading`/`error`/`onRetry` state; feed it data you've already fetched (contrast with `ResourceTable`, which fetches for you).
- The table underneath is deliberately not paginated — it's meant to hold the same, already-bounded dataset the chart is plotting, not to double as a full data grid.

### General

#### `ChangesPreviewModal`

Read-only modal showing a three-column diff table (Field / Previous / Current) — a lighter-weight alternative to `TimelineModal` for showing a single set of pending or applied changes.

**Import**
```jsx
import { ChangesPreviewModal } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — (required) | Controls modal visibility. |
| `onClose` | `() => void` | — (required) | Called on Close/backdrop/Escape (there's no footer button — closing is via the header X, backdrop click, or Escape only). |
| `title` | `string` | `"Changes"` | Modal header title. |
| `fields` | `Array<{ label: string, previous: string, current: string }>` | `[]` | Rows to diff. Rendered as `label` in the middle column-header-free grid, `previous` highlighted red/offline, `current` highlighted green/online. |

**Example**
```jsx
import { useState } from 'react';
import { ChangesPreviewModal } from 'my Design System';

function ChangesPreviewExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>View Changes</button>
      <ChangesPreviewModal
        open={open}
        onClose={() => setOpen(false)}
        title="Pending License Changes"
        fields={[
          { label: 'Status', previous: 'Deactivated', current: 'Active' },
          { label: 'Renewal Amount', previous: '₹18,000', current: '₹25,000' },
        ]}
      />
    </>
  );
}
```

**Notes**
- No footer/action buttons are rendered at all — this modal has no `footer` prop passed to the underlying `Modal`, so it is purely informational.

---

#### `InvoicePreviewModal`

Slide-over panel with a two-tab preview (Invoice PDF / Renewal Excel) and an optional "send by email" action. Intended to host `InvoicePdfViewer` and `ExcelPreviewViewer` as `children`, switched by the active tab.

**Import**
```jsx
import { InvoicePreviewModal } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` | — (required) | Controls slide-over visibility (`width="640px"`). |
| `onClose` | `() => void` | — (required) | Called on Close/backdrop/Escape. |
| `customerEmail` | `string` | — | If provided, shows an email row with a "Send" button (only rendered when both `customerEmail` and `onSendEmail` are set — see Notes). |
| `activeTab` | `"pdf" \| "excel"` | — | Controlled active tab value passed to the internal `Tabs` component. |
| `onTabChange` | `(value: "pdf" \| "excel") => void` | — | Called when the user clicks a different tab. |
| `onSendEmail` | `() => void` | — | Called when "Send" is clicked. The Send button (and thus the whole email row, since it also requires `customerEmail`) is only shown when this is provided. |
| `children` | `React.ReactNode` | — | Body content for the currently active tab — typically `InvoicePdfViewer` or `ExcelPreviewViewer`, swapped by your own logic based on `activeTab`. |

**Example**
```jsx
import { useState } from 'react';
import { InvoicePreviewModal, InvoicePdfViewer, ExcelPreviewViewer } from 'my Design System';

function InvoicePreviewExample() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('pdf');

  return (
    <>
      <button onClick={() => setOpen(true)}>Preview Invoice</button>
      <InvoicePreviewModal
        open={open}
        onClose={() => setOpen(false)}
        activeTab={tab}
        onTabChange={setTab}
        customerEmail="accounts@aaxisnano.com"
        onSendEmail={() => console.log('Sending invoice email')}
      >
        {tab === 'pdf'
          ? <InvoicePdfViewer invoiceNo="PIC260010" pageCount={3} />
          : <ExcelPreviewViewer rows={[{ License: 'EF-1M-5M-3Y-PO-CPCB', Amount: 25000 }]} />}
      </InvoicePreviewModal>
    </>
  );
}
```

**Notes**
- Both tab options ("Invoice PDF" / "Renewal Excel") are always shown — there's no prop to hide one; you control which body content renders via `children` and your own `activeTab` state.

---

#### `LicenseAgentButton`

Floating circular button (bottom-right corner, fixed position) intended for Super-Admin users to launch an AI license agent, typically in a new browser tab.

**Import**
```jsx
import { LicenseAgentButton } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `onOpen` | `() => void` | — | If provided, called instead of the built-in default behavior. Use this to open your own agent UI (e.g. a modal or route). |
| `className` | `string` | — | Extra classes merged onto the button (appended after the built-in fixed-position/styling classes). |

**Example**
```jsx
import { LicenseAgentButton } from 'my Design System';

function AgentButtonExample({ isSuperAdmin }) {
  if (!isSuperAdmin) return null;
  return (
    <LicenseAgentButton
      onOpen={() => window.open('/ai-agent', '_blank')}
    />
  );
}
```

**Notes**
- Not a modal — it's a single `<button>`, always visible once rendered (gate it behind your own role check, e.g. `isSuperAdmin`, as the component itself does not check permissions).
- If `onOpen` is omitted, clicking it calls `window.open("", "_blank")` and writes a minimal placeholder HTML page into the new tab (a stand-in for a real agent integration) — pass `onOpen` in production to replace this stub behavior.

---

#### `ReportWidget`

Generic card/panel shell for dashboard report widgets: header with title + optional Filter/Reload/Export icon buttons, and a body that shows a loading spinner or your `children`.

**Import**
```jsx
import { ReportWidget } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | — | Widget header title. |
| `loading` | `boolean` | — | When true, renders a `Loader` ("Loading widget...") in place of `children`. |
| `error` | `string \| Error` | — | When set (and `loading` is falsy), renders an inline error message instead of `children`. |
| `onRetry` | `() => void` | — | If provided alongside `error`, shows a "Retry Request" button inside the error state. |
| `onReload` | `() => void` | — | If provided, shows a Reload icon button in the header. |
| `onExport` | `() => void` | — | If provided, shows an Export icon button in the header. |
| `onFilter` | `() => void` | — | If provided, shows a Filter icon button in the header. |
| `children` | `React.ReactNode` | — | Widget body content, shown when both `loading` and `error` are falsy — typically a chart like `LicenseTrendChart` or `UpcomingRenewalChart`. |
| `className` | `string` | — | Extra classes on the root card container. |

**Example**
```jsx
import { useState } from 'react';
import { ReportWidget, LicenseTrendChart } from 'my Design System';

function LicenseTrendWidgetExample() {
  const [loading, setLoading] = useState(false);
  const data = [
    { label: 'Jan', total: 120, accountWise: 80 },
    { label: 'Feb', total: 135, accountWise: 90 },
  ];

  return (
    <ReportWidget
      title="License Trend"
      loading={loading}
      onReload={() => { setLoading(true); setTimeout(() => setLoading(false), 800); }}
      onExport={() => console.log('Exporting chart data')}
    >
      <LicenseTrendChart data={data} />
    </ReportWidget>
  );
}
```

**Notes**
- Not a modal — a plain bordered card meant to sit in a dashboard grid.
- The Filter/Reload/Export buttons only render when their corresponding handler prop is supplied; omit a handler to hide that button.
- The `error`/`onRetry` pair mirrors the same inline error UI used by `DataTable` and `MobileCardList`, so a server-bound widget (e.g. via `SlsReportDashboard`'s `renewalFetcher`/`trendFetcher`) looks and behaves consistently with server-bound tables.


---

## Ready-to-Use Pages

> End-to-end wiring these pages to a real backend (REST endpoints, pagination, auth headers, etc.) is documented in the **Server Data Binding & Utilities** section below.

Most of these are full, pre-composed screens (toolbar + table/cards + modals) rather than small building blocks. The common integration pattern across them (verified directly in `LicensePage.jsx`, `UsersPage.jsx`, and `MasterListPage.jsx`, which backs the three masters pages) is:

- Each data page keeps its own local `React.useState` array seeded from a `data/mock.js` factory (e.g. `makeInitialLicenses()`, `makeInitialUsers()`) as a **local/mock fallback** — so the page renders and is fully interactive with zero configuration.
- If you pass `fetcher` (or the page picks one up automatically from `ServerDataProvider` context — see below), the page switches into **server-side mode**: it uses `useServerDataBinding` internally to drive pagination/sorting/search/filters against your `fetcher`, and the local array is no longer the source of truth for the table's rows.
- `onCreate`, `onUpdate`, and `onDelete` are independent optional callbacks for the add/edit/delete flows. If you don't pass them, the page just mutates its local in-memory array instead (optimistic local edits). If you do pass them, the page `await`s your callback and then, only in server-side mode, calls `refetch()` on the server binding to reload from your API.
- `serverSide` (boolean) can be passed to force server mode on/off explicitly; otherwise it defaults to `!!activeFetcher` (i.e. true automatically as soon as a fetcher is available from either the `fetcher` prop or `ServerDataProvider` context).
- `onToast` is a common optional callback, `(message: string) => void`, used to surface success/error toasts from the page's internal actions (you decide how to display it — e.g. wire it to your own toast/snackbar component).

`LicenseTypePage`, `LicenseTermPage`, and `ProductTypePage` are thin, pre-configured wrappers around `MasterListPage` (fixed columns + `FormModal` + a default `endpointKey`) that forward `fetcher`, `serverSide`, `endpointKey`, `onCreate`, `onUpdate`, `onDelete`, `initialData`, and `onToast` straight through — so they support the same server-binding contract as `MasterListPage` itself, just with sensible defaults already filled in.

### `LicensePage`

The main license-management screen: searchable/filterable data grid (desktop) or card list (mobile) of licenses, bulk selection + toolbar actions, and a full set of modals (add/edit, delete, activate/deactivate, renewal streams, timeline/history, invoice preview, ticket validation).

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `fetcher` | `Function` | `undefined` | `({ page, pageSize, sortKey, sortDirection, search, filters }) => Promise<{ data, total }>`. Enables server-side mode when present (or picked up from `ServerDataProvider` context under the `"licenses"` endpoint key). |
| `serverSide` | `boolean` | `undefined` | Forces server-side mode on/off; defaults to `!!activeFetcher`. |
| `onCreate` | `Function` | `undefined` | `(form) => Promise<void>`. |
| `onUpdate` | `Function` | `undefined` | `(idOrIds, patch) => Promise<void>` (also used by activate/deactivate/update-property flows). |
| `onDelete` | `Function` | `undefined` | `(idOrIds) => Promise<void>`. |
| `initialData` | `Array` | `makeInitialLicenses()` | Seed data for local/mock mode. |
| `onToast` | `Function` | `undefined` | `(message: string) => void`. |

**Example**
```jsx
import { LicensePage } from 'my Design System';

<Route path="/licenses" element={<LicensePage onToast={(msg) => toast(msg)} />} />
```

---

### `HomeDashboard`

A simple materials-by-customer summary screen: a customer filter dropdown over a responsive table/card list (via `MobileTableWrapper`).

Three ways to feed it data, checked in this order: (1) a static `data` array always wins and is rendered as-is with no fetching; (2) otherwise, `fetcher` (or a fetcher resolved from `ServerDataProvider` context under the `"materials"` endpoint key) puts it into server-side mode, with the customer dropdown sent through as a `customer` filter; (3) otherwise it falls back to bundled local demo data (`makeMaterialsData()`).

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `Array<{ id, customer, material, qty }>` | `undefined` | Static rows to display. When provided, always wins over `fetcher`/context — no fetching happens. |
| `fetcher` | `Function` | `undefined` | `({ page, pageSize, sortKey, sortDirection, search, filters }) => Promise<{ data, total }>`. Enables server-side mode when present (or picked up from `ServerDataProvider` context under the `"materials"` endpoint key), unless `data` is also set. |
| `serverSide` | `boolean` | `undefined` | Forces server-side mode on/off; ignored when `data` is set. |
| `endpointKey` | `string` | `"materials"` | Key used to look up a fetcher from `ServerDataProvider` context. |
| `onRetry` | `() => void` | `undefined` | Retry handler used in local/static mode's error UI; ignored in server-side mode, where `refetch()` is used automatically instead. |

**Example**
```jsx
import { HomeDashboard } from 'my Design System';

// Local/demo mode
<Route path="/" element={<HomeDashboard />} />

// Server-bound mode
import { createRestAdapter } from 'my Design System';
<Route
  path="/"
  element={
    <HomeDashboard
      fetcher={createRestAdapter({ baseUrl: 'https://api.example.com', endpoint: '/api/materials' })}
    />
  }
/>
```

**Notes**
- In server mode, the customer dropdown's options are derived from the currently-loaded rows only (not a distinct global list) — for a large dataset, wire up your own "distinct customers" endpoint and pass its results into a custom dropdown if you need the full set.

---

### `ReportPage`

Invoice & payment report screen: filterable table/cards with a date-range-aware filter panel, and a row-click invoice preview modal (PDF/Excel tabs).

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `fetcher` | `Function` | `undefined` | `({ page, pageSize, sortKey, sortDirection, search, filters }) => Promise<{ data, total }>`. Enables server-side mode when present (or picked up from `ServerDataProvider` context under the `"reports"` endpoint key). |
| `serverSide` | `boolean` | `undefined` | Forces server-side mode on/off; defaults to `!!activeFetcher`. |
| `endpointKey` | `string` | `"reports"` | Key used to look up a fetcher from `ServerDataProvider` context. |
| `initialData` | `Array` | `makeInitialReports()` | Seed data for local/mock mode. |
| `onToast` | `Function` | `undefined` | Called on report download / invoice email actions. |

In server mode, the date-range filter panel is sent through as part of the server binding's `filters`, and the desktop table's loading/error/retry states come straight from the server fetch (via `DataTable`'s built-in `loading`/`error`/`onRetry` support). In local mode, the date-range filter continues to run client-side against `initialData`, matching the original demo behavior.

**Example**
```jsx
import { ReportPage } from 'my Design System';

// Local/demo mode
<Route path="/reports" element={<ReportPage onToast={(msg) => toast(msg)} />} />

// Server-bound mode
import { createRestAdapter } from 'my Design System';
<Route
  path="/reports"
  element={
    <ReportPage
      fetcher={createRestAdapter({ baseUrl: 'https://api.example.com', endpoint: '/api/reports' })}
      onToast={(msg) => toast(msg)}
    />
  }
/>
```

---

### `UsersPage`

User management screen: search/filter, add/edit modal, activate/deactivate per row, desktop table + mobile card list.

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `fetcher` | `Function` | `undefined` | Same shape as `LicensePage`; enables server-side mode (or picked up from context under `"users"`). |
| `serverSide` | `boolean` | `undefined` | Forces server-side mode on/off. |
| `onCreate` | `Function` | `undefined` | `(form) => Promise<void>`. |
| `onUpdate` | `Function` | `undefined` | `(user, nextUser) => Promise<void>` (also used for the activate/deactivate toggle). |
| `onDelete` | `Function` | `undefined` | `(user) => Promise<void>` — called on the deactivation confirm dialog. |
| `initialData` | `Array` | `makeInitialUsers()` | Seed data for local/mock mode. |
| `onToast` | `Function` | `undefined` | `(message: string) => void`. |

**Example**
```jsx
import { UsersPage } from 'my Design System';

<Route path="/users" element={<UsersPage onToast={(msg) => toast(msg)} />} />
```

---

### `SlsReportDashboard`

The main analytics screen: a responsive grid of chart widgets (`UpcomingRenewalChart`, `LicenseTrendChart`) inside `ReportWidget` cards, with reload/filter/export affordances.

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `renewalFetcher` | `() => Promise<Array<{ label, value }>>` | `undefined` | If provided, loads the "Upcoming Renewals" chart from your API on mount, shows the widget's built-in loading/error UI while it runs, and re-runs it when the widget's Reload button is clicked. Omit it to use local demo data (reload then just randomizes the demo values in place). |
| `trendFetcher` | `() => Promise<Array<{ label, total, accountWise }>>` | `undefined` | Same idea for the "License Trend" chart. Omit it to use bundled local demo data. |
| `onToast` | `Function` | `undefined` | Called after export actions (and after local-mode reloads). |

Each fetcher is independent — you can wire up one chart to a real backend and leave the other on local demo data. Failures from either fetcher are shown inline on that widget via `ReportWidget`'s `error`/`onRetry` support, without affecting the other widget.

**Example**
```jsx
import { SlsReportDashboard } from 'my Design System';

// Local/demo mode
<Route path="/dashboard" element={<SlsReportDashboard onToast={(msg) => toast(msg)} />} />

// Server-bound mode
<Route
  path="/dashboard"
  element={
    <SlsReportDashboard
      renewalFetcher={() => fetch('/api/reports/upcoming-renewals').then((r) => r.json())}
      trendFetcher={() => fetch('/api/reports/license-trend').then((r) => r.json())}
      onToast={(msg) => toast(msg)}
    />
  }
/>
```

---

### `UserProfilePage`

The signed-in user's own profile screen: avatar/name/email card with rename, change-permissions, and change-password actions, plus a role/status panel.

**This page does not implement authentication.** It only edits the profile fields (display name, permissions, password) of whichever user your app has already authenticated — pass that user's data in via the `user` prop.

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `user` | `{ name, email, role, status, permissions: string[] }` | bundled demo user | The current user's profile data to display. Provide this from your own auth/session state. |
| `onUpdateProfile` | `(patch: { name?, permissions? }) => Promise<void>` | `undefined` | Called with just the changed field(s) when the user saves a rename or a permissions edit. If omitted, edits are applied to local state only (demo behavior). |
| `onChangePassword` | `(password: string) => Promise<void>` | `undefined` | Called with the new password when the Change Password modal is submitted. If omitted, the modal just closes locally without persisting anything. |
| `onToast` | `Function` | `undefined` | Called after name/permissions/password updates (success or failure — errors from `onUpdateProfile`/`onChangePassword` are caught and surfaced via `onToast` with the error's `message`). |

**Example**
```jsx
import { UserProfilePage } from 'my Design System';

// Local/demo mode
<Route path="/profile" element={<UserProfilePage onToast={(msg) => toast(msg)} />} />

// Server-bound mode
<Route
  path="/profile"
  element={
    <UserProfilePage
      user={currentUser}
      onUpdateProfile={(patch) => api.patch(`/api/users/${currentUser.id}`, patch)}
      onChangePassword={(password) => api.post(`/api/users/${currentUser.id}/password`, { password })}
      onToast={(msg) => toast(msg)}
    />
  }
/>
```

---

### `ServerSidePage`

A live demo/playground screen for the server-side data binding tooling itself: a `ServerDataTable` bound to an in-memory `createMockServerHandler` fetcher (with adjustable simulated network latency and a "simulate error" toggle), plus `AsyncDropdown`/`AsyncMultiSelectDropdown` examples.

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `onToast` | `Function` | `undefined` | Called on row click / dropdown selection / error-simulation toggle. |

**Example**
```jsx
import { ServerSidePage } from 'my Design System';

<Route path="/server-demo" element={<ServerSidePage onToast={(msg) => toast(msg)} />} />
```

**Notes**
- This page is primarily a reference implementation showing how `createMockServerHandler` + `ServerDataTable` + async dropdowns fit together — useful to read as a template for your own server-bound screens.

---

### `LoginForm` (`src/pages/auth/LoginForm.jsx`)

The first step of the two-step sign-in flow: an icon-labeled identifier field, a full-width "Continue" button, and a "contact customer care" prompt for accounts that don't exist yet — laid out inside `AuthLayout`'s split-screen brand panel + card (so it automatically follows whichever of the library's 4 themes is active).

With no extra props this is a demo-only screen — `validate` defaults to a simulated lookup against a hardcoded known-emails allowlist (`admin@my Design System.com`) — but every part of that is now overridable, so you can wire it to a real backend without forking the component.

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `onContinue` | `Function` | — (required, called unguarded) | `(value: string) => void \| Promise<void>`, called once `validate` resolves successfully. May be async; a rejection/throw is caught and shown the same way as a `validate` failure. |
| `validate` | `Function` | simulated known-emails check | `(value: string) => void \| Promise<void>`. Throw (or return a rejected promise) with an `Error` whose `.message` is the text to show under the field to reject; resolve successfully to proceed. Pass `async () => {}` to skip local validation entirely and always continue (the natural choice when your backend only has a single combined login call, with the real check happening in `LoginPasswordForm`'s `onSignIn`). |
| `label` | `string` | `"Email address"` | Field label — set to `"Username"` etc. to match your backend's identifier. |
| `placeholder` | `string` | `"you@company.com"` | Field placeholder. |
| `autoComplete` | `string` | `"username"` | Passed to the underlying `<input>`. |
| `heading` | `string` | `"Welcome back"` | Card heading text. |
| `subheading` | `string` | `"Sign in to your my Design System workspace"` | Card subheading text. |
| `hint` | `ReactNode` | `undefined` | Overrides the small tip chip below the form. When omitted, the chip only auto-shows (with the demo tip text) if you're also using the default `validate` — pass your own `hint`, or `null` to hide it, once you supply a real `validate`. |
| `footer` | `ReactNode` | `undefined` | Overrides the "New here? / Don't have an account?" block. Pass `null` to hide it entirely. |

**Example**
```jsx
import { LoginForm, LoginPasswordForm } from 'my Design System';

// Demo mode — identical to before
function AuthFlowDemo() {
  const [email, setEmail] = React.useState(null);
  return email
    ? <LoginPasswordForm email={email} onBack={() => setEmail(null)} onSignIn={() => navigate('/')} />
    : <LoginForm onContinue={setEmail} />;
}

// Real backend — single combined login call happens in onSignIn below,
// so step 1 just collects the identifier and always continues.
function AuthFlowReal() {
  const [username, setUsername] = React.useState(null);
  return username
    ? (
      <LoginPasswordForm
        email={username}
        onBack={() => setUsername(null)}
        onSignIn={async (password) => {
          await myAuthService.login(username, password); // throws on 401 with a real message
          navigate('/');
        }}
        hint={null}
      />
    )
    : (
      <LoginForm
        label="Username"
        placeholder="you@company.com"
        validate={async () => {}}
        onContinue={setUsername}
        hint={null}
      />
    );
}
```

**Notes**
- Passing `validate` fully replaces the built-in known-emails check — there is no way to keep the demo allowlist *and* add extra checks; if you need both, call the demo logic yourself inside your own `validate` function.
- The demo tip chip (`hint`) auto-hides as soon as you pass a custom `validate`, since "try admin@my Design System.com" stops being true — set your own `hint` (or `null`) at that point.

---

### `LoginPasswordForm` (`src/pages/auth/LoginPasswordForm.jsx`)

The second step: an avatar badge (the email's first letter) above the previously entered email (tap to go back), a password field, and a full-width "Sign in" button. Also laid out inside `AuthLayout`.

With no extra props, `onSignIn` is expected to just accept any non-empty password — this is a demo-only screen. Pass an async `onSignIn` that calls your real login endpoint to wire this up to a real backend.

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `email` | `string` | — | Displayed email/identifier from the previous step. |
| `onBack` | `Function` | — | Called when the user clicks the email/back chevron button. |
| `onSignIn` | `Function` | — | `(password: string) => void \| Promise<void>`, called once the password field is non-empty. Receives the entered password directly. May be async — throw (or reject) with an `Error` whose `.message` is your backend's real error text (e.g. `"Invalid username or password"`) to show it via the same inline error UI used everywhere else in the library; resolve successfully to proceed (the parent decides what "proceed" means, e.g. navigating away). |
| `hint` | `ReactNode` | `"Demo tip: any password works"` | The small tip chip below the form. Pass `null` to hide it once you're wired to a real backend — the default text is no longer true at that point. |
| `footer` | `ReactNode` | `undefined` | Overrides the "Don't have an account?" block. Pass `null` to hide it entirely. |

**Example** — see the `LoginForm` example above (they're designed to be used together).

**Notes**
- Unlike `LoginForm`'s `onContinue`, `onSignIn` always receives the password value — you don't need to hold it in state yourself. Existing zero-argument callers (`onSignIn={() => ...}`) keep working unchanged; the extra argument is simply ignored.
- There is no artificial delay anymore — the loading spinner reflects however long your real `onSignIn` actually takes. In pure demo usage (a synchronous or near-instant `onSignIn`) the spinner will just flash briefly, which is expected.

---

### `LicenseTypePage` (`src/pages/masters/LicenseTypePage.jsx`)

Lists license types (name, description, product, product type) with add/edit/delete, built on top of `MasterListPage`.

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `fetcher` | `Function` | `undefined` | Enables server-side mode (or resolved from `ServerDataProvider` context via `endpointKey`). |
| `serverSide` | `boolean` | `undefined` | Forces server-side mode on/off. |
| `endpointKey` | `string` | `"licenseTypes"` | Key used to look up a fetcher from `ServerDataProvider` context. |
| `onCreate` | `Function` | `undefined` | `(form) => Promise<void>`. |
| `onUpdate` | `Function` | `undefined` | `(item, patch) => Promise<void>` (also drives the status toggle). |
| `onDelete` | `Function` | `undefined` | `(item) => Promise<void>`. |
| `initialData` | `Array` | `makeInitialLicenseTypes()` | Seed data for local/mock mode. |
| `onToast` | `Function` | `undefined` | Forwarded to `MasterListPage`. |

**Example**
```jsx
import { LicenseTypePage } from 'my Design System';
import { createRestAdapter } from 'my Design System';

// Local/demo mode
<Route path="/masters/license-types" element={<LicenseTypePage onToast={(msg) => toast(msg)} />} />

// Server-bound mode
<Route
  path="/masters/license-types"
  element={
    <LicenseTypePage
      fetcher={createRestAdapter({ baseUrl: 'https://api.example.com', endpoint: '/api/license-types' })}
      onToast={(msg) => toast(msg)}
    />
  }
/>
```

---

### `LicenseTermPage` (`src/pages/masters/LicenseTermPage.jsx`)

Lists license terms (a single `name` column, e.g. "Yearly", "Monthly") with add/edit/delete, built on `MasterListPage`.

**Props**

Same shape as `LicenseTypePage` above (`fetcher`, `serverSide`, `onCreate`, `onUpdate`, `onDelete`, `initialData`, `onToast`), except:

| Prop | Default |
|---|---|
| `endpointKey` | `"licenseTerms"` |
| `initialData` | `makeInitialLicenseTerms()` |

**Example**
```jsx
import { LicenseTermPage } from 'my Design System';

<Route path="/masters/license-terms" element={<LicenseTermPage onToast={(msg) => toast(msg)} />} />
```

---

### `MasterListPage` (`src/pages/masters/MasterListPage.jsx`)

The generic, reusable "master data" CRUD list that `LicenseTypePage`, `LicenseTermPage`, and `ProductTypePage` are thin presets of. Unlike its three presets, `MasterListPage` itself fully supports server-side binding.

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | `"Master List"` | Panel title and used in generated toast messages. |
| `items` | `Array` | `[]` | Local data (used when not server-side). |
| `setItems` | `Function` | `() => {}` | Setter for `items`, called on local create/update/delete. |
| `columns` | `Array` | `[]` | `DataTable`-style column defs (status + actions columns are appended automatically). |
| `FormModal` | `Component` | `() => null` | Modal component rendered with `{ open, onClose, item, onSave }` for add/edit. |
| `addLabel` | `string` | `"Add Record"` | Label for the add button. |
| `showStatusToggle` | `boolean` | `undefined` | If true, adds a Status column + an activate/deactivate icon button per row. |
| `fetcher` | `Function` | `undefined` | Enables server-side mode (or resolved from context via `endpointKey`). |
| `serverSide` | `boolean` | `undefined` | Forces server-side mode on/off. |
| `endpointKey` | `string` | `undefined` | Key used to look up a fetcher from `ServerDataProvider` context (e.g. `"licenseTypes"`). |
| `onCreate` | `Function` | `undefined` | `(form) => Promise<void>`. |
| `onUpdate` | `Function` | `undefined` | `(item, patchOrNext) => Promise<void>` (also drives the status toggle). |
| `onDelete` | `Function` | `undefined` | `(item) => Promise<void>`. |
| `onToast` | `Function` | `undefined` | `(message: string) => void`. |

**Example**
```jsx
import { MasterListPage } from 'my Design System';
import { createRestAdapter } from 'my Design System';

<MasterListPage
  title="License Type"
  addLabel="Add License Type"
  endpointKey="licenseTypes"
  fetcher={createRestAdapter({ baseUrl: 'https://api.example.com', endpoint: '/api/license-types' })}
  columns={[{ key: 'name', header: 'NAME', sortable: true }]}
  FormModal={MyLicenseTypeFormModal}
/>
```

---

### `ProductTypePage` (`src/pages/masters/ProductTypePage.jsx`)

Lists product types (a single `name` column) with add/edit/delete/activate/deactivate (`showStatusToggle` is on), built on `MasterListPage`.

**Props**

Same shape as `LicenseTypePage` above, except:

| Prop | Default |
|---|---|
| `endpointKey` | `"productTypes"` |
| `initialData` | `makeInitialProductTypes()` |

**Example**
```jsx
import { ProductTypePage } from 'my Design System';

<Route path="/masters/product-types" element={<ProductTypePage onToast={(msg) => toast(msg)} />} />
```

---

## Server Data Binding & Utilities

### `useServerDataBinding`

A React hook that centralizes everything a server-backed data table needs: page/pageSize state, sort state, debounced search and filters, loading/error state, and the actual fetch call — all wired together so that changing any of these automatically re-fetches from your `fetcher`.

**Import**
```jsx
import { useServerDataBinding } from 'my Design System';
```

**Parameters** (single options object)

| Option | Type | Default | Description |
|---|---|---|---|
| `fetcher` | `Function` | — (required) | `({ page, pageSize, sortKey, sortDirection, search, filters }) => Promise<{ data, total } \| Array>`. |
| `initialPage` | `number` | `1` | |
| `initialPageSize` | `number` | `10` | |
| `initialSortKey` | `string \| null` | `null` | |
| `initialSortDirection` | `string \| null` | `null` | |
| `initialSearch` | `string` | `""` | |
| `initialFilters` | `Object` | `{}` | |
| `debounceMs` | `number` | `300` | Debounce delay applied to both `search` and `filters` before they trigger a fetch. |
| `autoFetch` | `boolean` | `true` | If `false`, the hook never calls `fetcher` automatically — you'd have to call `refetch()` yourself. |
| `keepPreviousData` | `boolean` | `true` | When `true`, the previous page's rows stay on screen while the next page/filter/sort change is loading, and `loading` only reflects "there's nothing to show yet" rather than every in-flight request. Set `false` if you'd rather the table blank out (or show a loading state) on every fetch, including background refetches after the first successful load. |
| `onSuccess` | `Function` | `undefined` | `(result) => void`, called with the raw fetcher result after each successful fetch. |
| `onError` | `Function` | `undefined` | `(error) => void`, called with the caught error after a failed fetch. |

**Returns**

| Field | Type | Description |
|---|---|---|
| `data` | `Array` | Current page of rows (`result.data`, or `result` itself if the fetcher returned a bare array). |
| `total` | `number` | Total row count (`result.total`, falling back to `data.length` if not a number). |
| `page` / `setPage` | `number` / `Function` | Current page and setter. |
| `pageSize` / `setPageSize` | `number` / `Function` | Current page size and setter. |
| `pageCount` | `number` | `Math.ceil(total / pageSize)`, minimum 1. |
| `sortKey` / `sortDirection` | `string \| null` | Current sort state. |
| `setSort` | `(key, direction) => void` | Sets both sort fields at once. |
| `search` / `setSearch` | `string` / `Function` | Raw (non-debounced) search input state. |
| `filters` / `setFilters` | `Object` / `Function` | Raw (non-debounced) filters object. |
| `setFilter` | `(key, value) => void` | Sets/clears a single filter key (clears it if `value` is `undefined`/`null`/`""`/`"all"`). |
| `loading` | `boolean` | `true` only when there's nothing to show yet — computed as `isFetching && (!keepPreviousData \|\| !hasLoaded)`, so with the default `keepPreviousData=true` it's `false` during a background refetch that already has prior data on screen. |
| `isFetching` | `boolean` | `true` whenever a request is in flight, **including** a background refresh — unlike `loading`, this doesn't care whether there's already data on screen. Use this (rather than `loading`) for something like a small inline spinner next to the search box that should show on every fetch, background ones included. |
| `error` | `string \| null` | Error message from the last failed fetch, or `null`. |
| `refetch` | `Function` | Re-runs the fetch with current params (also what `autoFetch` calls internally). |
| `fetchParams` | `Object` | The exact `{ page, pageSize, sortKey, sortDirection, search, filters }` object that was/would be sent to `fetcher` (search/filters here are the **debounced** values). |
| `tableProps` | `Object` | Convenience bundle: `{ data, loading, isFetching, sortKey, sortDirection, onSortChange: setSort, serverSide: true, error, onRetry: refetch }` — spread straight onto a `DataTable`. |
| `paginationProps` | `Object` | Convenience bundle: `{ page, pageSize, total, onPageChange: setPage, onPageSizeChange }` (the page-size setter also resets `page` to 1) — spread straight onto a `Pagination`. |

Notes on behavior: page automatically resets to 1 whenever the *debounced* search or filters change (not on every keystroke); stale responses are discarded via an internal request-id guard, so a slow earlier request can't overwrite a newer one's results.

**Example**
```jsx
import { useServerDataBinding } from 'my Design System';
import { DataTable, Pagination } from 'my Design System';

function LicensesTable({ fetcher }) {
  const { tableProps, paginationProps, search, setSearch } = useServerDataBinding({ fetcher });

  return (
    <>
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." />
      <DataTable columns={COLUMNS} rowKey={(r) => r.id} {...tableProps} />
      <Pagination {...paginationProps} />
    </>
  );
}
```

---

### `createResourceService`

The factory every real data screen in this library is ultimately built on. It wraps one backend resource (e.g. `/api/licenses`) with a consistent `list`/`create`/`update`/`remove`/etc. interface, and — the reason it exists — **automatically falls back to serving in-memory demo records the first time it discovers the real endpoint doesn't exist yet**, so a screen can be built, reviewed, and demoed before its backend is live, then start showing real data the moment that backend appears, with zero code changes.

**Import**
```jsx
import { createResourceService } from 'my Design System';
```

**Parameters** (single config object)

| Option | Type | Default | Description |
|---|---|---|---|
| `path` | `string` | — (required) | Endpoint base, e.g. `"/api/licenses"`. |
| `demoData` | `Array<object>` | `[]` | Records served once the service has fallen back to demo mode. Cloned on first use (`{...r}` per record) so edits never leak back into a shared array a caller might reuse across multiple services. |
| `idKey` | `string` | `"id"` | Field name holding each record's identifier. |
| `label` | `string` | `path` | Human-readable name used in error messages. |
| `client` | api client | `getApiClient()` | Which client (see `apiClient` below) to issue real requests through. |
| `forceDemo` | `boolean` | `false` | Skip the real backend entirely and start in demo mode — e.g. for demoing the UI with no API/database running. |
| `disableFallback` | `boolean` | `false` | Let a real request failure propagate as a real error instead of silently switching to demo data. Use this once a backend is genuinely expected to be up (a real 500 should look like a real 500, not quietly become demo data). |

**Returns** — a service object

| Method | Signature | Description |
|---|---|---|
| `path`, `idKey` | — | Passthrough of the config values, for callers that need them. |
| `isDemo()` | `() => boolean` | Whether this service instance is currently serving demo records. |
| `list(params)` | `(params) => Promise<{ items, total }>` | `params`: `{ page, pageSize, sortKey, sortDirection, search, filters, signal }`. `signal` (an `AbortController` signal, for request cancellation) is pulled out before building the query string — it's a fetch option, not a query param. |
| `distinct(field)` | `(field: string) => Promise<Array>` | `GET {path}/distinct?field={field}`. Demo fallback returns the unique non-null/non-empty values of that field across the demo store. |
| `create(payload)` | `(payload) => Promise<record>` | `POST {path}`. Demo fallback assigns a new id (one past the current max numeric `idKey`, or `Date.now()` if none are numeric) and unshifts the record into the demo store. |
| `update(id, payload)` | `(id, payload) => Promise<record>` | `PUT {path}/{id}`. Demo fallback merges the patch into the matching row; throws if no row matches `id`. |
| `remove(id)` | `(id) => Promise<{ success: true }>` | `DELETE {path}/{id}`. Demo fallback splices the matching row out — a no-op (not a throw) if nothing matches. |
| `updateMany(ids, payload)` | `(ids, payload) => Promise<{ success: true }>` | `PATCH {path}/bulk` with body `{ ids, ...payload }`. Demo fallback applies the patch to every matching row. |
| `removeMany(ids, payload)` | `(ids, payload?) => Promise<{ success: true }>` | `DELETE {path}/bulk` with body `{ ids, ...payload }` — `payload` is for extra context the real backend wants alongside the ids (a deletion reason, a ticket number). Demo fallback just filters the ids out of the demo store; there's nowhere to persist `payload` against a row that's being deleted, so it's accepted but has no demo-mode effect. |

**Example**
```jsx
import { createResourceService, useServerResource } from 'my Design System';
import { demoLicenses } from './demoSeeds';

const licensesService = createResourceService({
  path: '/api/licenses',
  demoData: demoLicenses,
  label: 'Licenses',
});

function LicensesPage() {
  const { data, total, page, setPage, loading, error, isDemo, remove } = useServerResource(licensesService);
  // ...render the table; `isDemo` tells you whether you're looking at real or demo data
}
```

**Notes**

- **The exact demo-fallback decision** (`isEndpointMissing`, checked once per failed real request):
  1. If `disableFallback` is `true`, never fall back — the real error always propagates.
  2. A cancelled request (`err.name === "AbortError"`) never triggers fallback — a superseded search keystroke says nothing about whether the endpoint exists, and treating a cancellation as "missing" would permanently latch a perfectly-working service into demo mode the first time a user typed quickly.
  3. A non-`ApiError` failure (network unreachable, DNS, TLS) **does** trigger fallback — the request never even reached a server to answer.
  4. An `ApiError` with status `401`/`403` **never** triggers fallback — an auth/permission failure must surface as a real error. Showing plausible demo data after a `401` would be worse than showing nothing, since it would look like a working (if empty) screen instead of a login problem.
  5. Any other `ApiError` triggers fallback only when its status is `404`, `501`, `502`, `503`, or missing entirely — the signature of "this route doesn't exist (yet)." A `400`/`422`/`500` propagates as a real error instead, since those mean the route exists and something else is wrong.
- **Once triggered, the fallback latches for the life of that service instance** — a service that has fallen back to demo mode won't retry the real endpoint again on the next call, so a dead route isn't retried on every keystroke/interaction. Fresh page load ⇒ fresh service instance ⇒ the real endpoint gets tried again from scratch.
- The query string `list` builds (`toQueryString`) uses `page`, `limit` (=`pageSize`), `sortKey`+`sortDir`, `q` (=`search`), and one `filter_<field>=<value>` per filter entry (array values joined with commas) — deliberately the same shape `createRestAdapter`/`serverDataAdapter` send, so a backend written against either convention works with both.
- The demo store replicates real paginated-backend behavior reasonably closely: search does a case-insensitive substring match across every string field, filters do case-insensitive exact match (OR'd across an array-valued filter), and sort does a locale string compare — so switching between real and demo data doesn't change how a screen's search/filter/sort *feels*, only where the data comes from.

---

### `useResource`

Fetches one large page of a `createResourceService` resource and hands the whole array to the caller for client-side paging/sorting/filtering. **Deprecated** in the source in favor of `useServerResource` — kept only for genuinely small tables where a round trip per sort/filter change is worse than holding everything in memory (per the source's own JSDoc, e.g. a handful of license terms), and because its return shape intentionally matches `useServerResource`'s for an easy migration path later.

**Import**
```jsx
import { useResource } from 'my Design System';
```

**Parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `service` | `ReturnType<createResourceService>` | — (required) | The resource service to bind to. |
| `options.onToast` | `(message: string) => void` | — | Called once per failed mutation, with a human-readable failure message. |
| `options.pageSize` | `number` | `500` | How many rows to request in the single `list({ page: 1, pageSize })` call this hook makes. **This is the ceiling on how many rows the screen will ever see** — a table that grows past this silently drops rows off the end rather than failing loudly, which is exactly the correctness gap `useServerResource` exists to close. |

**Returns**

| Field | Type | Description |
|---|---|---|
| `data` | `Array` | The fetched rows. |
| `loading` | `boolean` | True while the initial/refetch request is in flight. |
| `error` | `string \| null` | Last error message. |
| `isDemo` | `boolean` | `service.isDemo()`, snapshotted at render time. |
| `refetch` | `() => Promise` | Re-runs `service.list({ page: 1, pageSize })`. |
| `create` | `(payload) => Promise` | Calls `service.create`, then `refetch()`s on success; on failure, sets `error`, calls `onToast` once, and rethrows. |
| `update` | `(id, payload) => Promise` | Same pattern, via `service.update`. |
| `remove` | `(id) => Promise` | Same pattern, via `service.remove`. |
| `updateMany` | `(ids, payload) => Promise` | Same pattern, via `service.updateMany`. |
| `removeMany` | `(ids) => Promise` | Same pattern, via `service.removeMany(ids)` — **takes only `ids`, no second `payload` argument** (contrast with `useServerResource`'s `removeMany` below, which does accept one). |
| `setData` | `Function` | The raw `React.useState` setter for `data`, exposed for optimistic local edits without a full refetch. |

**Example**
```jsx
import { useResource, createResourceService } from 'my Design System';

const licenseTermsService = createResourceService({ path: '/api/license-terms', demoData: [] });

function LicenseTermsPage() {
  const { data, loading, error, create, update, remove } = useResource(licenseTermsService, {
    onToast: (msg) => console.error(msg),
  });
  // small, rarely-paginated list — a good fit for useResource over useServerResource
}
```

**Notes**

Every mutation (`create`/`update`/`remove`/`updateMany`/`removeMany`) awaits a `refetch()` on success before resolving, and on failure sets `error` + fires `onToast` exactly once + rethrows — so a caller can still `try/catch` around a mutation call for its own local handling (e.g. closing a modal only on success) while the hook's own error/toast plumbing fires automatically either way.

---

### `useServerResource`

The server-paged counterpart to `useResource` — page/sort/search/filter all happen on the backend via `useServerDataBinding`, rather than fetching everything up front. This is the default choice for binding a screen to a `createResourceService` resource; reach for `useResource` only for the small-table exception described above.

**Import**
```jsx
import { useServerResource } from 'my Design System';
```

**Parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `service` | `ReturnType<createResourceService>` | — (required) | The resource service to bind to. |
| `options.onToast` | `(message: string) => void` | — | Same as `useResource`. |
| `options.pageSize` | `number` | `50` | Passed through as `useServerDataBinding`'s `initialPageSize`. |
| `options.search` | `string` | — | Search text **owned by the caller** (e.g. an app shell's header search box) rather than by this hook. When provided (not `undefined`), it's mirrored into the internal binding via `setSearch` in an effect — debouncing still happens internally, so the caller doesn't need to debounce its own input. |

**Returns** — intentionally mirrors `useResource`'s shape, plus server-paging fields:

| Field | Type | Description |
|---|---|---|
| `data` | `Array` | Current page only (already sorted/filtered/paged server-side). |
| `total` | `number` | Total row count across all pages. |
| `page` / `setPage` | `number` / `Function` | — |
| `pageSize` / `setPageSize` | `number` / `Function` | — |
| `sortKey` / `sortDirection` | `string \| null` | — |
| `setSort` | `(key, direction) => void` | — |
| `filters` / `setFilters` | `object` / `Function` | — |
| `loading` | `boolean` | — |
| `error` | `string \| null` | — |
| `isDemo` | `boolean` | `service.isDemo()`, snapshotted at render time. |
| `refetch` | `Function` | — |
| `create` | `(payload) => Promise` | Via `service.create`, refetches on success. |
| `update` | `(id, payload) => Promise` | Via `service.update`. |
| `remove` | `(id) => Promise` | Via `service.remove`. |
| `updateMany` | `(ids, payload) => Promise` | Via `service.updateMany`. |
| `removeMany` | `(ids, payload) => Promise` | Via `service.removeMany(ids, payload)` — **does** accept the optional second `payload` argument, unlike `useResource`'s `removeMany`. Use this to pass through a deletion reason/ticket number to `createResourceService`'s `removeMany`. |

**Example**
```jsx
import { useServerResource, createResourceService } from 'my Design System';

const licensesService = createResourceService({ path: '/api/licenses', demoData: [] });

function LicensesPage({ headerSearchText }) {
  const {
    data, total, page, setPage, pageSize, sortKey, sortDirection, setSort,
    filters, setFilters, loading, error, removeMany,
  } = useServerResource(licensesService, { search: headerSearchText, onToast: showToast });

  function handleBulkDelete(selectedIds, reason) {
    return removeMany(selectedIds, { reason });
  }

  // ...
}
```

**Notes**

`useResource` and `useServerResource` return deliberately similar shapes so a screen can migrate from one to the other by swapping the hook — but their `removeMany` signatures are the one place that genuinely differs (no `payload` vs. an optional `payload`), which is worth double-checking when migrating a screen that relies on passing extra deletion context.

---

### `useResourceFilters`

Builds a complete filter panel (dropdowns for a set of fields, plus Search/Clear wiring) from a field list, and publishes it into the app shell's header via `usePageFilters` rather than rendering it inline on the page — because a filter panel rendered inside a page's own `overflow: hidden` scroll container gets clipped the moment it needs to open below the fold.

**Import**
```jsx
import { useResourceFilters } from 'my Design System';
```

**Parameters** (single options object)

| Option | Type | Default | Description |
|---|---|---|---|
| `path` | `string` | — | Resource path (e.g. `"/api/licenses"`) used to fetch distinct values for each field from the server, when `rows` isn't provided. |
| `fields` | `Array<{ key, label, options?: Array<{value,label}> }>` | — (required) | The columns to offer as filters. A field's own `options` (if set) overrides whatever would otherwise be fetched/derived for it. |
| `filters` | `Record<string, string>` | — | Currently-applied filters, typically from `useServerResource`. |
| `setFilters` | `(filters) => void` | — | Setter for applied filters, typically from `useServerResource`. |
| `rows` | `Array<object>` | `undefined` | If provided, filter options are derived **client-side** from these rows instead of fetched from the server — correct for a screen still holding all its data client-side (e.g. one built on `useResource`), since the server's full distinct-value set could otherwise offer options that empty the table when picked from a page that only has a subset loaded. Omit this once a screen is server-paged. |
| `allLabel` | `string` | `"All"` | Label for the option that clears a given field. |
| `client` | api client | — | Passed through to `useDistinctValues` when `rows` isn't provided. |

**Returns**

| Field | Type | Description |
|---|---|---|
| `fields` | `ReactNode` | The rendered `FilterField`+`Dropdown` pairs, one per configured field. |
| `mobileFilterOptions` | `ReactNode` | The same fields, plus a Search/Clear button row, laid out for a mobile bottom sheet. |
| `activeCount` | `number` | Count of currently-applied (truthy) filter values. |
| `apply` | `() => void` | Commits the current draft selections into `setFilters`. |
| `clear` | `() => void` | Resets both the draft and the applied `filters` to `{}`. |

**Example**
```jsx
import { useResourceFilters, useServerResource, createResourceService } from 'my Design System';

const licensesService = createResourceService({ path: '/api/licenses', demoData: [] });

function LicensesPage() {
  const { filters, setFilters, ...rest } = useServerResource(licensesService);

  useResourceFilters({
    path: '/api/licenses',
    fields: [
      { key: 'status', label: 'Status' },
      { key: 'type', label: 'License Type' },
    ],
    filters,
    setFilters,
  });

  // The filter UI itself now shows up in the app shell's header automatically —
  // nothing further to render on this page for it.
}
```

**Notes**

- Filter selections are held in an internal **draft** state, separate from the applied `filters` — so the panel behaves like a small form (pick several values, then press Search once) rather than refetching on every dropdown change. The draft resyncs from `filters` via an effect whenever the applied filters change from somewhere else (e.g. a Clear elsewhere on the page).
- When `rows` is omitted, options come from `useDistinctValues(path, fieldKeys, { client, allLabel })`. When `rows` is provided, options are derived by scanning `rows` for unique, non-null/non-empty/non-object values of `row[field.key]`, sorted with locale-aware numeric comparison, each list prefixed with a `{ value: "", label: allLabel }` clear-option.
- Uses content-based comparisons (a joined field-key string, `JSON.stringify(derived)`) internally rather than reference equality, specifically because `fields`/`rows` are typically fresh array/object literals at the call site on every render — reference equality would otherwise cause an infinite effect loop.

---

### `useDistinctValues`

Fetches the distinct values of one or more fields from a resource's `/distinct` endpoint, formatted as ready-to-use dropdown options. The server-side counterpart `useResourceFilters` uses internally when it isn't given `rows`.

**Import**
```jsx
import { useDistinctValues } from 'my Design System';
```

**Parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `path` | `string` | — (required) | Resource path, e.g. `"/api/licenses"`. |
| `fields` | `string[]` | — (required) | Column names to fetch distinct values for. |
| `options.client` | api client | `getApiClient()` | — |
| `options.allLabel` | `string` | `"All"` | Label for the "clear this filter" option prefixed onto every field's option list. |

**Returns**

`{ options: Record<string, Array<{value, label}>>, loading: boolean }`

**Example**
```jsx
import { useDistinctValues } from 'my Design System';
import { Dropdown } from 'my Design System';

function StatusFilterDropdown({ value, onChange }) {
  const { options, loading } = useDistinctValues('/api/licenses', ['status']);

  return (
    <Dropdown
      label="Status"
      options={options.status ?? []}
      value={value}
      onChange={onChange}
      disabled={loading}
    />
  );
}
```

**Notes**

- Fetches `GET {path}/distinct?field={field}` for every field in `fields`, in parallel via `Promise.all`. **Per-field error isolation**: a single field's failed request resolves to `[field, []]` rather than rejecting the whole batch, so one unavailable column doesn't empty the entire filter panel.
- The effect re-runs when `fields.join(",")` changes (a content comparison, since `fields` is typically a fresh array literal at the call site) along with the client/path/allLabel — and guards against a stale response landing after unmount or after the inputs changed again, via a `cancelled` closure flag.

---

### `ServerDataProvider`

A React context provider that lets you configure server endpoints **once** at the top of your app, so every `my Design System` page below it (that supports server binding) automatically picks up a working `fetcher`/mutator without you passing one to each page individually.

**Import**
```jsx
import { ServerDataProvider, useServerDataContext } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `baseUrl` | `string` | `undefined` | Base URL for your API (e.g. `"https://api.mycompany.com"`). Used to build a default `createRestAdapter`-based fetcher/mutator per endpoint if you don't supply your own `fetcher`/`mutator`. |
| `headers` | `Object \| () => Object \| () => Promise<Object>` | `undefined` | Default headers (e.g. `{ Authorization: "Bearer ..." }`) merged into every generated REST call. Can also be a function (sync or async) — handy for tokens that expire and need to be re-read/refreshed on every request, e.g. `() => ({ Authorization: `Bearer ${getFreshToken()}` })`. |
| `endpoints` | `Object` | `{ licenses: "/api/licenses", users: "/api/users", licenseTypes: "/api/license-types", licenseTerms: "/api/license-terms", productTypes: "/api/product-types", reports: "/api/reports", materials: "/api/materials" }` | Maps an endpoint key to its path. Any key not listed falls back to `` `/api/${endpointKey}` ``. |
| `fetcher` | `Function` | `undefined` | Custom global fetcher: `({ endpointKey, endpoint, params }) => Promise<{ data, total }>`. If provided, this is used instead of the `baseUrl`-based REST adapter for **all** endpoints. |
| `mutator` | `Function` | `undefined` | Custom global mutation function: `({ endpointKey, endpoint, method, payload, id }) => Promise<any>`. If provided, used instead of the `baseUrl`-based create/update/delete adapters. |
| `children` | `ReactNode` | — | |

**How child pages pick up config:** pages that support server binding (e.g. `LicensePage`, `UsersPage`, `MasterListPage`) call `useServerDataContext()` internally and do `context?.getEndpointFetcher?.("licenses")` (or whatever their endpoint key is) to get a ready-to-use fetcher — falling back to their own `fetcher` prop if one was passed directly, and to local/mock mode if neither is available. `getEndpointFetcher(endpointKey)` resolves in this order: your custom `fetcher` (wrapped with `endpointKey`/`endpoint`/`params`) → a `createRestAdapter` built from `baseUrl` + the resolved endpoint path + `headers` → `null` if neither `fetcher` nor `baseUrl` is configured. `getEndpointMutator(endpointKey)` works the same way, returning either your custom `mutator` wrapped per call, or `{ create, update, remove }` built from `createCreateAdapter`/`createUpdateAdapter`/`createDeleteAdapter`, or `null`.

**Example**
```jsx
import { ServerDataProvider, LicensePage, UsersPage } from 'my Design System';

function App() {
  return (
    <ServerDataProvider
      baseUrl="https://api.mycompany.com"
      headers={{ Authorization: `Bearer ${token}` }}
      endpoints={{ licenses: '/v1/licenses', users: '/v1/users' }}
    >
      <LicensePage />  {/* automatically server-bound to /v1/licenses */}
      <UsersPage />    {/* automatically server-bound to /v1/users */}
    </ServerDataProvider>
  );
}
```

---

### `serverDataAdapter`

REST adapter factory functions (`src/lib/serverDataAdapter.js`) for wiring `useServerDataBinding`, `ServerDataTable`, and the pages' `fetcher`/`onCreate`/`onUpdate`/`onDelete` props to a standard REST backend (Spring Boot, Express, Django, Laravel, ASP.NET, etc.) without writing your own `fetch` calls.

**Built for real-world backend quirks**, not just the happy path:
- `headers` on every adapter accepts either a plain `Object` or a `() => Object | Promise<Object>` function — pass a function when your auth header needs to be re-read or refreshed on every request (e.g. a short-lived token).
- Non-2xx responses are turned into a `throw`n `Error` whose `message` is pulled from the response body's `message`/`error`/`detail` field when present (falling back to `` `Server returned HTTP {status}: {statusText}` ``), and whose `.status` property is set to the HTTP status code — so `catch (err) { onToast(err.message) }` in the pages shows a real, backend-authored error message instead of a generic one.
- Empty response bodies (e.g. a `204 No Content` from a `DELETE`) are handled safely — the adapters don't attempt to `JSON.parse` an empty string, which would otherwise throw.

**Import**
```jsx
import {
  createRestAdapter,
  fetchServerData,
  createCreateAdapter,
  createUpdateAdapter,
  createDeleteAdapter,
} from 'my Design System';
```

#### `createRestAdapter(config)`

Builds a GET-based list fetcher compatible with `useServerDataBinding`'s `fetcher` option.

**Parameters**

| Param | Type | Default | Description |
|---|---|---|---|
| `baseUrl` | `string` | — | API base URL (falls back to `window.location.origin` if omitted, or `"http://localhost"` outside the browser). |
| `endpoint` | `string` | `""` | Path appended to `baseUrl`, e.g. `"/api/licenses"`. |
| `headers` | `Object \| () => Object \| Promise<Object>` | `{}` | Extra headers merged with `Content-Type: application/json`. Accepts a (sync or async) function for tokens that need to be re-read on every request. |
| `formatParams` | `Function` | `undefined` | `(params, defaultParams) => Record<string, string>` — override the query-string params entirely. |
| `parseResponse` | `Function` | `undefined` | `(json) => { data, total }` — override response parsing. |

**Returns** an async fetcher `(params) => Promise<{ data, total }>`. By default it issues `GET {baseUrl}{endpoint}?page=&limit=&sortKey=&sortDir=&q=&filter_<key>=...` and, unless `parseResponse` is given, expects the response to be an array, or an object with `data`/`items`/`records`, plus `total` or `count`.

```jsx
const licensesFetcher = createRestAdapter({
  baseUrl: 'https://api.example.com',
  endpoint: '/api/licenses',
  headers: { Authorization: `Bearer ${token}` },
});
```

#### `fetchServerData(url, queryParams = {}, fetchOptions = {})`

A generic GET helper: appends `queryParams` to `url` as a query string, performs the request (merging `Content-Type: application/json` into headers), throws on non-OK responses, and returns the parsed JSON body directly (not wrapped in `{ data, total }`).

```jsx
const json = await fetchServerData('/api/summary', { range: '30d' });
```

#### `createCreateAdapter(config)`

Builds a `POST` mutator compatible with the `onCreate` prop of `LicensePage`, `UsersPage`, and `MasterListPage`.

| Param | Type | Default | Description |
|---|---|---|---|
| `baseUrl` | `string` | — | |
| `endpoint` | `string` | `""` | |
| `headers` | `Object \| () => Object \| Promise<Object>` | `{}` | Also accepts a (sync or async) function, same as `createRestAdapter`. |
| `parseResponse` | `Function` | `undefined` | `(json) => any`. |

Returns `(payload) => Promise<any>` — POSTs `JSON.stringify(payload)` to `{baseUrl}{endpoint}`.

#### `createUpdateAdapter(config)`

Builds a `PATCH`/`PUT` mutator compatible with `onUpdate`.

| Param | Type | Default | Description |
|---|---|---|---|
| `baseUrl` | `string` | — | |
| `endpoint` | `string` | `""` | |
| `method` | `string` | `"PATCH"` | Set to `"PUT"` if your API requires full replacement. |
| `headers` | `Object \| () => Object \| Promise<Object>` | `{}` | Also accepts a (sync or async) function, same as `createRestAdapter`. |
| `getId` | `Function` | `(entity) => entity?.id` | How to extract an id when the first argument is an entity object rather than a raw id. |
| `parseResponse` | `Function` | `undefined` | |

Returns `(entityOrId, payload) => Promise<any>` — sends the request to `{baseUrl}{endpoint}/{id}`.

#### `createDeleteAdapter(config)`

Builds a `DELETE` mutator compatible with `onDelete`.

| Param | Type | Default | Description |
|---|---|---|---|
| `baseUrl` | `string` | — | |
| `endpoint` | `string` | `""` | |
| `headers` | `Object \| () => Object \| Promise<Object>` | `{}` | Also accepts a (sync or async) function, same as `createRestAdapter`. |
| `getId` | `Function` | `(entity) => entity?.id` | |
| `parseResponse` | `Function` | `undefined` | |

Returns `(entityOrId) => Promise<any>` — sends `DELETE {baseUrl}{endpoint}/{id}`.

```jsx
import { LicensePage, createCreateAdapter, createUpdateAdapter, createDeleteAdapter, createRestAdapter } from 'my Design System';

const cfg = { baseUrl: 'https://api.example.com', endpoint: '/api/licenses' };

<LicensePage
  fetcher={createRestAdapter(cfg)}
  onCreate={createCreateAdapter(cfg)}
  onUpdate={createUpdateAdapter(cfg)}
  onDelete={createDeleteAdapter(cfg)}
/>
```

---

### `mockServer` (`createMockServerHandler`)

An in-memory fake backend used for local development and demos, so you can build/test server-bound pages before a real API exists. It performs search, filtering, sorting, and pagination over a plain in-memory JS array and simulates network latency (and, optionally, failures) — matching the exact `{ data, total }` contract `useServerDataBinding` expects.

**Import**
```jsx
import { createMockServerHandler } from 'my Design System';
```

**Parameters**

| Param | Type | Default | Description |
|---|---|---|---|
| `dataset` | `Array` | `[]` | Full in-memory dataset to serve from. |
| `options.delayMs` | `number` | `250` | Simulated network latency per call. |
| `options.failureRate` | `number` | `0` | Probability (0–1) that a call throws `Error("Simulated Server Error (HTTP 500): Internal Server Failure")` instead of resolving. |
| `options.searchFields` | `Array<string>` | `["account", "name", "site", "key", "status", "type"]` | Which row fields the text `search` term is matched against (case-insensitive substring match, OR'd across fields). |

**Returns** an async fetcher `({ page, pageSize, sortKey, sortDirection, search, filters }) => Promise<{ data, total, page, pageSize, pageCount }>`. Filtering matches each `filters[key]` as a case-insensitive substring against `item[key]` (ignoring `undefined`/`null`/`""`/`"all"` values); sorting does locale-aware string compare or numeric compare depending on the field's type, with `null`/`undefined` values sorted last.

**Example**
```jsx
import { createMockServerHandler } from 'my Design System';
import { makeInitialLicenses } from 'my Design System';

const mockFetcher = createMockServerHandler(makeInitialLicenses(), {
  delayMs: 300,
  searchFields: ['account', 'name', 'site', 'status', 'type', 'key'],
});

<LicensePage fetcher={mockFetcher} serverSide />
```

---

### `apiClient`

The HTTP client every service in this library — `createResourceService`, `useDistinctValues`, `authService`, and anything else that talks to a backend — is built on. One place owns the response-envelope convention, the base URL, and the `Authorization: Bearer <sessionId>` header, so those decisions are made once rather than reimplemented per fetch call.

**Import**
```jsx
import {
  ApiError,
  createApiClient,
  configureApiClient,
  getApiClient,
  apiRequest,
  onUnauthorized,
  getStoredSessionId,
  setStoredSessionId,
  clearStoredSessionId,
} from 'my Design System';
```

**`class ApiError extends Error`**

```js
new ApiError(message, { status, errors, statusCode } = {})
```

Thrown by every failed request. Carries `name = "ApiError"`, plus `status` (HTTP status), `statusCode` (an envelope-reported status, if the backend puts one in the response body), and `errors` (an array, defaulting to `[]`).

**`createApiClient(config = {})`** — builds an independent client instance. Most apps don't need this directly; it's for talking to multiple backends at once, or for test isolation.

| Config field | Type | Default | Description |
|---|---|---|---|
| `baseUrl` | `string` | `""` | Empty means same-origin. |
| `tokenStorageKey` | `string` | `"sls_session_id"` | localStorage/sessionStorage key the session id is persisted under. |
| `storage` | `Storage` | `window.localStorage` | Swappable for `sessionStorage`, or an in-memory stub under SSR/tests. |

Returned client object:

| Method | Signature | Description |
|---|---|---|
| `configure(next = {})` | `(next) => client` | Merges config in place; returns the client for chaining. |
| `baseUrl` | getter | Current base URL. |
| `tokenStorageKey` | getter | Exposed so something like `AuthProvider` can watch a cross-tab `storage` event keyed on it. |
| `getToken()` | `() => string \| null` | Reads the persisted session id. |
| `setToken(token)` | `(token) => void` | Persists the session id, or clears it if `token` is falsy. |
| `clearToken()` | `() => void` | `setToken(null)`. |
| `onUnauthorized(listener)` | `(message) => void → unsubscribe fn` | Subscribes to "the server rejected this session" — fires from any `401` anywhere in the app, since every request funnels through `request()`. |
| `request(path, options)` | `(path, options) => Promise<data>`, throws `ApiError` | Performs a request and returns the unwrapped payload. See behavior below. |

**`request(path, { method = "GET", body, headers, skipAuth = false, signal } = {})` — exact behavior:**
- Builds the full URL as `${baseUrl}${path}`.
- Always sends `Accept: application/json`; adds `Content-Type: application/json` only when `body !== undefined`; caller-supplied `headers` are merged last, so they can override the defaults.
- Unless `skipAuth`, adds `Authorization: Bearer <token>` whenever a token is stored.
- A `fetch` failure that isn't an `AbortError` is rethrown as `ApiError("Unable to reach the API at {baseUrl}. Check your connection, that the server is running, and that its certificate is trusted.")`; an `AbortError` passes through untouched (so cancellation-aware code, like `createResourceService`'s fallback logic, can tell the two apart).
- The response body is parsed defensively — an empty body becomes `null`, and unparseable JSON becomes `null` silently rather than throwing.
- **Response envelope convention**: `{ success, message?, data, errors?, statusCode? }`. `success` is read from the envelope when present, otherwise falls back to `response.ok`.
- On failure: the error message is resolved as `envelope.message` → `envelope.errors[0]` → `` `Request failed with status ${response.status}` ``. Unauthorized is detected two ways — `response.status === 401` **or** `envelope?.statusCode === 401` (since some backends return a 200-transport response with the real status inside the envelope) — checked only when `!skipAuth`. On an unauthorized result, `client.clearToken()` runs and every `onUnauthorized` listener is notified, **before** the `ApiError` is thrown.
- On success: returns `envelope.data` if the envelope shape (`"data" in envelope`) is present, otherwise returns the parsed body as-is — so both enveloped and plain-JSON endpoints work through the same client.

**Shared-client module-level exports** (operate on one shared default client, built at module load so subscriptions/tokens survive being reconfigured in any order):

| Export | Description |
|---|---|
| `configureApiClient(config)` | Configures the shared client. Call once at app startup, e.g. `configureApiClient({ baseUrl: import.meta.env.VITE_API_BASE_URL })`. Returns the client for chaining. |
| `getApiClient()` | Returns the shared client — what every service in the library defaults to when no `client` override is given. |
| `apiRequest(path, options)` | Shorthand for `getApiClient().request(path, options)`. |
| `onUnauthorized(listener)` | Shorthand for `getApiClient().onUnauthorized(listener)`. |
| `getStoredSessionId()` | Shorthand for `getApiClient().getToken()`. |
| `setStoredSessionId(sessionId)` | Shorthand for `getApiClient().setToken(sessionId)`. |
| `clearStoredSessionId()` | Shorthand for `getApiClient().clearToken()`. |

**Example**
```jsx
// app entry point, once:
import { configureApiClient } from 'my Design System';
configureApiClient({ baseUrl: import.meta.env.VITE_API_BASE_URL ?? '' });

// anywhere else, a raw one-off request through the same shared client:
import { apiRequest } from 'my Design System';
const summary = await apiRequest('/api/summary');
```

**Notes**

You rarely call `request`/`apiRequest` directly in day-to-day work — `createResourceService`, `useDistinctValues`, and `authService` all go through the shared client automatically. Reach for `apiRequest` mainly for one-off endpoints that don't fit the resource-service shape (e.g. a summary/dashboard endpoint that isn't a list of records).

---

### `authService`

Login/session/logout/change-password calls, built on `apiClient`.

**Import**
```jsx
import { authService, login, logout, getSession, changePassword, createAuthService, DEFAULT_AUTH_ROUTES } from 'my Design System';
```

**`DEFAULT_AUTH_ROUTES`**
```js
{
  login: "/api/Auth/login",
  logout: "/api/Auth/logout",
  session: "/api/Auth/session",
  changePassword: "/api/Auth/change-password",
}
```

**`createAuthService({ client, routes } = {})`**

| Config field | Type | Default | Description |
|---|---|---|---|
| `client` | api client | `getApiClient()` | — |
| `routes` | `Partial<typeof DEFAULT_AUTH_ROUTES>` | `DEFAULT_AUTH_ROUTES` | Merged over the defaults — override just the routes that differ. |

Returned service:

| Method | Signature | Description |
|---|---|---|
| `login(username, password)` | `(username, password) => Promise<{ sessionId, raw }>` | `POST routes.login` with `{ username, password }` (`skipAuth: true`). Extracts the session id from the response via, in order: the response itself if it's a raw string; else `data.sessionId`, `data.session_id`, `data.sessionID`, `data.token`. Throws if none of those are found. On success, persists the token via `client.setToken(sessionId)`. |
| `getSession()` | `() => Promise<SessionInfo \| null>` | Returns `null` immediately, with no request, if no token is stored — doubling as a silent "am I signed in?" check on app load. Otherwise `GET routes.session`. |
| `changePassword(newPassword, currentPassword = "")` | `(newPassword, currentPassword?) => Promise<any>` | `POST routes.changePassword` with `{ currentPassword, newPassword }`. |
| `logout()` | `() => Promise<void>` | `POST routes.logout`, but only if a token is currently stored. In a `finally` block, **always** clears the token regardless of whether that POST succeeded — a session the server has already stopped honoring isn't worth keeping client-side either. |

**Module-level convenience exports** (a default `authService = createAuthService()` instance, using the shared `apiClient`): `authService`, `login(username, password)`, `logout()`, `getSession()`, `changePassword(newPassword, currentPassword)`.

**Example**
```jsx
import { login } from 'my Design System';

async function handleSignIn(username, password) {
  const { sessionId } = await login(username, password);
  // token is already persisted by this point — sessionId is returned mainly for logging/debugging
}
```

**Notes**

Most apps don't call `authService` directly at all — `AuthProvider`'s `login`/`logout` (below) wrap it with the state management a component tree actually needs (status, current user, session-expiry handling). Reach for `authService`/`createAuthService` directly only when building a custom auth flow outside `AuthProvider`, or when pointing at non-default auth routes.

---

### `AuthProvider`

Owns session state for the whole app: who's signed in, whether a session check is in flight, and — the part worth knowing about — three independent ways of detecting that a session has died server-side, so the UI doesn't sit in a stale "signed in" state after the backend has already forgotten about it.

**Import**
```jsx
import { AuthProvider, useAuth } from 'my Design System';
```

**Props**

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | — |
| `authService` | `ReturnType<createAuthService>` | a memoized `createAuthService()` built once internally | Override for a custom auth service (non-default routes, a different client, etc.). |
| `sessionCheckIntervalMs` | `number` | `30000` | How often the session is proactively re-checked while signed in. |
| `expiredMessage` | `string` | `"Your session has expired. Please sign in again."` | Message shown (via `expiredMessage` in the returned context) when the *server* ends the session — not shown on a manual logout. |

**`useAuth()`** — reads context; throws `Error("useAuth must be used inside <AuthProvider>")` outside a provider.

**Returns**

| Field | Type | Description |
|---|---|---|
| `status` | `"checking" \| "authenticated" \| "unauthenticated"` | — |
| `user` | `*` | Whatever `authService.getSession()` returned. |
| `checking` | `boolean` | `status === "checking"`. |
| `expiredMessage` | `string \| null` | Set only when the server (not the user) ended the session. |
| `login` | `(username, password) => Promise<void>` | Calls `authService.login`, then best-effort refreshes `user` via `getSession()` (a failed follow-up profile read doesn't bounce the user back out to signed-out), clears `expiredMessage`, and sets `status` to `"authenticated"`. |
| `logout` | `() => Promise<void>` | Calls `authService.logout()`; in a `finally` block always clears `user`/`expiredMessage` and sets `status` to `"unauthenticated"`, regardless of whether the logout request itself succeeded. |
| `clearExpiredMessage` | `() => void` | — |

**Example**
```jsx
import { AuthProvider, useAuth } from 'my Design System';

function App({ children }) {
  return (
    <AuthProvider sessionCheckIntervalMs={30000}>
      <AuthGate>{children}</AuthGate>
    </AuthProvider>
  );
}

function AuthGate({ children }) {
  const { status, expiredMessage, login } = useAuth();
  if (status === 'checking') return <Loader fullPage />;
  if (status === 'unauthenticated') return <LoginPage onLogin={login} expiredMessage={expiredMessage} />;
  return children;
}
```

**Notes — three independent ways a dead session gets detected:**

1. **Reactively**: subscribes to `client.onUnauthorized(...)` — any `401` anywhere in the app (from any request through the shared `apiClient`) forces a logout, showing either that 401's message or the configured `expiredMessage` as a fallback.
2. **Proactively**: while `status === "authenticated"`, re-checks via `getSession()` on a `setInterval(sessionCheckIntervalMs)` timer, **and** on window `focus`, **and** on `document.visibilitychange` → visible — with an in-flight guard so the timer, a focus event, and a visibility event firing within milliseconds of each other (e.g. alt-tabbing back exactly as the timer ticks) produce one request, not three. A network-level error here (as opposed to a real 401, already handled by #1) is treated as a transient blip and ignored — signing someone out over one dropped packet would be worse than doing nothing.
3. **Across tabs**: listens for the browser's `storage` event on `client.tokenStorageKey` — if another tab clears the token (e.g. that tab's user signed out), this tab logs out too, with no message shown (the other tab already explained why).

On mount, a one-time `bootstrap()` sets `status` to `"checking"` and calls `getSession()`; any error there (missing/expired/invalid session) is treated as simply "signed out," not surfaced as an error.

---

### `PageFilterContext`

Connects the filter panel that lives in the app shell's header to whichever page is currently on screen — rather than the shell hard-coding every page's filterable fields, each page publishes its own filter config, and the shell renders whatever the current page happens to have published.

**Import**
```jsx
import { PageFilterProvider, usePageFilters, useHeaderFilters } from 'my Design System';
```

**`<PageFilterProvider>`** — wraps the app. No props besides `children`. Holds a single `config` value (`null` when no page has published anything).

**`usePageFilters(config)`** — called by a page (most commonly indirectly, via `useResourceFilters`, but usable directly for a hand-built filter UI).

| Parameter | Type | Description |
|---|---|---|
| `config` | `{ children: ReactNode, onApply?: () => void, onClear?: () => void, activeCount?: number } \| null` | **Must be memoized by the caller.** An unmemoized object is a new reference every render, which would republish (and re-render the shell) on every single render of the page — this is called out explicitly in source as a load-bearing requirement, not a minor optimization. |

Publishes `config` on mount/update via an effect, and — the important part — **withdraws it (`setConfig(null)`) on unmount**, which is what stops a previous page's filters from lingering in the header after navigating away.

**`useHeaderFilters()`** — reads whatever the current page has published (`{ children, onApply, onClear, activeCount } | null`). This is what the app shell's `Header` calls to decide whether to show a filter button at all, and what to render inside it.

**Example**
```jsx
import * as React from 'react';
import { usePageFilters } from 'my Design System';
import { FilterField, Dropdown } from 'my Design System';

function CustomFilteredPage({ status, setStatus }) {
  const filterConfig = React.useMemo(
    () => ({
      children: (
        <FilterField label="Status">
          <Dropdown value={status} onChange={setStatus} options={STATUS_OPTIONS} />
        </FilterField>
      ),
      activeCount: status ? 1 : 0,
      onClear: () => setStatus(null),
    }),
    [status, setStatus]
  );

  usePageFilters(filterConfig);

  // No filter UI to render on the page itself — it now shows up in the shell's header.
}
```

**Notes**

Most screens should reach for `useResourceFilters` instead of calling `usePageFilters` directly — it already builds the `FilterField`/`Dropdown` markup and memoizes the config correctly. Use `usePageFilters` directly only when a page's filter UI doesn't fit the field-list shape `useResourceFilters` expects.

---

### `licenseExpiry.js`

Pure functions that turn a license's stored `status` plus its `expiry` date into an actual lifecycle judgment — `"Active"` alone can't distinguish a license with two years left from one lapsing Friday, and this module is the one place that decides what counts as "about to expire." `LicenseStatusCell` (above, under License Management) is built entirely on this module. Every function takes an explicit `now` (default `new Date()`) instead of reading the clock internally, which keeps them pure/testable and stops "today" from silently going stale in a tab left open overnight.

**Import**
```jsx
import {
  DEFAULT_WARN_WITHIN_DAYS,
  parseLicenseDate,
  daysUntil,
  getLicenseLifecycle,
  getExpiryUrgency,
  describeTimeLeft,
  describeExpiry,
  formatLicenseDate,
} from 'my Design System';
```

**`DEFAULT_WARN_WITHIN_DAYS`** = `30` — the days-out threshold for "about to expire," used unless a caller overrides it.

| Function | Signature | Description |
|---|---|---|
| `parseLicenseDate(value)` | `(value) => Date \| null` | Parses `dd-MMM-yyyy`/`dd-MMM-yy` (hyphen, `/`, or space separators; 2-digit years use POSIX-style windowing — `>= 70` → 1900s, else 2000s) and ISO `yyyy-MM-dd`. Returns `null` for anything unparseable, **including the literal `"-"` placeholder** some data uses for "no expiry recorded" — callers must treat `null` as *unknown*, not as *expired*. Deliberately avoids `Date.parse`, since it's implementation-defined for non-ISO strings (browsers disagree on whether `"05-Mar-27"` means 2027 or 1927); also rejects date-rollover values (e.g. `31-Feb-2025`, which the native `Date` constructor would silently roll forward to March 3) by checking the constructed date's parts still match what was asked for. |
| `daysUntil(date, now?)` | `(date, now = new Date()) => number \| null` | Whole calendar days from `now` to `date` (negative if `date` is in the past, `0` if today) — both sides are collapsed to midnight first, so it's a day count, not a 24-hour-period count (a license expiring tomorrow correctly reads as "1 day," not "0 days" for the rest of today). Returns `null` if `date` is falsy. |
| `getLicenseLifecycle(row, options?)` | `(row, { now?, warnWithinDays? }) => { state, days, date, label, tone }` | The core classification. `state` is one of `"deactivated"` (checked first — a status of `"deactivated"`/`"inactive"`, case/space-insensitive, always outranks the date, since a switched-off license shouldn't show an "about to expire" warning), `"expired"` (status `"expired"` **or** `days < 0`), `"expiring"` (live and `days <= warnWithinDays`), `"active"` (live, plenty of runway), or `"unknown"` (no usable expiry date and no recognizable status at all). `tone` maps to a semantic color per state: `deactivated`/`unknown`→`"neutral"`, `expired`→`"offline"`, `expiring`→`"warn"`, `active`→`"online"`. |
| `getExpiryUrgency(row, options?)` | `(row, options) => "critical" \| "high" \| "medium" \| "low" \| null` | Bands built on top of `getLicenseLifecycle`, for grading *how* urgent an expiring/expired license is (not just that it is one). `null` when nothing is due. Rules: `state === "expired"` → `"critical"`; not `"expiring"` → `null`; `days <= 0` → `"critical"`; `days <= 7` → `"high"`; `days <= 15` → `"medium"`; else → `"low"`. |
| `describeTimeLeft(days)` | `(days) => string` | `null`→`"Active"`, `< 0`→`"Expired"`, `0`→`"Expires today"`, `1`→`"About to expire in 1 day"`, else→`` `About to expire in ${days} days` `` (correct singular/plural, rather than an "(s)" suffix). |
| `describeExpiry(row, options?)` | `(row, options) => string` | Long-form tooltip text combining state and the actual date, e.g. `"Deactivated — expiry was 04-Nov-2025"`, `"Expired on 04-Nov-2025 (3 days ago)"`, `"No expiry date recorded"`, `"Expires on 04-Nov-2025"`. |
| `formatLicenseDate(date)` | `(date) => string` | Formats a `Date` back to `dd-MMM-yyyy` (e.g. `"04-Nov-2025"`); returns `"-"` for a falsy input. |

**Example**
```jsx
import { getLicenseLifecycle, getExpiryUrgency, describeExpiry } from 'my Design System';

function isLicenseUrgent(license) {
  const { state } = getLicenseLifecycle(license, { warnWithinDays: 14 });
  return state === 'expiring' && ['critical', 'high'].includes(getExpiryUrgency(license, { warnWithinDays: 14 }));
}

// describeExpiry(license) -> "About to expire in 6 days" (as a tooltip, via describeExpiry's fuller text)
```

**Notes**

Reach for `LicenseStatusCell` first for the common case of rendering a status cell — it already wires all of this up, including the icon/color grading and tooltip. Use `licenseExpiry.js` directly when you need the classification for something other than that one cell — sorting, row tinting outside `getLicenseRowTone`, a dashboard stat tile counting "expiring soon" licenses, etc.

---

### `columnWidth.js`

A shared width scale for `DataTable`/`MobileTableWrapper` columns, so headers line up across different tables in an app instead of every screen hand-picking its own pixel widths.

**Import**
```jsx
import { COLUMN_SIZES, DEFAULT_COLUMN_WIDTH, snapColumnWidth, resolveColumnWidth } from 'my Design System';
```

| Export | Type | Description |
|---|---|---|
| `COLUMN_SIZES` | `{ xs: 96, sm: 128, md: 192, lg: 256, xl: 320 }` | Named width steps, each a multiple of an internal 32px unit. |
| `DEFAULT_COLUMN_WIDTH` | `128` (`= COLUMN_SIZES.sm`) | Used when a column declares no width preference at all. |
| `snapColumnWidth(value)` | `(value: number \| string) => number \| null` | Rounds a pixel value **up** (`Math.ceil`, never down — so a column never renders narrower than requested) to the next multiple of 32, clamped to `[96, 384]`. Accepts a number or a numeric string. Returns `null` for anything that isn't a usable pixel value — `null`/`undefined`, a non-finite or `≤0` result, or a string ending in `%` (a percentage is a share of the table, not a pixel count, so it's deliberately left unsnapped rather than misinterpreted). |
| `resolveColumnWidth(col, fallback?)` | `(col, fallback = DEFAULT_COLUMN_WIDTH) => number` | The actual width a column should render at, checked in this order: (1) `col.size` if it's a valid `COLUMN_SIZES` key; (2) `snapColumnWidth(col.width)` if non-null; (3) `snapColumnWidth(col.minWidth)` as a floor; (4) `fallback`. Returns `fallback` immediately if `col` itself is falsy. |

**Example**
```jsx
import { resolveColumnWidth, COLUMN_SIZES } from 'my Design System';

const columns = [
  { key: 'id', header: 'ID', size: 'xs' },        // resolves to 96
  { key: 'name', header: 'Name', width: 150 },     // resolves to 160 (snapped up)
  { key: 'notes', header: 'Notes' },                // resolves to DEFAULT_COLUMN_WIDTH (128)
];

columns.forEach((c) => console.log(c.key, resolveColumnWidth(c)));
```

**Notes**

A hand-dragged column resize in `DataTable` is deliberately **not** run through `snapColumnWidth` — snapping mid-drag would fight the pointer, and a manually-set width is treated as an explicit override of house style rather than a request to conform to it. That resize behavior lives in `DataTable` itself, not in this module — this module only governs the *initial* width a column resolves to before anyone drags it.

---

### `cn`

A tiny classnames-merging utility — a thin wrapper around the `clsx` package (`cn(...inputs) { return clsx(inputs); }`). Every component in the library uses it internally to combine its own default classes with a consumer-supplied `className` prop.

**Import**
```jsx
import { cn } from 'my Design System';
```

**Example**
```jsx
cn("px-2 py-1 rounded", isActive && "bg-accent text-white", className)
// → "px-2 py-1 rounded bg-accent text-white my-custom-class" (falsy values are dropped)
```

---

### `exportUtils`

Client-side, dependency-free helpers for triggering a file download of tabular data from the browser (`src/lib/exportUtils.js`). Both functions are browser-only no-ops when `window` is undefined (SSR-safe).

**Import**
```jsx
import { exportToCSV, exportToJSON } from 'my Design System';
```

#### `exportToCSV(data = [], columns = [], filename = "export.csv")`

| Param | Type | Default | Description |
|---|---|---|---|
| `data` | `Array<Object>` | `[]` | Rows to export. No-op if empty. |
| `columns` | `Array<{ key, header? }>` | `[]` | Column order/headers; if omitted, derives columns (and headers) from `Object.keys(data[0])`. |
| `filename` | `string` | `"export.csv"` | Download filename (`.csv` appended automatically if missing). |

Builds a quoted CSV string (object values are `JSON.stringify`'d), creates a `Blob`, and triggers a browser download via a temporary `<a download>` link.

#### `exportToJSON(data = [], filename = "export.json")`

| Param | Type | Default | Description |
|---|---|---|---|
| `data` | `Array<Object>` | `[]` | Data to export as pretty-printed JSON (2-space indent). |
| `filename` | `string` | `"export.json"` | Download filename (`.json` appended automatically if missing). |

**Example**
```jsx
import { exportToCSV, exportToJSON } from 'my Design System';

exportToCSV(licenses, [{ key: 'account', header: 'Account' }, { key: 'status', header: 'Status' }], 'licenses.csv');
exportToJSON(licenses, 'licenses-backup.json');
```

---

### `data/mock.js`

Sample datasets and fixtures used throughout the library's own pages as local-mode fallback data (and handy for prototyping your own pages before a backend exists). All exports are plain functions/constants — no network or state involved.

| Export | Description |
|---|---|
| `makeInitialLicenses()` | Returns ~500 sample license records (9 hand-authored + 491 generated) with fields like `account`, `name`, `status`, `type`, `term`, `key`, `issue`, `expiry`, `site`, `amount`, `payment`. Default data source for `LicensePage`. |
| `makeInitialUsers()` | Returns 3 sample users (`Super Admin`, `Priya Sharma`, `Rohit Verma`) with `name`/`email`/`role`/`status`. Default data source for `UsersPage`. |
| `makeInitialLicenseTypes()` | Returns 25 sample license type records (`name`, `description`, `product`, `productType`). Default data source for `LicenseTypePage`. |
| `makeInitialLicenseTerms()` | Returns 3 sample license terms (`Yearly`, `7 day(s)`, `Monthly`). Default data source for `LicenseTermPage`. |
| `makeInitialProductTypes()` | Returns 3 sample product types (`SLS Pro`, `SLS Lite`, `EnviroFRONT`) with `status`. Default data source for `ProductTypePage`. |
| `makeInitialReports()` | Returns 2 sample invoice/payment report rows. Data source for `ReportPage`. |
| `makeInitialTimeline()` | Returns 4 sample license audit-log/timeline entries (status/account/site change events). Used by `LicensePage`'s `TimelineModal`. |
| `makeUpcomingRenewalData()` | Returns 5 sample `{ label, value }` points (Apr–Aug) for the upcoming-renewals bar chart. Used by `SlsReportDashboard`. |
| `makeLicenseTrendData()` | Returns 4 sample `{ label, total, accountWise }` points (Feb–May) for the license-trend chart. Used by `SlsReportDashboard`. |
| `demoColumns` | A generic 6-column `DataTable` column-def array (`id`, `account`, `name`, `status`, `type`, `expiry`) for quick demos/docs. |
| `demoData` | 4 rows matching `demoColumns`, for quick demos/docs. |
| `demoDataTableProps` | A ready-to-spread props bundle (`{ columns: demoColumns, data: demoData, rowKey, selectable: true }`) for a minimal `DataTable` example. |
| `demoPaginationProps` | A ready-to-spread props bundle for a minimal `Pagination` example (`page: 1, pageSize: 10, total: 50`, a `console.log` page-change handler). |
| `demoDropdownProps` | A ready-to-spread props bundle for a minimal `Dropdown` example (3 options). |
| `demoSidebarProps` | A ready-to-spread props bundle for a minimal `Sidebar` example (`logo: "SLS UI"`, 3 nav items). |
| `makeMaterialsData()` | Returns 3 sample `{ id, customer, material, qty }` rows. Default data source for `HomeDashboard`. |
