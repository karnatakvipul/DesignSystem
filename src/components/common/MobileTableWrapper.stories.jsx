import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { MobileTableWrapper, MobileViewControls } from "./MobileTableWrapper";
import { Badge } from "./Badge";
import { Pagination } from "./Pagination";

const COLUMNS = [
  { key: "account", header: "ACCOUNT", sortable: true },
  { key: "name", header: "NAME", sortable: true },
  {
    key: "status",
    header: "STATUS",
    sortable: true,
    render: (r) => (
      <Badge tone={r.status === "Active" ? "online" : r.status === "Deactivated" ? "neutral" : "offline"}>
        {r.status}
      </Badge>
    ),
  },
  { key: "type", header: "TYPE", sortable: true },
  { key: "expiry", header: "EXPIRY", sortable: true },
  { key: "site", header: "SITE" },
];

const ROWS = [
  { id: 1, account: "Aaxis Nano", name: "Reflashing Issue", status: "Expired", type: "EF-1M-5M-3Y-PO-CPCB", expiry: "17-Aug-2026", site: "Gmr Airport Hyderabad" },
  { id: 2, account: "Abc Industries Pvt Ltd", name: "Manufacturing - Noida Plant 1", status: "Active", type: "EF-1Y-5M-1Y-PR-XX", expiry: "22-Aug-2026", site: "Noida Plant 1" },
  { id: 3, account: "Prima Equipment", name: "Cement Industry Test", status: "Expired", type: "EF-1Y-5M-1Y-PR-HSPCB", expiry: "23-Feb-2025", site: "Pcc_Borivali" },
  { id: 4, account: "Deewan Enterprises", name: "K K Duplex & Paper Mills", status: "Deactivated", type: "EF-1Y-XX-3M-PR-PTZCAM", expiry: "23-Feb-2025", site: "K K Duplex Paper Mill" },
];

/**
 * One component, two renderings: a `DataTable` above `md`, and below it either
 * a `MobileCardList` or the same table in a horizontal scroller, depending on
 * `viewMode`.
 *
 * Give it the columns and data once and the responsive behaviour is handled —
 * which is what keeps a screen's phone and desktop views from drifting apart.
 *
 * `serverSide` matters when the rows are one page from a server: without it
 * the wrapper re-sorts and re-filters the page it was given on top of what the
 * server already did, and the two can disagree.
 *
 * Resize the viewport across `md` (768px) to see it switch.
 */
const meta = {
  title: "Components/Mobile/MobileTableWrapper",
  component: MobileTableWrapper,
  tags: ["autodocs"],
  argTypes: {
    columns: { control: "object", description: "Column objects, or bare key strings the wrapper expands." },
    data: { control: "object" },
    rowKey: { control: false },
    autoColumns: { control: "boolean", description: "Derive columns from the first row's keys." },
    loading: { control: "boolean" },
    error: { control: "text" },
    onRetry: { action: "retry" },
    emptyMessage: { control: "text" },
    visibleColumns: { control: "object" },
    sortKey: { control: "text" },
    sortDirection: { control: "inline-radio", options: ["asc", "desc", null] },
    onSortChange: { action: "sort changed" },
    serverSide: { control: "boolean", description: "Stops the wrapper re-sorting a server-paged page." },
    selectable: { control: "boolean" },
    selectionMode: { control: "inline-radio", options: ["multiple", "single"], description: "Card list only." },
    selectedKeys: { control: "object" },
    onSelectedKeysChange: { action: "selection changed" },
    onRowClick: { action: "row clicked" },
    dense: { control: "boolean" },
    headerAlign: { control: "inline-radio", options: ["left", "center", "right"] },
    getRowTone: { control: false, description: "`(row, index) => tone` to tint a row needing attention." },
    primaryFields: { control: "object", description: "Card list — collapsed card fields." },
    secondaryFields: { control: "object", description: "Card list — fields behind the chevron." },
    actionMenuItems: { control: "object", description: "Card list — per-row ⋮ sheet." },
    bulkActions: { control: "object" },
    viewMode: { control: "inline-radio", options: ["card", "table"], description: "Controlled card/table toggle." },
    onViewModeChange: { action: "view mode changed" },
    defaultMobileView: { control: "inline-radio", options: ["card", "table"] },
    hideMobileToolbar: {
      control: "boolean",
      description: "Drop the built-in toolbar when the page renders `MobileTableToolbar` itself — the arrangement to prefer.",
    },
    hideMobileControls: { control: "boolean", description: "Hide just Sort and the view toggle." },
    hideMobileSearch: { control: "boolean" },
    filterOptions: { control: false },
    sortOptions: { control: "object" },
    onSortSelect: { action: "sort selected" },
    className: { control: "text" },
  },
  args: {
    columns: COLUMNS,
    data: ROWS,
    rowKey: (r) => r.id,
    primaryFields: ["account", "name", "status", "type"],
    secondaryFields: ["expiry", "site"],
    dense: true,
    headerAlign: "left",
  },
  render: (args) => (
    <div className="h-[32rem] overflow-hidden rounded-surface border border-card-border">
      <MobileTableWrapper {...args} />
    </div>
  ),
};

