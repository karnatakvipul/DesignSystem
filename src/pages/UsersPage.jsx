import * as React from "react";
import { SlidersHorizontal, Pencil, UserX, UserCheck } from "lucide-react";
import { Panel } from "../components/common/Panel";
import { TableToolbar } from "../components/common/TableToolbar";
import { DataTable } from "../components/common/DataTable";
import { Pagination } from "../components/common/Pagination";
import { SearchBox } from "../components/common/SearchBox";
import { IconButton } from "../components/common/IconButton";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { FloatingAddButton } from "../components/common/FloatingAddButton";
import { UserFormModal, UsersFilter } from "../components/feature/users";
import { makeInitialUsers } from "../data/mock";
import { MobileTableWrapper } from "../components/common/MobileTableWrapper";
import { useServerDataBinding } from "../lib/useServerDataBinding";
import { useServerDataContext } from "../lib/ServerDataProvider";

/**
 * UsersPage Component.
 * Supports both client-side mode and enterprise server-side data binding mode.
 *
 * @param {Object} props
 * @param {Function} [props.fetcher] Custom server fetcher ({ page, pageSize, sortKey, sortDirection, search, filters }) => Promise<{ data, total }>
 * @param {boolean} [props.serverSide] Explicit toggle for server-side data binding
 * @param {Function} [props.onCreate] Callback when user is created (form) => Promise<void>
 * @param {Function} [props.onUpdate] Callback when user is updated (user, form) => Promise<void>
 * @param {Function} [props.onDelete] Callback when user is deactivated/deleted (user) => Promise<void>
 * @param {Array} [props.initialData] Initial local data
 * @param {Function} [props.onToast] Toast callback
 */
