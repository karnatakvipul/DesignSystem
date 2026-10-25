import * as React from "react";
import { Modal } from "../../common/Modal";
import { Button } from "../../common/Button";
import { InputField } from "../../common/InputField";

/** Asks for a reason before deleting a license. */
export function DeleteLicenseModal({ open, onClose, onConfirm }) {
  const [reason, setReason] = React.useState("");

  React.useEffect(() => {
    if (open) setReason("");
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Deletion Confirmation"
      size="sm"
      footer={
        <>
          <Button variant="cancel" onClick={onClose}>Close</Button>
          <Button variant="danger" disabled={!reason.trim()} onClick={() => { onConfirm(reason); setReason(""); }}>Ok</Button>
        </>
      }
    >
      <p className="mb-3 text-body text-ink-secondary">Are you sure you want to delete the license?</p>
      <InputField label="Reason" required placeholder="Reason for deletion" value={reason} onChange={(e) => setReason(e.target.value)} />
    </Modal>
  );
}
