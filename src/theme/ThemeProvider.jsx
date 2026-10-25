import * as React from "react";
import { DEFAULT_THEME, THEMES, resolveThemeKey, applyTheme } from "./tokens";

const ThemeContext = React.createContext(null);


function ThemeProvider({
  theme,
  defaultTheme,
  storageKey = "sls_theme",
  onThemeChange,
  global = true,
  children
}) {
  const [internalTheme, setInternalTheme] = React.useState(() => {
    if (typeof window !== "undefined" && storageKey) {
      try {
        const stored = window.localStorage.getItem(storageKey);
        if (stored) return resolveThemeKey(stored);
      } catch {
        // Private browsing / disabled storage: fall through to the prop/default below.
      }
    }
    return resolveThemeKey(theme ?? defaultTheme ?? DEFAULT_THEME);
  });

  const active = resolveThemeKey(theme ?? internalTheme);
  const rootRef = React.useRef(null);

  // Sync on client mount if storage exists
  React.useEffect(() => {
    if (typeof window !== "undefined" && storageKey) {
      try {
        const stored = window.localStorage.getItem(storageKey);
        if (stored) {
          const next = resolveThemeKey(stored);
          setInternalTheme(next);
        }
      } catch {
        // Private browsing / disabled storage: keep whatever the initial state resolved to.
      }
    }
  }, [storageKey]);

  React.useEffect(() => {
    if (rootRef.current) applyTheme(rootRef.current, active);
    if (global && typeof document !== "undefined") applyTheme(document.documentElement, active);
  }, [active, global]);

  const setTheme = React.useCallback(
    (key) => {
      const nextTheme = resolveThemeKey(key);
      setInternalTheme(nextTheme);
      if (typeof window !== "undefined" && storageKey) {
        try {
          window.localStorage.setItem(storageKey, nextTheme);
        } catch {
          // Private browsing / disabled storage / quota exceeded: the theme
          // still applies for this session via React state, it just won't
          // survive a reload.
        }
      }
      onThemeChange?.(nextTheme);
    },
    [onThemeChange, storageKey]
  );

  const value = React.useMemo(() => ({ theme: active, setTheme, themes: THEMES }), [active, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      <div
        ref={rootRef}
        data-sls-theme-root
        className="m2m-ui-root min-h-screen bg-canvas text-ink-primary transition-colors duration-150"
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

export {
  ThemeProvider,
  useTheme
};