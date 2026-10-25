import { ExcelPreviewViewer } from "./ExcelPreviewViewer";

const ROWS = [
  { Account: "Prima Equipment", Site: "Pcbl Limited_Palej", "Licence Type": "EF-1Y-2M-1Y-PR-GPCB", Amount: "₹60,475.00", Expiry: "23-Feb-2025" },
  { Account: "Aaxis Nano", Site: "Gmr Airport Hyderabad", "Licence Type": "EF-1M-5M-3Y-PO-CPCB", Amount: "₹2,121.00", Expiry: "17-Aug-2026" },
  { Account: "Abc Industries Pvt Ltd", Site: "Noida Plant 1", "Licence Type": "EF-1Y-5M-1Y-PR-XX", Amount: "₹0.00", Expiry: "22-Aug-2026" },
];

/**
 * Previews the contents of a renewal spreadsheet before it is imported or
 * sent.
 *
 * **The columns come from the data, not a schema.** It reads the keys off the
 * first usable row, so any shape of sheet renders without configuration — the
 * point of a preview is to show what is actually in the file, including
 * columns you were not expecting.
 *
 * It skips leading non-object entries when looking for that first row, and
 * falls back to an empty-state message rather than throwing when there is
 * nothing usable.
 */
const meta = {
  title: "Feature/Report/ExcelPreviewViewer",
  component: ExcelPreviewViewer,
  tags: ["autodocs"],
  argTypes: {
    rows: { control: "object", description: "Array of row objects. Headers are taken from the first usable one." },
  },
  args: { rows: ROWS },
  render: (args) => (
    <div className="w-[52rem]">
      <ExcelPreviewViewer {...args} />
    </div>
  ),
};

export default meta;

export const Playground = {};

/** A different sheet shape renders just as well — no schema to update. */
export const DifferentColumns = {
  args: {
    rows: [
      { "Ticket No": "2600000001", "Stream": "datarate", "Old Value": "5M", "New Value": "10M" },
      { "Ticket No": "2600000002", "Stream": "active", "Old Value": "0", "New Value": "1" },
    ],
  },
};

export const SingleRow = { args: { rows: [ROWS[0]] } };

/** An empty file gets a message rather than an empty table. */
export const Empty = { args: { rows: [] } };

/** Leading junk entries are skipped when looking for the header row. */
export const SkipsNonObjectRows = {
  args: { rows: [null, undefined, ...ROWS] },
};

/** Nothing usable at all — still a message, not a crash. */
export const NoUsableRows = { args: { rows: [null, undefined] } };
