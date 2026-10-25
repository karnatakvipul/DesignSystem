import * as React from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { cn } from "../../lib/cn";

const SearchBox = React.forwardRef(
  (
    {
      value,
      onChange,
      onFilterClick,
      // The attached filter panel's open state. Distinct from focus: the
      // panel can stay open while focus has moved to one of its own dropdown
      // fields, and the box should keep reading as "expanded" throughout,
      // not just for the instant something inside it happens to have focus.
      filtersOpen = false,
      placeholder = "Search Data",
      enableShortcut = true,
      showShortcutKey = true,
      className,
      ...props
    },
    ref
  ) => {
    const internalRef = React.useRef(null);
    const inputRef = ref || internalRef;

    // Detect Mac vs Windows/Linux platform
    const isMac = React.useSyncExternalStore(
      () => () => {},
      () => (typeof navigator !== "undefined" ? /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent) : false),
      () => false
    );

    React.useEffect(() => {
      if (!enableShortcut) return;
      function onKeyDown(e) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
          e.preventDefault();
          if (typeof inputRef === "object" && inputRef?.current) {
            inputRef.current.focus();
            inputRef.current.select();
          }
        }
      }
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }, [enableShortcut, inputRef]);

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onChange?.("");
        if (typeof inputRef === "object" && inputRef?.current) {
          inputRef.current.blur();
        }
      }
      props.onKeyDown?.(e);
    }

    return (
      <div
        className={cn(
          "flex h-11 md:h-8 w-full min-w-[140px] items-center gap-2 border bg-input px-2.5 transition-all",
          filtersOpen
            ? // Reads as one attached surface with the panel beneath it: a flat
              // bottom edge and a matching solid border, no gap at the seam
              // between the two.
              "rounded-t-md rounded-b-none border-accent"
            : // A solid border, same as the attached state above — not a
              // `ring` glow, which read as a different, softer treatment for
              // what is meant to be the same "this is active" signal. Scoped
              // to the text input's own focus (`has-[input:focus]`), not
              // `focus-within` — the filter and clear buttons live in this
              // same box, and focus-within lit this the moment either was
              // *clicked*, not just when the box was actually being typed in.
              "rounded-md border-card-border has-[input:focus]:border-accent",
          className
        )}
      >
        <Search size={14} className="shrink-0 text-ink-muted" />
        <input
          ref={inputRef}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full min-w-0 bg-transparent text-body-sm text-ink-primary placeholder:text-ink-muted focus:outline-none"
          {...props}
        />
        {value ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onChange?.("")}
            className="text-ink-muted hover:text-ink-primary shrink-0 p-0.5 rounded cursor-pointer"
          >
            <X size={14} />
          </button>
        ) : (
          enableShortcut &&
          showShortcutKey && (
            <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border border-card-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-ink-muted shrink-0 select-none">
              {isMac ? "⌘K" : "Ctrl+K"}
            </kbd>
          )
        )}
        {onFilterClick && (
          <button
            type="button"
            aria-label="Filters"
            onClick={onFilterClick}
            className="text-ink-muted hover:text-accent shrink-0 p-0.5 rounded cursor-pointer"
          >
            <SlidersHorizontal size={16} />
          </button>
        )}
      </div>
    );
  }
);

SearchBox.displayName = "SearchBox";
export { SearchBox };
