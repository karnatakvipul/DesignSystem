import * as React from "react";
import { getApiClient } from "./apiClient";
import { createAuthService } from "./authService";

/**
 * @typedef {"checking" | "authenticated" | "unauthenticated"} AuthStatus
 *
 * @typedef {Object} AuthContextValue
 * @property {AuthStatus} status
 * @property {*} user Whatever the session endpoint returns.
 * @property {boolean} checking True only during the first check on load.
 * @property {string | null} expiredMessage Set when the server ended the
 *   session, as opposed to the user signing out. Show it once, then call
 *   `clearExpiredMessage`.
 * @property {(username: string, password: string) => Promise<void>} login
 * @property {() => Promise<void>} logout
 * @property {() => void} clearExpiredMessage
 */

const AuthContext = React.createContext(null);

const DEFAULT_EXPIRED_MESSAGE = "Your session has expired. Please sign in again.";

/**
 * Holds the signed-in session for the whole app.
 *
 * A session can end for reasons this tab never sees — it expires, an admin
 * revokes it, someone signs out in another tab — so a tab that only learns
 * about it when a user next clicks something will happily show a signed-in
 * interface over a dead session. Three things are watched:
 *
 *  1. **Reactively.** Any 401 anywhere in the app means the session is gone.
 *     The client broadcasts it; this subscribes.
 *  2. **Proactively.** While signed in, the session is re-checked on a timer
 *     and whenever the tab regains focus, so an idle tab notices on its own.
 *  3. **Across tabs.** If the stored id is cleared elsewhere, this tab follows.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {ReturnType<import("./authService").createAuthService>} [props.authService]
 * @param {number} [props.sessionCheckIntervalMs] How often to re-check. Default 30s.
 * @param {string} [props.expiredMessage] Shown when the server ends the session.
 */
export function AuthProvider({
  children,
  authService: authServiceProp,
  sessionCheckIntervalMs = 30_000,
  expiredMessage: expiredMessageText = DEFAULT_EXPIRED_MESSAGE,
}) {
  const [status, setStatus] = React.useState(/** @type {AuthStatus} */ ("checking"));
  const [user, setUser] = React.useState(null);
  const [expiredMessage, setExpiredMessage] = React.useState(/** @type {string | null} */ (null));

  const statusRef = React.useRef(status);
  statusRef.current = status;

  const client = getApiClient();

  // Built once when not supplied, so it does not become a new object every
  // render and retrigger every effect that depends on it.
  const fallbackService = React.useMemo(() => createAuthService(), []);
  const auth = authServiceProp ?? fallbackService;

  const forceLogout = React.useCallback((message) => {
    setUser(null);
    setStatus("unauthenticated");
    if (message) setExpiredMessage(message);
  }, []);

  const bootstrap = React.useCallback(async () => {
    setStatus("checking");
    try {
      const session = await auth.getSession();
      setUser(session ?? null);
      setStatus(session ? "authenticated" : "unauthenticated");
    } catch {
      // Missing, expired or invalid — that is "signed out", not an error worth
      // showing someone who has just opened the app.
      setUser(null);
      setStatus("unauthenticated");
    }
  }, [auth]);

  React.useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // 1. Reactive.
  React.useEffect(() => {
    return client.onUnauthorized((message) => {
      if (statusRef.current !== "unauthenticated") {
        forceLogout(message || expiredMessageText);
      }
    });
  }, [client, forceLogout, expiredMessageText]);

  // 2. Proactive.
  React.useEffect(() => {
    if (status !== "authenticated") return undefined;

    let cancelled = false;
    let inFlight = false;

    async function revalidate() {
      // The timer, window focus and visibility change can all fire within a few
      // milliseconds of each other — alt-tabbing back just as the timer ticks
      // does exactly that. This keeps it to one request rather than three.
      if (inFlight) return;
      inFlight = true;
      try {
        const session = await auth.getSession();
        if (!cancelled && !session) forceLogout(expiredMessageText);
      } catch {
        // A real 401 already came through the subscription above. Anything
        // else here is most likely a blip in the network, and signing someone
        // out over a dropped packet would be worse than doing nothing.
      } finally {
        inFlight = false;
      }
    }

    const intervalId = window.setInterval(revalidate, sessionCheckIntervalMs);
    function onVisible() {
      if (document.visibilityState === "visible") revalidate();
    }

    window.addEventListener("focus", revalidate);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", revalidate);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [status, auth, forceLogout, sessionCheckIntervalMs, expiredMessageText]);

  // 3. Across tabs.
  React.useEffect(() => {
    const key = client.tokenStorageKey;
    function onStorage(e) {
      if (e.key === key && !e.newValue && statusRef.current === "authenticated") {
        // No message: the tab where this happened has already explained it, or
        // the user signed out there deliberately.
        forceLogout(null);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [client, forceLogout]);

  const login = React.useCallback(
    async (username, password) => {
      await auth.login(username, password);
      try {
        setUser(await auth.getSession());
      } catch {
        // Sign-in itself worked and we hold a session id; a failed follow-up
        // read of the profile is not a reason to bounce someone back out.
        setUser(null);
      }
      setExpiredMessage(null);
      setStatus("authenticated");
    },
    [auth]
  );

  const logout = React.useCallback(async () => {
    try {
      await auth.logout();
    } finally {
      setUser(null);
      setExpiredMessage(null);
      setStatus("unauthenticated");
    }
  }, [auth]);

  const clearExpiredMessage = React.useCallback(() => setExpiredMessage(null), []);

  const value = React.useMemo(
    () => ({
      status,
      user,
      checking: status === "checking",
      expiredMessage,
      login,
      logout,
      clearExpiredMessage,
    }),
    [status, user, expiredMessage, login, logout, clearExpiredMessage]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Reads the session. Throws outside an `AuthProvider`, which is a wiring bug. */
export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
