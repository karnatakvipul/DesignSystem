import * as React from "react";
import { Calendar } from "lucide-react";
import { cn } from "../../lib/cn";
import { FormGroup } from "./FormGroup";

/**
 * DatePicker & DateTimePicker component with native picker trigger.
 * 
 * Props:
 * - label: Form field label
 * - requiredText: Text badge for required state (e.g. "(required)")
 * - showTime: If true, uses datetime-local (date + time picker)
 * - iconPosition: "left" | "right" (default: "right" when icon addon is used)
 * - disablePastDates: If true, disables past dates
 * - value, onChange, min, max, disabled, className
 */
function DatePicker({ 
  label, 
  required, 
  requiredText,
  error, 
  value, 
  onChange = () => {}, 
  showTime = false,
  type,
  iconPosition = "right",
  min, 
  max, 
  disabled, 
  disablePastDates = true,
  className 
}) {
  const id = React.useId();
  const inputRef = React.useRef(null);

  const inputType = type || (showTime ? "datetime-local" : "date");

  // Compute today's date formatted as YYYY-MM-DD for min constraint
  const todayStr = React.useMemo(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return showTime ? `${yyyy}-${mm}-${dd}T00:00` : `${yyyy}-${mm}-${dd}`;
  }, [showTime]);

  const effectiveMin = min ?? (disablePastDates ? todayStr : undefined);

  // Convert custom formatted string like "30-Jul-2026 17:32:30" to HTML input value format (YYYY-MM-DD or YYYY-MM-DDTHH:mm)
  const safeInputValue = React.useMemo(() => {
    if (!value) return "";
    if (typeof value === "string") {
      // If already in YYYY-MM-DD or ISO format
      if (value.match(/^\d{4}-\d{2}-\d{2}/)) {
        // A plain date input rejects timestamps (YYYY-MM-DDTHH:mm...) — strip the time part
        if (!showTime && /^\d{4}-\d{2}-\d{2}T/.test(value)) return value.slice(0, 10);
        return value;
      }

      // Try parsing "30-Jul-2026 17:32:30" or "30-Jul-2026"
      const match = value.match(/^(\d{1,2})[-/ ]([A-Za-z]{3})[-/ ](\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
      if (match) {
        const day = String(match[1]).padStart(2, "0");
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthIdx = months.findIndex((m) => m.toLowerCase() === match[2].toLowerCase());
        if (monthIdx !== -1) {
          const month = String(monthIdx + 1).padStart(2, "0");
          const year = match[3];
          if (showTime && match[4] && match[5]) {
            const hours = String(match[4]).padStart(2, "0");
            const mins = String(match[5]).padStart(2, "0");
            return `${year}-${month}-${day}T${hours}:${mins}`;
          }
          return `${year}-${month}-${day}`;
        }
      }
    }
    return value;
  }, [value, showTime]);

  function handleOpenPicker() {
    if (disabled) return;
    if (inputRef.current) {
      if (typeof inputRef.current.showPicker === "function") {
        try {
          inputRef.current.showPicker();
        } catch {
          inputRef.current.focus();
        }
      } else {
        inputRef.current.focus();
      }
    }
  }

  return (
    <FormGroup label={label} htmlFor={id} required={required} requiredText={requiredText} error={error} className={className}>
      <div 
        onClick={handleOpenPicker}
        className={cn(
          "flex h-11 md:h-10 w-full items-center rounded-md border bg-input overflow-hidden transition-all cursor-pointer",
          "focus-within:ring-2 focus-within:ring-accent/40 focus-within:border-accent",
          disabled && "opacity-50 cursor-not-allowed",
          error ? "border-status-offline" : "border-card-border"
        )}
      >
        {/* Left Icon if position is left */}
        {iconPosition === "left" && (
          <div className="flex h-full items-center justify-center border-r border-card-border/80 bg-card/60 px-3 text-ink-muted shrink-0 select-none">
            <Calendar size={16} />
          </div>
        )}

        {/* Input */}
        <input
          ref={inputRef}
          id={id}
          type={inputType}
          value={safeInputValue}
          min={effectiveMin}
          max={max}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="h-full w-full min-w-0 bg-transparent px-3 text-body text-ink-primary placeholder:text-ink-muted focus:outline-none cursor-pointer disabled:cursor-not-allowed [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />

        {/* Right Icon Addon Box if position is right */}
        {iconPosition === "right" && (
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenPicker();
            }}
            disabled={disabled}
            className="flex h-full items-center justify-center border-l border-card-border/80 bg-card/60 px-3 text-ink-muted hover:text-ink-primary hover:bg-card transition-colors shrink-0 cursor-pointer select-none"
          >
            <Calendar size={16} />
          </button>
        )}
      </div>
    </FormGroup>
  );
}

// Alias for DayDatePicker
const DayDatePicker = DatePicker;

export { DatePicker, DayDatePicker };
