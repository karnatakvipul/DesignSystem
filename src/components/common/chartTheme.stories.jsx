import { CHART_SERIES_COLOURS, chartAxisStyle, ChartTooltip } from "./chartTheme";
import { BarChart } from "./BarChart";
import { DonutChart } from "./DonutChart";

/**
 * The shared chart styling — exported so an app can draw a chart this library
 * does not ship and still have it match: same series colours, same axis
 * treatment, same tooltip.
 *
 * Not a component but a small toolkit:
 *
 * - **`CHART_SERIES_COLOURS`** — the ordered palette. Series *n* takes
 *   `CHART_SERIES_COLOURS[n % length]`, which is what makes the same series
 *   the same colour across every chart on a dashboard.
 * - **`chartAxisStyle()`** — axis stroke, tick fill and font, returned as a
 *   props object to spread onto a Recharts `<XAxis>` / `<YAxis>`.
 * - **`ChartTooltip`** — the themed tooltip, passed to Recharts as
 *   `<Tooltip content={<ChartTooltip />} />`.
 *
 * Recharts takes plain CSS colour strings, so the theme's custom properties
 * work directly — a chart re-colours itself when the theme switches, with no
 * JavaScript listening for the change.
 */
const meta = {
  title: "Components/Charts/chartTheme",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Shared chart tokens and helpers. Import from `my Design System` alongside `BarChart` and `DonutChart`.",
      },
    },
  },
};

export default meta;

/** The ordered palette. Series take these in order and wrap around past the sixth. */
export const SeriesPalette = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {CHART_SERIES_COLOURS.map((colour, i) => (
        <div key={colour} className="w-40 rounded-surface border border-card-border p-3">
          <div className="h-12 w-full rounded-control" style={{ background: colour }} />
          <p className="mt-2 text-body-sm font-semibold text-ink-primary">Series {i + 1}</p>
          <p className="font-mono text-body-sm text-ink-muted">{colour}</p>
        </div>
      ))}
    </div>
  ),
};

/** The axis props object, spread onto a Recharts axis. */
export const AxisStyle = {
  render: () => (
    <pre className="rounded-control bg-chrome-deep/40 p-4 font-mono text-body-sm text-ink-secondary">
      {JSON.stringify(chartAxisStyle(), null, 2)}
    </pre>
  ),
};

/** The tooltip, rendered directly with the payload Recharts would hand it. */
export const Tooltip = {
  render: () => (
    <div className="flex flex-wrap items-start gap-6">
      <ChartTooltip
        active
        label="Jul"
        payload={[
          { name: "Issued", value: 23, color: CHART_SERIES_COLOURS[0] },
          { name: "Renewed", value: 14, color: CHART_SERIES_COLOURS[1] },
        ]}
      />
      <ChartTooltip
        active
        label="Revenue"
        formatValue={(n) => `₹${Number(n).toLocaleString("en-IN")}`}
        payload={[{ name: "Billed", value: 241900, color: CHART_SERIES_COLOURS[2] }]}
      />
    </div>
  ),
};

/** Both shipped charts draw from the same palette, so a dashboard reads as one system. */
export const SharedAcrossCharts = {
  render: () => (
    <div className="flex flex-wrap items-start gap-8">
      <div className="w-[28rem]">
        <BarChart
          height={240}
          series={["Issued", "Renewed", "Lapsed"]}
          data={[
            { label: "Apr", values: [12, 5, 2] },
            { label: "May", values: [19, 8, 4] },
            { label: "Jun", values: [7, 3, 1] },
          ]}
        />
      </div>
      <div className="w-72">
        <DonutChart
          height={200}
          centerLabel="Licences"
          centerValue="88"
          data={[
            { label: "Active", value: 42 },
            { label: "Expiring", value: 13 },
            { label: "Expired", value: 27 },
            { label: "Deactivated", value: 6 },
          ]}
        />
      </div>
    </div>
  ),
};
