import * as React from "react";
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../../lib/cn";

/** Shows the invoice PDF pages (stands in for a pdf.js-powered viewer). */
export function InvoicePdfViewer({ pageCount = 2, invoiceNo, className }) {
  const safePageCount = Math.max(1, Number(pageCount) || 1);
  const [page, setPage] = React.useState(1);

  // Keep the current page inside the valid range when the document changes
  React.useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), safePageCount));
  }, [safePageCount]);

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="flex aspect-[1/1.3] w-full max-w-sm flex-col items-center justify-center gap-3 rounded border border-card-border bg-canvas p-6 text-center">
        <FileText size={40} className="text-ink-muted" />
        <p className="text-body font-medium text-ink-primary">{invoiceNo ?? "Invoice"} — page {page}</p>
        <p className="text-body-sm text-ink-muted">PDF rendering goes here (pdf.js)</p>
      </div>
      <div className="flex items-center gap-3 text-body text-ink-secondary">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="disabled:opacity-40">
          <ChevronLeft size={16} />
        </button>
        Page {page} of {safePageCount}
        <button onClick={() => setPage((p) => Math.min(safePageCount, p + 1))} disabled={page >= safePageCount} className="disabled:opacity-40">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
