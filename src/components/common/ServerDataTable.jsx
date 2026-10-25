import * as React from "react";
import { DataTable } from "./DataTable";
import { Pagination } from "./Pagination";
import { SearchBox } from "./SearchBox";
import { TableToolbar } from "./TableToolbar";
import { useServerDataBinding } from "../../lib/useServerDataBinding";
import { cn } from "../../lib/cn";

/**
 * ServerDataTable Component.
 * A zero-boilerplate, server-bound data grid combining useServerDataBinding, DataTable, and Pagination.
 *
 * @param {Object} props
 * @param {Function} props.fetcher Async function ({ page, pageSize, sortKey, sortDirection, search, filters }) => { data: Array, total: number }
 * @param {Array} props.columns Column definition array
 * @param {number} [props.initialPage=1]
 * @param {number} [props.initialPageSize=10]
 * @param {string|null} [props.initialSortKey=null]
 * @param {string|null} [props.initialSortDirection=null]
 * @param {string} [props.initialSearch=""]
 * @param {Object} [props.initialFilters={}]
 * @param {boolean} [props.showSearch=true]
 * @param {string} [props.searchPlaceholder="Search server records..."]
 * @param {boolean} [props.showPagination=true]
 * @param {Function} [props.onRowClick]
 * @param {boolean} [props.selectable=false]
 * @param {Array} [props.selectedKeys]
 * @param {Function} [props.onSelectedKeysChange]
 * @param {Function} [props.rowKey]
 * @param {React.ReactNode} [props.toolbarActions]
 * @param {string} [props.className]
 */
export function ServerDataTable({
  fetcher,
  columns = [],
  initialPage = 1,
  initialPageSize = 10,
  initialSortKey = null,
  initialSortDirection = null,
  initialSearch = "",
  initialFilters = {},
  showSearch = true,
  searchPlaceholder = "Search server records...",
  showPagination = true,
  onRowClick,
  selectable = false,
  selectedKeys,
  onSelectedKeysChange,
  rowKey,
  toolbarActions,
  className,
  ...restProps
}) {
  const {
    data,
    total,
    page,
    setPage,
    pageSize,
    sortKey,
    sortDirection,
    setSort,
    search,
    setSearch,
    loading,
    error,
    refetch,
  } = useServerDataBinding({
    fetcher,
    initialPage,
    initialPageSize,
    initialSortKey,
    initialSortDirection,
    initialSearch,
    initialFilters,
  });

  return (
    <div className={cn("flex flex-col flex-1 min-h-0 w-full gap-3", className)}>
      {/* Top Toolbar with Search and custom actions */}
      {(showSearch || toolbarActions) && (
        <TableToolbar
          start={
            showSearch ? (
              <SearchBox
                value={search}
                onChange={setSearch}
                placeholder={searchPlaceholder}
              />
            ) : null
          }
          end={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={refetch}
                disabled={loading}
                title="Refresh server data"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control border border-card-border bg-card text-body-sm font-medium text-ink-primary hover:bg-accent-muted/40 transition-colors disabled:opacity-50 cursor-pointer shadow-sm min-h-[36px]"
              >
                <svg
                  className={cn("w-3.5 h-3.5", loading && "animate-spin text-accent")}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Refresh</span>
              </button>
              {toolbarActions}
            </div>
          }
        />
      )}

      {/* Server DataTable */}
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={setSort}
        selectable={selectable}
        selectedKeys={selectedKeys}
        onSelectedKeysChange={onSelectedKeysChange}
        onRowClick={onRowClick}
        rowKey={rowKey}
        serverSide={true}
        error={error}
        onRetry={refetch}
        {...restProps}
      />

      {/* Server Pagination */}
      {showPagination && (
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
