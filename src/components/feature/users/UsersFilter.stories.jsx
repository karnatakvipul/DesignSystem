import * as React from "react";
import { UsersFilter } from "./UsersFilter";
import { Button } from "../../common/Button";

const ROWS = [
  { id: 1, name: "Super Admin", email: "admin@my Design System.com", role: "Super Administrator", status: "Active" },
  { id: 2, name: "License Manager", email: "manager@my Design System.com", role: "Manager", status: "Active" },
  { id: 3, name: "Support Engineer", email: "support@my Design System.com", role: "Engineer", status: "Deactivated" },
];

/**
 * The users table's filter panel — a free-text name field plus Role and Status
 * dropdowns derived from the rows you hand it.
 *
 * Name is free text rather than a dropdown because it is the field people
 * search by fragment; role and status are closed sets, so they get dropdowns
 * built from the values actually present.
 */
const meta = {
  title: "Feature/Users/UsersFilter",
  component: UsersFilter,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean", description: "Renders nothing when false." },
    onClose: { action: "closed" },
    filters: { control: "object", description: "Current draft, keyed by field." },
    onChange: { action: "changed" },
    onSearch: { action: "search" },
    onClear: { action: "clear" },
    rows: { control: "object", description: "Dataset the Role and Status options come from." },
  },
  args: { open: true, rows: ROWS, filters: {} },
  render: function Render(args) {
    const [filters, setFilters] = React.useState(args.filters);
    return (
      <div className="relative h-80 w-[40rem]">
        <UsersFilter {...args} filters={filters} onChange={setFilters} />
      </div>
    );
  },
};

export default meta;

export const Playground = {};

export const WithActiveFilters = {
  args: { filters: { name: "manager", status: "Active" } },
};

/** With no rows the dropdowns have nothing to offer. */
export const NoRows = { args: { rows: [] } };

export const Interactive = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    const [filters, setFilters] = React.useState({});
    const [applied, setApplied] = React.useState(null);
    return (
      <div className="relative h-96 w-[40rem]">
        <Button onClick={() => setOpen((v) => !v)}>{open ? "Hide" : "Show"} filters</Button>
        <p className="mt-3 font-mono text-body-sm text-ink-muted">
          Applied: {applied ? JSON.stringify(applied) : "(none)"}
        </p>
        <UsersFilter
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
