# Changelog

Notable changes to `my Design System`. Newest first.

This project follows [semantic versioning](https://semver.org). For a library,
the promise is specific:

- **Patch** — a fix that changes no API and no rendered output a consumer could
  reasonably depend on.
- **Minor** — new components, new props, new tokens. Existing code keeps
  working.
- **Major** — a removed or renamed export, a changed prop contract, or a visual
  change a consumer would have to react to.

Visual changes count. A component that starts rendering at a different size
breaks a layout just as surely as a renamed prop breaks a build.

## Deprecating

Nothing is removed without a release that warns about it first. Mark it
`@deprecated` in the JSDoc and the types, say what to use instead, ship that in
a minor, and remove it no earlier than the next major. `useResource` is the
worked example — deprecated in favour of `useServerResource`, still exported,
still working.

---

## Unreleased

### Added

- **A non-colour token layer** — radius, control height, type scale, elevation,
  motion and stacking order, named for what a thing is rather than how big it
  is. See [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md).
- **`designTokens` tests** guarding the seven primitives that define the visual
  language against raw radii, raw shadows and ad-hoc pixel sizes.
- **Plumbing**: `configureApiClient`, `AuthProvider`/`useAuth`, `authService`,
  `createResourceService`, `useServerResource`, `useDistinctValues`,
  `PageFilterContext`, `ResourceTable`, `ChartWithData`. An application no
  longer writes its own session handling and data binding.
- **Licence expiry** — `LicenseStatusCell`, `getLicenseLifecycle`,
  `getLicenseRowTone`, and a `columnWidth` scale.
- **`getRowTone` and `headerAlign`** on `DataTable`.
- **`logo` and `brandName`** on `LoginForm`, `LoginPasswordForm` and
  `AuthLayout`, so an application can brand its sign-in screen.
- **CI** running lint, tests, build, package verification, and an install of the
  packed tarball into a fresh project.
- **`useResourceFilters`** — declare a screen's filterable columns and it
  fetches the options, holds the draft until Search, publishes the panel to the
  shell, and returns a ready node for the mobile sheet. Replaces assembling
  `useDistinctValues` + `usePageFilters` + draft state by hand, and removes the
  arrangement where a page renders its own panel into a container that clips it.
  Takes `rows` to derive options locally for a screen not yet paging from the
  server.
- **`useBottomSheet`** — reads the enclosing `BottomSheet`, so content can
  dismiss it. An Apply button that leaves the sheet covering the result it just
  produced looks like a button that did nothing.
- **`selectionMode`** on `MobileTableWrapper` and `MobileCardList` —
  `"single"` or `"multiple"` (the default). Single-select replaces on each
  pick and selects on a plain tap; there was previously no way to ask for it.
- **`ReportTablePanel`** — a self-contained report table that fetches its own
  page, owns its own filter popover (configurable dropdowns plus a date
  range), and renders through `MobileTableWrapper`. The full, filterable
  counterpart to the six-row `ResourceTable` preview.
- **`RenewalStreamFormModal`** — the edit form `LicenseRenewalModal`'s
  `onEditRow` opens; the "Value" field's control (segmented on/off, dropdown,
  or plain input) is derived from which stream `key` is being edited.
- **`ExternalDeviceInfoModal`** — read-only device-field viewer for a license,
  with an explicit empty state rather than invented placeholder values when a
  backend doesn't return device data yet.
- **`typeOptions` / `termOptions`** on `LicenseFormModal`, so an application
  supplies its real license-type/term master lists instead of the library's
  placeholder demo options. Picking a term with a known fixed length
  (`Yearly`, `Monthly`, `Quarterly`, `"Half Year"`, `"2-Year"`, `"7 day(s)"`)
  auto-fills and locks Duration.
- **`onFilter` / `onExternalDeviceInfo` / `actions`** on `LicenseToolbar` — a
  filter-trigger button, an External Device Info action, and an `actions`
  allow-list so a master-data screen can render a small subset of the toolbar
  instead of the full license-lifecycle button set.
