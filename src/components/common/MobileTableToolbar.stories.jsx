import * as React from "react";
import { Pencil, Trash2, Power } from "lucide-react";
import { MobileTableToolbar } from "./MobileTableToolbar";
import { Pagination } from "./Pagination";
import { FilterField } from "./FilterField";
import { Dropdown } from "./Dropdown";

const meta = {
  title: "Components/MobileTableToolbar",
  component: MobileTableToolbar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "The one mobile toolbar every table screen wears: search, filter, sort, view toggle and pagination, plus a contextual action bar that replaces them while rows are selected. Sized for a phone — view it at a narrow viewport.",
      },
    },
  },
};

export default meta;

const sortOptions = [
  { value: "account", label: "Account" },
  { value: "name", label: "License Name" },
  { value: "expiry", label: "Expiry Date" },
];

const filterFields = (
  <div className="flex flex-col gap-3 pb-2">
    <FilterField label="Account">
      <Dropdown
        value=""
        options={[
          { value: "", label: "All" },
          { value: "acme", label: "Acme Corp" },
        ]}
        onChange={() => {}}
      />
    </FilterField>
    <FilterField label="Status">
      <Dropdown
        value=""
        options={[
          { value: "", label: "All" },
          { value: "active", label: "Active" },
        ]}
        onChange={() => {}}
      />
    </FilterField>
  </div>
);

/** Everything switched on, which is what a licence-style screen passes. */
export const Playground = {
  render: () => {
    const [search, setSearch] = React.useState("");
    const [viewMode, setViewMode] = React.useState("card");
    const [sort, setSort] = React.useState("account");
    const [page, setPage] = React.useState(1);

    return (
      <div className="max-w-sm">
        <MobileTableToolbar
          searchValue={search}
          onSearchChange={setSearch}
          filterOptions={filterFields}
          activeFilterCount={0}
          sortOptions={sortOptions}
          currentSort={sort}
          onSortSelect={setSort}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          pagination={<Pagination page={page} pageSize={10} total={132} onPageChange={setPage} />}
        />
      </div>
    );
  },
};

/** The badge counts the filters actually narrowing the table right now. */
export const WithActiveFilters = {
  render: () => {
    const [viewMode, setViewMode] = React.useState("card");
    return (
      <div className="max-w-sm">
        <MobileTableToolbar
          searchValue=""
          onSearchChange={() => {}}
          filterOptions={filterFields}
          activeFilterCount={3}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>
    );
  },
};

/**
 * Selecting rows replaces the controls rather than stacking another bar
 * beneath them — a phone has no room for both, and while a selection exists
 * the actions that apply to it are the only ones that matter.
 *
 * `requiresSingle` holds Edit back until exactly one row is selected.
 */
export const SelectionMode = {
  render: () => {
    const [selectedCount, setSelectedCount] = React.useState(2);
    const [viewMode, setViewMode] = React.useState("card");

    return (
      <div className="flex max-w-sm flex-col gap-3">
        <div className="flex gap-2">
          {[0, 1, 2].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setSelectedCount(n)}
              className="rounded-control border border-card-border px-2 py-1 text-body-sm text-ink-primary"
            >
              {n} selected
            </button>
          ))}
        </div>

        <MobileTableToolbar
          searchValue=""
          onSearchChange={() => {}}
          filterOptions={filterFields}
          sortOptions={sortOptions}
          onSortSelect={() => {}}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedCount={selectedCount}
          onClearSelection={() => setSelectedCount(0)}
          selectionActions={[
            { key: "edit", label: "Edit", icon: <Pencil size={15} />, requiresSingle: true },
            { key: "activate", label: "Activate", icon: <Power size={15} /> },
            { key: "delete", label: "Delete", icon: <Trash2 size={15} />, danger: true },
          ]}
          pagination={<Pagination page={1} pageSize={10} total={132} onPageChange={() => {}} />}
        />
      </div>
    );
  },
};

/** Every control is optional. A screen with nothing to sort or filter by just closes the row up. */
export const ViewToggleOnly = {
  render: () => {
    const [viewMode, setViewMode] = React.useState("card");
    return (
      <div className="max-w-sm">
        <MobileTableToolbar
          hideSearch
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          pagination={<Pagination page={1} pageSize={10} total={42} onPageChange={() => {}} />}
        />
      </div>
    );
  },
};
