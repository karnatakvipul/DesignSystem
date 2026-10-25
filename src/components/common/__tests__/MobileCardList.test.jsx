import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MobileCardList } from "../MobileCardList";
import { TruncatedText } from "../TruncatedText";

/**
 * The card list is the whole of the app on a phone, and every gesture it
 * handles is one a mouse never makes. These are the paths that cannot be
 * checked on a desktop run: a press that has to tell holding still apart from
 * scrolling, a tap that means different things depending on whether anything
 * is selected, and controls a thumb has to be able to hit.
 */

const data = [
  { id: 1, account: "Acme Corp", name: "Site One", status: "Active" },
  { id: 2, account: "Beta LLC", name: "Site Two", status: "Expired" },
  { id: 3, account: "Gamma Ltd", name: "Site Three", status: "Active" },
];

const columns = [
  { key: "account", header: "ACCOUNT" },
  { key: "name", header: "NAME" },
  { key: "status", header: "STATUS" },
];

/** The press threshold, plus enough to be past it. */
const PAST_LONG_PRESS = 400;

function setup(props = {}) {
  const onSelectedKeysChange = vi.fn();
  const utils = render(
    <MobileCardList
      data={data}
      columns={columns}
      rowKey={(r) => r.id}
      primaryFields={["account", "name"]}
      selectable
      selectedKeys={[]}
      onSelectedKeysChange={onSelectedKeysChange}
      {...props}
    />
  );
  return { ...utils, onSelectedKeysChange };
}

/** The card element for a row, which is what carries the touch handlers. */
function cardFor(container, text) {
  const cards = [...container.firstChild.children];
  const card = cards.find((el) => el.textContent.includes(text));
  if (!card) throw new Error(`no card containing "${text}"`);
  return card;
}

const at = (x, y) => ({ touches: [{ clientX: x, clientY: y }] });

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("telling a scroll apart from a press", () => {
  it("does not select when the finger travels before the timer fires", () => {
    // The defect this exists for: a flick and a hold are the same gesture until
    // the finger moves, so the press timer fired part-way through a scroll and
    // ticked whatever row happened to be under the thumb.
    const { container, onSelectedKeysChange } = setup();
    const card = cardFor(container, "Acme Corp");

    fireEvent.touchStart(card, at(100, 300));
    fireEvent.touchMove(card, at(100, 240));
    act(() => vi.advanceTimersByTime(PAST_LONG_PRESS));

    expect(onSelectedKeysChange).not.toHaveBeenCalled();
  });

  it("still selects when the finger only trembles", () => {
    // A resting finger is never perfectly still. Cancelling on any movement at
    // all would make long-press select impossible to perform.
    const { container, onSelectedKeysChange } = setup();
    const card = cardFor(container, "Acme Corp");

    fireEvent.touchStart(card, at(100, 300));
    fireEvent.touchMove(card, at(103, 302));
    act(() => vi.advanceTimersByTime(PAST_LONG_PRESS));

    expect(onSelectedKeysChange).toHaveBeenCalledWith([1]);
  });

  it("does not select when the list scrolls under a resting finger", () => {
    const { container, onSelectedKeysChange } = setup();
    const card = cardFor(container, "Acme Corp");

    fireEvent.touchStart(card, at(100, 300));
    fireEvent.scroll(container.firstChild);
    act(() => vi.advanceTimersByTime(PAST_LONG_PRESS));

    expect(onSelectedKeysChange).not.toHaveBeenCalled();
  });

  it("does not select after the finger lifts early", () => {
    const { container, onSelectedKeysChange } = setup();
    const card = cardFor(container, "Acme Corp");

    fireEvent.touchStart(card, at(100, 300));
    act(() => vi.advanceTimersByTime(200));
    fireEvent.touchEnd(card);
    act(() => vi.advanceTimersByTime(PAST_LONG_PRESS));

    expect(onSelectedKeysChange).not.toHaveBeenCalled();
  });

  it("does not fire against a list that has gone away", () => {
    // A page change unmounts the list mid-press, and a timer left armed lands
    // on a component that no longer exists — one stray selection per navigation.
    const { container, unmount, onSelectedKeysChange } = setup();
    fireEvent.touchStart(cardFor(container, "Acme Corp"), at(100, 300));

    unmount();
    act(() => vi.advanceTimersByTime(PAST_LONG_PRESS));

    expect(onSelectedKeysChange).not.toHaveBeenCalled();
  });
});

