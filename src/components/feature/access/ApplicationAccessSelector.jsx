import * as React from "react";
import { Boxes } from "lucide-react";
import { Checkbox } from "../../common/Checkbox";
import { Badge } from "../../common/Badge";

export function ApplicationAccessSelector({
  applications = [],
  selectedClientIds = [],
  onChange,
  disabled = false,
}) {
  function toggle(clientId, on) {
    if (disabled) return;
    onChange?.(on ? [...selectedClientIds, clientId] : selectedClientIds.filter((x) => x !== clientId));
  }

  if (applications.length === 0) {
    return <p className="text-body-sm text-ink-muted">No applications registered yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {applications.map((app) => {
        const isChecked = selectedClientIds.includes(app.clientId);
        return (
          <div
            key={app.id || app.clientId}
            className="rounded-control border border-card-border px-3 py-2.5 transition-colors hover:bg-accent-muted/30"
          >
            <Checkbox
              checked={isChecked}
              disabled={disabled}
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
        );
      })}
    </div>
  );
}

