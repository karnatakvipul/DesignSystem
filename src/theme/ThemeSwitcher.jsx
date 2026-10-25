import * as React from "react";
import { Sun, Moon, Contrast, Palette, Check } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "../lib/cn";

/**
 * Theme picker.
 *
 * The trigger is one icon-sized button, the same on mobile and desktop. A
 * header has a single row of space and the theme is not something people
 * change often, so a control wide enough to spell the name out was spending
 * the best real estate in the app on a rarely-used setting.
 *
 * The icon is chosen from what the theme actually is rather than being a fixed
 * palette glyph, and tinted with that theme's own accent — so the button
 * reports the current theme at a glance instead of just advertising that a
 * picker exists.
 *
 * @param {Object} props
 * @param {boolean} [props.showLabel] Spell the theme name out beside the icon.
 *   Off by default; worth turning on where there is room, like a settings page.
 */

/**
 * Picks the glyph that matches a theme's appearance.
 *
 * Light and dark are the obvious two. The third case is the one worth having:
 * a theme with a light workspace and dark chrome is neither, and showing it a
 * sun would be wrong — `Contrast` says "some of each", which is exactly what
 * it is.
 */
function iconFor(tokens) {
  if (!tokens) return Palette;
  if (tokens.colorScheme === "dark") return Moon;

  // Light scheme, but dark chrome — a mixed theme rather than a plain light one.
  const chrome = (tokens.chromeBg || "").toLowerCase();
  const isDarkChrome = /^#([0-9a-f]{6})$/.test(chrome)
    && parseInt(chrome.slice(1, 3), 16) + parseInt(chrome.slice(3, 5), 16) + parseInt(chrome.slice(5, 7), 16) < 300;

  return isDarkChrome ? Contrast : Sun;
}

function ThemeSwitcher({ showLabel = false, className }) {
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    function onClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    }
    function onEscape(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  const current = themes[theme] || {};
  const CurrentIcon = iconFor(current);

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-control-lg md:h-9 items-center justify-center gap-2 rounded-control border border-card-border bg-input text-ink-primary transition-colors cursor-pointer",
          "hover:border-accent/40 active:bg-accent-muted/40 focus:outline-none focus:ring-2 focus:ring-accent/40",
          showLabel ? "px-2.5 text-body-sm sm:text-sm font-medium" : "w-control-lg md:w-9",
          className
        )}
        aria-label={`Theme: ${current.label || "default"}. Change theme`}
        title={`Theme: ${current.label || "default"}`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <CurrentIcon size={16} className="shrink-0 text-accent" />
        {showLabel && <span className="truncate">{current.label}</span>}
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-11 z-50 w-60 rounded-surface border border-card-border bg-card py-1.5 shadow-2xl select-none"
        >
          <div className="mb-1 border-b border-card-border px-3 py-1.5 text-caption font-semibold uppercase tracking-wider text-ink-muted">
            Theme
          </div>
          <div className="max-h-80 space-y-0.5 overflow-y-auto">
            {Object.keys(themes).map((key) => {
              const tokens = themes[key];
              const Icon = iconFor(tokens);
              const isSelected = theme === key;

              return (
                <button
                  key={key}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    setTheme(key);
                    setOpen(false);
                  }}
                  className={cn(
                    "mx-1 flex w-[calc(100%-8px)] cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left transition-colors",
                    isSelected ? "bg-accent-muted" : "hover:bg-accent-muted/60"
                  )}
                >
                  {/* Tinted with the theme's own accent, so the two dark
                      themes are told apart by colour as well as by name. */}
                  <Icon size={16} className="shrink-0" style={{ color: tokens.accentPrimary }} />

                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-body-sm sm:text-sm",
                        isSelected ? "font-semibold text-accent" : "text-ink-primary"
                      )}
                    >
                      {tokens.label}
                    </span>
                    {tokens.description && (
                      <span className="block truncate text-caption text-ink-muted">{tokens.description}</span>
                    )}
                  </span>

                  {isSelected && <Check size={15} className="shrink-0 text-accent" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export { ThemeSwitcher };
