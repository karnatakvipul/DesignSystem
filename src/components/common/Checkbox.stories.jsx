import * as React from "react";
import { Checkbox } from "./Checkbox";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  args: {
    label: "Send renewal reminders",
  },
};

export default meta;

/** A real, clickable checkbox — args alone can't hold interaction state. */
export const Playground = {
  render: (args) => {
    const [checked, setChecked] = React.useState(false);
    return <Checkbox {...args} checked={checked} onChange={(e) => setChecked(e.target.checked)} />;
  },
};

export const States = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Checkbox label="Unchecked" checked={false} onChange={() => {}} />
      <Checkbox label="Checked" checked={true} onChange={() => {}} />
      <Checkbox label="Indeterminate" checked={false} indeterminate onChange={() => {}} />
      <Checkbox label="Disabled" checked={false} disabled onChange={() => {}} />
    </div>
  ),
};
