import * as React from "react";

/**
 * Connects the filter panel in the header to whichever page is showing.
 *
 * The search box and its filter button live in the app shell, but what there
 * is to filter by belongs to the page — License filters by account and expiry,
 * Users by role. Rather than the shell knowing every page's fields, each page
 * publishes its own and the shell renders whatever it finds here.
 *
 * A page that publishes nothing leaves the filter button hidden, which is
 * correct: a filter control that opens an empty panel is worse than no control.
 */
const PageFilterContext = React.createContext(null);

export function PageFilterProvider({ children }) {
  const [config, setConfig] = React.useState(null);
  const value = React.useMemo(() => ({ config, setConfig }), [config]);

  return <PageFilterContext.Provider value={value}>{children}</PageFilterContext.Provider>;
}

/**
 * Publishes a page's filters into the header panel, and withdraws them when
 * the page unmounts.
 *
 * @param {Object|null} config
 * @param {React.ReactNode} config.children The fields to render in the panel.
 * @param {() => void} [config.onApply] Run when Search is pressed.
 * @param {() => void} [config.onClear] Run when Clear filters is pressed.
 * @param {number} [config.activeCount] How many filters are set, shown as a badge.
 *
 * @remarks
 * `config` must be memoised by the caller. It is an object, so an unmemoised
 * one is a new value on every render, and this effect would publish on every
 * render forever.
 */
export function usePageFilters(config) {
  const context = React.useContext(PageFilterContext);
  const setConfig = context?.setConfig;

  React.useEffect(() => {
    if (!setConfig) return undefined;

    setConfig(config);

    // Withdrawing on unmount is what stops the previous page's filters
    // lingering in the header after you navigate away.
    return () => setConfig(null);
  }, [setConfig, config]);
}

/** Reads whatever the current page published. Used by the shell. */
export function useHeaderFilters() {
  return React.useContext(PageFilterContext)?.config ?? null;
}
