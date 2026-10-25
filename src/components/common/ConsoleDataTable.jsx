"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Plus, Boxes, Eye, ExternalLink, Pencil, Trash2, Power, PowerOff } from "lucide-react";
import {
  Button,
  Dropdown,
  FilterField,
  usePageFilters,
  PageHeader,
  TruncatedText,
  ActionMenu,
  useServerDataBinding,
  ConfirmDialog,
  MetricSummary,
  EmptyState,
  type DataTableColumn,
  type ServerDataParams,
} from "my Design System";
import { ConsoleDataTable } from "@/components/ui/ConsoleDataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TableIdentityCell } from "@/components/ui/TableIdentityCell";
import { applyListQuery, LIST_FETCH_LIMIT } from "@/lib/list-query";
import { formatTimestamp } from "@/lib/format-date";
import { useAppShell } from "@/lib/app-shell-context";
import { applicationsService, applicationsSummary } from "@/lib/services/resources";
import { applicationLogo, applicationWebsiteUrl } from "@/lib/dashboard";
import { useInitialFilters } from "@/lib/list-url-filters";
import type { Application, ApplicationsSummary } from "@/lib/types";

function ApplicationsPageContent() {
  // Seeded from the query string so the dashboard's attention chips arrive
  // already narrowed to the rows they counted.
  const initialFilters = useInitialFilters(["status", "clientId", "portal"]);
  const router = useRouter();
  // `search` is the header's box — this table is what it filters.
  const { search, showToast: onToast } = useAppShell();
  const [deleteTarget, setDeleteTarget] = React.useState<Application | null>(null);
  // Activating and deactivating go through the same confirm step as deleting.
  // The list used to change status from an inline switch, one stray click away
  // in a dense table, while the detail page asked first — the same operation
  // presented as two different kinds of decision.
  const [statusTarget, setStatusTarget] = React.useState<Application | null>(null);

  // Full applications list for the filter panel dropdown
  const [allApps, setAllApps] = React.useState<Application[]>([]);
  const loadAllApps = React.useCallback(() => {
    applicationsService.list({ pageSize: LIST_FETCH_LIMIT }).then((res) => setAllApps(res.items));
  }, []);
  React.useEffect(() => loadAllApps(), [loadAllApps]);

  // Independent of `data`/`total` below — see `applicationsSummary`'s own
  // comment. The overview strip reads these counts, never
  // `applications.length`/`.filter(...).length`, so they stay correct
  // regardless of which page or filter the table itself is showing.
  const [summary, setSummary] = React.useState<ApplicationsSummary>({ total: 0, active: 0, inactive: 0 });
  const refreshSummary = React.useCallback(() => {
    applicationsSummary().then(setSummary);
  }, []);
  React.useEffect(() => refreshSummary(), [refreshSummary]);

  // `applicationsService` doesn't fit the library's generic CRUD-resource
  // shape (no bulk ops, no `distinct`, and the real API's status change is
  // a dedicated activate/deactivate route rather than a generic field
  // update) — `useServerDataBinding` only needs a plain fetcher, not a
  // resource object, so it's the right level here rather than
  // `useServerResource`.
  // The whole collection, then searched, filtered and paged here — this API
  // documents no query parameters on its list routes and ignores the ones the
  // service sends, so the header's search box and the status cards were both
  // controls that changed nothing. See `applyListQuery`.
  const fetcher = React.useCallback(async (params: ServerDataParams) => {
    const { items } = await applicationsService.list({ pageSize: LIST_FETCH_LIMIT });
    return applyListQuery(items, params, {
      // The client id is what a person would type looking for an application;
      // the UUID is an internal key nobody knows, so it is deliberately not
      // searched.
      fields: (a) => [a.name, a.clientId, a.description],
      filter: (a, filters) => {
        const status = filters.status as string | undefined;
        const clientId = filters.clientId as string | undefined;
        const portal = filters.portal as string | undefined;

        if (status && status !== "all" && a.status !== status) return false;
        if (clientId && a.clientId !== clientId) return false;
        if (portal === "portal" && !applicationWebsiteUrl(a)) return false;
        if (portal === "api" && applicationWebsiteUrl(a)) return false;
        return true;
      },
    });
  }, []);
  const {
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-auto">
          <MobileTableWrapper
            autoHeight={false}
            headerAlign="left"
            density="standard"
            skeletonRowHeight={30}
            columns={displayedColumns}
            data={data}
            rowKey={rowKey}
            loading={loading}
            serverSide
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortChange={onSortChange}
            primaryFields={primaryFields}
            hideMobileSearch
            hideMobileToolbar
            emptyMessage={emptyMessage}
            onRowDoubleClick={onRowDoubleClick}
            className="min-h-0 flex-1"
          />
        </div>
      )}
    </div>
  );
}


  const [draft, setDraft] = React.useState({
    status: statusFilter,
    clientId: clientIdFilter,
    portal: portalFilter,
  });

  const applied = `${statusFilter}|${clientIdFilter}|${portalFilter}`;
  const [appliedSync, setAppliedSync] = React.useState(applied);
  if (appliedSync !== applied) {
    setAppliedSync(applied);
    setDraft({ status: statusFilter, clientId: clientIdFilter, portal: portalFilter });
  }

  const statusOptions = React.useMemo(
    () => [
      { value: "all", label: "All statuses" },
      { value: "Active", label: "Active" },
      { value: "Inactive", label: "Inactive" },
    ],
    []
  );

  const applicationOptions = React.useMemo(() => {
    const list = allApps.length > 0 ? allApps : applications;
    const sorted = [...list].sort((a, b) => (a.name || a.clientId).localeCompare(b.name || b.clientId));
    return [
      { value: "", label: "All applications" },
      ...sorted.map((a) => ({ value: a.clientId, label: a.name || a.clientId })),
    ];
  }, [allApps, applications]);

  const portalOptions = React.useMemo(
    () => [
      { value: "", label: "All access types" },
      { value: "portal", label: "Has web portal" },
      { value: "api", label: "API only (no portal)" },
    ],
    []
  );

  const filterConfig = React.useMemo(
    () => ({
      activeCount:
        (statusFilter !== "all" ? 1 : 0) + (clientIdFilter ? 1 : 0) + (portalFilter ? 1 : 0),
      onApply: () => {
        setFilter("status", draft.status);
        setFilter("clientId", draft.clientId);
        setFilter("portal", draft.portal);
      },
      onClear: () => {
        setDraft({ status: "all", clientId: "", portal: "" });
        setFilter("status", "all");
        setFilter("clientId", "");
        setFilter("portal", "");
      },
      children: (
        <>
          <FilterField label="Status" labelAlign="left">
            <Dropdown
              value={draft.status}
              options={statusOptions}
              onChange={(v: string) => setDraft((d) => ({ ...d, status: v }))}
            />
          </FilterField>
          <FilterField label="Application" labelAlign="left">
            <Dropdown
              value={draft.clientId}
              options={applicationOptions}
              onChange={(v: string) => setDraft((d) => ({ ...d, clientId: v }))}
            />
          </FilterField>
          <FilterField label="Portal Access" labelAlign="left">
            <Dropdown
              value={draft.portal}
              options={portalOptions}
              onChange={(v: string) => setDraft((d) => ({ ...d, portal: v }))}
            />
          </FilterField>
        </>
      ),
    }),
    [statusFilter, clientIdFilter, portalFilter, draft, statusOptions, applicationOptions, portalOptions, setFilter]
  );
  usePageFilters(filterConfig);

  const hasActiveQuery =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    !!clientIdFilter ||
    !!portalFilter;

  function handleRefresh() {
    refetch();
    refreshSummary();
    loadAllApps();
  }

  async function handleConfirmStatus() {
    const app = statusTarget;
    if (!app) return;
    setStatusTarget(null);
    try {
      if (app.status === "Active") await applicationsService.deactivate(app.id);
      else await applicationsService.activate(app.id);
      onToast?.(`'${app.name}' ${app.status === "Active" ? "deactivated" : "activated"}`);
      refetch();
      refreshSummary();
    } catch (err) {
      onToast?.((err as Error)?.message || "Failed to change status");
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    try {
      await applicationsService.remove(deleteTarget.id);
      onToast?.(`'${deleteTarget.name}' deleted`);
      setDeleteTarget(null);
      refetch();
      refreshSummary();
    } catch (err) {
      onToast?.((err as Error)?.message || "Failed to delete application");
    }
  }

  const columns: DataTableColumn<Application>[] = [
    {
      key: "name",
      header: "APPLICATION",
      sortable: true,
      size: "lg",
      render: (r) => {
        const logo = applicationLogo(r);
        const websiteUrl = applicationWebsiteUrl(r);
        return (
          <TableIdentityCell
            name={r.name}
            logo={logo}
            href={websiteUrl || undefined}
            external={Boolean(websiteUrl)}
          />
        );
      },
    },
    {
      // `clientId`, never `id` — the UUID is what the secret endpoints are
      // addressed by and is not something anyone quotes. This is the
      // identifier the application signs in with, and the one the register
      // form asks for.
      key: "clientId",
      header: "APPLICATION ID",
      size: "md",
      sortable: false,
      render: (r) => (
        // `title` because an id is exact: a long one that gets clipped by the
        // column has to stay readable somewhere, and a table cell has no other
        // way to say the rest of it.
        <code className="block truncate font-mono text-body-sm text-ink-secondary" title={r.clientId}>
          {r.clientId}
        </code>
      ),
    },
    // `sortable` is opt-in per column now. Only the name is declared here
    // because it is the only ordering this API documents; a sort control on a
    // column the server will not order by looks like a feature and behaves
    // like a no-op.
    // `md`, down from `lg`, to pay for the Application ID column beside it.
    // At 1280px — the commonest laptop width — the row otherwise ran 43px past
    // its container and took the actions menu off the right edge with it. The
    // description is the column that can afford it: it is prose, already
    // clipped at 64 characters, and already reveals the rest on hover.
    { key: "description", header: "DESCRIPTION", size: "md", sortable: false, render: (r) => <TruncatedText text={r.description || "—"} maxLength={64} /> },
    {
      key: "status",
      header: "STATUS",
      size: "sm",
      sortable: false,
      render: (r) => <StatusBadge active={r.status === "Active"} />,
    },
    {
      key: "updatedAt",
      header: "UPDATED",
      size: "sm",
      sortable: false,
      render: (r) => <span className="whitespace-nowrap text-xs text-ink-muted">{formatTimestamp(r.updatedAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      size: "xs",
      render: (r) => {
        const websiteUrl = applicationWebsiteUrl(r);
        return (
          <ActionMenu
            label={`Actions for ${r.name}`}
            items={[
              ...(websiteUrl
                ? [
                    {
                      label: "Open website",
                      icon: <ExternalLink size={14} />,
                      onClick: () => window.open(websiteUrl, "_blank", "noopener,noreferrer"),
                    },
                  ]
                : []),
              { label: "View", icon: <Eye size={14} />, onClick: () => router.push(`/applications/${r.id}`) },
              { label: "Edit", icon: <Pencil size={14} />, onClick: () => router.push(`/applications/${r.id}/edit`) },
              {
                label: r.status === "Active" ? "Deactivate" : "Activate",
                icon: r.status === "Active" ? <PowerOff size={14} /> : <Power size={14} />,
                onClick: () => setStatusTarget(r),
              },
              { label: "Delete", icon: <Trash2 size={14} />, danger: true, onClick: () => setDeleteTarget(r) },
            ]}
          />
        );
      },
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-4 p-1">
      <PageHeader
        title="Applications"
        actions={
          <Button
            variant="primary"
            icon={<Plus size={18} />}
            aria-label="Register application"
            title="Register application"
            className="aspect-square p-0 flex items-center justify-center"
            onClick={() => router.push("/applications/add")}
          />
        }
      />

      <MetricSummary
        metrics={[
          { label: "Total", value: summary.total, tone: "accent", filterValue: "all" },
          { label: "Active", value: summary.active, tone: "online", filterValue: "Active" },
          { label: "Inactive", value: summary.inactive, tone: "offline", filterValue: "Inactive" },
        ]}
        activeFilter={statusFilter}
        onFilterChange={(v) => setFilter("status", v)}
      />

      {error && (
        <div
          role="alert"
          className="rounded-control border border-status-offline bg-status-offline-bg px-4 py-3 text-body-sm text-status-offline"
        >
          {error}
        </div>
      )}

      <ConsoleDataTable<Application>
        columns={columns}
        data={applications}
        rowKey={(r) => r.id}
        loading={loading}
        label="applications"
        onRefresh={handleRefresh}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        sortKey={sortKey ?? undefined}
        sortDirection={sortDirection ?? undefined}
        onSortChange={setSort}
        primaryFields={["name", "clientId", "status"]}
        emptyMessage="No applications registered yet."
        emptyState={
          <EmptyState
            icon={<Boxes size={20} />}
            title={hasActiveQuery ? "No applications match your search" : "No applications registered yet"}
            description={
              hasActiveQuery
                ? "Try adjusting your search or filters."
                : "Register an application to get started."
            }
            action={
              hasActiveQuery ? undefined : (
                <Button variant="primary" icon={<Plus size={16} />} onClick={() => router.push("/applications/add")}>
                  Register application
                </Button>
              )
            }
          />
        }
      />

      <ConfirmDialog
        open={!!statusTarget}
        title={statusTarget?.status === "Active" ? "Deactivate application" : "Activate application"}
        message={
          statusTarget?.status === "Active"
            ? `Deactivate "${statusTarget?.name}"? Accounts will not be able to sign in to it until it is activated again.`
            : `Activate "${statusTarget?.name}"? Accounts with access will be able to sign in to it again.`
        }
        tone={statusTarget?.status === "Active" ? "danger" : "default"}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleConfirmStatus}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Deletion Confirmation"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Accounts with SSO access to it will lose that access.`}
        tone="danger"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

/**
 * `useInitialFilters` reads `useSearchParams`, which suspends while this
 * statically-prerendered route is being generated — so the boundary is
 * required, not decorative. `null` as the fallback because the content below
 * renders its own loading state a moment later anyway.
 */
export default function ApplicationsPage() {
  return (
    <Suspense fallback={null}>
      <ApplicationsPageContent />
    </Suspense>
  );
}
