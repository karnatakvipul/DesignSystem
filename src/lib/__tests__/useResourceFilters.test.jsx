import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useResourceFilters } from "../useResourceFilters";
import { PageFilterProvider, useHeaderFilters } from "../PageFilterContext";
import { configureApiClient } from "../apiClient";
import { BottomSheet } from "../../components/common/BottomSheet";

/**
 * The hook exists to make one arrangement unreachable and another automatic:
 * the panel is published to the shell rather than rendered in the page, and the
 * options come from the server rather than from the rows on screen.
 *
 * The render-loop guard is the part worth holding hardest. An unmemoised config
 * publishes on every render, which re-renders the provider, which renders the
 * page again — a loop that only shows up once a real page is wired to it.
 */

const distinct = {
  account: ["Acme Corp", "Beta LLC"],
  status: ["Active", "Expired"],
};

let fetchCalls = [];

beforeEach(() => {
  fetchCalls = [];
  globalThis.fetch = vi.fn(async (url) => {
    fetchCalls.push(String(url));
    const field = new URL(String(url), "http://localhost").searchParams.get("field");
    return {
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => distinct[field] ?? [],
    };
  });
  configureApiClient({ baseUrl: "" });
});

afterEach(() => {
  vi.restoreAllMocks();
});

/**
 * Past this many renders the component is looping, not settling.
 *
 * Throwing is the point. A republish-every-render loop starves the event loop,
 * so `waitFor`'s own timeout never fires and the run hangs instead of failing —
 * a test that can never go red. A hard ceiling turns it into a normal failure.
 */
const RENDER_CEILING = 25;

/** Renders the hook inside a provider and exposes what the shell would see. */
function Harness({ fieldSpec, filters, setFilters, renders, rows }) {
  renders?.();
  if (renders && renders.mock.calls.length > RENDER_CEILING) {
    throw new Error("render loop: useResourceFilters republished on every render");
  }
  const result = useResourceFilters({
    path: "/api/licenses",
    // Rebuilt here on purpose, so every render hands the hook a new array of
    // new objects — exactly what a page writing an array literal in its body
    // does, and the case the memoisation has to survive.
    fields: fieldSpec.map((field) => ({ ...field })),
    filters,
    setFilters,
    // Rebuilt every render for the same reason as the fields: a page writing
    // `rows={data.filter(...)}` hands over a new array of new objects each
    // time, and compared by identity that restarts the publish loop.
    rows: rows ? rows.map((row) => ({ ...row })) : undefined,
  });
  return <div data-testid="mobile">{result.mobileFilterOptions}</div>;
}

function Shell() {
  const config = useHeaderFilters();
  if (!config) return <p>no filters published</p>;
  return (
    <div>
      <span data-testid="count">{config.activeCount}</span>
      <div data-testid="panel">{config.children}</div>
      {/* Named apart from the sheet's own Search/Clear, which render in the
          same tree — otherwise a query for "Clear" finds both. */}
      <button onClick={config.onApply}>Apply from shell</button>
      <button onClick={config.onClear}>Clear from shell</button>
    </div>
  );
}

function setup({ filters = {}, setFilters = vi.fn(), fields, renders = vi.fn() } = {}) {
  const view = render(
    <PageFilterProvider>
      <Harness
        fieldSpec={fields ?? [{ key: "account", label: "Account" }, { key: "status", label: "Status" }]}
        filters={filters}
        setFilters={setFilters}
        renders={renders}
      />
      <Shell />
    </PageFilterProvider>
  );
  return { ...view, setFilters, renders };
}

