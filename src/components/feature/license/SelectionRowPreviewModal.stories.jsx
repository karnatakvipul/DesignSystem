import * as React from "react";
import { SelectionRowPreviewModal } from "./SelectionRowPreviewModal";
import { Button } from "../../common/Button";

const LICENSES = [
  { id: 1, account: "Aaxis Nano", name: "Reflashing Issue", key: "54f45452", amount: "₹2,121.00", lastPi: "PIC260316" },
  { id: 2, account: "Imtb Engineers Pvt Ltd", name: "Gmr Airport Hyderabad", key: "6209020c", amount: "₹0.00", lastPi: "-" },
  { id: 3, account: "Abc Industries Pvt Ltd", name: "Manufacturing - Noida Plant 1", key: "a298070a", amount: "₹0.00", lastPi: "-" },
  { id: 4, account: "Prima Equipment", name: "Cement Industry Test", key: "bdf0ed8a", amount: "₹60,475.00", lastPi: "PIC270003" },
];

const DOCUMENT_TYPES = [
  { value: "Proforma", label: "Performa Invoice" },
  { value: "Tax (Manual)", label: "Tax Invoice (Manual)" },
  { value: "Tax", label: "Tax Invoice" },
  { value: "Revise", label: "Revise" },
  { value: "Cancel", label: "Cancel Pi" },
];

/**
 * Confirms which of the selected licences a document will be raised against,
 * and which kind.
 *
 * The point is the **last chance to drop rows**: a bulk selection made across
 * pages is easy to get slightly wrong, and an invoice raised against the wrong
 * licence is expensive to unpick. Rows can be searched and removed here before
 * anything is generated, and `onConfirm` receives only the ones that survived.
 *
 * A document type can be `disabled` when it does not apply — Tax Invoice,
 * Revise and Cancel all require an existing proforma, so they are offered but
 * dead when none of the selected licences has one. Everything resets on open.
 */
const meta = {
  title: "Feature/License/SelectionRowPreviewModal",
  component: SelectionRowPreviewModal,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "closed" },
    licenses: { control: "object", description: "The selected licences." },
    documentTypes: {
      control: "object",
      description: "`{ value, label, disabled? }[]`. Defaults to the standard five.",
    },
    onConfirm: { action: "confirmed", description: "`(documentType, keptLicenses)` — only the rows not removed." },
  },
  args: { open: true, licenses: LICENSES, documentTypes: DOCUMENT_TYPES },
};

export default meta;

/** Remove a row or two, then confirm — only the survivors are passed on. */
export const Playground = {};

/**
 * None of these licences has a proforma, so the three types that depend on one
 * are offered but dead rather than silently missing.
 */
export const DocumentTypesDisabled = {
  args: {
    licenses: LICENSES.filter((l) => l.lastPi === "-"),
    documentTypes: DOCUMENT_TYPES.map((t) =>
      ["Tax", "Revise", "Cancel"].includes(t.value) ? { ...t, disabled: true } : t
    ),
  },
};

/** A single licence. */
export const SingleLicence = { args: { licenses: [LICENSES[0]] } };

/** A long selection, where the in-dialog search earns its place. */
export const ManyLicences = {
  args: {
    licenses: Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      account: ["Aaxis Nano", "Prima Equipment", "Abc Industries Pvt Ltd"][i % 3],
      name: `Licence record ${i + 1}`,
      key: `key-${i + 1}`,
      amount: `₹${((i + 1) * 1250).toLocaleString("en-IN")}`,
      lastPi: i % 2 ? "PIC260316" : "-",
    })),
  },
};

export const Interactive = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    const [result, setResult] = React.useState(null);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Row selection preview</Button>
        <p className="mt-3 font-mono text-body-sm text-ink-muted">
          {result ?? "(nothing confirmed yet)"}
        </p>
        <SelectionRowPreviewModal
          open={open}
          licenses={LICENSES}
          documentTypes={DOCUMENT_TYPES}
          onClose={() => setOpen(false)}
          onConfirm={(type, kept) => {
            setResult(`${type} for ${kept.length} licence(s): ${kept.map((k) => k.id).join(", ")}`);
            setOpen(false);
          }}
        />
      </>
    );
  },
};
