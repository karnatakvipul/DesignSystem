import * as React from "react";
import { LicenseRenewalModal } from "./LicenseRenewalModal";
import { Button } from "../../common/Button";

const ROWS = Array.from({ length: 12 }, (_, i) => ({
  id: `${i + 1}-datarate`,
  accountName: ["Aaxis Nano", "Prima Equipment", "Abc Industries Pvt Ltd"][i % 3],
  name: `Licence record ${i + 1}`,
  licenseKey: `54f45452-${i + 1}`,
  ticketNo: `26${String(i + 1).padStart(8, "0")}`,
  timestamp: "17-Aug-2025",
  key: i % 2 ? "datarate" : "active",
  value: i % 2 ? "10M" : "1",
}));

const ACCOUNT_OPTIONS = [
  { value: "Aaxis Nano", label: "Aaxis Nano" },
  { value: "Prima Equipment", label: "Prima Equipment" },
  { value: "Abc Industries Pvt Ltd", label: "Abc Industries Pvt Ltd" },
];

/**
 * The renewal stream browser — the key/value properties that carry forward
 * when a licence renews, with its own filter, pagination and per-row edit and
 * delete.
 *
 * It is a table in a dialog, which is why it takes the full paging contract
 * (`rows`, `total`, `page`, `pageSize`, `onPageChange`) rather than a plain
 * array: the stream for a large account is longer than a dialog can show.
 *
 * `onManage` is the way through to `ManageRenewalStreamModal`, for editing the
 * set of streams rather than one licence's values.
 */
const meta = {
  title: "Feature/License/LicenseRenewalModal",
  component: LicenseRenewalModal,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "closed" },
    rows: { control: "object", description: "The current page of stream rows." },
    total: { control: "number", description: "Total matching rows, for pagination." },
    page: { control: "number" },
    pageSize: { control: "number" },
    onPageChange: { action: "page changed" },
    loading: { control: "boolean" },
    error: { control: "text" },
    onRetry: { action: "retry" },
    onSearch: { action: "search", description: "Receives the filter values." },
    productOptions: { control: "object" },
    accountOptions: { control: "object" },
    onProductChange: { action: "product changed" },
    onEditRow: { action: "edit row", description: "Receives the row — opens `RenewalStreamFormModal`." },
    onDeleteRow: { action: "delete row" },
    onManage: { action: "manage", description: "Opens `ManageRenewalStreamModal`." },
  },
  args: {
    open: true,
    rows: ROWS.slice(0, 8),
    total: ROWS.length,
    page: 1,
    pageSize: 8,
    accountOptions: ACCOUNT_OPTIONS,
    productOptions: [],
  },
};

export default meta;

export const Playground = {};

export const Loading = { args: { loading: true, rows: [] } };

export const ErrorState = {
  args: { error: "Could not load the renewal stream.", rows: [] },
};

/** A licence with nothing carried forward. */
export const Empty = { args: { rows: [], total: 0 } };

/** Page two of a longer stream. */
export const SecondPage = {
  args: { rows: ROWS.slice(8), page: 2, total: ROWS.length },
};

/** Paging wired up, so the dialog actually moves between pages. */
export const Interactive = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    const [page, setPage] = React.useState(1);
    const pageSize = 5;
    return (
      <>
        <Button onClick={() => setOpen(true)}>License renewal</Button>
        <LicenseRenewalModal
          open={open}
          rows={ROWS.slice((page - 1) * pageSize, page * pageSize)}
          total={ROWS.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          accountOptions={ACCOUNT_OPTIONS}
          onClose={() => setOpen(false)}
        />
      </>
    );
  },
};
