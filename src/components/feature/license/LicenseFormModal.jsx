import * as React from "react";
import { FormModal } from "../../common/FormModal";
import { InputField } from "../../common/InputField";
import { InputGroup } from "../../common/InputGroup";
import { Dropdown } from "../../common/Dropdown";
import { FormGroup } from "../../common/FormGroup";
import { DateRangePicker } from "../../common/DateRangePicker";
import { DatePicker } from "../../common/DatePicker";
import { SegmentedControl } from "../../common/SegmentedControl";

const DEFAULT_LICENSE_TYPE_OPTIONS = [
  { value: "EF-1M-5M-3Y-PO-CPCB", label: "EF-1M-5M-3Y-PO-CPCB" },
  { value: "EF-10-NM-2P-PC1-PCB", label: "EF-10-NM-2P-PC1-PCB" },
  { value: "EF-10-XX-420-SD4-BLE2", label: "EF-10-XX-420-SD4-BLE2" },
  { value: "DC-11-XX-11F-PR-CAA", label: "DC-11-XX-11F-PR-CAA" },
];

const DEFAULT_TERM_OPTIONS = [
  { value: "Free", label: "Free" },
  { value: "Yearly", label: "Yearly" },
  { value: "Monthly", label: "Monthly" },
  { value: "Quarterly", label: "Quarterly" },
  { value: "2-Year", label: "2-Year" },
  { value: "7 day(s)", label: "7 day(s)" },
  { value: "Custom", label: "Custom" },
];

/**
 * How many days each fixed term runs — set automatically the moment the term
 * is picked, matching the reference app. A term absent from this map (`Free`,
 * `Custom`, or anything added later) has no fixed length, so Duration stays a
 * plain number someone types in rather than one this map would get wrong.
 */
const TERM_DURATION_DAYS = {
  Yearly: 365,
  Monthly: 31,
  Quarterly: 91,
  "Half Year": 182,
  "2-Year": 730,
  "7 day(s)": 7,
};

const NUMBER_OF_LICENSES = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "5", label: "5" },
  { value: "10", label: "10" },
];

const TIMEZONE_OPTIONS = [
  { value: "GMT+5:30", label: "(GMT +5:30) Bombay, Calcutta, Madras, New Delhi" },
  { value: "UTC", label: "(UTC) Coordinated Universal Time" },
  { value: "EST", label: "(EST) Eastern Standard Time" },
];

/**
 * Add or Edit License Modal featuring 12 exact input fields,
 * InputGroups with add-ons (₹, Days, Calendar), (required) badges,
 * and a 2-column responsive layout.
 *
 * @param {Array} [typeOptions] License Type choices — defaults to a handful
 *   of placeholder types for the library's own demo. An app with a real
 *   license-types master list should pass its own, or every new license
 *   defaults to (and can only be saved as) a type that doesn't exist there.
 * @param {Array} [termOptions] License Term choices, same reasoning.
 */
