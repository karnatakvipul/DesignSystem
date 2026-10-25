import { Mail } from "lucide-react";
import { InputField } from "./InputField";

const meta = {
  title: "Components/InputField",
  component: InputField,
  tags: ["autodocs"],
  args: {
    label: "Email address",
    placeholder: "you@company.com",
  },
};

export default meta;

export const Playground = {};

export const Required = {
  args: { required: true, requiredText: "(required)" },
};

export const WithHint = {
  args: { hint: "We'll only use this to send license renewal reminders." },
};

export const WithIcon = {
  args: { icon: <Mail size={16} /> },
};

export const WithError = {
  args: { error: "Enter a valid email address.", defaultValue: "not-an-email" },
};

export const Disabled = {
  args: { disabled: true, defaultValue: "readonly@company.com" },
};
