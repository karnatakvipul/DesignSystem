import * as React from "react";
import { cn } from "../../lib/cn";
const Card = React.forwardRef(
  ({ padded = true, className, children, ...props }, ref) => <div
    ref={ref}
    className={cn(
      "rounded-control border border-card-border bg-card shadow-md text-ink-primary",
      padded && "p-3 sm:p-4",
      className
    )}
    {...props}
  >
      {children}
    </div>
);
Card.displayName = "Card";
export {
  Card
};