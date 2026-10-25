import * as React from "react";
import { Modal } from "../../common/Modal";
import { Button } from "../../common/Button";
import { InputField } from "../../common/InputField";

/** Asks for a ticket number before an action. */
export function ValidateTicketModal({ open, onClose, onConfirm }) {
  const [ticket, setTicket] = React.useState("");

  React.useEffect(() => {
    if (open) setTicket("");
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Validate Ticket"
      size="sm"
      footer={
        <>
          <Button variant="cancel" onClick={onClose}>Close</Button>
          <Button variant="primary" disabled={!ticket.trim()} onClick={() => { onConfirm(ticket); setTicket(""); }}>Ok</Button>
        </>
      }
    >
      <InputField label="Ticket number" required placeholder="e.g. TCK-10234" value={ticket} onChange={(e) => setTicket(e.target.value)} />
    </Modal>
  );
}
