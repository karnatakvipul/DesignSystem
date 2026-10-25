import { RefreshCw, Download, SlidersHorizontal } from "lucide-react";
import { IconButton } from "../common/IconButton";
import { Loader } from "../common/Loader";
import { cn } from "../../lib/cn";
function ReportWidget({ title, loading, error, onRetry, onReload, onExport, onFilter, children, className }) {
  return <div className={cn("flex flex-col rounded-control border border-card-border bg-card", className)}>
      <div className="flex items-center justify-between border-b border-card-border px-4 py-3">
        <h3 className="font-secondary text-body font-semibold text-ink-primary">{title}</h3>
        <div className="flex items-center gap-1">
          {onFilter && <IconButton icon={<SlidersHorizontal size={14} />} label="Filter" size="sm" onClick={onFilter} />}
          {onReload && <IconButton icon={<RefreshCw size={14} />} label="Reload" size="sm" onClick={onReload} />}
          {onExport && <IconButton icon={<Download size={14} />} label="Export" size="sm" onClick={onExport} />}
        </div>
      </div>
      <div className="p-4">
        {loading ? (
          <Loader label="Loading widget..." />
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
            <div className="inline-flex flex-col items-center justify-center gap-2 p-4 rounded-surface bg-status-offline-bg/30 border border-status-offline/30 text-status-offline max-w-md mx-auto">
              <p className="text-body-sm font-semibold">{typeof error === "string" ? error : error.message || "Failed to load widget data."}</p>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="px-3 py-1 text-body-sm font-medium bg-status-offline text-white rounded-control hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                >
                  Retry Request
                </button>
              )}
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>;
}
export {
  ReportWidget
};