# My Design System

<div align="center">

![My Design System Banner](Color.png)

### Enterprise-Grade React Component System, Multi-Theme Engine & Application Framework

[![React](https://img.shields.io/badge/React-18%20%7C%2019-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?logo=typescript&logoColor=white)](./src/index.d.ts)
[![Storybook](https://img.shields.io/badge/Storybook-10.5-FF4785?logo=storybook&logoColor=white)](https://storybook.js.org/)
[![Vitest](https://img.shields.io/badge/Vitest-Tested-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Zero Config CSS](https://img.shields.io/badge/CSS-Zero--Config_Injection-8B5CF6)](#zero-config-runtime-css)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

<p align="center">
  <a href="#key-architectural-highlights">Architectural Highlights</a> &bull;
  <a href="#quickstart">Quickstart</a> &bull;
  <a href="#component-catalog">Component Catalog</a> &bull;
  <a href="#theming--design-tokens">Theme System</a> &bull;
  <a href="#server-data-binding-architecture">Server Data Binding</a> &bull;
  <a href="#developer-experience--testing">Testing & Tooling</a> &bull;
  <a href="#documentation">Deep Dives</a>
</p>

</div>

---

## Executive Overview

**My Design System** is a production-hardened React UI library and application architecture built for high-density SaaS products, internal tools, and data-intensive enterprise platforms. 

Engineered from the ground up to solve recurring enterprise frontend challenges:
- **Zero-Friction Adoption**: Drop-in components with automatic CSS runtime injection — no manual `@import`, no CSS bundler configuration, and no mandatory root wrappers for single components.
- **Adaptive Data Presentation**: High-performance data grids that automatically adapt from viewport-aware, pinned-header desktop tables to touch-native mobile card lists below `768px`.
- **Decoupled Data Transport**: A battle-tested server-data binding abstraction (`ServerDataProvider`, `useServerDataBinding`, REST adapters) separating UI rendering from data fetching, pagination, debounced searching, and sort serialization.
- **Strict Semantic Design Tokens**: 34 semantic tokens across 4 production themes where tokens describe **what an element is**, never ad-hoc visual attributes.

---

## Key Architectural Highlights

### ⚡ Zero-Config Runtime CSS
Importing a component automatically injects the requisite CSS custom properties into `document.head` via a lightweight, idempotent runtime entry (`autoInit.js`). 
- **Zero setup**: `import { Button } from 'my-design-system'` works immediately.
- **Zero bundle duplication**: Eliminates double-bundling of styles across micro-frontends and host applications.
- **SSR-Friendly**: A standalone stylesheet is also published at `./theme.css` for Next.js, Remix, and static site generators needing compile-time styles.

### 📊 Self-Sizing & Viewport-Pinned `<DataTable>`
Unlike standard table libraries that force either rigid fixed heights or break whole-page layouts, `<DataTable>` dynamically calculates its viewport coordinates:
- Pinned, sticky header with virtualized/constrained body scroll.
- Supports both uncontrolled client-side sorting and controlled server-side sort/filter events.
- Inline copyable cells, custom renderers, multi-row selection, and contextual action menus.

### 📱 Responsive Table ↔ Mobile Card List Hybrid
`<MobileTableWrapper>` monitors responsive breakpoints (at `768px`) and automatically swaps layout modes:
- **Desktop**: Full data-dense multi-column grid.
- **Mobile**: Touch-optimized `<MobileCardList>` featuring long-press bulk selection, bottom-sheet filter modals, and a floating action bar.

### 🎨 34-Token Semantic Theming Engine
Features 4 enterprise-ready themes (`narnix-edge`, `carbon-pro`, `arctic-white`, `slate-navy`). The theme architecture enforces:
1. **Theme Tokens (Color & Surface)**: Variable per theme, swapped seamlessly at runtime via CSS custom properties.
2. **System Tokens (Geometry & Space)**: Consistent radii (`rounded-control`, `rounded-surface`, `rounded-overlay`), standardized control heights (`28px`, `36px`, `44px`), and elevations that preserve visual rhythm.

### 🏢 Turnkey Enterprise Application Modules
Beyond individual UI primitives, the library ships complete, route-ready enterprise screens:
- **License Management** (`LicensePage`): Complex multi-filter CRUD, lifecycle status tracking, and expiration warnings.
- **User & Role Administration** (`UsersPage`): Role tagging, permission matrices, and user modal workflows.
- **Analytics & Reporting** (`SlsReportDashboard`, `HomeDashboard`): Metric summary cards, trend indicators, and donut/bar charts.
- Every screen works out of the box with realistic fallback mock data, or binds directly to your backend API in one prop.

---

## Quickstart

### Installation

```bash
npm install my-design-system
```

*(Or reference the package directly within a monorepo workspace).*

### 1. Basic Component Usage

No CSS imports or wrappers required:

```jsx
import React from 'react';
import { Button, Badge, InputField } from 'my-design-system';

export function UserStatusBadge({ status }) {
  return (
    <div className="flex items-center gap-3">
      <InputField label="Username" placeholder="e.g. alex.chen" />
      <Badge tone={status === 'Active' ? 'online' : 'offline'}>
        {status}
      </Badge>
      <Button variant="primary">Save Changes</Button>
    </div>
  );
}
```

### 2. Multi-Theme Switching

To enable instant runtime theme switching, wrap your root with `ThemeProvider`:

```jsx
import React from 'react';
import { ThemeProvider, ThemeSwitcher, MainLayout } from 'my-design-system';

export function AppRoot({ children }) {
  return (
    <ThemeProvider defaultTheme="narnix-edge">
      <MainLayout
        header={<ThemeSwitcher />}
        sidebar={/* Navigation */}
      >
        {children}
      </MainLayout>
    </ThemeProvider>
  );
}
```

### 3. High-Density Server-Bound Data Table

Connect server-side pagination, sorting, and search debouncing in a single declaration:

```jsx
import React from 'react';
import { ServerDataTable, Badge } from 'my-design-system';

const COLUMNS = [
  { key: 'name', header: 'Application Name', sortable: true },
  { 
    key: 'status', 
    header: 'Status', 
    render: (row) => (
      <Badge tone={row.status === 'Active' ? 'online' : 'offline'}>
        {row.status}
      </Badge>
    )
  },
  { key: 'apiKey', header: 'API Key', copyable: true },
  { key: 'updatedAt', header: 'Last Modified', sortable: true },
];

export function ApplicationsGrid() {
  return (
    <ServerDataTable
      columns={COLUMNS}
      fetcher={async ({ page, pageSize, sortKey, sortDirection, search }) => {
        const query = new URLSearchParams({
          page: String(page),
          size: String(pageSize),
          sort: sortKey || '',
          order: sortDirection || '',
          q: search || '',
        });
        const res = await fetch(`/api/v1/applications?${query}`);
        const { items, totalCount } = await res.json();
        return { data: items, total: totalCount };
      }}
    />
  );
}
```

---

## Component Catalog

Over 45 production-tested components across 5 structural domains:

| Category | Components & Utilities |
| :--- | :--- |
| **Application Layout & Navigation** | `MainLayout`, `Header`, `Sidebar`, `ProfileMenu`, `Footer`, `AuthLayout`, `Breadcrumbs`, `Tabs`, `CommandPalette` |
| **Data Presentation & Grids** | `DataTable`, `ServerDataTable`, `MobileTableWrapper`, `MobileCardList`, `Pagination`, `BarChart`, `DonutChart`, `MetricSummary`, `DetailCard` |
| **Forms & Input Controls** | `InputField`, `InputGroup`, `Dropdown`, `AsyncDropdown`, `AsyncMultiSelectDropdown`, `DatePicker`, `DateRangePicker`, `Checkbox`, `Button`, `IconButton`, `FloatingAddButton`, `DynamicRowList` |
| **Feedback, Modals & Overlays** | `Modal`, `FormModal`, `ConfirmDialog`, `BottomSheet`, `ToastProvider`, `useToast`, `Badge`, `Loader`, `ErrorBoundary`, `EmptyState`, `ValidationMessage` |
| **Domain Pages & Templates** | `LicensePage`, `UsersPage`, `UserProfilePage`, `HomeDashboard`, `SlsReportDashboard`, `ReportPage`, `MasterListPage`, `LoginForm` |

---

## Theming & Design Tokens

### Built-in Production Themes

The system includes 4 calibrated themes, each tested for WCAG 2.1 contrast compliance:

```
┌─────────────────┬──────────────┬───────────────────────────────────────────┐
│ Theme Key       │ Style Name   │ Aesthetic Description                     │
├─────────────────┼──────────────┼───────────────────────────────────────────┤
│ narnix-edge     │ Dark Teal    │ Deep blue-black chrome with cyan/teal     │
│                 │ (Default)    │ highlights. Optimized for NOC/DevOps UIs. │
│ carbon-pro      │ Dark Minimal │ Near-black carbon surfaces, clean slate   │
│                 │              │ borders, vibrant blue focus states.       │
│ arctic-white    │ Pure Light   │ Crisp white cards, high-contrast text,    │
│                 │              │ subtle borders for high-glare environments│
│ slate-navy      │ Hybrid Navy  │ High-contrast navy navigation paired with │
│                 │              │ a bright, readable canvas workspace.      │
└─────────────────┴──────────────┴───────────────────────────────────────────┘
```

### Semantic Token Philosophy

Tokens avoid physical dimensions in favor of functional intent:

- **Radius Hierarchy**:
  - `rounded-control` (`8px`): Buttons, text fields, dropdown triggers, and interactive elements.
  - `rounded-surface` (`12px`): Cards, table containers, popovers, and panels.
  - `rounded-overlay` (`16px`): Modals, dialogs, and slide-over drawers.
  - `rounded-pill` (`9999px`): Status badges, notification pills, and avatar rings.
- **Control Heights**:
  - `h-control-sm` (`28px`): High-density data grid actions and inline table filters.
  - `h-control-md` (`36px`): The enterprise standard for form inputs and standard buttons.
  - `h-control-lg` (`44px`): Primary hero action buttons and mobile touch targets.

---

## Server Data Binding Architecture

The library decouples UI display components from data fetching mechanisms:

```
┌─────────────────────────────────────────────────────────────┐
│                    <ServerDataProvider>                     │
│    (Defines Base URL, Auth Headers, Interceptors, Paths)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌──────────────────────────────┐       ┌──────────────────────┐
│    useServerDataBinding()    │       │  REST Adapter Layer  │
│  - Debounced search & query  │       │  createRestAdapter   │
│  - Pagination state cache    │       │  createCreateAdapter │
│  - Controlled column sorts   │       │  createUpdateAdapter │
│  - Structured error mapping  │       │  createDeleteAdapter │
└──────────────┬───────────────┘       └──────────┬───────────┘
               │                                  │
               ▼                                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Consuming Components: <ServerDataTable>, <LicensePage>...  │
└─────────────────────────────────────────────────────────────┘
```

- **Resilient Errors**: Automatically extracts error messages from backend JSON responses (`message`, `error`, or `detail`), delivering actionable notifications to users.
- **Dynamic Headers**: Accepts function-based auth headers (`() => ({ Authorization: ... })`) to seamlessly support short-lived or refreshed JWT tokens.

---

## Developer Experience & Testing

Quality is guaranteed through automated verification suites and continuous integration checks:

### Commands & Scripts

```bash
# Start local preview application with interactive routes
npm run dev

# Compile library bundles (ESM, UMD, types, and theme CSS)
npm run build

# Run unit and component test suites with Vitest
npm test

# Launch Storybook 10 component workshop
npm run storybook

# Verify bundle exports, token coverage, and public entrypoints
npm run verify:package

# Execute linting with ESLint and Prettier
npm run lint:ci
```

### Comprehensive Testing Strategy

- **Unit & Integration Tests**: Fast test runs covering hooks, table sizing calculations, and server binding adapters using Vitest and jsdom.
- **Component Interaction Tests**: Storybook 10 CSF3 interaction tests powered by `@storybook/addon-vitest` and Playwright headless browser.
- **Accessibility Audits**: Automated WCAG compliance checks run against core primitives via `axe-core` and `vitest-axe`.
- **Package Integrity Gate (`verify:package`)**: CI check validating that every declared export is importable, all 34 theme tokens are present, and zero accidental external dependencies leak into bundles.

---

## Project Architecture

```
my-design-system/
├── .github/workflows/        # Continuous integration workflows
├── .storybook/               # Storybook 10 configuration & preview decorators
├── docs/                     # VitePress documentation portal
├── scripts/                  # Package verification, bundle audits & doc collectors
├── src/
│   ├── components/
│   │   ├── common/           # Fundamental UI atoms, inputs, and data grids
│   │   ├── feature/          # Domain-specific modules (license, users, reports)
│   │   └── layout/           # App shells, sidebars, headers, profile controls
│   ├── data/                 # Deterministic mock datasets for standalone previews
│   ├── lib/                  # Server data binding, API clients, formatters
│   ├── pages/                # Complete pre-built turnkey page templates
│   ├── stories/              # Living component stories and design tokens
│   ├── theme/                # Token registry, ThemeProvider, ThemeSwitcher
│   ├── App.jsx               # Interactive standalone development harness
│   ├── index.js              # Primary ESM/CJS library entrypoint
│   ├── index.d.ts            # Complete TypeScript declaration map
│   └── theme.css             # Tailwind v4 theme bridge stylesheet
├── tailwind-preset.js        # Shareable preset for consuming Tailwind projects
└── vite.config.js            # Dual-format rollup build configuration
```

---

## Documentation

For comprehensive guides and API references:

- 📖 **[DOCUMENTATION.md](./DOCUMENTATION.md)** — Exhaustive component API reference, prop tables, and known usage notes.
- 🎨 **[DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md)** — Semantic token architecture, elevation systems, and spatial guidelines.
- 🏗️ **[BUILDING-AN-APP.md](./BUILDING-AN-APP.md)** — Step-by-step walkthrough of assembling full-stack applications with this system.
- 📝 **[CHANGELOG.md](./CHANGELOG.md)** — Release history and migration guides.
- 🤝 **[CONTRIBUTING.md](./CONTRIBUTING.md)** — Architecture rules and contribution practices.

---

## License

Distributed under the [MIT License](./LICENSE). Designed and built with pride for high-craft software engineering.
