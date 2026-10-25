import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DateRangePicker } from "../DateRangePicker";

/**
 * Finds a button by its visible text.
 *
 * `getByRole("button", { name })` was used here and is the reason this file was
 * about to start failing intermittently: computing accessible names across an
 * open calendar — six weeks of day buttons plus the presets — took 1.3s on its
 * own and 3-5s once the rest of the suite was running beside it, against a 5s
 * default timeout. It passed or failed depending on how busy the machine was,
 * which is the worst way for a test to behave: it teaches people to re-run
 * until green.
 *
 * Matching on text and then asserting the element is a button makes the same
 * two claims for a fraction of the work.
 */
function button(text) {
  const element = screen.getByText(text).closest("button");
  expect(element, `expected "${text}" to be inside a button`).not.toBeNull();
  return element;
}

function openPicker() {
  fireEvent.click(button(/Select date range/i));
}

/** Opens the picker when it already has a value, so the trigger shows the
 * formatted range instead of the placeholder `openPicker` looks for. */
function openPickerWithValue() {
  fireEvent.click(button(/^\d{2}-\w{3}-\d{4} - \d{2}-\w{3}-\d{4}$/));
}

/**
 * The open calendar renders the current month and the next month
 * side by side, so a plain day number like "5" matches two buttons.
 * The current month is always the first one in DOM order.
 */
function dayButton(text) {
  return screen.getAllByText(text)[0].closest("button");
}

describe("DateRangePicker component", () => {
  it("renders label and placeholder when no dates selected", () => {
    render(<DateRangePicker label="Date Range" value={{ from: null, to: null }} onChange={() => {}} />);

    expect(screen.getByText("Date Range")).toBeDefined();
    expect(screen.getByText(/Select date range/i)).toBeDefined();
  });

  it("opens popover calendar on click", () => {
    render(<DateRangePicker label="Date Range" value={{ from: null, to: null }} onChange={() => {}} />);

    openPicker();

    // The presets and the confirm action are what make it a range picker
    // rather than a calendar.
    expect(button("This Month")).toBeDefined();
    expect(button("Apply")).toBeDefined();
  });

  it("selects a preset range and calls onChange when Apply is clicked", () => {
    const handleChange = vi.fn();
    render(<DateRangePicker label="Date Range" value={{ from: null, to: null }} onChange={handleChange} />);

    openPicker();
    fireEvent.click(button("This Month"));
    fireEvent.click(button("Apply"));

    expect(handleChange).toHaveBeenCalled();
  });

  it("reports the range it was given rather than the placeholder", () => {
    render(
      <DateRangePicker
        label="Date Range"
        value={{ from: new Date(2026, 0, 5), to: new Date(2026, 0, 20) }}
        onChange={() => {}}
      />
    );

    expect(screen.queryByText(/Select date range/i)).toBeNull();
  });

  // `bg-accent-muted` is the badge-fill token, not a foreground — diluted at
  // 40% over a white/near-white card it composites to within ~1.03:1 of the
  // card itself (same measured mistake as DataTable's row selection). The
  // band connecting the two endpoints was effectively invisible: a user could
  // see where a range started and ended but not that anything joined them.
  it("highlights a day inside the selected range with the accent foreground, not the near-invisible badge fill", () => {
    render(
      <DateRangePicker
        label="Date Range"
        value={{ from: new Date(2026, 0, 5), to: new Date(2026, 0, 20) }}
        onChange={() => {}}
      />
    );

    openPickerWithValue();
    // Day 12 sits strictly between the two endpoints (5 and 20).
    const inRangeDay = dayButton("12");
    expect(inRangeDay.className).toContain("bg-accent/15");
    expect(inRangeDay.className).not.toContain("accent-muted");
  });

  it("still marks the two endpoints at full strength, distinct from the connecting band", () => {
    render(
      <DateRangePicker
        label="Date Range"
        value={{ from: new Date(2026, 0, 5), to: new Date(2026, 0, 20) }}
        onChange={() => {}}
      />
    );

    openPickerWithValue();
    const startDay = dayButton("5");
    const endDay = dayButton("20");
    for (const day of [startDay, endDay]) {
      expect(day.className).toContain("bg-accent");
      expect(day.className).not.toContain("bg-accent/15");
      expect(day.className).not.toContain("accent-muted");
    }
  });
});
