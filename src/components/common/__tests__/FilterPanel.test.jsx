import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FilterPanel } from "../FilterPanel";

const panel = () => screen.queryByRole("dialog");

/**
 * The panel attaches its dismiss listeners inside a `requestAnimationFrame`,
 * so that the very click which opened it does not immediately close it again.
 * Tests have to let that frame run first — without this they fire into a
 * document with no listeners yet and pass for the wrong reason.
 */
async function afterListenersAttach() {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
}

describe("open and closed", () => {
  it("renders nothing while closed", () => {
    render(
      <FilterPanel open={false} onClose={vi.fn()}>
        <input aria-label="Account" />
      </FilterPanel>
    );
    expect(panel()).toBeNull();
    expect(screen.queryByLabelText("Account")).toBeNull();
  });

  it("renders its fields when open", () => {
    render(
      <FilterPanel open onClose={vi.fn()}>
        <input aria-label="Account" />
      </FilterPanel>
    );
    expect(panel()).toBeDefined();
    expect(screen.getByLabelText("Account")).toBeDefined();
  });

  it("names itself for assistive tech", () => {
    render(
      <FilterPanel open title="License filters" onClose={vi.fn()}>
        <div />
      </FilterPanel>
    );
    expect(panel().getAttribute("aria-label")).toBe("License filters");
  });
});

describe("dismissing", () => {
  it("closes on Escape", async () => {
    const onClose = vi.fn();
    render(
      <FilterPanel open onClose={onClose}>
        <div />
      </FilterPanel>
    );
    await afterListenersAttach();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("closes when the page is clicked outside it", async () => {
    const onClose = vi.fn();
    render(
      <FilterPanel open onClose={onClose}>
        <div />
      </FilterPanel>
    );
    await afterListenersAttach();

    fireEvent.click(document.body);
    expect(onClose).toHaveBeenCalled();
  });

  it("does not close on the click that opened it", () => {
    // The listeners go on a frame later for exactly this reason: attached
    // synchronously, the still-propagating opening click would land on the
    // document and shut the panel before anyone saw it.
    const onClose = vi.fn();
    render(
      <FilterPanel open onClose={onClose}>
        <div />
      </FilterPanel>
    );

    fireEvent.click(document.body);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("stays open when something inside it is clicked", async () => {
    const onClose = vi.fn();
    render(
      <FilterPanel open onClose={onClose}>
        <input aria-label="Account" />
      </FilterPanel>
    );
    await afterListenersAttach();

    fireEvent.click(screen.getByLabelText("Account"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("stays open when a portalled menu inside it is used", async () => {
    // A dropdown in this panel renders its options into document.body to escape
    // the panel's own overflow. Those clicks land outside the panel's subtree,
    // so without the marker check, choosing a filter value closed the panel you
    // were choosing it in.
    const onClose = vi.fn();
    render(
      <>
        <FilterPanel open onClose={onClose}>
          <div />
        </FilterPanel>
        <div data-portal-popover="true">
          <button type="button">Active</button>
        </div>
      </>
    );
    await afterListenersAttach();

    fireEvent.click(screen.getByRole("button", { name: "Active" }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("stays open when the button that opens it is clicked again", async () => {
    // That button does its own toggling; closing here as well would make the
    // panel reopen and shut on a single press.
    const onClose = vi.fn();
    render(
      <>
        <FilterPanel open onClose={onClose}>
          <div />
        </FilterPanel>
        <button type="button" aria-label="Filters" />
      </>
    );
    await afterListenersAttach();

    fireEvent.click(screen.getByLabelText("Filters"));
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("actions", () => {
  it("applies the filters and closes, so the results are visible", () => {
    const onSearch = vi.fn();
    const onClose = vi.fn();
    render(
      <FilterPanel open onSearch={onSearch} onClose={onClose}>
        <div />
      </FilterPanel>
    );

    fireEvent.click(screen.getByRole("button", { name: /search/i }));
    expect(onSearch).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("clears without closing, so the cleared state can be seen", () => {
    const onClear = vi.fn();
    const onClose = vi.fn();
    render(
      <FilterPanel open onClear={onClear} onClose={onClose}>
        <div />
      </FilterPanel>
    );

    fireEvent.click(screen.getByRole("button", { name: /^clear$/i }));
    expect(onClear).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("also clears from the Reset control in the header", () => {
    const onClear = vi.fn();
    render(
      <FilterPanel open showHeader onClear={onClear} onClose={vi.fn()}>
        <div />
      </FilterPanel>
    );

    fireEvent.click(screen.getByRole("button", { name: /reset/i }));
    expect(onClear).toHaveBeenCalled();
  });

  it("offers no action it cannot perform", () => {
    render(
      <FilterPanel open>
        <div />
      </FilterPanel>
    );
    expect(screen.queryByRole("button", { name: /search/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /reset/i })).toBeNull();
  });

  it("uses the labels it is given", () => {
    render(
      <FilterPanel open onSearch={vi.fn()} onClear={vi.fn()} searchLabel="Apply" clearLabel="Reset all">
        <div />
      </FilterPanel>
    );
    expect(screen.getByRole("button", { name: "Apply" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Reset all" })).toBeDefined();
  });
});

describe("the active count", () => {
  it("says how many filters are set", () => {
    render(
      <FilterPanel open showHeader activeCount={3} onClose={vi.fn()}>
        <div />
      </FilterPanel>
    );
    expect(screen.getByText("3 active")).toBeDefined();
  });

  it("says nothing when none are", () => {
    render(
      <FilterPanel open activeCount={0} onClose={vi.fn()}>
        <div />
      </FilterPanel>
    );
    expect(screen.queryByText(/active/)).toBeNull();
  });
});

describe("layout", () => {
  it("stacks fields in one column when asked, so labels line up", () => {
    const { container } = render(
      <FilterPanel open layout="rows" onClose={vi.fn()}>
        <div />
      </FilterPanel>
    );
    expect(container.querySelector(".flex-col.gap-3")).not.toBeNull();
  });

  it("uses two columns by default", () => {
    const { container } = render(
      <FilterPanel open onClose={vi.fn()}>
        <div />
      </FilterPanel>
    );
    expect(container.querySelector(".grid")).not.toBeNull();
  });
});
