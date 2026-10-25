import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Tabs } from "../Tabs";

const items = [
  { value: "one", label: "Plant 1" },
  { value: "two", label: "Plant 2" },
  { value: "three", label: "Plant 3" },
];

const leftArrow = () => screen.getByRole("button", { name: /scroll tabs left/i });
const rightArrow = () => screen.getByRole("button", { name: /scroll tabs right/i });
const tablist = () => screen.getByRole("tablist");

/**
 * jsdom reports every element as zero-sized, so nothing ever looks scrollable.
 * These make the strip wider than its container, which is the state the arrows
 * exist for.
 */
function makeOverflowing({ scrollWidth = 1000, clientWidth = 300, scrollLeft = 0 } = {}) {
  const list = tablist();
  Object.defineProperty(list, "scrollWidth", { value: scrollWidth, configurable: true });
  Object.defineProperty(list, "clientWidth", { value: clientWidth, configurable: true });
  let current = scrollLeft;
  Object.defineProperty(list, "scrollLeft", {
    get: () => current,
    set: (v) => {
      current = v;
    },
    configurable: true,
  });
  return list;
}

let observers;
beforeEach(() => {
  observers = [];
  // Captured so a test can trigger the measurement the component does on resize.
  global.ResizeObserver = class {
    constructor(callback) {
      this.callback = callback;
      observers.push(this);
    }
    observe() {}
    disconnect() {}
  };
});
afterEach(() => {
  delete global.ResizeObserver;
});

function remeasure() {
  act(() => {
    observers.forEach((o) => o.callback([]));
  });
}

describe("rendering", () => {
  it("renders every tab", () => {
    render(<Tabs items={items} value="one" />);
    expect(screen.getByText("Plant 1")).toBeDefined();
    expect(screen.getByText("Plant 3")).toBeDefined();
  });

  it("marks the active tab for assistive tech, not just visually", () => {
    render(<Tabs items={items} value="two" />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs[1].getAttribute("aria-selected")).toBe("true");
    expect(tabs[0].getAttribute("aria-selected")).toBe("false");
  });

  it("reports a change when a tab is clicked", () => {
    const onChange = vi.fn();
    render(<Tabs items={items} value="one" onChange={onChange} />);
    fireEvent.click(screen.getByText("Plant 3"));
    expect(onChange).toHaveBeenCalledWith("three");
  });

  it("reports the active tab again when it is clicked", () => {
    // Not deduplicated, and it does not need to be: a caller storing this in
    // state sees no re-render, since React bails out when the value is
    // unchanged. Pinned so nobody "fixes" it into a silent no-op that a caller
    // doing something else on every selection would not expect.
    const onChange = vi.fn();
    render(<Tabs items={items} value="one" onChange={onChange} />);
    fireEvent.click(screen.getByText("Plant 1"));
    expect(onChange).toHaveBeenCalledWith("one");
  });
});

describe("the action slot", () => {
  // The "+" for adding a tab lives here. It used to sit at the end of the tab
  // strip, which meant it scrolled out of sight exactly when there were enough
  // tabs to need it — the one control you cannot reach by scrolling further.
  it("renders outside the scrolling strip, so it cannot scroll away", () => {
    render(<Tabs items={items} value="one" action={<button type="button">Add map</button>} />);

    const action = screen.getByRole("button", { name: "Add map" });
    expect(tablist().contains(action)).toBe(false);
    expect(action).toBeDefined();
  });

  it("renders no action area when none is given", () => {
    render(<Tabs items={items} value="one" />);
    expect(screen.queryByRole("button", { name: "Add map" })).toBeNull();
  });
});

