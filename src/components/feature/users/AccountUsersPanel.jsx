import * as React from "react";
import { Users as UsersIcon, Eye } from "lucide-react";
import { Button } from "../../common/Button";
import { EmptyState } from "../../common/EmptyState";
import { Loader } from "../../common/Loader";
import { MobileTableWrapper } from "../../common/MobileTableWrapper";
import { Panel } from "../../common/Panel";
import { StatusBadge, ToggleStateBadge } from "../../common/Badge";
import { TableIdentityCell } from "../../common/TableIdentityCell";
import { RoleBadges } from "../../common/RoleBadges";

/**
 * The users belonging to one account, displayed in a panel.
 */
export function AccountUsersPanel({
  accountId,
  accountName,
  listByAccount,
  users: propUsers,
  onNavigate,
}) {
  const [users, setUsers] = React.useState(propUsers || null);
  const [error, setError] = React.useState(null);

  const load = React.useCallback(() => {
    if (propUsers) {
      setUsers(propUsers);
      return;
    }
    if (!listByAccount) return;
    listByAccount(accountId)
      .then((res) => {
        setUsers(Array.isArray(res) ? res : res?.items || []);
        setError(null);
      })
      .catch((err) => {
        setUsers([]);
        setError(err?.message || "Could not load this account's users.");
      });
  }, [accountId, listByAccount, propUsers]);

  React.useEffect(() => {
    load();
  }, [load]);

  function navigateTo(path) {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== "undefined") {
      window.location.href = path;
    }
  }

  const columns = [
    {
      key: "username",
      header: "USER",
      size: "lg",
      sortable: false,
      render: (r) => (
        <TableIdentityCell name={`${r.firstName || ""} ${r.lastName || ""}`.trim() || r.username} />
      ),
    },
    {
      key: "email",
      header: "EMAIL",
      size: "lg",
      sortable: false,
      render: (r) => <span className="font-mono text-xs">{r.email || "—"}</span>,
    },
    {
      key: "roles",
      header: "ROLES",
      align: "center",
      size: "xs",
      sortable: false,
      render: (r) => <RoleBadges roles={r.roles} />,
    },
    {
      key: "twoFactor",
      header: "2FA",
      align: "center",
      size: "xs",
      sortable: false,
      render: (r) => <ToggleStateBadge on={r.twoFactorEnabled} />,
    },
    {
      key: "status",
      header: "STATUS",
      size: "sm",
      sortable: false,
      render: (r) => <StatusBadge active={r.status === "Active"} />,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      size: "xs",
      render: (r) => (
        <Button size="sm" variant="secondary" icon={<Eye size={14} />} onClick={() => navigateTo(`/users/${r.id}`)}>
          Open
        </Button>
      ),
    },
  ];

  if (users === null) {
    return (
      <Panel variant="detail">
        <div className="py-8">
          <Loader label="Loading users..." />
        </div>
      </Panel>
    );
  }

  return (
    <Panel
      variant="detail"
      actions={
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setUsers(null);
            load();
          }}
        >
          Refresh
        </Button>
      }
    >
      {error && (
        <div role="alert" className="mb-3 rounded-control border border-status-offline bg-status-offline-bg px-4 py-3 text-body-sm text-status-offline">
          {error}
        </div>
      )}

      {users.length === 0 && !error ? (
        <EmptyState
          icon={<UsersIcon size={18} />}
          title="No users in this account"
          description="Add a user from the Users screen and assign them to this account."
          action={
            <Button size="sm" variant="primary" onClick={() => navigateTo("/users")}>
              Go to Users
            </Button>
          }
        />
      ) : (
        <MobileTableWrapper
          density="standard"
          headerAlign="left"
          columns={columns}
          data={users}
          rowKey={(r) => r.id}
          primaryFields={["username", "email", "status"]}
          hideMobileSearch
          hideMobileToolbar
          emptyMessage="No users in this account."
        />
      )}
    </Panel>
  );
}

