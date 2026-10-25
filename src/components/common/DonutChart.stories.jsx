import { DonutChart } from "./DonutChart";

/**
 * A donut chart over Recharts, sharing the library's series colours with
 * `BarChart` so the two read as one system on a dashboard.
 *
 * Takes a flat `{ label, value }[]`. Slices with a value of zero or less are
 * dropped rather than drawn as invisible wedges, and when everything sums to
 * zero the whole chart is replaced by `emptyMessage` — a donut of nothing is
 * a ring that looks like a bug.
 *
 * `centerLabel` and `centerValue` fill the hole, which is the natural place
 * for the total the slices add up to.
 */
const meta = {
  title: "Components/Charts/DonutChart",
  component: DonutChart,
  tags: ["autodocs"],
  argTypes: {
    data: { control: "object", description: "`{ label, value }[]`. Non-positive values are dropped." },
    centerLabel: { control: "text", description: "Caption inside the hole." },
    centerValue: { control: "text", description: "Figure inside the hole — usually the total." },
    formatValue: { control: false, description: "`(n) => string` for legend and tooltip values." },
    height: { control: { type: "number", min: 120, step: 20 } },
    emptyMessage: { control: "text" },
    className: { control: "text" },
  },
  args: {
    data: [
      { label: "Active", value: 42 },
      { label: "Expiring", value: 13 },
      { label: "Expired", value: 27 },
      { label: "Deactivated", value: 6 },
    ],
    centerLabel: "Licences",
    centerValue: "88",
    height: 200,
  },
  render: (args) => (
    <div className="w-[32rem]">
      <DonutChart {...args} />
    </div>
  ),
};

export default meta;

export const Playground = {};

/** Without a centre label the hole is left empty. */
export const NoCenterLabel = {
  args: { centerLabel: undefined, centerValue: undefined },
};

/** `formatValue` drives the legend and tooltip figures. */
export const CurrencyValues = {
  args: {
    data: [
      { label: "Paid", value: 241900 },
      { label: "Pending", value: 60475 },
      { label: "Cancelled", value: 25250 },
    ],
    centerLabel: "Billed",
    centerValue: "₹3,27,625",
    formatValue: (n) => `₹${Number(n).toLocaleString("en-IN")}`,
  },
};

/** Zero and negative slices are dropped rather than drawn as invisible wedges. */
export const DropsNonPositiveSlices = {
  args: {
    data: [
      { label: "Active", value: 42 },
      { label: "Expiring", value: 0 },
      { label: "Expired", value: 27 },
      { label: "Nonsense", value: -5 },
    ],
    centerLabel: "Licences",
    centerValue: "69",
  },
};

/** When everything sums to zero the chart is replaced outright — a ring of nothing looks like a bug. */
export const Empty = {
  args: { data: [], emptyMessage: "No licences to chart" },
};

export const Sizes = {
  render: () => (
    <div className="flex flex-wrap items-start gap-8">
      {[160, 200, 260].map((h) => (
        <div key={h} className="w-64">
          <p className="mb-2 text-body-sm text-ink-muted">height={h}</p>
          <DonutChart
            height={h}
            centerLabel="Total"
            centerValue="88"
            data={[
              { label: "Active", value: 42 },
              { label: "Expired", value: 27 },
              { label: "Expiring", value: 19 },
            ]}
          />
        </div>
      ))}
    </div>
  ),
};