describe("scroll arrows", () => {
  // Both arrows are always mounted and disabled when there is nothing to
  // scroll. Mounting them conditionally fed back on itself: the arrows take
  // width, which shrinks the strip, which changes whether it overflows, which
  // changes whether the arrows render.
  it("always mounts both arrows", () => {
    render(<Tabs items={items} value="one" />);
    expect(leftArrow()).toBeDefined();
    expect(rightArrow()).toBeDefined();
  });

  it("disables them when everything already fits", () => {
    render(<Tabs items={items} value="one" />);
    expect(leftArrow().disabled).toBe(true);
    expect(rightArrow().disabled).toBe(true);
  });

  it("enables the right arrow once the tabs overflow", () => {
    render(<Tabs items={items} value="one" />);
    makeOverflowing();
    remeasure();

    expect(rightArrow().disabled).toBe(false);
    expect(leftArrow().disabled).toBe(true);
  });

  it("enables the left arrow once scrolled away from the start", () => {
    render(<Tabs items={items} value="one" />);
    makeOverflowing({ scrollLeft: 200 });
    remeasure();

    expect(leftArrow().disabled).toBe(false);
  });

  it("scrolls the strip when an arrow is pressed", () => {
    render(<Tabs items={items} value="one" />);
    const list = makeOverflowing();
    remeasure();

    fireEvent.click(rightArrow());
    expect(list.scrollLeft).toBeGreaterThan(0);

    const afterRight = list.scrollLeft;
    fireEvent.click(leftArrow());
    expect(list.scrollLeft).toBeLessThan(afterRight);
  });

  it("never scrolls past either end", () => {
    render(<Tabs items={items} value="one" />);
    const list = makeOverflowing({ scrollWidth: 1000, clientWidth: 300 });
    remeasure();

    for (let i = 0; i < 20; i += 1) fireEvent.click(rightArrow());
    expect(list.scrollLeft).toBeLessThanOrEqual(700);

    for (let i = 0; i < 20; i += 1) fireEvent.click(leftArrow());
    expect(list.scrollLeft).toBe(0);
  });
});

describe("keyboard", () => {
  it("moves to the next and previous tab with the arrow keys", () => {
    const onChange = vi.fn();
    render(<Tabs items={items} value="two" onChange={onChange} />);

    fireEvent.keyDown(tablist(), { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith("three");

    fireEvent.keyDown(tablist(), { key: "ArrowLeft" });
    expect(onChange).toHaveBeenCalledWith("one");
  });

  it("wraps around at both ends", () => {
    const onChange = vi.fn();
    const { rerender } = render(<Tabs items={items} value="three" onChange={onChange} />);
    fireEvent.keyDown(tablist(), { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith("one");

    rerender(<Tabs items={items} value="one" onChange={onChange} />);
    fireEvent.keyDown(tablist(), { key: "ArrowLeft" });
    expect(onChange).toHaveBeenCalledWith("three");
  });

  it("jumps to the first and last tab with Home and End", () => {
    // The reason this exists: with thirty tabs, reaching the last one by
    // arrowing is worse than not having keyboard support at all.
    const onChange = vi.fn();
    render(<Tabs items={items} value="two" onChange={onChange} />);

    fireEvent.keyDown(tablist(), { key: "Home" });
    expect(onChange).toHaveBeenCalledWith("one");

    fireEvent.keyDown(tablist(), { key: "End" });
    expect(onChange).toHaveBeenCalledWith("three");
  });

  it("leaves other keys alone", () => {
    const onChange = vi.fn();
    render(<Tabs items={items} value="two" onChange={onChange} />);
    fireEvent.keyDown(tablist(), { key: "a" });
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("empty", () => {
  it("renders without tabs rather than crashing", () => {
    render(<Tabs items={[]} value={null} />);
    expect(tablist()).toBeDefined();
    expect(screen.queryAllByRole("tab")).toHaveLength(0);
  });

  it("ignores arrow keys with no tabs to move between", () => {
    const onChange = vi.fn();
    render(<Tabs items={[]} value={null} onChange={onChange} />);
    fireEvent.keyDown(tablist(), { key: "ArrowRight" });
    expect(onChange).not.toHaveBeenCalled();
  });
});