describe("multi-select", () => {
  it("selects on a long press", () => {
    const { container, onSelectedKeysChange } = setup();

    fireEvent.touchStart(cardFor(container, "Beta LLC"), at(100, 300));
    act(() => vi.advanceTimersByTime(PAST_LONG_PRESS));

    expect(onSelectedKeysChange).toHaveBeenCalledWith([2]);
  });

  it("adds to the selection on a plain tap once one row is selected", () => {
    // Without this the only way to pick a second row is another 380ms hold,
    // which is what made multi-select on a phone feel broken.
    const { container, onSelectedKeysChange } = setup({ selectedKeys: [1] });

    fireEvent.click(cardFor(container, "Beta LLC"));

    expect(onSelectedKeysChange).toHaveBeenCalledWith([1, 2]);
  });

  it("removes from the selection on a tap of an already-selected row", () => {
    const { container, onSelectedKeysChange } = setup({ selectedKeys: [1, 2] });

    fireEvent.click(cardFor(container, "Acme Corp"));

    expect(onSelectedKeysChange).toHaveBeenCalledWith([2]);
  });

  it("leaves a tap alone while nothing is selected", () => {
    // Selection mode has to be entered deliberately, or scrolling to read a
    // list turns into selecting from it.
    const onRowClick = vi.fn();
    const { container, onSelectedKeysChange } = setup({ onRowClick });

    fireEvent.click(cardFor(container, "Acme Corp"));

    expect(onSelectedKeysChange).not.toHaveBeenCalled();
    expect(onRowClick).toHaveBeenCalledWith(data[0]);
  });

  it("keeps the caller's key type, so id comparisons still work", () => {
    const { container, onSelectedKeysChange } = setup({ selectedKeys: [1] });

    fireEvent.click(cardFor(container, "Gamma Ltd"));

    expect(onSelectedKeysChange).toHaveBeenCalledWith([1, 3]);
    expect(onSelectedKeysChange.mock.calls[0][0].every((k) => typeof k === "number")).toBe(true);
  });
});

describe("single-select", () => {
  it("selects on a plain tap, with no hold needed", () => {
    const { container, onSelectedKeysChange } = setup({ selectionMode: "single" });

    fireEvent.click(cardFor(container, "Beta LLC"));

    expect(onSelectedKeysChange).toHaveBeenCalledWith([2]);
  });

  it("replaces the selection rather than adding to it", () => {
    const { container, onSelectedKeysChange } = setup({
      selectionMode: "single",
      selectedKeys: [1],
    });

    fireEvent.click(cardFor(container, "Gamma Ltd"));

    expect(onSelectedKeysChange).toHaveBeenCalledWith([3]);
  });

  it("clears when the selected row is tapped again", () => {
    const { container, onSelectedKeysChange } = setup({
      selectionMode: "single",
      selectedKeys: [1],
    });

    fireEvent.click(cardFor(container, "Acme Corp"));

    expect(onSelectedKeysChange).toHaveBeenCalledWith([]);
  });

  it("presents itself as a radio, not a checkbox", () => {
    setup({ selectionMode: "single" });

    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  });
});

