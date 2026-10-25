import { FilterField } from "./FilterField";
import { Dropdown } from "./Dropdown";
import { InputField } from "./InputField";
import { DateRangePicker } from "./DateRangePicker";

const ALL = [
  { value: "", label: "All" },
  { value: "Active", label: "Active" },
  { value: "Expired", label: "Expired" },
  { value: "Deactivated", label: "Deactivated" },
];

/**
 * One labelled row in a filter panel — label on the left, control on the
 * right.
 *
 * Deliberately *not* a `FormGroup` variant. A form is filled in top to bottom,
 * so `FormGroup` stacks its label above the control. A filter panel is
 * *scanned* — you run your eye down the labels looking for the one you want —
 * so the labels need to line up in a column of their own. Different layout,
 * not a different skin.
 *
 * Any control can sit inside; the row owns only the label and the alignment.
 * Below `sm` it stacks, because at panel widths a side-by-side label would
 * squeeze the control to nothing.
 */
const meta = {
  title: "Components/Filters/FilterField",
  component: FilterField,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text", description: "Shown in the left column." },
    htmlFor: { control: "text", description: "Id of the control, so clicking the label focuses it." },
    labelAlign: {
      control: "inline-radio",
      options: ["left", "right"],
      description:
        'Alignment within the label column. `"right"` (default) sits the label close to its control; `"left"` keeps every label flush to the panel edge.',
    },
    children: { control: false },
    className: { control: "text" },
  },
  args: { label: "License Status", labelAlign: "right" },
  render: (args) => (
    <div className="w-[32rem] rounded-surface border border-card-border p-4">
      <FilterField {...args}>
        <Dropdown options={ALL} value="" onChange={() => {}} />
      </FilterField>
    </div>
  ),
};

export default meta;

export const Playground = {};

/** Right hugs each label to its control; left keeps them flush to the panel edge. Compare the ragged column. */
export const LabelAlignment = {
  render: () => (
    <div className="flex flex-col gap-6">
      {["right", "left"].map((align) => (
        <div key={align}>
          <p className="mb-2 text-body-sm text-ink-muted">labelAlign=&quot;{align}&quot;</p>
          <div className="flex w-[32rem] flex-col gap-3 rounded-surface border border-card-border p-4">
            <FilterField label="Product" labelAlign={align}>
              <Dropdown options={ALL} value="" onChange={() => {}} />
            </FilterField>
            <FilterField label="License Status" labelAlign={align}>
              <Dropdown options={ALL} value="" onChange={() => {}} />
            </FilterField>
            <FilterField label="Performa Invoice" labelAlign={align}>
              <InputField placeholder="PIC260316" />
            </FilterField>
          </div>
        </div>
      ))}
    </div>
  ),
};

/** The row owns only label and alignment — any control fits. */
export const AnyControl = {
  render: () => (
    <div className="flex w-[32rem] flex-col gap-3 rounded-surface border border-card-border p-4">
      <FilterField label="License Status" labelAlign="left">
        <Dropdown options={ALL} value="" onChange={() => {}} />
      </FilterField>
      <FilterField label="Performa Invoice" labelAlign="left">
        <InputField placeholder="PIC260316" />
      </FilterField>
      <FilterField label="Upcoming Renewal" labelAlign="left">
        <DateRangePicker />
      </FilterField>
    </div>
  ),
};

/** Below `sm` the row stacks so the control keeps its width. */
export const StacksOnMobile = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => (
    <div className="flex flex-col gap-3 rounded-surface border border-card-border p-4">
      <FilterField label="License Status" labelAlign="left">
        <Dropdown options={ALL} value="" onChange={() => {}} />
      </FilterField>
      <FilterField label="Performa Invoice" labelAlign="left">
        <InputField placeholder="PIC260316" />
      </FilterField>
    </div>
  ),
};
