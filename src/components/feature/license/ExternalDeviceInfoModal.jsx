import * as React from "react";
import { HardDrive } from "lucide-react";
import { Modal } from "../../common/Modal";
import { Button } from "../../common/Button";
import { Badge } from "../../common/Badge";
import { CopyButton } from "../../common/CopyButton";
import { TruncatedText } from "../../common/TruncatedText";

/** Device fields shown, in order, with the label used for each. */
const DEVICE_FIELDS = [
  { key: "deviceId", label: "Device ID", copyable: true },
  { key: "deviceName", label: "Device Name" },
  { key: "serialNumber", label: "Serial Number", copyable: true },
  { key: "model", label: "Model" },
  { key: "manufacturer", label: "Manufacturer" },
  { key: "firmwareVersion", label: "Firmware Version" },
  { key: "imei", label: "IMEI", copyable: true },
  { key: "simNumber", label: "SIM Number" },
  { key: "ipAddress", label: "IP Address" },
  { key: "macAddress", label: "MAC Address" },
  { key: "lastSeen", label: "Last Seen" },
  { key: "site", label: "Site" },
];

function hasValue(v) {
  return v !== undefined && v !== null && v !== "" && v !== "-";
}

/**
 * Read-only view of the external device attached to a license.
 *
 * The backend doesn't expose device fields yet, so this reads whatever the
 * license record happens to carry and shows an explicit empty state when
 * there's nothing — deliberately, rather than inventing placeholder values
 * that would look like real data. As soon as the API starts returning these
 * fields on the license, they appear here with no change needed.
 *
 * Props:
 * - open / onClose: modal visibility.
 * - license: the selected license record; device fields are read off it, or
 *   off `license.device` if the backend nests them.
 * - onToast: optional, used to confirm copy actions.
 */
function ExternalDeviceInfoModal({ open, onClose, license, onToast }) {
  const device = license?.device ?? license ?? {};

  const rows = DEVICE_FIELDS.map((f) => ({ ...f, value: device[f.key] })).filter((f) =>
    hasValue(f.value)
  );

  const isOnline = String(device.status ?? "").toLowerCase() === "online";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="External Device Info"
      size="md"
      footer={
        <Button variant="cancel" onClick={onClose}>
          Close
        </Button>
      }
    >
      {!license ? (
        <p className="text-body text-ink-muted">Select a license to view its device.</p>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-pill bg-accent-muted/40 text-accent">
            <HardDrive size={24} />
          </div>
          <p className="text-body font-semibold text-ink-primary">No device information</p>
          <p className="max-w-sm text-body-sm text-ink-muted">
            No external device is currently linked to{" "}
            <span className="font-medium text-ink-primary">{license.name || "this license"}</span>.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-accent-muted/40 text-accent">
              <HardDrive size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <TruncatedText
                text={device.deviceName || license.name || "Device"}
                className="text-body font-semibold text-ink-primary"
              />
              <p className="text-body-sm text-ink-muted">{license.account || ""}</p>
            </div>
            {hasValue(device.status) && (
              <Badge tone={isOnline ? "online" : "offline"}>{device.status}</Badge>
            )}
          </div>

          <dl className="divide-y divide-card-border rounded-control border border-card-border">
            {rows.map((f) => (
              <div key={f.key} className="flex items-center gap-3 px-3 py-2">
                <dt className="w-40 shrink-0 text-body-sm font-medium text-ink-secondary">{f.label}</dt>
                <dd className="min-w-0 flex-1">
                  <TruncatedText text={String(f.value)} className="text-body-sm text-ink-primary" />
                </dd>
                {f.copyable && (
                  <CopyButton
                    text={String(f.value)}
                    tooltipText={`Copy ${f.label}`}
                    onCopy={() => onToast?.(`${f.label} copied!`)}
                    className="shrink-0"
                  />
                )}
              </div>
            ))}
          </dl>
        </div>
      )}
    </Modal>
  );
}

export { ExternalDeviceInfoModal };
