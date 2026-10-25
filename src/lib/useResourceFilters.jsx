import * as React from "react";
import { FilterField } from "../components/common/FilterField";
import { Dropdown } from "../components/common/Dropdown";
import { DateRangePicker } from "../components/common/DateRangePicker";
import { MultiSelectDropdown } from "../components/common/MultiSelectDropdown";
import { Button } from "../components/common/Button";
import { useBottomSheet } from "../components/common/BottomSheet";
import { cn } from "./cn";
import { useDistinctValues } from "./useDistinctValues";
import { usePageFilters } from "./PageFilterContext";

const DEFAULT_PRODUCT_OPTIONS = [
  { value: "EnviroFRONT", label: "EnviroFRONT" },
  { value: "OCEMS", label: "OCEMS" },
  { value: "SolarFRONT", label: "SolarFRONT" },
];

function toIsoDate(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function encodeDateRange(range) {
  if (!range) return null;
  const from = toIsoDate(range.from);
  const to = toIsoDate(range.to);
  return from || to ? `${from}..${to}` : null;
}

function decodeDateRange(value) {
  if (typeof value !== "string" || !value.includes("..")) return { from: null, to: null };
  const [from, to] = value.split("..");
  return { from: from || null, to: to || null };
}

/**
 * Search and Clear for the mobile sheet.
 *
 * A component rather than plain markup so it can reach the sheet around it and
 * dismiss it: applying a filter and leaving the sheet covering the rows it just
 * narrowed reads as the button having done nothing. Falls back to doing only
 * the filtering when rendered outside a sheet.
 *
 * Pinned to the foot of the sheet rather than scrolling away below the last
 * field. A filter list long enough to scroll (License has eight) put Search
 * off screen exactly when the user had finished choosing and wanted it.
 * `sticky` against `BottomSheet`'s scrolling body is what does it; the
 * negative margins cancel that body's own padding so the bar spans the full
 * width and sits flush at the bottom, and its own padding puts the inset back
 * inside — keeping the buttons clear of a phone's home indicator.
 *
 * Clear then Search, so the primary action is on the right. That matches the
 * desktop `FilterPanel` (which reverses its row under `actionAlign="end"`)
 * and the usual convention of the confirming action being rightmost — the two
 * had been mirror images of each other.
 */
function MobileFilterActions({ onApply, onClear }) {
  const sheet = useBottomSheet();

  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 flex gap-2",
        "-mx-5 -mb-[calc(1rem+env(safe-area-inset-bottom))] px-5 pb-[calc(1rem+env(safe-area-inset-bottom))]",
        "mt-1 border-t border-card-border bg-card pt-3"
      )}
    >
      <Button
        variant="cancel"
        fullWidth
        onClick={() => {
          onClear();
          sheet?.close?.();
        }}
      >
        Clear
      </Button>
      <Button
        variant="primary"
        fullWidth
        onClick={() => {
          onApply();
          sheet?.close?.();
        }}
      >
        Search
      </Button>
    </div>
  );
}

/**
 * Everything a screen needs to filter itself, from a list of field names.
 *
 * There are two places a filter panel can live, and only one of them works.
 * Rendered by the page, it is `position: absolute` inside a container that is
 * `overflow: hidden` with `min-h-0` — so it opens below the content and gets
 * clipped away, which looks exactly like a filter button that does nothing.
 * Rendered by the shell, it is outside every page's clipping context. This
 * hook publishes into the shell, so the broken arrangement is not reachable.
 *
 * It also fetches the options from the server rather than reading them off the
 * rows on screen. Under server-side paging those are one page's worth, so a
 * dropdown could only ever offer the values that happened to land on page one
 * — and a filter that cannot name the thing you are looking for reads as "that
 * value does not exist".
 *
 * @param {Object} params
 * @param {string} params.path Resource path, e.g. "/api/reports".
 * @param {{key: string, label: string, options?: {value: string, label: string}[]}[]} params.fields
 *   The columns to offer. `options` overrides the fetched values for that field.
 * @param {Record<string, string | string[]>} params.filters Applied filters,
 *   from `useServerResource`. A `multiSelect` field's value is an array;
 *   every other field's is a plain string.
 * @param {(filters: Record<string, string | string[]>) => void} params.setFilters Its setter.
 * @param {any[]} [params.rows] Derive the options from these rows instead of
 *   asking the server. For a screen still holding all its data client-side that
 *   is the correct source: the server's full set would offer values the loaded
 *   rows do not contain, and picking one would empty the table. Omit it once the
 *   screen pages from the server, where the opposite is true.
 * @param {string} [params.allLabel="All"] Label for the option that clears a field.
 * @param {ReturnType<import("./apiClient").createApiClient>} [params.client]
 * @returns {{
 *   fields: React.ReactNode,
 *   mobileFilterOptions: React.ReactNode,
 *   activeCount: number,
 *   apply: () => void,
 *   clear: () => void,
 * }}
 *
 * @example
 * useResourceFilters({
 *   path: "/api/reports",
 *   fields: [{ key: "account", label: "Account" }],
 *   filters, setFilters,
 * });
 */
