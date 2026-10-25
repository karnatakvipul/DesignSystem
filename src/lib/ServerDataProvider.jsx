import * as React from "react";
import {
  createRestAdapter,
  createCreateAdapter,
  createUpdateAdapter,
  createDeleteAdapter,
} from "./serverDataAdapter";

const ServerDataContext = React.createContext(null);

/**
 * ServerDataProvider Component.
 * Enterprise context provider to configure global company REST/GraphQL endpoints for all imported library pages and components.
 *
 * @param {Object} props
 * @param {string} [props.baseUrl] Base URL for company API (e.g. "https://api.mycompany.com")
 * @param {Object|Function} [props.headers] Default HTTP headers (e.g. { Authorization: "Bearer token" }), or a (possibly async) function returning them — call this to read the current token/session at request time instead of baking one in when the provider mounts, e.g. `() => ({ Authorization: `Bearer ${getAccessToken()}` })`.
 * @param {Object} [props.endpoints] Endpoint path mapping. Every page below that supports server binding looks itself up by key: `licenses` (LicensePage), `users` (UsersPage), `licenseTypes`/`licenseTerms`/`productTypes` (LicenseTypePage/LicenseTermPage/ProductTypePage, and MasterListPage in general via its `endpointKey` prop), `reports` (ReportPage), `materials` (HomeDashboard). Any key you don't override falls back to `/api/${endpointKey}`, so you only need to list the ones that don't match that convention.
 * @param {Function} [props.fetcher] Custom global fetcher function ({ endpointKey, endpoint, params }) => Promise<{ data, total }>
 * @param {Function} [props.mutator] Custom global mutation function ({ endpointKey, endpoint, method, payload, id }) => Promise<any>
 * @param {React.ReactNode} props.children
 */
export function ServerDataProvider({
  baseUrl,
  headers,
  endpoints = {
    licenses: "/api/licenses",
    users: "/api/users",
    licenseTypes: "/api/license-types",
    licenseTerms: "/api/license-terms",
    productTypes: "/api/product-types",
    reports: "/api/reports",
    materials: "/api/materials",
  },
  fetcher,
  mutator,
  children,
}) {
  const getEndpointFetcher = React.useCallback(
    (endpointKey) => {
      const endpoint = endpoints[endpointKey] || `/api/${endpointKey}`;
      if (fetcher) {
        return (params) => fetcher({ endpointKey, endpoint, params });
      }
      if (baseUrl) {
        return createRestAdapter({
          baseUrl,
          endpoint,
          headers,
        });
      }
      return null;
    },
    [baseUrl, headers, endpoints, fetcher]
  );

  const getEndpointMutator = React.useCallback(
    (endpointKey) => {
      const endpoint = endpoints[endpointKey] || `/api/${endpointKey}`;
      if (mutator) {
        return (method, payload, id) => mutator({ endpointKey, endpoint, method, payload, id });
      }
      if (baseUrl) {
        return {
          create: createCreateAdapter({ baseUrl, endpoint, headers }),
          update: createUpdateAdapter({ baseUrl, endpoint, headers }),
          remove: createDeleteAdapter({ baseUrl, endpoint, headers }),
        };
      }
      return null;
    },
    [baseUrl, headers, endpoints, mutator]
  );

  const value = React.useMemo(
    () => ({
      baseUrl,
      headers,
      endpoints,
      fetcher,
      mutator,
      getEndpointFetcher,
      getEndpointMutator,
    }),
    [baseUrl, headers, endpoints, fetcher, mutator, getEndpointFetcher, getEndpointMutator]
  );

  return (
    <ServerDataContext.Provider value={value}>
      {children}
    </ServerDataContext.Provider>
  );
}

/**
 * Hook to consume global ServerDataContext.
 * @returns {Object|null}
 */
export function useServerDataContext() {
  return React.useContext(ServerDataContext);
}
