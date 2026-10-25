/**
 * The HTTP client every service in this library talks through.
 *
 * One place knows about the response envelope, the base URL, and the
 * `Authorization: Bearer <sessionId>` convention. Everything else calls
 * `apiRequest(...)` and gets back the already-unwrapped payload, or a thrown
 * `ApiError` carrying the server's real message.
 *
 * ── Configuring it ──────────────────────────────────────────────────────────
 *
 * A library cannot read the host app's environment variables, so the app hands
 * them over once at startup, before anything renders:
 *
 *   import { configureApiClient } from "my Design System";
 *
 *   configureApiClient({ baseUrl: import.meta.env.VITE_API_BASE_URL });
 *
 * Everything downstream — the auth service, resource services, the filter
 * dropdowns — picks that up automatically. An app talking to several backends
 * can build separate clients with `createApiClient` and pass them in explicitly
 * instead.
 *
 * @typedef {Object} ApiEnvelope
 * @property {boolean} success
 * @property {string} [message]
 * @property {*} data
 * @property {string[]} [errors]
 * @property {number} [statusCode]
 */

/** Error thrown by a request — carries the backend's own message and status. */
export class ApiError extends Error {
  constructor(message, { status, errors, statusCode } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.statusCode = statusCode;
    this.errors = errors || [];
  }
}

