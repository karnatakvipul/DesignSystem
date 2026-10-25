import * as React from "react";
import { Grid3x3, Check } from "lucide-react";
import { cn } from "../../lib/cn";
import { IconButton } from "./IconButton";
import { Checkbox } from "./Checkbox";
import { BottomSheet } from "./BottomSheet";

const BOILERPLATE_COLS = [
  { key: "id", label: "ID", required: true },
  { key: "name", label: "NAME", required: true },
  { key: "status", label: "STATUS", required: true }
];

const DEFAULT_REQUIRED_KEYS = ["account", "name", "status"];

function ColumnFilterDropdown({
  columns = BOILERPLATE_COLS,
  visible = ["id", "name", "status"],
  requiredKeys = DEFAULT_REQUIRED_KEYS,
  onChange = () => {},
  className
}) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef(null);

  const isRequired = React.useCallback(
    (col) => {
      const key = typeof col === "string" ? col : col?.key;
      if (!key) return false;
      if (typeof col === "object" && (col.required === true || col.locked === true || col.disabled === true || col.unselectable === false)) {
        return true;
      }
      return requiredKeys.includes(key);
    },
    [requiredKeys]
  );

  const isMobile = React.useSyncExternalStore(
    (cb) => {
      if (typeof window === "undefined") return () => {};
      const mql = window.matchMedia("(max-width: 767px)");
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    },
    () => (typeof window !== "undefined" ? window.matchMedia("(max-width: 767px)").matches : false),
    () => false
  );

  React.useEffect(() => {
    function onClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function toggle(key) {
    const col = columns.find((c) => (typeof c === "string" ? c === key : c.key === key)) || { key };
    if (isRequired(col) && visible.includes(key)) {
      return; // Cannot unselect required columns
    }
    onChange(visible.includes(key) ? visible.filter((k) => k !== key) : [...visible, key]);
  }

  function selectAll() {
    onChange(columns.map((c) => (typeof c === "string" ? c : c.key)));
  }

  function clearAll() {
    // Keep required/locked columns visible when clearing all
    const required = columns
      .filter((c) => isRequired(c))
      .map((c) => (typeof c === "string" ? c : c.key));
    onChange(required);
  }

  const content = (
    <div className="flex flex-col gap-2 p-1">
      <div className="flex items-center justify-end border-b border-card-border/60 pb-2 px-1">
        <div className="flex items-center gap-2 text-body-sm">
          <button
            type="button"
            onClick={selectAll}
            className="text-accent hover:underline font-medium cursor-pointer"
          >
            All
          </button>
          <span className="text-card-border">•</span>
          <button
            type="button"
            onClick={clearAll}
            className="text-ink-muted hover:text-ink-primary font-medium cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1 max-h-64 overflow-y-auto pr-1">
        {columns.map((col) => {
          const colKey = typeof col === "string" ? col : col.key;
          const colLabel = typeof col === "string" ? col : (col.label || col.header || col.key);
          const locked = isRequired(col);
          const isChecked = visible.includes(colKey) || locked;
          return (
            <label
              key={colKey}
              onClick={(e) => {
                if (locked) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              title={locked ? `${colLabel} is a required column` : undefined}
              className={cn(
                "flex items-center justify-between rounded-control px-2.5 py-2 text-body-sm sm:text-sm font-medium transition-colors select-none min-h-[36px]",
                locked ? "cursor-not-allowed opacity-75 bg-canvas/30 text-ink-muted" : "cursor-pointer",
                !locked && (isChecked ? "bg-accent-muted/40 text-ink-primary" : "text-ink-secondary hover:bg-canvas")
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Checkbox checked={isChecked} disabled={locked} onChange={() => toggle(colKey)} />
                <span className="truncate">{colLabel}</span>
              </div>
              {isChecked && (
                <Check size={14} className={cn("shrink-0", locked ? "text-accent/60" : "text-accent")} />
              )}
            </label>
          );
        })}
      </div>
    </div>
  );

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <IconButton
        icon={<Grid3x3 size={16} />}
        label="Choose columns"
        onClick={() => setOpen((v) => !v)}
        variant={open ? "active" : "idle"}
      />

      {/* Mobile: Clean Bottom Sheet */}
      {isMobile ? (
        <BottomSheet open={open} onClose={() => setOpen(false)} title="Choose Columns">
          {content}
        </BottomSheet>
      ) : (
        /* Desktop: Viewport-clamped High Z-Index Floating Popover */
        open && (
          <div className="absolute right-0 top-10 z-50 w-60 rounded-surface border border-card-border bg-card/95 backdrop-blur-md p-2 shadow-2xl animate-in fade-in slide-in-from-top-2">
            {content}
          </div>
        )
      )}
    </div>
  );
}

export { ColumnFilterDropdown };
