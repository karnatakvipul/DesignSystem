import * as React from "react";
import { cn } from "../../lib/cn";

const variantClasses = {
  primary: "bg-[var(--accent-primary)] text-white hover:brightness-110 focus-visible:ring-[var(--accent-primary)]/50",
  secondary: "bg-[var(--accent-muted-bg)] text-[var(--accent-primary)] hover:brightness-105 focus-visible:ring-[var(--accent-primary)]/40",
  outline: "border border-[var(--card-border)] text-[var(--text-primary)] bg-transparent hover:bg-[var(--accent-muted-bg)] focus-visible:ring-[var(--accent-primary)]/30",
  ghost: "bg-transparent text-[var(--text-primary)] hover:bg-[var(--accent-muted-bg)] focus-visible:ring-[var(--accent-primary)]/30",
  danger: "bg-[var(--status-offline)] text-white hover:brightness-110 focus-visible:ring-[var(--status-offline)]/50",
  add: "bg-[var(--status-online)] text-white hover:brightness-110 focus-visible:ring-[var(--status-online)]/50",
  cancel: "border border-[var(--card-border)] text-[var(--text-secondary)] bg-transparent hover:bg-[var(--card-bg)] focus-visible:ring-[var(--text-muted)]/30"
};

const sizeClasses = {
  // Heights come from the control scale, so a button lines up with the input
  // beside it. The mobile-first pair is deliberate: `lg` (44px) is the smallest
  // comfortable pointer target on a touch screen, so every size steps up one on
  // small viewports and settles back on a pointer device.
  sm: "h-control-md md:h-control-sm px-3 text-body-sm gap-1.5",
  md: "h-control-lg md:h-control-md px-4 text-body gap-2",
  lg: "h-control-lg px-6 text-title gap-2"
};

const Button = React.forwardRef(
  ({ variant = "primary", size = "md", icon, trailingIcon, loading, fullWidth, disabled, className, children, ...props }, ref) => {
    return <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-control font-primary font-medium cursor-pointer",
        "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
        {loading ? <span className="h-4 w-4 animate-spin rounded-pill border-2 border-current border-t-transparent" /> : icon && <span className="inline-flex shrink-0">{icon}</span>}
        {children}
        {!loading && trailingIcon && <span className="inline-flex shrink-0">{trailingIcon}</span>}
      </button>;
  }
);

Button.displayName = "Button";

export {
  Button
};