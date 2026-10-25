import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DataTable } from "../DataTable";
import { COLUMN_SIZES } from "../../../lib/columnWidth";

const sampleColumns = [
  { key: "account", header: "ACCOUNT", sortable: true },
  { key: "name", header: "NAME", sortable: true },
  { key: "type", header: "TYPE" },
];

const sampleData = [
  { id: 1, account: "Acme Corp", name: "SLS Pro", type: "EF-10-NM" },
  { id: 2, account: "Beta LLC", name: "SLS Enterprise", type: "EF-20-NM" },
];

/** The header cells, in order, ignoring the checkbox column. */
function headers() {
  return screen.getAllByRole("columnheader").filter((th) => th.textContent.trim() !== "");
}

function rows() {
  return within(document.querySelector("tbody")).queryAllByRole("row");
}

describe("rendering", () => {
  it("renders headers and rows", () => {
    render(<DataTable columns={sampleColumns} data={sampleData} rowKey={(r) => r.id} />);

    expect(screen.getByText("ACCOUNT")).toBeDefined();
    expect(screen.getByText("NAME")).toBeDefined();
    expect(screen.getByText("Acme Corp")).toBeDefined();
    expect(screen.getByText("Beta LLC")).toBeDefined();
  });

  it("shows the empty state when there is nothing to show", () => {
    render(<DataTable columns={sampleColumns} data={[]} emptyMessage="No records match filters." />);

    expect(screen.getByText("No Records Found")).toBeDefined();
    expect(screen.getByText("No records match filters.")).toBeDefined();
  });

  it("offers a way out of an empty state caused by filters", () => {
    const onClearFilters = vi.fn();
    render(<DataTable columns={sampleColumns} data={[]} onClearFilters={onClearFilters} />);

    fireEvent.click(screen.getByRole("button", { name: /clear all filters/i }));
    expect(onClearFilters).toHaveBeenCalled();
  });

  it("shows a failure with a way to retry, rather than an empty table", () => {
    const onRetry = vi.fn();
    render(<DataTable columns={sampleColumns} data={[]} error="Server unreachable" onRetry={onRetry} />);

    expect(screen.getByText("Server unreachable")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(onRetry).toHaveBeenCalled();
  });

  it("renders a column's own render function", () => {
    render(
      <DataTable
        columns={[{ key: "account", header: "ACCOUNT", render: (r) => <b>{r.account.toUpperCase()}</b> }]}
        data={sampleData}
        rowKey={(r) => r.id}
      />
    );
    expect(screen.getByText("ACME CORP")).toBeDefined();
  });

  it("hides a column turned off in columnVisibility", () => {
    render(
      <DataTable
        columns={sampleColumns}
        data={sampleData}
        rowKey={(r) => r.id}
        columnVisibility={{ name: false }}
      />
    );
    expect(screen.queryByText("NAME")).toBeNull();
    expect(screen.getByText("ACCOUNT")).toBeDefined();
  });
});

describe("column widths", () => {
  // Widths come from a shared scale so a header row reads evenly rather than
  // ragged, and so two screens look like the same product.
  it("resolves a named size to its step", () => {
    render(
      <DataTable columns={[{ key: "account", header: "ACCOUNT", size: "lg" }]} data={sampleData} rowKey={(r) => r.id} />
    );
    expect(headers()[0].style.width).toBe(`${COLUMN_SIZES.lg}px`);
  });

  it("snaps an explicit width up to the next step, never down", () => {
    // Rounding down would make a column narrower than asked for, which is how
    // content starts getting clipped in ways a page author did not expect.
    render(
      <DataTable columns={[{ key: "account", header: "ACCOUNT", width: 200 }]} data={sampleData} rowKey={(r) => r.id} />
    );
    expect(headers()[0].style.width).toBe("224px");
  });

  it("treats minWidth as a floor", () => {
    render(
      <DataTable columns={[{ key: "account", header: "ACCOUNT", minWidth: 220 }]} data={sampleData} rowKey={(r) => r.id} />
    );
    expect(headers()[0].style.width).toBe("224px");
  });

  it("gives a header and its cells the same width", () => {
    render(
      <DataTable columns={[{ key: "account", header: "ACCOUNT", size: "md" }]} data={sampleData} rowKey={(r) => r.id} />
    );
    const cell = rows()[0].querySelector("td");
    expect(headers()[0].style.width).toBe(`${COLUMN_SIZES.md}px`);
    expect(cell.style.width).toBe(`${COLUMN_SIZES.md}px`);
  });

  it("puts every column on the same grid", () => {
    render(
      <DataTable
        columns={[
          { key: "account", header: "ACCOUNT", size: "md" },
          { key: "name", header: "NAME", minWidth: 90 },
          { key: "type", header: "TYPE", width: 300 },
        ]}
        data={sampleData}
        rowKey={(r) => r.id}
      />
    );
    for (const th of headers()) {
      expect(Number.parseInt(th.style.width, 10) % 32).toBe(0);
    }
  });

  it("stretches columns to fill leftover space in the container, proportional to each column's own base width", () => {
    // Columns used to keep their base width even when the table had room to
    // spare, leaving the extra space as blank background past the last
    // column — directly above text that was being cut off with an ellipsis
    // for no reason, since the room for it was right there.
    const original = Object.getOwnPropertyDescriptor(Element.prototype, "clientWidth");
    Object.defineProperty(Element.prototype, "clientWidth", { configurable: true, value: 900 });

    try {
      render(
        <DataTable
          columns={[
            { key: "account", header: "ACCOUNT", size: "sm" },
            { key: "name", header: "NAME", size: "xl" },
          ]}
          data={sampleData}
          rowKey={(r) => r.id}
        />
      );

      const [accountWidth, nameWidth] = headers().map((th) => Number.parseInt(th.style.width, 10));
      // Base widths (128 + 320 = 448) leave 452px of slack in a 900px
      // container; both columns grow to use all of it, and the wider (xl)
      // column — already claiming more of the base total — absorbs more of
      // the slack too.
      expect(accountWidth + nameWidth).toBe(900);
      expect(nameWidth).toBeGreaterThan(COLUMN_SIZES.xl);
      expect(nameWidth).toBeGreaterThan(accountWidth);
    } finally {
      if (original) Object.defineProperty(Element.prototype, "clientWidth", original);
    }
  });

  it("does not stretch columns when the table already fills or overflows its container", () => {
    // clientWidth defaults to 0 in JSDOM (no real layout engine), which is
    // also what a genuinely narrow/scrolling table looks like — this just
    // makes that default explicit as the case under test.
    render(
      <DataTable
        columns={[{ key: "account", header: "ACCOUNT", size: "sm" }]}
        data={sampleData}
        rowKey={(r) => r.id}
      />
    );
    expect(headers()[0].style.width).toBe(`${COLUMN_SIZES.sm}px`);
  });
});

describe("header alignment", () => {
  it("leaves header labels unaligned by default, matching the body cell below", () => {
    // A centred header over a left-aligned body cell floats away from the
    // column it names — the exact mismatch this default previously caused on
    // every column that didn't set its own `align`.
    render(<DataTable columns={sampleColumns} data={sampleData} rowKey={(r) => r.id} />);
    const th = headers()[0];
    const td = rows()[0].querySelectorAll("td")[0];
    expect(th.className).not.toContain("text-center");
    expect(th.className).not.toContain("text-right");
    expect(td.className).not.toContain("text-center");
    expect(td.className).not.toContain("text-right");
  });

  it("centres every header when headerAlign is set to center", () => {
    render(<DataTable columns={sampleColumns} data={sampleData} rowKey={(r) => r.id} headerAlign="center" />);
    expect(headers()[0].className).toContain("text-center");
  });

  it("centres the body cells too, so a forced header alignment doesn't float away from its data", () => {
    render(<DataTable columns={sampleColumns} data={sampleData} rowKey={(r) => r.id} headerAlign="center" />);
    const td = rows()[0].querySelectorAll("td")[0];
    expect(td.className).toContain("text-center");
  });

  it("lets a column's own alignment win, so numbers stay over their column", () => {
    render(
      <DataTable
        columns={[{ key: "amount", header: "AMOUNT", align: "right" }]}
        data={[{ id: 1, amount: "1.00" }]}
        rowKey={(r) => r.id}
      />
    );
    expect(headers()[0].className).toContain("text-right");
    expect(headers()[0].className).not.toContain("text-center");
  });

  it("follows col.align when headerAlign is left", () => {
    render(
      <DataTable columns={sampleColumns} data={sampleData} rowKey={(r) => r.id} headerAlign="left" />
    );
    expect(headers()[0].className).not.toContain("text-center");
  });

  it("lets a column's own alignment win over a conflicting table-wide headerAlign, for header and body alike", () => {
    render(
      <DataTable
        columns={[{ key: "amount", header: "AMOUNT", align: "right" }]}
        data={[{ id: 1, amount: "1.00" }]}
        rowKey={(r) => r.id}
        headerAlign="center"
      />
    );
    expect(headers()[0].className).toContain("text-right");
    expect(headers()[0].className).not.toContain("text-center");
    const td = rows()[0].querySelectorAll("td")[0];
    expect(td.className).toContain("text-right");
    expect(td.className).not.toContain("text-center");
  });
});

describe("dense mode", () => {
  /** The `py-*` step actually on an element, in Tailwind's rem quarters. */
  const padStep = (el) => {
    const cls = [...el.classList].find((c) => /^py-\d+(\.\d+)?$/.test(c));
    return cls ? Number(cls.slice(3)) : null;
  };

  it("uses the regular header and body padding by default", () => {
    render(<DataTable columns={sampleColumns} data={sampleData} rowKey={(r) => r.id} />);
    expect(padStep(headers()[0])).toBe(3);
    expect(padStep(rows()[0].querySelectorAll("td")[0])).toBe(2.5);
  });

  it("shrinks the header row's own padding too, not just the body", () => {
    render(<DataTable columns={sampleColumns} data={sampleData} rowKey={(r) => r.id} dense />);
    expect(padStep(headers()[0])).toBe(2.5);
    expect(padStep(rows()[0].querySelectorAll("td")[0])).toBe(1.5);
  });

  // A header with the same padding as the body ends up SHORTER than the rows
  // beneath it — one line of short uppercase labels against wrapped cell
  // content — so it stops reading as a header at all. The extra step is what
  // keeps it the tallest band in the table.
  it.each([{ dense: false }, { dense: true }])(
    "keeps the header roomier than the body (dense: $dense)",
    ({ dense }) => {
      render(
        <DataTable columns={sampleColumns} data={sampleData} rowKey={(r) => r.id} dense={dense} />
      );
      expect(padStep(headers()[0])).toBeGreaterThan(
        padStep(rows()[0].querySelectorAll("td")[0])
      );
    }
  );

  it("gives the select-all header cell the same padding as the other header cells", () => {
    render(
      <DataTable columns={sampleColumns} data={sampleData} rowKey={(r) => r.id} selectable dense />
    );
    expect(padStep(screen.getByTitle("Click to select all"))).toBe(padStep(headers()[0]));
  });

  it("does not let the select-all cell drive the header taller than a non-selectable table's", () => {
    // A min-height on the checkbox wrapper made every selectable table's
    // header taller than a non-selectable one's, so two screens side by side
    // disagreed on header height for a reason unrelated to their content.
    render(
      <DataTable columns={sampleColumns} data={sampleData} rowKey={(r) => r.id} selectable />
    );
    const wrapper = screen.getByTitle("Click to select all").querySelector("div");
    expect(wrapper.className).not.toMatch(/min-h-/);
  });
});

describe("row tones", () => {
  const tone = (row) => (row.account === "Acme Corp" ? "warn" : null);

  it("tints a row by meaning", () => {
    render(<DataTable columns={sampleColumns} data={sampleData} rowKey={(r) => r.id} getRowTone={tone} />);

    expect(rows()[0].className).toContain("bg-status-warn");
    expect(rows()[1].className).not.toContain("bg-status-warn");
  });

  it("lets selection outrank the tint", () => {
    // Only one background class may reach the row: Tailwind resolves competing
    // utilities by their order in the stylesheet, not in the class attribute,
    // so two would pick a winner more or less at random.
    render(
      <DataTable
        columns={sampleColumns}
        data={sampleData}
        rowKey={(r) => r.id}
        getRowTone={tone}
        selectable
        selectedKeys={[1]}
      />
    );
    expect(rows()[0].className).not.toContain("bg-status-warn");
    expect(rows()[0].className).toContain("bg-accent/15");
  });

  it("ignores a tone name it does not know rather than rendering a bare class", () => {
    render(
      <DataTable columns={sampleColumns} data={sampleData} rowKey={(r) => r.id} getRowTone={() => "chartreuse"} />
    );
    expect(rows()[0].className).not.toContain("chartreuse");
  });
});

describe("sorting", () => {
  it("sorts on its own when no handler is given", () => {
    render(<DataTable columns={sampleColumns} data={sampleData} rowKey={(r) => r.id} />);

    fireEvent.click(screen.getByText("ACCOUNT"));
    expect(rows()[0].textContent).toContain("Acme Corp");

    fireEvent.click(screen.getByText("ACCOUNT"));
    expect(rows()[0].textContent).toContain("Beta LLC");
  });

  it("hands sorting over when a handler is given", () => {
    const onSortChange = vi.fn();
    render(
      <DataTable
        columns={sampleColumns}
        data={sampleData}
        rowKey={(r) => r.id}
        sortKey="account"
        sortDirection="asc"
        onSortChange={onSortChange}
      />
    );

    fireEvent.click(screen.getByText("ACCOUNT"));
    expect(onSortChange).toHaveBeenCalledWith("account", "desc");
  });

  it("does not reorder rows itself while sorting is controlled", () => {
    // The server has already ordered these. Reordering them here would fight
    // the database — JS locale compare and SQL collation disagree.
    const onSortChange = vi.fn();
    render(
      <DataTable
        columns={sampleColumns}
        data={sampleData}
        rowKey={(r) => r.id}
        serverSide
        sortKey="account"
        sortDirection="desc"
        onSortChange={onSortChange}
      />
    );
    expect(rows()[0].textContent).toContain("Acme Corp");
  });

  it("ignores clicks on a column that is not sortable", () => {
    const onSortChange = vi.fn();
    render(
      <DataTable columns={sampleColumns} data={sampleData} rowKey={(r) => r.id} onSortChange={onSortChange} />
    );
    fireEvent.click(screen.getByText("TYPE"));
    expect(onSortChange).not.toHaveBeenCalled();
  });
});

describe("selection", () => {
  it("selects and deselects a row", () => {
    const onSelectedKeysChange = vi.fn();
    render(
      <DataTable
        columns={sampleColumns}
        data={sampleData}
        rowKey={(r) => r.id}
        selectable
        selectedKeys={[]}
        onSelectedKeysChange={onSelectedKeysChange}
      />
    );

    fireEvent.click(screen.getByText("Acme Corp"));
    expect(onSelectedKeysChange).toHaveBeenCalledWith([1]);
  });

  it("selects every row from the header checkbox", () => {
    const onSelectedKeysChange = vi.fn();
    render(
      <DataTable
        columns={sampleColumns}
        data={sampleData}
        rowKey={(r) => r.id}
        selectable
        selectedKeys={[]}
        onSelectedKeysChange={onSelectedKeysChange}
      />
    );

    fireEvent.click(screen.getByTitle("Click to select all"));
    expect(onSelectedKeysChange).toHaveBeenCalledWith([1, 2]);
  });

  it("clears the selection when everything is already selected", () => {
    const onSelectedKeysChange = vi.fn();
    render(
      <DataTable
        columns={sampleColumns}
        data={sampleData}
        rowKey={(r) => r.id}
        selectable
        selectedKeys={[1, 2]}
        onSelectedKeysChange={onSelectedKeysChange}
      />
    );

    fireEvent.click(screen.getByTitle("Click to select all"));
    expect(onSelectedKeysChange).toHaveBeenCalledWith([]);
  });

  it("adds to the selection when a modifier is held", () => {
    const onSelectedKeysChange = vi.fn();
    render(
      <DataTable
        columns={sampleColumns}
        data={sampleData}
        rowKey={(r) => r.id}
        selectable
        selectedKeys={[1]}
        onSelectedKeysChange={onSelectedKeysChange}
      />
    );

    fireEvent.click(screen.getByText("Beta LLC"), { ctrlKey: true });
    expect(onSelectedKeysChange).toHaveBeenCalledWith([1, 2]);
  });

  // `accent-muted` is the badge-fill token — #eff6ff on the light themes, and
  // #0a2240 on the dark ones. Diluted over a card of #ffffff / #112035 it
  // composites to roughly the card's own colour, so a selected row looked
  // exactly like an unselected one on every theme. Selection has to dilute
  // the accent *foreground*, which is a colour meant to be seen on a card.
  it("tints a selected row with the accent foreground, not the near-invisible badge fill", () => {
    render(
      <DataTable
        columns={sampleColumns}
        data={sampleData}
        rowKey={(r) => r.id}
        selectable
        selectedKeys={[1]}
      />
    );
    expect(rows()[0].className).toContain("bg-accent/15");
    expect(rows()[0].className).not.toContain("accent-muted");
  });

  it("gives a selected row a background, not only a left bar that scrolls out of view", () => {
    // These tables scroll horizontally, so a marker pinned to the row's left
    // edge is gone the moment the user scrolls right — it can be a second cue
    // but never the only one.
    render(
      <DataTable
        columns={sampleColumns}
        data={sampleData}
        rowKey={(r) => r.id}
        selectable
        selectedKeys={[1]}
      />
    );
    expect(rows()[0].className).toMatch(/\bbg-accent\/\d+/);
    expect(rows()[0].className).toContain("border-l-accent");
  });

  it("keeps an unselected row free of any selection tint", () => {
    render(
      <DataTable
        columns={sampleColumns}
        data={sampleData}
        rowKey={(r) => r.id}
        selectable
        selectedKeys={[1]}
      />
    );
    expect(rows()[1].className).not.toMatch(/(^|\s)bg-accent\//);
    expect(rows()[1].className).not.toContain("border-l-accent");
  });

  // `Checkbox` puts a real <input> inside a <label htmlFor>, so a click on the
  // box reaches the enclosing cell twice: once from the label, and once from
  // the click the browser forwards to the input. The cell handler ran for
  // both, toggling the row on and straight back off — clicking a checkbox
  // appeared to do nothing whatsoever.
  //
  // These click the <label>, not the <input>, because that is the element a
  // user actually hits and the only one that reproduces the forwarding. A
  // bare click on the input dispatches a single event and passed even while
  // the bug was live, which is exactly why it went unnoticed.
  const boxFor = (el) => el.closest("label");

  it("selects a row when its checkbox is clicked, exactly once", () => {
    const onSelectedKeysChange = vi.fn();
    render(
      <DataTable
        columns={sampleColumns}
        data={sampleData}
        rowKey={(r) => r.id}
        selectable
        selectedKeys={[]}
        onSelectedKeysChange={onSelectedKeysChange}
      />
    );

    fireEvent.click(boxFor(screen.getAllByLabelText("Select row")[0]));
    expect(onSelectedKeysChange).toHaveBeenCalledTimes(1);
    expect(onSelectedKeysChange).toHaveBeenCalledWith([1]);
  });

  it("adds to the selection from the checkbox rather than replacing it", () => {
    // The whole point of a checkbox column is picking several rows without
    // holding a modifier; replacing would clear the boxes already ticked.
    const onSelectedKeysChange = vi.fn();
    render(
      <DataTable
        columns={sampleColumns}
        data={sampleData}
        rowKey={(r) => r.id}
        selectable
        selectedKeys={[1]}
        onSelectedKeysChange={onSelectedKeysChange}
      />
    );

    fireEvent.click(boxFor(screen.getAllByLabelText("Select row")[1]));
    expect(onSelectedKeysChange).toHaveBeenCalledWith([1, 2]);
  });

  it("deselects from the checkbox without clearing the other rows", () => {
    const onSelectedKeysChange = vi.fn();
    render(
      <DataTable
        columns={sampleColumns}
        data={sampleData}
        rowKey={(r) => r.id}
        selectable
        selectedKeys={[1, 2]}
        onSelectedKeysChange={onSelectedKeysChange}
      />
    );

    fireEvent.click(boxFor(screen.getAllByLabelText("Select row")[0]));
    expect(onSelectedKeysChange).toHaveBeenCalledWith([2]);
  });

  it("selects every row from the header checkbox itself, exactly once", () => {
    const onSelectedKeysChange = vi.fn();
    render(
      <DataTable
        columns={sampleColumns}
        data={sampleData}
        rowKey={(r) => r.id}
        selectable
        selectedKeys={[]}
        onSelectedKeysChange={onSelectedKeysChange}
      />
    );

    fireEvent.click(boxFor(screen.getByLabelText("Select all rows")));
    expect(onSelectedKeysChange).toHaveBeenCalledTimes(1);
    expect(onSelectedKeysChange).toHaveBeenCalledWith([1, 2]);
  });

  // Clicking a row focuses it, so a tint driven by the `focusedIndex` state
  // stayed painted on whichever row was last touched — after deselecting it
  // read as a leftover shadow marking a row that was no longer selected.
  it("leaves no lingering tint on a row that was deselected", () => {
    const { rerender } = render(
      <DataTable
        columns={sampleColumns}
        data={sampleData}
        rowKey={(r) => r.id}
        selectable
        selectedKeys={[1]}
      />
    );
    expect(rows()[0].className).toContain("bg-accent/15");

    rerender(
      <DataTable
        columns={sampleColumns}
        data={sampleData}
        rowKey={(r) => r.id}
        selectable
        selectedKeys={[]}
      />
    );
    // Only the :focus-visible variant may mention the accent tint — never a
    // bare, always-painted one.
    expect(rows()[0].className).not.toMatch(/(^|\s)bg-accent\//);
  });

  it("still shows a focus tint for keyboard navigation, via :focus-visible", () => {
    render(
      <DataTable columns={sampleColumns} data={sampleData} rowKey={(r) => r.id} selectable />
    );
    expect(rows()[0].className).toContain("focus-visible:bg-accent/8");
  });
});

describe("interaction", () => {
  it("calls onRowClick", () => {
    const handleRowClick = vi.fn();
    render(
      <DataTable columns={sampleColumns} data={sampleData} rowKey={(r) => r.id} onRowClick={handleRowClick} />
    );

    fireEvent.click(screen.getByText("Acme Corp"));
    expect(handleRowClick).toHaveBeenCalledWith(sampleData[0]);
  });

  it("leaves controls inside a cell to their own keyboard behaviour", () => {
    // Without this, Space on a checkbox in a cell was swallowed as a
    // table-navigation key and the checkbox never toggled.
    const onSelectedKeysChange = vi.fn();
    render(
      <DataTable
        columns={[{ key: "action", header: "ACTION", render: () => <button type="button">Edit</button> }]}
        data={sampleData}
        rowKey={(r) => r.id}
        selectable
        selectedKeys={[]}
        onSelectedKeysChange={onSelectedKeysChange}
      />
    );

    fireEvent.keyDown(screen.getAllByRole("button", { name: "Edit" })[0], { key: " " });
    expect(onSelectedKeysChange).not.toHaveBeenCalled();
  });

  it("clears the selection on Escape", () => {
    const onSelectedKeysChange = vi.fn();
    render(
      <DataTable
        columns={sampleColumns}
        data={sampleData}
        rowKey={(r) => r.id}
        selectable
        selectedKeys={[1]}
        onSelectedKeysChange={onSelectedKeysChange}
      />
    );

    fireEvent.keyDown(screen.getByRole("region"), { key: "Escape" });
    expect(onSelectedKeysChange).toHaveBeenCalledWith([]);
  });

  it("describes itself for anyone navigating by keyboard", () => {
    render(<DataTable columns={sampleColumns} data={sampleData} rowKey={(r) => r.id} />);
    expect(screen.getByRole("region").getAttribute("aria-label")).toMatch(/arrow keys/i);
  });
});

describe("client-side search", () => {
  it("filters rows when searching is enabled", () => {
    render(
      <DataTable columns={sampleColumns} data={sampleData} rowKey={(r) => r.id} searchable searchValue="beta" />
    );
    expect(rows()).toHaveLength(1);
    expect(rows()[0].textContent).toContain("Beta LLC");
  });

  it("leaves the page alone when the server is doing the searching", () => {
    render(
      <DataTable
        columns={sampleColumns}
        data={sampleData}
        rowKey={(r) => r.id}
        serverSide
        searchable
        searchValue="beta"
      />
    );
    expect(rows()).toHaveLength(2);
  });
});
