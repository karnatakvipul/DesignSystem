import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MobileTableToolbar } from "../MobileTableToolbar";

/**
 * This exists because the same toolbar had been rewritten per screen, and the
 * copies disagreed about which controls a screen even gets. These pin the
 * rules that made them diverge: what renders, and what a selection replaces.
 */

const sortOptions = [
  { value: "account", label: "Account" },
  { value: "name", label: "Name" },
];

describe("which controls render", () => {
  it("renders the search field only when a change handler is given", () => {
    const { rerender } = render(<MobileTableToolbar />);
    expect(screen.queryByLabelText("Search Data")).toBeNull();

    rerender(<MobileTableToolbar onSearchChange={() => {}} />);
    expect(screen.getByLabelText("Search Data")).toBeDefined();
  });

  it("hides the search field when asked, even with a handler", () => {
    render(<MobileTableToolbar onSearchChange={() => {}} hideSearch />);
    expect(screen.queryByLabelText("Search Data")).toBeNull();
  });

  it("renders the filter button only when there is sheet content for it", () => {
    const { rerender } = render(<MobileTableToolbar />);
    expect(screen.queryByRole("button", { name: /Filters/ })).toBeNull();

    rerender(<MobileTableToolbar filterOptions={<div>fields</div>} />);
    expect(screen.getByRole("button", { name: "Filters" })).toBeDefined();
  });

  it("renders sort only when both the options and the handler are given", () => {
    const { rerender } = render(<MobileTableToolbar sortOptions={sortOptions} />);
    expect(screen.queryByRole("button", { name: "Sort" })).toBeNull();

    rerender(<MobileTableToolbar sortOptions={sortOptions} onSortSelect={() => {}} />);
    expect(screen.getByRole("button", { name: "Sort" })).toBeDefined();
  });

  it("renders the view toggle only when a change handler is given", () => {
    const { rerender } = render(<MobileTableToolbar viewMode="card" />);
    expect(screen.queryByRole("button", { name: /Switch to/ })).toBeNull();

    rerender(<MobileTableToolbar viewMode="card" onViewModeChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Switch to Table View" })).toBeDefined();
  });

  it("renders the pagination it is handed", () => {
    render(<MobileTableToolbar pagination={<span>1-12 of 12</span>} />);
    expect(screen.getByText("1-12 of 12")).toBeDefined();
  });
});

describe("the filter button's active count", () => {
  it("stays bare at zero", () => {
    render(<MobileTableToolbar filterOptions={<div />} activeFilterCount={0} />);
    expect(screen.getByRole("button", { name: "Filters" })).toBeDefined();
  });

  it("announces how many are active", () => {
    render(<MobileTableToolbar filterOptions={<div />} activeFilterCount={3} />);
    // The badge is decorative; the count has to reach a screen reader too.
    expect(screen.getByRole("button", { name: "Filters (3 active)" })).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();
  });
});

describe("active states do not collide with idle ones", () => {
  /**
   * `cn` is plain `clsx` — no tailwind-merge — so appending a conflicting
   * utility does not replace the base one: both end up in `class` and the
   * stylesheet's own order decides which wins. The view toggle used to append
   * `bg-accent text-white` over a base `bg-input text-ink-muted`, and took the
   * white text while keeping the input background — a white icon on a
   * near-white surface (measured 1.05:1 on `arctic-white`), i.e. invisible.
   *
   * jsdom applies no stylesheet, so this asserts the invariant that made it
   * possible rather than the colour: a button must never carry two utilities
   * from the same group at once.
   */
  const conflicts = (className, prefix) =>
    className.split(/\s+/).filter((c) => c.startsWith(prefix) && !c.includes(":"));

  it("gives the view toggle exactly one background and one text colour in each state", () => {
    const { rerender } = render(<MobileTableToolbar viewMode="card" onViewModeChange={() => {}} />);
    let btn = screen.getByRole("button", { name: /Switch to/ });
    expect(conflicts(btn.className, "bg-")).toHaveLength(1);
    expect(conflicts(btn.className, "text-")).toHaveLength(1);

    rerender(<MobileTableToolbar viewMode="table" onViewModeChange={() => {}} />);
    btn = screen.getByRole("button", { name: /Switch to/ });
    expect(conflicts(btn.className, "bg-")).toHaveLength(1);
    expect(conflicts(btn.className, "text-")).toHaveLength(1);
    // The active state has to actually reach the background, not just the text.
    expect(btn.className).toContain("bg-accent");
    expect(btn.className).not.toContain("bg-input");
  });

  it("gives the filter button exactly one background and one border colour in each state", () => {
    const { rerender } = render(<MobileTableToolbar filterOptions={<div />} activeFilterCount={0} />);
    let btn = screen.getByRole("button", { name: /Filters/ });
    expect(conflicts(btn.className, "bg-")).toHaveLength(1);
    expect(conflicts(btn.className, "border-")).toHaveLength(1);

    rerender(<MobileTableToolbar filterOptions={<div />} activeFilterCount={2} />);
    btn = screen.getByRole("button", { name: /Filters/ });
    expect(conflicts(btn.className, "bg-")).toHaveLength(1);
    expect(conflicts(btn.className, "border-")).toHaveLength(1);
    expect(btn.className).toContain("border-accent");
  });
});

describe("selection replaces the controls", () => {
  const props = {
    onSearchChange: () => {},
    filterOptions: <div />,
    sortOptions,
    onSortSelect: () => {},
    viewMode: "card",
    onViewModeChange: () => {},
  };

  it("shows the controls while nothing is selected", () => {
    render(<MobileTableToolbar {...props} selectedCount={0} />);
    expect(screen.getByLabelText("Search Data")).toBeDefined();
    expect(screen.queryByText(/selected/)).toBeNull();
  });

  it("swaps them for the selection bar once a row is picked", () => {
    render(<MobileTableToolbar {...props} selectedCount={2} />);

    expect(screen.getByText("2 selected")).toBeDefined();
    // The whole point of the contextual bar: a phone has no room for both.
    expect(screen.queryByLabelText("Search Data")).toBeNull();
    expect(screen.queryByRole("button", { name: "Filters" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Sort" })).toBeNull();
  });

  it("keeps pagination visible in selection mode", () => {
    render(<MobileTableToolbar {...props} selectedCount={2} pagination={<span>1-12 of 12</span>} />);
    expect(screen.getByText("1-12 of 12")).toBeDefined();
  });

  it("holds back single-row actions while several are selected", () => {
    const actions = [
      { key: "edit", label: "Edit", requiresSingle: true, onClick: () => {} },
      { key: "delete", label: "Delete", danger: true, onClick: () => {} },
    ];
    const { rerender } = render(
      <MobileTableToolbar {...props} selectedCount={2} selectionActions={actions} />
    );
    expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();
    expect(screen.getByRole("button", { name: "Delete" })).toBeDefined();

    rerender(<MobileTableToolbar {...props} selectedCount={1} selectionActions={actions} />);
    expect(screen.getByRole("button", { name: "Edit" })).toBeDefined();
  });

  it("reports a cleared selection", () => {
    const onClearSelection = vi.fn();
    render(<MobileTableToolbar {...props} selectedCount={2} onClearSelection={onClearSelection} />);

    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));

    expect(onClearSelection).toHaveBeenCalledTimes(1);
  });
});

describe("the controls report what the user did", () => {
  it("reports typed search text, and clears it", () => {
    const onSearchChange = vi.fn();
    const { rerender } = render(<MobileTableToolbar onSearchChange={onSearchChange} searchValue="" />);

    fireEvent.change(screen.getByLabelText("Search Data"), { target: { value: "acme" } });
    expect(onSearchChange).toHaveBeenCalledWith("acme");

    // The clear affordance only exists once there is something to clear.
    rerender(<MobileTableToolbar onSearchChange={onSearchChange} searchValue="acme" />);
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(onSearchChange).toHaveBeenCalledWith("");
  });

  it("reports the next view as a plain value, not a state updater", () => {
    const onViewModeChange = vi.fn();
    render(<MobileTableToolbar viewMode="card" onViewModeChange={onViewModeChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Switch to Table View" }));

    expect(onViewModeChange).toHaveBeenCalledWith("table");
  });

  it("opens the sort sheet and reports the picked option", () => {
    const onSortSelect = vi.fn();
    render(
      <MobileTableToolbar sortOptions={sortOptions} currentSort="account" onSortSelect={onSortSelect} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Sort" }));
    fireEvent.click(screen.getByText("Name"));

    expect(onSortSelect).toHaveBeenCalledWith("name");
  });

  it("opens the filter sheet with the fields it was given", () => {
    render(<MobileTableToolbar filterOptions={<div>Account field</div>} />);

    expect(screen.queryByText("Account field")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Filters" }));
    expect(screen.getByText("Account field")).toBeDefined();
  });
});
