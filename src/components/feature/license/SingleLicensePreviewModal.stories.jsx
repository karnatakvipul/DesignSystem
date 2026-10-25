import * as React from "react";
import { SingleLicensePreviewModal } from "./SingleLicensePreviewModal";
import { Button } from "../../common/Button";

const LICENSE = {
  id: 1,
  account: "Aaxis Nano",
  name: "Reflashing Issue",
  status: "Expired",
  type: "EF-1M-5M-3Y-PO-CPCB",
  term: "Yearly",
  key: "54f45452-1d03-4f4a-9b4e-e6d6b",
  issue: "17-Aug-2025",
  actDate: "17-Aug-2025",
  expiry: "17-Aug-2026",
  site: "Gmr Airport Hyderabad: Aemb Domestic Tank Terminal",
  lastPi: "PIC260316",
  lastInvoice: "-",
  amount: "₹2,121.00",
  payment: "-",
};

/**
 * The read-only detail view for one licence — everything the table's columns
 * hold, without having to scroll a wide table sideways.
 *
 * On mobile this is the "View details" action at the top of each card's ⋮
 * sheet, and it is the one action that sheet has which the desktop toolbar
 * does not: on a phone the table's columns are not all reachable, so the
 * detail view earns its place there.
 *
 * The licence key carries a copy button, since it is the field most likely to
 * be pasted somewhere else. With no `license` the component renders nothing,
 * so it is safe to mount against a selection that may be empty.
 */
const meta = {
  title: "Feature/License/SingleLicensePreviewModal",
  component: SingleLicensePreviewModal,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "closed" },
    license: { control: "object", description: "The licence. Renders nothing when absent." },
    onToast: { action: "toast", description: "Called after the key is copied." },
  },
  args: { open: true, license: LICENSE },
};

export default meta;

export const Playground = {};

/** A licence with most optional fields unset. */
export const SparseRecord = {
  args: {
    license: {
      id: 4,
      account: "-",
      name: "Test Alert 6",
      status: "Deactivated",
      type: "EF-7D-XX-XX-XX-TEST",
      term: "7 day(s)",
      key: "ec1ef172-e375-424e-a3a6-b4c99",
      issue: "14-May-2024",
      expiry: "-",
      site: "-",
      amount: "₹0.00",
    },
  },
};

/** With no licence, nothing renders — safe against an empty selection. */
export const NoLicenceRendersNothing = {
  args: { license: null },
  render: (args) => (
    <div>
      <p className="text-body-sm text-ink-muted">(nothing renders below this line)</p>
      <SingleLicensePreviewModal {...args} />
    </div>
  ),
};

export const Interactive = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    const [toast, setToast] = React.useState(null);
    return (
      <>
        <Button onClick={() => setOpen(true)}>View details</Button>
        <p className="mt-3 font-mono text-body-sm text-ink-muted">{toast ?? "(copy the key)"}</p>
        <SingleLicensePreviewModal
          open={open}
          license={LICENSE}
          onClose={() => setOpen(false)}
          onToast={setToast}
        />
      </>
    );
  },
};
