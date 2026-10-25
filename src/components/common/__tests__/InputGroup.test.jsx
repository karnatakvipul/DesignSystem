import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { InputGroup } from "../InputGroup";

describe("InputGroup component", () => {
  it("renders label, placeholder, and required badge", () => {
    render(
      <InputGroup
        label="Subscription Amount"
        requiredText="(required)"
        placeholder="Enter amount"
        value=""
        onChange={() => {}}
      />
    );

    expect(screen.getByText("Subscription Amount")).toBeDefined();
    expect(screen.getByText("(required)")).toBeDefined();
    expect(screen.getByPlaceholderText("Enter amount")).toBeDefined();
  });

  it("renders left addon when addonLeft is provided", () => {
    render(<InputGroup label="Amount" addonLeft="₹" value="500" onChange={() => {}} />);
    expect(screen.getByText("₹")).toBeDefined();
  });

  it("renders right addon when addonRight is provided", () => {
    render(<InputGroup label="Duration" addonRight="Days" value="30" onChange={() => {}} />);
    expect(screen.getByText("Days")).toBeDefined();
  });

  it("triggers onChange handler when text is entered", () => {
    const handleChange = vi.fn();
    render(<InputGroup label="Name" value="" onChange={handleChange} placeholder="Input name" />);

    const input = screen.getByPlaceholderText("Input name");
    fireEvent.change(input, { target: { value: "SLS Pro" } });
    expect(handleChange).toHaveBeenCalled();
  });
});
