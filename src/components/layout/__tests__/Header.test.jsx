import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Header } from "../Header";

describe("the brand mark", () => {
  /**
   * The mark normally lives in the `Sidebar`, which becomes a drawer on small
   * screens — and a closed drawer takes it off the screen entirely, so an app
   * had no logo at all on a phone. The top bar is the only place left for it,
   * which is what this slot is for.
   */
  it("renders a logo when given one", () => {
    render(<Header title="License" logo={<img alt="Acme" src="/logo.png" />} />);
    expect(screen.getByAltText("Acme")).toBeDefined();
  });

  it("renders nothing extra when not given one", () => {
    const { container } = render(<Header title="License" />);
    expect(container.querySelector("img")).toBeNull();
  });

  it("places the logo before the title, so the bar reads brand-then-page", () => {
    render(<Header title="License" logo={<img alt="Acme" src="/logo.png" />} />);
    const logo = screen.getByAltText("Acme");
    const title = screen.getByRole("heading", { name: "License" });
    // `compareDocumentPosition` rather than index maths: it survives the slot
    // being wrapped in another element.
    expect(logo.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("keeps the title readable next to it", () => {
    render(<Header title="User Activity" logo={<img alt="Acme" src="/logo.png" />} />);
    expect(screen.getByRole("heading", { name: "User Activity" })).toBeDefined();
  });
});

describe("the bar's own height", () => {
  /**
   * The controls in here are touch targets at `control-lg` (44px). The bar was
   * `h-10` (40px), so all of them sat ~2px proud of it on a phone. It has to
   * be at least as tall as what it contains.
   */
  it("is tall enough for a 44px touch target on a phone", () => {
    const { container } = render(<Header title="License" />);
    const header = container.querySelector("header");
    expect(header.className).toContain("h-12");
    expect(header.className).not.toMatch(/(^|\s)h-10(\s|$)/);
  });
});
