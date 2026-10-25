import * as React from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";
import { FormGroup } from "./FormGroup";
import { Button } from "./Button";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FULL_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const PRESETS = [
  "This Financial Year",
  "This Month",
  "Last Month",
  "Next Month",
  "This Quarter",
  "This Year",
  "Last Year",
  "Custom Range",
];

/** Failsafe Date parser supporting Date objects, timestamps, and DD-MMM-YYYY or YYYY-MM-DD strings */
function parseDate(val) {
  if (!val) return null;
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }
  if (typeof val === "number") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof val === "string") {
    const str = val.trim();
    if (!str) return null;

    // Plain "YYYY-MM-DD" strings are parsed as UTC midnight by `new Date(str)`
    // per spec, while every getter used elsewhere (getDate/getMonth/getFullYear)
    // reads local time — in timezones behind UTC this silently shifts the
    // calendar day back by one. Parse date-only strings via local components
    // before falling back to the generic constructor.
    const isoDateOnly = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoDateOnly) {
      const year = parseInt(isoDateOnly[1], 10);
      const month = parseInt(isoDateOnly[2], 10) - 1;
      const day = parseInt(isoDateOnly[3], 10);
      const localD = new Date(year, month, day);
      if (!isNaN(localD.getTime())) return localD;
    }

    // Try standard Date constructor
    let d = new Date(str);
    if (!isNaN(d.getTime())) return d;

    // Try DD-MMM-YYYY (e.g. "31-Jul-2026")
    const matchDmy = str.match(/^(\d{1,2})[-/ ]([A-Za-z]{3})[-/ ](\d{4})/);
    if (matchDmy) {
      const day = parseInt(matchDmy[1], 10);
      const monthStr = matchDmy[2];
      const year = parseInt(matchDmy[3], 10);
      const monthIdx = MONTHS.findIndex((m) => m.toLowerCase() === monthStr.toLowerCase());
      if (monthIdx !== -1) {
        d = new Date(year, monthIdx, day);
        if (!isNaN(d.getTime())) return d;
      }
    }

    // Try YYYY-MM-DD
    const matchYmd = str.match(/^(\d{4})[-/ ](\d{1,2})[-/ ](\d{1,2})/);
    if (matchYmd) {
      const year = parseInt(matchYmd[1], 10);
      const month = parseInt(matchYmd[2], 10) - 1;
      const day = parseInt(matchYmd[3], 10);
      d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }
  }
  return null;
}

/** Formats a date cleanly as DD-MMM-YYYY (e.g. "31-Jul-2026"). Never outputs NaN-undefined-NaN. */
function fmt(d) {
  const parsed = parseDate(d);
  if (!parsed) return "";
  const day = String(parsed.getDate()).padStart(2, "0");
  const month = MONTHS[parsed.getMonth()] || "";
  const year = parsed.getFullYear();
  return `${day}-${month}-${year}`;
}

function presetRange(preset, today = new Date()) {
  const y = today.getFullYear();
  const m = today.getMonth();
  switch (preset) {
    case "This Financial Year": {
      const startYear = m >= 3 ? y : y - 1;
      return { from: new Date(startYear, 3, 1), to: new Date(startYear + 1, 2, 31) };
    }
    case "This Month":
      return { from: new Date(y, m, 1), to: new Date(y, m + 1, 0) };
    case "Last Month":
      return { from: new Date(y, m - 1, 1), to: new Date(y, m, 0) };
    case "Next Month":
      return { from: new Date(y, m + 1, 1), to: new Date(y, m + 2, 0) };
    case "This Quarter": {
      const qStart = Math.floor(m / 3) * 3;
      return { from: new Date(y, qStart, 1), to: new Date(y, qStart + 3, 0) };
    }
    case "This Year":
      return { from: new Date(y, 0, 1), to: new Date(y, 11, 31) };
    case "Last Year":
      return { from: new Date(y - 1, 0, 1), to: new Date(y - 1, 11, 31) };
    default:
      return { from: null, to: null };
  }
}

