import * as React from "react";
import { getApiClient } from "./apiClient";

/**
 * Fetches the values a column actually holds, for a filter dropdown.
 *
 * Filter options are often read off the rows already on screen. That works
 * while every row is loaded and stops being right the moment paging moves to
 * the server: with fifty rows in hand, a dropdown offers only the handful of
 * values that happened to appear on page one — and a filter that cannot name
 * the thing you are looking for is worse than no filter, because it looks like
 * the value does not exist.
 *
 * Asked for once per column and held for the life of the screen. The set of
 * accounts or statuses does not change while someone has a filter panel open,
 * and refetching it on every render would put a request behind every keystroke.
 *
 * @param {string} path Resource path, e.g. "/api/licenses"
 * @param {string[]} fields Columns to fetch options for
 * @param {Object} [options]
 * @param {ReturnType<import("./apiClient").createApiClient>} [options.client]
 * @param {string} [options.allLabel="All"] Label for the option that clears the filter
 * @returns {{ options: Record<string, {value: string, label: string}[]>, loading: boolean }}
 */
export function useDistinctValues(path, fields, { client, allLabel = "All" } = {}) {
  const [options, setOptions] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const api = client ?? getApiClient();

  // Joined so the effect compares by content. `fields` is nearly always an
  // array literal at the call site, and comparing by identity would refetch
  // every column on every render.
  const key = fields.join(",");

  React.useEffect(() => {
    let cancelled = false;
    const names = key.split(",").filter(Boolean);
    if (names.length === 0) return undefined;

    setLoading(true);

    Promise.all(
      names.map(async (field) => {
        try {
          const values = await api.request(
            `${path}/distinct?field=${encodeURIComponent(field)}`,
            { method: "GET" }
          );
          return [field, Array.isArray(values) ? values : []];
        } catch {
          // One unavailable column should not empty the whole panel. That
          // dropdown simply offers nothing while the rest still work.
          return [field, []];
        }
      })
    ).then((entries) => {
      if (cancelled) return;

      setOptions(
        Object.fromEntries(
          entries.map(([field, values]) => [
            field,
            // An empty value is what the query builder reads as "not set", so
            // this entry is how someone clears the filter again.
            [{ value: "", label: allLabel }, ...values.map((v) => ({ value: v, label: v }))],
          ])
        )
      );
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [api, path, key, allLabel]);

  return { options, loading };
}
