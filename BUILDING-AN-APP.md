# Building an SLS app from this library

This is the path from an empty Vite project to a working screen backed by a real
database. It is the same path the reference app in `testing/testApp` took, and
every piece named here is exported from the package.

The short version: the library brings the plumbing, your app says where to point
it.

---

## 1. Install

```bash
npm install my Design System react react-dom
```

`react`, `react-dom`, `clsx`, `lucide-react` and `recharts` are dependencies of
your app, not copies bundled inside the library. That is deliberate — two copies
of React means two sets of contexts, and hooks and providers stop working in
ways that are very hard to trace.

No CSS import is needed. Importing anything from the package injects the theme
stylesheet once.

---

## 2. Point it at your backend

The library cannot read your environment — it has no idea which app it has been
dropped into. So the app reads its own settings and hands them over, once,
before anything renders.

```js
// src/config.js
import { configureApiClient } from "my Design System";

configureApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  tokenStorageKey: "my_app_session_id",
});
```

```js
// src/main.jsx — first, so no component can fetch before this has run
import "./config.js";
import App from "./App.jsx";
```

### Prefer same-origin, and proxy in development

Leave `baseUrl` empty and let requests go to the origin the page came from,
with the dev server forwarding `/api` to the backend:

```js
// vite.config.js
server: {
  host: true,
  proxy: { "/api": { target: "http://localhost:5217", changeOrigin: true } },
}
```

An absolute URL is baked into the JavaScript the browser runs, and there is no
absolute URL that is right everywhere. `localhost` means *this device*, so the
moment anyone opens the app from a phone or another laptop it resolves to their
machine and finds nothing — which surfaces as "unable to reach the API",
pointing at an address that is perfectly reachable from the developer's own
desk. A LAN IP works until the DHCP lease changes.

Proxying also takes CORS out of the picture — one origin, so there is no
cross-origin request to refuse — and leaves the API on loopback rather than
exposed to the network in its own right.

Set an absolute `baseUrl` only when the API genuinely lives elsewhere, and add
that origin to the API's CORS allow-list when you do.

Everything downstream — the auth service, every resource service, the filter
dropdowns — picks that up automatically.

### What the client expects from your API

Responses may use an envelope, and the client unwraps it:

```json
{ "success": true, "message": "", "data": { }, "errors": [], "statusCode": 200 }
```

A response without an envelope is passed through as-is, so an endpoint returning
a bare array works too.

Two behaviours worth knowing:

- **A 401 signs the app out**, whether it arrives as the HTTP status or as
  `statusCode` inside the envelope. Backends differ on this, and the cost of
  missing it is someone stuck on a signed-in screen where nothing works.
- **A failed sign-in is not a 401 that signs you out.** Requests sent with
  `skipAuth` never broadcast session rejection, so a wrong password does not log
  out the tab that is trying to log in.

---

## 3. Sign-in

```jsx
import { AuthProvider, useAuth, LoginForm, LoginPasswordForm, Loader } from "my Design System";

function Root() {
  return (
    <AuthProvider sessionCheckIntervalMs={30_000}>
      <Gate />
    </AuthProvider>
  );
}

function Gate() {
  const { status, user, logout } = useAuth();

  if (status === "checking") return <Loader />;
  if (status === "unauthenticated") return <SignIn />;
  return <Shell user={user} onSignOut={logout} />;
}
```

Sign-in is two steps — identifier, then password — so the two forms are separate
components and your app holds the identifier between them:

```jsx
function SignIn() {
  const { login } = useAuth();
  const [username, setUsername] = React.useState(null);

  if (username == null) {
    return (
      <LoginForm
        label="Username"
        heading="Welcome to SLS"
        validate={async () => {}}   // throw here to reject an unknown identifier
        onContinue={setUsername}
      />
    );
  }

  return (
    <LoginPasswordForm
      email={username}
      onBack={() => setUsername(null)}
      onSignIn={(password) => login(username, password)}
    />
  );
}
```

Both forms render inside `AuthLayout` themselves, so there is no need to wrap
them.

`AuthProvider` watches for a session ending three ways, because a session can
end for reasons this tab never sees:

1. **Reactively** — any 401 anywhere in the app.
2. **Proactively** — a re-check on a timer and whenever the tab regains focus,
   so an idle tab notices on its own rather than at the next click.
3. **Across tabs** — if the stored session id is cleared elsewhere, this tab
   follows.

`expiredMessage` is set only when the *server* ended the session, never when the
user signed out deliberately. Show it once, then call `clearExpiredMessage()`.

---

## 4. Declare your resources

One service per endpoint. This is the only file that maps a screen to a URL.

