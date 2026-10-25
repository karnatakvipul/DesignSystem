import * as React from "react";
import { SegmentedControl } from "./SegmentedControl";

const OPTIONS = [
  { value: "issue", label: "Issue Date" },
  { value: "activation", label: "Activation Date" },
];

const meta = {
  title: "Components/SegmentedControl",
  component: SegmentedControl,
  tags: ["autodocs"],
  args: {
    label: "Date basis",
    options: OPTIONS,
  },
};

export default meta;

export const Playground = {
  render: (args) => {
    const [value, setValue] = React.useState(OPTIONS[0].value);
    return <SegmentedControl {...args} value={value} onChange={setValue} />;
  },
};

/** `wrap` for long/numerous labels — auto-width pills instead of equal-width segments that would clip text. */
export const Wrapping = {
  args: {
    label: "License type",
    wrap: true,
    options: [
      { value: "ef", label: "EnviroFRONT" },
      { value: "oc", label: "OCEMS" },
      { value: "sf", label: "SolarFRONT" },
      { value: "all", label: "All products" },
    ],
  },
  render: (args) => {
    const [value, setValue] = React.useState("ef");
    return <SegmentedControl {...args} value={value} onChange={setValue} />;
  },
};

export const WithError = {
  args: { error: "Pick a date basis to continue." },
  render: (args) => {
    const [value, setValue] = React.useState(undefined);
    return <SegmentedControl {...args} value={value} onChange={setValue} />;
  },
};
