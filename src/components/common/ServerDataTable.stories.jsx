import * as React from "react";
import { RefreshCw } from "lucide-react";
import { ServerDataTable } from "./ServerDataTable";
import { Badge } from "./Badge";
import { IconButton } from "./IconButton";

const ALL_ROWS = Array.from({ length: 47 }, (_, i) => ({
  id: i + 1,
  account: ["Aaxis Nano", "Abc Industries Pvt Ltd", "Prima Equipment", "Deewan Enterprises"][i % 4],
  name: `Licence record ${i + 1}`,
  status: ["Active", "Expired", "Deactivated"][i % 3],
  amount: `₹${((i + 1) * 1250).toLocaleString("en-IN")}`,
}));

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
  { key: "amount", header: "AMOUNT", sortable: true, align: "right" },
];

/**
 * A `DataTable` that owns its own paging, sorting, search and filter state and
 * asks a `fetcher` for each page.
 *
 * You supply one function; it supplies the toolbar, the pagination and the
 * loading and error states. Use it when a screen needs a server-backed table
 * and nothing more. When the page also needs those values — to drive a filter
 * panel, a CSV export, or a header — reach for `useServerResource` instead and
 * render `DataTable` yourself, which is what the app screens do.
 *
 * The `fetcher` receives `{ page, pageSize, sortKey, sortDirection, search,
 * filters }` and resolves to `{ items, total }`.
 */
const meta = {
  title: "Components/ServerDataTable",
  component: ServerDataTable,
  tags: ["autodocs"],
  argTypes: {
    fetcher: {
      control: false,
      description: "`({ page, pageSize, sortKey, sortDirection, search, filters }) => Promise<{ items, total }>`.",
    },
    columns: { control: "object" },
    initialPage: { control: { type: "number", min: 1 } },
    initialPageSize: { control: { type: "number", min: 1 } },
    initialSortKey: { control: "text" },
    initialSortDirection: { control: "inline-radio", options: ["asc", "desc", null] },
    initialSearch: { control: "text" },
    initialFilters: { control: "object" },
    showSearch: { control: "boolean" },
    searchPlaceholder: { control: "text" },
    showPagination: { control: "boolean" },
    onRowClick: { action: "row clicked" },
    selectable: { control: "boolean" },
    selectedKeys: { control: "object" },
    onSelectedKeysChange: { action: "selection changed" },
    rowKey: { control: false },
    toolbarActions: { control: false, description: "Nodes rendered in the toolbar beside search." },
    className: { control: "text" },
  },
  args: {
    columns: COLUMNS,
    initialPageSize: 10,
    showSearch: true,
    showPagination: true,
    searchPlaceholder: "Search server records...",
    rowKey: (r) => r.id,
  },
};

export default meta;

/** Stands in for an API: filters, sorts, pages, and answers after a short delay. */
function makeFetcher({ delay = 400, fail = false, empty = false } = {}) {
  return ({ page, pageSize, sortKey, sortDirection, search }) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (fail) return reject(new Error("The licence service is unavailable"));
        if (empty) return resolve({ items: [], total: 0 });

        let rows = ALL_ROWS;
        if (search) {
          const q = search.toLowerCase();
          rows = rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
        }
        if (sortKey) {
          rows = [...rows].sort((a, b) => {
            const cmp = String(a[sortKey]).localeCompare(String(b[sortKey]), undefined, { numeric: true });
            return sortDirection === "desc" ? -cmp : cmp;
          });
        }
        const start = (page - 1) * pageSize;
        resolve({ items: rows.slice(start, start + pageSize), total: rows.length });
      }, delay);
    });
}

/** Search, sort a column, and page — every one of those refetches. */
export const Playground = {
  args: { fetcher: makeFetcher() },
  render: (args) => (
    <div className="w-[52rem]">
      <ServerDataTable {...args} />
    </div>
  ),
};

/** Opening on page 2, sorted by amount descending. */
export const InitialState = {
  args: {
    fetcher: makeFetcher(),
    initialPage: 2,
    initialSortKey: "amount",
    initialSortDirection: "desc",
  },
  render: (args) => (
    <div className="w-[52rem]">
      <ServerDataTable {...args} />
    </div>
  ),
};

/** Opening with a search already applied. */
export const WithInitialSearch = {
  args: { fetcher: makeFetcher(), initialSearch: "Prima" },
  render: (args) => (
    <div className="w-[52rem]">
      <ServerDataTable {...args} />
    </div>
  ),
};

/** A deliberately slow endpoint, to show the loading state. */
export const Loading = {
  args: { fetcher: makeFetcher({ delay: 100000 }) },
  render: (args) => (
    <div className="w-[52rem]">
      <ServerDataTable {...args} />
    </div>
  ),
};

/** A rejected fetch surfaces in the table with a retry. */
export const ErrorState = {
  args: { fetcher: makeFetcher({ fail: true }) },
  render: (args) => (
    <div className="w-[52rem]">
      <ServerDataTable {...args} />
    </div>
  ),
};

export const Empty = {
  args: { fetcher: makeFetcher({ empty: true }) },
  render: (args) => (
    <div className="w-[52rem]">
      <ServerDataTable {...args} />
    </div>
  ),
};

/** Selection plus a page-level toolbar action. */
export const SelectableWithToolbarActions = {
  render: function Render(args) {
    const [keys, setKeys] = React.useState([]);
    return (
      <div className="w-[52rem]">
        <ServerDataTable
          {...args}
          fetcher={makeFetcher()}
          selectable
          selectedKeys={keys}
          onSelectedKeysChange={setKeys}
          toolbarActions={<IconButton icon={<RefreshCw size={16} />} label="Reload" />}
        />
        <p className="mt-3 text-body-sm text-ink-muted">Selected: {keys.length}</p>
      </div>
    );
  },
};

/** Search and pagination can each be switched off for an embedded table. */
export const BareTable = {
  args: { fetcher: makeFetcher(), showSearch: false, showPagination: false, initialPageSize: 5 },
  render: (args) => (
    <div className="w-[52rem]">
      <ServerDataTable {...args} />
    </div>
  ),
};
