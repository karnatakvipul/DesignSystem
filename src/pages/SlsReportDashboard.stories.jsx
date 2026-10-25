import { SlsReportDashboard } from "./SlsReportDashboard";

const RENEWAL = [
  { label: "7 days", value: 3 },
  { label: "30 days", value: 12 },
  { label: "60 days", value: 8 },
  { label: "90 days", value: 21 },
];

const TREND = [
  { label: "Apr", total: 120, accountWise: 42 },
  { label: "May", total: 138, accountWise: 51 },
  { label: "Jun", total: 131, accountWise: 47 },
  { label: "Jul", total: 165, accountWise: 63 },
];

/**
 * The SLS reporting dashboard — upcoming renewals and the licence trend,
 * side by side.
 *
 * Its two charts are fed independently: pass `renewalFetcher` and/or
 * `trendFetcher` to drive either from a server, and each gets its own loading
 * and error state. Omit one and that chart falls back to demo data, so a
 * half-wired dashboard still renders.
 */
const meta = {
  title: "Pages/SlsReportDashboard",
  component: SlsReportDashboard,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  argTypes: {
    renewalFetcher: { control: false, description: "`() => Promise<{ label, value }[]>`. Omit for demo data." },
    trendFetcher: { control: false, description: "`() => Promise<{ label, total, accountWise }[]>`." },
    onToast: { action: "toast" },
  },
  render: (args) => (
    <div className="h-[42rem] overflow-auto bg-canvas p-2">
      <SlsReportDashboard {...args} />
    </div>
  ),
};

export default meta;

/** No fetchers — both charts use their demo data. */
export const Playground = {};

/** Both charts driven from stub servers. */
export const ServerBacked = {
  args: {
    renewalFetcher: () => new Promise((r) => setTimeout(() => r(RENEWAL), 400)),
    trendFetcher: () => new Promise((r) => setTimeout(() => r(TREND), 600)),
  },
};

/** Deliberately slow, to show both loading states at once. */
export const Loading = {
  args: {
    renewalFetcher: () => new Promise((r) => setTimeout(() => r(RENEWAL), 100000)),
    trendFetcher: () => new Promise((r) => setTimeout(() => r(TREND), 100000)),
  },
};

/** Each chart carries its own error state — one failing does not blank the other. */
export const OneChartFails = {
  args: {
    renewalFetcher: () => Promise.reject(new Error("Renewal service unavailable")),
    trendFetcher: () => new Promise((r) => setTimeout(() => r(TREND), 300)),
  },
};

export const Mobile = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
