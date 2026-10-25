import { ReportTablePanel } from "./ReportTablePanel";
import { Badge } from "../../common/Badge";

const ALL = Array.from({ length: 43 }, (_, i) => ({
  id: i + 1,
  account: ["Prima Equipment", "Aaxis Nano", "Abc Industries Pvt Ltd"][i % 3],
  siteName: `Site ${i + 1}`,
  invoiceNo: `PIC27${String(i).padStart(4, "0")}`,
  amount: `₹${((i + 1) * 1250).toLocaleString("en-IN")}`,
  paymentStatus: ["Paid", "Pending", "Revise"][i % 3],
}));

const COLUMNS = [
  { key: "account", header: "ACCOUNT", sortable: true },
  { key: "siteName", header: "SITE NAME", sortable: true },
  { key: "invoiceNo", header: "INVOICE NO", sortable: true },
  { key: "amount", header: "AMOUNT", align: "right" },
  {
    key: "paymentStatus",
    header: "PAYMENT",
    render: (r) => (
      <Badge tone={r.paymentStatus === "Paid" ? "online" : r.paymentStatus === "Pending" ? "warn" : "neutral"}>
        {r.paymentStatus}
      </Badge>
    ),
  },
];

/**
 * A complete report screen in one component: title, filters, date range,
 * table, pagination and empty state.
 *
 * You supply `fetchPage` and the columns; it owns the rest. `fetchPage`
 * receives `{ page, pageSize, filters, dateRange }` and resolves to
 * `{ items, total }`.
 *
 * `filterFields` selects which filter controls appear, so one component covers
 * every report in the app without each one needing its own panel.
 */
const meta = {
  title: "Feature/Report/ReportTablePanel",
  component: ReportTablePanel,
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text" },
    columns: { control: "object" },
    fetchPage: {
      control: false,
      description: "`({ page, pageSize, filters, dateRange }) => Promise<{ items, total }>`.",
    },
    filterFields: { control: "object", description: "Which filter controls to render." },
    defaultDateRange: { control: "object", description: "Initial `{ from, to }`." },
    pageSize: { control: { type: "number", min: 1 } },
    emptyMessage: { control: "text" },
    note: { control: "text", description: "Explanatory line under the title." },
    dense: { control: "boolean" },
    headerAlign: { control: "inline-radio", options: ["left", "center", "right"] },
  },
  args: {
    title: "Invoice Report",
    columns: COLUMNS,
    pageSize: 10,
    dense: true,
    headerAlign: "left",
  },
  render: (args) => (
    <div className="h-[36rem] w-full">
      <ReportTablePanel {...args} />
    </div>
  ),
};

export default meta;

function makeFetcher({ delay = 350, fail = false, empty = false } = {}) {
  return ({ page, pageSize }) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (fail) return reject(new Error("The report service is unavailable"));
        if (empty) return resolve({ items: [], total: 0 });
        const start = (page - 1) * pageSize;
        resolve({ items: ALL.slice(start, start + pageSize), total: ALL.length });
      }, delay);
    });
}

export const Playground = {
  args: { fetchPage: makeFetcher() },
};

/** With filter fields declared, the panel renders the matching controls. */
export const WithFilters = {
  args: {
    fetchPage: makeFetcher(),
    filterFields: ["account", "paymentStatus"],
    note: "Figures are exclusive of tax.",
  },
};

/** Opening on a preset date range. */
export const WithDefaultDateRange = {
  args: {
    fetchPage: makeFetcher(),
    defaultDateRange: { from: "2026-04-01", to: "2026-06-30" },
  },
};

export const Loading = {
  args: { fetchPage: makeFetcher({ delay: 100000 }) },
};

export const ErrorState = {
  args: { fetchPage: makeFetcher({ fail: true }) },
};

export const Empty = {
  args: { fetchPage: makeFetcher({ empty: true }), emptyMessage: "No invoices in this period." },
};
