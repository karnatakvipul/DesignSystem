import * as React from "react";
import { Search, SlidersHorizontal, ArrowUpDown, X, LayoutGrid, Table as TableIcon } from "lucide-react";
import { DataTable } from "./DataTable";
import { MobileCardList } from "./MobileCardList";
import { BottomSheet } from "./BottomSheet";
import { cn } from "../../lib/cn";
import { COLUMN_SIZES } from "../../lib/columnWidth";

// ── Shared column normalizer (mirrors DataTable's normalizeColumns) ──────────
const LONG_TEXT_KEYS = new Set(["description", "name", "site", "address", "notes", "details", "title", "label", "comment", "remarks"]);
const COPY_KEYS      = new Set(["key", "apiKey", "token", "secret", "hash", "uuid"]);
const SKIP_KEYS      = new Set(["id", "_id", "__v"]);

function autoHeader(key) {
  return key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").toUpperCase().trim();
}
// A width guessed from the column's name, for tables that hand over bare keys
// and let this wrapper work out the rest. Answers come from the shared scale
// rather than free numbers, so a guessed column still lines up with a declared
// one sitting next to it.
function autoWidth(key, sampleValue) {
  if (COPY_KEYS.has(key)) return COLUMN_SIZES.md;
  if (LONG_TEXT_KEYS.has(key)) return COLUMN_SIZES.xl;
  if (typeof sampleValue === "boolean") return COLUMN_SIZES.xs;
  const lower = key.toLowerCase();
  if (lower.includes("date") || lower.includes("time")) return COLUMN_SIZES.sm;
  if (lower.includes("amount") || lower.includes("price")) return COLUMN_SIZES.sm;
  if (lower.includes("status")) return COLUMN_SIZES.md;
  if (lower.includes("type")) return COLUMN_SIZES.md;
  return COLUMN_SIZES.sm;
}

/** Has this column said anything about how wide it wants to be? */
function declaresWidth(col) {
  return col.size != null || col.width != null || col.minWidth != null;
}

// Colour is kept out of the base and split into whole idle/active sets, only
// one of which is ever applied. `cn` is plain `clsx` with no tailwind-merge,
// so an appended `bg-accent` does not replace a base `bg-input` — both land in
// `class` and the stylesheet's order decides. That took the active state's
// white text but kept the idle background: a white icon on a near-white
// surface (1.05:1 on the light themes), i.e. invisible.
const VIEW_BUTTON_BASE =
  "flex h-control-lg w-control-lg items-center justify-center rounded-surface border transition-colors shrink-0 cursor-pointer";
const VIEW_BUTTON_IDLE = "border-card-border bg-input text-ink-muted hover:text-ink-primary";
const VIEW_BUTTON_ACTIVE = "border-accent bg-accent text-white hover:bg-accent-light hover:border-accent-light";

function normalizeColumns(columns, data, autoColumns) {
  const shouldAutoGenerate = autoColumns || !columns || columns.length === 0;
  if (shouldAutoGenerate && data && data.length > 0) {
    return Object.keys(data[0]).filter((k) => !SKIP_KEYS.has(k)).map((key) => ({
      key, header: autoHeader(key), sortable: true,
      width: autoWidth(key, data[0][key]),
      truncate: LONG_TEXT_KEYS.has(key), copyable: COPY_KEYS.has(key),
    }));
  }
  if (!columns || columns.length === 0) return [];
  const firstRow = data && data.length > 0 ? data[0] : {};
  return columns.map((col) => {
    if (typeof col === "string") {
      return { key: col, header: autoHeader(col), sortable: true,
        width: autoWidth(col, firstRow[col]),
        truncate: LONG_TEXT_KEYS.has(col), copyable: COPY_KEYS.has(col) };
    }
    // The guess only fills a gap. It used to be applied unconditionally, and
    // because a `width` beats a `minWidth` in a fixed table layout it quietly
    // won every argument: a column asking for 240px got 180 because its key was
    // "key", and one asking for 160 got 150 because its key matched nothing at
    // all. That is what left the header row looking arbitrary — the widths on
    // screen were never the ones the pages had asked for.
    return {
      sortable: true,
      ...(declaresWidth(col) ? null : { width: autoWidth(col.key, firstRow[col.key]) }),
      truncate: LONG_TEXT_KEYS.has(col.key), copyable: COPY_KEYS.has(col.key),
      ...col, header: col.header ?? autoHeader(col.key) };
  });
}