describe("publishing to the shell", () => {
  it("puts the fields where the shell can render them", async () => {
    setup();

    await waitFor(() => {
      expect(screen.getByTestId("panel")).toHaveTextContent("Account");
    });
    expect(screen.getByTestId("panel")).toHaveTextContent("Status");
  });

  it("settles instead of republishing forever on an inline field list", async () => {
    // The whole reason the hook memoises. Without the guard this renders until
    // the stack gives out.
    const renders = vi.fn();
    setup({ renders });

    await waitFor(() => expect(screen.getByTestId("panel")).toHaveTextContent("Account"));

    // Snapshot only once the option fetches have landed. They resolve after the
    // first paint and legitimately cause one more render, so taking the count
    // before that made this fail whenever the suite ran busy enough to reorder
    // the two — a timing flake dressed up as a loop.
    await waitFor(() => expect(fetchCalls.length).toBe(2));
    await act(() => new Promise((r) => setTimeout(r, 50)));
    const settled = renders.mock.calls.length;

    await act(() => new Promise((r) => setTimeout(r, 80)));

    expect(renders.mock.calls.length).toBe(settled);
    expect(settled).toBeLessThan(RENDER_CEILING);
  });

  it("withdraws them when the page goes away", async () => {
    const { unmount } = setup();
    await waitFor(() => expect(screen.getByTestId("panel")).toBeInTheDocument());

    unmount();

    // Re-rendered on its own, the shell finds nothing — which is what keeps the
    // previous page's filters out of the header after navigating.
    render(
      <PageFilterProvider>
        <Shell />
      </PageFilterProvider>
    );
    expect(screen.getByText("no filters published")).toBeInTheDocument();
  });
});

describe("where the options come from", () => {
  it("asks the server, not the rows on screen", async () => {
    setup();

    await waitFor(() => expect(fetchCalls.length).toBeGreaterThan(0));
    expect(fetchCalls.some((u) => u.includes("/api/licenses/distinct?field=account"))).toBe(true);
    expect(fetchCalls.some((u) => u.includes("/api/licenses/distinct?field=status"))).toBe(true);
  });

  it("asks once per column, not once per render", async () => {
    setup();
    await waitFor(() => expect(fetchCalls.length).toBe(2));

    await act(() => new Promise((r) => setTimeout(r, 60)));

    expect(fetchCalls.length).toBe(2);
  });

  it("lets a field bring its own options instead", async () => {
    setup({
      fields: [
        { key: "status", label: "Status", options: [{ value: "", label: "All" }, { value: "Active", label: "Active" }] },
      ],
    });

    await waitFor(() => expect(screen.getByTestId("panel")).toHaveTextContent("Status"));
    // A field that supplies its own values needs nothing fetched for it.
    expect(fetchCalls.some((u) => u.includes("field=status"))).toBe(true);
  });
});

describe("a screen that still holds its own rows", () => {
  const rows = [
    { id: 1, account: "Zeta Ltd", status: "Active" },
    { id: 2, account: "Acme Corp", status: "Expired" },
    { id: 3, account: "Acme Corp", status: "Active" },
  ];

  function renderWithRows(rowsProp) {
    const renders = vi.fn();
    render(
      <PageFilterProvider>
        <Harness
          fieldSpec={[{ key: "account", label: "Account" }]}
          filters={{}}
          setFilters={vi.fn()}
          renders={renders}
          rows={rowsProp}
        />
        <Shell />
      </PageFilterProvider>
    );
    return renders;
  }

  it("takes its options from the rows rather than the server", async () => {
    // The server's full set would name values these rows do not hold, and
    // picking one would empty a table that is filtering in memory.
    renderWithRows(rows);

    await waitFor(() => expect(screen.getByTestId("panel")).toHaveTextContent("Account"));
    expect(fetchCalls).toHaveLength(0);
  });

  it("offers each value once, in order", async () => {
    renderWithRows(rows);
    await waitFor(() => expect(screen.getByTestId("panel")).toHaveTextContent("Account"));

    fireEvent.click(screen.getByTestId("panel").querySelector("button"));

    const listed = [...document.querySelectorAll('[role="option"]')].map((o) => o.textContent.trim());
    expect(listed).toEqual(["All", "Acme Corp", "Zeta Ltd"]);
  });

  it("settles even when handed a fresh array every render", async () => {
    // A page writing `rows={data.filter(...)}` hands over a new array each time.
    // Compared by identity that restarts the publish loop.
    const renders = renderWithRows(rows.map((r) => ({ ...r })));

    await waitFor(() => expect(screen.getByTestId("panel")).toHaveTextContent("Account"));
    await act(() => new Promise((r) => setTimeout(r, 50)));
    const settled = renders.mock.calls.length;

    await act(() => new Promise((r) => setTimeout(r, 80)));

    expect(renders.mock.calls.length).toBe(settled);
    expect(settled).toBeLessThan(RENDER_CEILING);
  });

  it("survives rows being empty", async () => {
    renderWithRows([]);

    await waitFor(() => expect(screen.getByTestId("panel")).toHaveTextContent("Account"));
    expect(fetchCalls).toHaveLength(0);
  });
});

