import * as React from "react";
import { SlidersHorizontal, RefreshCw, Download, Eye } from "lucide-react";
import { Panel } from "../components/common/Panel";
import { TableToolbar } from "../components/common/TableToolbar";
import { DataTable } from "../components/common/DataTable";
import { IconButton } from "../components/common/IconButton";
import { Badge } from "../components/common/Badge";
import { Loader } from "../components/common/Loader";
import { InvoicePreviewModal } from "../components/feature/InvoicePreviewModal";
import { ReportFilter, InvoicePdfViewer, ExcelPreviewViewer } from "../components/feature/report";
import { makeInitialReports } from "../data/mock";
import { useServerDataBinding } from "../lib/useServerDataBinding";
import { useServerDataContext } from "../lib/ServerDataProvider";

import { MobileTableWrapper } from "../components/common/MobileTableWrapper";

/**
 * Invoice & payment report screen.
 *
 * Runs on local in-memory data (bundled demo records, filtered client-side)
 * unless you pass `fetcher` directly, or wrap this page in a
 * `ServerDataProvider` — it looks itself up under the `"reports"` endpoint
 * key automatically. In server mode, `filters` (product/account/site/
 * invoice/payment/date range) are sent to your `fetcher` instead of being
 * applied locally, and Reload re-runs the fetch instead of the local demo spinner.
 */
