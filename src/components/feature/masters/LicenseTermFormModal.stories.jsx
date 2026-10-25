import * as React from "react";
import { LicenseTermFormModal } from "./LicenseTermFormModal";
import { Button } from "../../common/Button";

/**
 * Add or edit a licence term — the named billing period a licence runs for
 * (Yearly, Quarterly, Custom).
 *
 * A single-field dialog. Submit stays disabled while the name is blank or
 * whitespace, so an unnamed term cannot be created — the name is the record's
 * only identity, and a blank one would be unrecoverable from the table.
 */
const meta = {
  title: "Feature/Masters/LicenseTermFormModal",
  component: LicenseTermFormModal,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "closed" },
    item: { control: "object", description: "The record to edit. Omit for a blank Add form." },
    onSave: { action: "saved", description: "Receives `{ name }`." },
  },
  args: { open: true },
};

export default meta;

/** Blank Add — note that Ok is disabled until a name is typed. */
export const AddTerm = {};

export const EditTerm = { args: { item: { id: 1, name: "Yearly" } } };

/** Whitespace does not count as a name, so Ok stays disabled. */
export const WhitespaceIsNotAName = { args: { item: { id: 2, name: "   " } } };

export const Interactive = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    const [saved, setSaved] = React.useState(null);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Add licence term</Button>
        <p className="mt-3 font-mono text-body-sm text-ink-muted">
          {saved ? JSON.stringify(saved) : "(nothing saved yet)"}
        </p>
        <LicenseTermFormModal
          open={open}
          onClose={() => setOpen(false)}
          onSave={(values) => {
            setSaved(values);
            setOpen(false);
          }}
        />
      </>
    );
  },
};