/**
 * The Sort and Card/Table view-toggle buttons `MobileTableWrapper` renders in
 * its own sticky toolbar by default. Exported so a page can pull them out of
 * that toolbar (`hideMobileControls` on `MobileTableWrapper`) and render them
 * next to its own pagination row instead — the two read as one control
 * cluster wherever they end up.
 *
 * `viewMode`/`onViewModeChange` must be the same pair passed to
 * `MobileTableWrapper` so the toggle here actually drives its card/table
 * content. Sort renders only when both `sortOptions` and `onSortSelect` are
 * given, matching `MobileTableWrapper`'s own rule for showing that button.
 */
function MobileViewControls({ sortOptions, currentSort, onSortSelect, viewMode, onViewModeChange, className }) {
  const [sortSheetOpen, setSortSheetOpen] = React.useState(false);
  const showSort = Boolean(sortOptions && onSortSelect);

  return (
    <>
      <div className={cn("flex items-center gap-2", className)}>
        {showSort && (
          <button
            type="button"
            onClick={() => setSortSheetOpen(true)}
            className="flex h-control-lg w-control-lg items-center justify-center rounded-surface border border-card-border bg-input text-ink-muted hover:bg-accent-muted hover:text-accent active:bg-accent-muted/70 shrink-0"
            aria-label="Sort"
          >
            <ArrowUpDown size={18} />
          </button>
        )}
        <button
          type="button"
          onClick={() => onViewModeChange?.(viewMode === "card" ? "table" : "card")}
          className={cn(VIEW_BUTTON_BASE, viewMode === "table" ? VIEW_BUTTON_ACTIVE : VIEW_BUTTON_IDLE)}
          title={viewMode === "card" ? "Switch to Table View" : "Switch to Card View"}
          aria-label={viewMode === "card" ? "Switch to Table View" : "Switch to Card View"}
        >
          {viewMode === "card" ? <TableIcon size={18} /> : <LayoutGrid size={18} />}
        </button>
      </div>

      {showSort && (
        <BottomSheet open={sortSheetOpen} onClose={() => setSortSheetOpen(false)} title="Sort Records">
          <div className="flex flex-col gap-1 pb-4">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onSortSelect(opt.value);
                  setSortSheetOpen(false);
                }}
                className={cn(
                  "flex min-h-control-lg w-full items-center justify-between rounded-surface px-4 text-body font-medium transition-colors text-left cursor-pointer",
                  currentSort === opt.value ? "bg-accent text-white" : "text-ink-primary hover:bg-accent-muted"
                )}
              >
                <span>{opt.label}</span>
                {currentSort === opt.value && (
                  <span className="text-body-sm font-semibold uppercase">Active</span>
                )}
              </button>
            ))}
          </div>
        </BottomSheet>
      )}
    </>
  );
}

/**
 * Responsive table wrapper:
 * - Desktop (>768px): renders standard DataTable
 * - Mobile (<768px): renders progressive disclosure MobileCardList with view toggle (Cards vs Table view)
 */
