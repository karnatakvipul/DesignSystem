import * as React from "react";
import { InvoicePreviewModal } from "./InvoicePreviewModal";
import { InvoicePdfViewer } from "./report/InvoicePdfViewer";
import { ExcelPreviewViewer } from "./report/ExcelPreviewViewer";
import { Button } from "../common/Button";

const EXCEL_ROWS = [
  { Account: "Prima Equipment", Site: "Pcbl Limited_Palej", Amount: "₹60,475.00", Expiry: "23-Feb-2025" },
  { Account: "Aaxis Nano", Site: "Gmr Airport Hyderabad", Amount: "₹2,121.00", Expiry: "17-Aug-2026" },
];

/**
 * The invoice preview — a `SlideOverModal` with tabs, the customer's email,
 * and whatever viewer you render inside.
 *
 * The email is shown because the next action is usually sending it, and the
 * address is the part worth checking before you do.
 *
 * The tab state is **controlled** (`activeTab` / `onTabChange`) rather than
 * internal, so the page can decide which tab opens — landing on the PDF for a
 * tax invoice but the spreadsheet for a renewal batch — and can swap the
 * viewer in `children` to match.
 */
const meta = {
  title: "Feature/InvoicePreviewModal",
  component: InvoicePreviewModal,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "closed" },
    customerEmail: { control: "text", description: "Shown above the preview. Omit to hide that strip." },
    activeTab: { control: "text", description: "Controlled tab value." },
    onTabChange: { action: "tab changed" },
    onSendEmail: { action: "send email" },
    children: { control: false, description: "The viewer for the current tab." },
  },
  args: { open: true, customerEmail: "accounts@primaequipment.com" },
};

export default meta;

export const Playground = {
  render: function Render(args) {
    const [tab, setTab] = React.useState("pdf");
    return (
      <InvoicePreviewModal {...args} activeTab={tab} onTabChange={setTab}>
        <InvoicePdfViewer pageCount={2} invoiceNo="PIC270003" />
      </InvoicePreviewModal>
    );
  },
};

/** The page swaps the viewer to match the tab — that is why the tab state is controlled. */
export const TabSwitchesViewer = {
  render: function Render(args) {
    const [tab, setTab] = React.useState("pdf");
    return (
      <InvoicePreviewModal {...args} activeTab={tab} onTabChange={setTab}>
        {tab === "pdf" ? (
          <InvoicePdfViewer pageCount={3} invoiceNo="PIC270003" />
        ) : (
          <ExcelPreviewViewer rows={EXCEL_ROWS} />
        )}
      </InvoicePreviewModal>
    );
  },
};

/** Without an email the strip above the preview is omitted. */
export const WithoutCustomerEmail = {
  args: { customerEmail: undefined },
  render: (args) => (
    <InvoicePreviewModal {...args}>
      <InvoicePdfViewer pageCount={1} invoiceNo="PIC260316" />
    </InvoicePreviewModal>
  ),
};

export const Interactive = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    const [tab, setTab] = React.useState("pdf");
    const [sent, setSent] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Preview invoice</Button>
        <p className="mt-3 text-body-sm text-ink-muted">{sent ? "Email sent." : "(not sent)"}</p>
        <InvoicePreviewModal
          open={open}
          customerEmail="accounts@primaequipment.com"
          activeTab={tab}
          onTabChange={setTab}
          onClose={() => setOpen(false)}
          onSendEmail={() => {
            setSent(true);
            setOpen(false);
          }}
        >
          <InvoicePdfViewer pageCount={2} invoiceNo="PIC270003" />
        </InvoicePreviewModal>
      </>
    );
  },
};
