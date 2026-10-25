import * as React from "react";
import { Dropdown } from "./Dropdown";

const OPTIONS = [
  { value: "yearly", label: "Yearly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "half-year", label: "Half Year" },
  { value: "custom", label: "Custom" },
];

const meta = {
  title: "Components/Dropdown",
  component: Dropdown,
  tags: ["autodocs"],
  args: {
    label: "License term",
    options: OPTIONS,
  },
  parameters: { layout: "padded" },
};

export default meta;

export const Playground = {
  render: (args) => {
    const [value, setValue] = React.useState(undefined);
    return (
      <div style={{ maxWidth: 280 }}>
        <Dropdown {...args} value={value} onChange={setValue} />
      </div>
    );
  },
};

export const Required = {
  args: { required: true },
  render: (args) => {
    const [value, setValue] = React.useState(undefined);
    return (
      <div style={{ maxWidth: 280 }}>
        <Dropdown {...args} value={value} onChange={setValue} />
      </div>
    );
  },
};

export const WithError = {
  args: { error: "Choose a license term to continue." },
  render: (args) => {
    const [value, setValue] = React.useState(undefined);
    return (
      <div style={{ maxWidth: 280 }}>
        <Dropdown {...args} value={value} onChange={setValue} />
      </div>
    );
  },
};

export const Disabled = {
  args: { disabled: true },
  render: (args) => (
    <div style={{ maxWidth: 280 }}>
      <Dropdown {...args} value="yearly" onChange={() => {}} />
    </div>
  ),
};
