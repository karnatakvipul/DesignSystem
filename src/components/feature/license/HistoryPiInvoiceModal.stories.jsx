import * as React from "react";
import { HistoryPiInvoiceModal } from "./HistoryPiInvoiceModal";
import { Button } from "../../common/Button";

const PI = [
  { id: "pi-1", object: "pi", number: "PIC260316", date: "17-Aug-2025", fileName: "PIC260316_54f45452" },
  { id: "pi-2", object: "pi", number: "PIC270003", date: "24-Feb-2024", fileName: "PIC270003_bdf0ed8a" },
];

const TI = [
  { id: "ti-1", object: "ti", number: "INV-2026-0044", date: "18-Aug-2025", fileName: "INV20260044_54f45452" },
];

/**
 * A licence's proforma invoices and tax invoices, split across two tabs.
 *
 * Two tabs rather than one merged list because the two documents answer
 * different questions — what was quoted, and what was billed — and are raised
 * at different times.
 *
 * The tab resets to PI on every open, so a dialog opened from a second row
 * never inherits the first row's tab.
 */
const meta = {
  title: "Feature/License/HistoryPiInvoiceModal",
  component: HistoryPiInvoiceModal,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "closed" },
    piRecords: { control: "object", description: "`{ id, number, date, fileName }[]` — proforma invoices." },
    tiRecords: { control: "object", description: "Same shape — tax invoices." },
    loading: { control: "boolean", description: "Applies to both tabs." },
    onView: { action: "view", description: "Receives the record." },
    onDelete: { action: "delete", description: "Receives the record. Omit to hide the delete action." },
  },
  args: { open: true, piRecords: PI, tiRecords: TI },
};

export default meta;

/** Switch tabs to compare the two document types. */
export const Playground = {};

export const Loading = { args: { loading: true, piRecords: [], tiRecords: [] } };

/** A licence that has been quoted but never billed — the Tax Invoice tab is empty. */
export const NoTaxInvoices = { args: { tiRecords: [] } };

/** Neither document raised yet. */
export const Empty = { args: { piRecords: [], tiRecords: [] } };

/** Without `onDelete` the rows are view-only. */
export const ReadOnly = { args: { onDelete: undefined } };

export const Interactive = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    const [log, setLog] = React.useState(null);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Get History PI and Invoice</Button>
        <p className="mt-3 font-mono text-body-sm text-ink-muted">{log ?? "(no action yet)"}</p>
        <HistoryPiInvoiceModal
          open={open}
          piRecords={PI}
          tiRecords={TI}
          onClose={() => setOpen(false)}
          onView={(r) => setLog(`View → ${r.number}`)}
          onDelete={(r) => setLog(`Delete → ${r.number}`)}
        />
      </>
    );
  },
};
