import { cn } from "../../lib/cn";

function TableToolbar({ start, end, className, ...props }) {
  return (
    <div className={cn("flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-1 py-0 w-full min-w-0 max-w-full overflow-visible shrink-0 relative z-30", className)} {...props}>
      {start && <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0 max-w-full">{start}</div>}
      {end && <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto max-w-full justify-start sm:justify-end">{end}</div>}
    </div>
  );
}

export { TableToolbar };