```js
// src/services/resources.js
import { createResourceService } from "my Design System";

const shared = { disableFallback: import.meta.env.PROD };

export const licensesService = createResourceService({
  label: "Licenses",
  path: "/api/licenses",
  ...shared,
});
```

### The demo fallback

Given `demoData`, a service that cannot reach its endpoint serves an in-memory
copy instead — paged, sorted, searched and filtered the same way the server
would be, so the screen behaves normally while the backend is still being
written.

It never swallows a 401 or 403. Answering an auth failure with a screen of
plausible-looking records is worse than answering it with an error.

**Turn it off (`disableFallback: true`) once the backend is real.** Past that
point it converts an outage into a working-looking app serving rows that are not
real.

---

## 5. A screen

```jsx
import { useServerResource, MobileTableWrapper, Pagination } from "my Design System";
import { licensesService } from "../services/resources";

export function LicensePage({ search, onToast }) {
  const {
    data, total, page, setPage, pageSize, setPageSize,
    sortKey, sortDirection, setSort,
    loading, isFetching, error, refetch,
    create, update, remove, updateMany, removeMany,
  } = useServerResource(licensesService, { onToast, pageSize: 50, search });

  return (
    <>
      <MobileTableWrapper
        columns={columns}
        data={data}
        rowKey={(r) => r.id}
        serverSide
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={setSort}
        loading={loading}
        error={error}
        onRetry={refetch}
      />
      <Pagination page={page} pageSize={pageSize} total={total}
                  onPageChange={setPage} onPageSizeChange={setPageSize} />
    </>
  );
}
```

The database does the paging, sorting, searching and filtering. `data` holds one
page — never the whole table — so the screen costs the same at fifty rows as at
fifty thousand.

### What the hook handles for you

- **Superseded requests are cancelled**, not just ignored. Typing six characters
  used to leave six queries running and throw five results away.
- **Changing a search or filter fires one request, not two.** It returns to page
  1, and doing that in an effect meant one request for the stale page and
  another for the new one.
- **Rows stay on screen while the next page loads.** `loading` is true only when
  there is nothing to show yet; `isFetching` covers any request in flight, for a
  subtler indicator.

### What your backend needs to read

| Parameter | Meaning |
|---|---|
| `page`, `limit` | Which slice |
| `sortKey`, `sortDir` | Ordering (`asc` / `desc`) |
| `q` | Search term |
| `filter_<field>` | One filter; several values arrive comma-separated |

and return `{ items, total }` — the total being the full count, not the length
of the page, or paging cannot render.

---

## 6. Filters

One hook per screen. Declare the columns; it fetches the options, holds the
draft, and publishes the panel:

```jsx
// module scope, so the list is not rebuilt on every render
const LICENSE_FILTERS = [
  { key: "account", label: "Account" },
  { key: "status", label: "License Status" },
];

const { mobileFilterOptions } = useResourceFilters({
  path: "/api/licenses",
  fields: LICENSE_FILTERS,
  filters, setFilters,          // from useServerResource
});
```

Pass `mobileFilterOptions` to `MobileTableWrapper`'s `filterOptions` and the
same fields appear in the phone's bottom sheet.

### Do not render the panel in the page

This is the part worth being firm about. A page-rendered filter panel is
`position: absolute` inside a container that is `overflow: hidden` with
`min-h-0` — so it opens below the content and is clipped away. It is still in
the DOM, still 620px wide, and completely invisible. What that looks like from
the outside is a filter button that does nothing.

Publishing to the shell puts the panel outside every page's clipping context,
which is why `useResourceFilters` does it for you rather than offering the
choice. In the reference app this was live on seven screens at once.

```jsx
// in the shell, once
<PageFilterProvider>{children}</PageFilterProvider>

// in the shell's header
const pageFilters = useHeaderFilters();
```

A page that publishes nothing leaves the filter button hidden, which is correct:
a control that opens an empty panel is worse than no control.

### Where the options come from

By default, the server — `GET /api/licenses/distinct?field=status`, one request
per column, once per screen. Under server-side paging that is the only correct
source: with fifty rows in hand a dropdown would offer the handful of values
that happened to land on page one, and a filter that cannot name the thing you
are looking for reads as "that value does not exist".

A screen still holding all its rows client-side wants the opposite, and says so:

```jsx
useResourceFilters({ …, rows: reports });   // options from these rows
```

Get this backwards on a client-side screen and the dropdown offers values the
loaded rows do not contain — picking one empties the table.

### Applying

