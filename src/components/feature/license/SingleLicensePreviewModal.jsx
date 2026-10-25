import * as React from "react";
import { Copy, Check } from "lucide-react";
import { SlideOverModal } from "../../common/SlideOverModal";
import { Badge } from "../../common/Badge";
import { cn } from "../../../lib/cn";

/** Quick preview of one license detail with Hybrid Adaptive Metadata layout. */
export function SingleLicensePreviewModal({ open, onClose, license, onToast }) {
  const [copied, setCopied] = React.useState(false);

  if (!license) return null;

  const keyVal = license.key || license.id || "-";

  function copyKeyToClipboard() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(keyVal)
        .then(() => {
          setCopied(true);
          onToast?.("License Key copied to clipboard!");
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          // Clipboard unavailable or permission denied — ignore silently
        });
    }
  }

  const shortFields = [
    { label: "Type", val: license.type },
    { label: "Issue Date", val: license.issue },
    { label: "Activation", val: license.actDate || license.activeDate },
    { label: "Expiry Date", val: license.expiry },
  ];

  return (
    <SlideOverModal open={open} onClose={onClose} title="License Details" width="420px">
      <div className="flex items-center justify-between mb-4 border-b border-card-border pb-3">
        <Badge tone={license.status === "Active" ? "online" : license.status === "Expired" ? "offline" : "warn"}>
          {license.status}
        </Badge>
        <span className="text-body-sm text-ink-muted font-medium">ID: #{license.id}</span>
      </div>

      <div className="flex flex-col gap-4 text-body select-text">
        {/* Account Name */}
        <div className="flex flex-col gap-1 border-b border-card-border pb-3">
          <span className="text-body-sm font-semibold uppercase tracking-wider text-ink-muted">Account</span>
          <span className="font-semibold text-ink-primary break-words leading-snug">
            {license.account || "-"}
          </span>
        </div>

        {/* License Descriptor Name */}
        <div className="flex flex-col gap-1 border-b border-card-border pb-3">
          <span className="text-body-sm font-semibold uppercase tracking-wider text-ink-muted">License Name</span>
          <span className="font-semibold text-ink-primary break-words leading-relaxed text-body">
            {license.name || "-"}
          </span>
        </div>

        {/* Short Metadata 2-Column Grid */}
        <div className="grid grid-cols-2 gap-3 border-b border-card-border pb-3 bg-canvas/40 p-3 rounded-surface">
          {shortFields.map(({ label, val }) => (
            <div key={label} className="flex flex-col min-w-0">
              <span className="text-caption font-medium uppercase tracking-wider text-ink-muted">{label}</span>
              <span className="text-body-sm font-semibold text-ink-primary truncate mt-0.5">{val || "-"}</span>
            </div>
          ))}
        </div>

        {/* Site Location */}
        <div className="flex flex-col gap-1 border-b border-card-border pb-3">
          <span className="text-body-sm font-semibold uppercase tracking-wider text-ink-muted">Site Location</span>
          <span className="font-medium text-ink-primary break-words text-body-sm leading-normal">
            {license.site || "-"}
          </span>
        </div>

        {/* Monospace Key Block with 1-Click Copy Button */}
        <div className="flex flex-col gap-1.5 pt-1">
          <span className="text-body-sm font-semibold uppercase tracking-wider text-ink-muted">License Key</span>
          <div className="flex items-center justify-between gap-2 rounded-surface border border-card-border bg-canvas p-2.5 font-mono text-body-sm text-ink-primary break-all shadow-inner">
            <span className="truncate flex-1 font-medium select-all">{keyVal}</span>
            <button
              type="button"
              onClick={copyKeyToClipboard}
              className={cn(
                "flex items-center gap-1 shrink-0 rounded-control px-2 py-1 text-body-sm font-semibold cursor-pointer transition-colors",
                copied
                  ? "bg-status-online-bg text-status-online"
                  : "bg-accent-muted/60 text-accent hover:bg-accent hover:text-white"
              )}
              aria-label="Copy License Key"
            >
              {copied ? (
                <>
                  <Check size={13} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </SlideOverModal>
  );
}
