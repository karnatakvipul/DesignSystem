import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";

const BOILERPLATE_TABS = [
  { value: "tab1", label: "Tab 1" },
  { value: "tab2", label: "Tab 2" },
  { value: "tab3", label: "Tab 3" }
];

/** How much of the visible width one press of a scroll button moves. */
const SCROLL_STEP_RATIO = 0.7;

/**
 * Horizontal tab strip that stays usable when there are more tabs than fit.
 *
 * Overflowing tabs used to be unreachable in practice. The strip scrolled, but
 * its scrollbar is hidden and a vertical mouse wheel does not move a
 * horizontal container, so on a desktop with a wheel there was no way to get
 * at the tabs past the edge and nothing on screen saying they were there.
 *
 * Four things fix that, which together are the usual scrollable-tabs pattern:
 * arrow buttons that appear only on the side there is something to reach,
 * a fade at each overflowing edge so it is visible that the list continues,
 * a vertical wheel translated into horizontal movement, and the selected tab
 * scrolled into view whenever it changes — including when something else
 * changes it, such as restoring a previous selection on load.
 *
 * @param {Object} props
 * @param {Array} props.items
 * @param {string} props.value
 * @param {(value: string) => void} props.onChange
 * @param {React.ReactNode} [props.action]
 *   A control pinned to the end of the strip — typically "add a tab". It sits
 *   outside the scrolling area, so it stays put however many tabs there are.
 *
 *   Worth a slot rather than leaving callers to append an extra item: an add
 *   button expressed as a tab scrolls away exactly when it is most needed,
 *   since more tabs is what pushes it off the edge. It is also the one thing
 *   in the strip that is not a tab, and a non-tab button inside
 *   `role="tablist"` misreports the tab count to assistive tech and puts a
 *   control in the arrow-key cycle that selects no panel.
 */
