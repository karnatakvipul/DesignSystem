import { getApiClient } from "./apiClient";

/**
 * Sign-in, sign-out, session checks and password changes.
 *
 * Paired with `AuthProvider`, which owns the React state; this file owns the
 * requests. Split that way so the same calls can be made outside React — from
 * a route guard, or a script — without standing up a provider.
 *
 * @typedef {Object} SessionInfo
 * Whatever `GET /api/Auth/session` returns. Deliberately untyped beyond this:
 * the fields differ per deployment, so read them with optional chaining.
 */

/** The endpoints, overridable for a backend that names them differently. */
export const DEFAULT_AUTH_ROUTES = {
  login: "/api/Auth/login",
  logout: "/api/Auth/logout",
  session: "/api/Auth/session",
  changePassword: "/api/Auth/change-password",
};

/**
 * Finds the session id in a login response.
 *
 * Checks the common field names rather than assuming one, because this is the
 * single value the entire signed-in session depends on and the shape varies
 * between backends. Guessing wrong here fails at sign-in with a confusing
 * message; checking costs nothing.
 */
function extractSessionId(data) {
  if (!data) return null;
  if (typeof data === "string") return data;
  return data.sessionId || data.session_id || data.sessionID || data.token || null;
}

/**
 * Builds an auth service.
 *
 * @param {Object} [config]
 * @param {ReturnType<import("./apiClient").createApiClient>} [config.client] Defaults to the shared client.
 * @param {Partial<typeof DEFAULT_AUTH_ROUTES>} [config.routes]
 */
export function createAuthService({ client, routes } = {}) {
  const api = client ?? getApiClient();
  const paths = { ...DEFAULT_AUTH_ROUTES, ...routes };

  return {
    /**
     * Signs in and persists the returned session id.
     * @returns {Promise<{ sessionId: string, raw: * }>}
     */
    async login(username, password) {
      const data = await api.request(paths.login, {
        method: "POST",
        body: { username, password },
        skipAuth: true,
      });

      const sessionId = extractSessionId(data);
      if (!sessionId) {
        throw new Error(
          "Sign-in succeeded but no session id was found in the response. " +
            "Check the response shape against extractSessionId in authService."
        );
      }

      api.setToken(sessionId);
      return { sessionId, raw: data };
    },

    /**
     * Validates the stored session.
     *
     * Returns null rather than throwing when nothing is stored, so this doubles
     * as the silent "am I signed in?" check on app load.
     * @returns {Promise<SessionInfo | null>}
     */
    async getSession() {
      if (!api.getToken()) return null;
      return api.request(paths.session, { method: "GET" });
    },

    /**
     * Sets a new password for the signed-in user.
     *
     * @param {string} newPassword
     * @param {string} [currentPassword] Required unless the account has none yet.
     */
    async changePassword(newPassword, currentPassword = "") {
      return api.request(paths.changePassword, {
        method: "POST",
        body: { currentPassword, newPassword },
      });
    },

    /**
     * Signs out, clearing the stored session id whether or not the request
     * succeeds — a session the server has stopped honouring is not worth
     * keeping on this side either.
     */
    async logout() {
      try {
        if (api.getToken()) {
          await api.request(paths.logout, { method: "POST" });
        }
      } finally {
        api.clearToken();
      }
    },
  };
}

/** The auth service for the shared client, which is what most apps want. */
export const authService = createAuthService();

export const login = (username, password) => authService.login(username, password);
export const logout = () => authService.logout();
export const getSession = () => authService.getSession();
export const changePassword = (newPassword, currentPassword) =>
  authService.changePassword(newPassword, currentPassword);