export function UsersPage({
  fetcher: propFetcher,
  serverSide: propServerSide,
  onCreate,
  onUpdate,
  onDelete,
  initialData,
  onToast,
}) {
  const context = useServerDataContext();
  const contextFetcher = context?.getEndpointFetcher?.("users");
  const activeFetcher = propFetcher || contextFetcher;
  const isServerSide = propServerSide ?? !!activeFetcher;

  // Local state fallback
  const [localUsers, setLocalUsers] = React.useState(initialData || makeInitialUsers);
  const [search, setSearch] = React.useState("");
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [filters, setFilters] = React.useState({});
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [deactivateTarget, setDeactivateTarget] = React.useState(null);

  // Server-side data binding hook
  const serverBinding = useServerDataBinding({
    fetcher: activeFetcher || (() => Promise.resolve({ data: [], total: 0 })),
    autoFetch: isServerSide,
  });

  // Destructured because `serverBinding` is a new object every render and
  // cannot go in a dependency array without looping. These setters are stable,
  // so the effects below can depend on exactly what they use.
  const { setSearch: serverSetSearch, setFilters: serverSetFilters } = serverBinding;

  // Keep search and filters synced with serverBinding in server mode
  React.useEffect(() => {
    if (isServerSide) {
      serverSetSearch(search);
    }
  }, [search, isServerSide, serverSetSearch]);

  React.useEffect(() => {
    if (isServerSide) {
      serverSetFilters(filters);
    }
  }, [filters, isServerSide, serverSetFilters]);

  // Client-side filtering fallback
  const filteredLocal = React.useMemo(() => {
    return localUsers.filter((u) => {
      const q = search.toLowerCase();
      const textMatch = `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(q);
      if (!textMatch) return false;
      if (filters.name && !u.name.toLowerCase().includes(String(filters.name).toLowerCase())) return false;
      if (filters.status && u.status !== filters.status) return false;
      if (filters.role && u.role !== filters.role) return false;
      return true;
    });
  }, [localUsers, search, filters]);

  const displayData = isServerSide ? serverBinding.data : filteredLocal;
  const loading = isServerSide ? serverBinding.loading : false;
  const error = isServerSide ? serverBinding.error : null;

  async function handleSaveUser(form) {
    try {
      if (editing) {
        if (onUpdate) {
          await onUpdate(editing, form);
        } else {
          setLocalUsers((us) => us.map((u) => (u.id === editing.id ? { ...u, ...form } : u)));
        }
        onToast?.("User updated");
      } else {
        if (onCreate) {
          await onCreate(form);
        } else {
          setLocalUsers((us) => [{ id: Date.now(), status: "Active", ...form }, ...us]);
        }
        onToast?.("User added");
      }
      if (isServerSide) {
        serverBinding.refetch();
      }
      setFormOpen(false);
    } catch (err) {
      onToast?.(err?.message || "Failed to save user");
    }
  }

  async function handleToggleActive(user) {
    try {
      const next = { ...user, status: user.status === "Active" ? "Deactivated" : "Active" };
      if (onUpdate) {
        await onUpdate(user, next);
      } else {
        setLocalUsers((us) => us.map((u) => (u.id === user.id ? next : u)));
      }
      onToast?.(`User ${next.status === "Active" ? "activated" : "deactivated"}`);
      if (isServerSide) {
        serverBinding.refetch();
      }
    } catch (err) {
      onToast?.(err?.message || `Failed to ${user.status === "Active" ? "deactivate" : "activate"} user`);
    }
  }

  async function handleConfirmDeactivate() {
    if (!deactivateTarget) return;
    try {
      if (onDelete) {
        await onDelete(deactivateTarget);
      } else {
        setLocalUsers((us) =>
          us.map((u) => (u.id === deactivateTarget.id ? { ...u, status: "Deactivated" } : u))
        );
      }
      onToast?.("User deactivated");
      if (isServerSide) {
        serverBinding.refetch();
      }
      setDeactivateTarget(null);
    } catch (err) {
      onToast?.(err?.message || "Failed to deactivate user");
    }
  }

  const dataTableColumns = [
    { key: "name", header: "NAME", sortable: true, render: (u) => u.name },
    { key: "email", header: "EMAIL", render: (u) => u.email },
    { key: "role", header: "ROLE", render: (u) => u.role },
    {
      key: "status",
      header: "STATUS",
      render: (u) => (
        <Badge tone={u.status === "Active" ? "online" : "offline"}>{u.status}</Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (u) => (
        <div className="flex justify-end gap-1">
          <IconButton
            icon={<Pencil size={14} />}
            label="Edit"
            size="sm"
            onClick={() => {
              setEditing(u);
              setFormOpen(true);
            }}
          />
          {u.status === "Active" ? (
            <IconButton
              icon={<UserX size={14} />}
              label="Deactivate"
              size="sm"
              variant="danger"
              onClick={() => setDeactivateTarget(u)}
            />
          ) : (
            <IconButton
              icon={<UserCheck size={14} />}
              label="Activate"
              size="sm"
              onClick={() => handleToggleActive(u)}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 w-full min-w-0">
      <Panel title="Users">
        <TableToolbar
          start={
            <>
              <SearchBox value={search} onChange={setSearch} className="max-w-xs" />
              <IconButton
                icon={<SlidersHorizontal size={16} />}
                label="Filters"
                onClick={() => setFilterOpen((v) => !v)}
              />
            </>
          }
          end={
            <Button
              size="sm"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              Add User
            </Button>
          }
        />

        {filterOpen && (
          <UsersFilter
            open={filterOpen}
            filters={filters}
            onChange={setFilters}
            onSearch={() => setFilterOpen(false)}
            onClear={() => {
              setFilters({});
              setFilterOpen(false);
            }}
          />
        )}

        {/* Desktop DataTable */}
        <div className="hidden md:block">
          <DataTable
            columns={dataTableColumns}
            data={displayData}
            loading={loading}
            error={error}
            onRetry={serverBinding.refetch}
            serverSide={isServerSide}
            sortKey={isServerSide ? serverBinding.sortKey : undefined}
            sortDirection={isServerSide ? serverBinding.sortDirection : undefined}
            onSortChange={isServerSide ? serverBinding.setSort : undefined}
            rowKey={(u) => u.id}
            emptyMessage="No users found."
          />
        </div>

        {/* Mobile Low-Density Card List */}
        <div className="md:hidden">
          <MobileTableWrapper
            columns={dataTableColumns}
            data={displayData}
            loading={loading}
            rowKey={(u) => u.id}
            primaryFields={["name", "email", "role"]}
            actionMenuItems={[
              {
                label: "Edit User",
                icon: <Pencil size={16} />,
                onClick: (u) => {
                  setEditing(u);
                  setFormOpen(true);
                },
              },
              {
                label: "Deactivate",
                icon: <UserX size={16} />,
                onClick: (u) => setDeactivateTarget(u),
                danger: true,
              },
            ]}
            mobileSearchValue={search}
            onMobileSearchChange={setSearch}
            hideMobileSearch={true}
            emptyMessage="No users found."
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

      <UserFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        user={editing}
        onSave={handleSaveUser}
      />

      <ConfirmDialog
        open={!!deactivateTarget}
        title="Deactivation Confirmation"
        message={`Are you sure you want to deactivate ${deactivateTarget?.name}?`}
        tone="danger"
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleConfirmDeactivate}
      />

      <FloatingAddButton
        label="Add User"
        onClick={() => {
          setEditing(null);
          setFormOpen(true);
        }}
      />
    </div>
  );
}