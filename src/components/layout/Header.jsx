import { Menu } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * The application top bar: title on the left, actions and profile on the
 * right, and a search slot placed according to `searchAlign`.
 *
 * @param {Object} props
 * @param {React.ReactNode} [props.logo]
 *   A brand mark, rendered at the very start of the bar — after the
 *   mobile-sidebar button, before the title. Worth filling on any layout
 *   whose `Sidebar` becomes a drawer on small screens: the sidebar is where
 *   the mark normally lives, and a closed drawer takes it off the screen
 *   entirely, so the top bar is the only place left for it. Scope it to the
 *   breakpoints that need it (`<div className="md:hidden">…</div>`) rather
 *   than showing it here and in an open sidebar at once.
 * @param {React.ReactNode} [props.search] Usually a `SearchBox`.
 * @param {"end"|"center"} [props.searchAlign="end"]
 *   Where the search slot sits. "end" groups it with the actions, which is the
 *   long-standing layout and stays the default. "center" gives it the middle of
 *   the bar, with the title and the actions balanced either side — worth using
 *   when search is the main thing people come to the bar for.
 *
 *   The centred layout needs the outer flex rows to share space evenly
 *   (`flex-1` on both sides, `basis-0` so their content doesn't set their
 *   width). Without that the centre drifts off-centre as the title changes
 *   length, which is the usual way this gets built wrong.
 */
function Header({
  title = "my Design System Dashboard",
  logo,
  search,
  profileMenu,
  actions,
  onOpenMobileSidebar,
  searchAlign = "end",
  className,
}) {
  const centered = searchAlign === "center" && Boolean(search);

  return (
    <header
      className={cn(
        // h-12 (48px) on a phone, not h-10 (40px): the controls in here are
        // touch targets at `control-lg` (44px), so a 40px bar left them
        // overhanging it by ~2px top and bottom. The bar grows to fit them
        // rather than the targets shrinking below the 44px minimum.
        // From sm: up they're back inside a 44px bar, and from md: the
        // switcher itself drops to h-9.
        "flex h-12 sm:h-11 items-center justify-between gap-2 md:gap-4 border-b border-topbar-border bg-chrome px-3 md:px-5 shrink-0",
        className
      )}
    >
      <div className={cn("flex items-center gap-2 min-w-0", centered ? "flex-1 basis-0" : "flex-1")}>
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="flex h-control-lg w-control-lg items-center justify-center rounded-control text-ink-onchrome hover:bg-nav-active-bg md:hidden shrink-0"
            aria-label="Open mobile menu"
          >
            <Menu size={22} />
          </button>
        )}
        {logo && <div className="flex shrink-0 items-center">{logo}</div>}
        <h1 className="font-secondary text-body sm:text-base md:text-lg font-semibold text-ink-onchrome truncate">
          {title}
        </h1>
      </div>

      {centered && (
        // `relative` so a panel anchored to the search box (a FilterPanel, say)
        // positions against this slot rather than the whole bar.
        <div className="relative hidden md:block w-full max-w-md shrink">{search}</div>
      )}

      <div
        className={cn(
          "flex items-center justify-end gap-1.5 sm:gap-4",
          centered ? "flex-1 basis-0" : "shrink-0"
        )}
      >
        {!centered && search && <div className="relative hidden md:block w-full max-w-sm">{search}</div>}
        {actions}
        {profileMenu}
      </div>
    </header>
  );
}

export { Header };
