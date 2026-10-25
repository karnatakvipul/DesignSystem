import * as React from "react";
import { MoreVertical, ChevronDown, ChevronUp, ExternalLink, SearchX, Check } from "lucide-react";
import { cn } from "../../lib/cn";
import { BottomSheet } from "./BottomSheet";
import { TruncatedText } from "./TruncatedText";
import { CopyButton } from "./CopyButton";
import { Button } from "./Button";
import { Loader } from "./Loader";

/** How long a finger must rest before a press counts as "select this row". */
const LONG_PRESS_MS = 380;

/**
 * How far a finger may drift and still count as holding still.
 *
 * A flick and a hold are the same gesture until the finger moves, so without a
 * slop threshold the press timer fires part-way through a scroll and the list
 * selects whatever row happened to be under the thumb. 10px is the usual
 * platform figure — below the tremor of a resting finger, well under a
 * deliberate drag.
 */
const MOVE_SLOP_PX = 10;

function triggerHaptic(duration = 25) {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(duration);
    } catch {
      // Haptics unavailable or blocked
    }
  }
}

/**
 * Mobile-only progressive disclosure card list with full touch linkability and smooth 60 FPS scrolling.
 * - Simple Tap: Expands/collapses card details or opens row link.
 * - Linkable Fields (Account, Name, Site): Fully touchable with theme-aware link styling & haptics.
 * - Long Press (380ms): Vibrates and selects the card.
 * - 3-Dots Action Menu: Opens in a clean Mobile Bottom Sheet with 100% visible action items.
 */
