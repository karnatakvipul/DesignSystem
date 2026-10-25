import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProfileMenu } from "../ProfileMenu";

/** The trigger button is the only always-visible part; everything else needs the popover open. */
function openPopover() {
  fireEvent.click(screen.getByLabelText("Open profile menu"));
}

describe("ProfileMenu", () => {
  it("shows the name in the trigger when no role is given, unchanged from before role existed", () => {
    render(<ProfileMenu name="Priya Sharma" email="priya@example.com" />);
    expect(screen.getByLabelText("Open profile menu")).toHaveTextContent("Priya Sharma");
  });

  it("shows the role, not the name or email, in the trigger once a role is given", () => {
    render(<ProfileMenu name="Priya Sharma" email="priya@example.com" role="Super Administrator" />);
    const trigger = screen.getByLabelText("Open profile menu");
    expect(trigger).toHaveTextContent("Super Administrator");
    expect(trigger).not.toHaveTextContent("Priya Sharma");
    expect(trigger).not.toHaveTextContent("priya@example.com");
  });

  it("reads role from the `user` object the same way it already reads name/email", () => {
    render(<ProfileMenu user={{ name: "Priya Sharma", email: "priya@example.com", role: "License Administrator" }} />);
    expect(screen.getByLabelText("Open profile menu")).toHaveTextContent("License Administrator");
  });

  it("still shows the full name and email inside the popover, role included, once opened", () => {
    render(<ProfileMenu name="Priya Sharma" email="priya@example.com" role="Super Administrator" />);
    openPopover();
    expect(screen.getByText("Priya Sharma")).toBeInTheDocument();
    expect(screen.getByText("priya@example.com")).toBeInTheDocument();
    // "Super Administrator" appears twice once open: once in the (still-visible)
    // trigger, once in the popover's role pill.
    expect(screen.getAllByText("Super Administrator").length).toBeGreaterThanOrEqual(2);
  });

  it("doesn't render a role pill in the popover when no role is given", () => {
    // No role means the trigger falls back to the name (see the first test
    // above), so "Priya Sharma" legitimately appears twice once the popover
    // is open too — that part isn't what this test is checking.
    render(<ProfileMenu name="Priya Sharma" email="priya@example.com" />);
    openPopover();
    expect(screen.getByText("priya@example.com")).toBeInTheDocument();
    expect(screen.queryByText(/administrator/i)).not.toBeInTheDocument();
  });
});
