import * as React from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "../../lib/cn";
import { FormGroup } from "./FormGroup";
import { AsyncMultiSelectDropdown } from "./AsyncMultiSelectDropdown";

const BOILERPLATE_MULTI_OPTIONS = [
  { value: "opt1", label: "Option 1" },
  { value: "opt2", label: "Option 2" },
  { value: "opt3", label: "Option 3" },
];

/** Gap between the trigger and its menu. Matches `Dropdown`. */
const MENU_OFFSET = 4;
/** Below this much room underneath, the menu flips above instead. Matches `Dropdown`. */
const MIN_MENU_SPACE = 180;

function StandardMultiSelectDropdown({
  label,
  required,
  error,
  options = BOILERPLATE_MULTI_OPTIONS,
  value = [],
  onChange = () => {},
  placeholder = "Select...",
  className
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [menuStyle, setMenuStyle] = React.useState({});
  const rootRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  const menuRef = React.useRef(null);

  // Default param only covers `undefined` — normalize here so a consumer
  // passing `value={null}` (common with controlled-input patterns) doesn't
  // crash on the .includes/.filter/.map calls below.
  const safeValue = Array.isArray(value) ? value : [];

  /**
   * Positions the menu against the trigger in viewport coordinates.
   *
   * Same approach as `Dropdown`, and for the same reason: rendered in place
   * the menu was a child of whatever the trigger sat in, so any ancestor with
   * `overflow: auto`/`hidden` clipped it. This one is the only `multiSelect`
   * among a row of plain dropdowns in the shared filter panel, and it was the
   * only one that did not escape — so it alone stayed boxed inside the panel
   * while every sibling floated above it. A portal fixes the clipping and
   * makes the two behave identically, which is the point.
   */
  const positionMenu = React.useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom;
    const above = rect.top;

    // Flip above only when below is genuinely too cramped and above is
    // roomier, so the menu doesn't jump sides on small scroll movements.
    const flip = below < MIN_MENU_SPACE && above > below;
    const available = Math.max(120, (flip ? above : below) - MENU_OFFSET - 8);

    setMenuStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      maxHeight: available,
      ...(flip
        ? { bottom: window.innerHeight - rect.top + MENU_OFFSET }
        : { top: rect.bottom + MENU_OFFSET }),
    });
  }, []);

  React.useLayoutEffect(() => {
    if (!open) return undefined;

    positionMenu();

    // Capture phase so this fires for scrolling in *any* ancestor, not just
    // the window — the panel body scrolls, and without capture the menu would
    // stay put while the trigger moved out from under it.
    const reposition = () => positionMenu();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);

    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open, positionMenu]);

  React.useEffect(() => {
    function onClickOutside(e) {
      // The menu is no longer inside the trigger's subtree, so "outside" has
      // to mean outside *both* — otherwise ticking an option registers as an
      // outside click and closes the menu before the choice lands.
      const inRoot = rootRef.current?.contains(e.target);
      const inMenu = menuRef.current?.contains(e.target);
      if (!inRoot && !inMenu) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const cleanOptions = React.useMemo(
    () => options.filter((o) => o && o.value !== ""),
    [options]
  );

  const filtered = query
    ? cleanOptions.filter((o) => o.label?.toLowerCase().includes(query.toLowerCase()))
    : cleanOptions;

  function toggle(v) {
    onChange(safeValue.includes(v) ? safeValue.filter((x) => x !== v) : [...safeValue, v]);
  }

  return (
    <FormGroup label={label} required={required} error={error} className={className}>
      <div ref={rootRef} className="relative">
        <button
          type="button"
          ref={triggerRef}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex min-h-11 md:min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border bg-input px-2 py-1.5 text-left cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-accent/40",
            error ? "border-status-offline" : "border-card-border"
          )}
        >
          {safeValue.length === 0 && <span className="px-1 text-body text-ink-muted">{placeholder}</span>}
          {safeValue.map((v) => {
            const opt = cleanOptions.find((o) => o.value === v);
            return (
              <span
                key={v}
                className="inline-flex items-center gap-1 rounded bg-tag px-2 py-0.5 text-body-sm text-tag border border-tag-border"
              >
                {opt?.label ?? v}
                <X
                  size={12}
                  className="cursor-pointer hover:text-status-offline"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(v);
                  }}
                />
              </span>
            );
          })}
          <ChevronDown size={16} className={cn("ml-auto shrink-0 text-ink-muted transition-transform", open && "rotate-180")} />
        </button>

      </div>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              style={menuStyle}
              // Marks this as a popover that escaped its parent via a portal.
              // Anything with an outside-click-to-close behaviour should treat
              // a click in here as inside, because visually it *is* inside —
              // it only left the DOM subtree to avoid being clipped. Without
              // the flag, ticking an option inside a filter panel would read
              // as clicking away from that panel and dismiss the lot.
              data-portal-popover="true"
              // Above modals and panels, which sit in the 50-100 range.
              // Matches `Dropdown`, so a multi-select and a plain one opened
              // from the same panel stack the same way.
              className="z-[200] flex flex-col overflow-hidden rounded-md border border-card-border bg-card shadow-floating"
            >
              <div className="flex shrink-0 items-center gap-2 border-b border-card-border px-3 py-2">
                <Search size={14} className="shrink-0 text-ink-muted" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-transparent text-body text-ink-primary placeholder:text-ink-muted focus:outline-none"
                />
              </div>
              {/* min-h-0 so this can actually shrink inside the flex column —
                  without it the list keeps its content height and overflows
                  the `maxHeight` the menu was positioned with. */}
              <ul className="min-h-0 flex-1 overflow-y-auto py-1" role="listbox">
                {filtered.length === 0 && <li className="px-3 py-2 text-body text-ink-muted">No options</li>}
                {filtered.map((opt) => (
                  <li key={opt.value}>
                    <label className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-body hover:bg-accent-muted/40">
                      <input
                        type="checkbox"
                        checked={safeValue.includes(opt.value)}
                        onChange={() => toggle(opt.value)}
                        className="h-3.5 w-3.5 rounded border-card-border accent-accent"
                      />
                      <span className="text-ink-primary">{opt.label}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>,
            document.body
          )
        : null}
    </FormGroup>
  );
}

function MultiSelectDropdown(props) {
  if (props.fetchOptions) {
    return (
      <AsyncMultiSelectDropdown
        label={props.label}
        loadOptions={props.fetchOptions}
        value={props.value}
        onChange={props.onChange}
        placeholder={props.placeholder}
        className={props.className}
      />
    );
  }
  return <StandardMultiSelectDropdown {...props} />;
}

export { MultiSelectDropdown };
