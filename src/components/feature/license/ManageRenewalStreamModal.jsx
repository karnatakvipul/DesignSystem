import * as React from "react";
import { FormModal } from "../../common/FormModal";
import { DynamicRowList } from "../../common/DynamicRowList";
import { InputField } from "../../common/InputField";

/** Add or edit renewal stream details. */
export function ManageRenewalStreamModal({ open, onClose, streams, onSave }) {
  const [rows, setRows] = React.useState(streams ?? [{ label: "", amount: "" }]);
  React.useEffect(() => setRows(streams ?? [{ label: "", amount: "" }]), [streams, open]);

  return (
    <FormModal open={open} onClose={onClose} onSubmit={() => onSave(rows)} title="Manage Renewal Stream" size="lg">
      <DynamicRowList
        items={rows}
        onChange={setRows}
        createItem={() => ({ label: "", amount: "" })}
        addLabel="Add stream"
        renderRow={(item, i, update) => (
          <div className="flex gap-2">
            <InputField placeholder="Stream name" value={item.label} onChange={(e) => update({ label: e.target.value })} />
            <InputField placeholder="Amount" type="number" value={item.amount} onChange={(e) => update({ amount: e.target.value })} />
          </div>
        )}
      />
    </FormModal>
  );
}
