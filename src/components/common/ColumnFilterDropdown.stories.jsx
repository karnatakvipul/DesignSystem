import * as React from "react";
import { ColumnFilterDropdown } from "./ColumnFilterDropdown";

const LICENSE_COLUMNS = [
  { key: "account", label: "ACCOUNT" },
  { key: "name", label: "NAME" },
  { key: "status", label: "STATUS" },
  { key: "type", label: "TYPE" },
  { key: "term", label: "TERM" },
  { key: "key", label: "KEY" },
  { key: "expiry", label: "EXPIRY" },
  { key: "issue", label: "ISSUE" },
  { key: "site", label: "SITE" },
  { key: "amount", label: "AMOUNT" },
];

/**
 * The grid icon beside a table's pagination that chooses which columns are on
 * screen.
 *
 * Some columns cannot be hidden — a table whose identifying column has been
 * switched off is a list of anonymous rows. Those are locked, shown ticked and
 * greyed. A column is locked when it is named in `requiredKeys` (default:
 * `account`, `name`, `status`) or carries `required`/`locked`/`disabled` on
 * its own entry.
 *
 * Below `md` it opens as a `BottomSheet` rather than a popover, since a
 * popover anchored to a corner icon is unusable on a phone.
 */
const meta = {
  title: "Components/ColumnFilterDropdown",
  component: ColumnFilterDropdown,
  tags: ["autodocs"],
  argTypes: {
    columns: { control: "object", description: "`{ key, label, required? }[]` — every column the table can show." },
    visible: { control: "object", description: "Array of keys currently on screen." },
    requiredKeys: {
      control: "object",
      description: "Keys that may never be hidden. Defaults to `['account', 'name', 'status']`.",
    },
    onChange: { action: "changed", description: "Receives the next array of visible keys." },
    className: { control: "text" },
  },
  args: {
    columns: LICENSE_COLUMNS,
    visible: LICENSE_COLUMNS.map((c) => c.key),
  },
  render: function Render(args) {
    const [visible, setVisible] = React.useState(args.visible);
    React.useEffect(() => setVisible(args.visible), [args.visible]);
    return (
      <div className="flex flex-col items-start gap-3">
        <ColumnFilterDropdown {...args} visible={visible} onChange={setVisible} />
        <p className="text-body-sm text-ink-muted">
          Visible: <span className="font-mono">{visible.join(", ") || "(none)"}</span>
        </p>
      </div>
    );
  },
};

export default meta;

export const Playground = {};

/** Account, Name and Status are locked — open the menu and they are ticked but not clickable. */
export const WithHiddenColumns = {
  args: { visible: ["account", "name", "status", "type", "expiry"] },
};

/** A column can lock itself with `required: true`, instead of the page listing it in `requiredKeys`. */
export const PerColumnRequiredFlag = {
  args: {
    columns: [
      { key: "invoiceNo", label: "INVOICE NO", required: true },
      { key: "amount", label: "AMOUNT" },
      { key: "paymentStatus", label: "PAYMENT STATUS" },
      { key: "timestamp", label: "INVOICE DATE" },
    ],
    visible: ["invoiceNo", "amount", "paymentStatus", "timestamp"],
    requiredKeys: [],
  },
};

/** Below `md` the same control opens as a bottom sheet. Narrow the viewport to see it. */
export const MobileSheet = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
