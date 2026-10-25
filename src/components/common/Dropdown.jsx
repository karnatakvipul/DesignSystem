import * as React from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "../../lib/cn";
import { FormGroup } from "./FormGroup";
import { AsyncDropdown } from "./AsyncDropdown";

const BOILERPLATE_OPTIONS = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
  { value: "option3", label: "Option 3" },
];

/** Gap between the trigger and its menu, in pixels. */
const MENU_OFFSET = 4;

/** Smallest usable menu height before it is worth flipping above the trigger. */
const MIN_MENU_SPACE = 180;

function Dropdown({
  label,
  required,
  requiredText,
  error,
  options = BOILERPLATE_OPTIONS,
  fetchOptions,
  value,
  onChange = () => {},
  placeholder = "Select...",
  searchable = true,
  disabled,
  className
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [focusedIndex, setFocusedIndex] = React.useState(0);
  const [menuStyle, setMenuStyle] = React.useState(null);

  const triggerRef = React.useRef(null);
  const menuRef = React.useRef(null);

  /**
   * Positions the menu against the trigger in viewport coordinates.
   *
   * The menu is rendered into `document.body` rather than beside the trigger,
   * so it has to be placed by hand — but that is the whole point. Rendered in
   * place it was a child of whatever the trigger sat in, and inside anything
   * with `overflow: auto` or `hidden` — a scrolling filter panel, a modal, a
   * table cell — the browser clipped it to that box. Long option lists came
   * out sliced off. A portal escapes every ancestor's overflow and stacking
   * context, which is the standard fix and the only one that holds for all
   * three of those cases at once.
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
    function onPointerDown(e) {
      // The menu is no longer inside the trigger's subtree, so "outside" has
      // to mean outside *both* — otherwise clicking an option registers as an
      // outside click and closes the menu before the choice is made.
      const inTrigger = triggerRef.current?.contains(e.target);
      const inMenu = menuRef.current?.contains(e.target);
      if (!inTrigger && !inMenu) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  // Reset keyboard-nav focus whenever the dropdown opens, otherwise a stale
  // index from a previous open (possibly out of range or pointing at the
  // wrong option) stays highlighted and would be what Enter selects.
  React.useEffect(() => {
    if (open) setFocusedIndex(0);
  }, [open]);

  // All hooks must run before this branch so the hook order stays stable
  // even when `fetchOptions` switches between renders.
  if (fetchOptions) {
    return (
      <AsyncDropdown
        label={label}
        loadOptions={fetchOptions}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
      />
    );
  }

  const filtered = searchable && query ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())) : options;
  const selected = options.find((o) => o.value === value);

  function choose(opt) {
    if (opt.disabled) return;
    onChange(opt.value);
    setOpen(false);
    setQuery("");
  }

  function handleKeyDown(e) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[focusedIndex]) choose(filtered[focusedIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  }

  const menu = open && menuStyle && (
    <div
      ref={menuRef}
      style={menuStyle}
      // Marks this as a popover that escaped its parent via a portal. Anything
      // with an outside-click-to-close behaviour should treat a click in here
      // as inside, because visually it *is* inside — it only left the DOM
      // subtree to avoid being clipped. Without the flag, choosing an option
      // in a dropdown inside a panel would read as clicking away from that
      // panel and dismiss the lot.
      data-portal-popover="true"
      // Above modals and panels, which sit in the 50-100 range.
      className="z-[200] flex flex-col overflow-hidden rounded-md border border-card-border bg-card shadow-floating"
      // Repeated here because the portal is outside the trigger's subtree, so
      // key events raised inside the menu never reach the wrapper's handler.
      onKeyDown={handleKeyDown}
    >
      {searchable && (
        <div className="flex shrink-0 items-center gap-2 border-b border-card-border px-3 py-2">
          <Search size={14} className="shrink-0 text-ink-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setFocusedIndex(0);
            }}
            placeholder="Search..."
            className="w-full bg-transparent text-body text-ink-primary placeholder:text-ink-muted focus:outline-none"
          />
        </div>
      )}

      {/* min-h-0 so this can actually shrink inside the flex column — without
          it the list keeps its content height and overflows the menu it is
          supposed to be scrolling inside. */}
      {/* A listbox may only contain options, so the `li` wrappers are marked
          presentational and the role sits on the control that is actually
          chosen. Without this the list announces as a plain group of buttons
          and neither the count nor the current selection is conveyed. */}
      <ul
        className="min-h-0 flex-1 overflow-y-auto py-1"
        role="listbox"
        aria-label={label ? `${label} options` : "Options"}
      >
        {filtered.length === 0 && (
          <li role="presentation" className="px-3 py-2 text-body text-ink-muted">
            No options
          </li>
        )}
        {filtered.map((opt, idx) => (
          <li key={opt.value} role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={opt.value === value}
              disabled={opt.disabled}
              onClick={() => choose(opt)}
              className={cn(
                "flex w-full items-start justify-between gap-2 px-3 py-2 text-left text-body hover:bg-accent-muted disabled:opacity-40",
                opt.value === value ? "text-accent font-semibold" : "text-ink-primary",
                focusedIndex === idx && "bg-accent-muted/80"
              )}
            >
              {/* Wraps rather than truncating: these are account and site
                  names, and the tail is often the part that distinguishes
                  two otherwise identical entries. */}
              <span className="min-w-0 break-words">{opt.label}</span>
              {opt.value === value && <Check size={14} className="mt-0.5 shrink-0" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <FormGroup label={label} required={required} requiredText={requiredText} error={error} className={className}>
      <div ref={triggerRef} className="relative" onKeyDown={handleKeyDown}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(
            "flex h-11 md:h-10 w-full items-center justify-between rounded-md border bg-input px-3 text-body text-left",
            "focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-50",
            error ? "border-status-offline" : "border-card-border",
            selected ? "text-ink-primary" : "text-ink-muted"
          )}
        >
          <span className="truncate">{selected?.label ?? placeholder}</span>
          <ChevronDown size={16} className={cn("shrink-0 text-ink-muted transition-transform", open && "rotate-180")} />
        </button>
      </div>

      {typeof document !== "undefined" && menu ? createPortal(menu, document.body) : null}
    </FormGroup>
  );
}

export { Dropdown };
