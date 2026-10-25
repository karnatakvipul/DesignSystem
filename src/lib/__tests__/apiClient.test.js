import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createApiClient, ApiError } from "../apiClient";

/** A storage stand-in, so tests never touch real localStorage. */
function fakeStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
}

/** Queues responses for successive fetch calls. */
function stubFetch(...responses) {
  const calls = [];
  const fn = vi.fn(async (url, init) => {
    calls.push({ url, init });
    const next = responses.shift() ?? { status: 200, body: { success: true, data: null } };
    return {
      ok: next.status >= 200 && next.status < 300,
      status: next.status,
      text: async () => (next.body === undefined ? "" : JSON.stringify(next.body)),
    };
  });
  fn.calls = calls;
  return fn;
}

let originalFetch;
beforeEach(() => {
  originalFetch = globalThis.fetch;
});
afterEach(() => {
  globalThis.fetch = originalFetch;
});

function client(overrides = {}) {
  return createApiClient({ baseUrl: "http://api.test", storage: fakeStorage(), ...overrides });
}

describe("request", () => {
  it("unwraps the envelope's data", async () => {
    globalThis.fetch = stubFetch({ status: 200, body: { success: true, data: { id: 7 } } });
    await expect(client().request("/api/things")).resolves.toEqual({ id: 7 });
  });

  it("returns the raw body when there is no envelope", async () => {
    globalThis.fetch = stubFetch({ status: 200, body: [1, 2, 3] });
    await expect(client().request("/api/things")).resolves.toEqual([1, 2, 3]);
  });

  it("returns null for an empty 200, rather than throwing on the parse", async () => {
    globalThis.fetch = stubFetch({ status: 200, body: undefined });
    await expect(client().request("/api/things")).resolves.toBeNull();
  });

  it("prefixes the base URL", async () => {
    const fetchStub = (globalThis.fetch = stubFetch());
    await client().request("/api/things");
    expect(fetchStub.calls[0].url).toBe("http://api.test/api/things");
  });

  it("sends the stored token as a bearer header", async () => {
    const fetchStub = (globalThis.fetch = stubFetch());
    const api = client();
    api.setToken("abc123");
    await api.request("/api/things");
    expect(fetchStub.calls[0].init.headers.Authorization).toBe("Bearer abc123");
  });

  it("omits the header when asked to skip auth, even holding a token", async () => {
    const fetchStub = (globalThis.fetch = stubFetch());
    const api = client();
    api.setToken("abc123");
    await api.request("/api/Auth/login", { method: "POST", body: {}, skipAuth: true });
    expect(fetchStub.calls[0].init.headers.Authorization).toBeUndefined();
  });
});

describe("failures", () => {
  it("throws the server's own message, not the status line", async () => {
    globalThis.fetch = stubFetch({
      status: 400,
      body: { success: false, message: "Another user already uses that email." },
    });
    await expect(client().request("/api/users")).rejects.toThrow("Another user already uses that email.");
  });

  it("carries the status and errors on the thrown ApiError", async () => {
    globalThis.fetch = stubFetch({
      status: 422,
      body: { success: false, message: "Invalid", errors: ["name is required"], statusCode: 422 },
    });
    const err = await client().request("/api/users").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(422);
    expect(err.errors).toEqual(["name is required"]);
  });

  it("reports an unreachable host as an ApiError rather than a raw TypeError", async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    });
    await expect(client().request("/api/things")).rejects.toBeInstanceOf(ApiError);
  });

  it("lets an abort through untouched, since that is the caller's own doing", async () => {
    globalThis.fetch = vi.fn(async () => {
      const err = new Error("aborted");
      err.name = "AbortError";
      throw err;
    });
    const err = await client().request("/api/things").catch((e) => e);
    expect(err.name).toBe("AbortError");
    expect(err).not.toBeInstanceOf(ApiError);
  });
});

describe("session rejection", () => {
  it("clears the token and notifies on a transport 401", async () => {
    globalThis.fetch = stubFetch({ status: 401, body: { success: false, message: "Session expired" } });
    const api = client();
    api.setToken("abc123");

    const heard = [];
    api.onUnauthorized((m) => heard.push(m));

    await api.request("/api/things").catch(() => {});
    expect(api.getToken()).toBeNull();
    expect(heard).toEqual(["Session expired"]);
  });

  it("also catches a 401 reported only inside the envelope", async () => {
    // Some backends answer 200 at the transport level and put the real status
    // in the body. Missing that would leave someone on a signed-in screen whose
    // every action fails.
    globalThis.fetch = stubFetch({
      status: 200,
      body: { success: false, statusCode: 401, message: "Session expired" },
    });
    const api = client();
    api.setToken("abc123");

    const heard = [];
    api.onUnauthorized((m) => heard.push(m));

    await api.request("/api/things").catch(() => {});
    expect(heard).toEqual(["Session expired"]);
  });

  it("does not treat a failed sign-in as a rejected session", async () => {
    // A wrong password is a 401 too. Broadcasting it would sign out the tab
    // that was only trying to sign in.
    globalThis.fetch = stubFetch({ status: 401, body: { success: false, message: "Bad credentials" } });
    const api = client();
    const heard = [];
    api.onUnauthorized((m) => heard.push(m));

    await api.request("/api/Auth/login", { skipAuth: true }).catch(() => {});
    expect(heard).toEqual([]);
  });

  it("stops notifying once unsubscribed", async () => {
    globalThis.fetch = stubFetch(
      { status: 401, body: { success: false, message: "one" } },
      { status: 401, body: { success: false, message: "two" } }
    );
    const api = client();
    api.setToken("t");
    const heard = [];
    const off = api.onUnauthorized((m) => heard.push(m));

    await api.request("/a").catch(() => {});
    off();
    api.setToken("t");
    await api.request("/b").catch(() => {});

    expect(heard).toEqual(["one"]);
  });
});

describe("configure", () => {
  it("keeps subscribers across reconfiguration", async () => {
    // An app may subscribe before it has finished configuring; dropping the
    // subscription there would leave it deaf to session expiry.
    const api = client();
    const heard = [];
    api.onUnauthorized((m) => heard.push(m));

    api.configure({ baseUrl: "http://other.test" });

    globalThis.fetch = stubFetch({ status: 401, body: { success: false, message: "gone" } });
    api.setToken("t");
    await api.request("/a").catch(() => {});

    expect(api.baseUrl).toBe("http://other.test");
    expect(heard).toEqual(["gone"]);
  });

  it("stores the token under the configured key", () => {
    const storage = fakeStorage();
    const api = createApiClient({ storage, tokenStorageKey: "my_key" });
    api.setToken("v");
    expect(storage.getItem("my_key")).toBe("v");
    expect(api.tokenStorageKey).toBe("my_key");
  });

  it("clears rather than storing the string 'null'", () => {
    const storage = fakeStorage();
    const api = createApiClient({ storage, tokenStorageKey: "k" });
    api.setToken("v");
    api.setToken(null);
    expect(storage.getItem("k")).toBeNull();
    expect(api.getToken()).toBeNull();
  });
});
