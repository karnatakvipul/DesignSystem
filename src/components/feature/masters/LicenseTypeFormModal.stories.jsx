import * as React from "react";
import { LicenseTypeFormModal } from "./LicenseTypeFormModal";
import { Button } from "../../common/Button";

const EXISTING = {
  id: 1,
  name: "EF-1Y-5M-1Y-PR-XX",
  description: "EnviroFRONT yearly, 5 monitors, 1 year support",
  product: "EnviroFRONT",
  productType: "Web Application",
};

/**
 * Add or edit a licence type — the master record a licence's `type` column
 * points at.
 *
 * Passing an `item` pre-fills the form and flips the title to Edit; omitting
 * it opens a blank Add. Either way `onSave` receives the whole record
 * (`{ name, description, product, productType }`), so no field is silently
 * dropped on an edit.
 */
const meta = {
  title: "Feature/Masters/LicenseTypeFormModal",
  component: LicenseTypeFormModal,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "closed" },
    item: { control: "object", description: "The record to edit. Omit for a blank Add form." },
    onSave: { action: "saved", description: "Receives `{ name, description, product, productType }`." },
  },
  args: { open: true },
};

export default meta;

/** No `item` — a blank Add form, defaulting to EnviroFRONT / Web Application. */
export const AddLicenseType = {};

/** With an `item` the form pre-fills and the title becomes Edit. */
export const EditLicenseType = { args: { item: EXISTING } };

export const Interactive = {
  render: function Render() {
    const [item, setItem] = React.useState(undefined);
    const [open, setOpen] = React.useState(false);
    const [saved, setSaved] = React.useState(null);
    return (
      <>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setItem(undefined);
              setOpen(true);
            }}
          >
            Add
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setItem(EXISTING);
              setOpen(true);
            }}
          >
            Edit existing
          </Button>
        </div>
        <pre className="mt-3 rounded-control bg-chrome-deep/40 p-3 font-mono text-body-sm text-ink-secondary">
          {saved ? JSON.stringify(saved, null, 2) : "(nothing saved yet)"}
        </pre>
        <LicenseTypeFormModal
          open={open}
          item={item}
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
