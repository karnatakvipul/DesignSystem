import * as React from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/cn";
// Tracks currently-open SlideOverModal instances so that only the
// top-most one closes on Escape (prevents a nested panel from also
// closing the one beneath it).
let slideOverStack = [];

function SlideOverModal({ open, onClose, title, width = "480px", children, className }) {
  const instanceRef = React.useRef({});

  React.useEffect(() => {
    if (!open) return;
    const instance = instanceRef.current;
    slideOverStack.push(instance);
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e) {
      if (e.key === "Escape" && slideOverStack[slideOverStack.length - 1] === instance) {
        onClose();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = originalStyle;
      document.removeEventListener("keydown", onKey);
      slideOverStack = slideOverStack.filter((i) => i !== instance);
    };
  }, [open, onClose]);
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" aria-hidden />
      <div
      role="dialog"
      aria-modal="true"
      style={{ width: Math.min(parseInt(width), window.innerWidth - 16) + "px" }}
      className={cn(
        "absolute right-0 top-0 flex h-full max-w-full flex-col border-l border-card-border bg-card shadow-xl",
        className
      )}
    >
        {title && <div className="flex items-center justify-between border-b border-card-border px-4 sm:px-5 py-4">
            <h2 className="font-secondary text-body sm:text-base font-semibold text-ink-primary">{title}</h2>
            <button onClick={onClose} aria-label="Close" className="text-ink-muted hover:text-ink-primary">
              <X size={18} />
            </button>
          </div>}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}
export {
  SlideOverModal
};
