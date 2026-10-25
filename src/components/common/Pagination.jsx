import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "../../lib/cn";
function Pagination({
  page = 1,
  pageSize = 50,
  total = 50,
  onPageChange = () => {},
  // Optional page-size selector. Several consumers (e.g. useServerDataBinding's
  // `paginationProps`) already pass `onPageSizeChange`, but this component never
  // rendered anything for it — the callback silently went unused. It's now wired
  // up, and only rendered when a consumer actually opts in by passing it.
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className,
}) {
  const safePageSize = pageSize > 0 ? pageSize : 1;
  const pageCount = Math.max(1, Math.ceil(total / safePageSize));
  const start = total === 0 ? 0 : (page - 1) * safePageSize + 1;
  const end = Math.min(total, page * safePageSize);
  return <nav className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-body-sm text-ink-secondary", className)} aria-label="Pagination">
      {typeof onPageSizeChange === "function" && (
        <label className="flex items-center gap-1.5">
          {/* Dropped on a phone, where this row plus a column chooser is wider
              than the screen and pushed the last control off the right edge.
              The select keeps its own `aria-label`, so nothing is lost to a
              screen reader — only the redundant visible copy of it goes. */}
          <span className="hidden md:inline">Rows per page</span>
          <select
            value={safePageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="Rows per page"
            className="h-control-lg md:h-6.5 rounded border border-card-border bg-card px-2 md:px-1.5 text-body-sm text-ink-secondary focus:outline-none focus:ring-2 focus:ring-accent/40 cursor-pointer"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="flex items-center gap-1.5">
        <button
      onClick={() => onPageChange(Math.max(1, page - 1))}
      disabled={page === 1}
      aria-label="Previous page"
      className="flex h-control-lg w-control-lg md:h-6.5 md:w-6.5 items-center justify-center rounded text-ink-secondary hover:bg-accent-muted disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
    >
          <ChevronsLeft size={14} />
        </button>
        <span>
          {start}-{end} of {total}
        </span>
        <button
      onClick={() => onPageChange(Math.min(pageCount, page + 1))}
      disabled={page >= pageCount}
      aria-label="Next page"
      className="flex h-control-lg w-control-lg md:h-6.5 md:w-6.5 items-center justify-center rounded text-ink-secondary hover:bg-accent-muted disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
    >
          <ChevronsRight size={14} />
        </button>
      </div>
    </nav>;
}
export {
  Pagination
};