import { KeyRound } from "lucide-react";
import { PasswordInput } from "./PasswordInput";

/**
 * A password field with a built-in show/hide toggle.
 *
 * The toggle swaps the input's `type` rather than masking with CSS, so a
 * password manager still recognises the field. Every prop not listed below is
 * spread onto the `<input>`, so `autoComplete`, `name`, `minLength` and the
 * rest work as usual.
 */
const meta = {
  title: "Components/Forms/PasswordInput",
  component: PasswordInput,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    required: { control: "boolean" },
    error: { control: "text", description: "Error message; also turns the border red and sets `aria-invalid`." },
    hint: { control: "text", description: "Helper text below the field." },
    icon: { control: false, description: "Optional leading icon node, inset on the left." },
    id: { control: "text", description: "Defaults to a generated id, wired to the label." },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    className: { control: "text" },
  },
  args: {
    label: "Password",
    placeholder: "Enter your password",
  },
  render: (args) => (
    <div className="w-80">
      <PasswordInput {...args} />
    </div>
  ),
};

export default meta;

export const Playground = {};

/** Click the eye to reveal — the field's `type` flips between `password` and `text`. */
export const WithLeadingIcon = {
  args: { icon: <KeyRound size={16} />, label: "Current password" },
};

export const States = {
  render: () => (
    <div className="flex w-80 flex-col gap-5">
      <PasswordInput label="Default" placeholder="Enter your password" />
      <PasswordInput label="Required" required placeholder="Enter your password" />
      <PasswordInput label="With hint" hint="At least 12 characters." placeholder="Enter your password" />
      <PasswordInput label="With error" error="Incorrect password." defaultValue="wrong-value" />
      <PasswordInput label="Disabled" disabled defaultValue="locked" />
    </div>
  ),
};
