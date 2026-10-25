import * as React from "react";
import { Mail, ArrowRight, Sparkles } from "lucide-react";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { InputField } from "../../components/common/InputField";
import { Button } from "../../components/common/Button";
import { ValidationMessage } from "../../components/common/ValidationMessage";

const KNOWN_EMAILS = ["admin@my Design System.com"];

async function defaultValidate(trimmedValue) {
  // Demo-only stand-in for a real lookup: simulates network latency, then
  // gates on a hardcoded allowlist. Replace via the `validate` prop to wire
  // up a real backend (or to skip this step entirely — see the prop docs).
  await new Promise((resolve) => setTimeout(resolve, 400));
  if (!KNOWN_EMAILS.includes(trimmedValue.toLowerCase())) {
    throw new Error("Please contact our customer care, you don't have an account.");
  }
}

/**
 * Step 1 of the two-step sign-in flow: collects an identifier (email or
 * username) and calls `onContinue` once it passes `validate`.
 *
 * With no extra props, this is a demo-only screen: `validate` defaults to a
 * simulated lookup against a hardcoded known-emails allowlist, so it does not
 * implement real authentication out of the box. Pass your own `validate`
 * (async, throw/reject with a message to reject) to wire this up to a real
 * backend — return successfully (including doing nothing at all, e.g. when
 * your backend only has a single combined login call) to always continue to
 * the next step.
 */
export function LoginForm({
  onContinue,
  validate = defaultValidate,
  label = "Email address",
  placeholder = "you@company.com",
  autoComplete = "username",
  heading = "Welcome back",
  subheading = "Sign in to your my Design System workspace",
  hint,
  footer,
  // Forwarded to AuthLayout so an app can brand the sign-in screen without
  // rendering the layout itself.
  logo,
  brandName,
  topRight,
}) {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const [checking, setChecking] = React.useState(false);
  const isDemo = validate === defaultValidate;

  async function next() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return setError("Please enter your email");
    setChecking(true);
    try {
      await validate(trimmedEmail);
      setError("");
      await onContinue(trimmedEmail);
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <AuthLayout logo={logo} brandName={brandName} topRight={topRight}>
      <div className="mb-7 text-center">
        <h2 className="font-secondary text-display font-semibold text-ink-primary">{heading}</h2>
        <p className="mt-1.5 text-body text-ink-muted">{subheading}</p>
      </div>

      <InputField
        label={label}
        icon={<Mail size={16} />}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && next()}
      />
      <ValidationMessage>{error}</ValidationMessage>

      <div className="mt-2 flex justify-end">
        <button type="button" className="text-body-sm font-medium text-accent hover:underline">
          Forgot email?
        </button>
      </div>

      <Button className="mt-6" fullWidth icon={<ArrowRight size={15} />} loading={checking} onClick={next}>
        Continue
      </Button>

      {footer !== null && (
        <>
          <div className="mt-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-card-border" />
            <span className="text-caption font-medium uppercase tracking-wide text-ink-muted">New here?</span>
            <span className="h-px flex-1 bg-card-border" />
          </div>

          {footer ?? (
            <p className="mt-4 text-center text-body text-ink-secondary">
              Don't have an account?{" "}
              <button type="button" className="font-medium text-accent hover:underline">
                Contact customer care
              </button>
            </p>
          )}
        </>
      )}

      {(hint ?? isDemo) && (
        <div className="mt-6 flex items-center justify-center gap-1.5 rounded-control bg-accent-muted px-3 py-2 text-body-sm text-accent">
          <Sparkles size={13} className="shrink-0" />
          <span>{hint ?? `Demo tip: try ${KNOWN_EMAILS[0]}`}</span>
        </div>
      )}
    </AuthLayout>
  );
}
