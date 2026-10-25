import React from "react";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MobileTableWrapper, MobileViewControls } from "../MobileTableWrapper";
import { COLUMN_SIZES } from "../../../lib/columnWidth";

const data = [
  { id: 1, account: "Acme Corp", name: "A very long site name that would wrap", key: "abc-123", status: "Active" },
  { id: 2, account: "Beta LLC", name: "Another site", key: "def-456", status: "Expired" },
];

/**
 * The wrapper picks its layout from a media query. jsdom has no real one, so
 * tests declare which side of the breakpoint they are on.
 */
function setViewport(isMobile) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: query.includes("max-width: 767px") ? isMobile : !isMobile,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

const originalMatchMedia = window.matchMedia;
beforeEach(() => setViewport(false));
afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

function headers() {
  return screen.getAllByRole("columnheader").filter((th) => th.textContent.trim() !== "");
}

describe("choosing a layout", () => {
  it("renders a table on desktop", () => {
    setViewport(false);
    render(<MobileTableWrapper columns={[{ key: "account", header: "ACCOUNT" }]} data={data} rowKey={(r) => r.id} />);
    expect(screen.getByRole("table")).toBeDefined();
  });

  it("renders cards instead of a table on mobile", () => {
    setViewport(true);
    render(<MobileTableWrapper columns={[{ key: "account", header: "ACCOUNT" }]} data={data} rowKey={(r) => r.id} />);
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.getByText("Acme Corp")).toBeDefined();
  });
});

describe("column widths", () => {
  // This normaliser used to apply a width guessed from the column's *name*
  // unconditionally. Because `width` beats `minWidth` in a fixed table layout,
  // the guess won every argument: a column asking for 240px got 180 because its
  // key happened to be "key", and one asking for 160 got 150 because its name
  // matched nothing at all. The widths on screen were never the ones the pages
  // had asked for, which is what made every header row look arbitrary.
  it("respects a declared size", () => {
    render(
      <MobileTableWrapper columns={[{ key: "key", header: "KEY", size: "xl" }]} data={data} rowKey={(r) => r.id} />
    );
    expect(headers()[0].style.width).toBe(`${COLUMN_SIZES.xl}px`);
  });

  it("respects a declared minWidth rather than overriding it by name", () => {
    render(
      <MobileTableWrapper columns={[{ key: "key", header: "KEY", minWidth: 240 }]} data={data} rowKey={(r) => r.id} />
    );
    // 240 snaps up to 256 — the point is that it is not the 192 the name-based
    // guess would have handed a column called "key".
    expect(headers()[0].style.width).toBe("256px");
  });

  it("respects a declared width", () => {
    render(
      <MobileTableWrapper columns={[{ key: "name", header: "NAME", width: 128 }]} data={data} rowKey={(r) => r.id} />
    );
    expect(headers()[0].style.width).toBe("128px");
  });

  it("still guesses for a column that expresses no preference", () => {
    render(<MobileTableWrapper columns={[{ key: "name", header: "NAME" }]} data={data} rowKey={(r) => r.id} />);
    // "name" is long text, so it gets the widest step.
    expect(headers()[0].style.width).toBe(`${COLUMN_SIZES.xl}px`);
  });

  it("guesses only from the shared scale, so a guess still lines up with a declaration", () => {
    render(
      <MobileTableWrapper
        columns={[{ key: "name", header: "NAME" }, { key: "status", header: "STATUS" }, { key: "id", header: "ID" }]}
        data={data}
        rowKey={(r) => r.id}
      />
    );
    for (const th of headers()) {
      expect(Number.parseInt(th.style.width, 10) % 32).toBe(0);
    }
  });
});

describe("column definitions", () => {
  it("accepts bare string columns and titles them", () => {
    render(<MobileTableWrapper columns={["account", "status"]} data={data} rowKey={(r) => r.id} />);
    expect(screen.getByText("ACCOUNT")).toBeDefined();
    expect(screen.getByText("STATUS")).toBeDefined();
  });

  it("infers columns from the data when asked", () => {
    render(<MobileTableWrapper autoColumns data={data} rowKey={(r) => r.id} />);
    expect(screen.getByText("ACCOUNT")).toBeDefined();
    expect(screen.getByText("KEY")).toBeDefined();
  });

  it("leaves the id out of inferred columns", () => {
    render(<MobileTableWrapper autoColumns data={data} rowKey={(r) => r.id} />);
    expect(screen.queryByRole("columnheader", { name: "ID" })).toBeNull();
  });

  it("splits a camelCase key into a readable header", () => {
    render(<MobileTableWrapper columns={["lastInvoice"]} data={[{ id: 1, lastInvoice: "INV-1" }]} rowKey={(r) => r.id} />);
    expect(screen.getByText("LAST INVOICE")).toBeDefined();
  });

  it("keeps a header the caller supplied", () => {
    render(
      <MobileTableWrapper columns={[{ key: "account", header: "Customer" }]} data={data} rowKey={(r) => r.id} />
    );
    expect(screen.getByText("Customer")).toBeDefined();
    expect(screen.queryByText("ACCOUNT")).toBeNull();
  });
});

