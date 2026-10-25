import * as React from "react";

/**
 * Shared chart styling, so every chart in the library reads as one family and
 * follows the active theme.
 *
 * Recharts takes plain CSS colour strings, which means theme custom properties
 * work directly — a chart re-colours itself when the theme switches, with no
 * JavaScript listening for the change.
 */

/**
 * Series colours: Hex codes for a clean, vibrant color palette.
 *
 * If you prefer to stick to your theme's native CSS variables, swap these
 * out for "var(--accent-primary)", "var(--accent-light)", etc.
 */
export const CHART_SERIES_COLOURS = [
  "#3b82f6", // First series (Vibrant Blue)
  "#10b981", // Second series (Emerald Green)
  "#f59e0b", // Third series (Amber Orange)
  "#ef4444", // Fourth series (Rose Red)
  "#8b5cf6", // Fifth series (Purple)
  "#6b7280", // Sixth series (Neutral Muted Grey)
];

/** Axis styling shared by every cartesian chart. */
export function chartAxisStyle() {
  return {
    stroke: "var(--text-muted)",
    tick: { fill: "var(--text-muted)", fontSize: 11 },
    tickLine: false,
    axisLine: { stroke: "var(--card-border)" },
  };
}

/**
 * Tooltip drawn with theme tokens.
 *
 * Recharts' default is a white box with inline styles, which looks wrong on
 * every dark theme. This one is a card like any other surface in the app.
 */
export function ChartTooltip({ active, payload, label, formatValue = (n) => String(n) }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-md border border-card-border bg-card px-3 py-2 shadow-lg">
      {label !== undefined && label !== "" && (
        <p className="mb-1 text-body-sm font-semibold text-ink-primary">{label}</p>
      )}
      <ul className="flex flex-col gap-0.5">
        {payload.map((entry) => (
          <li key={entry.dataKey ?? entry.name} className="flex items-center gap-2 text-body-sm">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ background: entry.color || entry.fill }}
            />
            <span className="text-ink-secondary">{entry.name}</span>
            <span className="ml-auto font-semibold tabular-nums text-ink-primary">
              {formatValue(entry.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
