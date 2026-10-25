import { InvoicePdfViewer } from "./InvoicePdfViewer";

/**
 * The paged invoice viewer.
 *
 * This is a **placeholder surface**: it draws the page frame, the invoice
 * number and the pager, but the actual PDF rendering (pdf.js) is not wired up
 * — the panel says so on its face rather than showing a blank sheet that looks
 * broken. Drop a real renderer in behind the same paging contract.
 *
 * `pageCount` is coerced to at least 1, and the current page is clamped back
 * into range whenever the document changes — so switching from a ten-page
 * invoice to a two-page one cannot leave you on page 7 of 2.
 */
const meta = {
  title: "Feature/Report/InvoicePdfViewer",
  component: InvoicePdfViewer,
  tags: ["autodocs"],
  argTypes: {
    pageCount: {
      control: { type: "number", min: 0 },
      description: "Pages in the document. Coerced to a minimum of 1.",
    },
    invoiceNo: { control: "text", description: 'Shown on the page. Falls back to "Invoice".' },
    className: { control: "text" },
  },
  args: { pageCount: 2, invoiceNo: "PIC270003" },
};

export default meta;

/** Use the pager to move between pages. */
export const Playground = {};

/** A single-page invoice — the pager has nowhere to go. */
export const SinglePage = { args: { pageCount: 1 } };

export const MultiPage = { args: { pageCount: 8, invoiceNo: "INV-2026-0044" } };

/** Without an invoice number it falls back to a generic label rather than printing "undefined". */
export const WithoutInvoiceNumber = { args: { invoiceNo: undefined } };

/** A nonsensical count is coerced to one page rather than rendering none. */
export const InvalidPageCount = { args: { pageCount: 0 } };