describe("draft, then apply", () => {
  it("does not filter while a dropdown is being changed", async () => {
    const setFilters = vi.fn();
    setup({ setFilters });
    await waitFor(() => expect(screen.getByTestId("panel")).toHaveTextContent("Account"));

    // Opening the panel and picking a value must not refetch on its own; at
    // fifty thousand rows that is one query per keystroke.
    expect(setFilters).not.toHaveBeenCalled();
  });

  it("applies what was drafted when Search is pressed", async () => {
    const setFilters = vi.fn();
    setup({ setFilters });
    await waitFor(() => expect(screen.getByTestId("panel")).toHaveTextContent("Account"));

    fireEvent.click(screen.getByText("Apply from shell"));

    expect(setFilters).toHaveBeenCalledTimes(1);
  });

  it("clears both the draft and the applied filters", async () => {
    const setFilters = vi.fn();
    setup({ filters: { account: "Acme Corp" }, setFilters });
    await waitFor(() => expect(screen.getByTestId("panel")).toHaveTextContent("Account"));

    fireEvent.click(screen.getByText("Clear from shell"));

    expect(setFilters).toHaveBeenCalledWith({});
  });

  it("counts only the filters that are actually set", async () => {
    setup({ filters: { account: "Acme Corp", status: "" } });

    await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("1"));
  });

  it("reports nothing active when nothing is set", async () => {
    setup({ filters: {} });

    await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("0"));
  });
});

describe("the mobile sheet", () => {
  it("dismisses the sheet after applying, so the rows are visible", async () => {
    // Applying a filter and leaving the sheet covering the rows it narrowed
    // reads as the button having done nothing.
    const close = vi.fn();
    const setFilters = vi.fn();
    render(
      <PageFilterProvider>
        <BottomSheet open onClose={close} title="Filter">
          <Harness
            fieldSpec={[{ key: "account", label: "Account" }]}
            filters={{}}
            setFilters={setFilters}
          />
        </BottomSheet>
        <Shell />
      </PageFilterProvider>
    );

    await waitFor(() => expect(screen.getByText("Search")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Search"));

    expect(setFilters).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("still filters when rendered outside a sheet", async () => {
    const setFilters = vi.fn();
    setup({ setFilters });
    await waitFor(() => expect(screen.getByTestId("mobile")).toHaveTextContent("Search"));

    fireEvent.click(screen.getByText("Search"));

    expect(setFilters).toHaveBeenCalledTimes(1);
  });

  it("carries its own Search and Clear, since the sheet has no footer", async () => {
    setup();
    await waitFor(() => expect(screen.getByTestId("panel")).toHaveTextContent("Account"));

    const sheet = screen.getByTestId("mobile");
    expect(sheet).toHaveTextContent("Search");
    expect(sheet).toHaveTextContent("Clear");
  });

  it("offers the same fields as the header panel", async () => {
    setup();
    await waitFor(() => expect(screen.getByTestId("panel")).toHaveTextContent("Account"));

    expect(screen.getByTestId("mobile")).toHaveTextContent("Account");
    expect(screen.getByTestId("mobile")).toHaveTextContent("Status");
  });
});

describe("edges", () => {
  it("survives being given no fields", async () => {
    setup({ fields: [] });

    await waitFor(() => expect(screen.getByTestId("count")).toBeInTheDocument());
    expect(fetchCalls).toHaveLength(0);
  });

  it("survives filters being undefined", async () => {
    render(
      <PageFilterProvider>
        <Harness
          fieldSpec={[{ key: "account", label: "Account" }]}
          filters={undefined}
          setFilters={vi.fn()}
        />
        <Shell />
      </PageFilterProvider>
    );

    await waitFor(() => expect(screen.getByTestId("count")).toHaveTextContent("0"));
  });
});
