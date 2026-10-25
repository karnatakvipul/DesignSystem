import * as React from "react";
import { FilterPanel } from "../../common/FilterPanel";
import { InputField } from "../../common/InputField";
import { Dropdown } from "../../common/Dropdown";

/**
 * Distinct values for `key` across `rows`, as Dropdown options behind an "all"
 * entry. Derived from the caller's real data so the list can't drift out of
 * sync with what's actually on the page.
 */
function optionsFrom(rows, key, allLabel) {
  const seen = new Set();
  (rows || []).forEach((r) => {
    const v = r?.[key];
    if (v === undefined || v === null || v === "") return;
    seen.add(String(v));
  });
  const values = Array.from(seen).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
  );
  return [{ value: "all", label: allLabel }, ...values.map((v) => ({ value: v, label: v }))];
}

/**
 * Modern Gmail-style floating filter popover for licenses.
 *
 * Pass `rows` (the page's licenses) so every dropdown offers exactly the values
 * present in that data.
 */
export function LicenseFilter({ open, onClose, filters = {}, onChange, onSearch, onClear, rows = [] }) {
  const accountOptions = React.useMemo(() => optionsFrom(rows, "account", "All Accounts"), [rows]);
  const siteOptions = React.useMemo(() => optionsFrom(rows, "site", "All Sites"), [rows]);
  const typeOptions = React.useMemo(() => optionsFrom(rows, "type", "All Types"), [rows]);
  const statusOptions = React.useMemo(() => optionsFrom(rows, "status", "All Statuses"), [rows]);
  const piOptions = React.useMemo(() => optionsFrom(rows, "lastPi", "All Invoices"), [rows]);

  if (!open) return null;

  function set(patch) {
    onChange({ ...filters, ...patch });
  }

  // Calculate active filter count
  const activeCount = Object.values(filters).filter(
    (v) => v && v !== "" && v !== "all"
  ).length;

  return (
    <FilterPanel
      open={open}
      onClose={onClose}
      title="Advanced Search Filter"
      activeCount={activeCount}
      onSearch={onSearch}
      onClear={onClear}
    >
      <InputField
        label="Product Name"
        placeholder="e.g. SLS Pro"
        value={filters.product || ""}
        onChange={(e) => set({ product: e.target.value })}
      />
      <Dropdown
        label="Account Name"
        placeholder="All Accounts"
        options={accountOptions}
        value={filters.account || "all"}
        onChange={(v) => set({ account: v })}
      />
      <Dropdown
        label="Site Location"
        placeholder="All Sites"
        options={siteOptions}
        value={filters.site || "all"}
        onChange={(v) => set({ site: v })}
      />
      <Dropdown
        label="License Type"
        placeholder="All Types"
        options={typeOptions}
        value={filters.type || "all"}
        onChange={(v) => set({ type: v })}
      />
      <InputField
        label="License Term"
        placeholder="e.g. Standard"
        value={filters.term || ""}
        onChange={(e) => set({ term: e.target.value })}
      />
      <InputField
        label="Device Serial"
        placeholder="e.g. DEV-99420"
        value={filters.device || ""}
        onChange={(e) => set({ device: e.target.value })}
      />
      <Dropdown
        label="License Status"
        placeholder="All Statuses"
        options={statusOptions}
        value={filters.status || "all"}
        onChange={(v) => set({ status: v })}
      />
      <Dropdown
        label="Performa Invoice"
        placeholder="All Invoices"
        options={piOptions}
        value={filters.pi || "all"}
        onChange={(v) => set({ pi: v })}
      />
    </FilterPanel>
  );
}