function MonthGrid({
  year,
  month,
  from,
  to,
  hoverDate,
  onPick,
  onHover,
  disablePastDates = false,
}) {
  const first = new Date(year, month, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parsedFrom = parseDate(from);
  const parsedTo = parseDate(to);
  if (parsedFrom) parsedFrom.setHours(0, 0, 0, 0);
  if (parsedTo) parsedTo.setHours(0, 0, 0, 0);

  function isPast(day) {
    if (!day) return false;
    const cellDate = new Date(year, month, day);
    cellDate.setHours(0, 0, 0, 0);
    return cellDate < today;
  }

  function getCellTime(day) {
    if (!day) return 0;
    return new Date(year, month, day).getTime();
  }

  function isInRange(day) {
    if (!day || !parsedFrom) return false;
    const t = getCellTime(day);
    const endT = parsedTo ? parsedTo.getTime() : hoverDate ? hoverDate.getTime() : null;
    if (!endT) return false;
    const minT = Math.min(parsedFrom.getTime(), endT);
    const maxT = Math.max(parsedFrom.getTime(), endT);
    return t >= minT && t <= maxT;
  }

  function isFromDate(day) {
    if (!day || !parsedFrom) return false;
    return getCellTime(day) === parsedFrom.getTime();
  }

  function isToDate(day) {
    if (!day || !parsedTo) return false;
    return getCellTime(day) === parsedTo.getTime();
  }

  return (
    <div>
      <p className="mb-2.5 text-center text-body-sm font-semibold text-ink-primary select-none">
        {FULL_MONTHS[month]} {year}
      </p>
      <div className="grid grid-cols-7 gap-y-1 text-center text-body-sm">
        {DAYS.map((d) => (
          <span key={d} className="text-ink-muted font-medium py-1 select-none">
            {d}
          </span>
        ))}
        {cells.map((day, i) => {
          if (!day) {
            return <div key={i} className="h-8 w-8" />;
          }

          const pastDisabled = disablePastDates && isPast(day);
          const activeFrom = isFromDate(day);
          const activeTo = isToDate(day);
          const inRange = isInRange(day);

          return (
            <button
              type="button"
              key={i}
              disabled={pastDisabled}
              onClick={() => !pastDisabled && onPick(new Date(year, month, day))}
              onMouseEnter={() => !pastDisabled && onHover && onHover(new Date(year, month, day))}
              className={cn(
                "h-8 w-8 flex items-center justify-center text-body-sm font-medium transition-all select-none mx-auto cursor-pointer",
                pastDisabled && "opacity-30 cursor-not-allowed text-ink-muted bg-input/40",
                !pastDisabled && !activeFrom && !activeTo && !inRange && "text-ink-primary hover:bg-accent-muted/50 rounded-control",
                // `bg-accent-muted` is the badge-fill token (`#eff6ff` on the
                // light themes), not a foreground — diluted at 40% over a
                // white/near-white card it composites to within ~1.03:1 of
                // the card itself, so the connecting band between the two
                // selected endpoints was effectively invisible (same mistake,
                // same fix as DataTable's row-selection background: dilute
                // the accent *foreground* instead, which is a colour meant to
                // be seen against the card).
                inRange && !activeFrom && !activeTo && "bg-accent/15 text-ink-primary",
                (activeFrom || activeTo) && "bg-accent text-white font-semibold shadow-xs rounded-none z-10"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DateRangePicker({
  label,
  required,
  requiredText,
  error,
  value,
  startDate,
  endDate,
  onChange = () => {},
  disablePastDates = false,
  className,
}) {
  const usesLegacyValueProps = startDate !== undefined || endDate !== undefined;
  // Supports the current value={{ from, to }} API and the previous startDate/endDate API.
  const safeValue = React.useMemo(() => {
    const sourceValue = value ?? (usesLegacyValueProps ? { from: startDate, to: endDate } : null);
    if (!sourceValue) return { from: null, to: null };
    if (typeof sourceValue === "string" && sourceValue.includes(" - ")) {
      const [fromStr, toStr] = sourceValue.split(" - ");
      return { from: parseDate(fromStr), to: parseDate(toStr) };
    }
    if (typeof sourceValue === "object") {
      return { from: parseDate(sourceValue.from), to: parseDate(sourceValue.to) };
    }
    return { from: null, to: null };
  }, [value, startDate, endDate, usesLegacyValueProps]);

  const [open, setOpen] = React.useState(false);
  const [preset, setPreset] = React.useState("Custom Range");
  const [pending, setPending] = React.useState(safeValue);
  const [hoverDate, setHoverDate] = React.useState(null);

  const initialViewDate = safeValue.from || new Date();
  const [viewMonth, setViewMonth] = React.useState(() => initialViewDate.getMonth());
  const [viewYear, setViewYear] = React.useState(() => initialViewDate.getFullYear());
  const triggerRef = React.useRef(null);
  const popoverRef = React.useRef(null);
  const [popoverStyle, setPopoverStyle] = React.useState(null);

  const positionPopover = React.useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const POPOVER_WIDTH = 640;
    const POPOVER_HEIGHT = 410;
    const POPOVER_OFFSET = 6;
    const PADDING = 12;

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const spaceBelow = viewportHeight - rect.bottom - POPOVER_OFFSET;
    const spaceAbove = rect.top - POPOVER_OFFSET;

    let top = null;
    let bottom = null;
    const maxHeight = Math.min(POPOVER_HEIGHT, viewportHeight - PADDING * 2);

    if (spaceBelow >= POPOVER_HEIGHT) {
      // Plenty of room below
      top = rect.bottom + POPOVER_OFFSET;
    } else if (spaceAbove >= POPOVER_HEIGHT || spaceAbove > spaceBelow) {
      // Not enough room below, flip above trigger
      bottom = viewportHeight - rect.top + POPOVER_OFFSET;
      // If flipping above extends above the viewport top edge, clamp to top padding
      if (rect.top - POPOVER_OFFSET - POPOVER_HEIGHT < PADDING) {
        bottom = null;
        top = PADDING;
      }
    } else {
      // Neither fits comfortably: clamp from bottom of viewport so it's fully visible
      top = Math.max(PADDING, viewportHeight - POPOVER_HEIGHT - PADDING);
    }

    // Horizontal positioning: align to right if near right edge, otherwise align to left
    const targetWidth = Math.min(POPOVER_WIDTH, viewportWidth - PADDING * 2);
    let left;
    if (rect.left + targetWidth > viewportWidth - PADDING) {
      left = rect.right - targetWidth;
    } else {
      left = rect.left;
    }
    // Hard clamp within viewport boundaries
    left = Math.max(PADDING, Math.min(left, viewportWidth - targetWidth - PADDING));

    setPopoverStyle({
      position: "fixed",
      left: `${left}px`,
      width: `${targetWidth}px`,
      maxWidth: `calc(100vw - ${PADDING * 2}px)`,
      maxHeight: `${maxHeight}px`,
      overflowY: "auto",
      zIndex: 9999,
      ...(top !== null ? { top: `${top}px` } : {}),
      ...(bottom !== null ? { bottom: `${bottom}px` } : {}),
    });
  }, []);

  React.useLayoutEffect(() => {
    if (!open) return undefined;

    positionPopover();

    const reposition = () => positionPopover();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);

    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open, positionPopover]);

  // Sync state when value changes or popover opens
  React.useEffect(() => {
    setPending(safeValue);
    if (safeValue.from) {
      setViewMonth(safeValue.from.getMonth());
      setViewYear(safeValue.from.getFullYear());
    }
  }, [open, safeValue]);

  React.useEffect(() => {
    function onClickOutside(e) {
      const inTrigger = triggerRef.current && triggerRef.current.contains(e.target);
      const inPopover = popoverRef.current && popoverRef.current.contains(e.target);
      if (!inTrigger && !inPopover) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function pickPreset(p) {
    setPreset(p);
    if (p !== "Custom Range") {
      const range = presetRange(p);
      setPending(range);
      if (range.from) {
        setViewMonth(range.from.getMonth());
        setViewYear(range.from.getFullYear());
      }
    }
  }

  function pickDay(d) {
    setPreset("Custom Range");
    if (!pending.from || (pending.from && pending.to)) {
      setPending({ from: d, to: null });
    } else if (d < pending.from) {
      setPending({ from: d, to: pending.from });
    } else {
      setPending({ from: pending.from, to: d });
    }
  }

  function goPrevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function emitChange(nextValue) {
    if (usesLegacyValueProps) {
      onChange(nextValue.from, nextValue.to);
    } else {
      onChange(nextValue);
    }
  }

  function handleApply() {
    emitChange(pending);
    setOpen(false);
  }

  function handleClear() {
    const cleared = { from: null, to: null };
    setPending(cleared);
    emitChange(cleared);
    setOpen(false);
  }

  const displayText = React.useMemo(() => {
    if (typeof value === "string" && value && !value.includes("NaN")) return value;
    if (safeValue.from && safeValue.to) return `${fmt(safeValue.from)} - ${fmt(safeValue.to)}`;
    if (safeValue.from) return `${fmt(safeValue.from)} - ...`;
    return "Select date range";
  }, [value, safeValue]);

  const pendingDisplayText = React.useMemo(() => {
    if (pending.from && pending.to) return `${fmt(pending.from)} - ${fmt(pending.to)}`;
    if (pending.from) return `${fmt(pending.from)} - Select end date`;
    return "Select date range";
  }, [pending]);

  const nextMonthVal = viewMonth === 11 ? 0 : viewMonth + 1;
  const nextMonthYear = viewMonth === 11 ? viewYear + 1 : viewYear;

  const popover = open ? (
    <div
      ref={popoverRef}
      data-portal-popover="true"
      style={popoverStyle || undefined}
      className="fixed z-[9999] flex w-[640px] max-w-[calc(100vw-24px)] overflow-hidden rounded-surface border border-card-border bg-card shadow-2xl flex-col sm:flex-row animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Presets Sidebar */}
      <div className="w-full sm:w-36 md:w-40 shrink-0 border-b sm:border-b-0 sm:border-r border-card-border/80 bg-card-bg/40 py-2 overflow-x-auto flex sm:flex-col">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => pickPreset(p)}
            className={cn(
              "block w-full shrink-0 px-3 py-2 text-left text-body-sm font-medium whitespace-nowrap sm:whitespace-normal transition-colors cursor-pointer",
              preset === p
                ? "bg-accent text-white font-semibold"
                : "text-ink-primary hover:bg-accent-muted/40"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Calendar Main Grid */}
      <div className="flex-1 p-3 flex flex-col justify-between">
        {/* Header Navigation */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={goPrevMonth}
              aria-label="Previous month"
              className="flex h-7 w-7 items-center justify-center rounded-control text-ink-muted hover:bg-accent-muted/40 hover:text-ink-primary transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={goNextMonth}
              aria-label="Next month"
              className="flex h-7 w-7 items-center justify-center rounded-control text-ink-muted hover:bg-accent-muted/40 hover:text-ink-primary transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MonthGrid
              year={viewYear}
              month={viewMonth}
              from={pending.from}
              to={pending.to}
              hoverDate={hoverDate}
              onPick={pickDay}
              onHover={setHoverDate}
              disablePastDates={disablePastDates}
            />
            <div className="hidden sm:block">
              <MonthGrid
                year={nextMonthYear}
                month={nextMonthVal}
                from={pending.from}
                to={pending.to}
                hoverDate={hoverDate}
                onPick={pickDay}
                onHover={setHoverDate}
                disablePastDates={disablePastDates}
              />
            </div>
          </div>
        </div>

        {/* Footer Display & Buttons */}
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-card-border/80 pt-3 gap-2">
          <span className="text-body-sm font-mono text-ink-secondary truncate max-w-[220px]">
            {pendingDisplayText}
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button variant="ghost" size="sm" onClick={handleClear} className="text-body-sm">
              Clear
            </Button>
            <Button variant="cancel" size="sm" onClick={() => setOpen(false)} className="text-body-sm">
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleApply}
              disabled={!pending.from}
              className="text-body-sm"
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <FormGroup label={label} required={required} requiredText={requiredText} error={error} className={className}>
      <div ref={triggerRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex h-11 md:h-10 w-full items-center gap-2 rounded-md border bg-input px-3 text-left text-body cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-accent/40",
            error ? "border-status-offline" : "border-card-border"
          )}
        >
          <Calendar size={16} className="shrink-0 text-ink-muted" />
          <span className={safeValue.from || (typeof value === "string" && value) ? "text-ink-primary font-medium" : "text-ink-muted"}>
            {displayText}
          </span>
        </button>
      </div>

      {typeof document !== "undefined" && popover ? createPortal(popover, document.body) : null}
    </FormGroup>
  );
}

export { DateRangePicker };