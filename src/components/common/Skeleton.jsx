import * as React from "react";
import { cn } from "../../lib/cn";

function Skeleton({ className, variant = "rectangular", ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse bg-ink-muted/20 relative overflow-hidden shrink-0",
        variant === "circular" && "rounded-pill",
        variant === "text" && "h-4 rounded-md my-1",
        variant === "rectangular" && "rounded-control",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
