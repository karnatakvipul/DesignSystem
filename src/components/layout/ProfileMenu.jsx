import * as React from "react";
import { LogOut, Pencil, ChevronDown, User } from "lucide-react";
import { cn } from "../../lib/cn";

export function ProfileMenu({
  user = { name: "Super Admin", email: "admin@my Design System.com" },
  name,
  email,
  role,
  avatarUrl,
  onManageAccount,
  onSignOut,
  className,
}) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef(null);

  const userName = name || user?.name || "Super Admin";
  const userEmail = email || user?.email || "admin@my Design System.com";
  const userRole = role || user?.role;

  React.useEffect(() => {
    function onClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {/* Header Trigger Button matching screenshot: Avatar + Name + Dropdown Arrow */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-control-lg md:h-auto items-center gap-2 p-1 rounded-pill hover:bg-card-border/40 transition-all cursor-pointer select-none"
        aria-label="Open profile menu"
      >
        <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-pill border-2 border-accent bg-accent/10 text-accent font-bold overflow-hidden shadow-sm">
          {avatarUrl ? (
            <img src={avatarUrl} alt={userName} className="h-full w-full object-cover" />
          ) : (
            <User size={18} />
          )}
        </div>
        {/* The header bar is tight on width, and a full name or email is the
            least useful thing to spend it on there — what's actually worth
            knowing at a glance is what this account can do. Falls back to
            the name when no role is given, so this stays a drop-in
            replacement for existing callers. */}
        <span className="hidden sm:inline-block font-medium text-body-sm sm:text-sm text-ink-primary">
          {userRole || userName}
        </span>
        <ChevronDown size={14} className="text-ink-muted" />
      </button>

      {/* Popover Dropdown matching exact screenshot design */}
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 sm:w-80 rounded-overlay border border-card-border bg-card p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-center flex flex-col items-center">
          {/* Centered Large Avatar with Edit Badge */}
          <div className="relative mb-3">
            <div className="flex h-24 w-24 items-center justify-center rounded-pill border-4 border-accent bg-accent/15 text-accent font-bold shadow-md overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="h-full w-full object-cover" />
              ) : (
                <User size={48} />
              )}
            </div>
            {/* Edit Badge Pencil Icon */}
            <button
              type="button"
              onClick={() => alert("Change avatar profile picture")}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-pill bg-accent text-white shadow-lg border-2 border-card hover:scale-105 transition-all cursor-pointer"
              title="Edit Profile Picture"
            >
              <Pencil size={14} />
            </button>
          </div>

          {/* User Name, Role & Email */}
          <h3 className="font-secondary text-title font-bold text-ink-primary">{userName}</h3>
          {userRole && (
            <span className="mt-1 inline-block rounded-pill bg-accent-muted px-2.5 py-0.5 text-caption font-semibold text-accent">
              {userRole}
            </span>
          )}
          <p className="text-body-sm text-ink-muted mb-4 mt-1.5 font-mono">{userEmail}</p>

          {/* Manage your SLS Account Pill Button */}
          <button
            type="button"
            onClick={onManageAccount || (() => alert("Opening SLS Account Settings..."))}
            className="w-full max-w-[220px] rounded-pill border border-accent/80 px-4 py-2 text-body-sm font-semibold text-accent hover:bg-accent/10 transition-colors cursor-pointer mb-4"
          >
            Manage your SLS Account
          </button>

          {/* Divider */}
          <div className="w-full border-t border-card-border/70 my-2" />

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={onSignOut || (() => setOpen(false))}
            className="flex items-center justify-center gap-2 rounded-control border border-card-border/80 px-5 py-2 text-body-sm font-semibold text-ink-secondary hover:text-ink-primary hover:border-card-border hover:bg-input transition-colors cursor-pointer mt-1"
          >
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}
