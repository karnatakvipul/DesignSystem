import * as React from "react";
import { ConfirmDialog } from "../../common/ConfirmDialog";

/** Confirms cancelling a proforma invoice. */
export function CancelPiModal({ open, onClose, onConfirm, invoiceNo }) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title="Cancel Performa Invoice"
      message={`Are you sure you want to cancel ${invoiceNo || "this performa invoice"}?`}
      tone="danger"
      onConfirm={onConfirm}
    />
  );
}
