import { Modal } from "./Modal";
import { Button } from "./Button";
function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Ok",
  cancelLabel = "Close",
  tone = "default",
  onConfirm,
  onClose,
  loading
}) {
  return <Modal
    open={open}
    onClose={onClose}
    title={title}
    size="sm"
    footer={<>
          <Button variant="cancel" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>}
  >
      <p className="text-body text-ink-secondary">{message}</p>
    </Modal>;
}
export {
  ConfirmDialog
};
