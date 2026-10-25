import { LicensePage } from "./LicensePage";

/**
 * The complete licence screen — table, toolbar, filters, pagination and every
 * lifecycle dialog, assembled.
 *
 * It runs in two modes. Given no `fetcher` it works from `initialData` (or its
 * own demo set) entirely in memory, which is the "drop it in and see it work"
 * path these stories use. Given a `fetcher` it switches to server-side paging,
 * sorting and filtering, and the callbacks (`onCreate`, `onUpdate`,
 * `onDelete`) are where you persist changes.
 *
 * `serverSide` overrides that inference if you need to force one or the other.
 */
const meta = {
  title: "Pages/LicensePage",
  component: LicensePage,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  argTypes: {
    fetcher: {
      control: false,
      description: "`({ page, pageSize, sortKey, sortDirection, search, filters }) => Promise<{ items, total }>`.",
    },
    serverSide: { control: "boolean", description: "Overrides the inference from `fetcher`." },
    initialData: { control: "object", description: "Rows for the in-memory mode. Defaults to the demo set." },
    onCreate: { action: "create" },
    onUpdate: { action: "update" },
    onDelete: { action: "delete" },
    onToast: { action: "toast" },
  },
  render: (args) => (
    <div className="h-[42rem] bg-canvas p-2">
      <LicensePage {...args} />
    </div>
  ),
};

export default meta;

/** In-memory, on the built-in demo licences. */
export const Playground = {};

/** A short dataset supplied by the host app. */
export const WithSuppliedData = {
  args: {
    initialData: [
      { id: 1, account: "Aaxis Nano", name: "Reflashing Issue", status: "Expired", type: "EF-1M-5M-3Y-PO-CPCB", term: "Yearly", key: "54f45452", issue: "17-Aug-2025", actDate: "17-Aug-2025", expiry: "17-Aug-2026", site: "Gmr Airport Hyderabad", lastPi: "PIC260316", lastInvoice: "-", amount: "₹2,121.00", payment: "-", isActive: false },
      { id: 2, account: "Prima Equipment", name: "Cement Industry Test", status: "Active", type: "EF-1Y-5M-1Y-PR-HSPCB", term: "Yearly", key: "bdf0ed8a", issue: "24-Feb-2024", actDate: "24-Feb-2024", expiry: "23-Feb-2027", site: "Pcc_Borivali", lastPi: "PIC270003", lastInvoice: "-", amount: "₹60,475.00", payment: "Cancel", isActive: true },
    ],
  },
};

/** An empty estate — the table's empty state rather than a blank panel. */
export const EmptyState = { args: { initialData: [] } };

/** Server-side mode against a stub, so paging and sorting round-trip. */
export const ServerSide = {
  args: {
    serverSide: true,
    fetcher: ({ page, pageSize }) => {
      const all = Array.from({ length: 37 }, (_, i) => ({
        id: i + 1,
        account: ["Aaxis Nano", "Prima Equipment", "Abc Industries Pvt Ltd"][i % 3],
        name: `Licence record ${i + 1}`,
        status: ["Active", "Expired", "Deactivated"][i % 3],
        type: "EF-1Y-5M-1Y-PR-XX",
        term: "Yearly",
        key: `key-${i + 1}`,
        issue: "17-Aug-2025",
        actDate: "17-Aug-2025",
        expiry: "17-Aug-2026",
        site: `Site ${i + 1}`,
        lastPi: "-",
        lastInvoice: "-",
        amount: "₹0.00",
        payment: "-",
        isActive: i % 3 === 0,
      }));
      const start = (page - 1) * pageSize;
      return new Promise((r) =>
        setTimeout(() => r({ items: all.slice(start, start + pageSize), total: all.length }), 300)
      );
    },
  },
};

/** On a phone the table becomes the card list, with its own toolbar. */
export const Mobile = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