export function ReportPage({ fetcher: propFetcher, serverSide: propServerSide, endpointKey = "reports", initialData, onToast }) {
  const context = useServerDataContext();
  const contextFetcher = context?.getEndpointFetcher?.(endpointKey);
  const activeFetcher = propFetcher || contextFetcher;
  const isServerSide = propServerSide ?? !!activeFetcher;

  const [reports] = React.useState(initialData || makeInitialReports);
  const [localLoading, setLocalLoading] = React.useState(false);
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [filters, setFilters] = React.useState({});
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [activeRow, setActiveRow] = React.useState(null);
  const [tab, setTab] = React.useState("pdf");

  const serverBinding = useServerDataBinding({
    fetcher: activeFetcher || (() => Promise.resolve({ data: [], total: 0 })),
    autoFetch: isServerSide,
  });

  // Destructured because `serverBinding` is a new object every render and
  // cannot go in a dependency array without looping. These setters are stable,
  // so the effects below can depend on exactly what they use.
  const { setFilters: serverSetFilters } = serverBinding;

  React.useEffect(() => {
    if (isServerSide) {
      serverSetFilters(filters);
    }
  }, [filters, isServerSide, serverSetFilters]);

  function reload() {
    if (isServerSide) {
      serverBinding.refetch();
    } else {
      setLocalLoading(true);
      setTimeout(() => setLocalLoading(false), 600);
    }
  }

  // Parses "23-Feb-26" / "23-Feb-2026" / Date / timestamp into a Date (or null).
  const parseReportDate = React.useCallback((val) => {
    if (!val) return null;
    if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
    const str = String(val).trim();
    if (!str) return null;
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d;
    const match = str.match(/^(\d{1,2})[-/ ]([A-Za-z]{3})[-/ ](\d{2,4})/);
    if (match) {
      const day = parseInt(match[1], 10);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthIdx = months.findIndex((m) => m.toLowerCase() === match[2].toLowerCase());
      if (monthIdx !== -1) {
        let year = parseInt(match[3], 10);
        if (year < 100) year += 2000;
        const parsed = new Date(year, monthIdx, day);
        if (!isNaN(parsed.getTime())) return parsed;
      }
    }
    return null;
  }, []);

  const locallyFilteredReports = React.useMemo(() => {
    const range = filters.range;
    const from = range?.from ? parseReportDate(range.from) : null;
    const to = range?.to ? parseReportDate(range.to) : null;
    return reports.filter((r) => {
      if (filters.product && r.product !== filters.product) return false;
      if (filters.account && r.account !== filters.account) return false;
      if (filters.site && r.site && r.site !== filters.site) return false;
      if (filters.invoice && r.invoice !== filters.invoice) return false;
      if (filters.payment && r.payment !== filters.payment) return false;
      if (from || to) {
        const d = parseReportDate(r.date);
        if (!d) return false;
        const t = d.getTime();
        if (from && t < new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime()) return false;
        if (to && t > new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59).getTime()) return false;
      }
      return true;
    });
  }, [reports, filters, parseReportDate]);

  // In server-side mode the authoritative rows come from the server binding
  // (filtered by your fetcher); otherwise fall back to the local demo dataset
  // filtered entirely client-side.
  const visibleReports = isServerSide ? serverBinding.data : locallyFilteredReports;
  const loading = isServerSide ? serverBinding.loading : localLoading;
  const error = isServerSide ? serverBinding.error : null;

  const dataTableColumns = [
    { key: "product", header: "PRODUCT", render: (r) => r.product },
    { key: "account", header: "ACCOUNT", render: (r) => r.account },
    { key: "invoice", header: "INVOICE", render: (r) => r.invoice },
    { key: "payment", header: "PAYMENT", render: (r) => <Badge tone={r.payment === "Paid" ? "online" : "warn"}>{r.payment}</Badge> },
    { key: "date", header: "DATE", render: (r) => r.date },
    { key: "amount", header: "AMOUNT", align: "right", render: (r) => `₹${r.amount.toLocaleString("en-IN")}` },
  ];

  return (
    <div className="flex flex-col gap-4 w-full min-w-0">
      <Panel title="Invoice & Payment Report">
        <TableToolbar
          start={<IconButton icon={<SlidersHorizontal size={16} />} label="Filters" onClick={() => setFilterOpen((v) => !v)} />}
          end={
            <>
              <IconButton icon={<RefreshCw size={16} />} label="Reload" onClick={reload} />
              <IconButton icon={<Download size={16} />} label="Download" onClick={() => onToast?.("Report download started")} />
            </>
          }
        />

        {filterOpen && (
          <ReportFilter open={filterOpen} filters={filters} onChange={setFilters} onSearch={() => setFilterOpen(false)} onClear={() => { setFilters({}); setFilterOpen(false); }} rows={isServerSide ? serverBinding.data : reports} />
        )}

        {loading && visibleReports.length === 0 ? (
          <Loader label="Loading report..." />
        ) : (
          <>
            {/* Desktop DataTable */}
            <div className="hidden md:block">
              <DataTable
                columns={dataTableColumns}
                data={visibleReports}
                loading={loading}
                error={error}
                onRetry={isServerSide ? serverBinding.refetch : undefined}
                rowKey={(r) => r.id}
                onRowClick={(r) => { setActiveRow(r); setPreviewOpen(true); }}
              />
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden">
              <MobileTableWrapper
                columns={dataTableColumns}
                data={visibleReports}
                loading={loading}
                rowKey={(r) => r.id}
                primaryFields={["product", "account", "invoice", "date", "amount"]}
                actionMenuItems={[
                  {
                    label: "Preview Report",
                    icon: <Eye size={16} />,
                    onClick: (r) => { setActiveRow(r); setPreviewOpen(true); },
                  },
                ]}
                onRowClick={(r) => { setActiveRow(r); setPreviewOpen(true); }}
                emptyMessage="No report records found."
              />
            </div>
          </>
        )}
      </Panel>


      <InvoicePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        customerEmail={activeRow ? "customer@example.com" : undefined}
        activeTab={tab}
        onTabChange={setTab}
        onSendEmail={() => onToast?.("Invoice emailed to customer")}
      >
        {tab === "pdf" ? (
          <InvoicePdfViewer invoiceNo={activeRow?.invoice} />
        ) : (
          <ExcelPreviewViewer rows={activeRow ? [{ Product: activeRow.product, Account: activeRow.account, Amount: activeRow.amount }] : []} />
        )}
      </InvoicePreviewModal>
    </div>
  );
}
