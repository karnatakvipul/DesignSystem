import * as React from "react";
import { FilterPanel } from "../../common/FilterPanel";
import { InputField } from "../../common/InputField";
import { Dropdown } from "../../common/Dropdown";

/** Distinct values for `key` across `rows`, as Dropdown options. */
function optionsFrom(rows, key) {
  const seen = new Set();
  (rows || []).forEach((r) => {
    const v = r?.[key];
    if (v === undefined || v === null || v === "") return;
    seen.add(String(v));
  });
  return Array.from(seen)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
    .map((v) => ({ value: v, label: v }));
}

/**
 * Filter the users by name, status and role.
 *
 * Pass `rows` (the page's users) so the status/role dropdowns list exactly the
 * values present in that data rather than a hardcoded guess.
 */
export function UsersFilter({ open, onClose, filters, onChange, onSearch, onClear, rows = [] }) {
  const statusOptions = React.useMemo(() => optionsFrom(rows, "status"), [rows]);
  const roleOptions = React.useMemo(() => optionsFrom(rows, "role"), [rows]);

  if (!open) return null;
  function set(patch) {
    onChange({ ...filters, ...patch });
  }
  return (
    <FilterPanel open={open} onClose={onClose} onSearch={onSearch} onClear={onClear}>
      <InputField label="Name" placeholder="All" value={filters.name ?? ""} onChange={(e) => set({ name: e.target.value })} />
      <Dropdown label="Status" placeholder="All" options={statusOptions} value={filters.status} onChange={(v) => set({ status: v })} />
      <Dropdown label="Role" placeholder="All" options={roleOptions} value={filters.role} onChange={(v) => set({ role: v })} />
    </FilterPanel>
  );
}
