import { cn } from "../../lib/cn";

function Panel({ title, actions, className, children, ...props }) {
  return (
    <div className={cn("rounded-surface border border-card-border bg-card shadow-raised w-full min-w-0 flex flex-col flex-1 min-h-0 h-full overflow-hidden", className)} {...props}>
      {title && (
        <div className="flex items-center justify-between gap-2 border-b border-card-border px-3 py-0.5 sm:py-1 shrink-0 min-h-8">
          <h3 className="font-secondary text-body-sm sm:text-sm font-semibold text-ink-primary truncate min-w-0">{title}</h3>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      <div className="p-1 sm:p-1.5 flex-1 min-h-0 flex flex-col overflow-hidden gap-1">{children}</div>
    </div>
  );
}

export { Panel };
