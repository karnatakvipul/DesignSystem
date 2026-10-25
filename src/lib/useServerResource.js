import * as React from "react";
import { useServerDataBinding } from "./useServerDataBinding";

/**
 * Binds a page to a resource, with paging, sorting, search and filtering all
 * done by the server.
 *
 * The alternative — fetch every row, then page and sort it in the browser — is
 * fine for a few hundred records and falls apart well before a hundred
 * thousand: the whole table has to be downloaded, parsed and held in memory,
 * and every keystroke re-scans all of it.
 *
 * Reads come from `useServerDataBinding`, which owns the query state, debounces
 * search and filter changes, and returns to page 1 when they change. Writes go
 * through the service, and each one refetches the current page so what is on
 * screen matches what the server actually stored — which matters as soon as
 * validation, defaults or computed fields are involved.
 *
 * The returned shape matches `useResource` on purpose, so a screen migrates by
 * swapping the hook and deleting its own filtering and slicing rather than
 * being rewritten.
 *
 * @param {ReturnType<import("./createResourceService").createResourceService>} service
 * @param {Object} [options]
 * @param {(message: string) => void} [options.onToast]
 * @param {number} [options.pageSize=50]
 * @param {string} [options.search] Search text owned by the app shell.
 */
export function useServerResource(service, { onToast, pageSize = 50, search } = {}) {
  const onToastRef = React.useRef(onToast);
  React.useEffect(() => {
    onToastRef.current = onToast;
  }, [onToast]);

  const fetcher = React.useCallback(
    async (params) => {
      const { items, total } = await service.list(params);
      return { data: items, total };
    },
    [service]
  );

  // Must keep a stable identity. `useServerDataBinding` counts `onError` among
  // the dependencies of its fetch callback, so an inline arrow here would be a
  // new function every render — invalidating the callback, retriggering the
  // fetch effect, and looping forever while the table sits on "Fetching from
  // server..." hammering the API. Reading the toast through a ref pins it.
  const handleError = React.useCallback(
    (err) => onToastRef.current?.(err?.message || "Failed to load data"),
    []
  );

  const binding = useServerDataBinding({
    fetcher,
    initialPageSize: pageSize,
    onError: handleError,
  });

  // The search box usually lives in the app shell and arrives as a prop, so it
  // is mirrored into the binding rather than the binding owning it. Debouncing
  // still happens inside, which is what keeps typing from firing a request per
  // character.
  const { setSearch } = binding;
  React.useEffect(() => {
    if (search !== undefined) setSearch(search);
  }, [search, setSearch]);

  const { refetch } = binding;

  /** Runs a write, refreshes the current page, and reports failures once. */
  const run = React.useCallback(
    async (fn, failureMessage) => {
      try {
        const result = await fn();
        await refetch();
        return result;
      } catch (err) {
        onToastRef.current?.(err?.message || failureMessage);
        throw err;
      }
    },
    [refetch]
  );

  const create = React.useCallback(
    (payload) => run(() => service.create(payload), "Failed to create record"),
    [run, service]
  );

  const update = React.useCallback(
    (id, payload) => run(() => service.update(id, payload), "Failed to update record"),
    [run, service]
  );

  const remove = React.useCallback(
    (id) => run(() => service.remove(id), "Failed to delete record"),
    [run, service]
  );

  const updateMany = React.useCallback(
    (ids, payload) => run(() => service.updateMany(ids, payload), "Failed to update records"),
    [run, service]
  );

  const removeMany = React.useCallback(
    (ids, payload) => run(() => service.removeMany(ids, payload), "Failed to delete records"),
    [run, service]
  );

  return {
    // The current page only — already sorted, filtered and paged by the database.
    data: binding.data,
    total: binding.total,
    page: binding.page,
    setPage: binding.setPage,
    pageSize: binding.pageSize,
    setPageSize: binding.setPageSize,
    sortKey: binding.sortKey,
    sortDirection: binding.sortDirection,
    setSort: binding.setSort,
    filters: binding.filters,
    setFilters: binding.setFilters,
    loading: binding.loading,
    error: binding.error,
    isDemo: service.isDemo(),
    refetch,
    create,
    update,
    remove,
    updateMany,
    removeMany,
  };
}