async function safeParseJson(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

const DEFAULT_CONFIG = {
  /** Empty means same-origin, which is the right default for a library. */
  baseUrl: "",
  /** Where the session id is persisted. */
  tokenStorageKey: "sls_session_id",
  /** Swap for sessionStorage, a cookie shim, or an in-memory stub in tests. */
  storage: null,
};

/**
 * Builds a client.
 *
 * Most apps want the shared default instead — see `configureApiClient`. Build
 * your own when one app talks to more than one backend, or in a test that needs
 * an isolated client with its own storage.
 *
 * @param {Object} [config]
 * @param {string} [config.baseUrl] Origin of the API. Empty for same-origin.
 * @param {string} [config.tokenStorageKey] Storage key for the session id.
 * @param {Storage} [config.storage] Defaults to `window.localStorage`.
 */
export function createApiClient(config = {}) {
  let settings = { ...DEFAULT_CONFIG, ...config };

  // Listeners live outside `settings` so reconfiguring a client never drops a
  // subscription. AuthProvider may well subscribe before the app has finished
  // configuring, and losing that would leave it deaf to session expiry.
  const unauthorizedListeners = new Set();

  function storage() {
    if (settings.storage) return settings.storage;
    if (typeof window === "undefined") return null;
    return window.localStorage;
  }

  const client = {
    /** Replaces some or all of the configuration, in place. */
    configure(next = {}) {
      settings = { ...settings, ...next };
      return client;
    },

    get baseUrl() {
      return settings.baseUrl;
    },

    /** Exposed so a provider can watch for cross-tab `storage` events on it. */
    get tokenStorageKey() {
      return settings.tokenStorageKey;
    },

    /** The persisted session id, or null when signed out. */
    getToken() {
      return storage()?.getItem(settings.tokenStorageKey) ?? null;
    },

    /** Persists a session id; passing null clears it. */
    setToken(token) {
      const store = storage();
      if (!store) return;
      if (token) store.setItem(settings.tokenStorageKey, token);
      else store.removeItem(settings.tokenStorageKey);
    },

    clearToken() {
      client.setToken(null);
    },

    /**
     * Subscribes to "the server rejected this session".
     *
     * Any authenticated request that comes back 401 means the session is dead,
     * whichever page or button happened to trigger it. Since every request
     * funnels through here, this is the one place that can notice — the
     * alternative is each caller handling it, which in practice means one
     * request failing quietly while the rest of the app carries on as if
     * signed in.
     *
     * @param {(message: string) => void} listener
     * @returns {() => void} unsubscribe
     */
    onUnauthorized(listener) {
      unauthorizedListeners.add(listener);
      return () => unauthorizedListeners.delete(listener);
    },

    /**
     * Performs a request and returns the unwrapped payload, or throws
     * `ApiError` — for a backend-reported failure or a network-level one such
     * as an unreachable host or an untrusted certificate.
     *
     * @param {string} path e.g. "/api/licenses"
     * @param {Object} [options]
     * @param {"GET"|"POST"|"PATCH"|"PUT"|"DELETE"} [options.method]
     * @param {*} [options.body] JSON-serialisable request body
     * @param {Object} [options.headers] Extra headers
     * @param {boolean} [options.skipAuth] Send no Authorization header
     * @param {AbortSignal} [options.signal]
     */
    async request(path, { method = "GET", body, headers, skipAuth = false, signal } = {}) {
      const url = `${settings.baseUrl}${path}`;
      const requestHeaders = {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      };

      if (!skipAuth) {
        const token = client.getToken();
        if (token) requestHeaders.Authorization = `Bearer ${token}`;
      }

      let response;
      try {
        response = await fetch(url, {
          method,
          headers: requestHeaders,
          body: body !== undefined ? JSON.stringify(body) : undefined,
          signal,
        });
      } catch (err) {
        // An abort is the caller changing its mind, not a failure — rethrow it
        // untouched so `signal.aborted` checks upstream still work.
        if (err?.name === "AbortError") throw err;
        throw new ApiError(
          `Unable to reach the API at ${settings.baseUrl || window.location.origin}. ` +
            "Check your connection, that the server is running, and that its certificate is trusted."
        );
      }

      /** @type {ApiEnvelope | null} */
      const envelope = await safeParseJson(response);
      const success =
        envelope && typeof envelope.success === "boolean" ? envelope.success : response.ok;

      if (!success) {
        const message =
          envelope?.message ||
          envelope?.errors?.[0] ||
          `Request failed with status ${response.status}`;

        // Checked in two places on purpose. `response.status` is the transport
        // status, but some backends answer 200 at the transport level and put
        // the real status inside the envelope. Treating either as a rejected
        // session is the safe reading — the cost of missing one is a user
        // stuck on a screen whose every action fails.
        const isUnauthorized =
          !skipAuth && (response.status === 401 || envelope?.statusCode === 401);

        if (isUnauthorized) {
          client.clearToken();
          unauthorizedListeners.forEach((listener) => listener(message));
        }

        throw new ApiError(message, {
          status: response.status,
          statusCode: envelope?.statusCode,
          errors: envelope?.errors,
        });
      }

      // Not every endpoint uses the envelope, and a 200 with an empty body is
      // legitimate; fall back to whatever was parsed.
      return envelope && "data" in envelope ? envelope.data : envelope;
    },
  };

  return client;
}

/**
 * The shared client.
 *
 * Created up front rather than on first use so that subscriptions and tokens
 * survive configuration: an app can subscribe, configure, and sign in in any
 * order without a half-built client appearing in between.
 */
const defaultClient = createApiClient();

/**
 * Points the shared client at a backend. Call once, before rendering.
 *
 * @param {Object} config Same shape as `createApiClient`.
 * @returns the shared client, for chaining
 */
export function configureApiClient(config) {
  return defaultClient.configure(config);
}

/** The shared client, for passing to services that accept one. */
export function getApiClient() {
  return defaultClient;
}

/** Performs a request through the shared client. */
export function apiRequest(path, options) {
  return defaultClient.request(path, options);
}

/** Subscribes to session rejection on the shared client. */
export function onUnauthorized(listener) {
  return defaultClient.onUnauthorized(listener);
}

/** The shared client's stored session id, or null. */
export function getStoredSessionId() {
  return defaultClient.getToken();
}

/** Persists a session id on the shared client. */
export function setStoredSessionId(sessionId) {
  defaultClient.setToken(sessionId);
}

/** Clears the shared client's stored session id. */
export function clearStoredSessionId() {
  defaultClient.clearToken();
}
