import * as React from "react";
import { Pencil, Trash2, Eye, History, RotateCw, XCircle, FileText, Check, X, ListChecks } from "lucide-react";

import { Panel } from "../components/common/Panel";
import { TableToolbar } from "../components/common/TableToolbar";
import { DataTable } from "../components/common/DataTable";
import { MobileTableWrapper } from "../components/common/MobileTableWrapper";
import { ErrorBoundary } from "../components/common/ErrorBoundary";
import { Pagination } from "../components/common/Pagination";
import { ColumnFilterDropdown } from "../components/common/ColumnFilterDropdown";
import { SearchBox } from "../components/common/SearchBox";
import { Badge } from "../components/common/Badge";
import { InputField } from "../components/common/InputField";
import { Dropdown } from "../components/common/Dropdown";
import { Button } from "../components/common/Button";
import { FloatingAddButton } from "../components/common/FloatingAddButton";
import { InvoicePreviewModal } from "../components/feature/InvoicePreviewModal";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { LicenseStatusCell, getLicenseRowTone } from "../components/feature/license/LicenseStatusCell";
import { Tooltip } from "../components/common/Tooltip";
import { cn } from "../lib/cn";
import {
  LicenseToolbar,
  LicenseFormModal,
  DeleteLicenseModal,
  ActivateLicenseModal,
  DeactivateLicenseModal,
  UpdatePropertyModal,
  LicenseFilter,
  TimelineModal,
  HistoryPiInvoiceModal,
  SingleLicensePreviewModal,
  LicenseRenewalModal,
  RenewalStreamFormModal,
  ManageRenewalStreamModal,
  ValidateTicketModal,
  CancelPiModal,
  SelectionRowPreviewModal,
} from "../components/feature/license";
import { makeInitialLicenses, makeInitialTimeline } from "../data/mock";
import { useServerDataBinding } from "../lib/useServerDataBinding";
import { useServerDataContext } from "../lib/ServerDataProvider";


const COLUMNS = [
  { key: "account", label: "Account", header: "ACCOUNT", sortable: true, width: "160px", minWidth: 160 },
  { key: "name", label: "Name", header: "NAME", sortable: true, width: "220px", minWidth: 220 },
  {
    key: "status",
    label: "Status",
    header: "STATUS",
    sortable: true,
    size: "lg",
    // Shows where the licence stands rather than only what is stored against
    // it: one still inside its term but close to the end reads "About to expire
    // in 6 days". Wide enough to hold that sentence — a countdown that clips is
    // worse than no countdown.
    render: (row) => <LicenseStatusCell row={row} warnWithinDays={EXPIRY_WARNING_DAYS} />,
  },
  { key: "type", label: "Type", header: "TYPE", sortable: true, width: "160px", minWidth: 160 },
  { key: "term", label: "Term", header: "TERM", sortable: true, width: "80px", minWidth: 80 },
  { key: "key", label: "Key", header: "KEY", sortable: true, width: "180px", minWidth: 180, copyable: true, truncate: true },
  { key: "issue", label: "Issue", header: "ISSUE", sortable: true, width: "100px", minWidth: 100 },
  { key: "actDate", label: "Active", header: "ACTIVE", sortable: true, width: "100px", minWidth: 100 },
  { key: "expiry", label: "Expiry", header: "EXPIRY", sortable: true, width: "100px", minWidth: 100 },
  { key: "site", label: "Site", header: "SITE", sortable: true, width: "220px", minWidth: 220 },
  { key: "lastPi", label: "Last PI", header: "LAST PI", sortable: true, width: "140px", minWidth: 140 },
  { key: "lastInvoice", label: "Last Invoice", header: "LAST INVOICE", sortable: true, width: "130px", minWidth: 130 },
  { key: "amount", label: "Amount", header: "AMOUNT", sortable: true, width: "90px", minWidth: 90 },
  { key: "payment", label: "Payment", header: "PAYMENT", sortable: true, width: "90px", minWidth: 90 },
  { key: "actions", label: "Is Active", header: "IS ACTIVE", width: "80px", minWidth: 80, align: "center" },
];

/**
 * How far ahead a licence starts being flagged as about to expire.
 *
 * 30 days matches the expiry reminder these systems typically send, so a row
 * turns amber on the same day the account holder first hears about it — rather
 * than a licence chasing someone about a renewal the screen still calls Active.
 *
 * Shared by the status cell and the row tint, so the highlighted rows are
 * always exactly the ones showing a countdown.
 */
const EXPIRY_WARNING_DAYS = 30;

