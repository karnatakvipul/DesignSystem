import * as React from "react";
import { Search, X, Inbox } from "lucide-react";
import { SlideOverModal } from "../../common/SlideOverModal";
import { Button } from "../../common/Button";
import { Dropdown } from "../../common/Dropdown";
import { InputField } from "../../common/InputField";
import { IconButton } from "../../common/IconButton";
import { TruncatedText } from "../../common/TruncatedText";

/**
 * Reviews the licences a document will cover before generating it — the
 * reference app's "Row Selection Preview".
 *
 * The selection made in the table is a starting point, not the answer: you
 * pick a dozen rows, then realise two of them belong on next month's invoice.
 * So this lists what is currently in scope, lets it be searched and trimmed,
 * and only then generates — which is the difference between a preview and a
 * confirmation dialog.
 *
 * Trimming is local. Removing a licence here takes it out of *this* document,
 * not out of the table's selection, so closing and reopening starts from the
 * selection again rather than from a decision made in a panel that has since
 * been dismissed.
 */
const DEFAULT_DOCUMENT_TYPES = [
  { value: "Proforma", label: "Performa Invoice" },
  { value: "Tax (Manual)", label: "Tax Invoice (Manual)" },
  { value: "Tax", label: "Tax Invoice" },
  { value: "Revise", label: "Revise" },
  { value: "Cancel", label: "Cancel Pi" },
];

export function SelectionRowPreviewModal({
  open,
  onClose,
  licenses = [],
  documentTypes = DEFAULT_DOCUMENT_TYPES,
  onConfirm,
}) {
  const [removedIds, setRemovedIds] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [documentType, setDocumentType] = React.useState(null);

  React.useEffect(() => {
    if (!open) return;
    setRemovedIds([]);
    setSearch("");
    setDocumentType(documentTypes.find((t) => !t.disabled)?.value ?? documentTypes[0]?.value ?? null);
  }, [open, documentTypes]);

  const kept = React.useMemo(
    () => licenses.filter((l) => !removedIds.includes(l.id)),
    [licenses, removedIds]
  );

  const shown = React.useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return kept;
    return kept.filter((l) => String(l.name ?? "").toLowerCase().includes(needle));
  }, [kept, search]);

  const filtering = shown.length !== kept.length;

  return (
    <SlideOverModal open={open} onClose={onClose} title="Selected License" width="480px">
      {/* `SlideOverModal` scrolls everything it is given, so the panel is laid
          out as a full-height column with the actions stuck to the bottom —
          otherwise Ok sits below fifty rows, reachable only by scrolling past
          everything it acts on. */}
      <div className="flex min-h-full flex-col">
        <div className="flex items-center justify-between gap-3 pb-3">
          <p className="text-body-sm text-ink-secondary">
            {/* The count is of what will be generated, not of what is on
                screen. The reference app shows the filtered length here, so
                searching appears to shrink the selection — the number people
                are about to act on quietly changing as they type. */}
            Total: <span className="font-semibold text-ink-primary">{kept.length}</span>
            {filtering && <span className="text-ink-muted"> · showing {shown.length}</span>}
          </p>

          <Dropdown
            options={documentTypes}
            value={documentType}
            onChange={setDocumentType}
            searchable={false}
            className="w-44 shrink-0"
          />
        </div>

        <InputField
          placeholder="Search Name"
          icon={<Search size={14} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search selected licenses by name"
        />

        {shown.length > 0 && (
          <p className="px-1 pt-3 pb-1.5 text-body-sm font-semibold text-ink-secondary">Name</p>
        )}

        <ul className="flex flex-1 flex-col gap-1.5">
          {shown.map((license) => (
            <li
              key={license.id}
              className="flex items-center gap-2 rounded-control border border-card-border bg-input/40 px-3 py-2"
            >
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="block min-w-0 text-body-sm font-medium text-ink-primary">
                  <TruncatedText text={license.name} maxLength={44} />
                </span>
                {license.account && (
                  <span className="block min-w-0 text-caption text-ink-muted">
                    <TruncatedText text={license.account} maxLength={44} />
                  </span>
                )}
              </span>
              {/* Named rather than a bare cross, so a screen reader says which
                  licence is about to leave the list. */}
              <IconButton
                icon={<X size={14} />}
                label={`Remove ${license.name}`}
                variant="danger"
                size="sm"
                onClick={() => setRemovedIds((prev) => [...prev, license.id])}
              />
            </li>
          ))}

          {shown.length === 0 && (
            <li className="flex flex-col items-center gap-2 py-10 text-center">
              <Inbox size={20} className="text-ink-muted" aria-hidden="true" />
              <p className="text-body font-medium text-ink-primary">
                {kept.length === 0 ? "Nothing left to invoice" : "No matching licenses"}
              </p>
              <p className="text-body-sm text-ink-muted">
                {kept.length === 0
                  ? "Every license has been removed from this document."
                  : `None of the ${kept.length} selected licenses match "${search.trim()}".`}
              </p>
            </li>
          )}
        </ul>

        <div className="sticky bottom-0 -mx-4 mt-4 flex items-center justify-end gap-2 border-t border-card-border bg-card px-4 py-3 sm:-mx-5 sm:px-5">
          <Button variant="cancel" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            disabled={kept.length === 0 || !documentType}
            onClick={() => onConfirm?.(documentType, kept)}
          >
            Ok
          </Button>
        </div>
      </div>
    </SlideOverModal>
  );
}
