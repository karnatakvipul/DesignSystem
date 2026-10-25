import { ShieldCheck, RefreshCcw, Users2, Lock, Gauge } from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { InputField } from "../common/InputField";
import { PasswordInput } from "../common/PasswordInput";
import { Button } from "../common/Button";
import { FormGroup } from "../common/FormGroup";
import { ThemeSwitcher } from "../../theme";

/**
 * The full-viewport shell for sign-in, sign-up and reset screens: a
 * decorative brand panel on the left at large sizes, and a centred form card
 * beside it.
 *
 * Purely presentational — it holds no auth logic. Every colour comes from the
 * active theme's CSS variables, so it follows whichever theme the host app has
 * on with no extra configuration.
 *
 * The brand panel is hidden below `lg`, where the form card takes the full
 * width. `showBrandPanel={false}` removes it at every size.
 */
const meta = {
  title: "Layout/AuthLayout",
  component: AuthLayout,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  argTypes: {
    logo: { control: false, description: "Replaces the default mark and wordmark." },
    brandName: { control: "text", description: "Used by the default mark. Ignored when `logo` is given." },
    title: { control: "text", description: "Headline on the brand panel." },
    subtitle: { control: "text" },
    features: { control: "object", description: "`{ icon, label }[]` listed under the subtitle." },
    showBrandPanel: { control: "boolean", description: "Hidden below `lg` regardless; this removes it entirely." },
    topRight: { control: false, description: "Corner slot — a theme switcher or a language picker." },
    footer: { control: false, description: "Below the form card." },
    children: { control: false, description: "The form itself." },
    className: { control: "text" },
  },
  args: {
    brandName: "my Design System",
    showBrandPanel: true,
  },
};

export default meta;

function SignInForm() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-secondary text-title font-bold text-ink-primary">Welcome back</h1>
        <p className="text-body-sm text-ink-muted">Sign in to your my Design System workspace</p>
      </div>
      <FormGroup label="Email address">
        <InputField placeholder="you@company.com" />
      </FormGroup>
      <PasswordInput label="Password" placeholder="Enter your password" />
      <Button variant="primary" fullWidth>
        Continue
      </Button>
      <p className="text-center text-body-sm text-ink-muted">
        Don&apos;t have an account? Contact customer care
      </p>
    </div>
  );
}

export const Playground = {
  render: (args) => (
    <div className="h-[42rem]">
      <AuthLayout {...args} topRight={<ThemeSwitcher />}>
        <SignInForm />
      </AuthLayout>
    </div>
  ),
};

/** Custom brand copy and feature list. */
export const CustomBranding = {
  render: () => (
    <div className="h-[42rem]">
      <AuthLayout
        brandName="Acme Licensing"
        title="Every licence, one screen."
        subtitle="Issue, renew and audit software licences across your estate."
        features={[
          { icon: <Lock size={16} />, label: "SOC 2 compliant audit trail" },
          { icon: <Gauge size={16} />, label: "Renewal forecasting built in" },
          { icon: <Users2 size={16} />, label: "Unlimited team seats" },
        ]}
        topRight={<ThemeSwitcher />}
      >
        <SignInForm />
      </AuthLayout>
    </div>
  ),
};

/** Without the brand panel the card is centred on its own — good for a reset or verify step. */
export const WithoutBrandPanel = {
  render: () => (
    <div className="h-[42rem]">
      <AuthLayout showBrandPanel={false} topRight={<ThemeSwitcher />}>
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="font-secondary text-title font-bold text-ink-primary">Reset your password</h1>
            <p className="text-body-sm text-ink-muted">We&apos;ll email you a reset link.</p>
          </div>
          <FormGroup label="Email address">
            <InputField placeholder="you@company.com" />
          </FormGroup>
          <Button variant="primary" fullWidth>
            Send reset link
          </Button>
        </div>
      </AuthLayout>
    </div>
  ),
};

/** With a footer under the card. */
export const WithFooter = {
  render: () => (
    <div className="h-[42rem]">
      <AuthLayout
        footer={<p className="text-center text-body-sm text-ink-muted">© 2026 my Design System — All rights reserved</p>}
      >
        <SignInForm />
      </AuthLayout>
    </div>
  ),
};

/** Below `lg` the brand panel drops away and the card takes the full width. */
export const Mobile = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => (
    <div className="h-[42rem]">
      <AuthLayout topRight={<ThemeSwitcher />}>
        <SignInForm />
      </AuthLayout>
    </div>
  ),
};

/** The default feature list, for reference. */
export const DefaultFeatures = {
  render: () => (
    <div className="h-[42rem]">
      <AuthLayout
        features={[
          { icon: <ShieldCheck size={16} />, label: "Every license tracked in one place" },
          { icon: <RefreshCcw size={16} />, label: "Renewals and alerts handled automatically" },
          { icon: <Users2 size={16} />, label: "Role-based access for your whole team" },
        ]}
      >
        <SignInForm />
      </AuthLayout>
    </div>
  ),
};