export function LicensePage({
  fetcher: propFetcher,
  serverSide: propServerSide,
  onCreate,
  onUpdate,
  onDelete,
  initialData,
  onToast,
}) {
  const context = useServerDataContext();
  const contextFetcher = context?.getEndpointFetcher?.("licenses");
  const activeFetcher = propFetcher || contextFetcher;
  const isServerSide = propServerSide ?? !!activeFetcher;

  const [licenses, setLicenses] = React.useState(initialData || makeInitialLicenses);
  const [selected, setSelected] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [visibleCols, setVisibleCols] = React.useState(COLUMNS.map((c) => c.key));

  const [filterOpen, setFilterOpen] = React.useState(false);
  const [filters, setFilters] = React.useState({});

  const serverBinding = useServerDataBinding({
    fetcher: activeFetcher || (() => Promise.resolve({ data: [], total: 0 })),
    autoFetch: isServerSide,
  });

  // Destructured because `serverBinding` is a new object every render and
  // cannot go in a dependency array without looping. These setters are stable,
  // so the effects below can depend on exactly what they use.
  const { setSearch: serverSetSearch, setFilters: serverSetFilters } = serverBinding;

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [activateOpen, setActivateOpen] = React.useState(false);
  const [deactivateOpen, setDeactivateOpen] = React.useState(false);
  const [propertyOpen, setPropertyOpen] = React.useState(false);
  const [timelineOpen, setTimelineOpen] = React.useState(false);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [renewalOpen, setRenewalOpen] = React.useState(false);
  const [manageStreamOpen, setManageStreamOpen] = React.useState(false);
  const [ticketOpen, setTicketOpen] = React.useState(false);
  const [cancelPiOpen, setCancelPiOpen] = React.useState(false);
  const [selectionPreviewOpen, setSelectionPreviewOpen] = React.useState(false);
  const [invoiceOpen, setInvoiceOpen] = React.useState(false);
  const [invoiceTab, setInvoiceTab] = React.useState("pdf");
  const [streams, setStreams] = React.useState([{ label: "Annual base fee", amount: "60475" }]);
  const [pendingAction, setPendingAction] = React.useState(null); // gated behind ValidateTicketModal

  // `LicenseRenewalModal` shows the audit-style property log ("License
  // Renewal Stream" in the reference app), which is a different thing from
  // `streams` above (a set of billing line items reached through it via
  // "Manage Streams"). Derived from the demo licences the same way the real
  // app derives it from its API rows, so the dialog has something coherent to
  // show with edit/delete acting on it.
  const RENEWAL_PAGE_SIZE = 20;
  const [renewalPage, setRenewalPage] = React.useState(1);
  const [renewalFilters, setRenewalFilters] = React.useState(null);
  const [streamEdits, setStreamEdits] = React.useState({});
  const [streamDeletedIds, setStreamDeletedIds] = React.useState([]);
  const [streamEditing, setStreamEditing] = React.useState(null);
  const [streamDeleting, setStreamDeleting] = React.useState(null);

  const allStreamRows = React.useMemo(
    () =>
      licenses
        .flatMap((l) => {
          const shared = {
            accountName: l.account,
            name: l.name,
            licenseKey: l.key,
            ticketNo: `26${String(l.id).padStart(8, "0")}`,
            timestamp: l.actDate,
          };
          return [
            { ...shared, id: `${l.id}-datarate`, key: "datarate", value: l.type },
            { ...shared, id: `${l.id}-active`, key: "active", value: l.isActive ? "1" : "0" },
          ];
        })
        .filter((r) => !streamDeletedIds.includes(r.id))
        .map((r) => (streamEdits[r.id] ? { ...r, ...streamEdits[r.id] } : r)),
    [licenses, streamEdits, streamDeletedIds]
  );

  const renewalMatches = React.useMemo(() => {
    if (!renewalFilters) return allStreamRows;
    return allStreamRows.filter((r) => (renewalFilters.account ? r.accountName === renewalFilters.account : true));
  }, [allStreamRows, renewalFilters]);

  const renewalRows = React.useMemo(
    () => renewalMatches.slice((renewalPage - 1) * RENEWAL_PAGE_SIZE, renewalPage * RENEWAL_PAGE_SIZE),
    [renewalMatches, renewalPage]
  );

  const renewalAccountOptions = React.useMemo(
    () => [...new Set(allStreamRows.map((r) => r.accountName))].sort().map((a) => ({ value: a, label: a })),
    [allStreamRows]
  );

  const licenseTypeOptions = React.useMemo(
    () => [...new Set(licenses.map((l) => l.type).filter(Boolean))].sort().map((t) => ({ value: t, label: t })),
    [licenses]
  );

  // Update Property's option lists, all derived from the demo licenses
  // themselves rather than a separate accounts/sites master list — this app
  // has none, so an account or site is "real" exactly when some licence
  // already carries it.
  const propertyAccountOptions = React.useMemo(
    () => [...new Set(licenses.map((l) => l.account).filter(Boolean))].sort().map((a) => ({ value: a, label: a })),
    [licenses]
  );
  const propertySitesByAccount = React.useMemo(() => {
    const map = {};
    licenses.forEach((l) => {
      if (!l.account || !l.site) return;
      (map[l.account] ??= new Set()).add(l.site);
    });
    return Object.fromEntries(
      Object.entries(map).map(([account, sites]) => [account, [...sites].sort().map((s) => ({ value: s, label: s }))])
    );
  }, [licenses]);
  const propertyEfAccountOptions = React.useMemo(
    () =>
      [...new Set(licenses.filter((l) => l.type?.startsWith("EF")).map((l) => l.account).filter(Boolean))]
        .sort()
        .map((a) => ({ value: a, label: a })),
    [licenses]
  );

  // Mobile state for load more & sort
  const [mobilePage, setMobilePage] = React.useState(1);
  const [mobileLoadingMore, setMobileLoadingMore] = React.useState(false);
  const [currentSort, setCurrentSort] = React.useState("");
  const MOBILE_PAGE_SIZE = 25;

  React.useEffect(() => {
    if (isServerSide) {
      serverSetSearch(search);
      serverSetFilters(filters);
    } else {
      setPage(1);
      setMobilePage(1);
    }
  }, [search, filters, isServerSide, serverSetSearch, serverSetFilters]);

  function toast(msg) {
    onToast?.(msg);
  }

  function openRenewalStream() {
    setRenewalFilters(null);
    setRenewalPage(1);
    setRenewalOpen(true);
  }

  let filtered = licenses.filter((l) => {
    // 1. Search text query (matches account, name, site, key, status, lastPi)
    if (search && search.trim() !== "") {
      const q = search.toLowerCase();
      const match =
        l.account?.toLowerCase().includes(q) ||
        l.name?.toLowerCase().includes(q) ||
        l.site?.toLowerCase().includes(q) ||
        l.key?.toLowerCase().includes(q) ||
        l.status?.toLowerCase().includes(q) ||
        l.lastPi?.toLowerCase().includes(q);
      if (!match) return false;
    }

    // 2. Account filter
    if (filters.account && filters.account !== "all") {
      if (!l.account?.toLowerCase().includes(filters.account.toLowerCase())) return false;
    }

    // 3. Site filter
    if (filters.site && filters.site !== "all") {
      if (!l.site?.toLowerCase().includes(filters.site.toLowerCase())) return false;
    }

    // 4. Status filter
    if (filters.status && filters.status !== "all") {
      if (l.status !== filters.status) return false;
    }

    // 5. License Type filter
    if (filters.type && filters.type !== "all") {
      if (l.type !== filters.type) return false;
    }

    // 6. Product filter
    if (filters.product && filters.product.trim() !== "") {
      const q = filters.product.toLowerCase();
      if (!l.name?.toLowerCase().includes(q) && !l.account?.toLowerCase().includes(q)) return false;
    }

    // 7. License Term filter
    if (filters.term && filters.term.trim() !== "") {
      const q = filters.term.toLowerCase();
      if (!l.term?.toLowerCase().includes(q)) return false;
    }

    // 8. Device Serial filter
    if (filters.device && filters.device.trim() !== "") {
      const q = filters.device.toLowerCase();
      if (!l.key?.toLowerCase().includes(q)) return false;
    }

    // 9. Performa Invoice (lastPi) filter
    if (filters.pi && filters.pi !== "all") {
      if (filters.pi === "none") {
        if (l.lastPi && l.lastPi !== "-") return false;
      } else {
        if (!l.lastPi?.toLowerCase().includes(filters.pi.toLowerCase())) return false;
      }
    }

    return true;
  });

  // Sort handling
  if (currentSort === "account_asc") {
    filtered = [...filtered].sort((a, b) => (a.account ?? "").localeCompare(b.account ?? ""));
  } else if (currentSort === "account_desc") {
    filtered = [...filtered].sort((a, b) => (b.account ?? "").localeCompare(a.account ?? ""));
  } else if (currentSort === "expiry_asc") {
    filtered = [...filtered].sort((a, b) => (a.expiry ?? "").localeCompare(b.expiry ?? ""));
  } else if (currentSort === "expiry_desc") {
    filtered = [...filtered].sort((a, b) => (b.expiry ?? "").localeCompare(a.expiry ?? ""));
  }

  const pageSize = 10;
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  // In server-side mode the authoritative rows and pagination come from the server binding.
  const tableData = isServerSide ? serverBinding.data : pageRows;
  const tableTotal = isServerSide ? serverBinding.total : filtered.length;
  const tablePage = isServerSide ? serverBinding.page : page;
  const tableSetPage = isServerSide ? serverBinding.setPage : setPage;
  const mobileData = isServerSide ? serverBinding.data : filtered.slice(0, mobilePage * MOBILE_PAGE_SIZE);
  const hasMoreMobile = !isServerSide && mobileData.length < filtered.length;

  // Row-level actions (status circle, context menu, mobile menu) act on the
  // clicked row via `editing`; bulk toolbar actions act on the checkbox selection.
  const [actionSource, setActionSource] = React.useState("bulk"); // "row" | "bulk"
  const actionTargetIds = actionSource === "row" && editing ? [editing.id] : selected;
  const actionTargetCount = actionTargetIds.length;

  // In server-side mode rows live in the server binding, not local state.
  const sourceRows = isServerSide ? serverBinding.data : licenses;
  const selectedLicenses = sourceRows.filter((l) => actionTargetIds.includes(l.id));
  const singleSelected = actionTargetIds.length === 1
    ? sourceRows.find((l) => l.id === actionTargetIds[0])
    : null;

  const propertyLinkLicenseOptions = React.useMemo(() => {
    if (!singleSelected) return [];
    return licenses
      .filter((l) => l.account === singleSelected.account && l.id !== singleSelected.id)
      .map((l) => ({ value: l.key, label: l.name }));
  }, [licenses, singleSelected]);

  function loadMoreMobile() {
    setMobileLoadingMore(true);
    setTimeout(() => {
      setMobilePage((p) => p + 1);
      setMobileLoadingMore(false);
    }, 200);
  }

  function requireTicket(action) {
    setPendingAction(action);
    setTicketOpen(true);
  }

  const dataTableColumns = COLUMNS.map((c) => {
    if (c.key === "actions") {
      return {
        key: "actions",
        header: c.header || "IS ACTIVE",
        align: "center",
        sortable: false,
        width: c.width,
        minWidth: c.minWidth,
        render: (r) => {
          const active = r.status === "Active" || r.isActive === true;
          return (
            <div className="flex items-center justify-center w-full min-w-0" onClick={(e) => e.stopPropagation()}>
              <Tooltip content={active ? "Active License (Click to Deactivate)" : "Inactive License (Click to Activate)"} position="top">
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center justify-center w-5 h-5 rounded-pill text-white font-bold shadow-xs transition-transform duration-150 hover:scale-110 cursor-pointer select-none border-0 outline-none",
                    active ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600"
                  )}
                  onClick={() => {
                    setActionSource("row");
                    setEditing(r);
                    if (active) {
                      setDeactivateOpen(true);
                    } else {
                      setActivateOpen(true);
                    }
                  }}
                  aria-label={active ? "Deactivate License" : "Activate License"}
                >
                  {active ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                </button>
              </Tooltip>
            </div>
          );
        },
      };
    }

    const isLinkColumn = ["account", "name", "site"].includes(c.key);

    return {
      key: c.key,
      header: c.header || c.label.toUpperCase(),
      sortable: true,
      width: c.width,
      minWidth: c.minWidth,
      isLink: isLinkColumn,
      onCellClick: isLinkColumn ? (row) => {
        if (onToast) onToast(`Opening ${c.label}: ${row[c.key]}`);
        setEditing(row);
        setPreviewOpen(true);
      } : undefined,
      render: c.key === "status" ? (r) => <LicenseStatusCell row={r} warnWithinDays={EXPIRY_WARNING_DAYS} /> : undefined,
    };
  });

  // Tints the whole row for licences inside the warning window. The status cell
  // alone is not enough — on a table this wide it is often scrolled out of
  // sight, so the thing you most need to spot would be off the edge of the
  // screen.
  const rowTone = React.useCallback(
    (row) => getLicenseRowTone(row, { warnWithinDays: EXPIRY_WARNING_DAYS }),
    []
  );

  const mobileActionItems = [
    { label: "View Details", icon: <Eye size={16} />, onClick: (r) => { setEditing(r); setPreviewOpen(true); } },
    { label: "Edit License", icon: <Pencil size={16} />, onClick: (r) => { setEditing(r); setFormOpen(true); } },
    { label: "Renewal Stream", icon: <RotateCw size={16} />, onClick: () => openRenewalStream() },
    { label: "View History", icon: <History size={16} />, onClick: (r) => { setActionSource("row"); setEditing(r); setHistoryOpen(true); } },
    { label: "View Timeline", icon: <ListChecks size={16} />, onClick: () => setTimelineOpen(true) },
    { label: "Generate Invoice", icon: <FileText size={16} />, onClick: (r) => { setActionSource("row"); setEditing(r); setInvoiceOpen(true); } },
    { label: "Delete License", icon: <Trash2 size={16} />, onClick: (r) => { setActionSource("row"); setEditing(r); setDeleteOpen(true); }, danger: true },
  ];

  const mobileSortOptions = [
    { label: "Default Order", value: "" },
    { label: "Account (A-Z)", value: "account_asc" },
    { label: "Account (Z-A)", value: "account_desc" },
    { label: "Expiry (Earliest First)", value: "expiry_asc" },
    { label: "Expiry (Latest First)", value: "expiry_desc" },
  ];

  return (
    <div className="flex flex-col gap-2 w-full min-w-0 flex-1 min-h-0 overflow-hidden h-full">
      <Panel
        title="License Management"
        actions={
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <Pagination page={tablePage} pageSize={pageSize} total={tableTotal} onPageChange={tableSetPage} />
            </div>
            <ColumnFilterDropdown columns={COLUMNS} visible={visibleCols} onChange={setVisibleCols} />
          </div>
        }
      >
        <TableToolbar
          start={
            <div className="relative flex items-center gap-2 w-full sm:w-auto z-30">
              <SearchBox
                value={search}
                onChange={setSearch}
                onFilterClick={() => setFilterOpen((v) => !v)}
                className="flex-1 sm:max-w-xs"
              />
              {selected.length > 0 && (
                <>
                  <Badge tone="accent" className="flex items-center gap-1 pr-1 border border-accent/20">
                    {selected.length} selected
                    <button
                      type="button"
                      onClick={() => setSelected([])}
                      className="flex items-center justify-center rounded hover:bg-accent/20 p-0.5 transition-colors cursor-pointer"
                      aria-label="Clear selection"
                    >
                      <X size={12} className="opacity-70 hover:opacity-100" />
                    </button>
                  </Badge>
                  <button
                    onClick={() => { setActionSource("bulk"); setSelectionPreviewOpen(true); }}
                    className="text-body-sm font-medium text-accent hover:underline cursor-pointer truncate"
                  >
                    Create Invoice
                  </button>
                </>
              )}

              {/* Floating Gmail-Style Advanced Search & Filter Popover Modal */}
              <LicenseFilter
                open={filterOpen}
                onClose={() => setFilterOpen(false)}
                filters={filters}
                onChange={setFilters}
                onSearch={() => setFilterOpen(false)}
                onClear={() => { setFilters({}); setFilterOpen(false); }}
              />
            </div>
          }
          end={
            <LicenseToolbar
              selectedCount={selected.length}
              onViewDetails={() => { setActionSource("bulk"); setEditing(singleSelected); setPreviewOpen(true); }}
              onAdd={() => { setEditing(null); setFormOpen(true); }}
              onEdit={() => { setActionSource("bulk"); setEditing(singleSelected); setFormOpen(true); }}
              onDelete={() => { setActionSource("bulk"); setDeleteOpen(true); }}
              onActivate={() => { setActionSource("bulk"); setActivateOpen(true); }}
              onDeactivate={() => { setActionSource("bulk"); setDeactivateOpen(true); }}
              onUpdateProperty={() => { setActionSource("bulk"); setPropertyOpen(true); }}
              onRenewal={() => openRenewalStream()}
              onHistory={() => { setActionSource("bulk"); setHistoryOpen(true); }}
              onTimeline={() => setTimelineOpen(true)}
              onInvoice={() => { setActionSource("bulk"); setInvoiceOpen(true); }}
              onDownload={() => requireTicket("download")}
            />
          }
        />

        {/* Desktop DataTable */}
        <div className="hidden md:flex flex-1 min-h-0 flex-col overflow-hidden">
          <ErrorBoundary title="Data Grid Error" description="An error occurred while rendering the data grid. Click below to retry.">
            <DataTable
              selectable
              getRowTone={rowTone}
              selectedKeys={selected}
              onSelectedKeysChange={setSelected}
              columns={dataTableColumns}
              data={tableData}
              textWrap="truncate"
              rowKey={(r) => r.id}
              visibleColumns={visibleCols}
              loading={isServerSide ? serverBinding.loading : undefined}
              error={isServerSide ? serverBinding.error : undefined}
              onRetry={isServerSide ? serverBinding.refetch : undefined}
              serverSide={isServerSide}
              sortKey={isServerSide ? serverBinding.sortKey : undefined}
              sortDirection={isServerSide ? serverBinding.sortDirection : undefined}
              onSortChange={isServerSide ? serverBinding.setSort : undefined}
              onRowClick={(r) => {
                setEditing(r);
                setPreviewOpen(true);
              }}
              contextMenuItems={[
                { label: "View License Details", icon: <Eye size={14} />, onClick: (r) => { setEditing(r); setPreviewOpen(true); } },
                { label: "Edit License", icon: <Pencil size={14} />, onClick: (r) => { setEditing(r); setFormOpen(true); } },
                { label: "Delete License", icon: <Trash2 size={14} />, onClick: (r) => { setActionSource("row"); setEditing(r); setDeleteOpen(true); }, danger: true },
              ]}
              emptyMessage="No licenses match your search criteria."
              onClearFilters={() => { setFilters({}); setSearch(""); }}
            />
          </ErrorBoundary>
        </div>

        {/* Mobile High-Density Progressive Disclosure Card List */}
        <div className="md:hidden flex-1 min-h-0 flex flex-col overflow-y-auto w-full [-webkit-overflow-scrolling:touch] [touch-action:pan-y]">
          <MobileTableWrapper
            columns={dataTableColumns}
            getRowTone={rowTone}
            data={mobileData}
            loading={isServerSide ? serverBinding.loading : undefined}
            error={isServerSide ? serverBinding.error : undefined}
            onRetry={isServerSide ? serverBinding.refetch : undefined}
            rowKey={(r) => r.id}
            primaryFields={["account", "name", "status", "type"]}
            secondaryFields={["issue", "expiry", "site", "lastPi"]}
            actionMenuItems={mobileActionItems}
            selectable={true}
            selectedKeys={selected}
            onSelectedKeysChange={setSelected}
            loadMore={{
              hasMore: hasMoreMobile,
              loadingMore: mobileLoadingMore,
              onLoadMore: loadMoreMobile
            }}
            bulkActions={[
              { label: "Invoice", icon: <FileText size={14} />, onClick: () => { setActionSource("bulk"); setSelectionPreviewOpen(true); } },
              { label: "Activate", icon: <Check size={14} />, onClick: () => { setActionSource("bulk"); setActivateOpen(true); } },
              { label: "Deactivate", icon: <XCircle size={14} />, onClick: () => { setActionSource("bulk"); setDeactivateOpen(true); } },
              { label: "Delete", icon: <Trash2 size={14} />, onClick: () => { setActionSource("bulk"); setDeleteOpen(true); }, danger: true },
            ]}
            filterOptions={
              <div className="flex flex-col gap-3 pb-2">
                <InputField
                  label="Product Name"
                  placeholder="e.g. SLS Pro"
                  value={filters.product || ""}
                  onChange={(e) => setFilters({ ...filters, product: e.target.value })}
                />
                <Dropdown
                  label="Account Name"
                  placeholder="All Accounts"
                  options={[
                    { value: "all", label: "All Accounts" },
                    { value: "Aaxis Nano", label: "Aaxis Nano" },
                    { value: "Imtb Engineers Pvt Ltd", label: "Imtb Engineers Pvt Ltd" },
                    { value: "Abc Industries Pvt Ltd", label: "Abc Industries Pvt Ltd" },
                    { value: "my Design System", label: "my Design System" },
                    { value: "Deewan Enterprises", label: "Deewan Enterprises" },
                  ]}
                  value={filters.account || "all"}
                  onChange={(v) => setFilters({ ...filters, account: v })}
                />
                <Dropdown
                  label="Site Location"
                  placeholder="All Sites"
                  options={[
                    { value: "all", label: "All Sites" },
                    { value: "Gmr Airport Hyderabad", label: "Gmr Airport Hyderabad" },
                    { value: "Noida Plant 3", label: "Noida Plant 3" },
                    { value: "4s Synergies Ltd", label: "4s Synergies Ltd" },
                    { value: "K K Duplex & Paper Mills", label: "K K Duplex & Paper Mills" },
                  ]}
                  value={filters.site || "all"}
                  onChange={(v) => setFilters({ ...filters, site: v })}
                />
                <Dropdown
                  label="License Type"
                  placeholder="All Types"
                  options={[
                    { value: "all", label: "All Types" },
                    { value: "EF-10-NM-2P-PC1-PCB", label: "EF-10-NM-2P-PC1-PCB" },
                    { value: "EF-10-XX-420-SD4-BLE2", label: "EF-10-XX-420-SD4-BLE2" },
                    { value: "EF-10-NM-1P-PR-CAA", label: "EF-10-NM-1P-PR-CAA" },
                    { value: "DC-11-XX-11F-PR-CAA", label: "DC-11-XX-11F-PR-CAA" },
                    { value: "DC-11-NM-1F-PR-CAA", label: "DC-11-NM-1F-PR-CAA" },
                  ]}
                  value={filters.type || "all"}
                  onChange={(v) => setFilters({ ...filters, type: v })}
                />
                <Dropdown
                  label="License Status"
                  placeholder="All Statuses"
                  options={[
                    { value: "all", label: "All Statuses" },
                    { value: "Active", label: "Active" },
                    { value: "Expired", label: "Expired" },
                    { value: "Deactivated", label: "Deactivated" },
                  ]}
                  value={filters.status || "all"}
                  onChange={(v) => setFilters({ ...filters, status: v })}
                />
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-card-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({})}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            }
            sortOptions={mobileSortOptions}
            currentSort={isServerSide ? serverBinding.sortKey && serverBinding.sortDirection ? `${serverBinding.sortKey}_${serverBinding.sortDirection}` : "" : currentSort}
            onSortSelect={(val) => {
              if (isServerSide) {
                const [key, dir] = String(val).split("_");
                serverBinding.setSort(key || null, dir || null);
              } else {
                setCurrentSort(val);
              }
            }}
            mobileSearchValue={search}
            onMobileSearchChange={setSearch}
            hideMobileSearch={true}
            emptyMessage="No licenses found."
          />
        </div>

      </Panel>



      {/* Add / Edit */}
      <LicenseFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        license={editing}
        onSave={async (form) => {
          try {
            if (editing) {
              if (onUpdate) {
                await onUpdate(editing, form);
              } else {
                setLicenses((ls) => ls.map((l) => (l.id === editing.id ? { ...l, ...form } : l)));
              }
              toast("License updated");
            } else {
              if (onCreate) {
                await onCreate(form);
              } else {
                setLicenses((ls) => [{ id: Date.now(), status: "Active", issue: "Today", expiry: "-", site: "-", lastPi: "-", ...form }, ...ls]);
              }
              toast("License added");
            }
            if (isServerSide) {
              serverBinding.refetch();
            }
            setFormOpen(false);
          } catch (err) {
            toast(err?.message || "Failed to save license");
          }
        }}
      />

      <DeleteLicenseModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          try {
            if (onDelete) {
              await onDelete(actionTargetIds.length === 1 ? actionTargetIds[0] : actionTargetIds);
            } else {
              setLicenses((ls) => ls.filter((l) => !actionTargetIds.includes(l.id)));
            }
            setSelected([]);
            if (isServerSide) {
              serverBinding.refetch();
            }
            setDeleteOpen(false);
            toast("License(s) deleted");
          } catch (err) {
            toast(err?.message || "Failed to delete license(s)");
          }
        }}
      />

      <ActivateLicenseModal
        open={activateOpen}
        onClose={() => setActivateOpen(false)}
        onConfirm={async (date) => {
          try {
            const patch = { status: "Active", actDate: date, activeDate: date };
            if (onUpdate) {
              await onUpdate(actionTargetIds.length === 1 ? actionTargetIds[0] : actionTargetIds, patch);
            } else {
              setLicenses((ls) => ls.map((l) => (actionTargetIds.includes(l.id) ? { ...l, ...patch } : l)));
            }
            if (isServerSide) {
              serverBinding.refetch();
            }
            setActivateOpen(false);
            toast("License(s) activated");
          } catch (err) {
            toast(err?.message || "Failed to activate license(s)");
          }
        }}
      />

      <DeactivateLicenseModal
        open={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        count={actionTargetCount}
        onConfirm={async () => {
          try {
            const patch = { status: "Deactivated" };
            if (onUpdate) {
              await onUpdate(actionTargetIds.length === 1 ? actionTargetIds[0] : actionTargetIds, patch);
            } else {
              setLicenses((ls) => ls.map((l) => (actionTargetIds.includes(l.id) ? { ...l, ...patch } : l)));
            }
            if (isServerSide) {
              serverBinding.refetch();
            }
            setDeactivateOpen(false);
            toast("License(s) deactivated");
          } catch (err) {
            toast(err?.message || "Failed to deactivate license(s)");
          }
        }}
      />

      <UpdatePropertyModal
        open={propertyOpen}
        onClose={() => setPropertyOpen(false)}
        license={singleSelected}
        accounts={propertyAccountOptions}
        sitesByAccount={propertySitesByAccount}
        efAccounts={propertyEfAccountOptions}
        linkLicenseOptions={propertyLinkLicenseOptions}
        onSave={async (props) => {
          try {
            if (onUpdate) {
              await onUpdate(actionTargetIds.length === 1 ? actionTargetIds[0] : actionTargetIds, props);
            } else {
              setLicenses((ls) => ls.map((l) => (actionTargetIds.includes(l.id) ? { ...l, ...props } : l)));
            }
            if (isServerSide) {
              serverBinding.refetch();
            }
            toast("Property updated");
          } catch (err) {
            toast(err?.message || "Failed to update property");
          }
        }}
      />

      <TimelineModal open={timelineOpen} onClose={() => setTimelineOpen(false)} entries={makeInitialTimeline()} />

      <HistoryPiInvoiceModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        piRecords={
          singleSelected && singleSelected.lastPi !== "-"
            ? [{ id: `${singleSelected.id}-pi`, name: singleSelected.name, number: singleSelected.lastPi, timestamp: singleSelected.issue }]
            : []
        }
        tiRecords={
          singleSelected && singleSelected.lastInvoice !== "-"
            ? [{ id: `${singleSelected.id}-ti`, name: singleSelected.name, number: singleSelected.lastInvoice, timestamp: singleSelected.issue }]
            : []
        }
        onView={(r) => toast(`Opening ${r.number}`)}
        onDelete={(r) => toast(`${r.number} deleted`)}
      />

      <SingleLicensePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        license={editing}
      />

      <LicenseRenewalModal
        open={renewalOpen}
        onClose={() => setRenewalOpen(false)}
        rows={renewalRows}
        total={renewalMatches.length}
        page={renewalPage}
        pageSize={RENEWAL_PAGE_SIZE}
        onPageChange={setRenewalPage}
        accountOptions={renewalAccountOptions}
        onSearch={(next) => { setRenewalFilters(next); setRenewalPage(1); }}
        onEditRow={setStreamEditing}
        onDeleteRow={setStreamDeleting}
        onManage={() => { setRenewalOpen(false); setManageStreamOpen(true); }}
      />

      {/* Edit and delete for one stream row, matching the pencil and bin in
          the reference app's renewal dialog. */}
      <RenewalStreamFormModal
        open={!!streamEditing}
        onClose={() => setStreamEditing(null)}
        row={streamEditing}
        licenseTypeOptions={licenseTypeOptions}
        onSave={(values) => {
          setStreamEdits((prev) => ({
            ...prev,
            [values.id]: { value: values.value, ticketNo: values.ticketNo, timestamp: values.timestamp },
          }));
          setStreamEditing(null);
          toast("Renewal stream updated");
        }}
      />

      <ConfirmDialog
        open={!!streamDeleting}
        title="Delete Renewal Stream"
        message={`Delete the "${streamDeleting?.key}" entry for ${streamDeleting?.name}?`}
        tone="danger"
        onClose={() => setStreamDeleting(null)}
        onConfirm={() => {
          setStreamDeletedIds((prev) => [...prev, streamDeleting.id]);
          setStreamDeleting(null);
          toast("Renewal stream deleted");
        }}
      />

      <ManageRenewalStreamModal
        open={manageStreamOpen}
        onClose={() => setManageStreamOpen(false)}
        streams={streams}
        onSave={(rows) => { setStreams(rows); setManageStreamOpen(false); toast("Renewal streams saved"); }}
      />

      <ValidateTicketModal
        open={ticketOpen}
        onClose={() => setTicketOpen(false)}
        onConfirm={(ticket) => {
          setTicketOpen(false);
          toast(`Ticket ${ticket} validated — ${pendingAction} started`);
          setPendingAction(null);
        }}
      />

      <CancelPiModal
        open={cancelPiOpen}
        onClose={() => setCancelPiOpen(false)}
        invoiceNo={singleSelected?.lastPi}
        onConfirm={() => { setCancelPiOpen(false); toast("Performa invoice cancelled"); }}
      />

      <SelectionRowPreviewModal
        open={selectionPreviewOpen}
        onClose={() => setSelectionPreviewOpen(false)}
        licenses={selectedLicenses}
        onConfirm={(kind, kept) => {
          setSelectionPreviewOpen(false);
          if (kind === "Cancel") setCancelPiOpen(true);
          else toast(`${kind} invoice created for ${kept.length} license(s)`);
        }}
      />

      <InvoicePreviewModal
        open={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        customerEmail={singleSelected ? "customer@example.com" : undefined}
        activeTab={invoiceTab}
        onTabChange={setInvoiceTab}
        onSendEmail={() => toast("Invoice emailed to customer")}
      >
        <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-card-border text-body text-ink-muted">
          {invoiceTab === "pdf" ? "Invoice PDF preview (pdf.js viewer)" : "Renewal Excel preview (HTML table)"}
        </div>
      </InvoicePreviewModal>

      <FloatingAddButton label="Add License" onClick={() => { setEditing(null); setFormOpen(true); }} />
    </div>
  );
}