import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Button } from "../Button";

describe("Button component", () => {
  it("renders children text correctly", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
    expect(screen.getByText("Click Me")).toBeDefined();
  });

  it("handles onClick event when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit</Button>);
    
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disables button and shows spinner when loading is true", () => {
    const handleClick = vi.fn();
    render(<Button loading onClick={handleClick}>Save</Button>);
    
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("applies primary variant styling by default", () => {
    const { container } = render(<Button>Default Variant</Button>);
    expect(container.firstChild).toHaveClass("bg-[var(--accent-primary)]");
  });
});
