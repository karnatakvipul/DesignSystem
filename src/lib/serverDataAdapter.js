/**
 * REST API Adapter utilities for Server-Side Data Binding.
 * Allows easy integration with backend REST endpoints (Spring Boot, Express, Django, Laravel, ASP.NET).
 */

/**
 * Resolves a `headers` config value into a plain headers object. Accepts:
 *  - a plain object (used as-is)
 *  - a sync function `() => object` (e.g. reading a token from memory/storage)
 *  - an async function `() => Promise<object>` (e.g. refreshing an expiring token first)
 * This lets every adapter below stay in sync with auth tokens that rotate over
 * the app's lifetime, instead of only supporting a header object frozen at the
 * moment `ServerDataProvider`/the adapter factory was created.
 *
 * @param {Object|Function} headers
 * @returns {Promise<Object>}
 */
async function resolveHeaders(headers) {
  if (typeof headers === "function") {
    const resolved = await headers();
    return resolved || {};
  }
  return headers || {};
}

/**
 * Reads a fetch Response body defensively: many REST APIs return an empty
 * body (e.g. 204 No Content on DELETE, or a bare 201/202 on create/update),
 * which would otherwise throw "Unexpected end of JSON input" from a naive
 * `response.json()` call. Falls back to `null` for an empty body.
 *
 * @param {Response} response
 * @returns {Promise<any>}
 */
async function safeParseJson(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    // Body wasn't JSON (e.g. a plain-text confirmation) — return the raw text
    // rather than throwing, so callers can still see *something* useful.
    return text;
  }
}

/**
 * Builds a descriptive Error for a non-OK fetch response, preferring any
 * message the backend sent (e.g. `{ message: "..." }` or `{ error: "..." }`
 * validation payloads) over a generic "HTTP 400: Bad Request" string, since
 * that message is usually what ends up surfaced directly in the UI via a
 * page's `onToast` callback.
 *
 * @param {Response} response
 * @returns {Promise<Error>}
 */
async function buildResponseError(response) {
  let detail = "";
  try {
    const body = await safeParseJson(response);
    if (body && typeof body === "object") {
      detail = body.message || body.error || body.detail || "";
    } else if (typeof body === "string") {
      detail = body;
    }
  } catch {
    // Ignore body-read failures — fall back to the generic message below.
  }
  const message = detail || `Server returned HTTP ${response.status}: ${response.statusText}`;
  const error = new Error(message);
  error.status = response.status;
  return error;
}

/**
 * Creates a standard REST API fetcher function compatible with `useServerDataBinding` or `ServerDataTable`.
 *
 * @param {Object} config
 * @param {string} config.baseUrl Base URL for API server (e.g., "https://api.example.com")
 * @param {string} [config.endpoint=""] Endpoint path (e.g., "/api/licenses")
 * @param {Object|Function} [config.headers] Custom HTTP headers, or a (possibly async) function returning them — e.g. `() => ({ Authorization: `Bearer ${getToken()}` })`, useful when tokens rotate/refresh.
 * @param {Function} [config.formatParams] Custom parameter formatter (params) => Record<string, string>
 * @param {Function} [config.parseResponse] Custom response parser (json) => { data: Array, total: number }
 * @returns {Function} Async fetcher function
 */
export function createRestAdapter({
  baseUrl,
  endpoint = "",
  headers = {},
  formatParams,
  parseResponse,
} = {}) {
  return async function restFetcher(params) {
    const defaultParams = {
      page: String(params.page ?? 1),
      limit: String(params.pageSize ?? 10),
    };

    if (params.sortKey) {
      defaultParams.sortKey = params.sortKey;
      defaultParams.sortDir = params.sortDirection || "asc";
    }

    if (params.search) {
      defaultParams.q = params.search;
    }

    if (params.filters && typeof params.filters === "object") {
      Object.entries(params.filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          defaultParams[`filter_${key}`] = String(val);
        }
      });
    }

    const queryParams = formatParams ? formatParams(params, defaultParams) : defaultParams;
    // Normalize baseUrl + endpoint so endpoint paths with a leading "/" do not
    // discard a baseUrl that contains a path (e.g. baseUrl "https://api.x.com/v1").
    const base = (baseUrl || (typeof window !== "undefined" ? window.location.origin : "http://localhost")).replace(/\/+$/, "");
    const url = new URL(endpoint.replace(/^\/+/, ""), `${base}/`);

    Object.entries(queryParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.append(k, String(v));
      }
    });

    const resolvedHeaders = await resolveHeaders(headers);
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...resolvedHeaders,
      },
    });

    if (!response.ok) {
      throw await buildResponseError(response);
    }

    const json = (await safeParseJson(response)) ?? {};

    if (parseResponse) {
      return parseResponse(json);
    }

    // Default response parsing for standard backend formats
    const data = Array.isArray(json) ? json : json.data || json.items || json.records || [];
    const total = typeof json.total === "number" ? json.total : typeof json.count === "number" ? json.count : data.length;

    return { data, total };
  };
}

/**
 * Generic helper to execute an HTTP request with query parameters.
 *
 * @param {string} url
 * @param {Object} [queryParams={}]
 * @param {Object} [fetchOptions={}] Standard fetch options. `headers` may also be a (possibly async) function returning a headers object.
 * @returns {Promise<any>}
 */
