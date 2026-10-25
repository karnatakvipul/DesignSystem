import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SegmentedControl } from "../SegmentedControl";

describe("SegmentedControl component", () => {
  const options = ["Issue Date", "Activation Date"];

  it("renders label and all option buttons", () => {
    render(
      <SegmentedControl
        label="License Activation"
        options={options}
        value="Issue Date"
        onChange={() => {}}
      />
    );

    expect(screen.getByText("License Activation")).toBeDefined();
    expect(screen.getByRole("button", { name: "Issue Date" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Activation Date" })).toBeDefined();
  });

  it("highlights active option", () => {
    render(
      <SegmentedControl
        label="License Activation"
        options={options}
        value="Activation Date"
        onChange={() => {}}
      />
    );

    const activeBtn = screen.getByRole("button", { name: "Activation Date" });
    expect(activeBtn.className).toContain("bg-accent");
  });

  it("calls onChange when an inactive option is clicked", () => {
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        label="License Activation"
        options={options}
        value="Issue Date"
        onChange={handleChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Activation Date" }));
    expect(handleChange).toHaveBeenCalledWith("Activation Date");
  });
});