The panel behaves like a form: set several fields, press Search once. Editing a
dropdown does not refetch on its own, which at fifty thousand rows is the
difference between one query and one per keystroke. `usePageFilters` and
`useDistinctValues` remain exported if you need to assemble this yourself —
`config` must be memoised, or it republishes on every render and takes the app
down with it.

---

## 7. Tables that read well

Column widths come from a shared scale rather than free-typed numbers, which is
what keeps a header row from looking ragged and keeps two screens looking like
the same product:

```js
{ key: "account", header: "ACCOUNT", size: "md" }   // xs sm md lg xl
```

`minWidth` still works and is snapped up to the nearest step.

For state that belongs to the record rather than to one cell, tint the row.
On a fifteen-column table the status cell is often scrolled out of sight, so the
thing you most need to spot would be the thing off the edge of the screen:

```jsx
<MobileTableWrapper getRowTone={(row) => getLicenseRowTone(row)} … />
```

Tones are named by meaning (`warn`, `danger`, `success`, `info`) and resolve
through theme tokens, so they stay legible on the dark themes too.

---

## 8. The same screen on a phone

`MobileTableWrapper` swaps the table for a card list below 768px. The cards are
not a narrower table — the gestures are different, and the props that drive them
are ignored on desktop:

```jsx
<MobileTableWrapper
  … columns, data, rowKey as above …
  selectable
  selectionMode="multiple"        // or "single"
  selectedKeys={selectedKeys}
  onSelectedKeysChange={setSelectedKeys}
  actionMenuItems={rowActions}    // the ⋮ on each card
  bulkActions={bulkActions}       // the bar that appears once rows are picked
  sortOptions={sortOptions}       // there are no column headers to click
  onSortSelect={(key) => setSort(key, "asc")}
  hideMobileSearch                // if your shell's header already has one
/>
```

**Give it `actionMenuItems`.** A desktop toolbar acting on "the selected row" has
nowhere to live on a 375px screen — fourteen actions across that strip is how
icons end up on top of each other. Without a row menu those actions are simply
unreachable on a phone. Each item is `{ label, icon, onClick(row), danger }`,
and it opens in a sheet rather than a popover so the list is never clipped.

**Selection.** Multi-select arms with a long press and then takes plain taps, the
way every mobile list does; single-select takes a tap straight away. A press is
abandoned as soon as the finger travels, or the list would select rows while you
tried to scroll it.

### Two things your app owns

`env(safe-area-inset-*)` reads as `0` unless the page opts in, and then the
floating button and the bulk bar sit under the home indicator:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

And a header row that holds a toolbar on one side and paging on the other has to
stack, not shrink. Left to share a line, a `flex-1` toolbar gives up its width
and renders its controls on top of one another:

```jsx
<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
  <div className="w-full md:flex-1 min-w-0">{toolbar}</div>
  <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 min-w-0">{paging}</div>
</div>
```

---

## 9. Licence expiry

The stored status cannot answer the question people actually open the table
with — *which of these do I deal with this week?* — because "Active" covers both
a licence with two years left and one that lapses on Friday.

```jsx
import { LicenseStatusCell, getLicenseRowTone, getLicenseLifecycle } from "my Design System";

{ key: "status", header: "STATUS", size: "lg", align: "center",
  render: (r) => <LicenseStatusCell row={r} warnWithinDays={30} /> }
```

Deactivation outranks the date on purpose: a licence someone switched off should
not send anyone chasing a renewal nobody needs.

`getLicenseLifecycle(row)` returns the same decision as data (`state`, `days`,
`date`, `label`, `tone`) if you want to render it differently.

---

## 10. Dashboard panels

```jsx
<ResourceTable title="Recent invoices" path="/api/reports" columns={cols}
               limit={6} onOpenFull={() => navigate("/report")} />

<ChartWithData title="Licences by account" chart={<BarChart … />}
               columns={cols} rows={rows} />
```

`ChartWithData` prints the figures under the chart deliberately. A chart shows
shape and a table shows values — reading "roughly a third" off an arc is no
substitute for "16,673" — and a chart is unreadable to a screen reader however
carefully it is labelled, whereas the table beside it is just a table.

---

## What your app should still own

Everything above is the library's. Yours is the part that is actually about your
product:

- **Which backend** (`config.js`)
- **Which resources exist** (`resources.js`)
- **Your shell** — nav items, routes, page titles
- **Your brand mark**
- **Your screens**

In the reference app that comes to under a thousand lines outside the pages
themselves.

---

## Before you ship

```bash
npm run build && npm run verify:package
```

`verify:package` checks that every public export is reachable from the built
bundle, that every theme defines every token, that no declared dependency has
been bundled in, and that a component actually renders from the built output.
It is wired into `prepublishOnly`.
