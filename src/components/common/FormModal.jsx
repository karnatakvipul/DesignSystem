import { Modal } from "./Modal";
import { Button } from "./Button";
function FormModal({
  open,
  onClose,
  onSubmit,
  title,
  size = "md",
  submitLabel = "Ok",
  cancelLabel = "Close",
  submitting,
  submitDisabled,
  children
}) {
  return <Modal
    open={open}
    onClose={onClose}
    title={title}
    size={size}
    footer={<>
          <Button variant="cancel" onClick={onClose} disabled={submitting}>
            {cancelLabel}
          </Button>
          <Button variant="primary" onClick={onSubmit} loading={submitting} disabled={submitDisabled}>
            {submitLabel}
          </Button>
        </>}
  >
      <form
    onSubmit={(e) => {
      e.preventDefault();
      onSubmit();
    }}
    className="flex flex-col gap-4"
  >
        {children}
      </form>
    </Modal>;
}
export {
  FormModal
};
