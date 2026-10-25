import * as React from "react";
import { Lock, ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { AuthLayout } from "../../components/layout/AuthLayout";
import { PasswordInput } from "../../components/common/PasswordInput";
import { Button } from "../../components/common/Button";
import { ValidationMessage } from "../../components/common/ValidationMessage";

/**
 * Step 2 of the two-step sign-in flow: shows the previously entered email and
 * collects a password, then calls `onSignIn(password)`.
 *
 * With no wiring, `onSignIn` is expected to just accept any non-empty
 * password (this is what the default `hint` text advertises) — this
 * component does not implement or assume any particular auth backend itself.
 * Pass an async `onSignIn` that calls your real login endpoint and
 * throws/rejects with a message (e.g. "Invalid username or password") to
 * wire this up for real; the thrown message is shown via the same inline
 * error UI used everywhere else in the library.
 */
export function LoginPasswordForm({
  email,
  onBack,
  onSignIn,
  hint = "Demo tip: any password works",
  footer,
  // Forwarded to AuthLayout so an app can brand the sign-in screen without
  // rendering the layout itself.
  logo,
  brandName,
  topRight,
}) {
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [checking, setChecking] = React.useState(false);

  async function signIn() {
    if (!password.trim()) return setError("Please enter your password");
    setChecking(true);
    try {
      await onSignIn(password);
      setError("");
    } catch (err) {
      setError(err?.message || "Sign in failed. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  const initial = (email || "?").trim().charAt(0).toUpperCase();

  return (
    <AuthLayout logo={logo} brandName={brandName} topRight={topRight}>
      <div className="mb-7 flex flex-col items-center text-center">
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-pill bg-accent-muted text-lg font-semibold text-accent">
          {initial}
        </span>
        <h2 className="font-secondary text-display font-semibold text-ink-primary">Enter your password</h2>
        <button
          type="button"
          onClick={onBack}
          className="mt-1.5 inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-body text-ink-secondary hover:bg-accent-muted hover:text-ink-primary"
        >
          {email}
          <ChevronDown size={14} />
        </button>
      </div>

      <PasswordInput
        label="Password"
        icon={<Lock size={16} />}
        placeholder="Enter your password"
        autoComplete="current-password"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && signIn()}
      />
      <ValidationMessage>{error}</ValidationMessage>

      <div className="mt-2 flex justify-end">
        <button type="button" className="text-body-sm font-medium text-accent hover:underline">
          Forgot password?
        </button>
      </div>

      <Button className="mt-6" fullWidth icon={<ArrowRight size={15} />} loading={checking} onClick={signIn}>
        Sign in
      </Button>

      {footer !== null &&
        (footer ?? (
          <p className="mt-6 text-center text-body text-ink-secondary">
            Don't have an account?{" "}
            <button type="button" className="font-medium text-accent hover:underline">
              Contact customer care
            </button>
          </p>
        ))}

      {hint && (
        <div className="mt-6 flex items-center justify-center gap-1.5 rounded-control bg-accent-muted px-3 py-2 text-body-sm text-accent">
          <Sparkles size={13} className="shrink-0" />
          <span>{hint}</span>
        </div>
      )}
    </AuthLayout>
  );
}
