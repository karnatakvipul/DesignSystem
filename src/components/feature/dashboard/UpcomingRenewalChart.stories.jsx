import { UpcomingRenewalChart } from "./UpcomingRenewalChart";

/**
 * The dashboard's upcoming-renewals bars — how many licences fall due in each
 * window.
 *
 * Plain divs rather than a chart library: it is a handful of bars with a label
 * and a figure, and the figure is printed above each bar anyway, so there is
 * nothing for a tooltip or axis to add.
 *
 * Bars are scaled against the largest value, with a 4px floor so a window
 * holding one licence is still visible rather than collapsing to nothing.
 */
const meta = {
  title: "Feature/Dashboard/UpcomingRenewalChart",
  component: UpcomingRenewalChart,
  tags: ["autodocs"],
  argTypes: {
    data: { control: "object", description: "`{ label, value }[]`." },
  },
  args: {
    data: [
      { label: "7 days", value: 3 },
      { label: "30 days", value: 12 },
      { label: "60 days", value: 8 },
      { label: "90 days", value: 21 },
    ],
  },
  render: (args) => (
    <div className="w-[36rem] rounded-surface border border-card-border p-4">
      <UpcomingRenewalChart {...args} />
    </div>
  ),
};

export default meta;

export const Playground = {};

/** The 4px floor keeps a single-licence window visible next to a much larger one. */
export const SmallValuesStayVisible = {
  args: {
    data: [
      { label: "7 days", value: 1 },
      { label: "30 days", value: 2 },
      { label: "60 days", value: 95 },
      { label: "90 days", value: 140 },
    ],
  },
};

/** Nothing due — every bar sits at its floor. */
export const AllZero = {
  args: {
    data: [
      { label: "7 days", value: 0 },
      { label: "30 days", value: 0 },
      { label: "60 days", value: 0 },
    ],
  },
};

export const SingleWindow = { args: { data: [{ label: "30 days", value: 12 }] } };

export const Empty = { args: { data: [] } };
