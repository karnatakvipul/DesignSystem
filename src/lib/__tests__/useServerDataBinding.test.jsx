import * as React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useServerDataBinding } from "../useServerDataBinding";

/** Renders the hook and exposes what it returned, plus a way to drive it. */
function Harness({ hookOptions, onReady }) {
  const binding = useServerDataBinding(hookOptions);
  onReady(binding);
  return (
    <div>
      <span data-testid="rows">{binding.data.map((r) => r.id).join(",")}</span>
      <span data-testid="total">{binding.total}</span>
      <span data-testid="page">{binding.page}</span>
      <span data-testid="loading">{String(binding.loading)}</span>
      <span data-testid="fetching">{String(binding.isFetching)}</span>
      <span data-testid="error">{binding.error ?? ""}</span>
    </div>
  );
}

function setup(fetcher, options = {}) {
  let latest;
  render(
    <Harness
      hookOptions={{ fetcher, debounceMs: 0, initialPageSize: 2, ...options }}
      onReady={(b) => {
        latest = b;
      }}
    />
  );
  return () => latest;
}

const rows = (...ids) => ({ data: ids.map((id) => ({ id })), total: 100 });

describe("fetching", () => {
  it("fetches once on mount and reports the server's total", async () => {
    const fetcher = vi.fn(async () => rows(1, 2));
    setup(fetcher);

    await waitFor(() => expect(screen.getByTestId("rows")).toHaveTextContent("1,2"));
    expect(screen.getByTestId("total")).toHaveTextContent("100");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("passes the query state to the fetcher", async () => {
    const fetcher = vi.fn(async () => rows(1));
    const get = setup(fetcher, { initialSortKey: "name", initialSortDirection: "desc" });

    await waitFor(() => expect(fetcher).toHaveBeenCalled());
    expect(fetcher.mock.calls[0][0]).toMatchObject({
      page: 1,
      pageSize: 2,
      sortKey: "name",
      sortDirection: "desc",
    });
    expect(get().pageCount).toBe(50);
  });

  it("reports a failure without wiping what is on screen", async () => {
    let shouldFail = false;
    const fetcher = vi.fn(async () => {
      if (shouldFail) throw new Error("Server said no");
      return rows(1, 2);
    });
    const get = setup(fetcher);
    await waitFor(() => expect(screen.getByTestId("rows")).toHaveTextContent("1,2"));

    shouldFail = true;
    await act(async () => {
      await get().refetch();
    });

    expect(screen.getByTestId("error")).toHaveTextContent("Server said no");
    expect(screen.getByTestId("rows")).toHaveTextContent("1,2");
  });
});

describe("one request per change", () => {
  it("does not fire twice when a search resets the page", async () => {
    // Changing the query has to return to page 1. Doing that in an effect fired
    // one request for the stale page and another for page 1.
    const fetcher = vi.fn(async () => rows(1, 2));
    const get = setup(fetcher);

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));

    await act(async () => {
      get().setPage(4);
    });
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));

    await act(async () => {
      get().setSearch("acme");
    });

    // Wait for the request, not for the page number. The reset to page 1
    // happens during render and the fetch is debounced behind it, so there is a
    // window where the page already reads 1 and nothing has been asked for yet.
    // Waiting on the page made this pass or fail on how busy the machine was.
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(3));

    expect(screen.getByTestId("page")).toHaveTextContent("1");
    expect(fetcher.mock.calls[2][0]).toMatchObject({ page: 1, search: "acme" });

    // And no second one behind it. The bug this guards fired twice: once for
    // the stale page, once for page 1. Catching that needs a look after things
    // have settled, since the extra request arrives late by definition.
    await new Promise((resolve) => setTimeout(resolve, 120));
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it("debounces typing into a single request", async () => {
    const fetcher = vi.fn(async () => rows(1));
    const get = setup(fetcher, { debounceMs: 50 });
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));

    await act(async () => {
      get().setSearch("a");
      get().setSearch("ac");
      get().setSearch("acm");
      get().setSearch("acme");
    });

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2), { timeout: 1000 });
    expect(fetcher.mock.calls[1][0].search).toBe("acme");
  });
});