- **`loading` / `subtitle`** on `TimelineModal`, and richer `Timeline` entries
  — `kind` (grades a node's icon/colour: created, changed, deleted, document,
  note), `description` (a prose line in place of a diff table), `change`
  (singular alternative to `changes`), `relative` timestamps, and a `reason`
  line rendered under a diff. Diff values that parse as JSON are now
  pretty-printed instead of rendered as one unbroken line.
- **`rows`** on `LicenseFilter` and `UsersFilter`, and **`keys`** on
  `ReportFilter` — dropdown options are derived from the screen's own data
  instead of a hardcoded demo list, with `keys` remapping which field backs a
  given dropdown for datasets that name columns differently.
- **`requireCurrent`** on `ChangePasswordModal`, adding a Current Password
  field; `onSave` now also receives it as a second argument.
- **An optional `payload` argument on `removeMany`** —
  `createResourceService`'s and `useServerResource`'s `removeMany(ids, payload)`
  now forward extra context (a deletion reason, a ticket number) to the
  backend alongside the ids. (`useResource`'s `removeMany` intentionally still
  takes only `ids`.)
- **`layout` / `actionAlign` / `searchLabel` / `clearLabel`** on `FilterPanel`
  — a single stacked-column layout for `FilterField` rows, right-aligned
  actions, and relabellable buttons.
- **`dense`** on `DataTable`, forwarded through `MobileTableWrapper`,
  `ChartWithData`, and `ReportTablePanel` — reduces body cell padding/font
  size and, by a smaller step, the header row's own padding, for a more
  compact table. Defaults to `false`, so nothing changes for an existing
  caller.
- **`order`** on `LicenseToolbar` — an explicit action-key sequence that
  overrides the default grouped layout, rendering the requested actions as
  one flat row/drawer with no group dividers. `actions` still decides which
  buttons exist; `order` only decides the sequence.
- **`shape`** on `Badge` — `"pill"` (the default, so nothing existing moves)
  or `"control"`, the radius the scale gives buttons, inputs and tags. A
  badge naming a state wants the pill; one carrying a figure — a total, a
  count — wants the softer rectangle, where a fully-rounded chip reads
  looser than the number deserves. A prop rather than a `className`
  override because `cn` does no tailwind-merge: a radius passed through
  `className` would not replace the default, it would sit alongside it and
  let stylesheet order decide.
- **`logo`** on `Header` — a brand mark at the start of the bar, after the
  mobile-sidebar button and before the title. The mark normally lives in
  `Sidebar`, which is a drawer below `md:` — so a closed drawer took it off
  the screen entirely and an app had no logo at all on a phone. Scope it to
  the breakpoints that need it (`md:hidden` in the usual `Sidebar` pairing)
  so it isn't shown twice.
