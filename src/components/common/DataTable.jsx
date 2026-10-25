import * as React from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  SearchX,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { resolveColumnWidth, DEFAULT_COLUMN_WIDTH } from "../../lib/columnWidth";
import { Button } from "./Button";
import { Loader } from "./Loader";
import { RowSelectCheckbox } from "./RowSelectCheckbox";
import { CopyButton } from "./CopyButton";
import { TruncatedText } from "./TruncatedText";
import { ContextMenu } from "./ContextMenu";

/**
 * Row tints, keyed by meaning rather than by colour so a page never hard-codes
 * "yellow" and then loses it when the theme changes. Each maps to a status
 * token that every theme defines, so these stay legible on the dark themes
 * too — a literal yellow would not.
 *
 * These mix the status *foreground* colour into the row rather than using the
 * matching `-bg` token. The `-bg` tokens are badge fills, chosen to sit under a
 * few words of coloured text: `--status-warn-bg` is #fffbeb, which over a white
 * card comes out at 1.02:1 — a tint you cannot actually see. Diluting the
 * foreground colour instead lands around 1.2-1.4:1, which is roughly the
 * strength of the highlight in the app this screen is modelled on.
 *
 * 15% is the ceiling, not a guess. Past it the tint starts eating the contrast
 * of the coloured status text sitting on top of it, and that text is the part
 * carrying the actual information.
 */
const ROW_TONE_CLASSES = {
  warn: "bg-status-warn/15",
  danger: "bg-status-offline/15",
  success: "bg-status-online/15",
  info: "bg-accent/10",
};

/**
 * Selection and keyboard-focus row backgrounds.
 *
 * These follow the same rule as ROW_TONE_CLASSES above, and for the same
 * reason: they previously used `accent-muted`, which is the *badge fill*
 * token, not a foreground. `--accent-muted-bg` is #eff6ff on the light
 * themes, so `bg-accent-muted/40` over a white card composited to
 * rgb(249,251,255) against rgb(255,255,255) — about 1.02:1, i.e. a selected
 * row was indistinguishable from an unselected one. The dark themes were no
 * better: #0a2240 at 40% over card #112035 lands on rgb(14,33,57) against
 * rgb(17,32,53). Diluting the accent *foreground* instead is visible on
 * every theme, because that token is by definition a colour meant to be
 * seen against the card.
 *
 * Selection stays at the same 15% ceiling the tones use — past it the tint
 * starts eating the contrast of the coloured status text sitting on the row,
 * and on a selected row that text is still the part carrying the meaning.
 * Focus sits below selection so the two remain tellable apart when a row is
 * both, and above `hover:bg-canvas/60` so arrowing through a table reads as
 * a stronger state than merely mousing over it.
 *
 * Focus is a `:focus-visible` variant rather than a class driven by the
 * `focusedIndex` state on purpose. Clicking a row focuses it, so a
 * state-driven tint stayed painted on the last row you touched — after
 * deselecting, that leftover tint read as "this row is still somehow
 * special" when nothing was selected at all. `:focus-visible` is exactly the
 * distinction wanted: the browser paints it for keyboard navigation and
 * withholds it for pointer clicks. `focusedIndex` is still tracked, because
 * it decides which row the Arrow keys resume from — it just no longer
 * decides what the row looks like.
 */
const ROW_SELECTED_CLASS = "bg-accent/15";
const ROW_FOCUS_VISIBLE_CLASS = "focus-visible:bg-accent/8";

/**
 * Header cell padding, one step roomier than the body cell padding it sits
 * above (`py-2.5` / `py-1.5`).
 *
 * The header carries a single line of short uppercase labels, while a body
 * cell carries wrapped content, so equal padding does not produce equal
 * height — it produces a header *shorter* than the rows beneath it, which
 * reads as just another row. Giving the header the extra step makes it the
 * tallest band in the table, which is what separates it from the data
 * without needing a heavier rule or a louder background.
 */
const HEADER_PAD = "py-3";
const HEADER_PAD_DENSE = "py-2.5";

