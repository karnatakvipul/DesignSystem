import * as React from "react";
import { FormModal } from "../../common/FormModal";
import { InputField } from "../../common/InputField";
import { Dropdown } from "../../common/Dropdown";
import { Checkbox } from "../../common/Checkbox";

const ROLE_OPTIONS = [{ value: "Super Admin", label: "Super Admin" }, { value: "Admin", label: "Admin" }, { value: "Viewer", label: "Viewer" }];

/** Add or edit a user with product, account, name and role fields. */
export function UserFormModal({ open, onClose, user, onSave }) {
  const [form, setForm] = React.useState(user ?? { name: "", email: "", role: "Viewer", products: [] });
  React.useEffect(() => setForm(user ?? { name: "", email: "", role: "Viewer", products: [] }), [user, open]);
  function set(patch) {
    setForm((f) => ({ ...f, ...patch }));
  }
  return (
    <FormModal open={open} onClose={onClose} onSubmit={() => onSave(form)} title={user ? "Edit User" : "Add User"} submitDisabled={!form.name?.trim() || !form.email?.trim()}>
      <InputField label="Name" required value={form.name} onChange={(e) => set({ name: e.target.value })} />
      <InputField label="Email" type="email" required value={form.email} onChange={(e) => set({ email: e.target.value })} />
      <Dropdown label="Role" options={ROLE_OPTIONS} value={form.role} onChange={(v) => set({ role: v })} />
      <Checkbox label="Active" checked={form.status !== "Deactivated"} onChange={(e) => set({ status: e.target.checked ? "Active" : "Deactivated" })} />
    </FormModal>
  );
}
