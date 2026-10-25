import * as React from "react";
import { cn } from "../../lib/cn";
import { FormGroup } from "./FormGroup";

/**
 * Universal, reusable InputGroup component.
 * Allows adding text or element add-ons to the left (`addonLeft`) or right (`addonRight`) of an input field.
 * 
 * Props:
 * - label: Form field label string
 * - requiredText: Text badge for required state (e.g. "(required)")
 * - addonLeft: Add-on content on left (e.g. "₹" or icon)
 * - addonRight: Add-on content on right (e.g. "Days" or icon button)
 * - value, onChange, placeholder, type, disabled, error, className
 */
const InputGroup = React.forwardRef(
  (
    {
      label,
      required,
      requiredText,
      error,
      addonLeft,
      addonRight,
      value,
      onChange = () => {},
      placeholder,
      type = "text",
      disabled,
      className,
      id: customId,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = customId || generatedId;

    return (
      <FormGroup 
        label={label} 
        htmlFor={inputId} 
        required={required} 
        requiredText={requiredText}
        error={error} 
        className={className}
      >
        <div 
          className={cn(
            "flex h-11 md:h-10 w-full items-center rounded-md border bg-input overflow-hidden transition-all",
            "focus-within:ring-2 focus-within:ring-accent/40 focus-within:border-accent",
            disabled && "opacity-50 cursor-not-allowed",
            error ? "border-status-offline" : "border-card-border"
          )}
        >
          {/* Left Addon */}
          {addonLeft && (
            <div className="flex h-full items-center justify-center border-r border-card-border/80 bg-card-bg/60 px-3 text-body-sm font-semibold text-ink-secondary shrink-0 select-none">
              {addonLeft}
            </div>
          )}

          {/* Core Input Element */}
          <input
            ref={ref}
            id={inputId}
            type={type}
            value={value ?? ""}
            placeholder={placeholder}
            disabled={disabled}
            onChange={onChange}
            className="h-full w-full min-w-0 bg-transparent px-3 text-body text-ink-primary placeholder:text-ink-muted focus:outline-none disabled:cursor-not-allowed"
            {...props}
          />

          {/* Right Addon */}
          {addonRight && (
            <div className="flex h-full items-center justify-center border-l border-card-border/80 bg-card-bg/60 px-3 text-body-sm font-semibold text-ink-secondary shrink-0 select-none">
              {addonRight}
            </div>
          )}
        </div>
      </FormGroup>
    );
  }
);

InputGroup.displayName = "InputGroup";

export { InputGroup };
