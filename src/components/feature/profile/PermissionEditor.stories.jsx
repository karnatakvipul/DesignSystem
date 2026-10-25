import * as React from "react";
import { PermissionEditor } from "./PermissionEditor";

/**
 * The permission checklist for a user.
 *
 * The six permissions are fixed by the component
 * (`View Licenses`, `Edit Licenses`, `Delete Licenses`, `Manage Users`,
 * `View Reports`, `Manage Billing`) — `permissions` is which of them are
 * currently granted, not which exist.
 *
 * It holds a draft and re-syncs whenever `permissions` changes from outside,
 * so the list never shows a grant the server has not actually recorded.
 * `onSave` receives the full selected array.
 */
const meta = {
  title: "Feature/Profile/PermissionEditor",
  component: PermissionEditor,
  tags: ["autodocs"],
  argTypes: {
    permissions: { control: "object", description: "Currently granted permissions." },
    onSave: { action: "saved", description: "Receives the full selected array." },
  },
  args: { permissions: ["View Licenses", "View Reports"] },
  render: (args) => (
    <div className="w-[32rem] rounded-surface border border-card-border p-4">
      <PermissionEditor {...args} />
    </div>
  ),
};

export default meta;

/** A read-mostly user. */
export const Playground = {};

export const NoPermissions = { args: { permissions: [] } };

export const AllPermissions = {
  args: {
    permissions: [
      "View Licenses",
      "Edit Licenses",
      "Delete Licenses",
      "Manage Users",
      "View Reports",
      "Manage Billing",
    ],
  },
};

/** Toggle a few and save — the full selection comes back, not just the change. */
export const Interactive = {
  render: function Render() {
    const [saved, setSaved] = React.useState(null);
    return (
      <div className="w-[32rem]">
        <div className="rounded-surface border border-card-border p-4">
          <PermissionEditor permissions={["View Licenses"]} onSave={setSaved} />
        </div>
        <pre className="mt-3 rounded-control bg-chrome-deep/40 p-3 font-mono text-body-sm text-ink-secondary">
          {saved ? JSON.stringify(saved, null, 2) : "(nothing saved yet)"}
        </pre>
      </div>
    );
  },
};
