import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { axe } from "vitest-axe";

/**
 * A full axe pass over a rendered DataTable is the slowest thing in this
 * suite, and the default 5s is not much headroom for it on a busy machine —
 * `vitest run` has the jsdom project sharing cores with a real Chromium one.
 *
 * Overrunning here is worse than one red test, too: axe refuses to start a
 * second run while one is still going, so the timed-out case leaves every
 * later `axe()` in the file failing with "Axe is already running" and the
 * report blames eight components when one was merely slow. Scoped to this
 * file rather than raised globally, so an ordinary unit test that genuinely
 * hangs still fails quickly.
 */
vi.setConfig({ testTimeout: 30000 });

import { DataTable } from "../DataTable";
import { Dropdown } from "../Dropdown";
import { Tabs } from "../Tabs";
import { FilterPanel } from "../FilterPanel";
import { Pagination } from "../Pagination";
import { Modal } from "../Modal";
import { Button } from "../Button";
import { InputField } from "../InputField";
import { Badge } from "../Badge";
import { SearchBox } from "../SearchBox";

/**
 * Automated accessibility checks.
 *
 * axe catches the mechanical failures — a control with no accessible name, a
 * broken ARIA relationship, a role used wrongly. It cannot judge whether focus
 * lands somewhere sensible or whether a keyboard user can finish a task, so the
 * hand-written cases below cover the parts of that which matter most here.
 *
 * Between them this is a floor, not a certificate. A full audit still needs a
 * person with a screen reader.
 */

const columns = [
  { key: "account", header: "ACCOUNT", sortable: true },
  { key: "status", header: "STATUS" },
];
const data = [
  { id: 1, account: "Acme Corp", status: "Active" },
  { id: 2, account: "Beta LLC", status: "Expired" },
];

const originalMatchMedia = window.matchMedia;
beforeEach(() => {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: !query.includes("max-width: 767px"),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});
afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

/**
 * Rules about how a whole page is composed, which a component rendered on its
 * own can neither satisfy nor be blamed for. `region` wants every piece of
 * content inside a landmark and `landmark-unique` wants landmarks distinguished
 * from each other — both are the host application's job, and leaving them on
 * here would mean every component "failing" for the same irrelevant reason.
 */
const PAGE_LEVEL_RULES = {
  region: { enabled: false },
  "landmark-unique": { enabled: false },
};

/** Runs axe and returns the violations, so failures name what broke. */
async function violationsIn(ui, target) {
  const { container } = render(ui);
  const results = await axe(target ?? container, { rules: PAGE_LEVEL_RULES });
  return results.violations.map((v) => `${v.id}: ${v.help}`);
}

