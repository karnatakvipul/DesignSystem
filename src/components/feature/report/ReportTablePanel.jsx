import * as React from "react";
import { SlidersHorizontal } from "lucide-react";
import { Panel } from "../../common/Panel";
import { Pagination } from "../../common/Pagination";
import { Button } from "../../common/Button";
import { FilterPanel } from "../../common/FilterPanel";
import { FilterField } from "../../common/FilterField";
import { Dropdown } from "../../common/Dropdown";
import { DateRangePicker } from "../../common/DateRangePicker";
import { MobileTableWrapper } from "../../common/MobileTableWrapper";

/**
 * One full report table — paginated, filtered, own data source.
 *
 * The reference SLS report screen puts a dozen of these on one page, each with
 * its own filter bar and its own paging, rather than one shared filter driving
 * every table. `ReportTablePanel` is that one unit, meant to be instantiated
 * once per report rather than extended into something that tries to be all of
 * them — the field *set* genuinely differs per report (a payment report wants
 * Payment Status, an audit log wants Username and Action Type instead of
 * License Type), so `filterFields` is a plain list the caller supplies rather
 * than a fixed shape this component tries to cover every case of.
 *
 * `ResourceTable` (elsewhere in this folder's parent) stays what it was: a
 * six-row, filterless preview for a dashboard. This is the other job — the
 * full table a "View all" link on one of those would lead to.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {Array} props.columns MobileTableWrapper column definitions.
 * @param {(args: {page:number, pageSize:number, filters:Object, dateRange:{from,to}|null}) => Promise<{items:Array, total:number}>} props.fetchPage
 * @param {{key:string, label:string, options:Array}[]} [props.filterFields] Dropdown filters besides the date range.
 * @param {{from:Date, to:Date}|null} [props.defaultDateRange]
 * @param {number} [props.pageSize]
 * @param {string} [props.emptyMessage]
 * @param {string} [props.note] A caveat shown above the table — used where the
 *   reference itself has no working example to match (see the four reports
 *   whose backend 500s on the live reference).
 * @param {boolean} [props.dense] Forwarded to the inner `MobileTableWrapper` —
 *   reduces body cell padding/font size for a more compact table.
 * @param {"auto"|"center"|"right"} [props.headerAlign] Forwarded to the inner
 *   `MobileTableWrapper` — table-wide default alignment for both header
 *   labels and body cells.
 */
export function ReportTablePanel({
  title,
  columns,
  fetchPage,
  filterFields = [],
  defaultDateRange = null,
  pageSize = 20,
  emptyMessage = "No records found.",
  note,
  dense,
  headerAlign,
}) {
  const [page, setPage] = React.useState(1);
  const [filters, setFilters] = React.useState({});
  const [dateRange, setDateRange] = React.useState(defaultDateRange);
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [rows, setRows] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchPage({ page, pageSize, filters, dateRange });
      setRows(result?.items ?? []);
      setTotal(typeof result?.total === "number" ? result.total : (result?.items?.length ?? 0));
    } catch (err) {
      setError(err?.message || `Could not load ${title}`);
    } finally {
      setLoading(false);
    }
  }, [fetchPage, page, pageSize, filters, dateRange, title]);

  React.useEffect(() => {
    load();
  }, [load]);

  const activeCount =
    Object.values(filters).filter((v) => v && v !== "all").length + (dateRange ? 1 : 0);

  return (
    <Panel
      title={title}
      actions={
        <div className="flex items-center gap-2">
          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              icon={<SlidersHorizontal size={14} />}
              onClick={() => setFilterOpen((v) => !v)}
              aria-expanded={filterOpen}
            >
              Filter{activeCount > 0 ? ` (${activeCount})` : ""}
            </Button>

            <FilterPanel
              open={filterOpen}
              onClose={() => setFilterOpen(false)}
              title={`Filter ${title}`}
              activeCount={activeCount}
              layout="rows"
              actionAlign="end"
              position="absolute top-full right-0 z-[110] mt-2"
              onSearch={() => {
                setPage(1);
                setFilterOpen(false);
              }}
              onClear={() => {
                setFilters({});
                setDateRange(defaultDateRange);
                setPage(1);
              }}
            >
              {filterFields.map((f) => (
                <FilterField key={f.key} label={f.label}>
                  <Dropdown
                    placeholder="All"
                    options={f.options}
                    value={filters[f.key] ?? null}
                    onChange={(v) => setFilters((prev) => ({ ...prev, [f.key]: v }))}
                  />
                </FilterField>
              ))}
              <FilterField label="Date">
                <DateRangePicker value={dateRange} onChange={setDateRange} />
              </FilterField>
            </FilterPanel>
          </div>
        </div>
      }
    >
      {note && <p className="px-2 pb-1 text-caption text-ink-muted">{note}</p>}
      <MobileTableWrapper
        columns={columns}
        data={rows}
        rowKey={(r) => r.id}
        loading={loading}
        error={error}
        onRetry={load}
        serverSide
        emptyMessage={emptyMessage}
        primaryFields={columns.slice(0, 2).map((c) => c.key)}
        dense={dense}
        headerAlign={headerAlign}
      />
    </Panel>
  );
}
