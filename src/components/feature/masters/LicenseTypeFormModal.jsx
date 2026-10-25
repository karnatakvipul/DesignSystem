import * as React from "react";
import { FormModal } from "../../common/FormModal";
import { InputField } from "../../common/InputField";
import { Dropdown } from "../../common/Dropdown";

/** Form to build a license type from product, renewal, data rate and other options. */
export function LicenseTypeFormModal({ open, onClose, item, onSave }) {
  const [form, setForm] = React.useState(
    item ?? { name: "", description: "", product: "EnviroFRONT", productType: "Web Application" }
  );
  React.useEffect(
    () => setForm(item ?? { name: "", description: "", product: "EnviroFRONT", productType: "Web Application" }),
    [item, open]
  );
  function set(patch) {
    setForm((f) => ({ ...f, ...patch }));
  }
  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={() => onSave(form)}
      title={item ? "Edit License Type" : "Add License Type"}
      submitDisabled={!form.name?.trim()}
    >
      <InputField
        label="Name"
        required
        placeholder="e.g. EF-1Y-5M-1Y-PR-PURL"
        value={form.name}
        onChange={(e) => set({ name: e.target.value })}
      />
      <InputField
        label="Description"
        placeholder="e.g. 1 Year Renewal, 5 Minute Data Rate, 1 Year Data Retention, Prepaid"
        value={form.description}
        onChange={(e) => set({ description: e.target.value })}
      />
      <Dropdown
        label="Product"
        options={[
          { value: "EnviroFRONT", label: "EnviroFRONT" },
          { value: "OCEMS", label: "OCEMS" },
          { value: "SolarFRONT", label: "SolarFRONT" },
        ]}
        value={form.product}
        onChange={(v) => set({ product: v })}
      />
      <Dropdown
        label="Product Type"
        options={[
          { value: "Web Application", label: "Web Application" },
          { value: "Mobile Application", label: "Mobile Application" },
          { value: "Desktop Service", label: "Desktop Service" },
        ]}
        value={form.productType}
        onChange={(v) => set({ productType: v })}
      />
    </FormModal>
  );
}
