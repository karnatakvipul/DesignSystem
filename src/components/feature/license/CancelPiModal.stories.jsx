import * as React from "react";
import { CancelPiModal } from "./CancelPiModal";
import { Button } from "../../common/Button";

/**
 * Confirms cancelling a proforma invoice.
 *
 * A thin wrapper over `ConfirmDialog` in the danger tone. `invoiceNo` is named
 * in the message so the user is confirming *this* invoice rather than a
 * generic one; with none supplied it degrades to "this performa invoice"
 * rather than printing "undefined".
 */
const meta = {
  title: "Feature/License/CancelPiModal",
  component: CancelPiModal,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "closed" },
    onConfirm: { action: "confirmed" },
    invoiceNo: { control: "text", description: "Named in the message. Falls back to generic wording." },
  },
  args: { open: true, invoiceNo: "PIC260316" },
};

export default meta;

export const Playground = {};

/** With no invoice number the message degrades gracefully instead of printing "undefined". */
export const WithoutInvoiceNumber = { args: { invoiceNo: undefined } };

export const Interactive = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button variant="danger" onClick={() => setOpen(true)}>
          Cancel PIC270003
        </Button>
        <CancelPiModal
          open={open}
          invoiceNo="PIC270003"
          onClose={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
        />
      </>
    );
  },
};
