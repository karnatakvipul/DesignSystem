import { LicenseTrendChart } from "./LicenseTrendChart";

const DATA = [
  { label: "Apr", total: 120, accountWise: 42 },
  { label: "May", total: 138, accountWise: 51 },
  { label: "Jun", total: 131, accountWise: 47 },
  { label: "Jul", total: 165, accountWise: 63 },
  { label: "Aug", total: 172, accountWise: 71 },
  { label: "Sep", total: 158, accountWise: 66 },
];

/**
 * The two-line licence trend on the dashboard — total licences against
 * account-wise licences over time.
 *
 * Hand-drawn SVG rather than Recharts: it is two polylines with no axes,
 * tooltips or interaction, and pulling in a chart library for that would cost
 * more than it returns. The lines use theme custom properties directly, so it
 * re-colours with the theme like the Recharts-based charts do.
 *
 * Both series are scaled against the **total**, so account-wise reads as a
 * proportion of the whole rather than being stretched to fill the box. Missing
 * or non-numeric values coerce to 0 rather than breaking the path.
 */
const meta = {
  title: "Feature/Dashboard/LicenseTrendChart",
  component: LicenseTrendChart,
  tags: ["autodocs"],
  argTypes: {
    data: { control: "object", description: "`{ label, total, accountWise }[]`." },
  },
  args: { data: DATA },
  render: (args) => (
    <div className="w-[40rem] rounded-surface border border-card-border p-4">
      <LicenseTrendChart {...args} />
    </div>
  ),
};

export default meta;

export const Playground = {};

/** A steadily climbing estate. */
export const UpwardTrend = {
  args: {
    data: [
      { label: "Apr", total: 80, accountWise: 20 },
      { label: "May", total: 110, accountWise: 35 },
      { label: "Jun", total: 145, accountWise: 52 },
      { label: "Jul", total: 190, accountWise: 78 },
    ],
  },
};

/** Two points is still a line. */
export const MinimalData = {
  args: {
    data: [
      { label: "Q1", total: 100, accountWise: 40 },
      { label: "Q2", total: 140, accountWise: 60 },
    ],
  },
};

/** Missing and non-numeric values coerce to zero instead of breaking the path. */
export const HandlesMissingValues = {
  args: {
    data: [
      { label: "Apr", total: 120, accountWise: 42 },
      { label: "May" },
      { label: "Jun", total: "not a number", accountWise: null },
      { label: "Jul", total: 165, accountWise: 63 },
    ],
  },
};

export const Empty = { args: { data: [] } };