function DataTable({
  columns = [],
  data = [],
  rowKey = "id",
  selectable = false,
  selectedKeys = [],
  onSelectedKeysChange,
  onRowClick,
  onCellClick,
  loading = false,
  error = null,
  onRetry,
  emptyMessage = "No data available in table",
  onClearFilters,
  stickyHeader = true,
  striped = false,
  // Shrinks both body cell and header cell padding (and body font size) for
  // a more compact table — the header shrinks by less than the body, since
  // it carries no row-to-row repetition to save space on and staying a
  // little taller keeps it reading as a header rather than just another row.
  dense = false,
  className,
  pagination,
  searchable = false,
  searchValue = "",
  onSearchChange,
  serverSide = false,
  truncateText = true,
  textWrap = "truncate",
  columnVisibility = {},
  // Table-wide default alignment for both header labels and body cells.
  // "auto" leaves a column unaligned (left) unless its own `align` says
  // otherwise. Pass "center" or "right" to force every column that doesn't
  // set its own `align` — header AND body cell move together, since a
  // centred heading over left-aligned content floats away from the column
  // it names. A column that sets its own `align` always keeps it, so e.g. an
  // amount column can stay right-aligned under a table forced to "center".
  headerAlign = "auto",
  // Tints a whole row by meaning: return "warn", "danger", "success", "info"
  // or null/undefined for each row. Used for states that belong to the record
  // rather than to one cell — a licence about to expire is a property of the
  // licence, so highlighting only its status cell would bury it in whichever
  // column happens to be scrolled into view.
  getRowTone,
  resizableColumns = true,
  onColumnResize,
  contextMenuItems = [],
  onContextMenu,
  // Controlled sorting (e.g. for server-side sort via useServerDataBinding's
  // `tableProps`). When `onSortChange` is provided, DataTable stops tracking
  // sort state internally and simply reflects `sortKey`/`sortDirection` and
  // calls `onSortChange(key, direction)` on header clicks — the caller owns
  // the actual sorting (or refetch). Omit all three to keep the previous
  // uncontrolled, client-side sort behavior.
  sortKey: controlledSortKey,
  sortDirection: controlledSortDirection,
  onSortChange,
  // Bounds the table to the viewport so only the row area scrolls, no matter
  // what height chain the consuming app's CSS provides above this component.
  // Pass `maxHeight` for a fixed size (e.g. inside a modal), or `autoHeight={false}`
  // to fall back to pure flexbox sizing (requires the parent chain to supply a
  // bounded height via `flex` + `min-h-0`, as this component itself already does).
  autoHeight = true,
  maxHeight,
  minHeight = 240,
  heightOffset = 16,
}) {
  const [colWidths, setColWidths] = React.useState({});
  const [internalSortConfig, setInternalSortConfig] = React.useState({ key: null, direction: "asc" });
  const isSortControlled = typeof onSortChange === "function";
  // Memoized so `sortConfig` keeps a stable reference across renders when the
  // underlying sort key/direction haven't actually changed. Without this, a
  // fresh object literal was built on every render whenever sorting is
  // controlled (e.g. via ServerDataTable / useServerDataBinding's tableProps),
  // which silently defeated the `processedData` useMemo below — it depends on
  // `sortConfig`, so it was recomputing (re-filtering, re-sorting) on every
  // single render regardless of whether data/search/sort actually changed.
  const controlledSortConfig = React.useMemo(
    () => ({ key: controlledSortKey ?? null, direction: controlledSortDirection ?? "asc" }),
    [controlledSortKey, controlledSortDirection]
  );
  const sortConfig = isSortControlled ? controlledSortConfig : internalSortConfig;
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const [contextMenuPos, setContextMenuPos] = React.useState(null);
  const [contextMenuRow, setContextMenuRow] = React.useState(null);
  const [autoSizedHeight, setAutoSizedHeight] = React.useState(null);
  const [containerWidth, setContainerWidth] = React.useState(0);

  const outerRef = React.useRef(null);
  const tableContainerRef = React.useRef(null);
  const resizingRef = React.useRef(null);
  const rowRefs = React.useRef(new Map());

  const selectedSet = React.useMemo(() => new Set(selectedKeys), [selectedKeys]);

  const cols = React.useMemo(() => {
    return columns.filter((col) => columnVisibility[col.key] !== false);
  }, [columns, columnVisibility]);

  // Every column resolves to one pixel width, used for the header, the cells
  // and the table's own minimum. Keeping it in a single map is what stops the
  // three from drifting apart — previously the header, the cells and the width
  // total each ran their own `col.width || col.minWidth || 120` fallback, so a
  // column could be measured one way and rendered another.
  //
  // A width dragged out by hand wins over the scale: it is a deliberate
  // override, and snapping it would make the drag handle stutter.
  //
  // When the columns' natural widths don't reach the edge of the visible
  // table, the leftover space used to just sit there as blank background past
  // the last column — directly above text that was being cut off with an
  // ellipsis for no real reason, since the room for it was right there. Any
  // column nobody has dragged by hand grows to soak up that leftover space,
  // each in proportion to its own base width, so a wide (`xl`) text column
  // absorbs more of the extra room than a narrow (`xs`) flag column sitting
  // next to it. A column that *has* been dragged is a deliberate pixel value
  // and is left exactly as set.
  const columnWidths = React.useMemo(() => {
    const base = new Map();
    for (const col of cols) {
      base.set(col.key, colWidths[col.key] ?? resolveColumnWidth(col, DEFAULT_COLUMN_WIDTH));
    }

    const flexibleCols = cols.filter((col) => colWidths[col.key] == null);
    const flexibleTotal = flexibleCols.reduce((sum, col) => sum + base.get(col.key), 0);
    const fixedTotal = (selectable ? 48 : 0) + (base.size ? [...base.values()].reduce((a, b) => a + b, 0) - flexibleTotal : 0);
    const slack = containerWidth - fixedTotal - flexibleTotal;

    if (slack > 0 && flexibleTotal > 0) {
      for (const col of flexibleCols) {
        const share = base.get(col.key) / flexibleTotal;
        base.set(col.key, Math.round(base.get(col.key) + slack * share));
      }
    }

    return base;
  }, [cols, colWidths, selectable, containerWidth]);

  const totalColWidth = React.useMemo(() => {
    let total = selectable ? 48 : 0;
    for (const col of cols) total += columnWidths.get(col.key) ?? DEFAULT_COLUMN_WIDTH;
    return total;
  }, [cols, columnWidths, selectable]);

  // Resolved once per render rather than per cell, since it is the same answer
  // for every row in a column.
  //
  // Right-aligned is where amounts and counts live, so it also switches on
  // tabular figures — without it every digit borrows its neighbour's width
  // (a "1" narrower than a "8"), and a right-aligned column of money stops
  // lining up on its own decimal points, which defeats the point of aligning
  // it right in the first place.
  // A column's own `align` always wins. Failing that, a table-level
  // `headerAlign` forced to "center"/"right" is the fallback for BOTH the
  // header and the body cell — a centred heading over left-aligned data
  // floats away from the column it names, so forcing one has to force the
  // other. "auto" (the default) and "left" leave both unaligned, so a column
  // with no explicit `align` gets a header that sits directly over its own
  // content instead of floating to the middle of a wider column.
  function resolvedAlign(col) {
    if (col.align) return col.align;
    if (headerAlign === "center" || headerAlign === "right") return headerAlign;
    return undefined;
  }

  function columnAlignClass(col) {
    const align = resolvedAlign(col);
    if (align === "right") return "text-right tabular-nums";
    if (align === "center") return "text-center";
    return undefined;
  }

  function headerAlignClass(col) {
    return columnAlignClass(col);
  }

  function getKey(row, index) {
    if (typeof rowKey === "function") return rowKey(row, index);
    return row[rowKey] ?? index;
  }

  function handleSelectionChange(newKeys) {
    onSelectedKeysChange?.(newKeys);
  }

  function toggleRow(key, isMulti = false) {
    if (!selectable) return;
    let next;
    if (isMulti) {
      next = selectedSet.has(key)
        ? selectedKeys.filter((k) => k !== key)
        : [...selectedKeys, key];
    } else {
      next = selectedSet.has(key) ? [] : [key];
    }
    handleSelectionChange(next);
  }

  function toggleAll() {
    if (!selectable) return;
    const allKeys = processedData.map((r, idx) => getKey(r, idx));
    const isAllSelected = allKeys.length > 0 && allKeys.every((k) => selectedSet.has(k));
    handleSelectionChange(isAllSelected ? [] : allKeys);
  }

  function handleRowSelect(row, index, e) {
    if (!selectable) return;
    const key = getKey(row, index);
    const isMulti = e.shiftKey || e.ctrlKey || e.metaKey;
    toggleRow(key, isMulti);
  }

  function toggleSort(column) {
    if (!column.sortable) return;
    let direction = "asc";
    if (sortConfig.key === column.key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    if (isSortControlled) {
      onSortChange(column.key, direction);
    } else {
      setInternalSortConfig({ key: column.key, direction });
    }
  }

  const processedData = React.useMemo(() => {
    if (serverSide) return data;
    let result = [...data];

    if (searchable && searchValue.trim()) {
      const q = searchValue.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((val) => String(val ?? "").toLowerCase().includes(q))
      );
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA == null) return 1;
        if (valB == null) return -1;
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchable, searchValue, sortConfig, serverSide]);

  // Self-bound sizing: compute how much viewport space is available below this
  // component's own top edge and use that as an explicit height. This makes the
  // table scrollable-in-place (sticky header, fixed exterior) out of the box for
  // any consumer, instead of silently depending on every ancestor element
  // providing a correct `flex` + `min-h-0` chain down from the page root.
  React.useLayoutEffect(() => {
    if (!autoHeight || maxHeight != null) return undefined;
    const el = outerRef.current;
    if (!el || typeof window === "undefined") return undefined;

    function recalc() {
      const rect = el.getBoundingClientRect();
      const available = window.innerHeight - rect.top - heightOffset;
      setAutoSizedHeight(Math.max(minHeight, Math.floor(available)));
    }

    recalc();

    window.addEventListener("resize", recalc);
    window.addEventListener("scroll", recalc, true);

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(recalc);
      resizeObserver.observe(document.body);
    }

    return () => {
      window.removeEventListener("resize", recalc);
      window.removeEventListener("scroll", recalc, true);
      resizeObserver?.disconnect();
    };
  }, [autoHeight, maxHeight, minHeight, heightOffset, loading, error, processedData.length]);

  // Feeds `columnWidths` above: how much horizontal room the scroll region
  // actually has, so flexible columns know how much slack there is to grow
  // into. `clientWidth` rather than the table's own width — the table is the
  // thing being sized, so measuring it here would be circular.
  React.useLayoutEffect(() => {
    const el = tableContainerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width;
      if (width != null) setContainerWidth(Math.floor(width));
    });
    observer.observe(el);
    setContainerWidth(el.clientWidth);

    return () => observer.disconnect();
  }, []);

  const resolvedHeight = maxHeight ?? (autoHeight ? autoSizedHeight ?? undefined : undefined);

  function handleResizeMouseDown(colKey, e) {
    if (!resizableColumns) return;
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    // Start from the width actually on screen. Starting from a constant made
    // the first drag on a wide column jump to 120px before it began tracking.
    const currentWidth = columnWidths.get(colKey) ?? DEFAULT_COLUMN_WIDTH;

    resizingRef.current = { colKey, startX, currentWidth };

    function onMouseMove(moveEvent) {
      if (!resizingRef.current) return;
      const delta = moveEvent.clientX - resizingRef.current.startX;
      const newW = Math.max(60, resizingRef.current.currentWidth + delta);
      setColWidths((prev) => ({ ...prev, [colKey]: newW }));
      onColumnResize?.(colKey, newW);
    }

    function onMouseUp() {
      resizingRef.current = null;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  function handleRowContextMenu(row, e) {
    if (contextMenuItems.length === 0 && !onContextMenu) return;
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setContextMenuRow(row);
    onContextMenu?.(row, e);
  }

  const closeContextMenu = React.useCallback(() => {
    setContextMenuPos(null);
    setContextMenuRow(null);
  }, []);

  function focusRow(index) {
    if (index < 0 || index >= processedData.length) return;

    setFocusedIndex(index);
    requestAnimationFrame(() => rowRefs.current.get(index)?.focus());
  }

  function isInteractiveElement(target) {
    return target instanceof Element && Boolean(
      target.closest("button, a, input, select, textarea, [contenteditable='true'], [role='button'], [role='checkbox'], [role='link'], [role='menuitem']")
    );
  }

  function handleTableKeyDown(e) {
    // Keep native keyboard behavior for controls rendered inside a cell. Without
    // this guard, arrow keys and Space on a checkbox/button were also handled as
    // table-navigation keys by the outer table container.
    if (isInteractiveElement(e.target)) return;

    if (processedData.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = Math.min(processedData.length - 1, focusedIndex + 1);
      focusRow(nextIndex);
      if (e.shiftKey && selectable) {
        const targetRow = processedData[nextIndex];
        toggleRow(getKey(targetRow, nextIndex), true);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const nextIndex = Math.max(0, focusedIndex - 1);
      focusRow(nextIndex);
      if (e.shiftKey && selectable) {
        const targetRow = processedData[nextIndex];
        toggleRow(getKey(targetRow, nextIndex), true);
      }
    } else if (e.key === "ArrowLeft" || (e.altKey && e.key === "ArrowLeft")) {
      if (tableContainerRef.current) {
        e.preventDefault();
        tableContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
      }
    } else if (e.key === "ArrowRight" || (e.altKey && e.key === "ArrowRight")) {
      if (tableContainerRef.current) {
        e.preventDefault();
        tableContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
      }
    } else if (e.key === "Home") {
      e.preventDefault();
      focusRow(0);
      if (e.shiftKey && selectable) {
        const targetRow = processedData[0];
        toggleRow(getKey(targetRow, 0), true);
      }
    } else if (e.key === "End") {
      e.preventDefault();
      const lastIdx = processedData.length - 1;
      focusRow(lastIdx);
      if (e.shiftKey && selectable) {
        const targetRow = processedData[lastIdx];
        toggleRow(getKey(targetRow, lastIdx), true);
      }
    } else if (e.key === "Spacebar" || e.key === " ") {
      if (focusedIndex >= 0 && focusedIndex < processedData.length) {
        e.preventDefault();
        const row = processedData[focusedIndex];
        handleRowSelect(row, focusedIndex, e);
      }
    } else if (e.key === "Enter") {
      if (focusedIndex >= 0 && focusedIndex < processedData.length) {
        e.preventDefault();
        const row = processedData[focusedIndex];
        if (onRowClick) {
          onRowClick(row);
        } else if (selectable) {
          handleRowSelect(row, focusedIndex, e);
        }
      }
    } else if (e.key === "Escape") {
      setFocusedIndex(-1);
      setContextMenuPos(null);
      handleSelectionChange([]);
      tableContainerRef.current?.focus();
    }
  }

  const handleWheel = (e) => {
    if (e.shiftKey && e.deltaY && tableContainerRef.current) {
      tableContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  const allSelected = processedData.length > 0 && processedData.every((r, idx) => selectedSet.has(getKey(r, idx)));
  const someSelected = processedData.some((r, idx) => selectedSet.has(getKey(r, idx)));

  // A column's own `truncate` (set e.g. by MobileTableWrapper's column
  // normalizer for long-text fields) wins when explicitly set; otherwise
  // fall back to the table-level `truncateText`/`textWrap` props.
  function shouldWrapCell(col) {
    if (typeof col.truncate === "boolean") return !col.truncate;
    return !truncateText || textWrap === "wrap";
  }

  return (
    <div
      ref={outerRef}
      style={resolvedHeight != null ? { height: resolvedHeight, maxHeight: resolvedHeight } : undefined}
      className={cn("rounded-surface border border-card-border bg-card flex flex-col flex-1 min-h-0 w-full overflow-hidden relative shadow-raised", className)}
    >
      <div
        ref={tableContainerRef}
        tabIndex={0}
        role="region"
        aria-label="Data table. Use the Up and Down arrow keys to move between rows."
        onKeyDown={handleTableKeyDown}
        onWheel={handleWheel}
        className="overflow-auto flex-1 min-h-0 w-full focus:outline-none focus:ring-2 focus:ring-accent/40 [-webkit-overflow-scrolling:touch] [touch-action:pan-x_pan-y] overscroll-contain"
      >
        <table style={{ minWidth: `${totalColWidth}px` }} className="w-full text-left text-body table-fixed">
          {/* `bg-canvas` rather than `bg-card`: a header that shares the body's
              exact surface colour reads as flat, with only a hairline telling
              you where the labels end and the data begins. Canvas sits one
              step off card in every theme (checked: all four keep it close
              but distinct), so the header reads as its own bar without
              introducing a colour the rest of the system doesn't already use. */}
          <thead className={cn(stickyHeader && "sticky top-0 z-20 bg-canvas border-b border-card-border shadow-raised")}>
            <tr className="border-b border-card-border">
              {selectable && (
                <th
                  className={cn(
                    "w-12 px-3 bg-canvas cursor-pointer hover:bg-accent-muted/30 transition-colors shrink-0",
                    dense ? HEADER_PAD_DENSE : HEADER_PAD
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAll();
                  }}
                  title="Click to select all"
                >
                  {/* Only `min-w`, deliberately: a `min-h` here used to make a
                      selectable table's header taller than a non-selectable
                      one's, since the box it reserved exceeded the height of
                      the header labels beside it. The whole `th` is the click
                      target anyway, so the width is what needs protecting.

                      The `stopPropagation` is the same fix as the body cell's:
                      the label forwards its click to the input, so both
                      bubbled to the `th` and select-all toggled twice — i.e.
                      never appeared to do anything. */}
                  <div
                    className="flex h-full w-full items-center justify-center min-w-[24px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <RowSelectCheckbox
                      checked={!!allSelected}
                      indeterminate={!allSelected && someSelected}
                      onChange={toggleAll}
                      label="Select all rows"
                    />
                  </div>
                </th>
              )}
              {cols.map((col) => (
                <th
                  key={col.key}
                  style={{
                    width: columnWidths.get(col.key),
                    minWidth: columnWidths.get(col.key),
                  }}
                  className={cn(
                    "px-3 font-semibold text-ink-secondary text-body-sm uppercase tracking-wider relative group bg-canvas whitespace-nowrap select-none",
                    dense ? HEADER_PAD_DENSE : HEADER_PAD,
                    headerAlignClass(col)
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col)}
                      className="inline-flex items-center gap-1 hover:text-ink-primary cursor-pointer select-none whitespace-nowrap"
                    >
                      <span>{col.header || col.label || col.key}</span>
                      <span className="text-ink-muted">
                        {sortConfig.key === col.key ? (
                          sortConfig.direction === "asc" ? (
                            <ChevronUp size={14} className="text-accent" />
                          ) : (
                            <ChevronDown size={14} className="text-accent" />
                          )
                        ) : (
                          <ChevronsUpDown size={13} className="opacity-40" />
                        )}
                      </span>
                    </button>
                  ) : (
                    <span>{col.header || col.label || col.key}</span>
                  )}
                  {resizableColumns && (
                    // A separator rather than a bare div: `aria-label` is not
                    // permitted on a generic element, so the name was being
                    // discarded and the handle announced as nothing at all.
                    //
                    // Focusable and arrow-operable for the same reason it is
                    // labelled — resizing a column was previously reachable
                    // only by dragging with a pointer.
                    <div
                      role="separator"
                      aria-orientation="vertical"
                      aria-label={`Resize column ${col.header || col.label || col.key}`}
                      tabIndex={0}
                      // A focusable separator is a widget, and a widget has to
                      // report its value — here, the width it is setting. Without
                      // it the handle announces no position, so there is no way
                      // to tell whether an arrow press did anything.
                      aria-valuenow={columnWidths.get(col.key) ?? DEFAULT_COLUMN_WIDTH}
                      aria-valuemin={60}
                      onMouseDown={(e) => handleResizeMouseDown(col.key, e)}
                      onKeyDown={(e) => {
                        const step = e.shiftKey ? 32 : 8;
                        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
                        e.preventDefault();
                        const current = columnWidths.get(col.key) ?? DEFAULT_COLUMN_WIDTH;
                        const next = Math.max(60, current + (e.key === "ArrowRight" ? step : -step));
                        setColWidths((prev) => ({ ...prev, [col.key]: next }));
                        onColumnResize?.(col.key, next);
                      }}
                      className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-accent/60 active:bg-accent focus-visible:bg-accent focus-visible:opacity-100 focus:outline-none select-none z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={cols.length + (selectable ? 1 : 0)} className="py-12 px-4 text-center">
                  <Loader label="Fetching the records..." />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={cols.length + (selectable ? 1 : 0)} className="py-8 text-center">
                  <div className="inline-flex flex-col items-center justify-center gap-2 p-4 rounded-surface bg-status-offline-bg/30 border border-status-offline/30 text-status-offline max-w-md mx-auto">
                    <p className="text-body-sm font-semibold">{typeof error === "string" ? error : error.message || "Failed to load data."}</p>
                    {onRetry && (
                      <button
                        type="button"
                        onClick={onRetry}
                        className="px-3 py-1 text-body-sm font-medium bg-status-offline text-white rounded-control hover:opacity-90 transition-opacity cursor-pointer shadow-raised"
                      >
                        Retry Request
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : processedData.length === 0 ? (
              <tr>
                <td colSpan={cols.length + (selectable ? 1 : 0)} className="py-12 px-4 text-center">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-pill bg-accent-muted/40 text-accent mb-3">
                      <SearchX size={24} />
                    </div>
                    <h4 className="font-secondary text-body font-semibold text-ink-primary mb-1">No Records Found</h4>
                    <p className="text-body-sm text-ink-muted max-w-sm mb-4">{emptyMessage}</p>
                    {onClearFilters && (
                      <Button variant="secondary" size="sm" onClick={onClearFilters}>
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              processedData.map((row, index) => {
                const key = getKey(row, index);
                const isSelected = selectedSet.has(key);
                const isFocused = focusedIndex === index;

                // Exactly one *base* background class is allowed onto the row.
                // Tailwind resolves competing utilities by their order in the
                // generated stylesheet, not by their order in the class
                // attribute, so listing a tint and a selection colour together
                // would pick a winner more or less at random. Selection
                // outranks the tint: it answers "what am I doing right now",
                // which has to survive whatever the row's own state is.
                // Focus is exempt from this rule because it is a
                // `:focus-visible` variant, and Tailwind emits variants after
                // the base utilities — so it layers over a tint predictably
                // instead of racing it.
                const rowTone = getRowTone?.(row, index);
                const toneClass = !isSelected ? ROW_TONE_CLASSES[rowTone] : undefined;

                return (
                  <tr
                    key={key}
                    ref={(node) => {
                      if (node) rowRefs.current.set(index, node);
                      else rowRefs.current.delete(index);
                    }}
                    tabIndex={isFocused ? 0 : -1}
                    data-focused={isFocused ? "true" : "false"}
                    aria-selected={selectable ? isSelected : undefined}
                    onFocus={() => setFocusedIndex(index)}
                    onClick={(e) => {
                      setFocusedIndex(index);
                      if (e.shiftKey || e.ctrlKey || e.metaKey) {
                        if (selectable) {
                          handleRowSelect(row, index, e);
                        }
                      } else if (onRowClick) {
                        onRowClick(row);
                      } else if (selectable) {
                        handleRowSelect(row, index, e);
                      }
                    }}
                    onContextMenu={(e) => handleRowContextMenu(row, e)}
                    className={cn(
                      "border-b border-card-border last:border-0 transition-colors relative",
                      (onRowClick || selectable || onContextMenu || contextMenuItems.length > 0) && "cursor-pointer",
                      striped && index % 2 === 1 && !isSelected && !toneClass && "bg-canvas/40",
                      toneClass,
                      // A plain, unstated `:hover` rather than a JS-tracked one —
                      // mousing across the table to read a row should not also
                      // relocate where Arrow keys resume from, which is what
                      // sharing `focusedIndex` with hover used to do. Skipped on
                      // a toned row so a hover pass never washes out the colour
                      // that's the whole point of that row.
                      !isSelected && !toneClass && "hover:bg-canvas/60",
                      isSelected && `${ROW_SELECTED_CLASS} border-l-accent`,
                      !isSelected && ROW_FOCUS_VISIBLE_CLASS
                    )}
                  >
                    {selectable && (
                      <td
                        className={cn(
                          "w-12 px-3 cursor-pointer hover:bg-accent-muted/40 transition-colors text-center align-middle relative",
                          dense ? "py-1.5" : "py-2.5"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Additive, unlike a row click: a checkbox column
                          // exists precisely so several rows can be picked
                          // without holding a modifier, and replacing the
                          // selection would silently clear the boxes the user
                          // had already ticked.
                          toggleRow(key, true);
                        }}
                        title="Click to select row"
                      >
                        {isSelected && <span className="absolute left-0 top-0 bottom-0 w-1 bg-accent z-10 pointer-events-none" aria-hidden="true" />}
                        {/* The checkbox's own clicks must not also reach the
                            cell. `Checkbox` renders a real <input> inside a
                            <label htmlFor>, so the browser forwards the label
                            click on to the input — both bubble, the cell
                            handler ran twice, and the row toggled straight
                            back off. Clicking the box did nothing at all.
                            Selection is driven from `onChange` here, which
                            fires exactly once per activation and also covers
                            keyboard Space on the focused input. */}
                        <div
                          className={cn("flex h-full w-full items-center justify-center", dense ? "min-h-[24px] min-w-[24px]" : "min-h-[36px] min-w-[36px]")}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <RowSelectCheckbox
                            checked={isSelected}
                            onChange={() => toggleRow(key, true)}
                          />
                        </div>
                      </td>
                    )}
                    {cols.map((col, colIdx) => {
                      const rawContent = col.render ? col.render(row) : row[col.key];
                      const textString = typeof rawContent === "string" || typeof rawContent === "number" ? String(rawContent) : "";

                      const isLinkable = col.isLink || col.href || typeof col.onCellClick === "function";

                      const handleCellClick = (e) => {
                        if (col.onCellClick) {
                          e.stopPropagation();
                          col.onCellClick(row, col.key, e);
                        } else if (col.href) {
                          e.stopPropagation();
                          const url = typeof col.href === "function" ? col.href(row) : col.href;
                          if (col.target === "_blank") {
                            window.open(url, "_blank");
                          } else {
                            window.location.href = url;
                          }
                        }
                      };

                      // Plain (non-render) text/number content that's being CSS-truncated at
                      // the cell level (see shouldWrapCell above) gets wrapped in TruncatedText
                      // so the full value is still reachable via hover instead of silently
                      // disappearing behind the "...". Columns with a custom `render` are left
                      // untouched — they own their own presentation (and may already wrap in
                      // TruncatedText themselves).
                      const canAutoTruncate = !col.render && !shouldWrapCell(col) && textString !== "";
                      const displayContent = canAutoTruncate ? (
                        <TruncatedText text={textString} className="text-inherit" />
                      ) : (
                        rawContent
                      );

                      const renderedContent = isLinkable && !col.render ? (
                        <a
                          href={typeof col.href === "function" ? col.href(row) : col.href || "#"}
                          onClick={handleCellClick}
                          className="text-accent font-medium hover:underline hover:text-accent-light transition-colors cursor-pointer"
                        >
                          {displayContent}
                        </a>
                      ) : displayContent;

                      // Fix: Never append a duplicate CopyButton if col.render is already handling cell rendering
                      const isCopyable = col.copyable === true || (col.isCopyable === true) || (!col.render && col.key === "key" && col.copyable !== false);
                      const textToCopy = typeof row[col.key] === "string" || typeof row[col.key] === "number" ? String(row[col.key]) : textString;

                      const contentWithCopy = isCopyable ? (
                        <div className="flex items-center justify-between gap-2 w-full min-w-0">
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <TruncatedText
                              text={textString}
                              maxLength={col.maxLength}
                              className="font-mono text-body-sm text-ink-primary select-text"
                            >
                              {renderedContent}
                            </TruncatedText>
                          </div>
                          <CopyButton
                            text={textToCopy}
                            tooltipText={`Copy ${col.header || col.label || "key"}`}
                            className="shrink-0"
                          />
                        </div>
                      ) : (
                        renderedContent
                      );

                      return (
                        <td
                          key={col.key}
                          style={{
                            width: columnWidths.get(col.key),
                            minWidth: columnWidths.get(col.key),
                          }}
                          className={cn(
                            "px-3 text-ink-primary align-middle",
                            !selectable && colIdx === 0 && "relative",
                            dense ? "py-1.5 text-body-sm" : "py-2.5",
                            shouldWrapCell(col)
                              ? "whitespace-normal break-words"
                              : "overflow-hidden text-ellipsis whitespace-nowrap",
                            columnAlignClass(col),
                            col.className
                          )}
                        >
                          {isSelected && !selectable && colIdx === 0 && <span className="absolute left-0 top-0 bottom-0 w-1 bg-accent z-10 pointer-events-none" aria-hidden="true" />}
                          {contentWithCopy}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ContextMenu
        open={Boolean(contextMenuPos)}
        x={contextMenuPos?.x ?? 0}
        y={contextMenuPos?.y ?? 0}
        items={contextMenuItems}
        payload={contextMenuRow}
        onClose={closeContextMenu}
      />
    </div>
  );
}

export { DataTable };