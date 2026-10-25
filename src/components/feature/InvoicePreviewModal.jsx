import { Mail } from "lucide-react";
import { SlideOverModal } from "../common/SlideOverModal";
import { Tabs } from "../common/Tabs";
import { Button } from "../common/Button";
const tabs = [
  { value: "pdf", label: "Invoice PDF" },
  { value: "excel", label: "Renewal Excel" }
];
function InvoicePreviewModal({
  open,
  onClose,
  customerEmail,
  activeTab,
  onTabChange,
  onSendEmail,
  children
}) {
  return <SlideOverModal open={open} onClose={onClose} title="Invoice preview" width="640px">
      <div className="flex flex-col gap-4">
        <Tabs items={tabs} value={activeTab} onChange={onTabChange} />
        {customerEmail && <div className="flex items-center justify-between rounded-md bg-accent-muted px-3 py-2 text-body">
            <span className="flex items-center gap-2 text-ink-secondary">
              <Mail size={14} />
              {customerEmail}
            </span>
            {onSendEmail && <Button size="sm" variant="secondary" onClick={onSendEmail}>
                Send
              </Button>}
          </div>}
        <div className="min-h-[60vh]">{children}</div>
      </div>
    </SlideOverModal>;
}
export {
  InvoicePreviewModal
};
