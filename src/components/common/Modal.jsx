import * as React from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/cn";

const sizeClasses = {
  sm: "sm:max-w-sm",   // ~384px - compact alert / confirm modals
  md: "sm:max-w-md",   // ~448px - standard form modals (Add / Edit)
  lg: "sm:max-w-xl",   // ~576px - medium detail views / timelines
  xl: "sm:max-w-3xl"    // ~768px - large preview tables
};

// Tracks currently-open Modal instances so that only the top-most one
// closes on Escape (prevents a nested modal, e.g. ConfirmDialog opened
// on top of a FormModal, from also closing the modal beneath it).
let modalStack = [];

function Modal({ open, onClose, title, footer, size = "md", children, className }) {
  const instanceRef = React.useRef({});
  const dialogRef = React.useRef(null);
  const titleId = React.useId();

  React.useEffect(() => {
    if (!open) return;
    const instance = instanceRef.current;
    modalStack.push(instance);
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e) {
      // Only the top-most open Modal should respond to Escape, so that
      // e.g. a ConfirmDialog opened on top of a FormModal doesn't also
      // close the modal underneath it.
      if (e.key === "Escape" && modalStack[modalStack.length - 1] === instance) {
        onClose();
      }
    }

    document.addEventListener("keydown", onKey);

    // Focus has to come inside, and go back where it was on the way out.
    //
    // Left alone, focus stays on whatever was behind the overlay: the first Tab
    // lands on a control the person cannot see, and a screen reader carries on
    // reading the page underneath as though the dialog were not there. Sending
    // it back afterwards is the other half — losing your place in a table every
    // time you dismiss a dialog makes the keyboard unusable for real work.
    const previouslyFocused = document.activeElement;
    const frame = requestAnimationFrame(() => {
      const dialog = dialogRef.current;
      if (!dialog || dialog.contains(document.activeElement)) return;

      const focusable = dialog.querySelector(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      (focusable ?? dialog).focus();
    });

    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = originalStyle;
      document.removeEventListener("keydown", onKey);
      modalStack = modalStack.filter((i) => i !== instance);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
        aria-hidden 
      />

      {/* Modal Dialog Content Box */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        // Named by its own heading where there is one; otherwise the dialog is
        // announced as just "dialog", which says nothing about what it wants.
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : "Dialog"}
        // Focusable only as a fallback, for a dialog holding no control of its
        // own — it must not become a tab stop of its own otherwise.
        tabIndex={-1}
        className={cn(
          "relative z-10 flex max-h-[90dvh] w-full flex-col rounded-overlay border border-card-border bg-card shadow-overlay mx-auto transition-all animate-in zoom-in-95 duration-150",
          "max-w-[calc(100vw-24px)]",
          sizeClasses[size] || sizeClasses.md,
          className
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-card-border px-4 sm:px-5 py-3.5 shrink-0">
            <h2 id={titleId} className="font-secondary text-body sm:text-base font-semibold text-ink-primary tracking-tight">
              {title}
            </h2>
            <button 
              type="button"
              onClick={onClose} 
              aria-label="Close" 
              className="flex h-7 w-7 items-center justify-center rounded-control text-ink-muted hover:bg-accent-muted/40 hover:text-ink-primary transition-colors cursor-pointer"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 min-h-0">
          {children}
        </div>

        {/* Footer Actions */}
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-card-border px-4 sm:px-5 py-3.5 shrink-0 bg-card/40 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export { Modal };