export function LicenseFormModal({ open, onClose, license, onSave, typeOptions = DEFAULT_LICENSE_TYPE_OPTIONS, termOptions = DEFAULT_TERM_OPTIONS }) {
  const blankForm = React.useCallback(
    () => ({
      name: "",
      type: typeOptions[0]?.value ?? "",
      term: termOptions[0]?.value ?? "",
      duration: "365",
      dateRange: "31-Jul-2026 - 30-Jul-2027",
      numLicenses: "1",
      subscriptionAmount: "",
      renewalAmount: "",
      issueDate: "30-Jul-2026 17:32:30",
      timezone: "GMT+5:30",
      activationMode: "Activation Date", // "Issue Date" | "Activation Date"
      reminder1: "15",
      reminder2: "7",
      reminder3: "1",
    }),
    [typeOptions, termOptions]
  );

  const [form, setForm] = React.useState(() => license ?? blankForm());

  React.useEffect(() => {
    setForm(license ?? blankForm());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [license, open]);

  function set(patch) {
    setForm((f) => ({ ...f, ...patch }));
  }

  // DateRangePicker emits { from, to } Date objects; normalize back to the
  // "DD-MMM-YYYY - DD-MMM-YYYY" string the form (and saved license) expects.
  function normalizeDateRange(v) {
    if (!v || typeof v !== "object" || v instanceof Date) return v;
    const fmt = (d) => {
      if (!d) return "";
      const x = d instanceof Date ? d : new Date(d);
      if (isNaN(x.getTime())) return "";
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${String(x.getDate()).padStart(2, "0")}-${months[x.getMonth()]}-${x.getFullYear()}`;
    };
    const from = fmt(v.from);
    const to = fmt(v.to);
    if (!from && !to) return "";
    return `${from} - ${to}`;
  }

  const REQ = "(required)";

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={() => onSave(form)}
      title={license ? "Edit License" : "Add License"}
      size="lg"
      submitDisabled={!form.name?.trim()}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-body-sm">
        {/* 1. Name */}
        <InputField
          label="Name"
          requiredText={REQ}
          placeholder="Application Name"
          value={form.name}
          onChange={(e) => set({ name: e.target.value })}
        />

        {/* 2. License Type */}
        <Dropdown
          label="License Type"
          requiredText={REQ}
          options={typeOptions}
          value={form.type}
          onChange={(v) => set({ type: v })}
        />

        {/* 3. License Term */}
        <Dropdown
          label="License Term"
          requiredText={REQ}
          options={termOptions}
          value={form.term}
          onChange={(v) =>
            set({
              term: v,
              // A fixed-length term overwrites whatever Duration held; a term
              // with no fixed length (Free, Custom) leaves it alone, since
              // there is nothing to derive it from.
              ...(TERM_DURATION_DAYS[v] != null ? { duration: String(TERM_DURATION_DAYS[v]) } : {}),
            })
          }
        />

        {/* 4. Duration (InputGroup with 'Days' right addon) — locked to the
            term's fixed length above; only "Custom" (or any other term with
            no fixed length) leaves it open to type a day count directly. */}
        <InputGroup
          label="Duration"
          requiredText={REQ}
          value={form.duration}
          onChange={(e) => set({ duration: e.target.value })}
          addonRight="Days"
          disabled={TERM_DURATION_DAYS[form.term] != null}
        />

        {/* 5. Date */}
        <DateRangePicker
          label="Date"
          requiredText={REQ}
          value={form.dateRange}
          onChange={(v) => set({ dateRange: normalizeDateRange(v) })}
        />

        {/* 6. Number of license */}
        <Dropdown
          label="Number of license"
          requiredText={REQ}
          options={NUMBER_OF_LICENSES}
          value={form.numLicenses}
          onChange={(v) => set({ numLicenses: v })}
        />

        {/* 7. Subscription Amount (InputGroup with '₹' left addon) */}
        <InputGroup
          label="Subscription Amount"
          requiredText={REQ}
          placeholder="Enter subscription amount"
          addonLeft="₹"
          type="number"
          value={form.subscriptionAmount}
          onChange={(e) => set({ subscriptionAmount: e.target.value })}
        />

        {/* 8. Renewal Amount (InputGroup with '₹' left addon) */}
        <InputGroup
          label="Renewal Amount"
          requiredText={REQ}
          placeholder="Enter renewal amount"
          addonLeft="₹"
          type="number"
          value={form.renewalAmount}
          onChange={(e) => set({ renewalAmount: e.target.value })}
        />

        {/* 9. Issue Date (DatePicker with right calendar addon button trigger).
            Date only — no `showTime` — so the native picker doesn't open on
            an hour/minute column the rest of the app never shows (the ISSUE
            column and every other date display are date-only, e.g.
            "31-Jul-2026"). */}
        <DatePicker
          label="Issue Date"
          requiredText={REQ}
          iconPosition="right"
          value={form.issueDate}
          onChange={(v) => set({ issueDate: v })}
        />

        {/* 10. Timezone */}
        <Dropdown
          label="Timezone"
          requiredText={REQ}
          options={TIMEZONE_OPTIONS}
          value={form.timezone}
          onChange={(v) => set({ timezone: v })}
        />

        {/* 11. License Activation (SegmentedControl Component) */}
        <SegmentedControl
          label="License Activation"
          requiredText={REQ}
          options={["Issue Date", "Activation Date"]}
          value={form.activationMode}
          onChange={(v) => set({ activationMode: v })}
        />

        {/* 12. Reminder (Day) (Multi-Input Group for 15, 7, 1) */}
        <FormGroup label="Reminder (Day)" requiredText={REQ}>
          <div className="grid grid-cols-3 gap-2">
            <InputField
              value={form.reminder1}
              onChange={(e) => set({ reminder1: e.target.value })}
              type="number"
            />
            <InputField
              value={form.reminder2}
              onChange={(e) => set({ reminder2: e.target.value })}
              type="number"
            />
            <InputField
              value={form.reminder3}
              onChange={(e) => set({ reminder3: e.target.value })}
              type="number"
            />
          </div>
        </FormGroup>
      </div>
    </FormModal>
  );
}
