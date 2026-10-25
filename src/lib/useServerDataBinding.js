import * as React from "react";

/**
 * Paging, sorting, searching and filtering, all done by the server.
 *
 * Owns the query state and turns every change to it into exactly one request.
 * The three things that go wrong at scale are handled here rather than in each
 * screen:
 *
 *  - **Superseded requests are cancelled**, not merely ignored. Typing six
 *    characters used to leave six queries running against the database and
 *    throw five results away.
 *  - **A new search does not fire twice.** Changing the query resets to page 1,
 *    and doing that in an effect meant one request for the old page and another
 *    for the new one.
 *  - **The table does not blank between pages.** Rows stay on screen while the
 *    next set loads, so paging through a long list does not flash.
 *
 * @param {Object} options
 * @param {Function} options.fetcher `({ page, pageSize, sortKey, sortDirection, search, filters, signal }) => { data, total }`
 * @param {number} [options.initialPage=1]
 * @param {number} [options.initialPageSize=10]
 * @param {string|null} [options.initialSortKey=null]
 * @param {string|null} [options.initialSortDirection=null]
 * @param {string} [options.initialSearch=""]
 * @param {Object} [options.initialFilters={}]
 * @param {number} [options.debounceMs=300]
 * @param {boolean} [options.autoFetch=true]
 * @param {boolean} [options.keepPreviousData=true] Keep rows on screen while the next page loads.
 * @param {Function} [options.onSuccess]
 * @param {Function} [options.onError]
 */
export function useServerDataBinding({
  fetcher,
  initialPage = 1,
  initialPageSize = 50,
  initialSortKey = null,
  initialSortDirection = null,
  initialSearch = "",
  initialFilters = {},
  debounceMs = 300,
  autoFetch = true,
  keepPreviousData = true,
  onSuccess,
  onError,
}) {
  const [data, setData] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(initialPage);
  const [pageSize, setPageSize] = React.useState(initialPageSize);
  const [sortKey, setSortKey] = React.useState(initialSortKey);
  const [sortDirection, setSortDirection] = React.useState(initialSortDirection);
  const [search, setSearch] = React.useState(initialSearch);
  const [filters, setFilters] = React.useState(initialFilters);
  const [isFetching, setIsFetching] = React.useState(autoFetch);
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Debounced, so typing does not put a request behind every keystroke.
  const [debouncedSearch, setDebouncedSearch] = React.useState(search);
  const [debouncedFilters, setDebouncedFilters] = React.useState(filters);

  // Held in refs so the fetch callback does not have to list them as
  // dependencies — it would be rebuilt on every render, and the effect that
  // depends on it would refetch forever.
  const fetcherRef = React.useRef(fetcher);
  const onSuccessRef = React.useRef(onSuccess);
  const onErrorRef = React.useRef(onError);
  React.useEffect(() => {
    fetcherRef.current = fetcher;
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  });

  const requestIdRef = React.useRef(0);
  const abortRef = React.useRef(null);
  const mountedRef = React.useRef(true);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Nothing is listening for this answer any more.
      abortRef.current?.abort();
    };
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), debounceMs);
    return () => clearTimeout(timer);
  }, [search, debounceMs]);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedFilters(filters), debounceMs);
    return () => clearTimeout(timer);
  }, [filters, debounceMs]);

  // Reset to page 1 when the query changes — during render, not in an effect.
  //
  // Page 4 of a search for "acme" is meaningless once the search becomes
  // "acme ltd", so the page has to go back to 1. Doing that in an effect meant
  // the fetch effect had already run once with the stale page: every change to
  // a search or filter fired two requests, one of them for a page that was
  // about to be discarded. Adjusting the state during render lets React
  // re-render before committing, so the effects below only ever see page 1.
  const queryKey = React.useMemo(
    () => JSON.stringify([debouncedSearch, debouncedFilters]),
    [debouncedSearch, debouncedFilters]
  );
  const [lastQueryKey, setLastQueryKey] = React.useState(queryKey);
  if (queryKey !== lastQueryKey) {
    setLastQueryKey(queryKey);
    setPage(1);
  }

  const fetchData = React.useCallback(async () => {
    if (!fetcherRef.current) return;

    // Whatever was in flight is now answering a question nobody is asking.
    abortRef.current?.abort();
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    abortRef.current = controller;

    const requestId = ++requestIdRef.current;
    setIsFetching(true);
    setError(null);

    try {
      const result = await fetcherRef.current({
        page,
        pageSize,
        sortKey,
        sortDirection,
        search: debouncedSearch,
        filters: debouncedFilters,
        signal: controller?.signal,
      });

      // A slow first request can still land after a fast second one, so the id
      // is checked as well as the abort — not every fetcher honours the signal.
      if (!mountedRef.current || requestId !== requestIdRef.current) return;

      const resultData = Array.isArray(result) ? result : result?.data ?? [];
      const resultTotal = typeof result?.total === "number" ? result.total : resultData.length;

      setData(resultData);
      setTotal(resultTotal);
      setHasLoaded(true);
      onSuccessRef.current?.(result);
    } catch (err) {
      // Cancelling is this hook's own doing, not a failure to report.
      if (err?.name === "AbortError") return;
      if (!mountedRef.current || requestId !== requestIdRef.current) return;

      setError(err?.message || "Failed to load data from server.");
      onErrorRef.current?.(err);
    } finally {
      if (mountedRef.current && requestId === requestIdRef.current) setIsFetching(false);
    }
  }, [page, pageSize, sortKey, sortDirection, debouncedSearch, debouncedFilters]);

  React.useEffect(() => {
    if (autoFetch) fetchData();
  }, [fetchData, autoFetch]);

  /** Sets one filter. An empty value removes it, which is what "All" means. */
  const setFilter = React.useCallback((key, value) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (value === undefined || value === null || value === "" || value === "all") {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  }, []);

  const setSort = React.useCallback((key, direction) => {
    setSortKey(key);
    setSortDirection(direction);
  }, []);

  const pageCount = Math.max(1, Math.ceil(total / (pageSize || 10)));

  // A spinner belongs on screen only when there is nothing else to show.
  // Once rows exist, replacing them with a spinner on every page change is a
  // flash of empty table where a moment of stale data would have been calmer —
  // and `isFetching` is there for a subtler indicator.
  const loading = (isFetching && (!keepPreviousData || !hasLoaded)) || (!hasLoaded && autoFetch);

  return {
    data,
    total,
    page,
    setPage,
    pageSize,
    setPageSize,
    pageCount,
    sortKey,
    sortDirection,
    setSort,
    search,
    setSearch,
    filters,
    setFilters,
    setFilter,
    /** True when there is nothing to display yet. */
    loading,
    /** True whenever a request is in flight, including a background refresh. */
    isFetching,
    error,
    refetch: fetchData,
    fetchParams: {
      page,
      pageSize,
      sortKey,
      sortDirection,
      search: debouncedSearch,
      filters: debouncedFilters,
    },
    /** Ready to spread onto a DataTable. */
    tableProps: {
      data,
      loading,
      isFetching,
      sortKey,
      sortDirection,
      onSortChange: setSort,
      serverSide: true,
      error,
      onRetry: fetchData,
    },
    /** Ready to spread onto a Pagination. */
    paginationProps: {
      page,
      pageSize,
      total,
      onPageChange: setPage,
      onPageSizeChange: (newSize) => {
        setPageSize(newSize);
        setPage(1);
      },
    },
  };
}