- **`MobileTableToolbar`** — the one mobile toolbar a table screen wears:
  search, a filter button with an active-count badge, sort, the card/table
  view toggle, and pagination on its own row, plus a contextual action bar
  that *replaces* the controls while rows are selected (Material's
  contextual action bar / iOS's edit-mode toolbar). Every control is
  optional, so a screen with nothing to sort by simply gets no sort button.
  Supersedes assembling these per screen — which is how seven screens ended
  up with four different mobile toolbars between them, two of them with no
  way to search or filter at all.
- **`hideMobileToolbar`** on `MobileTableWrapper` — drops its own sticky
  toolbar entirely, for a screen rendering `MobileTableToolbar` above the
  table instead. Prefer it to combining `hideMobileControls` +
  `hideMobileSearch`, which suppress the parts but leave the empty bordered
  bar behind.
- **`MobileViewControls`** — the Sort and Card/Table view-toggle buttons
  `MobileTableWrapper` renders in its own mobile toolbar, split out into a
  standalone component so a page can place them elsewhere (next to its own
  pagination, for instance). Pair with `MobileTableWrapper`'s new
  `viewMode`/`onViewModeChange` (controlled, optional — internal state when
  omitted) and `hideMobileControls` (hides the wrapper's own copies of these
  buttons).
- **Storybook** (`npm run storybook` / `npm run build-storybook`) — foundation
  pages for colour, type, and non-colour tokens, plus a colocated story per
  common component, all previewable against any of the four themes via a
  toolbar switcher built on `ThemeProvider`. Every story doubles as an
  automated regression check: `npx vitest run` renders each one in real
  Chromium through `@storybook/addon-vitest`, alongside the existing jsdom
  unit suite.

### Fixed

- **`docs:build` failed, and before that silently dropped text.** VitePress
  compiles each page as a Vue template, where `{{ … }}` is interpolation —
  inside an inline `code` span too, which is easy to write by accident when
  documenting a JSX prop. `keys={{ site: "siteName" }}` did not parse and
  broke the build with a position in the *compiled* output that pointed
  nowhere near the markdown at fault; `value={{from,to}}` did parse, so it
  was quietly evaluated against a component with no such data and the site
  published "the `value=` API". Both rephrased, and `scripts/collect-docs.mjs`
  now refuses to generate a page containing one, naming the file and line.
- **Two timeouts made `vitest run` report failures that were not failures.**
  The suite runs a jsdom project and a real Chromium one at once, so on a
  loaded machine they compete for cores: a story would exceed the addon's 15s
  default and a different one failed each run. Worse in the jsdom project —
  a full axe pass over a `DataTable` could overrun the 5s default, and
  because axe will not start a second run while one is going, that left every
  later `axe()` in the file failing with "Axe is already running", blaming
  eight components when one was merely slow. Browser tests now allow 60s, and
  the accessibility file 30s (scoped there, so an ordinary unit test that
  genuinely hangs still fails fast).
- **`MultiSelectDropdown`'s menu did not escape its container, so it alone
  behaved differently from every field beside it.** `Dropdown` has always
  portalled its menu to `document.body` and positioned it `fixed`; this one
  rendered inline with `absolute z-[105]`. In the shared filter panel that
  made the one `multiSelect` field — Product, on the License and License Type
  screens — the only control whose menu stayed boxed inside the panel while
  its siblings floated above it, and it was clipped outright by any ancestor
  with `overflow: auto`/`hidden`. It now uses the same portal, the same
  `fixed` positioning against the trigger, the same flip-above-when-cramped
  rule, the same `z-[200]`, and the same `data-portal-popover` marker so
  ticking an option is not read as a click outside the panel. Verified
  identical to `Dropdown` in the desktop panel and the mobile sheet.
- **The card/table view toggle went invisible once switched to table view.**
  `cn` is plain `clsx` with no tailwind-merge, so appending a conflicting
  utility does not replace the base one — both land in `class` and the
  stylesheet's own order picks the winner, not the order they were written
  in. The active state appended `bg-accent text-white` over a base
  `bg-input text-ink-muted`; `--color-input` is declared last in
  `@theme inline`, so `bg-input` was emitted last and won, while `text-white`
  won over `text-ink-muted`. The result was a white icon still sitting on the
  idle background — measured 1.05:1 on `arctic-white`, i.e. invisible. Idle
  and active are now whole, mutually exclusive class sets, so only one is
  ever applied: 5.17:1 on the same theme. Fixed in `MobileTableToolbar`,
  `MobileViewControls` and `MobileTableWrapper`'s own toggle, all of which
  shared the pattern, plus the same latent collision on
  `MobileTableToolbar`'s active filter button. Covered by tests asserting a
  button never carries two utilities from one group at once, which is the
  invariant rather than the colour (jsdom applies no stylesheet).
- **`verify:package` failed on every story file**, and with it
  `prepublishOnly` — so the package could not be published at all. The check
  treats each name a component file exports as public API it must re-export;
  colocated `*.stories.jsx` files export one name per story (`Playground`,
  `Sizes`, `WithIcon`…), none of which are public. Stories are now skipped
  alongside tests.
- **`Header`'s controls overhung the bar itself on a phone.** The bar was
  `h-10` (40px) while the mobile-menu, theme-switcher and profile buttons
  inside it are touch targets at `control-lg` (44px), so all three sat ~2px
  proud of it top and bottom. Measured in a 375px viewport: bar `0→40`,
  buttons `-2.3→41.7`. The bar is now `h-12` (48px) below `sm:`, so the
  targets fit inside it with room to spare rather than being shrunk under
  the 44px minimum. (`sm:h-11` and up is unchanged.)
- **`updateMany`'s published type only allowed `Partial<T>`**, even though the
  implementation always spread `payload` straight into the request body
  (`{ ids, ...payload }`) — exactly like `removeMany`'s payload, which was
  already typed to allow it. A patch that rode along extra request metadata
  (a ticket number, alongside the real field changes) had to `as any` past
  the mismatch; now typed `Partial<T> & Record<string, unknown>`, matching
  `removeMany`.
- **`useResourceFilters`'s published types declared `filters`/`setFilters` as
  `Record<string, string>`**, even though a `multiSelect` field has always
  produced (and `MultiSelectDropdown`/`activeCount` have always correctly
  handled) an array value — the implementation was right, only the type was
  behind it. Every call site with a `multiSelect` field had to `as any` past
  the mismatch to compile; now typed `Record<string, string | string[]>`,
  matching `useServerResource`'s own `filters` type, so it doesn't.
- **A long value in `MobileCardList`'s expanded detail row was cut off with
  no way to read the rest.** A column's `render` (e.g. `TruncatedText`) is
  shared with the desktop `DataTable`, where single-line ellipsis is correct
  for a fixed-width cell — that same render output was reused verbatim here,
  where there's no such constraint once a card has been expanded. The value
  container now overrides a nested `truncate`'s wrapping back on
  (`[&_.truncate]:whitespace-normal` etc.), which wins on specificity
  regardless of what a given column's `render` returns. The desktop table
  cell is untouched — still single-line ellipsis, as intended there.
- **A selected `DataTable` row was indistinguishable from an unselected one,
  on every theme.** Selection used `bg-accent-muted/40` — the badge-fill
  token, not a foreground. Composited over a card it lands within ~1.01–1.04:1
  of the card's own colour on all four themes (measured), i.e. no visible
  difference at all. Selection (and keyboard focus) now dilute the accent
  *foreground* instead, which is a colour meant to be seen against a card:
  1.23–1.32:1 across the same four themes.
- **A row kept its focus tint after being deselected**, reading as a leftover
  shadow marking a row that was no longer selected. Focus was a class driven
  by React state, so it stayed painted on whichever row was last clicked.
  It's now a `:focus-visible` variant — visible for keyboard navigation,
  absent for a pointer click, which is the distinction that was actually
  wanted.
- **Clicking a `DataTable` row's checkbox — or the header's select-all — did
  nothing.** `Checkbox` renders a real `<input>` inside a `<label>`, so a
  click on the box is forwarded by the browser to the input and both bubble;
  the enclosing cell's `onClick` ran twice, selecting and immediately
  deselecting. Selection is now driven from the checkbox's own `onChange`
  (fires once) with the click stopped at its wrapper, and is additive rather
  than replacing the selection — the reason a checkbox column exists at all is
  picking several rows without holding a modifier.
- **`DateRangePicker`'s "day is in the selected range" highlight was
  effectively invisible**, for the same reason and with the same fix as
  selection above (`bg-accent-muted/40` → the accent foreground diluted). The
  two endpoints were always clearly marked; the band connecting them was not.
- **A dense `DataTable` header could render shorter than its own rows.**
  `dense` gave the header and body cells identical padding, but a header
  carries one line of short labels against a body cell's wrapped content, so
  equal padding produced unequal height — a 30.5px header sitting above
  37px rows. The header now gets one padding step more than the body in both
  density modes (applied to the select-all header cell too, which previously
  kept fixed `py-2` regardless of `dense`).

- **A filter panel rendered by a page opened where nobody could see it.**
  `position: absolute` inside a container that is `overflow: hidden` with
  `min-h-0` put it below the content and clipped it — 620px wide, in the DOM,
  invisible. Seven screens in the reference app had a filter button that did
  nothing. `useResourceFilters` publishes to the shell instead, which is outside
  every page's clipping context.
- **Scrolling a card list selected rows.** The long-press timer had no idea the
  view had moved, so it fired part-way through a flick and ticked whatever row
  was under the thumb. A press is now cancelled once the finger travels more
  than 10px, or the list scrolls.
- **Selecting a card did nothing.** The control was a `div` wrapping a
  label-and-input pair, so the browser forwarded each tap to the input and the
  handler around it ran twice — selecting and immediately deselecting. It is now
  a button carrying checkbox (or radio) semantics, and the target is the whole
  44px control rather than the 16px box inside it.
- **Multi-select needed a 380ms hold per row.** Once one row is selected, a
  plain tap now adds to the selection.
- **A floating add button sat on top of the last rows' action icons.** The card
  list now leaves room to scroll clear of it, and the bulk action bar sits above
  that corner rather than across it.
- **Safe-area insets** on the floating button, the bulk bar and `BottomSheet`,
  so the bottom control is not under a phone's home indicator. Needs
  `viewport-fit=cover` in the host page's viewport meta.
- **Touch targets below 44px** on `Pagination`, the `MobileTableWrapper`
  toolbar, `BottomSheet`'s close, `Tabs`' scroll arrows, `ThemeSwitcher`,
  `ProfileMenu` and `LicenseToolbar`'s mobile drawer. All step back down to the
  desktop size from `md:` up, so pointer layouts are unchanged.
- **`LicenseStatusCell` overflowed a card.** `whitespace-nowrap` keeps table
  rows even; on a card there is no row to keep even and it pushed the label past
  the edge. Now wraps below `md:`.

- **The published package could not be imported.** `recharts`, `lucide-react`
  and `clsx` were bundled instead of externalised, and recharts' CommonJS
  interop emitted a bare `require("react")` into the ESM output, which throws on
  load. Also meant a consumer with its own React got two copies — two sets of
  contexts, silently broken providers. 995 kB → 415 kB.
- **`verify:package` could never pass**, so `prepublishOnly` was permanently
  red: it required a theme that has never existed.
- **Superseded requests are cancelled** rather than left running, and changing a
  search or filter fires one request instead of two.
- **Tables keep their rows while the next page loads** instead of blanking.
- **Accessibility**: a modal left focus behind its overlay; the dropdown menu
  was a listbox full of list items; the resize handle and the filter close
  button had no accessible name.
- **Two status colours failed contrast** at 3.00:1 and 4.08:1.
- **Column widths ignored what pages asked for** — a name-based guess overrode
  every declared width.
- **`Sidebar`'s mobile drawer remounted everything inside it — logo included —
  on every open**, because it was `return null`-ed while closed. A phone
  needs the node already in the DOM before a slide transition can animate it
  in, so the drawer now stays mounted throughout and closed-state semantics
  (untabbable, unclickable, hidden from assistive tech) are carried by
  `inert` plus `pointer-events-none`/`opacity-0` instead — confirmed by DOM
  node identity across a close/open/close cycle and zero repeated resource
  fetches for the logo image.
- **That fix's `inert` value was itself wrong on React 19**, the version this
  app actually runs. `inert={true}` (JS boolean) is silently dropped by
  React 18, which doesn't recognise `inert` as boolean at all and only ever
  writes a string value verbatim — so the first correction used `inert=""`,
  confirmed correct there. React 19 *does* recognise it as boolean and reads
  it by JS truthiness, where `Boolean("")` is `false` — the opposite
  behaviour for the same input, so the drawer was live (interactive, in the
  tab order) while visually closed. `inert="true"` (the non-empty string) is
  the one value both agree on: React 18 writes it as-is, and React 19's
  truthiness check reads it as `true`. Verified against `react-dom/server`
  from both projects' own `node_modules` before shipping.
- **`SearchBox`'s focus ring lit up from clicking its own filter or clear
  button**, not just from typing — `focus-within` fires for any focused
  descendant, and both buttons live inside the same box as the input. Once
  the attached `FilterPanel` had no gap under the box, the ring stayed lit
  the entire time the panel was open, reading as a stray glow with nothing
  to do with what was actually focused. Rescoped to the input's own focus
  (`has-[input:focus]`), and the glow itself dropped in favour of a plain
  solid border — a blurred ring for "typing" beside a crisp border for
  "panel open" were two different treatments for what is meant to be the
  same "this is active" signal; both now read the same way.
- **`FilterPanel` had its own border and rounded corners on every edge, even
  sitting flush with no gap under `SearchBox`.** The shared edge doubled the
  border and put a rounded corner where the two meet, reading as two
  separate boxes stacked rather than one control opening into its own
  results. New `attached` prop drops the top border and rounding on that
  edge and switches to a solid accent border matching the box's own
  open-state colour (paired with `SearchBox`'s new `filtersOpen` prop) —
  together they read as one continuous surface, the ring's job now done
  properly by a deliberate border rather than an accidental glow.
- **`MobileTableToolbar` had no way to show a page-level action with no
  per-row scope** (Reload, Download): `selectionActions` only renders once
  `selectedCount > 0`, so a screen with nothing to select — or an action
  that, like these two, was never disabled by selection on desktop either —
  had no way to reach it at all. New `toolbarActions` prop sits beside
  filter/sort/view instead, visible unconditionally. Its `selectionActions`
  row also had no overflow handling, a fixed-width flex group that simply
  broke once asked to hold as many icons as a real desktop toolbar can
  (License's runs to ten); now scrolls horizontally rather than forcing
  everything into a fixed width, for any screen that does still use it.
- **On the License page, mobile's per-row "Row Actions" sheet drifted from
  the desktop toolbar (`LicenseToolbar`) it's meant to mirror** — missing
  several of its ten actions (Update Property, Row Selection Preview, Get
  History Pi And Invoice, Timeline, Download, License Renewal), and where
  an icon *was* present, Activate/Deactivate used different ones
  (`Power`/`PowerOff` instead of desktop's `Check`/`UserCog`). Now carries
  the identical ten, in the same order, with the same icons, plus its one
  extra entry, View details, which the icon-only desktop toolbar has no
  room for. The page's checkbox-driven selection bar — a second, cramped
  route to the same ten actions as tiny icon-only buttons needing
  horizontal scroll to reach half of them — was dropped outright rather
  than extended to match: once the per-row sheet covers everything, a
  duplicate mechanism for reaching it is its own bug, not a feature to keep
  in parity. Report's and User Activity's mobile toolbars had the
  `toolbarActions`-shaped problem above — Reload/Download lived in
  `selectionActions`, so reaching them required selecting a row first even
  though neither is disabled by selection on desktop; moved there instead.

### Changed

- `DataTable`'s `headerAlign` now governs the body cells too, not just the
  header row. `"auto"` (the default) still leaves both unaligned unless a
  column sets its own `align`; forcing `headerAlign` to `"center"`/`"right"`
  used to centre only the label, leaving every cell beneath it left-aligned —
  a heading floating over data it doesn't sit above. A column's own `align`
  still wins over the table-wide default either way.
- Four themes, relabelled by what they look like rather than by number. The
  docs described six, two of which did not exist.
- **`LicenseRenewalModal` rebuilt** — was a `SlideOverModal` list of
  `streams`; is now a full paginated, filterable `DataTable` inside a `Modal`.
  `streams` is gone in favour of `rows`/`total`/`page`/`pageSize`/
  `onPageChange`/`onSearch`/`productOptions`/`accountOptions`/`onEditRow`/
  `onDeleteRow`. **Breaking** for anything passing `streams`.
- **`SelectionRowPreviewModal` rebuilt** — the four fixed action buttons
  (Create Proforma / Tax Invoice / Revise / Cancel) are replaced by a
  `documentTypes` dropdown plus one confirm button. `onCreateInvoice(kind)` is
  gone in favour of `onConfirm(documentType, keptLicenses)`, and the panel now
  supports a local name search and per-row removal before confirming.
  **Breaking** for anything passing `onCreateInvoice`.
- **`UpdatePropertyModal` rebuilt** — `sites` is gone in favour of
  `sitesByAccount` (keyed by account); added `license`, `efAccounts`, and
  `linkLicenseOptions` for OCEMS/EnviroFront-conditional fields. It no longer
  calls `onClose()` for you after `onSave` — close it yourself, matching every
  other feature modal. **Breaking** for anything passing `sites` or relying on
  the auto-close.
- **`HistoryPiInvoiceModal` rebuilt** — `records` is gone in favour of a
  tabbed `piRecords`/`tiRecords` table with `onView`/`onDelete` per row; the
  old `status`-driven Paid/Pending badge is gone with it. **Breaking** for
  anything passing `records`.

---

## Earlier

No changelog was kept before this point. The history is in the commits.
