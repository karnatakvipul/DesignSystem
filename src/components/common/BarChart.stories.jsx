import { BarChart } from "./BarChart";

/**
 * A bar chart over Recharts, pre-styled with the library's series colours,
 * axis treatment and tooltip.
 *
 * The data shape is deliberately simpler than Recharts': one
 * `{ label, values[] }` per category, with `series` naming the bars. The
 * mapping into Recharts' one-object-per-category form happens inside, so no
 * page has to build it.
 *
 * `series` positionally matches each row's `values` array — `series[0]` names
 * `values[0]`, and so on.
 */
const meta = {
  title: "Components/Charts/BarChart",
  component: BarChart,
  tags: ["autodocs"],
  argTypes: {
    data: { control: "object", description: "`{ label, values: number[] }[]` — one entry per category." },
    series: { control: "object", description: "Series names, positionally matched to each row's `values`." },
    formatValue: { control: false, description: "`(n) => string` for axis ticks, tooltips and value labels." },
    height: { control: { type: "number", min: 120, step: 20 } },
    showValues: { control: "boolean", description: "Prints each bar's value on it." },
    horizontal: { control: "boolean", description: "Rotates to horizontal bars — better for long category names." },
    emptyMessage: { control: "text" },
    className: { control: "text" },
  },
  args: {
    data: [
      { label: "Apr", values: [12] },
      { label: "May", values: [19] },
      { label: "Jun", values: [7] },
      { label: "Jul", values: [23] },
      { label: "Aug", values: [16] },
      { label: "Sep", values: [11] },
    ],
    series: ["Licences issued"],
    height: 280,
    showValues: false,
    horizontal: false,
  },
  render: (args) => (
    <div className="w-[40rem]">
      <BarChart {...args} />
    </div>
  ),
};

export default meta;

export const Playground = {};

/** `series` names each bar; each row's `values` supplies them in the same order. */
export const MultipleSeries = {
  args: {
    data: [
      { label: "Apr", values: [12, 5] },
      { label: "May", values: [19, 8] },
      { label: "Jun", values: [7, 3] },
      { label: "Jul", values: [23, 14] },
    ],
    series: ["Issued", "Renewed"],
  },
};

/** Horizontal suits long category names, which would otherwise be turned on their side. */
export const Horizontal = {
  args: {
    horizontal: true,
    height: 320,
    data: [
      { label: "Gmr Airport Hyderabad", values: [23] },
      { label: "K K Duplex & Paper Mills", values: [17] },
      { label: "0.5 Mld Toka Stp Ulb", values: [11] },
      { label: "Noida Plant 1", values: [8] },
    ],
    series: ["Licences"],
  },
};

export const WithValueLabels = {
  args: { showValues: true },
};

/** `formatValue` drives the axis, the tooltip and the value labels together. */
export const CustomFormatting = {
  args: {
    showValues: true,
    series: ["Revenue"],
    data: [
      { label: "Apr", values: [241900] },
      { label: "May", values: [60475] },
      { label: "Jun", values: [125250] },
    ],
    formatValue: (n) => `₹${Number(n).toLocaleString("en-IN")}`,
  },
};

export const Empty = {
  args: { data: [], emptyMessage: "No licences issued in this period" },
};
