import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ErrorBoundary } from "../ErrorBoundary";

// Problematic component that intentionally throws an error
function ProblemChild({ shouldThrow }) {
  if (shouldThrow) {
    throw new Error("Simulated component error!");
  }
  return <div>Healthy Child Content</div>;
}

describe("ErrorBoundary component", () => {
  // Suppress console.error in tests for expected errors
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  it("renders child content normally when no error occurs", () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Healthy Child Content")).toBeInTheDocument();
  });

  it("catches runtime errors and renders fallback UI with retry button", () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("toggles error log details on button click", () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    const toggleBtn = screen.getByRole("button", { name: /view error logs/i });
    fireEvent.click(toggleBtn);

    expect(screen.getByText(/Simulated component error!/i)).toBeInTheDocument();
  });
});
