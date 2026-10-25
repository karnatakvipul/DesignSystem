import * as React from "react";
import { RenewalStreamFormModal } from "./RenewalStreamFormModal";
import { Button } from "../../common/Button";

const DATARATE_ROW = {
  id: "1-datarate",
  accountName: "Aaxis Nano",
  name: "Reflashing Issue",
  licenseKey: "54f45452-1d03-4f4a-9b4e-e6d6b",
  ticketNo: "2600000001",
  timestamp: "17-Aug-2025",
  key: "datarate",
  value: "EF-1M-5M-3Y-PO-CPCB",
};

const ACTIVE_ROW = { ...DATARATE_ROW, id: "1-active", key: "active", value: "1" };

const LICENSE_TYPE_OPTIONS = [
  { value: "EF-1M-5M-3Y-PO-CPCB", label: "EF-1M-5M-3Y-PO-CPCB" },
  { value: "EF-1Y-5M-1Y-PR-XX", label: "EF-1Y-5M-1Y-PR-XX" },
  { value: "OC-1Y-5M-1Y-PR-GSPCB", label: "OC-1Y-5M-1Y-PR-GSPCB" },
];

/**
 * Edits one row of a licence's renewal stream, opened from
 * `LicenseRenewalModal`'s per-row edit.
 *
 * The control adapts to the row's `key`: a `datarate` row gets the licence
 * type dropdown, while other keys get a plain value field. That is why
 * `licenseTypeOptions` is only consulted for some rows.
 *
 * Every edit also captures a ticket number and timestamp, so a change to what
 * carries forward is attributable — the same principle as
 * `ValidateTicketModal`. With no `row` the component renders nothing, so it is
 * safe to mount against a null selection.
 */
const meta = {
  title: "Feature/License/RenewalStreamFormModal",
  component: RenewalStreamFormModal,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "closed" },
    row: { control: "object", description: "The stream row. Renders nothing when absent." },
    licenseTypeOptions: { control: "object", description: "Used when the row's `key` is `datarate`." },
    onSave: { action: "saved", description: "Receives `{ id, key, value, ticketNo, timestamp }`." },
  },
  args: { open: true, row: DATARATE_ROW, licenseTypeOptions: LICENSE_TYPE_OPTIONS },
};

export default meta;

/** A `datarate` row — the value is chosen from the licence types. */
export const DataRateRow = {};

/** Any other key gets a plain value field instead of the dropdown. */
export const PlainValueRow = { args: { row: ACTIVE_ROW } };

/** With no row, nothing renders. */
export const NoRowRendersNothing = {
  args: { row: null },
  render: (args) => (
    <div>
      <p className="text-body-sm text-ink-muted">(nothing renders below this line)</p>
      <RenewalStreamFormModal {...args} />
    </div>
  ),
};

export const Interactive = {
  render: function Render() {
    const [row, setRow] = React.useState(null);
    const [saved, setSaved] = React.useState(null);
    return (
      <>
        <div className="flex gap-2">
          <Button onClick={() => setRow(DATARATE_ROW)}>Edit datarate row</Button>
          <Button variant="secondary" onClick={() => setRow(ACTIVE_ROW)}>
            Edit active row
          </Button>
        </div>
        <pre className="mt-3 rounded-control bg-chrome-deep/40 p-3 font-mono text-body-sm text-ink-secondary">
          {saved ? JSON.stringify(saved, null, 2) : "(nothing saved yet)"}
        </pre>
        <RenewalStreamFormModal
          open={!!row}
          row={row}
          licenseTypeOptions={LICENSE_TYPE_OPTIONS}
          onClose={() => setRow(null)}
          onSave={(values) => {
            setSaved(values);
            setRow(null);
          }}
        />
      </>
    );
  },
};
