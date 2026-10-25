import * as React from "react";
import { FormModal } from "../../common/FormModal";
import { InputField } from "../../common/InputField";

/** Small form to add or edit a license term name. */
export function LicenseTermFormModal({ open, onClose, item, onSave }) {
  const [name, setName] = React.useState(item?.name ?? "");
  React.useEffect(() => setName(item?.name ?? ""), [item, open]);
  return (
    <FormModal open={open} onClose={onClose} onSubmit={() => onSave({ name })} title={item ? "Edit License Term" : "Add License Term"} size="sm" submitDisabled={!name.trim()}>
      <InputField label="Term Name" required placeholder="e.g. Yearly" value={name} onChange={(e) => setName(e.target.value)} />
    </FormModal>
  );
}
