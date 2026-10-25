import { LoginForm } from "./LoginForm";
import { ThemeSwitcher } from "../../theme";

/**
 * The first step of sign-in: the email screen, rendered inside `AuthLayout`.
 *
 * It is split from the password step so the two can be separate screens — the
 * pattern Google popularised, and the one that lets an app look the account up
 * before deciding whether to ask for a password, an SSO redirect, or a magic
 * link.
 *
 * `validate` overrides the built-in email check, returning an error string or
 * nothing. Branding props (`logo`, `brandName`, `topRight`) are forwarded
 * straight to `AuthLayout`, so an app can brand the screen without rendering
 * the layout itself.
 */
const meta = {
  title: "Pages/Auth/LoginForm",
  component: LoginForm,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  argTypes: {
    onContinue: { action: "continue", description: "Receives the entered email once validation passes." },
    validate: { control: false, description: "`(value) => string | undefined`. Overrides the built-in email check." },
    label: { control: "text" },
    placeholder: { control: "text" },
    autoComplete: { control: "text" },
    heading: { control: "text" },
    subheading: { control: "text" },
    hint: { control: "text", description: "Small print under the form." },
    footer: { control: false },
    logo: { control: false, description: "Forwarded to `AuthLayout`." },
    brandName: { control: "text", description: "Forwarded to `AuthLayout`." },
    topRight: { control: false, description: "Forwarded to `AuthLayout`." },
  },
  render: (args) => (
    <div className="h-[42rem]">
      <LoginForm {...args} />
    </div>
  ),
};

export default meta;

/** Submit an invalid address to see the built-in validation. */
export const Playground = {};

export const WithHintAndThemeSwitcher = {
  args: {
    hint: "Demo tip: try admin@my Design System.com",
    topRight: <ThemeSwitcher />,
  },
};

/** Custom branding, all forwarded through to `AuthLayout`. */
export const CustomBranding = {
  args: {
    brandName: "Acme Licensing",
    heading: "Sign in to Acme",
    subheading: "Manage your licence estate",
  },
};

/** A stricter rule — only company addresses are accepted. */
export const CustomValidation = {
  args: {
    label: "Work email",
    placeholder: "you@my Design System.com",
    validate: (value) =>
      value.endsWith("@my Design System.com") ? undefined : "Use your @my Design System.com address.",
  },
};

export const Mobile = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
