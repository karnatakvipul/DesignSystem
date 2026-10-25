import * as React from "react";
import { SlidersHorizontal, Search, RotateCcw, X } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "./Button";
import { Badge } from "./Badge";

/**
 * Gmail-Style Floating Advanced Search & Filter Popover Component.
 * Features left-aligned action bar & compact height to guarantee 100% visibility.
 */
function FilterPanel({
  open,
  onClose,
  onSearch,
  onClear,
  children,
  className,
  activeCount = 0,
  title = "Advanced Search Filter",
  showHeader = false,
  position = "absolute top-full left-0 z-[100] mt-2 shadow-floating",
  width = "default",
  // Two columns of cells by default. "rows" gives a single stacked column,
  // which is what `FilterField` expects — its labels only line up if every row
  // spans the full width.
  layout = "grid",
  // Actions sit on the left by default. "end" moves them to the right, the
  // usual place for a dialog's confirm action.
  actionAlign = "start",
  searchLabel = "Search",
  clearLabel = "Clear",
  // Sits with no gap directly under the control that opens it (a `SearchBox`
  // with `filtersOpen`, typically) and is meant to read as one continuous
  // surface with it: the shared edge loses its top border and corner
  // rounding, and the border colour matches the control's own open-state
  // colour rather than the ordinary card border.
  attached = false,
}) {
  const panelRef = React.useRef(null);

  // Close on Outside Click & Escape key (Gmail behavior)
  React.useEffect(() => {
    if (!open) return;

    function handleOutsideClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        // Ignore clicks on filter trigger buttons
        if (e.target.closest('button[aria-label="Filters"]')) return;

        // A dropdown inside this panel renders its menu through a portal, so
        // it is not a DOM descendant even though it sits visually on top of
        // the panel. Choosing an option would otherwise read as clicking
        // away and dismiss the panel underneath it.
        if (e.target.closest("[data-portal-popover]")) return;

        onClose?.();
      }
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose?.();
      }
    }

    // Attach event listeners on next microtask frame using requestAnimationFrame
    const frameId = requestAnimationFrame(() => {
      document.addEventListener("click", handleOutsideClick, true);
      document.addEventListener("keydown", handleKeyDown);
    });

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener("click", handleOutsideClick, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label={title}
      className={cn(
        "flex flex-col border bg-card shadow-floating transition-all animate-in fade-in zoom-in-95 duration-150 p-4 sm:p-5 text-ink-primary max-h-[58vh] sm:max-h-[62vh]",
        attached
          ? "rounded-t-none rounded-b-surface border-t-0 border-accent"
          : "rounded-surface border-card-border",
        width === "full" || width === "match-parent"
          ? "w-full max-w-full"
          : "w-[92vw] sm:w-[560px] md:w-[620px] max-w-[calc(100vw-2rem)]",
        position,
        className
      )}
    >
      {/* Header bar (rendered when explicitly enabled) */}
      {showHeader && (
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-card-border/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-7 w-7 rounded-control bg-accent/10 text-accent">
              <SlidersHorizontal size={15} />
            </div>
            <h3 className="text-body-sm font-semibold uppercase tracking-wider text-ink-primary">
              {title}
            </h3>
            {activeCount > 0 && (
              <Badge tone="accent" className="text-caption py-0.5 px-2 font-bold">
                {activeCount} active
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onClear && (
              <button
                type="button"
                onClick={onClear}
                className="flex items-center gap-1 text-body-sm text-ink-muted hover:text-ink-primary transition-colors py-1 px-2 rounded-control hover:bg-accent-muted/30"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                className="text-ink-muted hover:text-ink-primary p-1 rounded-control transition-colors"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Fields, scrolling internally so the action row below stays visible */}
      <div
        className={cn(
          "flex-1 overflow-y-auto pr-1 min-h-0",
          layout === "rows" ? "flex flex-col gap-3" : "grid grid-cols-1 gap-3 sm:grid-cols-2"
        )}
      >
        {children}
      </div>

      {/* Bottom Action Row */}
      <div
        className={cn(
          "mt-3 pt-3 border-t border-card-border/70 flex items-center shrink-0",
          actionAlign === "end" ? "justify-end" : "justify-start"
        )}
      >
        <div className={cn("flex items-center gap-3", actionAlign === "end" && "flex-row-reverse")}>
          {onSearch && (
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                onSearch?.();
                onClose?.();
              }}
              icon={<Search size={16} />}
              className="rounded-pill px-6 h-10 text-body font-semibold shadow-raised"
            >
              {searchLabel}
            </Button>
          )}
          {onClear && (
            <Button
              variant="outline"
              size="md"
              onClick={onClear}
              className="rounded-pill px-5 h-10 text-body font-medium"
            >
              {clearLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export { FilterPanel };