function MobileTableWrapper({
  // DataTable props
  columns,
  data,
  rowKey,
  loading,
  error,
  onRetry,
  emptyMessage,
  visibleColumns,
  autoColumns = false,
  sortKey,
  sortDirection,
  onSortChange,
  // Forwarded to DataTable so a server-paged table doesn't re-sort or
  // re-filter the page it was given. Without this the wrapper silently
  // reapplied client-side ordering on top of the server's, which can disagree
  // (JS locale compare vs the database's collation) and makes a page look
  // wrongly ordered. Defaults to false, so existing callers are unaffected.
  serverSide = false,
  selectable,
  // "multiple" (default) or "single". Only the card list acts on it — the
  // desktop table's selection has always been multiple and stays that way, so
  // passing this can't change what a desktop screen does.
  selectionMode = "multiple",
  selectedKeys,
  onSelectedKeysChange,
  onRowClick,
  contextMenuItems,
  onContextMenu,
  className,
  // Forwarded straight to DataTable. Named here rather than swept up by a rest
  // spread so the set of props this wrapper passes on stays something you can
  // read off the signature.
  headerAlign,
  getRowTone,
  dense,

  // Mobile-specific props
  primaryFields = [],
  secondaryFields = [],
  actionMenuItems = [],
  filterOptions,
  sortOptions,
  currentSort,
  onSortSelect,
  mobileSearchValue,
  onMobileSearchChange,
  bulkActions = [],
  loadMore,
  hideMobileSearch = false,
  defaultMobileView = "card", // "card" | "table"
  // Optional controlled pair, for a page that renders `MobileViewControls`
  // itself (e.g. next to its own pagination) instead of using the toggle
  // button in this wrapper's own toolbar. Uncontrolled (internal state) when
  // omitted, same as `mobileSearchValue` above.
  viewMode: viewModeProp,
  onViewModeChange,
  // Hides the Sort and view-toggle buttons from this wrapper's own toolbar —
  // set when a page renders `MobileViewControls` elsewhere instead.
  hideMobileControls = false,
  // Drops this wrapper's sticky toolbar altogether — search, filter, sort and
  // view toggle. Set it when the screen renders `MobileTableToolbar` above the
  // table instead, which is the arrangement to prefer: suppressing the parts
  // one flag at a time still leaves the empty bordered bar behind.
  hideMobileToolbar = false,
}) {
  const normalizedCols = React.useMemo(
    () => normalizeColumns(columns, data, autoColumns),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(columns), data, autoColumns]
  );

  const resolvedPrimaryFields = React.useMemo(() => {
    if (primaryFields.length > 0) return primaryFields;
    return normalizedCols
      .filter((c) => !COPY_KEYS.has(c.key) && c.key !== "id")
      .slice(0, 1)
      .map((c) => c.key);
  }, [normalizedCols, primaryFields]);

  const resolvedSecondaryFields = React.useMemo(() => {
    if (secondaryFields.length > 0) return secondaryFields;
    const primary = new Set(resolvedPrimaryFields);
    return normalizedCols
      .filter((c) => !primary.has(c.key) && c.key !== "id")
      .map((c) => c.key);
  }, [normalizedCols, resolvedPrimaryFields, secondaryFields]);

  const isMobile = React.useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia("(max-width: 767px)");
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    () => (typeof window !== "undefined" ? window.matchMedia("(max-width: 767px)").matches : false),
    () => false
  );

  const [internalViewMode, setInternalViewMode] = React.useState(defaultMobileView);
  const [filterSheetOpen, setFilterSheetOpen] = React.useState(false);
  const [sortSheetOpen, setSortSheetOpen] = React.useState(false);
  const [localSearch, setLocalSearch] = React.useState("");

  // Supports both controlled (mobileSearchValue/onMobileSearchChange) and
  // uncontrolled (internal localSearch) usage — visibility must not depend on
  // the caller having opted into the controlled variant.
  const showSearchInput = !hideMobileSearch;
  const searchValue = mobileSearchValue !== undefined ? mobileSearchValue : localSearch;
  const onSearchChange = onMobileSearchChange || setLocalSearch;

  // Same controlled/uncontrolled split as search — a page rendering
  // `MobileViewControls` next to its own pagination passes `viewMode`/
  // `onViewModeChange` so that toggle drives the content below.
  const viewMode = viewModeProp !== undefined ? viewModeProp : internalViewMode;
  const setViewMode = onViewModeChange || setInternalViewMode;

  // Desktop: render normal DataTable
  if (!isMobile) {
    return (
      <DataTable
        columns={normalizedCols}
        data={data}
        rowKey={rowKey}
        loading={loading}
        error={error}
        onRetry={onRetry}
        emptyMessage={emptyMessage}
        visibleColumns={visibleColumns}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={onSortChange}
        serverSide={serverSide}
        selectable={selectable}
        selectedKeys={selectedKeys}
        onSelectedKeysChange={onSelectedKeysChange}
        onRowClick={onRowClick}
        contextMenuItems={contextMenuItems}
        onContextMenu={onContextMenu}
        headerAlign={headerAlign}
        getRowTone={getRowTone}
        dense={dense}
        className={className}
      />
    );
  }

  // Mobile: render with clean toolbar + view switcher (Cards vs Table View)
  return (
    <div className="md:hidden flex flex-col flex-1 min-h-0 w-full">
      {/* Mobile Toolbar */}
      <div
        className={cn(
          "sticky top-0 z-20 bg-card pb-2 pt-1 border-b border-card-border/60 shrink-0",
          hideMobileToolbar && "hidden"
        )}
      >
        <div className="flex items-center gap-2 px-2.5 sm:px-4">
          {/* Search input */}
          {showSearchInput && (
            <div className="flex h-control-lg flex-1 items-center gap-2 rounded-surface border border-card-border bg-input px-3 focus-within:ring-2 focus-within:ring-accent/40">
              <Search size={16} className="shrink-0 text-ink-muted" />
              <input
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search Data"
                className="w-full bg-transparent text-body-sm text-ink-primary placeholder:text-ink-muted focus:outline-none"
              />
              {searchValue && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => onSearchChange("")}
                  className="flex h-control-md w-control-md items-center justify-center text-ink-muted hover:text-ink-primary shrink-0"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {/* Filter button */}
          {filterOptions && (
            <button
              type="button"
              onClick={() => setFilterSheetOpen(true)}
              className="flex h-control-lg w-control-lg items-center justify-center rounded-surface border border-card-border bg-input text-ink-muted hover:bg-accent-muted hover:text-accent active:bg-accent-muted/70 shrink-0"
              aria-label="Filters"
            >
              <SlidersHorizontal size={18} />
            </button>
          )}

          {/* Sort button */}
          {!hideMobileControls && sortOptions && onSortSelect && (
            <button
              type="button"
              onClick={() => setSortSheetOpen(true)}
              className="flex h-control-lg w-control-lg items-center justify-center rounded-surface border border-card-border bg-input text-ink-muted hover:bg-accent-muted hover:text-accent active:bg-accent-muted/70 shrink-0"
              aria-label="Sort"
            >
              <ArrowUpDown size={18} />
            </button>
          )}

          {/* View Mode Toggle Button (Cards vs Table) */}
          {!hideMobileControls && (
            <button
              type="button"
              onClick={() => setViewMode(viewMode === "card" ? "table" : "card")}
              className={cn(VIEW_BUTTON_BASE, viewMode === "table" ? VIEW_BUTTON_ACTIVE : VIEW_BUTTON_IDLE)}
              title={viewMode === "card" ? "Switch to Table View" : "Switch to Card View"}
              aria-label={viewMode === "card" ? "Switch to Table View" : "Switch to Card View"}
            >
              {viewMode === "card" ? <TableIcon size={18} /> : <LayoutGrid size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "table" ? (
        <div className="flex-1 min-h-0 w-full overflow-auto [-webkit-overflow-scrolling:touch] p-2">
          <DataTable
            columns={normalizedCols}
            data={data}
            rowKey={rowKey}
            loading={loading}
            error={error}
            onRetry={onRetry}
            emptyMessage={emptyMessage}
            visibleColumns={visibleColumns}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortChange={onSortChange}
            selectable={selectable}
            selectedKeys={selectedKeys}
            onSelectedKeysChange={onSelectedKeysChange}
            onRowClick={onRowClick}
            headerAlign={headerAlign}
            getRowTone={getRowTone}
            dense={dense}
            className={className}
          />
        </div>
      ) : (
        <MobileCardList
          data={data}
          rowKey={rowKey}
          columns={normalizedCols}
          primaryFields={resolvedPrimaryFields}
          secondaryFields={resolvedSecondaryFields}
          actionMenuItems={actionMenuItems}
          onRowClick={onRowClick}
          emptyMessage={emptyMessage}
          loading={loading}
          error={error}
          onRetry={onRetry}
          loadingMore={loadMore?.loadingMore}
          onLoadMore={loadMore?.onLoadMore}
          hasMore={loadMore?.hasMore}
          selectable={selectable}
          selectionMode={selectionMode}
          selectedKeys={selectedKeys}
          onSelectedKeysChange={onSelectedKeysChange}
          bulkActions={bulkActions}
        />
      )}

      {/* Filter Bottom Sheet */}
      {filterOptions && (
        <BottomSheet
          open={filterSheetOpen}
          onClose={() => setFilterSheetOpen(false)}
          title="Filter Records"
        >
          {filterOptions}
        </BottomSheet>
      )}

      {/* Sort Bottom Sheet */}
      {!hideMobileControls && sortOptions && onSortSelect && (
        <BottomSheet
          open={sortSheetOpen}
          onClose={() => setSortSheetOpen(false)}
          title="Sort Records"
        >
          <div className="flex flex-col gap-1 pb-4">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onSortSelect(opt.value);
                  setSortSheetOpen(false);
                }}
                className={cn(
                  "flex min-h-control-lg w-full items-center justify-between rounded-surface px-4 text-body font-medium transition-colors text-left cursor-pointer",
                  currentSort === opt.value
                    ? "bg-accent text-white"
                    : "text-ink-primary hover:bg-accent-muted"
                )}
              >
                <span>{opt.label}</span>
                {currentSort === opt.value && (
                  <span className="text-body-sm font-semibold uppercase">Active</span>
                )}
              </button>
            ))}
          </div>
        </BottomSheet>
      )}
    </div>
  );
}

export { MobileTableWrapper, MobileViewControls };
