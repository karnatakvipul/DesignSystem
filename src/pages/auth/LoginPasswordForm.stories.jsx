import { LoginPasswordForm } from "./LoginPasswordForm";
import { ThemeSwitcher } from "../../theme";

/**
 * The second step of sign-in: the password screen.
 *
 * `email` is displayed rather than re-entered — the user already gave it on
 * the previous step, and showing it confirms which account they are signing
 * in to. `onBack` returns to `LoginForm`, which matters when they mistyped it.
 *
 * Branding props are forwarded to `AuthLayout`, so both steps can be branded
 * identically without either rendering the layout itself.
 */
const meta = {
  title: "Pages/Auth/LoginPasswordForm",
  component: LoginPasswordForm,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  argTypes: {
    email: { control: "text", description: "Shown, not re-entered — confirms which account." },
    onBack: { action: "back", description: "Returns to the email step." },
    onSignIn: { action: "sign in", description: "Receives the entered password." },
    hint: { control: "text" },
    footer: { control: false },
    logo: { control: false, description: "Forwarded to `AuthLayout`." },
    brandName: { control: "text", description: "Forwarded to `AuthLayout`." },
    topRight: { control: false, description: "Forwarded to `AuthLayout`." },
  },
  args: { email: "admin@my Design System.com" },
  render: (args) => (
    <div className="h-[42rem]">
      <LoginPasswordForm {...args} />
    </div>
  ),
};

export default meta;

export const Playground = {};

export const WithThemeSwitcher = {
  args: { topRight: <ThemeSwitcher /> },
};

/** Without the default demo hint. */
export const WithoutHint = { args: { hint: undefined } };

export const CustomBranding = {
  args: { brandName: "Acme Licensing", email: "ops@acme.com" },
};

export const Mobile = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
