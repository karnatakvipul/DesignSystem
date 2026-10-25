import * as React from "react";
import { Search, SlidersHorizontal, ArrowUpDown, X, LayoutGrid, Table as TableIcon } from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import { cn } from "../../lib/cn";

/**
 * The one mobile toolbar every table screen wears.
 *
 * Screens had each grown their own: one hid search and filter entirely, one
 * hand-rolled an inline selection bar with its own button sizes and colours,
 * the rest rendered a bare view-toggle beside pagination. Same job on every
 * screen, four different shapes — so a phone user relearned the controls per
 * page, and two screens simply had no way to search or filter at all.
 *
 * The layout is the standard one for a data table on a phone:
 *
 *   [ search................ ] [filter] [sort] [view]
 *   [            pagination            ]
 *
 * and, when rows are selected, the first row is *replaced* by a contextual
 * action bar (Material's "contextual action bar", iOS's edit-mode toolbar):
 *
 *   [x] 2 selected                     [edit] [delete]
 *
 * Replacing rather than stacking is the point — the actions that apply to a
 * selection are the only ones that matter while one exists, and a phone has
 * no room to show both sets at once.
 *
 * Every control is optional. A screen with nothing to sort by passes no
 * `sortOptions` and gets no sort button; the row simply closes up.
 */
