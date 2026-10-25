import * as React from "react";
import { Boxes } from "lucide-react";
import { Modal } from "../../common/Modal";
import { Button } from "../../common/Button";
import { Checkbox } from "../../common/Checkbox";
import { Badge } from "../../common/Badge";

/** The "Manage application access" checkbox modal from the Account details screen. */
export function ManageApplicationAccessModal({
  open,
  onClose,
  applications = [],
  selectedIds = [],
  onSave,
}) {
  const [checked, setChecked] = React.useState(selectedIds);
  const [resetKey, setResetKey] = React.useState({ open, selectedIds });

  if (resetKey.open !== open || resetKey.selectedIds !== selectedIds) {
    setResetKey({ open, selectedIds });
    setChecked(selectedIds);
  }

  function toggle(clientId, on) {
    setChecked((cur) => (on ? [...cur, clientId] : cur.filter((x) => x !== clientId)));
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Manage application access"
      size="sm"
      footer={
        <>
          <Button variant="cancel" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={async () => {
              await onSave?.(checked);
              onClose();
            }}
          >
            Save
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        {applications.map((app) => (
          <div
            key={app.id || app.clientId}
            className="rounded-control border border-card-border px-3 py-2.5 transition-colors hover:bg-accent-muted/30"
          >
            <Checkbox
              checked={checked.includes(app.clientId)}
              onChange={(e) => toggle(app.clientId, e.target.checked)}
              label={
                <span className="flex flex-1 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-accent-muted text-accent">
                    <Boxes size={14} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-body-sm font-medium text-ink-primary">{app.name}</span>
                    <code className="text-xs text-ink-muted">{app.clientId}</code>
                  </span>
                  <Badge tone={app.status === "Active" ? "online" : "offline"}>{app.status}</Badge>
                </span>
              }
            />
          </div>
        ))}
        {applications.length === 0 && <p className="text-body-sm text-ink-muted">No applications registered yet.</p>}
      </div>
    </Modal>
  );
}
