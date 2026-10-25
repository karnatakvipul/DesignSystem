import { ChartWithData } from "./ChartWithData";
import { UpcomingRenewalChart } from "./UpcomingRenewalChart";
import { LicenseTrendChart } from "./LicenseTrendChart";
import { BarChart } from "../../common/BarChart";

const COLUMNS = [
  { key: "account", header: "ACCOUNT" },
  { key: "licences", header: "LICENCES", align: "right" },
  { key: "expiring", header: "EXPIRING", align: "right" },
];

const ROWS = [
  { id: 1, account: "Prima Equipment", licences: 42, expiring: 6 },
  { id: 2, account: "Aaxis Nano", licences: 31, expiring: 2 },
  { id: 3, account: "Abc Industries Pvt Ltd", licences: 27, expiring: 9 },
  { id: 4, account: "Deewan Enterprises", licences: 18, expiring: 1 },
  { id: 5, account: "Imtb Engineers Pvt Ltd", licences: 12, expiring: 0 },
];

/**
 * A dashboard panel pairing a chart with the table behind it — the shape, then
 * the numbers.
 *
 * The chart is whatever you pass, so this composes with `BarChart`,
 * `DonutChart` or the hand-drawn dashboard charts equally.
 *
 * **The table is height-capped and scrolls.** A panel listing twenty accounts
 * would push everything below it off the page, and the point of a dashboard
 * layout is that the page stays scannable. It uses `MobileTableWrapper`
 * underneath, so the table becomes cards on a phone.
 */
const meta = {
  title: "Feature/Dashboard/ChartWithData",
  component: ChartWithData,
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text" },
    chart: { control: false, description: "Any chart node." },
    columns: { control: "object", description: "Columns for the table below the chart." },
    rows: { control: "object" },
    rowKey: { control: false },
    emptyMessage: { control: "text" },
    dense: { control: "boolean" },
    headerAlign: { control: "inline-radio", options: ["left", "center", "right"] },
  },
  args: {
    title: "Licences by account",
    columns: COLUMNS,
    rows: ROWS,
    rowKey: (r) => r.id,
    dense: true,
    headerAlign: "left",
  },
  render: (args) => (
    <div className="w-[40rem]">
      <ChartWithData {...args} />
    </div>
  ),
};

export default meta;

export const Playground = {
  args: {
    chart: (
      <BarChart
        height={200}
        series={["Licences"]}
        data={ROWS.map((r) => ({ label: r.account.split(" ")[0], values: [r.licences] }))}
      />
    ),
  },
};

/** Composes with the hand-drawn dashboard charts too. */
export const WithRenewalChart = {
  args: {
    title: "Upcoming renewals",
    chart: (
      <UpcomingRenewalChart
        data={[
          { label: "7 days", value: 3 },
          { label: "30 days", value: 12 },
          { label: "60 days", value: 8 },
          { label: "90 days", value: 21 },
        ]}
      />
    ),
  },
};

export const WithTrendChart = {
  args: {
    title: "Licence trend",
    chart: (
      <LicenseTrendChart
        data={[
          { label: "Apr", total: 120, accountWise: 42 },
          { label: "May", total: 138, accountWise: 51 },
          { label: "Jun", total: 165, accountWise: 63 },
        ]}
      />
    ),
  },
};

/** Beyond a few rows the table scrolls inside its cap rather than growing the panel. */
export const ManyRowsScroll = {
  args: {
    chart: <UpcomingRenewalChart data={[{ label: "30 days", value: 12 }]} />,
    rows: Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      account: `Account ${i + 1}`,
      licences: 40 - i,
      expiring: i % 5,
    })),
  },
};

export const Empty = {
  args: {
    chart: <UpcomingRenewalChart data={[]} />,
    rows: [],
    emptyMessage: "No accounts to show.",
  },
};
