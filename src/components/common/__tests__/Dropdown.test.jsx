import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Dropdown } from "../Dropdown";

const options = [
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "deactivated", label: "Deactivated" },
];

/**
 * The trigger, identified by its popup role rather than by being "the button" —
 * once the menu is open every option is a button too.
 */
function trigger() {
  return document.querySelector('[aria-haspopup="listbox"]');
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

describe("closed state", () => {
  it("shows the placeholder when nothing is chosen", () => {
    render(<Dropdown options={options} placeholder="Select a status" />);
    expect(screen.getByText("Select a status")).toBeDefined();
  });

  it("shows the label of the selected value, not the value itself", () => {
    render(<Dropdown options={options} value="expired" />);
    expect(screen.getByText("Expired")).toBeDefined();
    expect(screen.queryByText("expired")).toBeNull();
  });

  it("announces itself as a collapsed listbox", () => {
    render(<Dropdown options={options} />);
    const button = trigger();
    expect(button.getAttribute("aria-haspopup")).toBe("listbox");
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });

  it("renders no menu until it is opened", () => {
    render(<Dropdown options={options} />);
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});

describe("the menu escapes its container", () => {
  // The reason this component portals at all. A dropdown inside a scrolling
  // panel or a table cell used to be clipped by that ancestor's `overflow`,
  // so the options were cut off or invisible entirely — the menu has to leave
  // the subtree to be seen.
  it("renders the menu into document.body, not beside the trigger", () => {
    const { container } = render(
      <div style={{ overflow: "hidden" }}>
        <Dropdown options={options} />
      </div>
    );

    const listbox = openMenu();
    expect(container.contains(listbox)).toBe(false);
    expect(document.body.contains(listbox)).toBe(true);
  });

  it("marks the portalled menu, so outside-click handlers can recognise it", () => {
    // Without the marker, an ancestor's "click outside closes me" logic sees a
    // click on this menu as a click elsewhere and closes the thing containing
    // the dropdown.
    render(<Dropdown options={options} />);
    openMenu();
    expect(document.querySelector('[data-portal-popover="true"]')).not.toBeNull();
  });

  it("positions the menu rather than leaving it at the top of the page", () => {
    render(<Dropdown options={options} />);
    const popover = (openMenu(), document.querySelector('[data-portal-popover="true"]'));
    expect(popover.style.position).toBe("fixed");
    expect(popover.style.left).not.toBe("");
  });
});

describe("choosing an option", () => {
  it("reports the value and closes", () => {
    const onChange = vi.fn();
    render(<Dropdown options={options} onChange={onChange} />);

    const listbox = openMenu();
    fireEvent.click(within(listbox).getByText("Expired"));

    expect(onChange).toHaveBeenCalledWith("expired");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("marks the chosen option for anyone reading the list", () => {
    render(<Dropdown options={options} value="expired" />);
    const listbox = openMenu();
    const chosen = within(listbox).getByText("Expired").closest("button");
    expect(chosen.className).toContain("text-accent");
  });

  it("toggles shut when the trigger is clicked again", () => {
    render(<Dropdown options={options} />);
    openMenu();
    fireEvent.click(trigger());
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("closes when the page is clicked elsewhere", () => {
    render(<Dropdown options={options} />);
    openMenu();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("does not close when the menu itself is clicked", () => {
    render(<Dropdown options={options} />);
    const listbox = openMenu();
    fireEvent.mouseDown(listbox);
    expect(screen.queryByRole("listbox")).not.toBeNull();
  });
});

describe("searching", () => {
  it("narrows the list as you type", () => {
    render(<Dropdown options={options} searchable />);
    const listbox = openMenu();

    fireEvent.change(screen.getByPlaceholderText("Search..."), { target: { value: "exp" } });

    expect(within(listbox).getByText("Expired")).toBeDefined();
    expect(within(listbox).queryByText("Active")).toBeNull();
  });

  it("ignores case, since nobody types the casing of the data", () => {
    render(<Dropdown options={options} searchable />);
    const listbox = openMenu();

    fireEvent.change(screen.getByPlaceholderText("Search..."), { target: { value: "DEACT" } });
    expect(within(listbox).getByText("Deactivated")).toBeDefined();
  });

  it("offers no search box when searching is turned off", () => {
    render(<Dropdown options={options} searchable={false} />);
    openMenu();
    expect(screen.queryByPlaceholderText("Search...")).toBeNull();
  });
});

describe("disabled and empty", () => {
  it("does not open when disabled", () => {
    render(<Dropdown options={options} disabled />);
    fireEvent.click(trigger());
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("opens without options rather than crashing", () => {
    render(<Dropdown options={[]} />);
    fireEvent.click(trigger());
    expect(screen.getByRole("listbox")).toBeDefined();
  });
});

describe("labelling", () => {
  it("renders a label and its required marker", () => {
    render(<Dropdown options={options} label="Status" required requiredText="*" />);
    expect(screen.getByText("Status")).toBeDefined();
    expect(screen.getByText("*")).toBeDefined();
  });

  it("shows a validation message", () => {
    render(<Dropdown options={options} label="Status" error="Pick one" />);
    expect(screen.getByText("Pick one")).toBeDefined();
  });
});
