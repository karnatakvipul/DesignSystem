import * as React from "react";
import { FilterPanel } from "./FilterPanel";
import { Dropdown } from "./Dropdown";

const ALL = "all";

// Keys that are never useful to filter on (identifiers, free-text blobs).
const SKIP_KEYS = new Set(["id", "_id", "__v", "key", "licenseKey", "description", "notes", "details", "remarks", "comment"]);

// Beyond this many distinct values a dropdown stops being a useful filter
// (e.g. a unique-per-row key), so the field is dropped from auto-derivation.
const MAX_DISTINCT = 40;

function humanize(key) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

/**
 * Distinct, sorted, non-empty values for `key` across `rows`, as Dropdown options
 * prefixed with an "All" entry.
 */
function optionsFor(rows, key, formatLabel) {
  const seen = new Set();
  (rows || []).forEach((r) => {
    const v = r?.[key];
    if (v === undefined || v === null || v === "") return;
    if (typeof v === "object") return;
    seen.add(typeof v === "boolean" ? String(v) : v);
  });
  const values = Array.from(seen).sort((a, b) =>
    String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" })
  );
  return [
    { value: ALL, label: "All" },
    ...values.map((v) => ({
      value: String(v),
      label: formatLabel ? formatLabel(v) : String(v),
    })),
  ];
}

/**
 * Derive a sensible filterable field list straight from the data when the
 * caller doesn't supply one: every scalar column with a small enough set of
 * repeated values to be worth a dropdown.
 */
function deriveFields(rows) {
  if (!rows || rows.length === 0) return [];
  return Object.keys(rows[0])
    .filter((k) => !SKIP_KEYS.has(k))
    .map((k) => ({ key: k, label: humanize(k) }))
    .filter(({ key }) => {
      const opts = optionsFor(rows, key);
      // -1 for the "All" entry; needs at least 2 real values to be a filter.
      const distinct = opts.length - 1;
      return distinct > 1 && distinct <= MAX_DISTINCT;
    });
}

/**
 * Applies the values produced by <DataFilter> to a row set. Exported so pages
 * don't have to reimplement the matching rules.
 */
function applyDataFilter(rows, values) {
  if (!values) return rows;
  const active = Object.entries(values).filter(([, v]) => v && v !== ALL);
  if (active.length === 0) return rows;
  return (rows || []).filter((row) =>
    active.every(([key, val]) => String(row?.[key] ?? "") === String(val))
  );
}

/** Number of filters currently narrowing the data — for FilterPanel's badge. */
function countActiveFilters(values) {
  return Object.values(values || {}).filter((v) => v && v !== ALL).length;
}

/**
 * Generic, data-driven filter popover.
 *
 * Unlike the hand-written per-feature filters, this builds its dropdowns from
 * the rows it's actually given, so each page only ever offers filters — and
 * option values — that exist in that page's own data.
 *
 * Props:
 * - open / onClose: popover visibility.
 * - rows: the page's full (pre-filter) dataset; option lists come from here.
 * - fields: optional [{ key, label, formatLabel?, options? }] to control which
 *   columns are filterable and their order. Auto-derived from `rows` when
 *   omitted. `formatLabel(value)` relabels derived options (e.g. booleans as
 *   "Active"/"Deactivated"); `options` overrides derivation entirely.
 * - values / onChange: the filter state object, keyed by field key.
 * - title, onSearch, onClear, className: forwarded to FilterPanel.
 */
function DataFilter({
  open,
  onClose,
  rows = [],
  fields,
  values = {},
  onChange = () => {},
  title = "Filter Records",
  onSearch,
  onClear,
  className,
}) {
  const resolvedFields = React.useMemo(
    () => (fields && fields.length > 0 ? fields : deriveFields(rows)),
    [fields, rows]
  );

  const fieldOptions = React.useMemo(
    () => resolvedFields.map((f) => ({ ...f, options: f.options ?? optionsFor(rows, f.key, f.formatLabel) })),
    [resolvedFields, rows]
  );

  if (!open) return null;

  return (
    <FilterPanel
      open={open}
      onClose={onClose}
      title={title}
      activeCount={countActiveFilters(values)}
      onSearch={onSearch}
      onClear={onClear}
      className={className}
    >
      {fieldOptions.map((f) => (
        <Dropdown
          key={f.key}
          label={f.label}
          placeholder="All"
          options={f.options}
          value={values[f.key] ?? ALL}
          onChange={(v) => onChange({ ...values, [f.key]: v })}
        />
      ))}
    </FilterPanel>
  );
}

export { DataFilter, applyDataFilter, countActiveFilters };
