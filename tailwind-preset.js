/**
 * my Design System UI Library — shareable Tailwind preset.
 *
 * For consumer apps on Tailwind v3 (or a v3-style JS config under v4's
 * compatibility mode), so that bg-canvas, bg-accent, text-ink-primary, etc.
 * are real, generated utility classes in YOUR app's build — not an accident
 * of what the library's own bundle happens to inject globally.
 *
 * This library itself is on Tailwind v4 and configures it from CSS
 * (`@import "tailwindcss"` plus the `@theme` blocks in src/theme.css), so
 * there is no JS config here to mirror — src/theme.css is the source of
 * truth, and any token added there belongs in this preset too.
 *
 * Usage (consumer app's tailwind.config.js):
 *
 *   import m2mPreset from "my Design System/tailwind-preset";
 *
 *   export default {
 *     presets: [m2mPreset],
 *     content: [
 *       "./index.html",
 *       "./src/**/*.{js,jsx,ts,tsx}",
 *       "./node_modules/my Design System/dist/**/*.js",
 *     ],
 *   };
 *
 * If you're on Tailwind v4, prefer `@import "my Design System/theme.css";`
 * in your app's CSS instead — see README for details.
 */
export default {
  theme: {
    extend: {
      colors: {
        chrome: { DEFAULT: "var(--chrome-bg)", deep: "var(--chrome-deep)" },
        canvas: "var(--canvas-bg)",
        card: { DEFAULT: "var(--card-bg)", border: "var(--card-border)" },
        accent: {
          DEFAULT: "var(--accent-primary)",
          light: "var(--accent-light)",
          muted: "var(--accent-muted-bg)",
          border: "var(--accent-border)",
        },
        ink: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          onchrome: "var(--text-on-chrome)",
        },
        icon: { idle: "var(--icon-idle)", active: "var(--icon-active)" },
        status: {
          online: "var(--status-online)",
          "online-bg": "var(--status-online-bg)",
          warn: "var(--status-warn)",
          "warn-bg": "var(--status-warn-bg)",
          offline: "var(--status-offline)",
          "offline-bg": "var(--status-offline-bg)",
        },
        live: { bg: "var(--live-bg)", text: "var(--live-text)" },
        nav: { active: "var(--nav-active)", "active-bg": "var(--nav-active-bg)", "active-border": "var(--nav-active-border)" },
        tag: { bg: "var(--tag-bg)", text: "var(--tag-text)", border: "var(--tag-border)" },
        input: "var(--input-bg)",
        sidebar: { bg: "var(--sidebar-bg)", border: "var(--sidebar-border)" },
        topbar: { border: "var(--topbar-border)" },
      },
      fontFamily: {
        primary: ["Source Sans 3", "system-ui", "sans-serif"],
        secondary: ["Cabin", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        xs: "2px",
        sm: "4px",
        DEFAULT: "8px",
        md: "8px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(107,68,35,0.10)",
        sm: "0 2px 4px 0 rgba(107,68,35,0.10)",
        md: "0 4px 12px 0 rgba(107,68,35,0.10)",
        lg: "0 8px 16px 0 rgba(107,68,35,0.10)",
        xl: "0 12px 24px 0 rgba(107,68,35,0.10)",
      },
    },
  },
};
