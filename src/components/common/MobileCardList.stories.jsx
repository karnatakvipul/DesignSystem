import * as React from "react";
import { Eye, Pencil, Trash2, Download } from "lucide-react";
import { MobileCardList } from "./MobileCardList";
import { Badge } from "./Badge";
import { TruncatedText } from "./TruncatedText";

const LICENCE_COLUMNS = [
  { key: "account", header: "ACCOUNT", render: (r) => <TruncatedText text={r.account} /> },
  { key: "name", header: "NAME", render: (r) => <TruncatedText text={r.name} /> },
  {
    key: "status",
    header: "STATUS",
    render: (r) => (
      <Badge tone={r.status === "Active" ? "online" : r.status === "Deactivated" ? "neutral" : "offline"}>
        {r.status}
      </Badge>
    ),
  },
  { key: "type", header: "TYPE" },
  { key: "expiry", header: "EXPIRY" },
  { key: "site", header: "SITE" },
  { key: "amount", header: "AMOUNT" },
];

const LICENCES = [
  { id: 1, account: "Aaxis Nano", name: "Reflashing Issue", status: "Expired", type: "EF-1M-5M-3Y-PO-CPCB", expiry: "17-Aug-2026", site: "Gmr Airport Hyderabad", amount: "₹2,121.00" },
  { id: 2, account: "Abc Industries Pvt Ltd", name: "Manufacturing - Noida Plant 3 - 680376fa-1a (Test Unit)", status: "Expired", type: "EF-7D-XX-XX-XX-TEST", expiry: "21-May-2024", site: "Noida Plant 3", amount: "₹0.00" },
  { id: 3, account: "my Design System - Imtb Engineers Pvt Ltd", name: "0.5 Mld Toka Stp Ulb: Stp_1_Outlet_Xx", status: "Active", type: "OC-1Y-5M-1Y-PR-XX", expiry: "29-Aug-2026", site: "0.5 Mld Toka Stp Ulb", amount: "₹0.00" },
  { id: 4, account: "-", name: "Test Alert 6", status: "Deactivated", type: "EF-7D-XX-XX-XX-TEST", expiry: "-", site: "-", amount: "₹0.00" },
];

const USER_COLUMNS = [
  { key: "name", header: "NAME" },
  { key: "email", header: "EMAIL" },
  { key: "role", header: "ROLE" },
  { key: "status", header: "STATUS", render: (r) => <Badge tone="online">{r.status}</Badge> },
];

const USERS = [
  { id: 1, name: "Super Admin", email: "admin@my Design System.com", role: "Super Administrator", status: "Active" },
  { id: 2, name: "License Manager", email: "manager@my Design System.com", role: "Manager", status: "Active" },
];

/**
 * The card list a table becomes below `md` — one card per row, with the
 * detail behind an expand chevron.
 *
 * **How a card decides what to show.** With both an `account` *and* a `name`
 * column present, it uses the rich header: account in bold, name beneath,
 * then the status badge and type chip. Any other column set falls back to
 * `primaryFields`, which is why a page should always pass it. Gating on
 * *either* column meant a table with `name` but no `account` printed its title
 * twice, and one with `account` but no `name` showed a single line and dropped
 * everything that told its rows apart.
 *
 * **Gestures.** Long-press (380ms) arms selection; once anything is selected a
 * plain tap adds to it. A finger that travels more than 10px is scrolling, not
 * pressing, so the press timer is cancelled — without that, the list selects
 * rows while you try to scroll.
 *
 * Mobile only — view these at a narrow viewport.
 */
