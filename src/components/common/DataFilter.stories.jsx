import * as React from "react";
import { DataFilter } from "./DataFilter";
import { Button } from "./Button";

const ROWS = [
  { id: 1, account: "Aaxis Nano", status: "Expired", term: "Yearly", product: "EnviroFRONT", licenseKey: "54f45452" },
  { id: 2, account: "Imtb Engineers Pvt Ltd", status: "Expired", term: "Yearly", product: "EnviroFRONT", licenseKey: "6209020c" },
  { id: 3, account: "Abc Industries Pvt Ltd", status: "Active", term: "7 day(s)", product: "EnviroFRONT", licenseKey: "36ff8e57" },
  { id: 4, account: "Prima Equipment", status: "Expired", term: "Yearly", product: "OCEMS", licenseKey: "bdf0ed8a" },
  { id: 5, account: "Deewan Enterprises", status: "Deactivated", term: "Monthly", product: "SolarFRONT", licenseKey: "d2c959f2" },
];

/**
 * A `FilterPanel` that builds itself from the rows you hand it.
 *
 * Given `rows` and no `fields`, it works out which columns are worth filtering
 * on and derives each dropdown's options from the distinct values present. It
 * skips identifiers and free-text blobs (`id`, `key`, `description`, `notes`
 * and friends) and drops any field with more than 40 distinct values, since a
 * dropdown of near-unique values is not a filter.
 *
 * That makes it the quickest way to put a filter on a screen still holding all
 * its data client-side. Once a screen pages from the server, prefer
 * `useResourceFilters` — deriving options from one page's rows can only ever
 * offer the values that happened to land on it.
 */
const meta = {
  title: "Components/Filters/DataFilter",
  component: DataFilter,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "closed" },
    rows: { control: "object", description: "The dataset. Options are derived from these values." },
    fields: {
      control: "object",
      description:
        "`{ key, label?, options?, formatLabel? }[]`. Omit to auto-derive from `rows`.",
    },
    values: { control: "object", description: "Current selection, keyed by field." },
    onChange: { action: "changed", description: "Receives the next values object." },
    title: { control: "text" },
    onSearch: { action: "search" },
    onClear: { action: "clear" },
    className: { control: "text" },
  },
  args: { open: true, rows: ROWS, title: "Filter Records" },
};

export default meta;

/** No `fields` given — every option below was derived from the rows. */
export const Playground = {
  render: function Render(args) {
    const [values, setValues] = React.useState({});
    return (
      <div className="relative h-[26rem] w-[40rem]">
        <DataFilter {...args} values={values} onChange={setValues} />
      </div>
    );
  },
};

/** `fields` pins the list and its labels, while options still come from the rows. */
export const ExplicitFields = {
  render: function Render() {
    const [values, setValues] = React.useState({});
    return (
      <div className="relative h-80 w-[40rem]">
        <DataFilter
          open
          rows={ROWS}
          values={values}
          onChange={setValues}
          fields={[
            { key: "account", label: "Account" },
            { key: "status", label: "License Status" },
          ]}
        />
      </div>
    );
  },
};

/** `formatLabel` rewrites how a value is displayed without changing what is stored. */
export const CustomLabels = {
  render: function Render() {
    const [values, setValues] = React.useState({});
    return (
      <div className="relative h-80 w-[40rem]">
        <DataFilter
          open
          rows={ROWS}
          values={values}
          onChange={setValues}
          fields={[
            {
              key: "status",
              label: "License Status",
              formatLabel: (v) => ({ Active: "✅ Active", Expired: "⛔ Expired", Deactivated: "⏸ Deactivated" }[v] ?? v),
            },
          ]}
        />
      </div>
    );
  },
};

/** Wired to a button, with the applied selection shown below. */
export const Interactive = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    const [values, setValues] = React.useState({});
    const [applied, setApplied] = React.useState(null);
    return (
      <div className="relative h-[28rem] w-[40rem]">
        <Button onClick={() => setOpen((v) => !v)}>{open ? "Hide" : "Show"} filters</Button>
        <p className="mt-3 font-mono text-body-sm text-ink-muted">
          Applied: {applied ? JSON.stringify(applied) : "(none)"}
        </p>
        <div className="relative">
          <DataFilter
            open={open}
            rows={ROWS}
            values={values}
            onChange={setValues}
            onClose={() => setOpen(false)}
            onSearch={() => {
              setApplied(values);
              setOpen(false);
            }}
            onClear={() => {
              setValues({});
              setApplied(null);
            }}
          />
        </div>
      </div>
    );
  },
};

/** Closed, the component renders nothing at all. */
export const Closed = {
  args: { open: false },
  render: (args) => (
    <div className="w-[40rem]">
      <p className="text-body-sm text-ink-muted">(nothing renders while `open` is false)</p>
      <DataFilter {...args} />
    </div>
  ),
};
