import * as React from "react";
import { Card } from "../components/common/Card";
import { Panel } from "../components/common/Panel";
import { Badge } from "../components/common/Badge";
import { InputField } from "../components/common/InputField";
import { Button } from "../components/common/Button";
import { User } from "lucide-react";
import { ChangePasswordModal, PermissionEditor, ProfileActions } from "../components/feature/profile";

const DEFAULT_USER = {
  name: "Super Admin",
  email: "admin@my Design System.com",
  role: "Super Admin",
  status: "Active",
  permissions: ["View Licenses", "Edit Licenses", "Manage Users", "View Reports"],
};

/**
 * Shows a user detail, status and permissions with edit options.
 *
 * Backend wiring is optional:
 * - Pass a `user` object (`{ name, email, role, status, permissions }`) to
 *   display real account data instead of the bundled demo user.
 * - Pass `onUpdateProfile(patch)` (async, e.g. `(patch) => api.patch(...)`)
 *   to persist name/permission edits to your backend. Without it, edits are
 *   kept in local state only (demo behavior).
 * - Pass `onChangePassword(password)` (async) to send the new password to
 *   your backend. Without it, the Change Password modal just closes locally.
 *
 * Note: this page only edits the *current, already-authenticated* user's own
 * profile fields (display name, permissions, password) — it is not a
 * login/auth screen and does not implement authentication.
 */
export function UserProfilePage({ onToast, user, onUpdateProfile, onChangePassword }) {
  const [profile, setProfile] = React.useState(user || DEFAULT_USER);

  React.useEffect(() => {
    if (user) setProfile(user);
  }, [user]);

  const [name, setName] = React.useState(profile.name);
  const [renaming, setRenaming] = React.useState(false);
  const [savingName, setSavingName] = React.useState(false);
  const [permissionEditorOpen, setPermissionEditorOpen] = React.useState(false);
  const [passwordOpen, setPasswordOpen] = React.useState(false);

  React.useEffect(() => {
    if (!renaming) setName(profile.name);
  }, [profile.name, renaming]);

  async function handleSaveName() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSavingName(true);
    try {
      if (onUpdateProfile) {
        await onUpdateProfile({ name: trimmed });
      }
      setProfile((p) => ({ ...p, name: trimmed }));
      setRenaming(false);
      onToast?.("Name updated");
    } catch (err) {
      onToast?.(err?.message || "Failed to update name");
    } finally {
      setSavingName(false);
    }
  }

  async function handleSavePermissions(next) {
    try {
      if (onUpdateProfile) {
        await onUpdateProfile({ permissions: next });
      }
      setProfile((p) => ({ ...p, permissions: next }));
      setPermissionEditorOpen(false);
      onToast?.("Permissions updated");
    } catch (err) {
      onToast?.(err?.message || "Failed to update permissions");
    }
  }

  async function handleSavePassword(password) {
    try {
      if (onChangePassword) {
        await onChangePassword(password);
      }
      setPasswordOpen(false);
      onToast?.("Password changed");
    } catch (err) {
      onToast?.(err?.message || "Failed to change password");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="flex flex-col items-center py-6 text-center lg:col-span-1">
        <span className="mb-3 flex h-16 w-16 items-center justify-center rounded-pill bg-accent-muted text-accent">
          <User size={28} />
        </span>
        {renaming ? (
          <div className="flex w-full flex-col gap-2 px-4">
            <InputField value={name} onChange={(e) => setName(e.target.value)} />
            <Button size="sm" onClick={handleSaveName} disabled={savingName || !name.trim()}>
              {savingName ? "Saving..." : "Save"}
            </Button>
          </div>
        ) : (
          <p className="font-secondary text-title font-semibold text-ink-primary">{profile.name}</p>
        )}
        <p className="text-body text-ink-muted">{profile.email}</p>
        <div className="mt-2">
          <Badge tone={profile.status === "Active" ? "online" : "offline"}>{profile.status}</Badge>
        </div>
        <div className="mt-4 w-full border-t border-card-border pt-3">
          <ProfileActions
            onRename={() => setRenaming(true)}
            onChangePermission={() => setPermissionEditorOpen((v) => !v)}
            onChangePassword={() => setPasswordOpen(true)}
          />
        </div>
      </Card>

      <div className="flex flex-col gap-6 lg:col-span-2">
        <Panel title="Role & Status">
          <div className="grid grid-cols-2 gap-4 text-body">
            <div>
              <p className="text-ink-muted">Role</p>
              <p className="font-medium text-ink-primary">{profile.role}</p>
            </div>
            <div>
              <p className="text-ink-muted">Status</p>
              <p className="font-medium text-ink-primary">{profile.status}</p>
            </div>
          </div>
        </Panel>

        {permissionEditorOpen && (
          <Panel title="Permissions">
            <PermissionEditor
              permissions={profile.permissions}
              onSave={handleSavePermissions}
            />
          </Panel>
        )}

        {!permissionEditorOpen && (
          <Panel title="Permissions">
            <div className="flex flex-wrap gap-2">
              {profile.permissions.map((p) => (
                <Badge key={p} tone="accent">{p}</Badge>
              ))}
            </div>
          </Panel>
        )}
      </div>

      <ChangePasswordModal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
        onSave={handleSavePassword}
      />
    </div>
  );
}
