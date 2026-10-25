import * as React from "react";
import { Modal } from "../common/Modal";
function ChangesPreviewModal({ open, onClose, title = "Changes", fields = [] }) {
  return <Modal open={open} onClose={onClose} title={title} size="md">
      <div className="grid grid-cols-3 gap-2 text-body">
        <div className="font-medium text-ink-secondary">Field</div>
        <div className="font-medium text-ink-secondary">Previous</div>
        <div className="font-medium text-ink-secondary">Current</div>
        {(fields || []).map((f, i) => <React.Fragment key={`${f.label}-${i}`}>
            <div className="text-ink-primary">{f.label}</div>
            <div className="rounded bg-status-offline-bg px-2 py-1 text-status-offline">{f.previous}</div>
            <div className="rounded bg-status-online-bg px-2 py-1 text-status-online">{f.current}</div>
          </React.Fragment>)}
      </div>
    </Modal>;
}
export {
  ChangesPreviewModal
};
