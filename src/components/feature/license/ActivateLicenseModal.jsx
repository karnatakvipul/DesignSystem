import * as React from "react";
import { Modal } from "../../common/Modal";
import { Button } from "../../common/Button";
import { DatePicker } from "../../common/DatePicker";

/** Sets the activation date to activate a license. */
export function ActivateLicenseModal({ open, onClose, onConfirm }) {
  const [date, setDate] = React.useState(null);

  React.useEffect(() => {
    if (open) setDate(null);
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Activate License"
      size="sm"
      footer={
        <>
          <Button variant="cancel" onClick={onClose}>Close</Button>
          <Button variant="add" disabled={!date} onClick={() => { onConfirm(date); setDate(null); }}>Ok</Button>
        </>
      }
    >
      <DatePicker label="Activation date" required value={date} onChange={setDate} />
    </Modal>
  );
}
