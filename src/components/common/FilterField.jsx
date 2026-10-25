import * as React from "react";
import { cn } from "../../lib/cn";
import { Checkbox } from "./Checkbox";

/**
 * One labelled row in a filter panel — label on the left, control on the right.
 *
 * `FormGroup` stacks its label above the control, which is right for a form
 * you fill in top to bottom. A filter panel is scanned rather than filled: you
 * run your eye down the labels looking for the one you want, so the labels
 * need to line up in a column of their own. That is a different layout, not a
 * variant of the same one, which is why this is its own component.
 *
 * Any control can sit inside — `Dropdown`, `InputField`, `DatePicker` — since
 * the row only owns the label and the alignment.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.label Shown on the left.
 * @param {string} [props.htmlFor] Id of the control, so clicking the label focuses it.
 * @param {"left"|"right"} [props.labelAlign="right"] Text alignment within the
 *   label column. Right (the default) sits the label close to its control;
 *   left keeps every label flush to the panel's edge regardless of length.
 * @param {React.ReactNode} props.children The control itself.
 */
function FilterField({ label, htmlFor, className, children, labelAlign = "right", ...props }) {
  return (
    <div
      className={cn(
        // Stacks on narrow screens: at panel widths a side-by-side label and
        // control would squeeze the control down to nothing.
        "flex flex-col gap-1 sm:grid sm:grid-cols-[minmax(6rem,11rem)_1fr] sm:items-center sm:gap-3",
        className
      )}
      {...props}
    >
      <label
        htmlFor={htmlFor}
        className={cn(
          "text-body-sm font-semibold text-ink-primary select-none",
          labelAlign === "left" ? "sm:text-left" : "sm:text-right"
        )}
      >
        {label}
      </label>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/**
 * A full-width on/off row for a filter panel — label on the left, checkbox on
 * the right, sitting on its own tinted bar.
 *
 * These read as a distinct kind of filter from the labelled dropdowns above
 * them: a dropdown narrows to a chosen value, whereas this simply switches an
 * extra condition on. The bar is what carries that difference visually, so the
 * two groups don't blur together in a long scrolling panel.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.label
 * @param {boolean} props.checked
 * @param {(checked: boolean) => void} props.onChange Receives the new state directly.
 */
function FilterToggle({ label, checked = false, onChange, className, ...props }) {
  const id = React.useId();

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-md bg-tag px-3 py-2 transition-colors hover:bg-accent-muted/40",
        className
      )}
      {...props}
    >
      <label htmlFor={id} className="text-body-sm font-medium text-ink-primary select-none cursor-pointer">
        {label}
      </label>
      <Checkbox
        id={id}
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
      />
    </div>
  );
}

export { FilterField, FilterToggle };
