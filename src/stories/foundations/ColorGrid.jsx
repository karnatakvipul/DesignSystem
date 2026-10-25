import { THEMES } from "../../theme";

/**
 * Renders every theme's value for one group of semantic colour tokens, side
 * by side. Reads straight from `THEMES` in `src/theme/tokens.js` rather than
 * a hand-copied hex list — the numbers in DESIGN-SYSTEM.md have drifted from
 * the source before, and a doc page built from the same object the runtime
 * uses cannot drift from it again.
 */
const THEME_ENTRIES = Object.entries(THEMES);

function Swatch({ hex, dark }) {
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 8,
        background: hex,
        border: dark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.1)",
        flexShrink: 0,
      }}
      title={hex}
    />
  );
}

export function ColorGrid({ rows }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "8px 12px", borderBottom: "2px solid #e2e8f0" }}>
              Token
            </th>
            {THEME_ENTRIES.map(([key, t]) => (
              <th
                key={key}
                style={{ textAlign: "left", padding: "8px 12px", borderBottom: "2px solid #e2e8f0", fontWeight: 600 }}
              >
                {t.label}
                <div style={{ fontWeight: 400, opacity: 0.6, fontSize: 11 }}>{key}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.className}>
              <td style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9", verticalAlign: "top" }}>
                <code style={{ fontSize: 12.5 }}>{row.className}</code>
                {row.note && (
                  <div style={{ fontSize: 11.5, opacity: 0.6, marginTop: 2, maxWidth: 220 }}>{row.note}</div>
                )}
              </td>
              {THEME_ENTRIES.map(([key, t]) => {
                const hex = t[row.tokenKey];
                return (
                  <td key={key} style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Swatch hex={hex} dark={t.colorScheme === "dark"} />
                      <code style={{ fontSize: 11.5, opacity: 0.75 }}>{hex}</code>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The DESIGN-SYSTEM.md groupings, kept in the same order and wording. */
export const SURFACE_ROWS = [
  { className: "bg-canvas", tokenKey: "canvasBg", note: "The page background, one step off card." },
  { className: "bg-card", tokenKey: "cardBg", note: "Panels, tables, popovers." },
  { className: "bg-chrome", tokenKey: "chromeBg", note: "Sidebar and header." },
];

export const TEXT_ROWS = [
  { className: "text-ink-primary", tokenKey: "textPrimary" },
  { className: "text-ink-secondary", tokenKey: "textSecondary" },
  { className: "text-ink-muted", tokenKey: "textMuted" },
  {
    className: "text-ink-onchrome",
    tokenKey: "textOnChrome",
    note: "Not interchangeable with -primary — chrome is dark in some themes, light in others.",
  },
];

export const ACCENT_ROWS = [
  { className: "bg-accent / text-accent", tokenKey: "accentPrimary" },
  { className: "bg-accent-muted", tokenKey: "accentMutedBg", note: "A badge fill, not a foreground — see the callout below." },
];

export const STATUS_ROWS = [
  { className: "text-status-online", tokenKey: "statusOnline" },
  { className: "text-status-warn", tokenKey: "statusWarn" },
  { className: "text-status-offline", tokenKey: "statusOffline" },
];
