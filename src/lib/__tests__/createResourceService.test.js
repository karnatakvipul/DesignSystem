import { describe, it, expect, vi } from "vitest";
import { createResourceService } from "../createResourceService";
import { ApiError } from "../apiClient";

/** A client stand-in that records calls and returns whatever is queued. */
function fakeClient(handler) {
  const calls = [];
  return {
    calls,
    request: vi.fn(async (path, options) => {
      calls.push({ path, options });
      return handler(path, options);
    }),
  };
}

const DEMO = [
  { id: 1, name: "Alpha", status: "Active" },
  { id: 2, name: "Beta", status: "Expired" },
  { id: 3, name: "Gamma", status: "Active" },
];

describe("query string", () => {
  it("sends the parameters the backend reads", async () => {
    const client = fakeClient(async () => ({ items: [], total: 0 }));
    const svc = createResourceService({ path: "/api/things", client });

    await svc.list({
      page: 3,
      pageSize: 25,
      sortKey: "name",
      sortDirection: "desc",
      search: "abc",
      filters: { status: "Active" },
    });

    const url = new URL("http://x" + client.calls[0].path);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      page: "3",
      limit: "25",
      sortKey: "name",
      sortDir: "desc",
      q: "abc",
      filter_status: "Active",
    });
  });

  it("joins a multi-value filter with commas for the server to split", async () => {
    const client = fakeClient(async () => ({ items: [], total: 0 }));
    const svc = createResourceService({ path: "/api/things", client });

    await svc.list({ filters: { status: ["Active", "Expired"] } });

    expect(client.calls[0].path).toContain("filter_status=Active%2CExpired");
  });

  it("leaves empty filters out entirely, since empty means 'not set'", async () => {
    const client = fakeClient(async () => ({ items: [], total: 0 }));
    const svc = createResourceService({ path: "/api/things", client });

    await svc.list({ filters: { status: "", account: null, site: undefined } });

    expect(client.calls[0].path).toBe("/api/things");
  });
});

describe("list shapes", () => {
  it("reads { items, total }", async () => {
    const client = fakeClient(async () => ({ items: [{ id: 1 }], total: 940 }));
    const svc = createResourceService({ path: "/api/things", client });
    await expect(svc.list()).resolves.toEqual({ items: [{ id: 1 }], total: 940 });
  });

  it("falls back to the row count for a bare array, which carries no total", async () => {
    const client = fakeClient(async () => [{ id: 1 }, { id: 2 }]);
    const svc = createResourceService({ path: "/api/things", client });
    await expect(svc.list()).resolves.toEqual({ items: [{ id: 1 }, { id: 2 }], total: 2 });
  });
});

describe("demo fallback", () => {
  function failing(status) {
    return fakeClient(async () => {
      throw new ApiError("nope", { status });
    });
  }

  it("serves demo records when the endpoint is missing", async () => {
    const svc = createResourceService({ path: "/api/things", demoData: DEMO, client: failing(404) });
    const { total } = await svc.list();
    expect(total).toBe(3);
    expect(svc.isDemo()).toBe(true);
  });

  it("treats an unreachable host as 'not built yet'", async () => {
    const client = fakeClient(async () => {
      throw new TypeError("Failed to fetch");
    });
    const svc = createResourceService({ path: "/api/things", demoData: DEMO, client });
    await expect(svc.list()).resolves.toMatchObject({ total: 3 });
  });

  it("never hides an auth failure behind plausible-looking rows", async () => {
    // Answering a 401 with demo data is worse than answering it with an error:
    // the screen looks like it worked.
    for (const status of [401, 403]) {
      const svc = createResourceService({ path: "/api/things", demoData: DEMO, client: failing(status) });
      await expect(svc.list()).rejects.toThrow();
      expect(svc.isDemo()).toBe(false);
    }
  });

  it("does not read a cancelled request as a missing endpoint", async () => {
    // Typing in a search box aborts the previous request. If that abort reads
    // as "not built yet", the screen latches into demo mode for the rest of the
    // session while the real backend sits there working.
    const client = fakeClient(async () => {
      const err = new Error("aborted");
      err.name = "AbortError";
      throw err;
    });
    const svc = createResourceService({ path: "/api/things", demoData: DEMO, client });

    await expect(svc.list()).rejects.toMatchObject({ name: "AbortError" });
    expect(svc.isDemo()).toBe(false);
  });

  it("surfaces failures once the fallback is disabled", async () => {
    const svc = createResourceService({
      path: "/api/things",
      demoData: DEMO,
      client: failing(404),
      disableFallback: true,
    });
    await expect(svc.list()).rejects.toThrow();
  });

  it("never calls the backend at all under forceDemo", async () => {
    const client = fakeClient(async () => ({ items: [], total: 0 }));
    const svc = createResourceService({ path: "/api/things", demoData: DEMO, client, forceDemo: true });
    await svc.list();
    expect(client.request).not.toHaveBeenCalled();
  });

  it("latches, so one screen does not retry a dead endpoint on every keystroke", async () => {
    const client = failing(404);
    const svc = createResourceService({ path: "/api/things", demoData: DEMO, client });
    await svc.list();
    await svc.list();
    await svc.list();
    expect(client.request).toHaveBeenCalledTimes(1);
  });

  it("does not let edits leak back into the shared seed array", async () => {
    const seed = [{ id: 1, name: "Alpha" }];
    const svc = createResourceService({ path: "/api/things", demoData: seed, client: failing(404) });
    await svc.list();
    await svc.update(1, { name: "Changed" });
    expect(seed[0].name).toBe("Alpha");
  });
});

