import * as React from "react";
import { cn } from "../../lib/cn";
import { FormGroup } from "./FormGroup";

/**
 * Standalone, reusable SegmentedControl (Toggle Button Group) component.
 * Allows users to switch between exclusive options (e.g. Issue Date vs Activation Date).
 * 
 * Props:
 * - label: Optional field label string
 * - requiredText: Text badge for required state (e.g. "(required)")
 * - options: Array of option objects [{ value: 'a', label: 'Option A' }] or array of strings ['A', 'B']
 * - value: Currently selected option value
 * - onChange: Callback function receiving selected value (val) => {}
 * - error: Error message string
 * - wrap: Render as auto-width pills that wrap onto multiple lines instead of
 *   equal-width segments on a single fixed-height track. Use this when labels
 *   are long or numerous (e.g. filter chips in a narrow panel), where equal-width
 *   segments would clip the text.
 * - className: Optional container CSS classes
 */
function SegmentedControl({
  label,
  required,
  requiredText,
  error,
  options = [],
  value,
  onChange = () => {},
  wrap = false,
  className,
}) {
  return (
    <FormGroup label={label} required={required} requiredText={requiredText} error={error} className={className}>
      <div
        className={cn(
          wrap
            ? "flex flex-wrap w-full gap-2"
            : "flex h-11 md:h-10 w-full rounded-md border border-card-border bg-input p-1 gap-1"
        )}
      >
        {options.map((opt) => {
          const optValue = typeof opt === "object" ? opt.value : opt;
          const optLabel = typeof opt === "object" ? opt.label : opt;
          const isSelected = value === optValue;

          return (
            <button
              key={optValue}
              type="button"
              onClick={() => onChange(optValue)}
              // A plain string label is safe to expose as a native title for the
              // full text; JSX labels are skipped since they can't be stringified.
              title={typeof optLabel === "string" ? optLabel : undefined}
              className={cn(
                "rounded-md text-body-sm font-semibold transition-all cursor-pointer select-none",
                wrap
                  ? "border px-3 py-1.5 min-h-[34px]"
                  // Equal-width segments must be allowed to shrink, otherwise a
                  // long label overflows the track instead of ellipsizing.
                  : "flex-1 min-w-0 truncate px-2",
                isSelected
                  ? wrap
                    ? "bg-accent text-white border-accent"
                    : "bg-accent text-white shadow-xs"
                  : wrap
                  ? "bg-card text-ink-secondary border-card-border hover:text-ink-primary hover:bg-accent-muted/40"
                  : "text-ink-secondary hover:text-ink-primary hover:bg-card/40"
              )}
            >
              {optLabel}
            </button>
          );
        })}
      </div>
    </FormGroup>
  );
}

export { SegmentedControl };
