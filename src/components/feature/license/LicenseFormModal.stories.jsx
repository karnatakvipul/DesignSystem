import * as React from "react";
import { LicenseFormModal } from "./LicenseFormModal";
import { Button } from "../../common/Button";

const TYPE_OPTIONS = [
  { value: "EF-1Y-5M-1Y-PR-XX", label: "EF-1Y-5M-1Y-PR-XX" },
  { value: "OC-1Y-5M-1Y-PR-GSPCB", label: "OC-1Y-5M-1Y-PR-GSPCB" },
  { value: "SF-1Y-10M-1Y-PR-P350", label: "SF-1Y-10M-1Y-PR-P350" },
];

const TERM_OPTIONS = [
  { value: "Yearly", label: "Yearly" },
  { value: "Half Year", label: "Half Year" },
  { value: "Custom", label: "Custom" },
];

const EXISTING = {
  id: 1,
  account: "Aaxis Nano",
  name: "Reflashing Issue",
  type: "EF-1Y-5M-1Y-PR-XX",
  term: "Yearly",
  key: "54f45452-1d03-4f4a-9b4e-e6d6b",
};

/**
 * The add / edit licence form — the library's largest dialog, covering name,
 * type, term, duration, dates, amounts, timezone, activation mode and
 * reminders.
 *
 * Passing a `license` switches it to edit and pre-fills from that record;
 * omitting it opens a blank add form. `typeOptions` and `termOptions` default
 * to demo lists, so pass the real ones from your masters tables — a form
 * offering licence types that do not exist is worse than one offering none.
 *
 * The Issue Date field is deliberately date-only. Making it a `datetime-local`
 * opened the native picker on an hour column, which is a needless extra step
 * when every other date in the app is date-only.
 */
const meta = {
  title: "Feature/License/LicenseFormModal",
  component: LicenseFormModal,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "closed" },
    license: { control: "object", description: "The record to edit. Omit for a blank add form." },
    onSave: { action: "saved", description: "Receives the form values." },
    typeOptions: { control: "object", description: "Licence types. Defaults to a demo list." },
    termOptions: { control: "object", description: "Licence terms. Defaults to a demo list." },
  },
  args: { open: true, typeOptions: TYPE_OPTIONS, termOptions: TERM_OPTIONS },
};

export default meta;

/** No `license`, so this is the blank add form. */
export const AddLicense = {};

/** With a `license`, the form pre-fills and becomes an edit. */
export const EditLicense = { args: { license: EXISTING } };

/** Falls back to the built-in demo option lists when none are supplied. */
export const DefaultOptionLists = {
  args: { typeOptions: undefined, termOptions: undefined },
};

export const Interactive = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    const [saved, setSaved] = React.useState(null);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Add licence</Button>
        <pre className="mt-3 max-w-[40rem] overflow-auto rounded-control bg-chrome-deep/40 p-3 font-mono text-body-sm text-ink-secondary">
          {saved ? JSON.stringify(saved, null, 2) : "(nothing saved yet)"}
        </pre>
        <LicenseFormModal
          open={open}
          typeOptions={TYPE_OPTIONS}
          termOptions={TERM_OPTIONS}
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

export const Closed = { args: { open: false } };
