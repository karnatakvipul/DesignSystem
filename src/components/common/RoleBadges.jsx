import * as React from "react";
import { createPortal } from "react-dom";
import { Eye, X, Shield } from "lucide-react";
import { Badge } from "./Badge";
import { cn } from "../../lib/cn";

/** Formats role names into clean Title Case (e.g. "ADMIN" -> "Admin", "org_admin" -> "Org Admin"). */
export function formatRoleName(role) {
  if (!role) return "";
  return String(role)
    .replace(/[_-]/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * A user's roles in the data table:
 * - Renders an Eye icon button in the table cell.
 * - Clicking the Eye icon opens a floating popover listing all assigned roles.
 */
export function RoleBadges({
  roles = [],
  applications = [],
  resolveAppName,
  className,
}) {
  const [open, setOpen] = React.useState(false);
  const [coords, setCoords] = React.useState({ top: 0, left: 0 });
  const [anchor, setAnchor] = React.useState({ x: 0, y: 0, yTop: 0 });

  const containerRef = React.useRef(null);
  const popoverRef = React.useRef(null);

  const getAppName = (clientId) => {
    if (resolveAppName) return resolveAppName(clientId);
    const found = applications?.find((a) => a.clientId === clientId || a.id === clientId);
    return found?.name ?? clientId;
  };

  const togglePopover = React.useCallback(() => {
    if (open) {
      setOpen(false);
      return;
    }
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    setAnchor({ x: centerX, y: rect.bottom + 4, yTop: rect.top - 4 });
    const estimatedWidth = 304;
    const initialLeft = Math.max(8, Math.min(centerX - estimatedWidth / 2, window.innerWidth - estimatedWidth - 8));
    setCoords({ top: rect.bottom + 4, left: initialLeft });
    setOpen(true);
  }, [open]);

  React.useLayoutEffect(() => {
    if (!open || typeof window === "undefined") return;
    const el = popoverRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const margin = 8;
    const idealLeft = anchor.x - rect.width / 2;
    const left = Math.max(margin, Math.min(idealLeft, window.innerWidth - rect.width - margin));
    let top = anchor.y;
    if (top + rect.height > window.innerHeight - margin) {
      const flippedTop = anchor.yTop - rect.height;
      if (flippedTop >= margin) {
        top = flippedTop;
      } else {
        const spaceBelow = window.innerHeight - margin - anchor.y;
        const spaceAbove = anchor.yTop - margin;
        top = spaceAbove > spaceBelow ? margin : anchor.y;
      }
    }
    setCoords({ top, left });
  }, [open, anchor]);

  React.useEffect(() => {
    if (!open) return undefined;

    function close() {
      setOpen(false);
    }
    function onScroll(e) {
      if (popoverRef.current && popoverRef.current.contains(e.target)) {
        return;
      }
      setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === "Escape") close();
    }

    const frameId = requestAnimationFrame(() => {
      document.addEventListener("click", close);
      window.addEventListener("scroll", onScroll, true);
      window.addEventListener("resize", close);
      document.addEventListener("keydown", onKeyDown);
    });

    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener("click", close);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!roles || !roles.length) return <span className="text-ink-muted select-none">—</span>;

  return (
    <div ref={containerRef} className={cn("inline-flex items-center justify-center", className)}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          togglePopover();
        }}
        className="inline-flex items-center justify-center p-1 text-accent hover:opacity-75 transition-opacity cursor-pointer select-none focus-visible:outline-none"
        title={`View assigned roles (${roles.length})`}
        aria-label={`View assigned roles (${roles.length})`}
      >
        <Eye size={18} />
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            aria-label="Assigned roles"
            style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
            onClick={(e) => e.stopPropagation()}
            className="fixed z-[9999] w-76 max-w-[calc(100vw-32px)] rounded-surface border border-card-border bg-card p-3 shadow-floating animate-in fade-in zoom-in-95 duration-100 select-none text-left"
          >
            <div className="flex items-center justify-between border-b border-card-border pb-2 mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Shield size={14} className="text-accent shrink-0" />
                <span className="font-secondary text-body-sm font-bold text-ink-primary truncate">
                  Assigned Roles ({roles.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-control p-1 text-ink-muted hover:bg-card-border/40 hover:text-ink-primary transition-colors cursor-pointer"
                aria-label="Close roles popup"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto pr-1 overscroll-contain">
              {roles.map((role, idx) => {
                const appName = getAppName(role.clientId);
                const formattedRole = formatRoleName(role.roleName);

                return (
                  <div
                    key={`${role.clientId}::${role.roleName}::${idx}`}
                    className="flex items-center justify-between gap-2 rounded-control px-2.5 py-1.5 bg-input/70 border border-card-border/60 hover:border-accent/40 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-body-sm font-semibold text-ink-primary truncate">
                        {appName}
                      </div>
                      <div className="text-caption text-ink-muted font-mono truncate">
                        {role.clientId}
                      </div>
                    </div>
                    <Badge tone="accent" className="shrink-0 font-medium text-xs">
                      {formattedRole}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

