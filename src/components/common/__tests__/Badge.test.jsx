import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Badge } from "../Badge";

/** The radius classes a badge may carry, so "exactly one" can be asserted. */
const radii = (el) => el.className.split(/\s+/).filter((c) => c.startsWith("rounded-"));

describe("shape", () => {
  it("is a pill by default, so existing badges are unchanged", () => {
    render(<Badge>Active</Badge>);
    expect(radii(screen.getByText("Active"))).toEqual(["rounded-pill"]);
  });

  it("takes the control radius when asked", () => {
    render(<Badge shape="control">PI - ₹0.00</Badge>);
    expect(radii(screen.getByText("PI - ₹0.00"))).toEqual(["rounded-control"]);
  });

  it("falls back to the pill for an unknown shape rather than rendering none", () => {
    render(<Badge shape="nonsense">Active</Badge>);
    expect(radii(screen.getByText("Active"))).toEqual(["rounded-pill"]);
  });

  it("carries exactly one radius in every shape", () => {
    // `cn` does no tailwind-merge, so two radius utilities on one element
    // would both apply and let stylesheet order decide which wins. Choosing
    // between whole values is what keeps that from happening — this is the
    // invariant that makes the prop trustworthy.
    for (const shape of ["pill", "control"]) {
      const { unmount } = render(<Badge shape={shape}>Chip</Badge>);
      expect(radii(screen.getByText("Chip"))).toHaveLength(1);
      unmount();
    }
  });
});

describe("tone", () => {
  it("defaults to neutral", () => {
    render(<Badge>Neutral</Badge>);
    expect(screen.getByText("Neutral").className).toContain("bg-tag");
  });

  it("applies the requested tone", () => {
    render(<Badge tone="warn">Expiring</Badge>);
    expect(screen.getByText("Expiring").className).toContain("bg-status-warn-bg");
  });

  it("is independent of shape", () => {
    render(
      <Badge tone="accent" shape="control">
        Figure
      </Badge>
    );
    const el = screen.getByText("Figure");
    expect(el.className).toContain("bg-accent-muted");
    expect(radii(el)).toEqual(["rounded-control"]);
  });
});