function Tabs({
  items = BOILERPLATE_TABS,
  value = "tab1",
  onChange = () => {},
  action,
  className
}) {
  const listRef = React.useRef(null);
  const [overflow, setOverflow] = React.useState({ left: false, right: false });

  const measure = React.useCallback(() => {
    const list = listRef.current;
    if (!list) return;

    const max = list.scrollWidth - list.clientWidth;
    // A pixel of slack: fractional layout widths mean scrollLeft rarely lands
    // exactly on the maximum, which would otherwise leave the right arrow
    // showing at the end of the list with nothing left to scroll to.
    setOverflow({ left: list.scrollLeft > 1, right: list.scrollLeft < max - 1 });
  }, []);

  // Registered by hand rather than with React's onWheel, because React binds
  // wheel passively at the root: preventDefault there is ignored, so the page
  // would scroll vertically at the same time as the strip moved sideways.
  React.useEffect(() => {
    const list = listRef.current;
    if (!list) return undefined;

    function onWheel(e) {
      if (list.scrollWidth <= list.clientWidth) return;
      // Only take over a vertical gesture. A trackpad's horizontal swipe
      // already scrolls this correctly and should be left alone.
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

      e.preventDefault();
      list.scrollLeft += e.deltaY;
    }

    list.addEventListener("wheel", onWheel, { passive: false });
    return () => list.removeEventListener("wheel", onWheel);
  }, []);

  React.useEffect(() => {
    const list = listRef.current;
    if (!list) return undefined;

    // Measured again on the next frame as well as immediately: on first paint
    // the tabs may not have their final widths yet (labels still laying out),
    // and a measurement taken then reports the wrong scrollable extent.
    measure();
    const frame = requestAnimationFrame(measure);
    list.addEventListener("scroll", measure, { passive: true });

    // Watches the strip itself, so this reacts to the sidebar expanding or a
    // panel resizing — not only to the window changing size.
    const observer = new ResizeObserver(measure);
    observer.observe(list);

    return () => {
      cancelAnimationFrame(frame);
      list.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [measure, items]);

  /**
   * Moves the strip by a fraction of its visible width.
   *
   * Sets scrollLeft directly rather than asking for a smooth scroll. Neither
   * `scrollBy({ behavior: "smooth" })` nor CSS `scroll-behavior: smooth` is
   * dependable — in some engines the request is dropped and the strip does not
   * move at all, which is a broken button rather than a missing animation.
   * Landing in the right place matters more than gliding there.
   */
  function scrollByStep(direction) {
    const list = listRef.current;
    if (!list) return;

    const max = list.scrollWidth - list.clientWidth;
    const step = direction * list.clientWidth * SCROLL_STEP_RATIO;
    list.scrollLeft = Math.max(0, Math.min(max, list.scrollLeft + step));

    // Re-measure now rather than waiting for the scroll event. We just moved
    // it ourselves, so the new position is already known — waiting leaves the
    // arrows a step behind, showing "nothing to the left" after a scroll that
    // plainly left something there.
    measure();
  }

  // Keeps the selected tab on screen. Scrolls the strip directly rather than
  // calling scrollIntoView, which would also scroll every ancestor and jolt
  // the page vertically.
  React.useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const tab = list.querySelector(`[data-tab-value="${CSS.escape(String(value))}"]`);
    if (!tab) return;

    const listBox = list.getBoundingClientRect();
    const tabBox = tab.getBoundingClientRect();
    const margin = 12;

    const max = list.scrollWidth - list.clientWidth;
    const shift =
      tabBox.left < listBox.left ? tabBox.left - listBox.left - margin
      : tabBox.right > listBox.right ? tabBox.right - listBox.right + margin
      : 0;

    if (shift !== 0) {
      list.scrollLeft = Math.max(0, Math.min(max, list.scrollLeft + shift));
      measure();
    }
  }, [value, items, measure]);

  function handleKeyDown(e) {
    const currentIndex = items.findIndex((item) => item.value === value);
    if (currentIndex === -1) return;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      onChange(items[(currentIndex + 1) % items.length].value);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      onChange(items[(currentIndex - 1 + items.length) % items.length].value);
    } else if (e.key === "Home") {
      e.preventDefault();
      onChange(items[0].value);
    } else if (e.key === "End") {
      e.preventDefault();
      onChange(items[items.length - 1].value);
    }
  }

  // Touch-sized on a phone, back to the compact desktop arrow from md: up.
  // These are the only way to reach a tab that has scrolled out of sight, and
  // at 24x28 they were the smallest targets on the screen.
  const arrowClasses =
    "flex h-control-lg w-control-lg md:h-7 md:w-6 shrink-0 items-center justify-center rounded text-ink-secondary transition-opacity " +
    "enabled:hover:bg-accent-muted enabled:hover:text-ink-primary enabled:cursor-pointer " +
    "disabled:opacity-25 disabled:cursor-default";

  return (
    // The rule lives on the wrapper so it runs the full width, under the
    // arrows and the pinned action as well as the tabs.
    <div className={cn("flex w-full min-w-0 items-stretch border-b border-card-border", className)}>
      {/* Both arrows stay mounted and are disabled when there is nothing that
          way, rather than being added and removed. An arrow occupies width, so
          showing one shrinks the tab list, which changes how much there is to
          scroll, which can change whether the arrow should be showing — a loop
          that settles on the wrong answer. Reserving the space breaks it, and
          stops the tabs shifting sideways as the arrows come and go. */}
      <button
        type="button"
        aria-label="Scroll tabs left"
        disabled={!overflow.left}
        onClick={() => scrollByStep(-1)}
        className={cn(arrowClasses, "self-center")}
      >
        <ChevronLeft size={16} />
      </button>

      {/* relative so the fades can sit over the edges of the scrolling list */}
      <div className="relative min-w-0 flex-1">
        <div
          ref={listRef}
          role="tablist"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-none rounded-t focus:outline-none focus:ring-1 focus:ring-accent/40"
        >
          {items.map((item) => {
            const active = item.value === value;
            return (
              <button
                key={item.value}
                role="tab"
                data-tab-value={item.value}
                aria-selected={active}
                onClick={() => onChange(item.value)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2 text-body font-medium transition-colors cursor-pointer select-none",
                  active ? "border-accent text-accent font-semibold" : "border-transparent text-ink-secondary hover:text-ink-primary"
                )}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Fades say "there is more this way" before anyone tries to scroll.
            pointer-events-none so they never swallow a click on a tab beneath. */}
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-chrome to-transparent transition-opacity",
            overflow.left ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-chrome to-transparent transition-opacity",
            overflow.right ? "opacity-100" : "opacity-0"
          )}
        />
      </div>

      <button
        type="button"
        aria-label="Scroll tabs right"
        disabled={!overflow.right}
        onClick={() => scrollByStep(1)}
        className={cn(arrowClasses, "self-center")}
      >
        <ChevronRight size={16} />
      </button>

      {action && (
        // shrink-0 keeps this at its natural width while the tab list takes
        // the squeeze, and the divider makes clear it is not another tab.
        <div className="flex shrink-0 items-center border-l border-card-border pl-1 pr-0.5">
          {action}
        </div>
      )}
    </div>
  );
}

export { Tabs };
