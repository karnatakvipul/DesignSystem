import * as React from "react";
import { SearchBox } from "../../components/common/SearchBox";
import { Panel } from "../../components/common/Panel";
import { TableToolbar } from "../../components/common/TableToolbar";
import { DataTable } from "../../components/common/DataTable";
import { Pagination } from "../../components/common/Pagination";
import { IconButton } from "../../components/common/IconButton";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { MobileTableWrapper } from "../../components/common/MobileTableWrapper";
import { useServerDataBinding } from "../../lib/useServerDataBinding";
import { useServerDataContext } from "../../lib/ServerDataProvider";

/**
 * Shared master list page used by LicenseTypePage, LicenseTermPage and ProductTypePage.
 * Supports both local state mode and server-side data binding mode.
 */
export function MasterListPage({
  title = "Master List",
  items = [],
  setItems = () => {},
  columns = [],
  FormModal = () => null,
  addLabel = "Add Record",
  showStatusToggle,
  fetcher: propFetcher,
  serverSide: propServerSide,
  endpointKey,
  onCreate,
  onUpdate,
  onDelete,
  onToast,
}) {
  const context = useServerDataContext();
  const contextFetcher = endpointKey ? context?.getEndpointFetcher?.(endpointKey) : null;
  const activeFetcher = propFetcher || contextFetcher;
  const isServerSide = propServerSide ?? !!activeFetcher;

  const [search, setSearch] = React.useState("");
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [deleteTarget, setDeleteTarget] = React.useState(null);

  const serverBinding = useServerDataBinding({
    fetcher: activeFetcher || (() => Promise.resolve({ data: [], total: 0 })),
    autoFetch: isServerSide,
  });

  // Destructured because `serverBinding` is a new object every render and
  // cannot go in a dependency array without looping. These setters are stable,
  // so the effects below can depend on exactly what they use.
  const { setSearch: serverSetSearch } = serverBinding;

  React.useEffect(() => {
    if (isServerSide) {
      serverSetSearch(search);
    }
  }, [search, isServerSide, serverSetSearch]);

  const filteredLocal = React.useMemo(() => {
    return (items || []).filter((i) =>
      (i?.name || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const displayData = isServerSide ? serverBinding.data : filteredLocal;
  const loading = isServerSide ? serverBinding.loading : false;
  const error = isServerSide ? serverBinding.error : null;

  async function handleSaveItem(form) {
    try {
      if (editing) {
        if (onUpdate) {
          await onUpdate(editing, form);
        } else {
          setItems((rows) => rows.map((r) => (r.id === editing.id ? { ...r, ...form } : r)));
        }
        onToast?.(`${title} updated`);
      } else {
        if (onCreate) {
          await onCreate(form);
        } else {
          setItems((rows) => [{ id: Date.now(), status: "Active", ...form }, ...rows]);
        }
        onToast?.(`${title} added`);
      }
      if (isServerSide) {
        serverBinding.refetch();
      }
      setFormOpen(false);
    } catch (err) {
      onToast?.(err?.message || `Failed to save ${title}`);
    }
  }

  async function handleToggleStatus(item) {
    const next = { ...item, status: item.status === "Active" ? "Deactivated" : "Active" };
    try {
      if (onUpdate) {
        await onUpdate(item, next);
      } else {
        setItems((rows) => rows.map((r) => (r.id === item.id ? next : r)));
      }
      onToast?.(`${next.status === "Active" ? "Activated" : "Deactivated"} ${title}`);
      if (isServerSide) {
        serverBinding.refetch();
      }
    } catch (err) {
      onToast?.(err?.message || `Failed to update ${title} status`);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    try {
      if (onDelete) {
        await onDelete(deleteTarget);
      } else {
        setItems((rows) => rows.filter((r) => r.id !== deleteTarget.id));
      }
      onToast?.(`${title} deleted`);
      if (isServerSide) {
        serverBinding.refetch();
      }
      setDeleteTarget(null);
    } catch (err) {
      onToast?.(err?.message || `Failed to delete ${title}`);
    }
  }

  const dataTableColumns = [
    ...columns,
    ...(showStatusToggle
      ? [
          {
            key: "status",
            header: "STATUS",
            render: (r) => (
              <Badge tone={r.status === "Active" ? "online" : "offline"}>{r.status}</Badge>
            ),
          },
        ]
      : []),
    {
      key: "actions",
      header: "",
      align: "right",
      render: (r) => (
        <div className="flex justify-end gap-1">
          <IconButton
            icon={<Pencil size={14} />}
            label="Edit"
            size="sm"
            onClick={() => {
              setEditing(r);
              setFormOpen(true);
            }}
          />
          {showStatusToggle && (
            <IconButton
              icon={r.status === "Active" ? <X size={14} /> : <Check size={14} />}
              label={r.status === "Active" ? "Deactivate" : "Activate"}
              size="sm"
              onClick={() => handleToggleStatus(r)}
            />
          )}
          <IconButton
            icon={<Trash2 size={14} />}
            label="Delete"
            size="sm"
            variant="danger"
            onClick={() => setDeleteTarget(r)}
          />
        </div>
      ),
    },
  ];

  const primaryKeys = columns.map((c) => c.key).concat(showStatusToggle ? ["status"] : []);

  const actionMenuItems = [
    {
      label: "Edit",
      icon: <Pencil size={16} />,
      onClick: (r) => {
        setEditing(r);
        setFormOpen(true);
      },
    },
    {
      label: "Delete",
      icon: <Trash2 size={16} />,
      onClick: (r) => setDeleteTarget(r),
      danger: true,
    },
  ];

  return (
    <div className="flex flex-col gap-4 w-full min-w-0">
      <Panel title={title}>
        <TableToolbar
          start={<SearchBox value={search} onChange={setSearch} className="max-w-xs" />}
          end={
            <Button
              size="sm"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              {addLabel}
            </Button>
          }
        />

        {/* Desktop DataTable with horizontal scroll container */}
        <div className="hidden md:block w-full overflow-x-auto min-w-0">
          <DataTable
            columns={dataTableColumns}
            data={displayData}
            loading={loading}
            error={error}
            onRetry={isServerSide ? serverBinding.refetch : undefined}
            serverSide={isServerSide}
            sortKey={isServerSide ? serverBinding.sortKey : undefined}
            sortDirection={isServerSide ? serverBinding.sortDirection : undefined}
            onSortChange={isServerSide ? serverBinding.setSort : undefined}
            rowKey={(r) => r.id}
            emptyMessage="No records found."
          />
        </div>

        {/* Mobile Low-Density Card List */}
        <div className="md:hidden">
          <MobileTableWrapper
            columns={dataTableColumns}
            data={displayData}
            loading={loading}
            error={error}
            onRetry={isServerSide ? serverBinding.refetch : undefined}
            rowKey={(r) => r.id}
            primaryFields={primaryKeys}
            actionMenuItems={actionMenuItems}
            mobileSearchValue={search}
            onMobileSearchChange={setSearch}
            hideMobileSearch={true}
            emptyMessage="No records found."
          />
        </div>

        {/* Server Pagination */}
        {isServerSide && (
          <Pagination
            page={serverBinding.page}
            pageSize={serverBinding.pageSize}
            total={serverBinding.total}
            onPageChange={serverBinding.setPage}
            onPageSizeChange={(newSize) => {
              serverBinding.setPageSize(newSize);
              serverBinding.setPage(1);
            }}
          />
        )}
      </Panel>

      <FormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        item={editing}
        onSave={handleSaveItem}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Deletion Confirmation"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        tone="danger"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}