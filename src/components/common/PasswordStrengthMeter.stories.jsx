import * as React from "react";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { PasswordInput } from "./PasswordInput";

/**
 * The bar under a new-password field.
 *
 * Scores out of five, one point each for: 8+ characters, 12+ characters, mixed
 * case, a digit, and a symbol. 0–1 reads Weak (red), 2–3 Medium (amber), 4–5
 * Strong (green).
 *
 * It renders **nothing** for an empty password, so it can sit permanently
 * under the field without a conditional at the call site.
 */
const meta = {
  title: "Components/Forms/PasswordStrengthMeter",
  component: PasswordStrengthMeter,
  tags: ["autodocs"],
  argTypes: {
    password: { control: "text", description: "The password to score. Empty renders nothing." },
    className: { control: "text" },
  },
  args: { password: "Passw0rd!" },
  render: (args) => (
    <div className="w-80">
      <PasswordStrengthMeter {...args} />
    </div>
  ),
};

export default meta;

export const Playground = {};

/** Each band, with a password that lands in it. */
export const AllBands = {
  render: () => (
    <div className="flex w-80 flex-col gap-5">
      {[
        ["short", "Weak — under 8 characters, nothing else"],
        ["longenough", "Medium — 8+ and lower case only"],
        ["LongEnough1", "Medium — 12 chars, mixed case, a digit"],
        ["LongEnough1!", "Strong — everything"],
      ].map(([pw, note]) => (
        <div key={pw}>
          <p className="font-mono text-body-sm text-ink-primary">{pw}</p>
          <PasswordStrengthMeter password={pw} />
          <p className="mt-1 text-body-sm text-ink-muted">{note}</p>
        </div>
      ))}
    </div>
  ),
};

/** Nothing renders until the field has a value. */
export const EmptyRendersNothing = {
  args: { password: "" },
  render: (args) => (
    <div className="w-80">
      <p className="text-body-sm text-ink-muted">(no meter below this line)</p>
      <PasswordStrengthMeter {...args} />
    </div>
  ),
};

/** How it is actually used — paired with `PasswordInput`, scoring as you type. */
export const WithPasswordInput = {
  render: function Render() {
    const [value, setValue] = React.useState("");
    return (
      <div className="w-80">
        <PasswordInput
          label="New password"
          placeholder="Choose a password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <PasswordStrengthMeter password={value} />
      </div>
    );
  },
};