describe("the selection control", () => {
  it("toggles exactly once per tap", () => {
    // It used to be a div wrapping a label-and-input pair, so the browser
    // forwarded every tap to the input and the handler around it ran twice —
    // selecting and immediately deselecting, which read as nothing happening.
    const { onSelectedKeysChange } = setup();

    fireEvent.click(screen.getByRole("checkbox", { name: "Select Acme Corp" }));

    expect(onSelectedKeysChange).toHaveBeenCalledTimes(1);
    expect(onSelectedKeysChange).toHaveBeenCalledWith([1]);
  });

  it("does not also open or expand the row it sits on", () => {
    const onRowClick = vi.fn();
    setup({ onRowClick });

    fireEvent.click(screen.getByRole("checkbox", { name: "Select Acme Corp" }));

    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("names its row, so a column of them is not all 'Select row'", () => {
    setup();

    expect(screen.getByRole("checkbox", { name: "Select Acme Corp" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Select Beta LLC" })).toBeInTheDocument();
  });

  it("reports its state rather than leaving it to the tint", () => {
    setup({ selectedKeys: [2] });

    expect(screen.getByRole("checkbox", { name: "Select Acme Corp" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Select Beta LLC" })).toBeChecked();
  });

  it("is a control the size of a fingertip, not of its tick", () => {
    // The tappable part used to be the 16px box itself.
    setup();
    const control = screen.getByRole("checkbox", { name: "Select Acme Corp" });

    expect(control.className).toContain("h-control-lg");
    expect(control.className).toContain("w-control-lg");
  });

  it("does not undo the selection a long press just made", () => {
    // The browser sends a click after the press ends. Unguarded, that click
    // toggled the row straight back off.
    const { container, onSelectedKeysChange } = setup();
    const card = cardFor(container, "Acme Corp");

    fireEvent.touchStart(card, at(100, 300));
    act(() => vi.advanceTimersByTime(PAST_LONG_PRESS));
    fireEvent.touchEnd(card);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Acme Corp" }));

    expect(onSelectedKeysChange).toHaveBeenCalledTimes(1);
  });
});

describe("room for what floats over the list", () => {
  it("leaves the last row clear of a floating button", () => {
    // A floating add button holds the bottom-right corner at every scroll
    // position, so without clearance the last card's action icons sit under it
    // permanently — stacked on screen, and impossible to tap.
    const { container } = setup();

    expect(container.firstChild.className).toMatch(/pb-2/);
  });

  it("leaves more room again once the bulk bar is up", () => {
    const { container } = setup({
      selectedKeys: [1],
      bulkActions: [{ label: "Delete", onClick: vi.fn() }],
    });

    expect(container.firstChild.className).toMatch(/pb-\[calc\(10rem\+env\(safe-area-inset-bottom\)\)\]/);
  });

  it("puts the bulk bar above the floating button rather than across it", () => {
    setup({
      selectedKeys: [1, 2],
      bulkActions: [{ label: "Delete", onClick: vi.fn() }],
    });
    const bar = screen.getByRole("toolbar", { name: "Bulk actions" });

    expect(bar).toHaveTextContent("2 selected");
    expect(bar.className).toMatch(/bottom-\[calc\(5\.5rem\+env\(safe-area-inset-bottom\)\)\]/);
  });

  it("hands the bulk action the keys it was showing a count for", () => {
    const onClick = vi.fn();
    setup({ selectedKeys: [1, 3], bulkActions: [{ label: "Delete", onClick }] });

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(onClick).toHaveBeenCalledWith([1, 3]);
  });
});

describe("when selection is not offered at all", () => {
  it("renders no selection controls", () => {
    render(
      <MobileCardList data={data} columns={columns} rowKey={(r) => r.id} primaryFields={["account"]} />
    );

    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  });

  it("does not arm a press timer", () => {
    const onRowClick = vi.fn();
    const { container } = render(
      <MobileCardList
        data={data}
        columns={columns}
        rowKey={(r) => r.id}
        primaryFields={["account"]}
        onRowClick={onRowClick}
      />
    );

    fireEvent.touchStart(cardFor(container, "Acme Corp"), at(100, 300));
    act(() => vi.advanceTimersByTime(PAST_LONG_PRESS));
    fireEvent.click(cardFor(container, "Acme Corp"));

    expect(onRowClick).toHaveBeenCalledTimes(1);
  });
});

describe("expanded card detail", () => {
  // The defect this exists for: a column's `render` (e.g. `TruncatedText`,
  // used by every long-text column in a real app) is shared with the desktop
  // table, where single-line ellipsis is correct for a fixed-width cell. The
  // same render function was reused verbatim in this expanded row, so a long
  // site name was cut off here too even though there's no width constraint
  // forcing that — the user had just tapped to see everything.
  const longSite = "Gmr Airport Hyderabad: Aemb Domestic Tank Terminal, Zone 4 Extension Building";
  const dataWithSite = [{ id: 1, account: "Acme Corp", name: "Site One", site: longSite }];
  const columnsWithSite = [
    { key: "account", header: "ACCOUNT" },
    { key: "name", header: "NAME" },
    { key: "site", header: "SITE", render: (r) => <TruncatedText text={r.site} /> },
  ];

  it("shows a long value from a column's render in full once expanded, not clipped to one line", () => {
    render(
      <MobileCardList
        data={dataWithSite}
        columns={columnsWithSite}
        rowKey={(r) => r.id}
        primaryFields={["account", "name"]}
        secondaryFields={["site"]}
      />
    );

    fireEvent.click(screen.getByLabelText("Expand details"));

    // The full string, not the "..."-suffixed slice TruncatedText's own
    // `maxLength` truncation would have produced if this were still clipped.
    expect(screen.getByText(longSite)).toBeDefined();
  });

  it("neutralizes a nested TruncatedText's single-line CSS instead of relying on it not being used", () => {
    // Belt-and-suspenders: even if a future column's render keeps the
    // `truncate`/`whitespace-nowrap`/`overflow-hidden` classes, this row's
    // wrapper overrides them back to wrapping (verified by class presence,
    // since jsdom doesn't compute cascade/specificity).
    render(
      <MobileCardList
        data={dataWithSite}
        columns={columnsWithSite}
        rowKey={(r) => r.id}
        primaryFields={["account", "name"]}
        secondaryFields={["site"]}
      />
    );

    fireEvent.click(screen.getByLabelText("Expand details"));

    let node = screen.getByText(longSite);
    while (node && !node.className?.includes?.("[&_.truncate]:whitespace-normal")) {
      node = node.parentElement;
    }
    expect(node).not.toBeNull();
    expect(node.className).toContain("[&_.truncate]:overflow-visible");
  });
});
