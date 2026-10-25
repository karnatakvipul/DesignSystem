import * as React from "react";
import { InputGroup } from "./InputGroup";

/**
 * An input with a fixed add-on fused to one or both ends — a currency symbol,
 * a unit, a domain suffix.
 *
 * The add-on is part of the control rather than text beside it, so the unit
 * cannot be scrolled away from the number it belongs to, and the whole thing
 * still reads as one field.
 */
const meta = {
  title: "Components/Forms/InputGroup",
  component: InputGroup,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    required: { control: "boolean" },
    requiredText: { control: "text", description: 'Badge beside the label, e.g. "(required)".' },
    error: { control: "text" },
    addonLeft: { control: "text", description: "Content fused to the left edge — a symbol, icon or short word." },
    addonRight: { control: "text", description: "Content fused to the right edge — a unit or trailing action." },
    value: { control: "text" },
    placeholder: { control: "text" },
    type: { control: "select", options: ["text", "number", "email", "tel", "url"] },
    disabled: { control: "boolean" },
    className: { control: "text" },
    id: { control: "text", description: "Defaults to a generated id, wired to the label." },
  },
  args: {
    label: "Subscription amount",
    requiredText: "(required)",
    addonLeft: "₹",
    type: "number",
    placeholder: "Enter subscription amount",
  },
  render: function Render(args) {
    const [value, setValue] = React.useState(args.value ?? "");
    return (
      <div className="w-80">
        <InputGroup {...args} value={value} onChange={(e) => setValue(e.target.value)} />
      </div>
    );
  },
};

export default meta;

export const Playground = {};

/** Either end, or both at once. */
export const AddonPositions = {
  render: () => (
    <div className="flex w-80 flex-col gap-5">
      <InputGroup label="Left add-on" addonLeft="₹" type="number" placeholder="0.00" />
      <InputGroup label="Right add-on" addonRight="Days" type="number" placeholder="365" />
      <InputGroup label="Both ends" addonLeft="https://" addonRight=".com" placeholder="my Design System" />
    </div>
  ),
};

export const States = {
  render: () => (
    <div className="flex w-80 flex-col gap-5">
      <InputGroup label="Default" addonLeft="₹" placeholder="0.00" />
      <InputGroup label="With error" addonLeft="₹" error="Amount must be greater than zero." defaultValue="0" />
      <InputGroup label="Disabled" addonLeft="₹" disabled defaultValue="2121.00" />
    </div>
  ),
};
