import * as React from "react";
import { ChevronDown, Loader2, Search, X, Check } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * AsyncMultiSelectDropdown Component.
 * Multi-select dropdown bound to remote/async server endpoints with debounced option search.
 *
 * @param {Object} props
 * @param {Function} props.loadOptions Async function (searchQuery) => Promise<Array<{ value, label }>>
 * @param {Array<string|number>} props.value Currently selected values array
 * @param {Function} props.onChange Callback (selectedValuesArray) => void
 * @param {string} [props.label] Input label
 * @param {string} [props.placeholder="Select items..."]
 * @param {number} [props.debounceMs=300]
 * @param {boolean} [props.disabled=false]
 * @param {string} [props.className]
 */
export function AsyncMultiSelectDropdown({
  loadOptions,
  value = [],
  onChange,
  label,
  placeholder = "Select items...",
  debounceMs = 300,
  disabled = false,
  className,
}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [options, setOptions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const dropdownRef = React.useRef(null);
  const requestIdRef = React.useRef(0);

  const selectedValues = React.useMemo(() => (value || []).map(String), [value]);
  const selectedSet = React.useMemo(() => new Set(selectedValues), [selectedValues]);

  // Fetch remote options (stale responses are discarded)
  const fetchOptions = React.useCallback(
    async (query) => {
      if (!loadOptions) return;
      const requestId = ++requestIdRef.current;
      setLoading(true);
      setError(null);
      try {
        const res = await loadOptions(query);
        if (requestId !== requestIdRef.current) return;
        const list = Array.isArray(res) ? res : res?.options || res?.data || [];
        setOptions(list);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(err?.message || "Failed to load options");
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    },
    [loadOptions]
  );

  // Debounced search trigger
  React.useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      fetchOptions(search);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [search, open, fetchOptions, debounceMs]);

  // Initial fetch
  React.useEffect(() => {
    if (open && options.length === 0 && !loading) {
      fetchOptions("");
    }
  }, [open, options.length, loading, fetchOptions]);

  // Click outside to close
  React.useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  function toggleOption(optValue) {
    const valStr = String(optValue);
    const next = selectedSet.has(valStr)
      ? value.filter((v) => String(v) !== valStr)
      : [...value, optValue];
    onChange?.(next);
  }

  const displayText =
    value.length === 0
      ? placeholder
      : `${value.length} item${value.length === 1 ? "" : "s"} selected`;

  return (
    <div className={cn("relative flex flex-col gap-1 w-full text-left select-none", className)} ref={dropdownRef}>
      {label && (
        <label className="text-body-sm font-semibold text-ink-secondary tracking-wide uppercase">
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex h-11 md:h-10 w-full items-center justify-between rounded-surface border border-card-border bg-card px-3.5 py-2 text-body-sm font-medium text-ink-primary shadow-sm transition-colors hover:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50 min-h-[40px]",
          value.length === 0 && "text-ink-muted"
        )}
      >
        <span className="truncate">{displayText}</span>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {value.length > 0 && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange?.([]);
              }}
              className="p-1 hover:text-status-offline rounded-md transition-colors cursor-pointer"
              title="Clear all selections"
            >
              <X size={12} />
            </span>
          )}
          <ChevronDown size={14} className={cn("text-ink-muted transition-transform duration-200", open && "rotate-180")} />
        </div>
      </button>

      {/* Popover Menu */}
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-surface border border-card-border bg-card p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {/* Search box inside dropdown */}
          <div className="relative mb-2">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search remote items..."
              autoFocus
              className="w-full rounded-control border border-card-border bg-canvas py-1.5 pl-8 pr-3 text-body-sm text-ink-primary placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent min-h-[32px]"
            />
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-auto flex flex-col gap-0.5">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-4 text-body-sm text-ink-muted">
                <Loader2 size={14} className="animate-spin text-accent" />
                <span>Searching server...</span>
              </div>
            ) : error ? (
              <div className="p-3 text-center text-body-sm text-status-offline">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => fetchOptions(search)}
                  className="mt-1 text-accent underline cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : options.length === 0 ? (
              <div className="py-3 text-center text-body-sm text-ink-muted">
                No matching results found.
              </div>
            ) : (
              options.map((opt) => {
                const isSelected = selectedSet.has(String(opt.value));
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleOption(opt.value)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-control px-2.5 py-2 text-body-sm text-left transition-colors cursor-pointer min-h-[34px]",
                      isSelected
                        ? "bg-accent-muted text-accent font-semibold"
                        : "text-ink-primary hover:bg-canvas"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-4 h-4 rounded flex items-center justify-center border transition-colors",
                        isSelected ? "bg-accent border-accent text-white" : "border-card-border bg-card"
                      )}>
                        {isSelected && <Check size={12} />}
                      </div>
                      <span>{opt.label}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
