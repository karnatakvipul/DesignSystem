import * as React from "react";
import { ExternalDeviceInfoModal } from "./ExternalDeviceInfoModal";
import { Button } from "../../common/Button";

const FULL_DEVICE = {
  deviceId: "680376fa-1a",
  deviceName: "Noida Plant 3 Analyser",
  serialNumber: "SN-4471-XZ",
  model: "EF-2200",
  manufacturer: "my Design System",
  firmwareVersion: "3.4.1",
  imei: "356938035643809",
  simNumber: "8991000012345678",
  ipAddress: "10.24.8.19",
  macAddress: "A4:CF:12:9B:00:5E",
  lastSeen: "21-Aug-2026 14:02",
  site: "Noida Plant 3",
  status: "Online",
};

/**
 * The hardware behind a licence — identifiers, firmware, connectivity and when
 * it was last heard from.
 *
 * **Empty fields are dropped, not shown blank.** A dialog listing twelve
 * labels with eight dashes next to them reads as broken data; showing only
 * what is actually known reads as a shorter record. Identifiers that get
 * pasted into other systems (device ID, serial, IMEI) carry a copy button.
 *
 * `license` is forgiving: it accepts either a licence with a nested `device`,
 * or a bare device object.
 */
const meta = {
  title: "Feature/License/ExternalDeviceInfoModal",
  component: ExternalDeviceInfoModal,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "closed" },
    license: {
      control: "object",
      description: "A licence with a nested `device`, or the device object itself.",
    },
    onToast: { action: "toast", description: "Called when a value is copied." },
  },
  args: { open: true, license: FULL_DEVICE },
};

export default meta;

export const Playground = {};

/** A licence carrying a nested `device` works just as well as a bare device object. */
export const NestedUnderLicense = {
  args: {
    license: { id: 5, account: "Abc Industries Pvt Ltd", device: FULL_DEVICE },
  },
};

/** Only the known fields render — the eight missing ones are dropped rather than shown as dashes. */
export const PartialData = {
  args: {
    license: {
      deviceId: "7135e7b4-A",
      deviceName: "Noida Plant 2 Analyser",
      site: "Noida Plant 2",
      status: "Offline",
      firmwareVersion: "",
      imei: "-",
    },
  },
};

/** Online and offline are distinguished at the top of the dialog. */
export const OfflineDevice = {
  args: { license: { ...FULL_DEVICE, status: "Offline", lastSeen: "02-Jun-2026 09:41" } },
};

/** Nothing known at all. */
export const NoDeviceData = { args: { license: {} } };

export const Interactive = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    const [toast, setToast] = React.useState(null);
    return (
      <>
        <Button onClick={() => setOpen(true)}>External device info</Button>
        <p className="mt-3 font-mono text-body-sm text-ink-muted">{toast ?? "(copy something)"}</p>
        <ExternalDeviceInfoModal
          open={open}
          license={FULL_DEVICE}
          onClose={() => setOpen(false)}
          onToast={setToast}
        />
      </>
    );
  },
};
