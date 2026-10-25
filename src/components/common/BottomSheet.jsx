import * as React from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/cn";

// Tracks currently-open BottomSheet instances so that only the top-most
// one closes on Escape (prevents a nested sheet from also closing the
// one beneath it).
let sheetStack = [];

/**
 * Lets the sheet's own content dismiss it.
 *
 * Whoever renders a sheet holds its open state, but the control that finishes
 * the job is inside — an Apply button that leaves the sheet covering the
 * result it just produced is a button that looks like it did nothing.
 */
const BottomSheetContext = React.createContext(null);

/** The enclosing sheet, or null when not inside one. */
function useBottomSheet() {
  return React.useContext(BottomSheetContext);
}

/**
 * Bottom Sheet — slides up from the bottom of the screen.
 * Used on mobile for filters, sorting, and action menus.
 */
function BottomSheet({ open, onClose, title, children, className }) {
  const instanceRef = React.useRef({});

  React.useEffect(() => {
    if (!open) return;
    const instance = instanceRef.current;
    sheetStack.push(instance);
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e) {
      if (e.key === "Escape" && sheetStack[sheetStack.length - 1] === instance) {
        onClose();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = originalStyle;
      document.removeEventListener("keydown", onKey);
      sheetStack = sheetStack.filter((i) => i !== instance);
    };
  }, [open, onClose]);

  const sheet = React.useMemo(() => ({ close: onClose }), [onClose]);
  const body = (
    <BottomSheetContext.Provider value={sheet}>{children}</BottomSheetContext.Provider>
  );

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
        aria-hidden
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute bottom-0 left-0 right-0 z-10 flex max-h-[85dvh] flex-col",
          "rounded-t-2xl border border-card-border bg-card shadow-xl",
          "animate-slide-up transition-transform duration-300",
          className
        )}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="h-1 w-10 rounded-pill bg-ink-muted/30" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-card-border px-5 py-3">
            <h2 className="font-secondary text-title font-semibold text-ink-primary">
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              // This sheet only ever renders below md:, so there is no pointer
              // case to step back down for — it is always a touch target.
              className="flex h-control-lg w-control-lg items-center justify-center rounded-pill text-ink-muted hover:bg-accent-muted hover:text-ink-primary"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Body.
            The bottom padding carries the safe-area inset: a sheet is pinned to
            the very edge of the screen, which on a phone with a home indicator
            is exactly where the system gesture bar sits — so the last action in
            the sheet is the one that looks tappable and is not. */}
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {body}
        </div>
      </div>
    </div>,
    document.body
  );
}

export { BottomSheet, useBottomSheet };