describe("demo paging behaves like the server", () => {
  async function demoService() {
    const svc = createResourceService({
      path: "/api/things",
      demoData: DEMO,
      client: fakeClient(async () => {
        throw new ApiError("nope", { status: 404 });
      }),
    });
    await svc.list();
    return svc;
  }

  it("pages, reporting the full total rather than the slice length", async () => {
    const svc = await demoService();
    const { items, total } = await svc.list({ page: 2, pageSize: 2 });
    expect(items).toHaveLength(1);
    expect(total).toBe(3);
  });

  it("searches", async () => {
    const svc = await demoService();
    await expect(svc.list({ search: "bet" })).resolves.toMatchObject({ total: 1 });
  });

  it("filters", async () => {
    const svc = await demoService();
    await expect(svc.list({ filters: { status: "Active" } })).resolves.toMatchObject({ total: 2 });
  });

  it("sorts descending", async () => {
    const svc = await demoService();
    const { items } = await svc.list({ sortKey: "name", sortDirection: "desc" });
    expect(items.map((r) => r.name)).toEqual(["Gamma", "Beta", "Alpha"]);
  });
});

describe("writes", () => {
  it("PUTs an update to the record's own URL", async () => {
    const client = fakeClient(async () => ({}));
    const svc = createResourceService({ path: "/api/things", client });
    await svc.update(7, { name: "x" });
    expect(client.calls[0]).toMatchObject({ path: "/api/things/7", options: { method: "PUT" } });
  });

  it("encodes an id that is not URL-safe", async () => {
    const client = fakeClient(async () => ({}));
    const svc = createResourceService({ path: "/api/status-maps", client });
    await svc.remove("a/b c");
    expect(client.calls[0].path).toBe("/api/status-maps/a%2Fb%20c");
  });

  it("sends one bulk request rather than one per row", async () => {
    const client = fakeClient(async () => ({}));
    const svc = createResourceService({ path: "/api/things", client });
    await svc.updateMany([1, 2, 3], { status: "Deactivated" });
    expect(client.request).toHaveBeenCalledTimes(1);
    expect(client.calls[0]).toMatchObject({
      path: "/api/things/bulk",
      options: { method: "PATCH", body: { ids: [1, 2, 3], status: "Deactivated" } },
    });
  });
});

describe("distinct", () => {
  it("asks the server for a column's values", async () => {
    const client = fakeClient(async () => ["Active", "Expired"]);
    const svc = createResourceService({ path: "/api/licenses", client });
    await expect(svc.distinct("status")).resolves.toEqual(["Active", "Expired"]);
    expect(client.calls[0].path).toBe("/api/licenses/distinct?field=status");
  });

  it("derives them from the demo records when falling back", async () => {
    const svc = createResourceService({
      path: "/api/things",
      demoData: DEMO,
      client: fakeClient(async () => {
        throw new ApiError("nope", { status: 404 });
      }),
    });
    await expect(svc.distinct("status")).resolves.toEqual(["Active", "Expired"]);
  });
});
