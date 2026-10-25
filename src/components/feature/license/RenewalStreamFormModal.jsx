import * as React from "react";
import { FormModal } from "../../common/FormModal";
import { InputField } from "../../common/InputField";
import { Dropdown } from "../../common/Dropdown";
import { DatePicker } from "../../common/DatePicker";
import { SegmentedControl } from "../../common/SegmentedControl";

/**
 * Edits one row of a licence's renewal stream.
 *
 * A stream row is a key and a value, and the key decides what the value can
 * be: `active` holds a flag, `datarate` holds a licence type. So the middle of
 * this form changes shape with the row, exactly as the reference app's does,
 * rather than offering a text box that would accept anything and mean nothing.
 * Ticket number and timestamp are the same either way.
 *
 * Anything else falls back to plain text — the stream is a key/value store and
 * new keys can appear in it without this form being taught about them, which
 * should degrade to an editable field rather than an uneditable row.
 */
const ACTIVE_OPTIONS = [
  { value: "1", label: "Active" },
  { value: "0", label: "Deactivated" },
];

/** Reads the row's value into whatever the form's control expects. */
function toFormValue(row) {
  if (!row) return "";
  const key = String(row.key ?? "").toLowerCase();
  if (key === "active") return String(row.value) === "1" || row.value === true ? "1" : "0";
  return row.value ?? "";
}

/**
 * `yyyy-MM-dd`, which is the value a date input takes.
 *
 * Passed as a string rather than a Date: the library's `DatePicker` hands its
 * value straight to the input, where a Date is not a value the control accepts
 * and the field would simply render empty.
 */
function toDateInputValue(value) {
  if (!value) return "";
  const dotNet = typeof value === "string" && /^\/Date\((-?\d+)\)\/$/.exec(value);
  const date = new Date(dotNet ? Number(dotNet[1]) : value);
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function RenewalStreamFormModal({ open, onClose, row, licenseTypeOptions = [], onSave }) {
  const [value, setValue] = React.useState(() => toFormValue(row));
  const [ticketNo, setTicketNo] = React.useState(row?.ticketNo ?? "");
  const [timestamp, setTimestamp] = React.useState(() => toDateInputValue(row?.timestamp));

  React.useEffect(() => {
    setValue(toFormValue(row));
    setTicketNo(row?.ticketNo ?? "");
    setTimestamp(toDateInputValue(row?.timestamp));
  }, [row, open]);

  if (!row) return null;

  const key = String(row.key ?? "").toLowerCase();

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={() => onSave({ id: row.id, key: row.key, value, ticketNo, timestamp })}
      title="Edit Renewal Stream"
      size="md"
    >
      {key === "active" ? (
        <SegmentedControl label="Value" options={ACTIVE_OPTIONS} value={value} onChange={setValue} />
      ) : key === "datarate" ? (
        <Dropdown
          label="Value"
          placeholder="Select a license type"
          options={licenseTypeOptions}
          value={value}
          onChange={setValue}
        />
      ) : (
        <InputField label="Value" value={value} onChange={(e) => setValue(e.target.value)} />
      )}

      <InputField
        label="Ticket No"
        placeholder="e.g. 2700000242"
        value={ticketNo}
        onChange={(e) => setTicketNo(e.target.value)}
      />

      <DatePicker label="Timestamp" value={timestamp} onChange={setTimestamp} />
    </FormModal>
  );
}