export async function fetchServerData(url, queryParams = {}, fetchOptions = {}) {
  const fullUrl = new URL(url, typeof window !== "undefined" ? window.location.origin : "http://localhost");

  Object.entries(queryParams).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") {
      fullUrl.searchParams.append(k, String(v));
    }
  });

  const { headers: optionHeaders, ...restOptions } = fetchOptions;
  const resolvedHeaders = await resolveHeaders(optionHeaders);

  const res = await fetch(fullUrl.toString(), {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...resolvedHeaders,
    },
  });

  if (!res.ok) {
    throw await buildResponseError(res);
  }

  return safeParseJson(res);
}

/**
 * Creates a REST mutation function for CREATE (POST) operations.
 * Compatible with the `onCreate` prop of LicensePage, UsersPage, and MasterListPage.
 *
 * @param {Object} config
 * @param {string} config.baseUrl Base URL for API server (e.g., "https://api.example.com")
 * @param {string} [config.endpoint=""] Endpoint path (e.g., "/api/licenses")
 * @param {Object|Function} [config.headers] Custom HTTP headers, or a (possibly async) function returning them.
 * @param {Function} [config.parseResponse] Custom response parser (json) => any
 * @returns {Function} Async function (payload) => Promise<any>
 */
export function createCreateAdapter({
  baseUrl,
  endpoint = "",
  headers = {},
  parseResponse,
} = {}) {
  return async function createFetcher(payload) {
    const base = (baseUrl || (typeof window !== "undefined" ? window.location.origin : "http://localhost")).replace(/\/+$/, "");
    const url = new URL(endpoint.replace(/^\/+/, ""), `${base}/`);

    const resolvedHeaders = await resolveHeaders(headers);
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...resolvedHeaders,
      },
      body: JSON.stringify(payload ?? {}),
    });

    if (!response.ok) {
      throw await buildResponseError(response);
    }

    const json = await safeParseJson(response);
    return parseResponse ? parseResponse(json) : json;
  };
}

/**
 * Creates a REST mutation function for UPDATE (PUT/PATCH) operations.
 * Compatible with the `onUpdate` prop of LicensePage, UsersPage, and MasterListPage.
 *
 * @param {Object} config
 * @param {string} config.baseUrl Base URL for API server (e.g., "https://api.example.com")
 * @param {string} [config.endpoint=""] Endpoint path (e.g., "/api/licenses")
 * @param {string} [config.method="PATCH"] HTTP method for updates ("PUT" or "PATCH")
 * @param {Object|Function} [config.headers] Custom HTTP headers, or a (possibly async) function returning them.
 * @param {Function} [config.getId] Function to extract the record id from the entity (entity) => id. Defaults to (entity) => entity?.id
 * @param {Function} [config.parseResponse] Custom response parser (json) => any
 * @returns {Function} Async function (entityOrId, payload) => Promise<any>
 */
export function createUpdateAdapter({
  baseUrl,
  endpoint = "",
  method = "PATCH",
  headers = {},
  getId = (entity) => entity?.id,
  parseResponse,
} = {}) {
  return async function updateFetcher(entityOrId, payload) {
    const id = typeof entityOrId === "object" && entityOrId !== null ? getId(entityOrId) : entityOrId;
    const base = (baseUrl || (typeof window !== "undefined" ? window.location.origin : "http://localhost")).replace(/\/+$/, "");
    const url = new URL(endpoint.replace(/^\/+/, ""), `${base}/`);
    if (id !== undefined && id !== null) {
      url.pathname = url.pathname.replace(/\/+$/, "") + `/${encodeURIComponent(id)}`;
    }

    const resolvedHeaders = await resolveHeaders(headers);
    const response = await fetch(url.toString(), {
      method,
      headers: {
        "Content-Type": "application/json",
        ...resolvedHeaders,
      },
      body: JSON.stringify(payload ?? {}),
    });

    if (!response.ok) {
      throw await buildResponseError(response);
    }

    const json = await safeParseJson(response);
    return parseResponse ? parseResponse(json) : json;
  };
}

/**
 * Creates a REST mutation function for DELETE operations.
 * Compatible with the `onDelete` prop of LicensePage, UsersPage, and MasterListPage.
 *
 * @param {Object} config
 * @param {string} config.baseUrl Base URL for API server (e.g., "https://api.example.com")
 * @param {string} [config.endpoint=""] Endpoint path (e.g., "/api/licenses")
 * @param {Object|Function} [config.headers] Custom HTTP headers, or a (possibly async) function returning them.
 * @param {Function} [config.getId] Function to extract the record id from the entity (entity) => id. Defaults to (entity) => entity?.id
 * @param {Function} [config.parseResponse] Custom response parser (json) => any
 * @returns {Function} Async function (entityOrId) => Promise<any>
 */
export function createDeleteAdapter({
  baseUrl,
  endpoint = "",
  headers = {},
  getId = (entity) => entity?.id,
  parseResponse,
} = {}) {
  return async function deleteFetcher(entityOrId) {
    const id = typeof entityOrId === "object" && entityOrId !== null ? getId(entityOrId) : entityOrId;
    const base = (baseUrl || (typeof window !== "undefined" ? window.location.origin : "http://localhost")).replace(/\/+$/, "");
    const url = new URL(endpoint.replace(/^\/+/, ""), `${base}/`);
    if (id !== undefined && id !== null) {
      url.pathname = url.pathname.replace(/\/+$/, "") + `/${encodeURIComponent(id)}`;
    }

    const resolvedHeaders = await resolveHeaders(headers);
    const response = await fetch(url.toString(), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...resolvedHeaders,
      },
    });

    if (!response.ok) {
      throw await buildResponseError(response);
    }

    // Many APIs return 204 No Content (or an empty 200) for DELETE — don't
    // treat an empty body as an error, just resolve with whatever was there.
    const json = await safeParseJson(response);
    return parseResponse ? parseResponse(json) : json;
  };
}