function MobileCardList({
  data = [],
  rowKey,
  columns = [],
  primaryFields = [],
  secondaryFields = [],
  actionMenuItems = [],
  onRowClick,
  emptyMessage = "No records found.",
  onClearFilters,
  loading,
  error,
  onRetry,
  loadingMore,
  onLoadMore,
  hasMore,
  selectable = false,
  selectionMode = "multiple",
  selectedKeys = [],
  onSelectedKeysChange,
  bulkActions = [],
  className,
}) {
  const [expandedId, setExpandedId] = React.useState(null);
  const [menuOpenId, setMenuOpenId] = React.useState(null);
  const containerRef = React.useRef(null);
  const touchTimerRef = React.useRef(null);
  const touchStartRef = React.useRef(null);
  const isLongPressRef = React.useRef(false);

  const selectOne = selectionMode === "single";

  /**
   * Does a plain tap select, rather than open or expand?
   *
   * Single-select says yes always — tapping the thing you want *is* the
   * gesture, and making someone hold for 380ms to pick one row is not how any
   * mobile list works. Multi-select says yes only once a row is already
   * selected: the first pick arms selection mode with a long press, and from
   * then on tapping adds to it. Without that second rule the only way to pick a
   * second row is another 380ms hold, which is what makes multi-select on a
   * phone feel broken.
   */
  const tapSelects = selectable && Boolean(onSelectedKeysChange) && (selectOne || selectedKeys.length > 0);

  // Retrieve row corresponding to active 3-dots menu
  const activeMenuRow = React.useMemo(() => {
    if (!menuOpenId) return null;
    return data.find((r, idx) => String(rowKey ? rowKey(r) : r.id || idx) === String(menuOpenId));
  }, [data, menuOpenId, rowKey]);

  // Toggle card selection helper
  const toggleCardSelection = React.useCallback(
    (key) => {
      if (!onSelectedKeysChange) return;
      triggerHaptic(15);
      const strKey = String(key);
      const strSelected = selectedKeys.map(String);
      // Preserve the original key type (number vs string) so callers comparing
      // with raw row ids (e.g. `selected.includes(l.id)`) keep working.
      let rawKey = key;
      const rowIndex = data.findIndex((r, idx) => String(rowKey ? rowKey(r, idx) : r.id || idx) === strKey);
      if (rowIndex !== -1) {
        rawKey = rowKey ? rowKey(data[rowIndex], rowIndex) : data[rowIndex]?.id;
      }
      const isSelected = strSelected.includes(strKey);

      // Single-select replaces rather than appends, so the caller never has to
      // trim a list it asked to hold one thing.
      if (selectOne) {
        onSelectedKeysChange(isSelected ? [] : [rawKey]);
        return;
      }

      if (isSelected) {
        onSelectedKeysChange(selectedKeys.filter((k) => String(k) !== strKey));
      } else {
        onSelectedKeysChange([...selectedKeys, rawKey]);
      }
    },
    [onSelectedKeysChange, selectedKeys, data, rowKey, selectOne]
  );

  const cancelLongPress = React.useCallback(() => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  }, []);

  // Leaving a timer armed across an unmount fires `toggleCardSelection` against
  // a gone component, and on a list that unmounts on every page change that is
  // one stray selection per navigation.
  React.useEffect(() => cancelLongPress, [cancelLongPress]);

  // Long press touch handlers (hold to select the card)
  function handleTouchStart(key, event) {
    if (!selectable) return;
    isLongPressRef.current = false;
    const touch = event?.touches?.[0];
    touchStartRef.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
    cancelLongPress();
    touchTimerRef.current = setTimeout(() => {
      touchTimerRef.current = null;
      isLongPressRef.current = true;
      triggerHaptic(25);
      toggleCardSelection(key);
    }, LONG_PRESS_MS);
  }

  /**
   * A finger that travels is scrolling, not pressing.
   *
   * This is the whole difference between a list you can scroll and one that
   * selects rows while you try: the press timer has no idea the view moved
   * under it, so it fires mid-flick and quietly ticks whatever was under the
   * thumb at 380ms.
   */
  function handleTouchMove(event) {
    const start = touchStartRef.current;
    const touch = event?.touches?.[0];
    if (!start || !touch) return;
    if (
      Math.abs(touch.clientX - start.x) > MOVE_SLOP_PX ||
      Math.abs(touch.clientY - start.y) > MOVE_SLOP_PX
    ) {
      cancelLongPress();
    }
  }

  function handleTouchEnd() {
    cancelLongPress();
    touchStartRef.current = null;
  }

  // Helper to render cell value with touch linkability, truncation, and copy support on mobile
  const renderCellContent = (col, row, defaultVal) => {
    if (!col) return defaultVal;

    const isLinkable = col.isLink || col.href || typeof col.onCellClick === "function";
    const rawVal = typeof col.render === "function" ? col.render(row) : row[col.key] ?? defaultVal;
    const textVal = String(row[col.key] ?? defaultVal ?? "");

    // Linkable cells
    if (isLinkable) {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            triggerHaptic(14);
            if (typeof col.onCellClick === "function") {
              col.onCellClick(row);
            } else if (onRowClick) {
              onRowClick(row);
            }
          }}
          className="text-accent font-bold hover:underline text-left cursor-pointer inline-flex items-center gap-1 active:opacity-75 transition-opacity"
        >
          <span>{rawVal}</span>
          <ExternalLink size={12} className="shrink-0 opacity-70" />
        </button>
      );
    }

    // Copyable cells — show value + copy button inline
    if (col.copyable || col.isCopyable) {
      return (
        <div className="flex items-center gap-1.5 min-w-0">
          <TruncatedText text={textVal} maxLength={col.maxLength} className="font-mono text-body-sm flex-1 min-w-0" />
          <CopyButton text={textVal} tooltipText={`Copy ${col.header || col.key}`} size={12} />
        </div>
      );
    }

    return rawVal;
  };

  // Identify key columns for high-density cards (Account, Name, Status, Type)
  const accountCol = columns.find((c) => c.key === "account");
  const nameCol = columns.find((c) => c.key === "name");
  const statusCol = columns.find((c) => c.key === "status");
  const typeCol = columns.find((c) => c.key === "type");

  /**
   * Is this the account-over-name shape the rich header below is built for?
   *
   * Both columns, not either. Gating on either one meant any table with a
   * `name` column but no `account` rendered its title twice — the headline
   * falls back to `row.account || row.name`, which *is* the name when there
   * is no account — while a table with `account` but no `name`/`status`/
   * `type` (Report) rendered a single line and dropped everything that told
   * its rows apart. Both cases also lost the `primaryFields` the page had
   * explicitly asked for, since this branch never consults them.
   *
   * Anything that isn't this shape uses `primaryFields` instead, which is
   * what a page passes precisely to say "these are the fields that matter".
   */
  const hasRichHeader = Boolean(accountCol && nameCol);

  const totalCount = data.length;
  const showBulkBar = selectable && bulkActions.length > 0 && selectedKeys.length > 0;

  if (loading && totalCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-ink-muted">
        <Loader label="Fetching the records..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="inline-flex flex-col items-center justify-center gap-2 p-4 rounded-surface bg-status-offline-bg/30 border border-status-offline/30 text-status-offline max-w-md mx-auto">
          <p className="text-body-sm font-semibold">{typeof error === "string" ? error : error.message || "Failed to load data."}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-3 py-1 text-body-sm font-medium bg-status-offline text-white rounded-control hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
            >
              Retry Request
            </button>
          )}
        </div>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
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
    );
  }

  return (
    <div
      ref={containerRef}
      // Momentum scrolling can carry the list without every frame reaching the
      // card, so the press timer is cancelled here as well as on touchmove.
      onScroll={cancelLongPress}
      className={cn(
        "flex flex-col gap-2.5 p-2 sm:p-4 w-full overflow-y-auto min-h-0 flex-1 [-webkit-overflow-scrolling:touch] [touch-action:pan-y] overscroll-contain",
        // Room is held open below the last card only for as long as
        // something is actually floating over it, so the end of the list is
        // the end of the scroll rather than a screenful of dead space:
        //
        //   bulk bar showing  -> 10rem (this list's own bar sits at 5.5rem)
        //   rows selected     -> 5.5rem (pages render a selection pill at
        //                        bottom-4; without this it covers the last
        //                        card by ~55px once you reach the bottom)
        //   nothing selected  -> safe-area only
        //
        // A floating add button is deliberately not accounted for: it is a
        // small corner circle over a card's empty corner, not a full-width
        // bar across its content. The safe-area inset keeps clearance on a
        // phone whose home indicator eats the bottom of the screen.
        showBulkBar
          ? "pb-[calc(10rem+env(safe-area-inset-bottom))]"
          : "pb-2 sm:pb-4",
        className
      )}
    >
      {data.map((row, index) => {
        const key = String(rowKey ? rowKey(row, index) : row.id || index);
        const isSelected = selectedKeys.map(String).includes(key);
        const isExpanded = expandedId === key;
        const isHighDensity = secondaryFields.length > 0;
        // Names the row for a screen reader, so a column of controls doesn't
        // all read out as "Select row". Raw values only — a column's `render`
        // returns an element, which cannot go in an attribute.
        const rowLabel = String(
          row.account || row.name || row.title || row[primaryFields[0]] || key
        );

        return (
          <div
            key={key}
            onTouchStart={(e) => handleTouchStart(key, e)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onClick={() => {
              // The click the browser sends after a long press would otherwise
              // undo the selection that press just made.
              if (isLongPressRef.current) return;
              if (tapSelects) {
                toggleCardSelection(key);
              } else if (onRowClick) {
                onRowClick(row);
              } else if (isHighDensity) {
                setExpandedId(isExpanded ? null : key);
              }
            }}
            className={cn(
              "group relative flex flex-col rounded-surface border bg-card shadow-sm transition-all duration-150 active:scale-[0.995]",
              isSelected
                ? "border-accent bg-accent-muted/20 ring-2 ring-accent/30"
                : "border-card-border hover:border-accent/40"
            )}
          >
            {/* Card Main Row Header */}
            <div className="flex items-center justify-between p-3.5 gap-3">
              {/* Selection control.
                  A real button carrying checkbox (or radio) semantics rather
                  than a div wrapping an <input>. The wrapped input was a
                  label-and-input pair, so the browser forwarded every tap to
                  the input and the surrounding handler ran twice per tap —
                  selecting and immediately deselecting. It also meant the part
                  that actually responded to a finger was the 16px box, not the
                  48px area around it. */}
              {selectable && (
                <button
                  type="button"
                  role={selectOne ? "radio" : "checkbox"}
                  aria-checked={isSelected}
                  aria-label={`Select ${rowLabel}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isLongPressRef.current) return;
                    toggleCardSelection(key);
                  }}
                  className="flex h-control-lg w-control-lg shrink-0 items-center justify-center rounded-surface cursor-pointer -ml-1 text-ink-muted hover:bg-accent-muted/40 hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center border transition-colors",
                      selectOne ? "rounded-pill" : "rounded-control",
                      isSelected
                        ? "border-accent bg-accent text-white"
                        : "border-card-border bg-input"
                    )}
                  >
                    {isSelected && <Check size={14} strokeWidth={3} />}
                  </span>
                </button>
              )}

              {/* Card Primary Content */}
              <div className="flex-1 min-w-0">
                {hasRichHeader ? (
                  <div className="space-y-1">
                    {/* Account Name.
                        Same de-truncation as the License Name row below: the
                        account column's `render` is shared with the desktop
                        table, where `TruncatedText`'s single-line ellipsis
                        suits a fixed-width cell, so a long account like
                        "my Design System - Imtb Engineers Pvt Ltd" arrived here
                        already clipped to "my Design System - Imtb Engineers P...".
                        The card has no such width constraint. `line-clamp-2`
                        is dropped along with it — a cap at two lines is just
                        the same truncation one line further down. */}
                    <div className="font-secondary text-body font-bold text-ink-primary break-words leading-snug [&_.truncate]:whitespace-normal [&_.truncate]:overflow-visible [&_.truncate]:text-clip [&_.truncate]:break-words">
                      {renderCellContent(accountCol, row, row.account || row.name || "-")}
                    </div>

                    {/* License Name.
                        A column's `render` (e.g. the license "name" column) is
                        shared with the desktop table, where `TruncatedText`'s
                        single-line ellipsis is correct for a fixed-width
                        cell. This card has no such width constraint, so its
                        nested `.truncate` is overridden back to wrapping —
                        same technique as the expanded metadata section below —
                        and the line-clamp is dropped so the full name is
                        always visible instead of being cut after 2 lines. */}
                    {nameCol && (
                      <div className="text-body-sm font-medium text-ink-secondary break-words leading-relaxed [&_.truncate]:whitespace-normal [&_.truncate]:overflow-visible [&_.truncate]:text-clip [&_.truncate]:break-words">
                        {renderCellContent(nameCol, row, row.name || "-")}
                      </div>
                    )}

                    {/* Status badge & type */}
                    <div className="flex items-center gap-2 pt-1 flex-wrap min-w-0">
                      {statusCol && <div className="min-w-0 max-w-full">{typeof statusCol.render === "function" ? statusCol.render(row) : row.status}</div>}
                      {typeCol && (
                        // A flex item will not shrink below its content unless
                        // told it may, so a long unbroken code like
                        // "OC-1Y-XX-3M-PR-PTZCAM" ran past the edge of the card
                        // rather than wrapping or clipping.
                        <span className="inline-flex min-w-0 max-w-full items-center truncate rounded-md bg-chrome-deep px-2 py-0.5 text-body-sm font-medium text-ink-secondary border border-card-border">
                          {typeof typeCol.render === "function" ? typeCol.render(row) : row.type}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {primaryFields.length > 0 ? (
                      primaryFields.map((field, idx) => {
                        const col = columns.find((c) => c.key === field);
                        if (!col) return null;
                        const val = renderCellContent(col, row, row[field] ?? "-");

                        return (
                          <div
                            key={field}
                            className={cn(
                              // Wraps rather than clips, for the same reason
                              // the name row above does: a column's `render`
                              // is shared with the desktop table, where a
                              // single-line ellipsis suits a fixed-width
                              // cell. A card has no such width, and a
                              // primary field cut off mid-word is the value
                              // the page asked to show going missing.
                              "break-words [&_.truncate]:whitespace-normal [&_.truncate]:overflow-visible [&_.truncate]:text-clip [&_.truncate]:break-words",
                              idx === 0
                                ? "font-secondary text-body font-semibold text-ink-primary leading-snug"
                                : "text-body-sm text-ink-secondary leading-relaxed"
                            )}
                          >
                            {val}
                          </div>
                        );
                      })
                    ) : (
                      <div className="font-secondary text-body font-semibold text-ink-primary break-words">
                        {row.name || row.title || row.account || "-"}
                      </div>
                    )}

                    {/* Only when the page hasn't already listed `status`
                        among its primary fields — otherwise the badge is
                        rendered twice on every card. */}
                    {statusCol && !primaryFields.includes("status") && (
                      <div className="pt-1">
                        {typeof statusCol.render === "function" ? statusCol.render(row) : row.status}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right controls: 3-dot menu + Accordion chevron */}
              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                {actionMenuItems.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic(12);
                      setMenuOpenId(key);
                    }}
                    className="flex h-control-lg w-control-lg items-center justify-center rounded-control text-ink-muted hover:bg-accent-muted hover:text-ink-primary active:bg-accent-muted/80 cursor-pointer"
                    aria-label="More actions"
                  >
                    <MoreVertical size={20} />
                  </button>
                )}

                {isHighDensity && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic(10);
                      setExpandedId(isExpanded ? null : key);
                    }}
                    className="flex h-control-lg w-control-lg items-center justify-center rounded-control text-ink-muted hover:bg-accent-muted hover:text-accent cursor-pointer"
                    aria-label={isExpanded ? "Collapse details" : "Expand details"}
                  >
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                )}
              </div>
            </div>

            {/* Accordion Expanded Metadata (High Density) */}
            {isExpanded && isHighDensity && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="border-t border-card-border bg-chrome-deep/50 px-4 py-3.5 space-y-2 text-body-sm rounded-b-xl overflow-hidden animate-in fade-in duration-150"
              >
                {secondaryFields.map((field) => {
                  const col = columns.find((c) => c.key === field);
                  const val = renderCellContent(col, row, row[field] || "-");
                  const label = col ? col.header || field : field;
                  return (
                    <div key={field} className="flex items-start justify-between min-h-[28px] gap-3">
                      <span className="font-medium text-ink-muted uppercase tracking-wider shrink-0 pt-px">
                        {label}
                      </span>
                      {/*
                        A column's `render` (e.g. `TruncatedText`) is shared
                        with the desktop table, where single-line ellipsis is
                        correct for a fixed-width cell. This row has no such
                        constraint — the user already expanded the card to see
                        everything — so descendant truncation utilities are
                        overridden back to wrapping. Targeting `.truncate`
                        beats the base utility on specificity (two classes vs
                        one) regardless of stylesheet order, so this doesn't
                        depend on `render` using any particular component.
                      */}
                      <div className="min-w-0 font-medium text-ink-primary text-right break-words leading-relaxed [&_.truncate]:whitespace-normal [&_.truncate]:overflow-visible [&_.truncate]:text-clip [&_.truncate]:break-words">
                        {val}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Load More. No "Showing all N records" footer below it — the last
          card is the end of the list; nothing pads the page out further, and
          a short list simply leaves whatever blank space is left below it
          rather than stretching to fill the viewport. */}
      {hasMore && onLoadMore ? (
        <div className="px-3 sm:px-4 pb-6 pt-2 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="w-full max-w-xs py-2.5 px-4 rounded-surface border border-card-border bg-card hover:bg-accent-muted/30 text-body-sm font-semibold text-ink-primary shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-control-lg"
          >
            {loadingMore ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-pill border-2 border-accent border-t-transparent" />
            ) : (
              "Load More Records"
            )}
          </button>
        </div>
      ) : null}

      {/* 3-Dot Action Menu Mobile Bottom Sheet */}
      {menuOpenId && activeMenuRow && (
        <BottomSheet
          open={!!menuOpenId}
          onClose={() => setMenuOpenId(null)}
          title="Row Actions"
        >
          <div className="flex flex-col gap-1 pb-4">
            {actionMenuItems.map((item, idx) => (
              <button
                key={item.label || idx}
                type="button"
                onClick={() => {
                  triggerHaptic(15);
                  setMenuOpenId(null);
                  item.onClick(activeMenuRow);
                }}
                className={cn(
                  "flex min-h-control-lg w-full items-center gap-3 rounded-surface px-4 text-body font-medium transition-colors text-left cursor-pointer active:bg-accent-muted/70",
                  item.danger
                    ? "text-rose-500 hover:bg-rose-500/10"
                    : "text-ink-primary hover:bg-accent-muted hover:text-accent"
                )}
              >
                {item.icon && <span className="shrink-0 text-current">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </BottomSheet>
      )}

      {/* Floating Bulk Action Bar.
          Sits above the bottom-right corner rather than across it: a centred
          pill this wide reaches into the same space a floating add button
          occupies, and the two rendered on top of each other. */}
      {showBulkBar && (
        <div
          role="toolbar"
          aria-label="Bulk actions"
          className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-1/2 z-[var(--z-dropdown)] flex -translate-x-1/2 items-center gap-1.5 rounded-pill border border-card-border bg-chrome-deep/95 px-4 py-2 shadow-2xl backdrop-blur-md text-ink-onchrome text-body-sm font-medium select-none max-w-[calc(100vw-2rem)] overflow-x-auto scrollbar-none"
        >
          <span className="shrink-0 font-semibold">{selectedKeys.length} selected</span>
          {bulkActions.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => {
                triggerHaptic(15);
                a.onClick?.(selectedKeys);
              }}
              className={cn(
                "flex h-control-lg shrink-0 items-center gap-1.5 rounded-pill px-3 transition-colors cursor-pointer",
                a.danger
                  ? "text-status-offline hover:bg-status-offline/10"
                  : "text-accent hover:bg-accent/10"
              )}
            >
              {a.icon && <span className="shrink-0">{a.icon}</span>}
              <span className="whitespace-nowrap">{a.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { MobileCardList };