import * as React from "react";
import {
  BadgeCheck,
  FileText,
  FileCode,
  Clock,
  BarChart3,
  CalendarClock,
  Map,
  Briefcase,
  UserCheck,
  User,
  ChevronsLeft,
  ChevronsRight,
  Pin,
  PinOff,
  X,
} from "lucide-react";
import { cn } from "../../lib/cn";

export const DEFAULT_SIDEBAR_ITEMS = [
  { key: "licenses", label: "Licenses", icon: <BadgeCheck size={18} /> },
  { key: "licenseType", label: "License Type", icon: <FileText size={18} /> },
  { key: "productType", label: "Product Type", icon: <FileCode size={18} /> },
  { key: "licenseTerm", label: "License Term", icon: <Clock size={18} /> },
  { key: "report", label: "Report", icon: <BarChart3 size={18} /> },
  { key: "reminders", label: "Reminders", icon: <CalendarClock size={18} /> },
  { key: "statusMap", label: "Status Map", icon: <Map size={18} /> },
  { key: "reminderConfig", label: "Reminder Config", icon: <Briefcase size={18} /> },
  { key: "userActivity", label: "User Activity", icon: <UserCheck size={18} /> },
  { key: "users", label: "Users", icon: <User size={18} /> },
];

function Sidebar({
  items = DEFAULT_SIDEBAR_ITEMS,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  logo = <span className="font-bold text-ink-onchrome text-title tracking-tight">my Design System</span>,
  mobileOpen = false,
  onMobileClose,
  // Hides the pin/unpin glyph on the desktop footer control, leaving the
  // collapse chevron on its own. The control still pins — this is only about
  // whether the rail advertises pinning as a concept. An app whose sidebar is
  // effectively always pinned reads better without it. Defaults to showing it,
  // so nothing changes for anyone not asking.
  showPin = true,
  className,
}) {
  const [internalPinned, setInternalPinned] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const checkMobile = () => {
      const isSmallScreen = window.innerWidth < 768;
      const isTouchOnly = window.matchMedia("(hover: none)").matches;
      setIsMobile(isSmallScreen || isTouchOnly);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Controlled vs Uncontrolled pinned state
  const isPinned = controlledCollapsed !== undefined ? !controlledCollapsed : internalPinned;

  // Sidebar is expanded if it's pinned OR hovered (peek mode on desktop)
  const isExpanded = isMobile || isPinned || isHovered;
  const isCollapsed = !isExpanded;

  const togglePin = () => {
    if (isExpanded) {
      setInternalPinned(false);
      setIsHovered(false);
      onCollapsedChange?.(true);
    } else {
      setInternalPinned(true);
      onCollapsedChange?.(false);
    }
  };

  const handleItemClick = (item, e) => {
    if (!isMobile && !isPinned) {
      setInternalPinned(true);
      onCollapsedChange?.(false);
    }
    item.onClick?.(e);
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const renderLogo = () => {
    if (typeof logo === "function") {
      return logo({ collapsed: isCollapsed, isExpanded });
    }
    if (React.isValidElement(logo)) {
      return React.cloneElement(logo, { collapsed: isCollapsed, isExpanded });
    }
    return logo;
  };

  const navContent = (
    <>
      {/* The logo bar's height must match Header's exactly. Both carry a
          bottom border and sit side by side at the top of the page, so the two
          borders read as one rule running the full width — until the heights
          differ, at which point there is a visible step where the sidebar
          meets the content. This was h-16 against the header's h-11, leaving
          the sidebar's rule 20px low. Change one, change the other. */}
      {logo && (
        <div className="flex h-10 sm:h-11 items-center justify-between border-b border-sidebar-border px-3 shrink-0">
          {/* `justify-start`, not centred. The collapsed/expanded swap is a
              React state change and lands instantly, but the rail's width is
              a 200ms CSS transition — so for that frame the logo is already
              mark-plus-wordmark (~84px) inside a box still only ~35px wide.
              Centred, the overflow splits across both sides and carries the
              mark clean off the left edge of this `overflow-hidden` box
              (measured at x = -37px), which is why the logo blinked out on
              hover and only returned once the rail finished opening. Anchored
              left, the mark never moves in either direction — only the
              wordmark is progressively revealed or clipped. */}
          <div className="flex items-center justify-start gap-2 overflow-hidden min-w-0 transition-all duration-200">
            {renderLogo()}
          </div>
          {isMobile && onMobileClose && (
            <button
              onClick={onMobileClose}
              className="flex h-10 w-10 items-center justify-center rounded-control text-icon-idle hover:bg-nav-active-bg hover:text-icon-active cursor-pointer"
              aria-label="Close drawer"
            >
              <X size={20} />
            </button>
          )}
        </div>
      )}

      <nav className="flex flex-1 flex-col gap-1 p-2 overflow-y-auto overflow-x-hidden scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <button
            key={item.key || item.label}
            onClick={(e) => handleItemClick(item, e)}
            className={cn(
              "group relative flex h-10 items-center rounded-md text-body font-medium transition-all select-none cursor-pointer",
              isCollapsed ? "justify-center px-0 w-10 mx-auto" : "px-3 w-full gap-3",
              item.active
                ? "bg-nav-active-bg text-nav-active font-semibold"
                : "text-ink-onchrome/70 hover:bg-nav-active-bg/60 hover:text-ink-onchrome"
            )}
            title={isCollapsed ? item.label : undefined}
          >
            <span
              className={cn(
                "shrink-0 transition-colors",
                item.active ? "text-nav-active" : "text-ink-onchrome/70 group-hover:text-ink-onchrome"
              )}
            >
              {item.icon}
            </span>

            {isExpanded && (
              <span className="truncate text-left flex-1 animate-in fade-in duration-150">
                {item.label}
              </span>
            )}

            {isExpanded && item.badge !== undefined && (
              <span
                className={cn(
                  "shrink-0 rounded-pill px-2 py-0.5 text-body-sm font-semibold",
                  item.badgeTone === "accent"
                    ? "bg-accent text-white"
                    : "bg-sidebar-border text-ink-onchrome"
                )}
              >
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Desktop Footer Pin/Collapse Toggle */}
      {!isMobile && (
        <div className="flex h-12 items-center border-t border-sidebar-border px-2 shrink-0">
          <button
            onClick={togglePin}
            className={cn(
              "flex h-9 items-center rounded-md text-body-sm text-ink-onchrome/70 hover:bg-nav-active-bg hover:text-ink-onchrome transition-all cursor-pointer select-none",
              isCollapsed
                ? "justify-center px-0 w-9 mx-auto"
                : // With the pin hidden the chevron is the row's only child, and
                  // `justify-between` would strand it on the left under the nav
                  // icons as though it were one of them. Sent to the trailing
                  // edge instead, where a collapse control belongs.
                  cn("w-full px-2.5", showPin ? "justify-between" : "justify-end")
            )}
            title={isPinned ? "Unpin sidebar (collapse on mouse leave)" : "Pin sidebar open"}
            aria-label={isPinned ? "Unpin sidebar" : "Pin sidebar open"}
            aria-pressed={isPinned}
          >
            {/* Icon only. The pin's state is already obvious from the sidebar
                either staying open or collapsing, so the words restated
                something the layout was showing anyway — and the row is the
                one place in the rail where a label had to wrap. The title
                attribute and aria-label still carry it for anyone who needs
                it spelled out. */}
            {isExpanded ? (
              <>
                {showPin && (isPinned ? <Pin size={16} className="text-accent" /> : <PinOff size={16} />)}
                <ChevronsLeft size={16} />
              </>
            ) : (
              <ChevronsRight size={16} />
            )}
          </button>
        </div>
      )}
    </>
  );

  if (isMobile) {
    // Stays mounted at all times rather than `return null` while closed —
    // that unmounted the whole drawer, so `navContent` (including the logo
    // `<img>`) was torn down and rebuilt from nothing on every open, forcing
    // a fresh image decode each time it appeared. Visibility and interaction
    // are handled the same way a persistently-mounted panel always has to:
    // `translate-x`/`opacity` animate it off-screen, `pointer-events-none`
    // stops clicks reaching it, and `inert` removes it from the tab order
    // and from screen readers — together the same guarantee `return null`
    // gave, without discarding the subtree to get it.
    return (
      <div
        className={cn(
          "fixed inset-0 z-50 flex transition-opacity duration-200",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        // The string `"true"`, not the boolean `true` or `""` — this
        // package's peerDependencies allow React 18 *and* 19, and the two
        // disagree about `inert` in a way where no single value is silently
        // correct on both:
        //   - React 18 doesn't know `inert` as a boolean attribute at all.
        //     `true` warns and is dropped; a string is written as-is, so
        //     `"true"` renders `inert="true"` — present, correct.
        //   - React 19 does know it, and coerces by JS truthiness. `""` is
        //     falsy, so it renders as *absent* — silently wrong, the exact
        //     opposite of what React 18 does with it. `"true"` is truthy,
        //     so it's still included (just normalised to `inert=""`) — also
        //     correct, at the cost of a dev-only advisory warning suggesting
        //     `{true}`, which is the one value broken on 18. Verified against
        //     both versions' installed `react-dom/server` directly.
        inert={!mobileOpen ? "true" : undefined}
      >
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onMobileClose} aria-hidden />
        <aside
          className={cn(
            "relative z-10 flex h-full w-[260px] flex-col bg-sidebar-bg text-ink-onchrome border-r border-sidebar-border shadow-2xl transition-transform duration-200 ease-in-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
            className
          )}
        >
          {navContent}
        </aside>
      </div>
    );
  }

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative flex h-full flex-col bg-sidebar-bg text-ink-onchrome border-r border-sidebar-border transition-all duration-200 ease-in-out shrink-0 select-none",
        isExpanded ? "w-[240px]" : "w-[60px]",
        className
      )}
    >
      {navContent}
    </aside>
  );
}

export { Sidebar };
