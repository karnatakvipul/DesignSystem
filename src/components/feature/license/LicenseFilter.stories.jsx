import * as React from "react";
import { LicenseFilter } from "./LicenseFilter";
import { Button } from "../../common/Button";

const ROWS = [
  { id: 1, account: "Aaxis Nano", site: "Gmr Airport Hyderabad", type: "EF-1M-5M-3Y-PO-CPCB", status: "Expired", lastPi: "PIC260316" },
  { id: 2, account: "Imtb Engineers Pvt Ltd", site: "Gmr Airport Hyderabad", type: "EF-1Y-5M-1Y-PR-XX", status: "Expired", lastPi: "-" },
  { id: 3, account: "Abc Industries Pvt Ltd", site: "Noida Plant 1", type: "EF-1Y-5M-1Y-PR-XX", status: "Active", lastPi: "-" },
  { id: 4, account: "Prima Equipment", site: "Pcc_Borivali", type: "EF-1Y-5M-1Y-PR-HSPCB", status: "Expired", lastPi: "PIC270003" },
  { id: 5, account: "Deewan Enterprises", site: "K K Duplex Paper Mill", type: "EF-1Y-XX-3M-PR-PTZCAM", status: "Deactivated", lastPi: "-" },
];

/**
 * The licence table's filter panel, with its five fields — Account, Site,
 * Type, Status and Performa Invoice — derived from the rows you hand it.
 *
 * Because the options come from `rows`, this suits a screen still holding all
 * its licences client-side. Once the table pages from a server, prefer
 * `useResourceFilters`: options derived from one page can only ever offer the
 * values that happened to land on it, and a filter that cannot name the thing
 * you are looking for reads as "that value does not exist".
 *
 * Like `FilterPanel`, it holds a draft and applies on Search rather than
 * refetching per keystroke.
 */
const meta = {
  title: "Feature/License/LicenseFilter",
  component: LicenseFilter,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean", description: "Renders nothing when false." },
    onClose: { action: "closed" },
    filters: { control: "object", description: "Current draft, keyed by field." },
    onChange: { action: "changed", description: "Receives the next draft." },
    onSearch: { action: "search" },
    onClear: { action: "clear" },
    rows: { control: "object", description: "Dataset the dropdown options are derived from." },
  },
  args: { open: true, rows: ROWS, filters: {} },
  render: function Render(args) {
    const [filters, setFilters] = React.useState(args.filters);
    return (
      <div className="relative h-[26rem] w-[44rem]">
        <LicenseFilter {...args} filters={filters} onChange={setFilters} />
      </div>
    );
  },
};

export default meta;

/** Every dropdown below was built from the five rows. */
export const Playground = {};

/** Opened with two filters already applied — the count badge reflects them. */
export const WithActiveFilters = {
  args: { filters: { account: "Prima Equipment", status: "Expired" } },
};

/** With no rows the dropdowns offer only their "All" entries. */
export const NoRows = { args: { rows: [] } };

/** Wired to a button, with the applied selection shown below. */
export const Interactive = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    const [filters, setFilters] = React.useState({});
    const [applied, setApplied] = React.useState(null);
    return (
      <div className="relative h-[30rem] w-[44rem]">
        <Button onClick={() => setOpen((v) => !v)}>{open ? "Hide" : "Show"} filters</Button>
        <p className="mt-3 font-mono text-body-sm text-ink-muted">
          Applied: {applied ? JSON.stringify(applied) : "(none)"}
        </p>
        <LicenseFilter
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

/** Closed, it renders nothing at all. */
export const Closed = { args: { open: false } };
