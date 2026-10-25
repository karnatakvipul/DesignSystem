import * as React from "react";
import { FormModal } from "../../common/FormModal";
import { InputField } from "../../common/InputField";

/** Small form to add or edit a product name. */
export function ProductTypeFormModal({ open, onClose, item, onSave }) {
  const [name, setName] = React.useState(item?.name ?? "");
  React.useEffect(() => setName(item?.name ?? ""), [item, open]);
  return (
    <FormModal open={open} onClose={onClose} onSubmit={() => onSave({ name })} title={item ? "Edit Product" : "Add Product"} size="sm" submitDisabled={!name.trim()}>
      <InputField label="Product Name" required placeholder="e.g. SLS Pro" value={name} onChange={(e) => setName(e.target.value)} />
    </FormModal>
  );
}
