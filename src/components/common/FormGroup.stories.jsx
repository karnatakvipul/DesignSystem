import { FormGroup } from "./FormGroup";
import { InputField } from "./InputField";

/**
 * The label / required badge / hint / error frame every form control in this
 * library sits inside. `InputField`, `PasswordInput`, `InputGroup`,
 * `Dropdown`, `DatePicker` and `DateRangePicker` all render one internally, so
 * you rarely reach for it directly — use it when wrapping a control the
 * library does not ship, and the new field lines up with the rest for free.
 */
const meta = {
  title: "Components/Forms/FormGroup",
  component: FormGroup,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text", description: "Field label rendered above the control." },
    htmlFor: { control: "text", description: "Forwarded to the label's `for`, so clicking it focuses the control." },
    required: { control: "boolean", description: "Marks the field required." },
    requiredText: { control: "text", description: 'Badge text beside the label, e.g. "(required)".' },
    hint: { control: "text", description: "Helper text below the control. Hidden while `error` is set." },
    error: { control: "text", description: "Error message below the control. Takes precedence over `hint`." },
    className: { control: "text" },
  },
  args: {
    label: "Account name",
    requiredText: "(required)",
    hint: "Shown to everyone who can see this licence.",
  },
  render: (args) => (
    <div className="w-80">
      <FormGroup {...args}>
        <InputField placeholder="Aaxis Nano" />
      </FormGroup>
    </div>
  ),
};

export default meta;

export const Playground = {};

/** `error` replaces `hint` rather than stacking under it — two lines of guidance where one is a correction reads as noise. */
export const States = {
  render: () => (
    <div className="flex w-80 flex-col gap-5">
      <FormGroup label="Plain">
        <InputField placeholder="No hint, no error" />
      </FormGroup>
      <FormGroup label="Required" requiredText="(required)">
        <InputField placeholder="Marked required" />
      </FormGroup>
      <FormGroup label="With hint" hint="Up to 60 characters.">
        <InputField placeholder="Guidance below" />
      </FormGroup>
      <FormGroup label="With error" error="Account name is already taken." hint="This hint is suppressed.">
        <InputField placeholder="Correction below" />
      </FormGroup>
    </div>
  ),
};
