import * as React from "react";
import { DatePicker, DayDatePicker } from "./DatePicker";

/**
 * A single-date field built on the browser's native picker, with the calendar
 * glyph moved into an add-on button so it matches the rest of the form
 * controls.
 *
 * `showTime` switches the underlying input between `date` and
 * `datetime-local`. Leave it off unless the time genuinely matters — a picker
 * that opens on an hour column when every other date in the app is date-only
 * is a needless extra step.
 *
 * The `value` parser is forgiving: it accepts `Date`s, timestamps,
 * `YYYY-MM-DD`, and `DD-MMM-YYYY` (e.g. `31-Jul-2026`), so a value straight
 * off the API round-trips without reformatting at the call site.
 *
 * `DayDatePicker` is an alias of this component, kept for older call sites.
 */
const meta = {
  title: "Components/Forms/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    required: { control: "boolean" },
    requiredText: { control: "text", description: 'Badge beside the label, e.g. "(required)".' },
    error: { control: "text" },
    value: { control: "text", description: "Date, timestamp, `YYYY-MM-DD`, or `DD-MMM-YYYY`." },
    onChange: { action: "changed", description: "Receives the raw input value (`YYYY-MM-DD`, or `…THH:mm` with `showTime`)." },
    showTime: { control: "boolean", description: "Switches the input to `datetime-local`." },
    type: { control: "text", description: "Overrides the input type outright. Rarely needed." },
    iconPosition: { control: "inline-radio", options: ["left", "right"] },
    min: { control: "text", description: "Earliest selectable date. Overrides `disablePastDates`." },
    max: { control: "text", description: "Latest selectable date." },
    disabled: { control: "boolean" },
    disablePastDates: { control: "boolean", description: "Defaults to `true` — clamps `min` to today." },
    className: { control: "text" },
  },
  args: {
    label: "Issue Date",
    requiredText: "(required)",
    iconPosition: "right",
    disablePastDates: true,
  },
  render: function Render(args) {
    const [value, setValue] = React.useState(args.value ?? "");
    React.useEffect(() => setValue(args.value ?? ""), [args.value]);
    return (
      <div className="w-80">
        <DatePicker {...args} value={value} onChange={setValue} />
      </div>
    );
  },
};

export default meta;

export const Playground = {};

/** The add-on button can sit on either end of the field. */
export const IconPositions = {
  render: () => (
    <div className="flex w-80 flex-col gap-5">
      <DatePicker label="Icon right (default)" iconPosition="right" />
      <DatePicker label="Icon left" iconPosition="left" />
    </div>
  ),
};

/** With `showTime` the control becomes `datetime-local` and the native picker gains hour/minute columns. */
export const WithTime = {
  args: { label: "Issued at", showTime: true },
};

/** Past dates are blocked by default; `disablePastDates={false}` allows them, and explicit `min`/`max` override both. */
export const RangeLimits = {
  render: () => (
    <div className="flex w-80 flex-col gap-5">
      <DatePicker label="Future only (default)" disablePastDates />
      <DatePicker label="Any date" disablePastDates={false} />
      <DatePicker label="Bounded 2026" min="2026-01-01" max="2026-12-31" disablePastDates={false} />
    </div>
  ),
};

/** `DD-MMM-YYYY` straight off the API is parsed without reformatting at the call site. */
export const ParsesApiFormats = {
  render: () => (
    <div className="flex w-80 flex-col gap-5">
      <DatePicker label="From 'YYYY-MM-DD'" value="2026-07-31" disablePastDates={false} />
      <DatePicker label="From '31-Jul-2026'" value="31-Jul-2026" disablePastDates={false} />
      <DatePicker label="From a Date object" value={new Date(2026, 6, 31)} disablePastDates={false} />
    </div>
  ),
};

export const States = {
  render: () => (
    <div className="flex w-80 flex-col gap-5">
      <DatePicker label="Default" />
      <DatePicker label="Required" required requiredText="(required)" />
      <DatePicker label="With error" error="Issue date is required." />
      <DatePicker label="Disabled" disabled value="2026-07-31" />
    </div>
  ),
};

/** Kept so older call sites keep working — the same component under another name. */
export const DayDatePickerAlias = {
  render: () => (
    <div className="w-80">
      <DayDatePicker label="DayDatePicker (alias)" value="2026-07-31" disablePastDates={false} />
    </div>
  ),
};