export default meta;

/** Resize across 768px — table above, cards below. */
export const Playground = {};

/** Below `md`, forced into the card rendering. */
export const MobileCards = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: { defaultMobileView: "card" },
};

/** Below `md`, the same table in a horizontal scroller — for comparing values across columns. */
export const MobileTableView = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: { defaultMobileView: "table" },
};

/** Its own toolbar carries search, filter, sort and the view toggle. */
export const WithBuiltInToolbar = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: {
    sortOptions: [
      { value: "account", label: "Account" },
      { value: "expiry", label: "Expiry Date" },
    ],
    onSortSelect: () => {},
  },
};

/** Selection, with the per-row action sheet behind each card's ⋮. */
export const Selectable = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: function Render(args) {
    const [keys, setKeys] = React.useState([]);
    return (
      <div className="h-[32rem] overflow-hidden rounded-surface border border-card-border">
        <MobileTableWrapper
          {...args}
          selectable
          selectedKeys={keys}
          onSelectedKeysChange={setKeys}
          actionMenuItems={[
            { label: "Edit", icon: <Pencil size={18} /> },
            { label: "Delete", icon: <Trash2 size={18} />, danger: true },
          ]}
        />
      </div>
    );
  },
};

export const Loading = { args: { data: [], loading: true } };
export const ErrorState = { args: { data: [], error: "Could not reach the licence service." } };
export const Empty = { args: { data: [], emptyMessage: "No licences match these filters." } };

/** Columns derived from the first row's keys, for a quick table over unknown data. */
export const AutoColumns = {
  args: { autoColumns: true, columns: [], primaryFields: [], secondaryFields: [] },
};

/**
 * `MobileViewControls` pulls Sort and the view toggle out of the wrapper's own
 * toolbar so a page can render them beside its pagination instead. Pair it
 * with `hideMobileControls` (or `hideMobileToolbar`) and the same
 * `viewMode`/`onViewModeChange`.
 */
export const ExternalViewControls = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: function Render(args) {
    const [viewMode, setViewMode] = React.useState("card");
    const [sort, setSort] = React.useState("account");
    return (
      <div className="flex h-[32rem] flex-col gap-2">
        <div className="flex items-center justify-between">
          <Pagination page={1} pageSize={10} total={4} onPageChange={() => {}} />
          <MobileViewControls
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            currentSort={sort}
            onSortSelect={setSort}
            sortOptions={[
              { value: "account", label: "Account" },
              { value: "expiry", label: "Expiry Date" },
            ]}
          />
        </div>
        <div className="flex-1 overflow-hidden rounded-surface border border-card-border">
          <MobileTableWrapper {...args} hideMobileToolbar viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>
      </div>
    );
  },
};
