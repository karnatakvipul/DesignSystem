import { ResourceTable } from "./ResourceTable";
import { Badge } from "../../common/Badge";

const ROWS = [
  { id: 1, account: "Aaxis Nano", name: "Reflashing Issue", status: "Expired", expiry: "17-Aug-2026" },
  { id: 2, account: "Abc Industries Pvt Ltd", name: "Manufacturing - Noida Plant 1", status: "Active", expiry: "22-Aug-2026" },
  { id: 3, account: "Prima Equipment", name: "Cement Industry Test", status: "Expired", expiry: "23-Feb-2025" },
  { id: 4, account: "Deewan Enterprises", name: "K K Duplex & Paper Mills", status: "Deactivated", expiry: "23-Feb-2025" },
];

const COLUMNS = [
  { key: "account", header: "ACCOUNT" },
  { key: "name", header: "NAME" },
  {
    key: "status",
    header: "STATUS",
    render: (r) => (
      <Badge tone={r.status === "Active" ? "online" : r.status === "Deactivated" ? "neutral" : "offline"}>
        {r.status}
      </Badge>
    ),
  },
  { key: "expiry", header: "EXPIRY" },
];

/**
 * A small "top N" table for a dashboard panel, fetching straight from an API
 * path.
 *
 * Unlike `ServerDataTable` it does not page — `limit` is the whole point: a
 * dashboard shows the first handful and hands off to the full screen via
 * `onOpenFull`, rather than turning a summary into another table to work
 * through.
 *
 * `client` accepts an API client, which is how these stories run without a
 * server: pass a stub with the same `get` shape.
 */
const meta = {
  title: "Feature/Dashboard/ResourceTable",
  component: ResourceTable,
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text" },
    path: { control: "text", description: "Resource path, e.g. `/api/licenses`." },
    columns: { control: "object" },
    limit: { control: { type: "number", min: 1 }, description: "How many rows to show. Defaults to 6." },
    sortKey: { control: "text" },
    sortDirection: { control: "inline-radio", options: ["asc", "desc"] },
    rowKey: { control: false },
    emptyMessage: { control: "text" },
    onOpenFull: { action: "open full", description: 'Adds the "view all" affordance.' },
    client: { control: false, description: "API client. Injected here so the stories need no server." },
  },
  args: {
    title: "Recently expiring",
    path: "/api/licenses",
    columns: COLUMNS,
    limit: 4,
  },
  render: (args) => (
    <div className="w-[40rem]">
      <ResourceTable {...args} />
    </div>
  ),
};

export default meta;

/** A stub client standing in for the API. */
function makeClient({ delay = 350, fail = false, empty = false } = {}) {
  return {
    get: () =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          if (fail) return reject(new Error("The licence service is unavailable"));
          if (empty) return resolve({ items: [], total: 0 });
          resolve({ items: ROWS, total: ROWS.length });
        }, delay);
      }),
  };
}

export const Playground = {
  args: { client: makeClient() },
};

/** With `onOpenFull` the panel offers a way through to the full screen. */
export const WithOpenFull = {
  args: { client: makeClient(), onOpenFull: () => {} },
};

export const Loading = {
  args: { client: makeClient({ delay: 100000 }) },
};

export const ErrorState = {
  args: { client: makeClient({ fail: true }) },
};

export const Empty = {
  args: { client: makeClient({ empty: true }), emptyMessage: "Nothing expiring soon." },
};

/** A tighter limit, for a narrower panel. */
export const SmallerLimit = {
  args: { client: makeClient(), limit: 2 },
};
