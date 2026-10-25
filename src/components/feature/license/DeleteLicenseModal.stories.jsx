import * as React from "react";
import { DeleteLicenseModal } from "./DeleteLicenseModal";
import { Button } from "../../common/Button";

/**
 * Confirms deleting one or more licences, capturing the reason.
 *
 * The reason is the point: a deleted licence is gone from the table but its
 * audit entry survives, and "why" is the part nobody can reconstruct later.
 * It is cleared on every open so one deletion's reason cannot be attributed to
 * the next.
 *
 * In the app, confirming here opens `ValidateTicketModal` — the deletion only
 * goes through once a ticket number has been attached to it.
 */
const meta = {
  title: "Feature/License/DeleteLicenseModal",
  component: DeleteLicenseModal,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "closed" },
    onConfirm: { action: "confirmed", description: "Receives the typed reason." },
  },
  args: { open: true },
};

export default meta;

export const Playground = {};

/** Opened from a button, showing the reason that comes back. */
export const Interactive = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    const [reason, setReason] = React.useState(null);
    return (
      <>
        <Button variant="danger" onClick={() => setOpen(true)}>
          Delete licence
        </Button>
        <p className="mt-3 font-mono text-body-sm text-ink-muted">
          Reason: {reason === null ? "(nothing yet)" : reason || "(left blank)"}
        </p>
        <DeleteLicenseModal
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={(r) => {
            setReason(r);
            setOpen(false);
          }}
        />
      </>
    );
  },
};

export const Closed = { args: { open: false } };
