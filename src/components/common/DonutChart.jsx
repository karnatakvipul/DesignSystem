import * as React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "../../lib/cn";
import { CHART_SERIES_COLOURS, ChartTooltip } from "./chartTheme";

/**
 * Donut chart with the total in the middle and a readable legend beside it.
 *
 * A donut rather than a pie on purpose: the hole gives somewhere to put the
 * total, which is usually the number people came for, and comparing arc
 * lengths is easier than comparing wedge areas.
 *
 * Drawn by Recharts (MIT). The legend is ordinary markup rather than
 * Recharts' own, so it can show each slice's share as a percentage and line
 * the figures up in a column — which its built-in legend cannot do.
 *
 * @param {Object} props
 * @param {{label: string, value: number}[]} props.data
 * @param {string} [props.centerLabel] Caption under the middle figure.
 * @param {string} [props.centerValue] The middle figure. Defaults to the sum.
 * @param {(n: number) => string} [props.formatValue]
 */
export function DonutChart({
  data = [],
  centerLabel,
  centerValue,
  formatValue = (n) => String(n),
  height = 200,
  className,
  emptyMessage = "No data to chart",
  ...props
}) {
  const slices = (data || [])
    .map((d) => ({ label: String(d.label ?? ""), value: Math.max(0, Number(d.value) || 0) }))
    .filter((d) => d.value > 0);

  const total = slices.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return (
      <div className={cn("flex h-48 items-center justify-center text-body-sm text-ink-muted", className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-6", className)} {...props}>
      {/* `relative` so the middle figure can be laid over the ring as ordinary
          text — inside the SVG it could not use real type styles. */}
      <div className="relative shrink-0" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="label"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={2}
              stroke="none"
            >
              {slices.map((slice, i) => (
                <Cell key={slice.label} fill={CHART_SERIES_COLOURS[i % CHART_SERIES_COLOURS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip formatValue={formatValue} />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold tabular-nums text-ink-primary">
            {centerValue ?? formatValue(total)}
          </span>
          {centerLabel && <span className="mt-0.5 text-caption text-ink-muted">{centerLabel}</span>}
        </div>
      </div>

      <ul className="flex min-w-[10rem] flex-col gap-2">
        {slices.map((slice, i) => (
          <li key={slice.label} className="flex items-center justify-between gap-3 text-body-sm">
            <span className="flex items-center gap-2 text-ink-secondary">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ background: CHART_SERIES_COLOURS[i % CHART_SERIES_COLOURS.length] }}
              />
              {slice.label}
            </span>
            <span className="font-semibold tabular-nums text-ink-primary">
              {formatValue(slice.value)}
              <span className="ml-1.5 font-normal text-ink-muted">
                {Math.round((slice.value / total) * 100)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
