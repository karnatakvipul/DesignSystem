import * as React from "react";
import { ToggleButtonGroup } from "./ToggleButtonGroup";

const OPTIONS = [
  { value: "table", label: "Table" },
  { value: "cards", label: "Cards" },
];

const meta = {
  title: "Components/ToggleButtonGroup",
  component: ToggleButtonGroup,
  tags: ["autodocs"],
  args: {
    options: OPTIONS,
  },
};

export default meta;

export const Playground = {
  render: (args) => {
    const [value, setValue] = React.useState(OPTIONS[0].value);
    return <ToggleButtonGroup {...args} value={value} onChange={setValue} />;
  },
};
