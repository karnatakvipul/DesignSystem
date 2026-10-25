import * as React from "react";
import { cn } from "../../lib/cn";
const variantClasses = {
  idle: "text-icon-idle hover:text-icon-active hover:bg-accent-muted",
  active: "text-icon-active bg-accent-muted",
  danger: "text-status-offline hover:bg-status-offline-bg"
};
const sizeClasses = { 
  xs: "h-9 w-9 md:h-6.5 md:w-6.5", 
  sm: "h-10 w-10 md:h-7.5 md:w-7.5", 
  md: "h-11 w-11 md:h-8 md:w-8" 
};
const IconButton = React.forwardRef(
  ({ icon, label, variant = "idle", size = "md", className, ...props }, ref) => <button
    ref={ref}
    aria-label={label}
    title={label}
    className={cn(
      "inline-flex items-center justify-center rounded-pill transition-colors duration-150 cursor-pointer",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
      "disabled:opacity-40 disabled:cursor-not-allowed",
      variantClasses[variant],
      sizeClasses[size],
      className
    )}
    {...props}
  >
      {icon}
    </button>
);
IconButton.displayName = "IconButton";
export {
  IconButton
};
