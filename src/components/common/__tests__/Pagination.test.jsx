import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Pagination } from "../Pagination";

const previous = () => screen.getByRole("button", { name: /previous page/i });
const next = () => screen.getByRole("button", { name: /next page/i });

describe("the range it reports", () => {
  it("counts from one, not from zero", () => {
    render(<Pagination page={1} pageSize={50} total={50011} />);
    expect(screen.getByText("1-50 of 50011")).toBeDefined();
  });

  it("reports the range of the page you are actually on", () => {
    render(<Pagination page={3} pageSize={50} total={50011} />);
    expect(screen.getByText("101-150 of 50011")).toBeDefined();
  });

  it("stops the last page at the total rather than running past it", () => {
    render(<Pagination page={3} pageSize={50} total={120} />);
    expect(screen.getByText("101-120 of 120")).toBeDefined();
  });

  it("shows 0-0 when there is nothing, not 1-0", () => {
    render(<Pagination page={1} pageSize={50} total={0} />);
    expect(screen.getByText("0-0 of 0")).toBeDefined();
  });

  it("survives a zero page size instead of dividing by it", () => {
    render(<Pagination page={1} pageSize={0} total={10} />);
    expect(screen.getByText(/of 10/)).toBeDefined();
  });
});

describe("moving between pages", () => {
  it("goes forward and back", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} pageSize={10} total={100} onPageChange={onPageChange} />);

    fireEvent.click(next());
    expect(onPageChange).toHaveBeenCalledWith(3);

    fireEvent.click(previous());
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("disables the way back on the first page", () => {
    render(<Pagination page={1} pageSize={10} total={100} />);
    expect(previous().disabled).toBe(true);
    expect(next().disabled).toBe(false);
  });

  it("disables the way forward on the last page", () => {
    render(<Pagination page={10} pageSize={10} total={100} />);
    expect(next().disabled).toBe(true);
    expect(previous().disabled).toBe(false);
  });

  it("disables both when everything fits on one page", () => {
    render(<Pagination page={1} pageSize={50} total={12} />);
    expect(previous().disabled).toBe(true);
    expect(next().disabled).toBe(true);
  });

  it("never asks for a page past the end", () => {
    // Clamped here rather than trusted to the caller: asking a server-paged
    // table for page 11 of 10 returns nothing, which reads as "no results"
    // rather than as an off-by-one.
    const onPageChange = vi.fn();
    render(<Pagination page={10} pageSize={10} total={100} onPageChange={onPageChange} />);
    fireEvent.click(next());
    expect(onPageChange).not.toHaveBeenCalledWith(11);
  });

  it("never asks for page zero", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={1} pageSize={10} total={100} onPageChange={onPageChange} />);
    fireEvent.click(previous());
    expect(onPageChange).not.toHaveBeenCalledWith(0);
  });
});

describe("rows per page", () => {
  it("is offered only when a caller can act on it", () => {
    // The callback used to be accepted and silently ignored, so a caller
    // wiring it up got no control and no error.
    const { rerender } = render(<Pagination page={1} pageSize={10} total={100} />);
    expect(screen.queryByLabelText("Rows per page")).toBeNull();

    rerender(<Pagination page={1} pageSize={10} total={100} onPageSizeChange={vi.fn()} />);
    expect(screen.getByLabelText("Rows per page")).toBeDefined();
  });

  it("reports the new size as a number, not the string from the option", () => {
    const onPageSizeChange = vi.fn();
    render(<Pagination page={1} pageSize={10} total={100} onPageSizeChange={onPageSizeChange} />);

    fireEvent.change(screen.getByLabelText("Rows per page"), { target: { value: "50" } });
    expect(onPageSizeChange).toHaveBeenCalledWith(50);
  });

  it("offers the sizes it is given", () => {
    render(
      <Pagination page={1} pageSize={25} total={100} pageSizeOptions={[25, 75]} onPageSizeChange={vi.fn()} />
    );
    expect(screen.getByRole("option", { name: "25" })).toBeDefined();
    expect(screen.getByRole("option", { name: "75" })).toBeDefined();
    expect(screen.queryByRole("option", { name: "10" })).toBeNull();
  });
});

describe("fitting on a phone", () => {
  it("gives its arrows a touch target, stepping back down on a pointer device", () => {
    // 26px arrows are a coin-flip to hit with a thumb. Same mobile-first idiom
    // Button uses, so the desktop control is unchanged.
    render(<Pagination page={2} pageSize={10} total={100} />);

    expect(previous().className).toContain("h-control-lg");
    expect(previous().className).toContain("md:h-6.5");
  });

  it("drops the visible 'Rows per page' text on a narrow screen", () => {
    // This row plus a column chooser is wider than a 375px screen, which
    // pushed the last control clean off the right edge.
    render(<Pagination page={1} pageSize={10} total={100} onPageSizeChange={() => {}} />);

    expect(screen.getByText("Rows per page").className).toContain("hidden");
    expect(screen.getByText("Rows per page").className).toContain("md:inline");
  });

  it("still names the size selector for a screen reader", () => {
    // Hiding the visible label must not take the accessible one with it.
    render(<Pagination page={1} pageSize={10} total={100} onPageSizeChange={() => {}} />);

    expect(screen.getByLabelText("Rows per page")).toBeDefined();
  });

  it("wraps rather than overflowing when it runs out of room", () => {
    render(<Pagination page={1} pageSize={10} total={100} />);

    expect(screen.getByRole("navigation", { name: /pagination/i }).className).toContain("flex-wrap");
  });
});

describe("accessibility", () => {
  it("is a labelled navigation landmark", () => {
    render(<Pagination page={1} pageSize={10} total={100} />);
    expect(screen.getByRole("navigation", { name: /pagination/i })).toBeDefined();
  });

  it("labels its arrows, which are otherwise just icons", () => {
    render(<Pagination page={1} pageSize={10} total={100} />);
    expect(previous()).toBeDefined();
    expect(next()).toBeDefined();
  });
});
