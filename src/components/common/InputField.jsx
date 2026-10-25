import * as React from "react";
import { cn } from "../../lib/cn";
import { FormGroup } from "./FormGroup";

const InputField = React.forwardRef(
  ({ label, required, requiredText, error, hint, icon, id, className, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    return (
      <FormGroup label={label} htmlFor={inputId} required={required} requiredText={requiredText} error={error} hint={hint}>
        <div className="relative">
          {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">{icon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "h-11 md:h-10 w-full rounded-control border bg-input px-3 text-body text-ink-primary placeholder:text-ink-muted",
              "focus:outline-none focus:ring-2 focus:ring-accent/40",
              error ? "border-status-offline" : "border-card-border",
              icon && "pl-9",
              className
            )}
            aria-invalid={!!error}
            {...props}
          />
        </div>
      </FormGroup>
    );
  }
);

InputField.displayName = "InputField";

export { InputField };
