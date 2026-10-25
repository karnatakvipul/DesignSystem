import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MultiSelectDropdown } from "../MultiSelectDropdown";

const options = [
  { value: "EnviroFRONT", label: "EnviroFRONT" },
  { value: "OCEMS", label: "OCEMS" },
  { value: "SolarFRONT", label: "SolarFRONT" },
];

function trigger() {
  // The menu's own controls are buttons too once it is open, so take the first.
  return document.querySelectorAll("button")[0];
}

function openMenu() {
  fireEvent.click(trigger());
  return screen.getByRole("listbox");
}

beforeEach(() => {
  // jsdom gives every element a zero-sized rect, which the flip-above logic
  // reads. Enough of a rect for the position maths to be meaningful.
  Element.prototype.getBoundingClientRect = function () {
    return { top: 100, bottom: 130, left: 40, right: 240, width: 200, height: 30, x: 40, y: 100 };
  };
  window.innerHeight = 800;
});

describe("the menu escapes its container", () => {
  /**
   * This is the bug these exist for. `Dropdown` has always portalled its menu;
   * this one rendered inline with `absolute`, so among a row of filter fields
   * it was the only one that stayed boxed inside the panel while every sibling
   * floated above it — and any ancestor with `overflow: auto`/`hidden` clipped
   * it outright. The two now behave identically, which is the point.
   */
  it("renders the menu into document.body, not beside the trigger", () => {
    const { container } = render(
      <div style={{ overflow: "hidden" }}>
        <MultiSelectDropdown options={options} />
      </div>
    );

    const listbox = openMenu();
    expect(container.contains(listbox)).toBe(false);
    expect(document.body.contains(listbox)).toBe(true);
  });

  it("marks the portalled menu, so outside-click handlers can recognise it", () => {
    // Without the marker, the filter panel's own "click outside closes me"
    // logic reads ticking an option as a click elsewhere and dismisses the lot.
    render(<MultiSelectDropdown options={options} />);
    openMenu();
    expect(document.querySelector('[data-portal-popover="true"]')).not.toBeNull();
  });

  it("positions the menu rather than leaving it at the top of the page", () => {
    render(<MultiSelectDropdown options={options} />);
    openMenu();
    const popover = document.querySelector('[data-portal-popover="true"]');
    expect(popover.style.position).toBe("fixed");
    expect(popover.style.left).not.toBe("");
  });

  it("sizes the menu to its trigger, the way the single-select one does", () => {
    render(<MultiSelectDropdown options={options} />);
    openMenu();
    const popover = document.querySelector('[data-portal-popover="true"]');
    expect(popover.style.width).toBe("200px");
  });

  it("stacks above panels and modals", () => {
    render(<MultiSelectDropdown options={options} />);
    openMenu();
    expect(document.querySelector('[data-portal-popover="true"]').className).toContain("z-[200]");
  });
});

describe("choosing options", () => {
  it("reports each pick without closing, so several can be made at once", () => {
    const onChange = vi.fn();
    render(<MultiSelectDropdown options={options} value={[]} onChange={onChange} />);
    openMenu();

    fireEvent.click(screen.getByLabelText("EnviroFRONT"));

    expect(onChange).toHaveBeenCalledWith(["EnviroFRONT"]);
    // Still open — a multi-select that shut on the first tick would make the
    // second choice a fresh round trip.
    expect(screen.getByRole("listbox")).toBeDefined();
  });

  it("removes an already-chosen value when picked again", () => {
    const onChange = vi.fn();
    render(<MultiSelectDropdown options={options} value={["EnviroFRONT", "OCEMS"]} onChange={onChange} />);
    openMenu();

    fireEvent.click(screen.getByLabelText("EnviroFRONT"));

    expect(onChange).toHaveBeenCalledWith(["OCEMS"]);
  });

  it("closes on a click that is outside both the trigger and the portalled menu", () => {
    render(<MultiSelectDropdown options={options} />);
    openMenu();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("stays open for a click inside the portalled menu", () => {
    // The menu is not in the trigger's subtree any more, so an outside-click
    // check that only looked at the trigger would close on every option click.
    render(<MultiSelectDropdown options={options} />);
    openMenu();

    fireEvent.mouseDown(document.querySelector('[data-portal-popover="true"]'));

    expect(screen.queryByRole("listbox")).not.toBeNull();
  });
});

describe("tolerating a bad value", () => {
  it("treats null as an empty selection rather than crashing", () => {
    render(<MultiSelectDropdown options={options} value={null} placeholder="Select..." />);
    expect(screen.getByText("Select...")).toBeDefined();
  });
});
