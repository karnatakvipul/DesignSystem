import * as React from "react";
import { Badge } from "./Badge";
import { DataTable } from "./DataTable";

const SAMPLE_ROWS = [
  { id: 1, account: "Aaxis Nano", name: "Reflashing Issue", status: "Active", type: "EF-1M-5M-3Y-PO-CPCB", expiry: "17-Aug-2026" },
  { id: 2, account: "Imtb Engineers Pvt Ltd", name: "Gmr Airport Hyderabad", status: "Expired", type: "EF-1Y-5M-1Y-PR-XX", expiry: "11-Mar-2024" },
  { id: 3, account: "Abc Industries Pvt Ltd", name: "Manufacturing - Noida Plant 1", status: "Active", type: "EF-1Y-5M-1Y-PR-XX", expiry: "22-Aug-2026" },
  { id: 4, account: "Prima Equipment", name: "Cement Industry Test", status: "Active", type: "EF-1Y-5M-1Y-PR-HSPCB", expiry: "23-Feb-2026" },
  { id: 5, account: "Deewan Enterprises", name: "K K Duplex Paper Mill", status: "Active", type: "EF-1Y-XX-3M-PR-PTZCAM", expiry: "23-Feb-2026" },
];

const COLUMNS = [
  { key: "account", header: "ACCOUNT", sortable: true, size: "md" },
  { key: "name", header: "NAME", sortable: true, size: "xl" },
  {
    key: "status",
    header: "STATUS",
    sortable: true,
    align: "center",
    render: (r) => <Badge tone={r.status === "Active" ? "online" : "offline"}>{r.status}</Badge>,
  },
  { key: "type", header: "TYPE", size: "md" },
  { key: "expiry", header: "EXPIRY", sortable: true, align: "right" },
];

const meta = {
  title: "Components/DataTable",
  component: DataTable,
  tags: ["autodocs"],
  args: {
    columns: COLUMNS,
    data: SAMPLE_ROWS,
    rowKey: (r) => r.id,
  },
  parameters: { layout: "padded" },
};

export default meta;

export const Playground = {
  render: (args) => (
    <div style={{ height: 320 }}>
      <DataTable {...args} autoHeight={false} className="h-full" />
    </div>
  ),
};

export const Selectable = {
  render: (args) => {
    const [selectedKeys, setSelectedKeys] = React.useState([1]);
    return (
      <div style={{ height: 320 }}>
        <DataTable
          {...args}
          autoHeight={false}
          className="h-full"
          selectable
          selectedKeys={selectedKeys}
          onSelectedKeysChange={setSelectedKeys}
        />
      </div>
    );
  },
};

/** Controlled sort — `onSortChange` switches `DataTable` out of its own internal (uncontrolled) sort state, which is what `serverSide` sorting needs. */
export const Sortable = {
  render: (args) => {
    const [sortKey, setSortKey] = React.useState(null);
    const [sortDirection, setSortDirection] = React.useState("asc");
    return (
      <div style={{ height: 320 }}>
        <DataTable
          {...args}
          autoHeight={false}
          className="h-full"
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={(key, direction) => {
            setSortKey(key);
            setSortDirection(direction);
          }}
        />
      </div>
    );
  },
};

export const Striped = {
  args: { striped: true },
  render: (args) => (
    <div style={{ height: 320 }}>
      <DataTable {...args} autoHeight={false} className="h-full" />
    </div>
  ),
};

/** Both the header and body cells shrink, with the header staying one padding step taller than the rows beneath it. */
export const Dense = {
  args: { dense: true },
  render: (args) => (
    <div style={{ height: 260 }}>
      <DataTable {...args} autoHeight={false} className="h-full" />
    </div>
  ),
};

/** Forces every header (and its column's body cells) to the same alignment — a column with its own `align` still wins. */
export const CenteredHeaders = {
  args: { headerAlign: "center" },
  render: (args) => (
    <div style={{ height: 320 }}>
      <DataTable {...args} autoHeight={false} className="h-full" />
    </div>
  ),
};

/** Tints a whole row by meaning rather than one cell, so the state reads at a glance while scrolling past other columns. */
export const RowTones = {
  args: {
    getRowTone: (row) =>
      row.status === "Expired" ? "danger" : row.expiry === "23-Feb-2026" ? "warn" : null,
  },
  render: (args) => (
    <div style={{ height: 320 }}>
      <DataTable {...args} autoHeight={false} className="h-full" />
    </div>
  ),
};

export const Loading = {
  args: { loading: true, data: [] },
  render: (args) => (
    <div style={{ height: 220 }}>
      <DataTable {...args} autoHeight={false} className="h-full" />
    </div>
  ),
};

export const ErrorState = {
  args: { data: [], error: "Could not reach the server.", onRetry: () => {} },
  render: (args) => (
    <div style={{ height: 220 }}>
      <DataTable {...args} autoHeight={false} className="h-full" />
    </div>
  ),
};

export const Empty = {
  args: { data: [], emptyMessage: "No licenses match the current filters.", onClearFilters: () => {} },
  render: (args) => (
    <div style={{ height: 260 }}>
      <DataTable {...args} autoHeight={false} className="h-full" />
    </div>
  ),
};