describe("passing things through to the table", () => {
  it("forwards the row tone", () => {
    render(
      <MobileTableWrapper
        columns={[{ key: "account", header: "ACCOUNT" }]}
        data={data}
        rowKey={(r) => r.id}
        getRowTone={(row) => (row.status === "Expired" ? "warn" : null)}
      />
    );
    const rows = within(document.querySelector("tbody")).getAllByRole("row");
    expect(rows[1].className).toContain("bg-status-warn");
  });

  it("forwards header alignment", () => {
    render(
      <MobileTableWrapper
        columns={[{ key: "account", header: "ACCOUNT" }]}
        data={data}
        rowKey={(r) => r.id}
        headerAlign="left"
      />
    );
    expect(headers()[0].className).not.toContain("text-center");
  });

  it("forwards serverSide, so the page it was given is not re-sorted locally", () => {
    const onSortChange = vi.fn();
    render(
      <MobileTableWrapper
        columns={[{ key: "account", header: "ACCOUNT", sortable: true }]}
        data={data}
        rowKey={(r) => r.id}
        serverSide
        sortKey="account"
        sortDirection="desc"
        onSortChange={onSortChange}
      />
    );
    const rows = within(document.querySelector("tbody")).getAllByRole("row");
    expect(rows[0].textContent).toContain("Acme Corp");
  });

  it("forwards loading and error states", () => {
    const { rerender } = render(
      <MobileTableWrapper columns={[{ key: "account", header: "ACCOUNT" }]} data={[]} loading />
    );
    expect(screen.getByRole("table")).toBeDefined();

    rerender(
      <MobileTableWrapper columns={[{ key: "account", header: "ACCOUNT" }]} data={[]} error="Server unreachable" />
    );
    expect(screen.getByText("Server unreachable")).toBeDefined();
  });
});

describe("passing things through to the cards", () => {
  const cardProps = {
    columns: [{ key: "account", header: "ACCOUNT" }],
    data,
    rowKey: (r) => r.id,
    primaryFields: ["account"],
    selectable: true,
    selectedKeys: [],
    onSelectedKeysChange: () => {},
  };

  it("forwards the selection mode", () => {
    setViewport(true);
    render(<MobileTableWrapper {...cardProps} selectionMode="single" />);

    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("selects many by default, so existing callers are unaffected", () => {
    setViewport(true);
    render(<MobileTableWrapper {...cardProps} />);

    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  });

  it("leaves the desktop table alone whatever the mode says", () => {
    // The mode is a card-list idea. A desktop table has always selected many
    // and passing this must not quietly change that.
    setViewport(false);
    render(<MobileTableWrapper {...cardProps} selectionMode="single" />);

    expect(screen.getByRole("table")).toBeDefined();
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
  });

  it("gives its toolbar controls a touch-sized target", () => {
    setViewport(true);
    render(<MobileTableWrapper {...cardProps} sortOptions={[{ value: "account", label: "Account" }]} onSortSelect={() => {}} />);

    expect(screen.getByRole("button", { name: "Sort" }).className).toContain("h-control-lg");
  });
});

describe("moving sort/view-toggle out of the toolbar", () => {
  const cardProps = {
    columns: [{ key: "account", header: "ACCOUNT" }],
    data,
    rowKey: (r) => r.id,
    sortOptions: [{ value: "account", label: "Account" }],
    onSortSelect: () => {},
  };

  it("hides its own Sort and view-toggle buttons when a page renders MobileViewControls elsewhere", () => {
    setViewport(true);
    render(<MobileTableWrapper {...cardProps} hideMobileControls />);

    expect(screen.queryByRole("button", { name: "Sort" })).toBeNull();
    expect(screen.queryByRole("button", { name: /Switch to (Table|Card) View/ })).toBeNull();
  });

  it("still shows them by default, so an existing caller is unaffected", () => {
    setViewport(true);
    render(<MobileTableWrapper {...cardProps} />);

    expect(screen.getByRole("button", { name: "Sort" })).toBeDefined();
    expect(screen.getByRole("button", { name: /Switch to (Table|Card) View/ })).toBeDefined();
  });

  it("lets an externally-rendered toggle drive which content it shows", () => {
    setViewport(true);
    render(<MobileTableWrapper {...cardProps} hideMobileControls viewMode="table" />);

    expect(screen.getByRole("table")).toBeDefined();
  });

  it("MobileViewControls reports the next view as a plain value, not a state updater", () => {
    const onViewModeChange = vi.fn();
    render(<MobileViewControls viewMode="card" onViewModeChange={onViewModeChange} />);

    fireEvent.click(screen.getByRole("button", { name: /Switch to Table View/ }));

    expect(onViewModeChange).toHaveBeenCalledWith("table");
  });

  it("MobileViewControls only renders Sort when both sortOptions and onSortSelect are given", () => {
    render(<MobileViewControls viewMode="card" onViewModeChange={() => {}} />);
    expect(screen.queryByRole("button", { name: "Sort" })).toBeNull();
  });

  it("MobileViewControls opens a sort sheet and reports the picked option", () => {
    const onSortSelect = vi.fn();
    render(
      <MobileViewControls
        viewMode="card"
        onViewModeChange={() => {}}
        sortOptions={[{ value: "account", label: "Account" }]}
        onSortSelect={onSortSelect}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Sort" }));
    fireEvent.click(screen.getByText("Account"));

    expect(onSortSelect).toHaveBeenCalledWith("account");
  });
});

describe("empty", () => {
  it("renders without data rather than crashing", () => {
    render(<MobileTableWrapper columns={[{ key: "account", header: "ACCOUNT" }]} data={[]} />);
    expect(screen.getByText("No Records Found")).toBeDefined();
  });

  it("renders nothing to infer from without crashing", () => {
    render(<MobileTableWrapper autoColumns data={[]} />);
    expect(screen.getByRole("table")).toBeDefined();
  });
});
