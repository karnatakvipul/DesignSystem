import * as React from "react";

/**
 * Binds a page to a resource, fetching everything at once.
 *
 * @deprecated Use `useServerResource`, which lets the database do the paging,
 * sorting, searching and filtering. This asks for one large page and hands the
 * whole array to a screen that slices it itself, so it stops being correct the
 * moment a table outgrows `pageSize` — silently, by dropping rows off the end
 * rather than by failing.
 *
 * Kept because it is the right shape for a genuinely small table (a handful of
 * licence terms, a list of product types) where a round trip per sort is worse
 * than holding forty rows in memory, and because it gives a screen a migration
 * path: the return shape matches `useServerResource`, so moving over means
 * swapping the hook and deleting the screen's own filtering and slicing.
 *
 * Mutations refetch afterwards, so what is on screen reflects what the server
 * stored once validation, defaults or computed fields are in play.
 *
 * @param {ReturnType<import("./createResourceService").createResourceService>} service
 * @param {Object} [options]
 * @param {(message: string) => void} [options.onToast]
 * @param {number} [options.pageSize=500] How many rows to ask for.
 */
export function useResource(service, { onToast, pageSize = 500 } = {}) {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // Held in a ref so the callbacks below need not depend on it, which would
  // rebuild them — and re-run consumers' effects — on every toast change.
  const onToastRef = React.useRef(onToast);
  React.useEffect(() => {
    onToastRef.current = onToast;
  }, [onToast]);

  const refetch = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { items } = await service.list({ page: 1, pageSize });
      setData(items);
    } catch (err) {
      const message = err?.message || "Failed to load data";
      setError(message);
      onToastRef.current?.(message);
    } finally {
      setLoading(false);
    }
  }, [service, pageSize]);

  React.useEffect(() => {
    refetch();
  }, [refetch]);

  /** Runs a mutation, refetches on success, and reports failures once. */
  const run = React.useCallback(
    async (fn, failureMessage) => {
      try {
        const result = await fn();
        await refetch();
        return result;
      } catch (err) {
        const message = err?.message || failureMessage;
        setError(message);
        onToastRef.current?.(message);
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
    (ids) => run(() => service.removeMany(ids), "Failed to delete records"),
    [run, service]
  );

  return {
    data,
    loading,
    error,
    isDemo: service.isDemo(),
    refetch,
    create,
    update,
    remove,
    updateMany,
    removeMany,
    setData,
  };
}
