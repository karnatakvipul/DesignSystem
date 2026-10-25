import * as React from "react";
import { Eye, Trash2, Inbox } from "lucide-react";
import { Modal } from "../../common/Modal";
import { Button } from "../../common/Button";
import { IconButton } from "../../common/IconButton";
import { Tabs } from "../../common/Tabs";
import { Loader } from "../../common/Loader";
import { TruncatedText } from "../../common/TruncatedText";

/**
 * Every Performa Invoice and Tax Invoice ever raised against a licence — the
 * reference app's "Get History Pi And Invoice".
 *
 * Two tabs rather than one merged table: a Performa Invoice and a Tax Invoice
 * are different documents with different numbering, and a single list would
 * either interleave them confusingly or need a type column doing the tab's
 * job anyway. `piRecords`/`tiRecords` are kept separate for the same reason
 * the reference app's own two tables are.
 *
 * @typedef {Object} HistoryRecord
 * @property {string|number} id
 * @property {string} name Licence name
 * @property {string} number The Pi No. or Tax Invoice No.
 * @property {string|number|Date} timestamp
 * @property {string} [fileName] Identifies the document to `onView`/`onDelete`.
 */

const TABS = [
  { value: "pi", label: "Performa Invoice" },
  { value: "ti", label: "Tax Invoice" },
];

function formatTimestamp(value) {
  if (value === null || value === undefined || value === "") return "-";
  // .NET's `/Date(ms)/` travels through some of these APIs verbatim.
  const dotNet = typeof value === "string" && /^\/Date\((-?\d+)\)\/$/.exec(value);
  const date = new Date(dotNet ? Number(dotNet[1]) : value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function HistoryTable({ records, numberLabel, loading, emptyMessage, onView, onDelete }) {
  if (loading) return <Loader label="Fetching history of Pi and invoice..." />;

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <Inbox size={20} className="text-ink-muted" aria-hidden="true" />
        <p className="text-body font-medium text-ink-primary">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-control border border-card-border">
      <table className="w-full border-collapse text-left text-body-sm">
        <thead>
          <tr className="border-b border-card-border bg-card-bg/60 font-medium text-ink-secondary">
            <th className="px-3 py-2 font-semibold">Name</th>
            <th className="px-3 py-2 font-semibold">{numberLabel}</th>
            <th className="px-3 py-2 font-semibold">Timestamp</th>
            <th className="px-3 py-2 font-semibold text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-card-border/60">
          {records.map((r) => (
            <tr key={r.id} className="hover:bg-card-bg/30 transition-colors">
              <td className="max-w-[240px] px-3 py-2 text-ink-primary">
                <TruncatedText text={r.name} />
              </td>
              <td className="px-3 py-2 font-mono text-ink-primary">{r.number || "-"}</td>
              <td className="whitespace-nowrap px-3 py-2 text-ink-secondary">{formatTimestamp(r.timestamp)}</td>
              <td className="px-3 py-2">
                <div className="flex items-center justify-center gap-1">
                  <IconButton
                    icon={<Eye size={15} />}
                    label={`View ${r.number || "invoice"}`}
                    size="sm"
                    onClick={() => onView?.(r)}
                  />
                  <IconButton
                    icon={<Trash2 size={15} />}
                    label={`Delete ${r.number || "invoice"}`}
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete?.(r)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function HistoryPiInvoiceModal({
  open,
  onClose,
  piRecords = [],
  tiRecords = [],
  loading = false,
  onView,
  onDelete,
}) {
  const [tab, setTab] = React.useState("pi");

  React.useEffect(() => {
    if (open) setTab("pi");
  }, [open]);

  const onTab = tab === "pi";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="History Of Pi and Invoice"
      size="lg"
      footer={
        <Button variant="cancel" onClick={onClose}>
          Close
        </Button>
      }
    >
      <Tabs items={TABS} value={tab} onChange={setTab} />
      <div className="pt-3">
        <HistoryTable
          records={onTab ? piRecords : tiRecords}
          numberLabel={onTab ? "Pi No." : "Tax Invoice No."}
          loading={loading}
          emptyMessage={onTab ? "No performa invoices for this license." : "No tax invoices for this license."}
          onView={onView}
          onDelete={onDelete}
        />
      </div>
    </Modal>
  );
}