const meta = {
  title: "Components/Mobile/MobileCardList",
  component: MobileCardList,
  tags: ["autodocs"],
  parameters: { viewport: { defaultViewport: "mobile1" } },
  argTypes: {
    data: { control: "object" },
    rowKey: { control: false, description: "`(row, index) => key`. Falls back to `row.id`, then the index." },
    columns: { control: "object", description: "Same column objects the desktop `DataTable` uses." },
    primaryFields: { control: "object", description: "Keys shown on the collapsed card when the rich header does not apply." },
    secondaryFields: { control: "object", description: "Keys revealed by the expand chevron. Non-empty enables expansion." },
    actionMenuItems: { control: "object", description: "`{ label, icon?, danger?, onClick }[]` behind each card's ⋮." },
    onRowClick: { action: "row clicked", description: "Tap handler when tapping does not select." },
    emptyMessage: { control: "text" },
    onClearFilters: { action: "filters cleared", description: "Adds a Clear All Filters button to the empty state." },
    loading: { control: "boolean" },
    error: { control: "text" },
    onRetry: { action: "retry" },
    loadingMore: { control: "boolean" },
    onLoadMore: { action: "load more" },
    hasMore: { control: "boolean", description: "With `onLoadMore`, renders the Load More button." },
    selectable: { control: "boolean" },
    selectionMode: {
      control: "inline-radio",
      options: ["multiple", "single"],
      description: '`"single"` selects on a plain tap; `"multiple"` needs a long-press to arm.',
    },
    selectedKeys: { control: "object" },
    onSelectedKeysChange: { action: "selection changed" },
    bulkActions: { control: "object", description: "`{ label, icon?, danger?, onClick }[]` for the floating bulk bar." },
    className: { control: "text" },
  },
  args: {
    data: LICENCES,
    columns: LICENCE_COLUMNS,
    rowKey: (r) => r.id,
    primaryFields: ["account", "name", "status", "type"],
    secondaryFields: ["expiry", "site", "amount"],
  },
  render: (args) => (
    <div className="md:hidden h-[32rem] overflow-hidden rounded-surface border border-card-border">
      <MobileCardList {...args} />
    </div>
  ),
};

export default meta;

/** Tap a card to expand it; tap the ⋮ for row actions. */
export const Playground = {
  args: {
    actionMenuItems: [
      { label: "View details", icon: <Eye size={18} /> },
      { label: "Edit", icon: <Pencil size={18} /> },
      { label: "Download", icon: <Download size={18} /> },
      { label: "Delete", icon: <Trash2 size={18} />, danger: true },
    ],
  },
};

/** With `account` **and** `name` present: account bold, name beneath, then status and type. */
export const RichHeader = {
  args: { data: LICENCES, columns: LICENCE_COLUMNS },
};

/** No `account` column, so `primaryFields` drives the card — name, email, status, each shown once. */
export const PrimaryFieldsFallback = {
  args: {
    data: USERS,
    columns: USER_COLUMNS,
    primaryFields: ["name", "email", "status"],
    secondaryFields: ["role"],
  },
};

/** Long-press a card to arm selection, then tap others to add to it. */
export const Selectable = {
  render: function Render(args) {
    const [keys, setKeys] = React.useState([]);
    return (
      <div className="md:hidden h-[32rem] overflow-hidden rounded-surface border border-card-border">
        <MobileCardList {...args} selectable selectedKeys={keys} onSelectedKeysChange={setKeys} />
      </div>
    );
  },
};

/** `"single"` selects on a plain tap — making someone hold 380ms to pick one row is not how a list works. */
export const SingleSelect = {
  render: function Render(args) {
    const [keys, setKeys] = React.useState([]);
    return (
      <div className="md:hidden h-[32rem] overflow-hidden rounded-surface border border-card-border">
        <MobileCardList {...args} selectable selectionMode="single" selectedKeys={keys} onSelectedKeysChange={setKeys} />
      </div>
    );
  },
};

/** `bulkActions` render in a floating bar once something is selected. */
export const WithBulkActions = {
  render: function Render(args) {
    const [keys, setKeys] = React.useState([1]);
    return (
      <div className="md:hidden h-[32rem] overflow-hidden rounded-surface border border-card-border">
        <MobileCardList
          {...args}
          selectable
          selectedKeys={keys}
          onSelectedKeysChange={setKeys}
          bulkActions={[{ label: "Delete", icon: <Trash2 size={14} />, danger: true }]}
        />
      </div>
    );
  },
};

export const Loading = { args: { data: [], loading: true } };

export const ErrorState = { args: { data: [], error: "Could not reach the licence service." } };

export const Empty = {
  args: { data: [], emptyMessage: "No licences match these filters." },
};

/** With `hasMore` and `onLoadMore`, a Load More button closes the list instead of the end-of-list text. */
export const LoadMore = {
  args: { hasMore: true, onLoadMore: () => {} },
};
