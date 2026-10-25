import * as React from "react";
import { ConfirmDialog } from "../../common/ConfirmDialog";

/** Confirms and deactivates one or more licenses. */
export function DeactivateLicenseModal({ open, onClose, onConfirm, count = 1 }) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title="Deactivation Confirmation"
      message={`Are you sure you want to deactivate ${count} license${count > 1 ? "s" : ""}?`}
      tone="danger"
      onConfirm={onConfirm}
    />
  );
}
