import { ApiError, getApiClient } from "./apiClient";

/**
 * Builds a CRUD service for one backend resource.
 *
 * A page talks to one of these rather than holding records in component state,
 * so moving a screen from demo data to a real backend is configuration rather
 * than a rewrite.
 *
 * ── The demo fallback ───────────────────────────────────────────────────────
 *
 * Before an endpoint exists, `list()` fails — unreachable host, 404, 501. Given
 * `demoData`, the service quietly serves an in-memory copy instead and keeps
 * doing so for the rest of the session, so create, update and delete still
 * behave while a screen is being built. Once the endpoint answers, the fallback
 * never fires again and no page code changes.
 *
 * That behaviour is useful exactly once, while a backend is being written, and
 * actively harmful afterwards: a real outage looks like a working app holding
 * stale rows. Pass `disableFallback: true` as soon as the backend is real.
 *
 * @param {Object} config
 * @param {string} config.path Endpoint base, e.g. "/api/licenses"
 * @param {Array} [config.demoData] Records to serve until the endpoint exists
 * @param {string} [config.idKey="id"] Field holding each record's identifier
 * @param {string} [config.label] Human name, used in error messages
 * @param {ReturnType<import("./apiClient").createApiClient>} [config.client]
 * @param {boolean} [config.forceDemo] Never call the backend at all
 * @param {boolean} [config.disableFallback] Let failures surface as failures
 */
