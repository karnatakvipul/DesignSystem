import * as React from "react";
import { MultiSelectDropdown } from "./MultiSelectDropdown";

const PRODUCTS = [
  { value: "EnviroFRONT", label: "EnviroFRONT" },
  { value: "OCEMS", label: "OCEMS" },
  { value: "SolarFRONT", label: "SolarFRONT" },
];

const TERMS = [
  { value: "Yearly", label: "Yearly" },
  { value: "Half Year", label: "Half Year" },
  { value: "Quarterly", label: "Quarterly" },
  { value: "Monthly", label: "Monthly" },
  { value: "Custom", label: "Custom" },
  { value: "Free", label: "Free" },
];

/**
 * A dropdown that holds several values at once, for a filter where "any of
 * these" is the real question — Product, License Term.
 *
 * `value` is an array and `onChange` hands back an array, which is what
 * separates it from `Dropdown`. Pair it with `useResourceFilters` by giving
 * the field `type: "multiSelect"` and it is wired up for you.
 */
const meta = {
  title: "Components/Forms/MultiSelectDropdown",
  component: MultiSelectDropdown,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    required: { control: "boolean" },
    error: { control: "text" },
    options: { control: "object", description: "`{ value, label }[]` to choose from." },
    value: { control: "object", description: "Array of selected values." },
    onChange: { action: "changed", description: "Receives the full array of selected values." },
    placeholder: { control: "text", description: "Shown while nothing is selected." },
    className: { control: "text" },
  },
  args: {
    label: "Product",
    options: PRODUCTS,
    placeholder: "Select...",
  },
  render: function Render(args) {
    const [value, setValue] = React.useState(args.value ?? []);
    React.useEffect(() => setValue(args.value ?? []), [args.value]);
    return (
      <div className="w-80">
        <MultiSelectDropdown {...args} value={value} onChange={setValue} />
      </div>
    );
  },
};

export default meta;

export const Playground = {};

export const WithSelection = {
  args: { value: ["EnviroFRONT", "OCEMS"] },
};

/** A longer list, to show the menu scrolling rather than growing without limit. */
export const ManyOptions = {
  args: { label: "License Term", options: TERMS, value: ["Yearly"] },
};

export const States = {
  render: function Render() {
    const [a, setA] = React.useState([]);
    const [b, setB] = React.useState(["OCEMS"]);
    return (
      <div className="flex w-80 flex-col gap-5">
        <MultiSelectDropdown label="Empty" options={PRODUCTS} value={a} onChange={setA} />
        <MultiSelectDropdown label="With selection" options={PRODUCTS} value={b} onChange={setB} />
        <MultiSelectDropdown
          label="With error"
          options={PRODUCTS}
          value={[]}
          onChange={() => {}}
          error="Pick at least one product."
        />
      </div>
    );
  },
};