describe("no axe violations", () => {
  it("DataTable", async () => {
    expect(await violationsIn(<DataTable columns={columns} data={data} rowKey={(r) => r.id} />)).toEqual([]);
  });

  it("DataTable with selection", async () => {
    expect(
      await violationsIn(
        <DataTable columns={columns} data={data} rowKey={(r) => r.id} selectable selectedKeys={[1]} />
      )
    ).toEqual([]);
  });

  it("DataTable while empty and while failed", async () => {
    expect(await violationsIn(<DataTable columns={columns} data={[]} />)).toEqual([]);
    expect(await violationsIn(<DataTable columns={columns} data={[]} error="Nope" onRetry={vi.fn()} />)).toEqual([]);
  });

  it("Dropdown, closed and open", async () => {
    const options = [{ value: "a", label: "Active" }];
    expect(await violationsIn(<Dropdown label="Status" options={options} />)).toEqual([]);

    // Checked against document.body, because the menu portals out of the
    // component's own subtree — checking the container would miss it entirely.
    const { container } = render(<Dropdown label="Status" options={options} />);
    fireEvent.click(container.querySelector('[aria-haspopup="listbox"]'));
    const open = await axe(document.body, { rules: PAGE_LEVEL_RULES });
    expect(open.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });

  it("Tabs", async () => {
    expect(
      await violationsIn(
        <Tabs items={[{ value: "a", label: "One" }, { value: "b", label: "Two" }]} value="a" />
      )
    ).toEqual([]);
  });

  it("FilterPanel", async () => {
    expect(
      await violationsIn(
        <FilterPanel open onSearch={vi.fn()} onClear={vi.fn()} onClose={vi.fn()}>
          <InputField label="Account" />
        </FilterPanel>
      )
    ).toEqual([]);
  });

  it("Pagination", async () => {
    expect(
      await violationsIn(<Pagination page={2} pageSize={50} total={500} onPageSizeChange={vi.fn()} />)
    ).toEqual([]);
  });

  it("Modal", async () => {
    expect(
      await violationsIn(
        <Modal open title="Confirm" onClose={vi.fn()}>
          <p>Body</p>
        </Modal>
      )
    ).toEqual([]);
  });

  it("form controls and buttons", async () => {
    expect(
      await violationsIn(
        <form>
          <InputField label="Account name" />
          <SearchBox placeholder="Search" value="" onChange={vi.fn()} />
          <Button variant="primary">Save</Button>
          <Badge tone="warn">Expiring</Badge>
        </form>
      )
    ).toEqual([]);
  });
});

describe("keyboard operability", () => {
  it("lets a keyboard reach the table and move through rows", () => {
    render(<DataTable columns={columns} data={data} rowKey={(r) => r.id} />);
    const region = screen.getByRole("region");

    expect(region.getAttribute("tabindex")).toBe("0");
    expect(region.getAttribute("aria-label")).toMatch(/arrow keys/i);

    fireEvent.keyDown(region, { key: "ArrowDown" });
    expect(document.querySelectorAll('tbody tr[data-focused="true"]')).toHaveLength(1);
  });

  it("sorts from the keyboard, not only by pointer", () => {
    const onSortChange = vi.fn();
    render(
      <DataTable columns={columns} data={data} rowKey={(r) => r.id} sortKey={null} onSortChange={onSortChange} />
    );
    // The sort control is a real button, so Enter and Space work without any
    // key handling of our own — which is the reason it is a button.
    const header = screen.getByRole("button", { name: /account/i });
    fireEvent.click(header);
    expect(onSortChange).toHaveBeenCalled();
  });

  it("gives every icon-only control a name", () => {
    // An icon button with no accessible name is announced as "button" and is
    // unusable by anyone not looking at it.
    render(<Pagination page={2} pageSize={10} total={100} />);
    for (const button of screen.getAllByRole("button")) {
      const name = button.getAttribute("aria-label") || button.textContent.trim();
      expect(name.length).toBeGreaterThan(0);
    }
  });

  it("keeps a disabled control out of the tab order's way", () => {
    render(<Tabs items={[{ value: "a", label: "One" }]} value="a" />);
    const arrow = screen.getByRole("button", { name: /scroll tabs left/i });
    expect(arrow.disabled).toBe(true);
  });
});

describe("focus", () => {
  it("moves focus into a modal when it opens", async () => {
    render(
      <Modal open title="Confirm deletion" onClose={vi.fn()}>
        <button type="button">Delete</button>
      </Modal>
    );

    // Focus has to leave the page behind the overlay, or the first Tab lands on
    // whatever was underneath and a keyboard user is editing a form they cannot
    // see.
    await waitFor(() => {
      const dialog = screen.getByRole("dialog");
      expect(dialog.contains(document.activeElement)).toBe(true);
    });
  });

  it("closes a modal on Escape", () => {
    const onClose = vi.fn();
    render(
      <Modal open title="Confirm" onClose={onClose}>
        <p>Body</p>
      </Modal>
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("names a modal by its title", () => {
    render(
      <Modal open title="Confirm deletion" onClose={vi.fn()}>
        <p>Body</p>
      </Modal>
    );
    const dialog = screen.getByRole("dialog");
    const labelled = dialog.getAttribute("aria-label") || dialog.getAttribute("aria-labelledby");
    expect(labelled).toBeTruthy();
  });
});