export function useResourceFilters({
  path,
  fields,
  filters,
  setFilters,
  rows,
  allLabel = "All",
  client,
}) {
  // `fields` is an array literal at nearly every call site, so a new identity
  // arrives on every render. Left unguarded that flows into the published
  // config, `usePageFilters` republishes, the provider re-renders, and the page
  // renders again — forever. A content signature plus a ref breaks the loop
  // while still picking up a genuine change to the field list.
  const signature = (fields ?? []).map((f) => `${f.key}:${f.label ?? ""}:${f.type ?? ""}`).join("|");
  const fieldsRef = React.useRef(fields);
  fieldsRef.current = fields;

  // Not memoised, deliberately: `useDistinctValues` compares by content — it
  // joins the names and keys its effect on the string — so a fresh array every
  // render costs nothing. A memo here looked prudent and guarded nothing;
  // removing it changed no test.
  const fromServer = rows == null;
  const keys = fromServer
    ? (fields ?? []).filter((f) => f.type !== "dateRange" && f.type !== "multiSelect").map((f) => f.key)
    : [];

  const { options: fetched } = useDistinctValues(path, keys, { client, allLabel });

  const derived = React.useMemo(() => {
    if (fromServer) return fetched;
    const out = {};
    for (const field of fieldsRef.current ?? []) {
      if (field.type === "dateRange" || field.type === "multiSelect") continue;
      const seen = new Set();
      for (const row of rows ?? []) {
        const value = row?.[field.key];
        if (value === undefined || value === null || value === "" || typeof value === "object") continue;
        seen.add(String(value));
      }
      out[field.key] = [
        { value: "", label: allLabel },
        ...[...seen]
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
          .map((value) => ({ value, label: value })),
      ];
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromServer, fetched, rows, signature, allLabel]);

  // Both sources hand back a fresh object, and `rows` is often a fresh array
  // too. Compared by identity that reaches the published config and restarts
  // the loop the signature above exists to prevent, so the options are held by
  // content as well. Cheap — this is a handful of distinct values, not the rows.
  const optionsSignature = JSON.stringify(derived);
  const optionsRef = React.useRef(derived);
  optionsRef.current = derived;

  // Held apart from the applied filters so the panel behaves like a form: set
  // several fields, then press Search once. Editing a dropdown does not refetch
  // on its own, which at fifty thousand rows is the difference between one
  // query and one per keystroke.
  const [draft, setDraft] = React.useState(filters ?? {});

  // Re-syncs when the applied filters change from outside — a Clear elsewhere,
  // or a page restoring saved filters — so the panel never shows a selection
  // the table is not actually using.
  React.useEffect(() => {
    setDraft(filters ?? {});
  }, [filters]);

  const setOne = React.useCallback((key, value) => {
    setDraft((prev) => {
      const next = { ...prev };
      // An empty choice is "All", which is the absence of a filter rather than
      // a filter matching the empty string.
      if (value) next[key] = value;
      else delete next[key];
      return next;
    });
  }, []);

  const apply = React.useCallback(() => setFilters(draft), [setFilters, draft]);

  const clear = React.useCallback(() => {
    setDraft({});
    setFilters({});
  }, [setFilters]);

  const renderedFields = React.useMemo(
    () =>
      (fieldsRef.current ?? []).map((field) => (
        <FilterField key={field.key} label={field.label} labelAlign="left">
          {field.type === "multiSelect" ? (
            <MultiSelectDropdown
              value={
                Array.isArray(draft[field.key])
                  ? draft[field.key]
                  : draft[field.key]
                  ? [draft[field.key]]
                  : []
              }
              options={
                field.options ??
                (field.key === "product"
                  ? DEFAULT_PRODUCT_OPTIONS
                  : (optionsRef.current[field.key] || []).filter((o) => o && o.value))
              }
              onChange={(val) => setOne(field.key, val && val.length > 0 ? val : undefined)}
              placeholder="Select..."
            />
          ) : field.type === "dateRange" ? (
            <DateRangePicker
              value={decodeDateRange(draft[field.key])}
              onChange={(range) => setOne(field.key, encodeDateRange(range))}
            />
          ) : (
            <Dropdown
              value={draft[field.key] ?? ""}
              options={
                field.options ?? optionsRef.current[field.key] ?? [{ value: "", label: allLabel }]
              }
              onChange={(value) => setOne(field.key, value)}
            />
          )}
        </FilterField>
      )),
    // The two refs are read rather than listed: `signature` and
    // `optionsSignature` are what say their contents actually changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [signature, draft, optionsSignature, setOne, allLabel]
  );

  const activeCount = React.useMemo(
    () =>
      Object.values(filters ?? {}).filter((v) =>
        v != null && v !== "" && (!Array.isArray(v) || v.length > 0)
      ).length,
    [filters]
  );

  const config = React.useMemo(
    () => ({ activeCount, onApply: apply, onClear: clear, children: renderedFields }),
    [activeCount, apply, clear, renderedFields]
  );

  usePageFilters(config);

  // The mobile sheet renders whatever it is given and has no footer of its
  // own, so the actions come with the fields. Without them the sheet would set
  // a draft nobody could apply.
  const mobileFilterOptions = React.useMemo(
    () => (
      // No bottom padding here: the pinned actions below carry the sheet's
      // bottom inset themselves, and any padding under them would show as a
      // strip of blank card beneath the bar once the fields scroll.
      <div className="flex flex-col gap-3">
        {renderedFields}
        <MobileFilterActions onApply={apply} onClear={clear} />
      </div>
    ),
    [renderedFields, apply, clear]
  );

  return { fields: renderedFields, mobileFilterOptions, activeCount, apply, clear };
}
