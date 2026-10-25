import * as React from "react";
import { useResourceFilters } from "./useResourceFilters";
import { PageFilterProvider } from "./PageFilterContext";
import { FilterPanel } from "../components/common/FilterPanel";
import { BottomSheet } from "../components/common/BottomSheet";
import { Button } from "../components/common/Button";

const ROWS = [
  { id: 1, product: "EnviroFRONT", account: "Aaxis Nano", site: "Gmr Airport Hyderabad", status: "Expired", term: "Yearly" },
  { id: 2, product: "OCEMS", account: "Prima Equipment", site: "Pcc_Borivali", status: "Active", term: "Yearly" },
  { id: 3, product: "SolarFRONT", account: "Abc Industries Pvt Ltd", site: "Noida Plant 1", status: "Active", term: "Monthly" },
  { id: 4, product: "EnviroFRONT", account: "Deewan Enterprises", site: "K K Duplex Paper Mill", status: "Deactivated", term: "Custom" },
];

const FIELDS = [
  { key: "product", label: "Product", type: "multiSelect" },
  { key: "account", label: "Account" },
  { key: "site", label: "Site" },
  { key: "status", label: "License Status" },
  { key: "term", label: "License Term" },
];

/**
 * Everything a screen needs to filter itself, from a list of field names.
 *
 * A hook rather than a component, because a filter panel has to be rendered in
 * two places at once and neither belongs to the page. It hands back:
 *
 * - **`fields`** — the rendered controls, for a desktop `FilterPanel`
 * - **`mobileFilterOptions`** — the same controls plus a pinned Search/Clear
 *   footer, for `MobileTableToolbar`'s bottom sheet
 * - **`activeCount`**, **`apply`**, **`clear`**
 *
 * It also publishes into `PageFilterProvider`, so the app shell can render the
 * panel on its header search box. That matters: rendered by the page instead,
 * the panel is absolutely positioned inside a container that is
 * `overflow: hidden` with `min-h-0`, so it opens below the fold and is clipped
 * away — which looks exactly like a filter button that does nothing.
 *
 * **`rows` versus the server.** Pass `rows` for a screen holding all its data
 * client-side: options come from those rows, so every choice matches something
 * on screen. Omit it once the screen pages from a server and options are
 * fetched instead — deriving them from one page could only ever offer the
 * values that happened to land on it.
 *
 * The panel holds a draft and applies on Search, so setting five fields is one
 * query rather than five.
 */
const meta = {
  title: "Hooks/useResourceFilters",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Import from `my Design System`. Pair with `useServerResource` for a fully filtered table.",
      },
    },
  },
};

export default meta;

/** The desktop half: `fields` rendered inside a `FilterPanel`. */
export const DesktopFields = {
  render: function Render() {
    const [filters, setFilters] = React.useState({});
    const [applied, setApplied] = React.useState(null);

    function Inner() {
      const { fields, activeCount, apply, clear } = useResourceFilters({
        path: "/api/licenses",
        fields: FIELDS,
        filters,
        setFilters,
        rows: ROWS,
      });

      return (
        <div className="relative h-[28rem] w-[44rem]">
          <FilterPanel
            open
            showHeader
            layout="rows"
            actionAlign="end"
            activeCount={activeCount}
            searchLabel="Search"
            clearLabel="Clear filters"
            onSearch={() => {
              apply();
              setApplied(filters);
            }}
            onClear={() => {
              clear();
              setApplied(null);
            }}
            position="absolute top-0 left-0 z-[100] shadow-floating"
          >
            {fields}
          </FilterPanel>
        </div>
      );
    }

    return (
      <PageFilterProvider>
        <Inner />
        <p className="mt-3 font-mono text-body-sm text-ink-muted">
          Applied: {applied ? JSON.stringify(applied) : "(none)"}
        </p>
      </PageFilterProvider>
    );
  },
};

/**
 * The mobile half: `mobileFilterOptions` in a `BottomSheet`. Note the
 * Search/Clear bar pinned to the foot — with eight fields it would otherwise
 * scroll away exactly when you had finished choosing.
 */
export const MobileSheet = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: function Render() {
    const [filters, setFilters] = React.useState({});
    const [open, setOpen] = React.useState(false);

    function Inner() {
      const { mobileFilterOptions, activeCount } = useResourceFilters({
        path: "/api/licenses",
        fields: FIELDS,
        filters,
        setFilters,
        rows: ROWS,
      });

      return (
        <div className="md:hidden">
          <Button onClick={() => setOpen(true)}>
            Filters{activeCount > 0 ? ` (${activeCount})` : ""}
          </Button>
          <p className="mt-3 font-mono text-body-sm text-ink-muted">
            Applied: {Object.keys(filters).length ? JSON.stringify(filters) : "(none)"}
          </p>
          <BottomSheet open={open} onClose={() => setOpen(false)} title="Filter Records">
            {mobileFilterOptions}
          </BottomSheet>
        </div>
      );
    }

    return (
      <PageFilterProvider>
        <Inner />
      </PageFilterProvider>
    );
  },
};

/** `multiSelect` and plain dropdown fields side by side, with `activeCount` reported. */
export const FieldTypes = {
  render: function Render() {
    const [filters, setFilters] = React.useState({ product: ["EnviroFRONT"], status: "Active" });

    function Inner() {
      const { fields, activeCount } = useResourceFilters({
        path: "/api/licenses",
        fields: [
          { key: "product", label: "Product (multiSelect)", type: "multiSelect" },
          { key: "status", label: "Status (dropdown)" },
          { key: "expiry", label: "Renewal (dateRange)", type: "dateRange" },
        ],
        filters,
        setFilters,
        rows: ROWS,
      });

      return (
        <div className="w-[40rem] rounded-surface border border-card-border p-4">
          <p className="mb-3 text-body-sm text-ink-muted">
            Active filters: <span className="font-mono">{activeCount}</span>
          </p>
          <div className="flex flex-col gap-3">{fields}</div>
          <pre className="mt-4 rounded-control bg-chrome-deep/40 p-3 font-mono text-body-sm text-ink-secondary">
            {JSON.stringify(filters, null, 2)}
          </pre>
        </div>
      );
    }

    return (
      <PageFilterProvider>
        <Inner />
      </PageFilterProvider>
    );
  },
};
