import * as React from "react";
import { Checkbox } from "../../common/Checkbox";
import { Button } from "../../common/Button";

const ALL_PERMISSIONS = ["View Licenses", "Edit Licenses", "Delete Licenses", "Manage Users", "View Reports", "Manage Billing"];

/** Multi-select list to allow or change a user permissions. */
export function PermissionEditor({ permissions, onSave }) {
  const [selected, setSelected] = React.useState(permissions ?? []);
  React.useEffect(() => setSelected(permissions ?? []), [permissions]);

  function toggle(p) {
    setSelected((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {ALL_PERMISSIONS.map((p) => (
          <Checkbox key={p} label={p} checked={selected.includes(p)} onChange={() => toggle(p)} />
        ))}
      </div>
      <Button size="sm" variant="primary" className="self-start" onClick={() => onSave(selected)}>
        Save Permissions
      </Button>
    </div>
  );
}