describe("cancellation", () => {
  it("gives the fetcher a signal", async () => {
    const fetcher = vi.fn(async () => rows(1));
    setup(fetcher);
    await waitFor(() => expect(fetcher).toHaveBeenCalled());
    expect(fetcher.mock.calls[0][0].signal).toBeInstanceOf(AbortSignal);
  });

  it("aborts a request the moment it is superseded", async () => {
    const signals = [];
    const fetcher = vi.fn(async ({ signal }) => {
      signals.push(signal);
      await new Promise((r) => setTimeout(r, 30));
      return rows(1);
    });
    const get = setup(fetcher);
    await waitFor(() => expect(signals).toHaveLength(1));

    await act(async () => {
      get().setPage(2);
    });
    await waitFor(() => expect(signals).toHaveLength(2));

    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);
  });

  it("does not report a cancellation as an error", async () => {
    const fetcher = vi.fn(async ({ signal }) => {
      await new Promise((resolve, reject) => {
        const t = setTimeout(resolve, 30);
        signal?.addEventListener("abort", () => {
          clearTimeout(t);
          const err = new Error("aborted");
          err.name = "AbortError";
          reject(err);
        });
      });
      return rows(1);
    });
    const onError = vi.fn();
    const get = setup(fetcher, { onError });

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    await act(async () => {
      get().setPage(2);
    });
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));

    expect(onError).not.toHaveBeenCalled();
    expect(screen.getByTestId("error")).toHaveTextContent("");
  });

  it("ignores a slow first answer that lands after a faster second one", async () => {
    let call = 0;
    const fetcher = vi.fn(async () => {
      call += 1;
      if (call === 1) {
        await new Promise((r) => setTimeout(r, 60));
        return { data: [{ id: "stale" }], total: 1 };
      }
      return { data: [{ id: "fresh" }], total: 1 };
    });
    const get = setup(fetcher);
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));

    await act(async () => {
      get().setPage(2);
    });

    await waitFor(() => expect(screen.getByTestId("rows")).toHaveTextContent("fresh"));
    await new Promise((r) => setTimeout(r, 80));
    expect(screen.getByTestId("rows")).toHaveTextContent("fresh");
  });
});

describe("keeping rows on screen", () => {
  it("shows a loading state only while there is nothing to display", async () => {
    const fetcher = vi.fn(async () => rows(1, 2));
    const get = setup(fetcher);

    await waitFor(() => expect(screen.getByTestId("rows")).toHaveTextContent("1,2"));
    expect(screen.getByTestId("loading")).toHaveTextContent("false");

    await act(async () => {
      get().setPage(2);
    });

    // Rows stay put; only the background indicator moves.
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    await waitFor(() => expect(screen.getByTestId("rows")).toHaveTextContent("1,2"));
  });

  it("does show a loading state on the very first fetch", async () => {
    const fetcher = vi.fn(async () => {
      await new Promise((r) => setTimeout(r, 20));
      return rows(1);
    });
    setup(fetcher);
    expect(screen.getByTestId("loading")).toHaveTextContent("true");
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
  });

  it("blanks between pages when asked to", async () => {
    const fetcher = vi.fn(async () => {
      await new Promise((r) => setTimeout(r, 20));
      return rows(1, 2);
    });
    const get = setup(fetcher, { keepPreviousData: false });
    await waitFor(() => expect(screen.getByTestId("rows")).toHaveTextContent("1,2"));

    await act(async () => {
      get().setPage(2);
    });
    expect(screen.getByTestId("loading")).toHaveTextContent("true");
  });
});

describe("filters", () => {
  it("drops a filter set to an empty value, which is what All means", async () => {
    const fetcher = vi.fn(async () => rows(1));
    const get = setup(fetcher);
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));

    await act(async () => {
      get().setFilter("status", "Active");
    });
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
    expect(fetcher.mock.calls[1][0].filters).toEqual({ status: "Active" });

    await act(async () => {
      get().setFilter("status", "");
    });
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(3));
    expect(fetcher.mock.calls[2][0].filters).toEqual({});
  });

  it("returns to page 1 when a filter changes", async () => {
    const fetcher = vi.fn(async () => rows(1));
    const get = setup(fetcher);
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));

    await act(async () => {
      get().setPage(3);
    });
    await waitFor(() => expect(screen.getByTestId("page")).toHaveTextContent("3"));

    await act(async () => {
      get().setFilter("status", "Active");
    });
    await waitFor(() => expect(screen.getByTestId("page")).toHaveTextContent("1"));
  });
});
