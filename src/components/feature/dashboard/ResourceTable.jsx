import * as React from "react";
import { Panel } from "../../common/Panel";
import { MobileTableWrapper } from "../../common/MobileTableWrapper";
import { Button } from "../../common/Button";
import { getApiClient } from "../../../lib/apiClient";

/**
 * One report panel on the account overview: a title, a short slice of a
 * resource, and a link out to the full screen.
 *
 * The reference page gives every panel its own paging controls, so each of the
 * sixteen boxes is a miniature application you can get lost inside. These show
 * the first handful of rows and hand you to the real page for the rest, which
 * is what a summary is for.
 *
 * Fetches through the same paged API as everything else, so a panel pulls the
 * rows it displays and no more — never the whole table.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {string} props.path Resource path, e.g. "/api/reports"
 * @param {Array} props.columns MobileTableWrapper column definitions
 * @param {number} [props.limit] Rows to show
 * @param {string} [props.sortKey] Server-side sort column
 * @param {"asc"|"desc"} [props.sortDirection]
 * @param {() => void} [props.onOpenFull] Called by the "View all" action
 * @param {ReturnType<import("../../../lib/apiClient").createApiClient>} [props.client]
 */
export function ResourceTable({
  title,
  path,
  columns,
  limit = 6,
  sortKey,
  sortDirection = "asc",
  rowKey = (r) => r.id,
  emptyMessage = "Nothing to show.",
  onOpenFull,
  client,
}) {
  const api = client ?? getApiClient();

  const [rows, setRows] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ page: "1", limit: String(limit) });
      if (sortKey) {
        query.set("sortKey", sortKey);
        query.set("sortDir", sortDirection);
      }
      const data = await api.request(`${path}?${query}`, { method: "GET" });
      setRows(data?.items ?? []);
      setTotal(typeof data?.total === "number" ? data.total : (data?.items?.length ?? 0));
    } catch (err) {
      setError(err?.message || "Could not load this report");
    } finally {
      setLoading(false);
    }
  }, [api, path, limit, sortKey, sortDirection]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <Panel
      title={title}
      actions={
        total > rows.length && onOpenFull ? (
          <Button variant="ghost" size="sm" onClick={onOpenFull}>
            View all {new Intl.NumberFormat("en-IN").format(total)}
          </Button>
        ) : undefined
      }
    >
      <MobileTableWrapper
        columns={columns}
        data={rows}
        rowKey={rowKey}
        loading={loading}
        error={error}
        onRetry={load}
        serverSide
        emptyMessage={emptyMessage}
        primaryFields={columns.slice(0, 2).map((c) => c.key)}
      />
    </Panel>
  );
}
