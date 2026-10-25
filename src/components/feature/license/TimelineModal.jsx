import * as React from "react";
import { History } from "lucide-react";
import { Modal } from "../../common/Modal";
import { Button } from "../../common/Button";
import { Loader } from "../../common/Loader";
import { Timeline } from "../../common/Timeline";

/**
 * Shows the audit history as a theme-aware timeline popup dialog.
 *
 * `loading` shows a spinner while the caller fetches the entries for the
 * record just opened; `subtitle` names which record this history belongs to,
 * since the dialog otherwise says nothing about that.
 */
export function TimelineModal({ open, onClose, entries = [], loading = false, subtitle }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Timeline"
      size="lg"
      footer={
        <Button variant="cancel" onClick={onClose}>
          Close
        </Button>
      }
    >
      {subtitle && (
        <p className="mb-3 border-b border-card-border pb-3 text-body-sm text-ink-secondary">{subtitle}</p>
      )}

      <div className="max-h-[70dvh] overflow-y-auto pr-1">
        {loading ? (
          <Loader label="Fetching license timeline..." />
        ) : entries.length === 0 ? (
          // An empty history is not an error — the record simply has no
          // activity yet, and saying so in place of the list is calmer than
          // an error dialog for a state that isn't one.
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <History size={22} className="text-ink-muted" aria-hidden="true" />
            <p className="text-body font-medium text-ink-primary">No activity yet</p>
            <p className="text-body-sm text-ink-muted">Nothing has happened here since it was created.</p>
          </div>
        ) : (
          <Timeline items={entries} />
        )}
      </div>
    </Modal>
  );
}
