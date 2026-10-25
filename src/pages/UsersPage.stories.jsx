import { UsersPage } from "./UsersPage";

/**
 * The complete users screen — table, filters, add/edit dialog and deactivation
 * flow.
 *
 * Same two modes as `LicensePage`: in-memory from `initialData` when no
 * `fetcher` is given, server-side paging when one is. `onCreate`, `onUpdate`
 * and `onDelete` are where the host app persists.
 */
const meta = {
  title: "Pages/UsersPage",
  component: UsersPage,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  argTypes: {
    fetcher: { control: false, description: "Server-side page fetcher. Its presence switches modes." },
    serverSide: { control: "boolean", description: "Overrides the inference from `fetcher`." },
    initialData: { control: "object", description: "Rows for the in-memory mode." },
    onCreate: { action: "create" },
    onUpdate: { action: "update" },
    onDelete: { action: "delete" },
    onToast: { action: "toast" },
  },
  render: (args) => (
    <div className="h-[42rem] bg-canvas p-2">
      <UsersPage {...args} />
    </div>
  ),
};

export default meta;

export const Playground = {};

export const WithSuppliedData = {
  args: {
    initialData: [
      { id: 1, name: "Super Admin", email: "admin@my Design System.com", role: "Super Administrator", status: "Active" },
      { id: 2, name: "License Manager", email: "manager@my Design System.com", role: "Manager", status: "Active" },
      { id: 3, name: "Support Engineer", email: "support@my Design System.com", role: "Engineer", status: "Deactivated" },
    ],
  },
};

export const EmptyState = { args: { initialData: [] } };

export const Mobile = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
