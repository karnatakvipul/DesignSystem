import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/cn";

/**
 * Themed floating context menu (right-click menu).
 *
 * Rendered in a portal so it can never be clipped by an `overflow-hidden`
 * ancestor, and repositioned to stay inside the viewport when opened near a
 * right or bottom edge.
 *
 * Props:
 * - open: Whether the menu is visible.
 * - x, y: Viewport coordinates to anchor at (typically e.clientX / e.clientY).
 * - items: Array of { label, icon, danger, disabled, onClick }.
 * - payload: Arbitrary value forwarded to each item's onClick(payload) — e.g.
 *   the row or tab that was right-clicked.
 * - onClose: Called on outside click, scroll, Escape, or after an item runs.
 * - minWidth: Menu min width in px (default 160).
 */
function ContextMenu({ open, x = 0, y = 0, items = [], payload, onClose, minWidth = 160, className }) {
  const menuRef = React.useRef(null);
  const [coords, setCoords] = React.useState({ top: y, left: x });

  // Keep the menu fully on-screen: flip back from the right/bottom edges once
  // the real rendered size is known.
  React.useLayoutEffect(() => {
    if (!open) return;
    setCoords({ top: y, left: x });
    const el = menuRef.current;
    if (!el || typeof window === "undefined") return;
    const rect = el.getBoundingClientRect();
    const margin = 8;
    const left = Math.max(margin, Math.min(x, window.innerWidth - rect.width - margin));
    const top = Math.max(margin, Math.min(y, window.innerHeight - rect.height - margin));
    setCoords({ top, left });
  }, [open, x, y, items.length]);

  React.useEffect(() => {
    if (!open) return undefined;

    function close() {
      onClose?.();
    }
    function onKeyDown(e) {
      if (e.key === "Escape") close();
    }
    // Attach on the next frame so the very click/contextmenu event that opened
    // the menu doesn't immediately close it again.
    const frameId = requestAnimationFrame(() => {
      document.addEventListener("click", close);
      document.addEventListener("contextmenu", close);
      window.addEventListener("scroll", close, true);
      window.addEventListener("resize", close);
      document.addEventListener("keydown", onKeyDown);
    });

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener("click", close);
      document.removeEventListener("contextmenu", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || items.length === 0 || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      style={{ top: `${coords.top}px`, left: `${coords.left}px`, minWidth: `${minWidth}px` }}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "fixed z-[9999] rounded-control border border-card-border bg-card p-1 shadow-floating",
        "animate-in fade-in zoom-in-95 duration-100",
        className
      )}
    >
      {items.map((item, idx) => (
        <button
          key={item.key ?? idx}
          type="button"
          role="menuitem"
          disabled={item.disabled}
          onClick={(e) => {
            e.stopPropagation();
            item.onClick?.(payload);
            onClose?.();
          }}
          className={cn(
            "flex w-full items-center gap-2 rounded-control px-3 py-2 text-body-sm font-medium transition-colors cursor-pointer select-none text-left",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            item.danger
              ? "text-status-offline hover:bg-status-offline-bg/30"
              : "text-ink-primary hover:bg-accent-muted/40 hover:text-accent"
          )}
        >
          {item.icon}
          <span className="min-w-0 truncate">{item.label}</span>
        </button>
      ))}
    </div>,
    document.body
  );
}

export { ContextMenu };
