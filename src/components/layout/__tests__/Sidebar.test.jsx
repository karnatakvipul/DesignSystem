import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { Sidebar } from "../Sidebar";

/** A stand-in brand mark — real enough to prove it isn't remounted. */
const logo = <img alt="Brand" src="/logo.png" />;

/**
 * The pin control only exists on desktop, and `Sidebar` decides that from the
 * viewport plus a `(hover: none)` query. jsdom answers "no match" for media
 * queries by default, which reads as a touch device — so it has to be told it
 * is on a desktop before the footer renders at all.
 */
beforeEach(() => {
  window.innerWidth = 1280;
  window.matchMedia = (query) => ({
    matches: false, // `(hover: none)` false = a pointer device
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {},
  });
});

/** The footer control, by the only name it goes by in either state. */
function pinControl() {
  return screen.queryByRole("button", { name: /pin sidebar/i });
}

/** lucide renders its icon name as a class, which is how the glyph is identified. */
function iconNames(el) {
  return [...el.querySelectorAll("svg")].map(
    (svg) => (svg.getAttribute("class") ?? "").match(/lucide-[a-z-]+/)?.[0] ?? "unknown"
  );
}

describe("the pin glyph", () => {
  // The glyph only ever rendered while the rail is expanded — collapsed, the
  // footer is just a "expand me" chevron. `collapsed={false}` is that state.
  it("is shown by default, so existing consumers are unaffected", () => {
    render(<Sidebar collapsed={false} onCollapsedChange={() => {}} />);
    const control = pinControl();
    expect(control).not.toBeNull();
    expect(iconNames(control).some((n) => n.includes("pin"))).toBe(true);
  });

  it("is dropped when a consumer asks, leaving the collapse chevron", () => {
    render(<Sidebar showPin={false} collapsed={false} onCollapsedChange={() => {}} />);
    const control = pinControl();

    const icons = iconNames(control);
    expect(icons.some((n) => n.includes("pin"))).toBe(false);
    // The control is still there and still collapses the rail — only the
    // glyph advertising "pinning" as a concept is gone.
    expect(icons.some((n) => n.includes("chevrons"))).toBe(true);
  });

  it("still lets the rail be collapsed and expanded without the glyph", () => {
    const onCollapsedChange = vi.fn();
    render(<Sidebar showPin={false} collapsed={false} onCollapsedChange={onCollapsedChange} />);
    const control = pinControl();
    expect(control).not.toBeNull();
    expect(iconNames(control).some((n) => n.includes("pin"))).toBe(false);

    fireEvent.click(control);
    expect(onCollapsedChange).toHaveBeenCalledWith(true);
  });

  it("sends the lone chevron to the trailing edge rather than stranding it left", () => {
    // With the pin hidden the chevron is the row's only child, and
    // `justify-between` would leave it under the nav icons as though it were
    // one of them.
    const hidden = render(<Sidebar showPin={false} collapsed={false} onCollapsedChange={() => {}} />);
    expect(pinControl().className).toContain("justify-end");
    hidden.unmount();

    render(<Sidebar collapsed={false} onCollapsedChange={() => {}} />);
    expect(pinControl().className).toContain("justify-between");
  });
});

describe("the mobile drawer", () => {
  /**
   * `Sidebar` used to `return null` while the drawer was closed, unmounting
   * everything inside it — the logo included — and rebuilding it from
   * scratch on every open. A phone with an animated (`transition-transform`)
   * slide instead of a mount-time one needs the node to already exist before
   * the transition can animate it in, so it stays mounted throughout and
   * `inert`/`opacity`/`pointer-events` carry the "closed" guarantee instead.
   */
  beforeEach(() => {
    window.innerWidth = 375;
    window.matchMedia = (query) => ({
      matches: query.includes("hover: none"), // touch device
      media: query,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent() {},
    });
  });

  it("keeps the logo mounted while closed, rather than rendering nothing", () => {
    render(<Sidebar logo={logo} mobileOpen={false} onMobileClose={() => {}} />);
    expect(screen.getByAltText("Brand")).toBeDefined();
  });

  it("marks the closed drawer inert, unreachable by pointer or keyboard", () => {
    const { container } = render(<Sidebar logo={logo} mobileOpen={false} onMobileClose={() => {}} />);
    const wrapper = container.querySelector(".fixed.inset-0");
    expect(wrapper.hasAttribute("inert")).toBe(true);
  });

  it("is the same DOM node before and after opening, not a fresh mount", () => {
    const { container, rerender } = render(
      <Sidebar logo={logo} mobileOpen={false} onMobileClose={() => {}} />
    );
    const before = container.querySelector('img[alt="Brand"]');

    rerender(<Sidebar logo={logo} mobileOpen onMobileClose={() => {}} />);

    const after = container.querySelector('img[alt="Brand"]');
    expect(after).toBe(before);
  });

  it("survives a close/open/close cycle as the same node throughout", () => {
    const { container, rerender } = render(
      <Sidebar logo={logo} mobileOpen={false} onMobileClose={() => {}} />
    );
    const original = container.querySelector('img[alt="Brand"]');

    rerender(<Sidebar logo={logo} mobileOpen onMobileClose={() => {}} />);
    rerender(<Sidebar logo={logo} mobileOpen={false} onMobileClose={() => {}} />);
    rerender(<Sidebar logo={logo} mobileOpen onMobileClose={() => {}} />);

    expect(container.querySelector('img[alt="Brand"]')).toBe(original);
  });

  it("removes inert once open, so the drawer's own controls are reachable", () => {
    const { container } = render(<Sidebar logo={logo} mobileOpen onMobileClose={() => {}} />);
    const wrapper = container.querySelector(".fixed.inset-0");
    expect(wrapper.hasAttribute("inert")).toBe(false);
  });

  it("still closes on a backdrop click", () => {
    const onMobileClose = vi.fn();
    const { container } = render(<Sidebar logo={logo} mobileOpen onMobileClose={onMobileClose} />);
    fireEvent.click(container.querySelector('[aria-hidden="true"]'));
    expect(onMobileClose).toHaveBeenCalledTimes(1);
  });

  it("still closes on the drawer's own close button", () => {
    const onMobileClose = vi.fn();
    render(<Sidebar logo={logo} mobileOpen onMobileClose={onMobileClose} />);
    fireEvent.click(screen.getByLabelText("Close drawer"));
    expect(onMobileClose).toHaveBeenCalledTimes(1);
  });
});
