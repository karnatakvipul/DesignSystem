import * as React from "react";
import { ReportWidget } from "../components/feature/ReportWidget";
import { ChangesPreviewModal } from "../components/feature/ChangesPreviewModal";
import { UpcomingRenewalChart, LicenseTrendChart } from "../components/feature/dashboard";
import { makeUpcomingRenewalData, makeLicenseTrendData } from "../data/mock";

/**
 * Main analytics screen. Shows report widgets and charts in a grid.
 *
 * Backend wiring is optional and per-widget:
 * - Pass `renewalFetcher={() => Promise<Array<{label, value}>>}` to load the
 *   "Upcoming Renewals" chart from your API. Omit it to use local demo data
 *   (the reload button then just randomizes the demo values).
 * - Pass `trendFetcher={() => Promise<Array>}` to load the "License Trend"
 *   chart from your API. Omit it to use bundled local demo data.
 *
 * Each fetcher is called with no arguments and must return/resolve an array
 * shaped for the corresponding chart component. Failures are shown inline on
 * the widget with a Retry button.
 */
export function SlsReportDashboard({ onToast, renewalFetcher, trendFetcher }) {
  const [changesOpen, setChangesOpen] = React.useState(false);

  const isRenewalServerSide = typeof renewalFetcher === "function";
  const isTrendServerSide = typeof trendFetcher === "function";

  const [renewalData, setRenewalData] = React.useState(isRenewalServerSide ? [] : makeUpcomingRenewalData);
  const [renewalLoading, setRenewalLoading] = React.useState(isRenewalServerSide);
  const [renewalError, setRenewalError] = React.useState(null);

  const [trendData, setTrendData] = React.useState(isTrendServerSide ? [] : makeLicenseTrendData);
  const [trendLoading, setTrendLoading] = React.useState(isTrendServerSide);
  const [trendError, setTrendError] = React.useState(null);

  const loadRenewals = React.useCallback(() => {
    if (!isRenewalServerSide) return;
    setRenewalLoading(true);
    setRenewalError(null);
    Promise.resolve(renewalFetcher())
      .then((rows) => setRenewalData(rows || []))
      .catch((err) => setRenewalError(err))
      .finally(() => setRenewalLoading(false));
  }, [renewalFetcher, isRenewalServerSide]);

  const loadTrend = React.useCallback(() => {
    if (!isTrendServerSide) return;
    setTrendLoading(true);
    setTrendError(null);
    Promise.resolve(trendFetcher())
      .then((rows) => setTrendData(rows || []))
      .catch((err) => setTrendError(err))
      .finally(() => setTrendLoading(false));
  }, [trendFetcher, isTrendServerSide]);

  React.useEffect(() => {
    if (isRenewalServerSide) loadRenewals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRenewalServerSide]);

  React.useEffect(() => {
    if (isTrendServerSide) loadTrend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTrendServerSide]);

  function reloadRenewals() {
    if (isRenewalServerSide) {
      loadRenewals();
      return;
    }
    setRenewalData((rows) => rows.map((r) => ({ ...r, value: Math.max(1, r.value + (Math.random() > 0.5 ? 2 : -2)) })));
    onToast?.("Upcoming renewals reloaded");
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ReportWidget
        title="Upcoming Renewals"
        onReload={reloadRenewals}
        onExport={() => onToast?.("Chart exported")}
        loading={renewalLoading}
        error={renewalError}
        onRetry={isRenewalServerSide ? loadRenewals : undefined}
      >
        <UpcomingRenewalChart data={renewalData} />
      </ReportWidget>

      <ReportWidget
        title="License Trend"
        onFilter={() => setChangesOpen(true)}
        onExport={() => onToast?.("Chart exported")}
        loading={trendLoading}
        error={trendError}
        onRetry={isTrendServerSide ? loadTrend : undefined}
      >
        <LicenseTrendChart data={trendData} />
      </ReportWidget>

      <ChangesPreviewModal
        open={changesOpen}
        onClose={() => setChangesOpen(false)}
        title="License Trend — Filter Changes"
        fields={[
          { label: "Date Range", previous: "Last 3 months", current: "Last 6 months" },
          { label: "Group By", previous: "Total", current: "Account-wise" },
        ]}
      />
    </div>
  );
}
