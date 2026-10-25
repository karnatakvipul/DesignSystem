import * as React from "react";
import { DateRangePicker } from "./DateRangePicker";

const meta = {
  title: "Components/DateRangePicker",
  component: DateRangePicker,
  tags: ["autodocs"],
  args: {
    label: "Upcoming renewal",
  },
  parameters: { layout: "padded" },
};

export default meta;

export const Playground = {
  render: (args) => {
    const [value, setValue] = React.useState({ from: null, to: null });
    return <DateRangePicker {...args} value={value} onChange={setValue} />;
  },
};

/** The connecting band between the two endpoints reads at ~1.3:1 contrast over the card on every theme — try switching themes in the toolbar above. */
export const PreselectedRange = {
  render: (args) => {
    const [value, setValue] = React.useState({
      from: new Date(2026, 0, 5),
      to: new Date(2026, 0, 20),
    });
    return <DateRangePicker {...args} value={value} onChange={setValue} />;
  },
};

export const DisablePastDates = {
  render: (args) => {
    const [value, setValue] = React.useState({ from: null, to: null });
    return <DateRangePicker {...args} value={value} onChange={setValue} disablePastDates />;
  },
};

export const WithError = {
  render: (args) => {
    const [value, setValue] = React.useState({ from: null, to: null });
    return <DateRangePicker {...args} value={value} onChange={setValue} required error="Pick a date range to filter by." />;
  },
};
