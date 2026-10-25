import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * The floating "N selected" pill a mobile table screen shows while rows are
 * checked.
 *
 * Every table screen had grown its own copy of this markup, and each one
 * stretched the pill edge to edge (`left-4 right-20`) with `justify-between`
 * inside. On a 375px phone that put the count hard against the left rail and
 * the actions hard against the right — roughly 280px apart, reading as two
 * unrelated controls rather than one bar. With a single action (just
 * "Deselect") the gap was the widest part of the component.
 *
 * So the pill hugs its contents instead. It stays anchored to the left, but
 * `w-fit` lets it end where its content ends, which is the floating-selection
 * pattern Gmail, Google Photos and Linear all use — count and actions
 * adjacent, the pill only as wide as it needs to be.
 *
 * `max-w` keeps a wide action set (Users' Edit + Deactivate + Deselect) from
 * growing far enough right to slide under a `FloatingAddButton`: 6rem clears
 * its 48px circle plus both margins. Past that width the actions scroll
 * horizontally rather than wrapping the pill onto a second line.
 *
 * Actions render in the order given; `onClear` is always rendered last, since
 * "stop selecting" is the way out of the mode rather than one of the things
 * you came here to do.
 */
function MobileSelectionBar({
  count = 0,
  onClear,
  clearLabel = "Deselect",
  actions = [],
  /** Escape hatch for a screen that has no floating add button to avoid. */
  className,
}) {
  if (count <= 0) return null;

  const visibleActions = actions.filter(
    (action) => !action.requiresSingle || count === 1
  );

  return (
    <div
      role="toolbar"
      aria-label={`${count} selected`}
      className={cn(
        "md:hidden fixed z-40 flex w-fit max-w-[calc(100vw-6rem)] items-center gap-2",
        "rounded-pill border border-accent/30 bg-card px-4 py-2.5 shadow-floating",
        "bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4",
        className
      )}
    >
      <span className="shrink-0 text-body-sm font-semibold text-accent">
        {count} selected
      </span>

      {/* Scrolls rather than wrapping: a pill that grows a second line
          changes height under the user's thumb, and the clearance held open
          below the last card assumes a single-line bar. */}
      <div className="flex min-w-0 items-center gap-1 overflow-x-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {visibleActions.map((action) => (
          <button
            key={action.key ?? action.label}
            type="button"
            onClick={action.onClick}
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-control px-2 py-1 text-body-sm font-semibold transition-colors cursor-pointer",
              action.danger
                ? "text-status-offline hover:bg-status-offline/10"
                : "text-ink-secondary hover:bg-input hover:text-ink-primary"
            )}
          >
            {action.icon}
            {action.label}
          </button>
        ))}

        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="flex shrink-0 items-center gap-1 rounded-control px-2 py-1 text-body-sm font-semibold text-ink-secondary transition-colors hover:bg-input hover:text-ink-primary cursor-pointer"
          >
            <X size={14} />
            {clearLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export { MobileSelectionBar };
