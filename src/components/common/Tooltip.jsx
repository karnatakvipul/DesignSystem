import * as React from "react";
import { cn } from "../../lib/cn";

/**
 * Universal, reusable, theme-aware Tooltip component.
 * Wraps any React element or HTML tag to display floating full-detail tooltips.
 * 
 * Props:
 * - content: Text string or JSX element to display inside the tooltip (always shows FULL untruncated details).
 * - position: "top" | "bottom" | "left" | "right" (default "top")
 * - trigger: "hover" | "click" | "focus" | "manual" (default "hover")
 * - delay: Hover delay in milliseconds before showing tooltip (default 150)
 * - onlyIfOverflow: If true, tooltip only shows when child text is truncated / overflowing (default false)
 * - showArrow: Show directional arrow pointer (default true)
 * - open: Manual open control when trigger="manual"
 * - disabled: Disable tooltip completely (default false)
 */
function Tooltip({
  content,
  children,
  position = "top",
  trigger = "hover",
  delay = 150,
  onlyIfOverflow = false,
  showArrow = true,
  open: controlledOpen,
  disabled = false,
  className,
  ...props
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [coords, setCoords] = React.useState({ top: 0, left: 0 });
  const childRef = React.useRef(null);
  const timerRef = React.useRef(null);

  const isVisible = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const isTouch = React.useSyncExternalStore(
    () => () => {},
    () => (typeof window !== "undefined" ? window.matchMedia("(hover: none)").matches : false),
    () => false
  );
  
  const effectiveTrigger = isTouch && trigger === "hover" ? "none" : trigger;

  const updatePosition = React.useCallback(() => {
    if (!childRef.current) return;
    const rect = childRef.current.getBoundingClientRect();
    let top = 0;
    let left = 0;

    if (position === "top") {
      top = rect.top - 8;
      left = rect.left + rect.width / 2;
    } else if (position === "bottom") {
      top = rect.bottom + 8;
      left = rect.left + rect.width / 2;
    } else if (position === "left") {
      top = rect.top + rect.height / 2;
      left = rect.left - 8;
    } else if (position === "right") {
      top = rect.top + rect.height / 2;
      left = rect.right + 8;
    }

    setCoords({ top, left });
  }, [position]);

  // Check overflow status on hover if onlyIfOverflow is set
  const checkOverflow = React.useCallback(() => {
    if (!onlyIfOverflow || !childRef.current) return true;
    const el = childRef.current;
    const target = el.firstElementChild || el;
    const isTruncated = target.scrollWidth - target.clientWidth > 1 || target.scrollHeight - target.clientHeight > 1;
    return isTruncated;
  }, [onlyIfOverflow]);

  function handleOpen() {
    if (disabled || !content) return;
    if (onlyIfOverflow && !checkOverflow()) return;

    updatePosition();
    if (delay > 0 && trigger === "hover") {
      timerRef.current = setTimeout(() => {
        updatePosition();
        setInternalOpen(true);
      }, delay);
    } else {
      setInternalOpen(true);
    }
  }

  function handleClose() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setInternalOpen(false);
  }

  function handleClick(e) {
    if (trigger === "click") {
      e.stopPropagation();
      updatePosition();
      setInternalOpen((v) => !v);
    }
  }

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (disabled || !content) return <>{children}</>;

  const transformClasses = {
    top: "-translate-x-1/2 -translate-y-full",
    bottom: "-translate-x-1/2",
    left: "-translate-x-full -translate-y-1/2",
    right: "-translate-y-1/2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-chrome-deep border-x-transparent border-b-transparent border-[5px]",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-chrome-deep border-x-transparent border-t-transparent border-[5px]",
    left: "left-full top-1/2 -translate-y-1/2 border-l-chrome-deep border-y-transparent border-r-transparent border-[5px]",
    right: "right-full top-1/2 -translate-y-1/2 border-r-chrome-deep border-y-transparent border-l-transparent border-[5px]",
  };

  return (
    <div
      ref={childRef}
      className="relative inline-flex max-w-full min-w-0"
      onMouseEnter={effectiveTrigger === "hover" ? handleOpen : undefined}
      onMouseLeave={effectiveTrigger === "hover" ? handleClose : undefined}
      onFocus={effectiveTrigger === "focus" ? handleOpen : undefined}
      onBlur={effectiveTrigger === "focus" ? handleClose : undefined}
      onClick={effectiveTrigger === "click" || trigger === "click" ? handleClick : undefined}
      {...props}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
          className={cn(
            "fixed z-[9999] pointer-events-none whitespace-normal break-words rounded-surface border border-card-border bg-chrome-deep px-3 py-1.5 text-body-sm font-normal text-ink-onchrome shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-w-sm sm:max-w-lg w-max min-w-0",
            transformClasses[position],
            className
          )}
        >
          {/* Always shows FULL untruncated content */}
          <div className="leading-relaxed select-text">{content}</div>
          {showArrow && <div className={cn("absolute h-0 w-0", arrowClasses[position])} aria-hidden="true" />}
        </div>
      )}
    </div>
  );
}

export { Tooltip };
