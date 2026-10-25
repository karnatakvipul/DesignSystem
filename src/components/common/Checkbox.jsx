import * as React from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "../../lib/cn";

const Checkbox = React.forwardRef(
  ({ label, id, className, checked, indeterminate = false, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const innerRef = React.useRef(null);

    // `indeterminate` is a DOM *property*, not an HTML attribute — it has no
    // markup form and can only be set imperatively. Passing it through JSX
    // would make React warn ("Received `false` for a non-boolean attribute")
    // and the tri-state would never actually render, so it's pulled out of
    // `props` above and applied to the node here instead.
    React.useEffect(() => {
      if (innerRef.current) innerRef.current.indeterminate = Boolean(indeterminate);
    }, [indeterminate]);

    // Keep the caller's ref working while still holding our own handle on the node.
    const setRefs = React.useCallback(
      (node) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    const showIndeterminate = Boolean(indeterminate) && !checked;

    return (
      <label htmlFor={inputId} className="inline-flex cursor-pointer items-center gap-2 select-none">
        <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
          <input
            ref={setRefs}
            id={inputId}
            type="checkbox"
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <span
            className={cn(
              "h-4 w-4 rounded border border-card-border bg-input transition-colors",
              "peer-checked:border-accent peer-checked:bg-accent",
              "peer-indeterminate:border-accent peer-indeterminate:bg-accent",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40",
              className
            )}
          />
          {checked && (
            <Check size={12} strokeWidth={3} className="pointer-events-none absolute text-white" />
          )}
          {showIndeterminate && (
            <Minus size={12} strokeWidth={3} className="pointer-events-none absolute text-white" />
          )}
        </span>
        {label && <span className="text-body text-ink-primary">{label}</span>}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