export function createResourceService({
  path,
  demoData = [],
  idKey = "id",
  label,
  client,
  forceDemo = false,
  disableFallback = false,
}) {
  const api = client ?? getApiClient();
  const name = label || path;

  // Session-scoped copy, cloned so edits never leak back into the shared seed
  // arrays a caller may be reusing across services.
  let demoStore = null;
  let usingDemo = forceDemo;

  function seedDemo() {
    if (demoStore === null) demoStore = demoData.map((r) => ({ ...r }));
    return demoStore;
  }

  /**
   * True when a failure means "this endpoint is not built yet" rather than
   * "that request was wrong".
   *
   * Auth failures and validation errors must never fall through to demo data.
   * Answering a 401 with a screen full of plausible-looking records is worse
   * than answering it with an error.
   */
  function isEndpointMissing(err) {
    if (disableFallback) return false;

    // A cancelled request says nothing about the endpoint — the caller simply
    // stopped wanting the answer. Without this, typing in a search box aborts
    // the previous request, that abort reads as "not built yet", and the screen
    // latches into demo mode for the rest of the session while the real backend
    // is sitting there working.
    if (err?.name === "AbortError") return false;

    if (!(err instanceof ApiError)) return true; // network, DNS or TLS
    const status = err.status ?? err.statusCode;
    if (status === 401 || status === 403) return false;
    return status === 404 || status === 501 || status === 502 || status === 503 || status === undefined;
  }

  function nextId() {
    const rows = seedDemo();
    const numeric = rows.map((r) => Number(r[idKey])).filter((n) => Number.isFinite(n));
    return numeric.length > 0 ? Math.max(...numeric) + 1 : Date.now();
  }

  /** Unwraps the list shapes a backend might return. */
  function toArray(data) {
    if (Array.isArray(data)) return data;
    return data?.items || data?.records || data?.data || [];
  }

  /**
   * Builds the query string for a list request.
   *
   * The names match what `createRestAdapter` sends — `page`, `limit`,
   * `sortKey`, `sortDir`, `q`, `filter_<field>` — so a backend written against
   * either one works with both. A filter holding several values is joined with
   * commas for the server to split and match any of.
   */
  function toQueryString({ page, pageSize, sortKey, sortDirection, search, filters } = {}) {
    const query = new URLSearchParams();

    if (page) query.set("page", String(page));
    if (pageSize) query.set("limit", String(pageSize));
    if (sortKey) {
      query.set("sortKey", sortKey);
      query.set("sortDir", sortDirection === "desc" ? "desc" : "asc");
    }
    if (search) query.set("q", search);

    Object.entries(filters || {}).forEach(([field, value]) => {
      const joined = Array.isArray(value) ? value.join(",") : value;
      if (joined !== undefined && joined !== null && joined !== "") {
        query.set(`filter_${field}`, String(joined));
      }
    });

    const encoded = query.toString();
    return encoded ? `?${encoded}` : "";
  }

  /**
   * Pages, sorts, searches and filters the demo records, so the fallback
   * behaves like the server. Returning everything unpaged instead would make
   * the table look broken in a different way from the one being worked around.
   */
  function demoPage(params = {}) {
    const { page = 1, pageSize = 50, sortKey, sortDirection, search, filters } = params;
    let rows = seedDemo().map((r) => ({ ...r }));

    if (search) {
      const needle = String(search).toLowerCase();
      rows = rows.filter((row) =>
        Object.values(row).some((v) => typeof v === "string" && v.toLowerCase().includes(needle))
      );
    }

    Object.entries(filters || {}).forEach(([field, value]) => {
      if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) return;
      if (typeof value === "string" && value.includes("..")) {
        const [fromStr, toStr] = value.split("..");
        const fromDate = fromStr ? new Date(fromStr) : null;
        if (fromDate) fromDate.setHours(0, 0, 0, 0);
        const toDate = toStr ? new Date(toStr) : null;
        if (toDate) toDate.setHours(23, 59, 59, 999);
        rows = rows.filter((row) => {
          const rowVal = row[field];
          if (!rowVal) return false;
          const rowDate = new Date(rowVal);
          if (isNaN(rowDate.getTime())) return true;
          if (fromDate && rowDate < fromDate) return false;
          if (toDate && rowDate > toDate) return false;
          return true;
        });
        return;
      }
      const accepted = (Array.isArray(value) ? value : [value]).map((v) => String(v).toLowerCase());
      if (field === "product") {
        rows = rows.filter((row) => {
          const prod = String(
            row.product ||
            (row.type?.startsWith("EF-") || row.licenseType?.startsWith("EF-") ? "EnviroFRONT" :
             row.type?.startsWith("OC-") || row.licenseType?.startsWith("OC-") ? "OCEMS" :
             row.type?.startsWith("SF-") || row.licenseType?.startsWith("SF-") ? "SolarFRONT" : "")
          ).toLowerCase();
          return accepted.includes(prod);
        });
        return;
      }
      rows = rows.filter((row) => accepted.includes(String(row[field]).toLowerCase()));
    });

    if (sortKey) {
      const direction = sortDirection === "desc" ? -1 : 1;
      rows.sort(
        (a, b) => String(a[sortKey] ?? "").localeCompare(String(b[sortKey] ?? "")) * direction
      );
    }

    const start = (page - 1) * pageSize;
    return { items: rows.slice(start, start + pageSize), total: rows.length };
  }

  async function withFallback(apiCall, demoCall) {
    if (usingDemo) return demoCall();
    try {
      return await apiCall();
    } catch (err) {
      if (isEndpointMissing(err)) {
        // Latched, so one screen does not retry a dead endpoint on every
        // keystroke and interaction.
        usingDemo = true;
        return demoCall();
      }
      throw err;
    }
  }

  return {
    path,
    idKey,

    /** Whether this service is currently serving demo records. */
    isDemo: () => usingDemo,

    /**
     * Fetches one page.
     *
     * Paging, sorting, search and filtering happen in SQL, so what comes back
     * is the rows being displayed plus a total — never the whole table.
     *
     * @param {Object} [params] page, pageSize, sortKey, sortDirection, search, filters
     * @param {AbortSignal} [params.signal] Cancels a request the caller no longer needs.
     * @returns {Promise<{ items: Array, total: number }>}
     */
    async list(params) {
      // Pulled out so it travels as a fetch option rather than a query
      // parameter — otherwise every keystroke produces a different URL and
      // nothing downstream can cache.
      const { signal, ...query } = params ?? {};
      return withFallback(
        async () => {
          const data = await api.request(`${path}${toQueryString(query)}`, { method: "GET", signal });
          const items = toArray(data);

          // A bare array — an endpoint predating paging — carries no total of
          // its own, and the row count is the closest honest answer.
          return { items, total: typeof data?.total === "number" ? data.total : items.length };
        },
        () => demoPage(query)
      );
    },

    /**
     * The values a column actually holds, for a filter dropdown.
     *
     * Reading options off the rows on screen stops being right the moment
     * paging moves to the server: fifty rows in hand offer only the handful of
     * values that happened to land on page one.
     */
    async distinct(field) {
      return withFallback(
        async () => {
          const data = await api.request(
            `${path}/distinct?field=${encodeURIComponent(field)}`,
            { method: "GET" }
          );
          return Array.isArray(data) ? data : [];
        },
        () => [...new Set(seedDemo().map((r) => r[field]).filter((v) => v != null && v !== ""))]
      );
    },

    async create(payload) {
      return withFallback(
        () => api.request(path, { method: "POST", body: payload }),
        () => {
          const record = { ...payload, [idKey]: payload?.[idKey] ?? nextId() };
          seedDemo().unshift(record);
          return { ...record };
        }
      );
    },

    async update(id, payload) {
      return withFallback(
        () => api.request(`${path}/${encodeURIComponent(id)}`, { method: "PUT", body: payload }),
        () => {
          const rows = seedDemo();
          const i = rows.findIndex((r) => String(r[idKey]) === String(id));
          if (i === -1) throw new Error(`${name}: record ${id} not found`);
          rows[i] = { ...rows[i], ...payload };
          return { ...rows[i] };
        }
      );
    },

    async remove(id) {
      return withFallback(
        () => api.request(`${path}/${encodeURIComponent(id)}`, { method: "DELETE" }),
        () => {
          const rows = seedDemo();
          const i = rows.findIndex((r) => String(r[idKey]) === String(id));
          if (i !== -1) rows.splice(i, 1);
          return { success: true };
        }
      );
    },

    /**
     * Applies one patch to many records — a single PATCH against a live
     * backend, applied row by row against the demo store.
     */
    async updateMany(ids, payload) {
      return withFallback(
        () => api.request(`${path}/bulk`, { method: "PATCH", body: { ids, ...payload } }),
        () => {
          const rows = seedDemo();
          ids.forEach((id) => {
            const i = rows.findIndex((r) => String(r[idKey]) === String(id));
            if (i !== -1) rows[i] = { ...rows[i], ...payload };
          });
          return { success: true };
        }
      );
    },

    /**
     * Deletes many records at once — a single bulk DELETE against a live
     * backend, applied row by row against the demo store.
     *
     * `payload` rides along in the request body (e.g. a deletion reason or
     * ticket number) exactly as `updateMany`'s does; the demo fallback has
     * nowhere to persist it, since a deleted row keeps no trace of why.
     */
    async removeMany(ids, payload) {
      return withFallback(
        () => api.request(`${path}/bulk`, { method: "DELETE", body: { ids, ...payload } }),
        () => {
          demoStore = seedDemo().filter((r) => !ids.map(String).includes(String(r[idKey])));
          return { success: true };
        }
      );
    },
  };
}
