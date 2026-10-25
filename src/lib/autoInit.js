/**
 * autoInit.js — Runs once when ANY component from the library is imported.
 * Injects theme CSS variables as a <style> tag so consumers never need
 * to manually import theme.css.
 */
import themeCss from "../theme.css?inline";

if (typeof document !== "undefined") {
  try {
    // 1. Inject theme CSS custom properties (:root { --chrome-bg, --accent-primary … })
    const STYLE_ID = "my Design System-theme";
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = themeCss;
      document.head.appendChild(style);
    }
  } catch {
    // SSR / non-browser environment — safe to skip
  }
}
