import * as React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import { cn } from "../../lib/cn";
import { CHART_SERIES_COLOURS, ChartTooltip, chartAxisStyle } from "./chartTheme";

/**
 * Grouped bar chart.
 *
 * Drawn by Recharts (MIT) rather than by hand: axis ticks, label collision,
 * responsive resize and hit-testing are all things a charting library has
 * already solved properly, and the hand-rolled version this replaces got
 * several of them only approximately.
 *
 * The wrapper exists so the rest of the app never imports Recharts directly.
 * Colours, fonts and the tooltip come from theme tokens here, so charts follow
 * the active theme like everything else, and swapping the charting library
 * later is a change to this file rather than to every page.
 *
 * @param {Object} props
 * @param {{label: string, values: number[]}[]} props.data One entry per category.
 * @param {string[]} [props.series] Series names, in the same order as `values`.
 * @param {(n: number) => string} [props.formatValue] Formats ticks, labels and tooltips.
 * @param {number} [props.height] Pixel height of the plot area.
 * @param {boolean} [props.showValues] Print each bar's value above it.
 * @param {boolean} [props.horizontal] Lay the bars out left-to-right instead.
 */
export function BarChart({
  data = [],
  series = [],
  formatValue = (n) => String(n),
  height = 280,
  showValues = false,
  horizontal = false,
  className,
  emptyMessage = "No data to chart",
  ...props
}) {
  const rows = (data || []).filter((d) => d && Array.isArray(d.values));

  // Recharts wants one object per category with a key per series, so the
  // caller's simpler {label, values[]} shape is mapped here rather than making
  // every page build Recharts' structure itself.
  const names = series.length > 0 ? series : ["Value"];
  const chartData = rows.map((row) => {
    const point = { label: String(row.label ?? "") };
    names.forEach((name, i) => {
      point[name] = Number(row.values[i]) || 0;
    });
    return point;
  });

  if (chartData.length === 0) {
    return (
      <div className={cn("flex h-48 items-center justify-center text-body-sm text-ink-muted", className)}>
        {emptyMessage}
      </div>
    );
  }

  const axis = chartAxisStyle();
  // Long category names are unreadable flat once they crowd, so they tilt —
  // and the plot gets the extra bottom margin that tilting needs.
  const tilt = !horizontal && chartData.length > 6;

  return (
    <div className={cn("w-full", className)} style={{ height }} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={chartData}
          layout={horizontal ? "vertical" : "horizontal"}
          margin={{ top: showValues ? 20 : 8, right: 12, bottom: tilt ? 56 : 8, left: 4 }}
          barGap={3}
        >
          <CartesianGrid
            stroke="var(--card-border)"
            strokeDasharray="3 3"
            vertical={horizontal}
            horizontal={!horizontal}
          />

          {horizontal ? (
            <>
              <XAxis type="number" tickFormatter={formatValue} {...axis} />
              <YAxis type="category" dataKey="label" width={120} {...axis} />
            </>
          ) : (
            <>
              <XAxis
                dataKey="label"
                interval={0}
                angle={tilt ? -35 : 0}
                textAnchor={tilt ? "end" : "middle"}
                height={tilt ? 60 : 24}
                {...axis}
              />
              <YAxis tickFormatter={formatValue} width={56} {...axis} />
            </>
          )}

          <Tooltip
            cursor={{ fill: "var(--accent-muted-bg)", opacity: 0.45 }}
            content={<ChartTooltip formatValue={formatValue} />}
          />

          {names.length > 1 && (
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, color: "var(--text-secondary)", paddingTop: 8 }}
            />
          )}

          {names.map((name, i) => (
            <Bar
              key={name}
              dataKey={name}
              fill={CHART_SERIES_COLOURS[i % CHART_SERIES_COLOURS.length]}
              radius={horizontal ? [0, 3, 3, 0] : [3, 3, 0, 0]}
              maxBarSize={48}
              // Recharts (3.10.1) leaves a grouped bar stuck in its
              // pre-animation "inactive" state — grid, axes and legend all
              // draw, but the bar shapes themselves never appear — for data
              // shaped like this screen's "Active vs Inactive per account"
              // (two series, most categories with one value at exactly 0).
              // Confirmed live: identical chart, identical data, only
              // difference is this flag. Disabling the entry animation
              // sidesteps whatever in that state machine doesn't fire.
              isAnimationActive={false}
            >
              {showValues && (
                <LabelList
                  dataKey={name}
                  position={horizontal ? "right" : "top"}
                  formatter={formatValue}
                  style={{ fill: "var(--text-secondary)", fontSize: 10, fontWeight: 600 }}
                />
              )}
            </Bar>
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
