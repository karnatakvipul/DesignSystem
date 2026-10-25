import * as React from "react";
import { Plus } from "lucide-react";
import { cn } from "../../lib/cn";
const FloatingAddButton = React.forwardRef(
  ({ label = "Add", className, ...props }, ref) => <button
    ref={ref}
    aria-label={label}
    title={label}
    className={cn(
      // The bottom offset carries the safe-area inset so the button clears a
      // home indicator instead of sitting under it — on those phones the
      // gesture bar swallows the tap and the button reads as simply not
      // working. Falls back to plain 1rem where the inset is 0.
      "fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] sm:right-6 z-40 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-pill",
      "bg-accent text-white shadow-lg hover:brightness-110 active:scale-95",
      "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
      className
    )}
    {...props}
  >
      <Plus size={24} strokeWidth={2.5} />
    </button>
);
FloatingAddButton.displayName = "FloatingAddButton";
export {
  FloatingAddButton
};