function MobileTableToolbar({
  // Search
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search Data",
  hideSearch = false,

  // Filter — `filterOptions` is the sheet's content (e.g. `useResourceFilters`'s
  // `mobileFilterOptions`); the button only appears when there is something to show.
  filterOptions,
  activeFilterCount = 0,

  // Sort
  sortOptions,
  currentSort,
  onSortSelect,

  // Card/table view. Pair with `MobileTableWrapper`'s `viewMode`/
  // `onViewModeChange` so this toggle drives what it renders.
  viewMode,
  onViewModeChange,

  // Selection — when `selectedCount > 0` these replace the controls above.
  selectedCount = 0,
  onClearSelection,
  selectionActions = [],

  // Always visible, regardless of selection — a page-level action (Reload,
  // Download) that isn't scoped to a row has nowhere else on a phone to live,
  // since the desktop equivalent is a permanent button beside the table
  // rather than something a selection reveals. Rendered alongside filter/
  // sort/view, in the same icon-button style.
  toolbarActions = [],

  // Rendered on its own row underneath, so it keeps full width on a phone.
  pagination,

  className,
}) {
  const [filterSheetOpen, setFilterSheetOpen] = React.useState(false);
  const [sortSheetOpen, setSortSheetOpen] = React.useState(false);

  const showSearch = !hideSearch && typeof onSearchChange === "function";
  const showFilter = Boolean(filterOptions);
  const showSort = Boolean(sortOptions && onSortSelect);
  const showView = typeof onViewModeChange === "function";
  const inSelectionMode = selectedCount > 0;

  // One shape for every icon button in this bar, so the filter/sort/view
  // trio can't drift apart the way the per-screen copies did.
  //
  // Colour is deliberately *not* in here. `cn` is plain `clsx` with no
  // tailwind-merge, so a conflicting utility appended on top does not replace
  // the base one — both land in `class` and the stylesheet's own order picks
  // the winner. Appending `bg-accent text-white` over a base `bg-input
  // text-ink-muted` therefore took the white text but kept the input
  // background: a white icon on a near-white surface, 1.05:1, invisible.
  // Idle and active are whole sets instead, and only ever one is applied.
  const iconButtonBase =
    "flex h-control-lg w-control-lg items-center justify-center rounded-surface border transition-colors shrink-0 cursor-pointer";
  const iconButtonIdle =
    "border-card-border bg-input text-ink-muted hover:bg-accent-muted hover:text-accent active:bg-accent-muted/70";
  const iconButtonActive = "border-accent bg-accent text-white hover:bg-accent-light hover:border-accent-light";

  return (
    <div className={cn("flex flex-col gap-2 w-full min-w-0", className)}>
      {inSelectionMode ? (
        <div className="flex items-center justify-between gap-2 w-full min-w-0 rounded-surface border border-accent/30 bg-accent-muted/30 px-2.5 py-1.5 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onClearSelection}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control text-ink-muted transition-colors cursor-pointer hover:bg-card/80 hover:text-ink-primary"
              aria-label="Clear selection"
            >
              <X size={15} />
            </button>
            <span className="truncate text-body-sm font-semibold text-accent">
              {selectedCount} selected
            </span>
          </div>

          {/* Scrolls rather than wraps or shrinks: a page with as many
              actions as its desktop toolbar (License's ten, say) cannot fit
              them at a fixed icon size in 375px, and every action staying
              reachable by a swipe matches what "the same actions as desktop"
              actually requires more than forcing them all on screen at once. */}
          <div className="flex items-center gap-1.5 min-w-0 overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {selectionActions
              .filter((action) => !action.requiresSingle || selectedCount === 1)
              .map((action) => (
                <button
                  key={action.key ?? action.label}
                  type="button"
                  onClick={action.onClick}
                  title={action.label}
                  aria-label={action.label}
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-control border transition-colors cursor-pointer",
                    action.danger
                      ? "border-status-offline/30 bg-status-offline/10 text-status-offline hover:bg-status-offline/20"
                      : "border-card-border bg-card text-ink-primary hover:border-accent hover:text-accent"
                  )}
                >
                  {action.icon}
                </button>
              ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 w-full min-w-0">
          {showSearch && (
            <div className="flex h-control-lg flex-1 min-w-0 items-center gap-2 rounded-surface border border-card-border bg-input px-3 focus-within:ring-2 focus-within:ring-accent/40">
              <Search size={16} className="shrink-0 text-ink-muted" />
              <input
                value={searchValue ?? ""}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="w-full min-w-0 bg-transparent text-body-sm text-ink-primary placeholder:text-ink-muted focus:outline-none"
              />
              {searchValue && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => onSearchChange("")}
                  className="flex h-control-md w-control-md shrink-0 items-center justify-center text-ink-muted hover:text-ink-primary cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {/* Pushes the controls right when there's no search field to do it. */}
          {!showSearch && <div className="flex-1 min-w-0" />}

          {showFilter && (
            <button
              type="button"
              onClick={() => setFilterSheetOpen(true)}
              className={cn(
                iconButtonBase,
                "relative",
                activeFilterCount > 0
                  ? "border-accent bg-accent-muted text-accent hover:bg-accent-muted/70"
                  : iconButtonIdle
              )}
              aria-label={activeFilterCount > 0 ? `Filters (${activeFilterCount} active)` : "Filters"}
            >
              <SlidersHorizontal size={18} />
              {activeFilterCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-pill bg-accent px-1 text-[10px] font-bold leading-none text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}

          {showSort && (
            <button
              type="button"
              onClick={() => setSortSheetOpen(true)}
              className={cn(iconButtonBase, iconButtonIdle)}
              aria-label="Sort"
            >
              <ArrowUpDown size={18} />
            </button>
          )}

          {showView && (
            <button
              type="button"
              onClick={() => onViewModeChange(viewMode === "card" ? "table" : "card")}
              className={cn(iconButtonBase, viewMode === "table" ? iconButtonActive : iconButtonIdle)}
              title={viewMode === "card" ? "Switch to Table View" : "Switch to Card View"}
              aria-label={viewMode === "card" ? "Switch to Table View" : "Switch to Card View"}
            >
              {viewMode === "card" ? <TableIcon size={18} /> : <LayoutGrid size={18} />}
            </button>
          )}

          {toolbarActions.map((action) => (
            <button
              key={action.key ?? action.label}
              type="button"
              onClick={action.onClick}
              className={cn(iconButtonBase, iconButtonIdle)}
              title={action.label}
              aria-label={action.label}
            >
              {action.icon}
            </button>
          ))}
        </div>
      )}

      {pagination && <div className="flex items-center justify-end min-w-0">{pagination}</div>}

      {showFilter && (
        <BottomSheet open={filterSheetOpen} onClose={() => setFilterSheetOpen(false)} title="Filter Records">
          {filterOptions}
        </BottomSheet>
      )}

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
    </div>
  );
}

export { MobileTableToolbar };
