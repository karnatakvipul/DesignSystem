import { render, screen, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AuthLayout } from "../AuthLayout";
import { LoginForm } from "../../../pages/auth/LoginForm";
import { LoginPasswordForm } from "../../../pages/auth/LoginPasswordForm";

/**
 * A supplied logo has to reach both places the mark appears — the decorative
 * desktop panel and the compact mark above the card. The panel used to draw the
 * library's stock shield no matter what, so an app that supplied its own brand
 * got it on mobile and the placeholder on every desktop, which is the half
 * nobody notices in a jsdom test and everybody notices on a laptop.
 */
const MARK = <span data-testid="brand-mark">Acme</span>;

describe("branding", () => {
  it("uses a supplied logo in both the panel and the compact mark", () => {
    render(<AuthLayout logo={MARK}><p>Form</p></AuthLayout>);
    expect(screen.getAllByTestId("brand-mark")).toHaveLength(2);
  });

  it("falls back to the brand name when no logo is given", () => {
    render(<AuthLayout brandName="Contoso"><p>Form</p></AuthLayout>);
    expect(screen.getAllByText("Contoso").length).toBeGreaterThan(0);
  });

  it("does not print the brand name alongside a supplied logo", () => {
    // The logo carries the name; printing it again gives two wordmarks.
    render(<AuthLayout logo={MARK} brandName="Contoso"><p>Form</p></AuthLayout>);
    expect(screen.queryByText("Contoso")).toBeNull();
  });

  it("shows only the compact mark when the panel is hidden", () => {
    render(<AuthLayout logo={MARK} showBrandPanel={false}><p>Form</p></AuthLayout>);
    expect(screen.getAllByTestId("brand-mark")).toHaveLength(1);
  });

  it("sets a colour around each mark, so one drawn in currentColor suits both", () => {
    // The panel sits on the chrome colour and the card on the canvas. A
    // wordmark pinned to either is unreadable on the other.
    const { container } = render(<AuthLayout logo={MARK}><p>Form</p></AuthLayout>);
    const marks = within(container).getAllByTestId("brand-mark");

    expect(marks[0].closest(".text-ink-onchrome")).not.toBeNull();
    expect(marks[1].closest(".text-ink-primary")).not.toBeNull();
  });
});

describe("the sign-in steps hand it on", () => {
  it("LoginForm forwards the logo", () => {
    render(<LoginForm logo={MARK} validate={async () => {}} onContinue={vi.fn()} />);
    expect(screen.getAllByTestId("brand-mark")).toHaveLength(2);
  });

  it("LoginPasswordForm forwards the logo", () => {
    render(<LoginPasswordForm logo={MARK} email="admin" onSignIn={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getAllByTestId("brand-mark")).toHaveLength(2);
  });

  it("both still render without one", () => {
    const { unmount } = render(<LoginForm validate={async () => {}} onContinue={vi.fn()} />);
    expect(screen.getByRole("button", { name: /continue/i })).toBeDefined();
    unmount();

    render(<LoginPasswordForm email="admin" onSignIn={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByRole("button", { name: /sign in/i })).toBeDefined();
  });
});
