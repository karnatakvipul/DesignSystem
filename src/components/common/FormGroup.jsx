import { cn } from "../../lib/cn";
import { ValidationMessage } from "./ValidationMessage";

function FormGroup({ label, htmlFor, required, requiredText, error, hint, className, children, ...props }) {
  return (
    <div className={cn("flex flex-col", className)} {...props}>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 text-body-sm font-semibold text-ink-primary select-none flex items-center justify-start gap-1">
          <span>{label}</span>
          {requiredText ? (
            <span className="text-body-sm font-normal text-status-offline">{requiredText}</span>
          ) : (
            required && <span className="ml-0.5 text-status-offline">*</span>
          )}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-body-sm text-ink-muted">{hint}</p>}
      <ValidationMessage>{error}</ValidationMessage>
    </div>
  );
}

export { FormGroup };
