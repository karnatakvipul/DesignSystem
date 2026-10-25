import * as React from "react";
import { ValidateTicketModal } from "./ValidateTicketModal";
import { Button } from "../../common/Button";

/**
 * The ticket-number gate in front of every destructive licence action.
 *
 * Delete, Activate, Deactivate and Cancel PI all funnel through here: the page
 * holds the pending action, opens this, and only dispatches once a ticket
 * number has been supplied. That is what ties every change in the audit trail
 * back to a request someone actually raised.
 *
 * The field is cleared on every open, so one action's ticket cannot be
 * attached to the next.
 */
const meta = {
  title: "Feature/License/ValidateTicketModal",
  component: ValidateTicketModal,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "closed", description: "Should also discard the pending action." },
    onConfirm: { action: "confirmed", description: "Receives the ticket number." },
  },
  args: { open: true },
};

export default meta;

export const Playground = {};

/**
 * The real flow: a destructive action is held until a ticket is supplied.
 * Cancelling must discard the pending action, not silently keep it queued.
 */
export const GatingAPendingAction = {
  render: function Render() {
    const [pending, setPending] = React.useState(null);
    const [log, setLog] = React.useState(null);
    return (
      <>
        <div className="flex gap-2">
          <Button variant="danger" onClick={() => setPending({ type: "delete", ids: [1, 2] })}>
            Delete 2 licences
          </Button>
          <Button variant="secondary" onClick={() => setPending({ type: "deactivate", ids: [3] })}>
            Deactivate 1 licence
          </Button>
        </div>
        <p className="mt-3 font-mono text-body-sm text-ink-muted">
          {log ?? "(no action dispatched yet)"}
        </p>
        <ValidateTicketModal
          open={!!pending}
          onClose={() => {
            setPending(null);
            setLog("Cancelled — pending action discarded.");
          }}
          onConfirm={(ticket) => {
            setLog(`${pending.type} → ids [${pending.ids}] with ticket ${ticket || "(blank)"}`);
            setPending(null);
          }}
        />
      </>
    );
  },
};

export const Closed = { args: { open: false } };
