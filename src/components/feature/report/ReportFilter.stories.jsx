import * as React from "react";
import { ReportFilter } from "./ReportFilter";
import { Button } from "../../common/Button";

const ROWS = [
  { product: "EnviroFRONT", account: "Prima Equipment", site: "Pcbl Limited_Palej", invoice: "PIC270003", payment: "Revise" },
  { product: "OCEMS", account: "Prima Equipment", site: "Navpad Pigments Pvt. Ltd", invoice: "PIC270004", payment: "Paid" },
  { product: "SolarFRONT", account: "Aaxis Nano", site: "Gmr Airport Hyderabad", invoice: "PIC260316", payment: "Pending" },
];

/**
 * The report table's filter panel — Product, Account, Site, Invoice and
 * Payment, each derived from the rows you hand it.
 *
 * **A field renders only if its column has values.** A dropdown with nothing
 * but "All" in it is a control that cannot do anything, so it is omitted
 * rather than shown empty.
 *
 * `keys` remaps which row property backs each field, which is what lets the
 * same panel sit over report datasets that name their columns differently —
 * `invoiceNo` instead of `invoice`, say — without a second component.
 */
const meta = {
  title: "Feature/Report/ReportFilter",
  component: ReportFilter,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean", description: "Renders nothing when false." },
    onClose: { action: "closed" },
    filters: { control: "object" },
    onChange: { action: "changed" },
    onSearch: { action: "search" },
    onClear: { action: "clear" },
    rows: { control: "object", description: "Dataset the options are derived from." },
    keys: {
      control: "object",
      description:
        "Remaps field → row property. Defaults to `{ product, account, site, invoice, payment }`.",
    },
  },
  args: { open: true, rows: ROWS, filters: {} },
  render: function Render(args) {
    const [filters, setFilters] = React.useState(args.filters);
    return (
      <div className="relative h-[26rem] w-[42rem]">
        <ReportFilter {...args} filters={filters} onChange={setFilters} />
      </div>
    );
  },
};

export default meta;

export const Playground = {};

/** These rows have no `site`, so that field is omitted rather than shown as an empty dropdown. */
export const FieldsWithoutValuesAreOmitted = {
  args: {
    rows: ROWS.map(({ site: _site, ...rest }) => rest),
  },
};

/** `keys` points the panel at differently named columns. */
export const RemappedKeys = {
  args: {
    rows: [
      { productName: "EnviroFRONT", accountName: "Prima Equipment", invoiceNo: "PIC270003", paymentStatus: "Paid" },
      { productName: "OCEMS", accountName: "Aaxis Nano", invoiceNo: "PIC260316", paymentStatus: "Pending" },
    ],
    keys: { product: "productName", account: "accountName", invoice: "invoiceNo", payment: "paymentStatus" },
  },
};

export const WithActiveFilters = {
  args: { filters: { account: "Prima Equipment", payment: "Paid" } },
};

export const Interactive = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    const [filters, setFilters] = React.useState({});
    const [applied, setApplied] = React.useState(null);
    return (
      <div className="relative h-[30rem] w-[42rem]">
        <Button onClick={() => setOpen((v) => !v)}>{open ? "Hide" : "Show"} filters</Button>
        <p className="mt-3 font-mono text-body-sm text-ink-muted">
          Applied: {applied ? JSON.stringify(applied) : "(none)"}
        </p>
        <ReportFilter
          open={open}
          rows={ROWS}
          filters={filters}
          onChange={setFilters}
          onClose={() => setOpen(false)}
          onSearch={() => {
            setApplied(filters);
            setOpen(false);
          }}
          onClear={() => {
            setFilters({});
            setApplied(null);
          }}
        />
      </div>
    );
  },
};

export const Closed = { args: { open: false } };
