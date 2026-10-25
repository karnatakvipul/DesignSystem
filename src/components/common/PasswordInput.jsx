import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../lib/cn";
import { FormGroup } from "./FormGroup";
const PasswordInput = React.forwardRef(
  ({ label, required, error, hint, icon, id, className, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    return <FormGroup label={label} htmlFor={inputId} required={required} error={error} hint={hint}>
        <div className="relative">
          {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">{icon}</span>}
          <input
      ref={ref}
      id={inputId}
      type={visible ? "text" : "password"}
      className={cn(
        "h-11 md:h-10 w-full rounded-control border bg-input pl-3 pr-10 text-body text-ink-primary placeholder:text-ink-muted",
        "focus:outline-none focus:ring-2 focus:ring-accent/40",
        error ? "border-status-offline" : "border-card-border",
        icon && "pl-9",
        className
      )}
      aria-invalid={!!error}
      {...props}
    />
          <button
      type="button"
      onClick={() => setVisible((v) => !v)}
      aria-label={visible ? "Hide password" : "Show password"}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary"
    >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </FormGroup>;
  }
);
PasswordInput.displayName = "PasswordInput";
export {
  PasswordInput
};
