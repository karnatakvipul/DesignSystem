import * as React from "react";
import { ProfileActions } from "./ProfileActions";

/**
 * The three account actions on a profile page: rename, change permission,
 * change password.
 *
 * Presentational only — it renders the list and calls back. Omitting a handler
 * still renders its row, so gate the row at the call site if a given user is
 * not allowed to reach it.
 */
const meta = {
  title: "Feature/Profile/ProfileActions",
  component: ProfileActions,
  tags: ["autodocs"],
  argTypes: {
    onRename: { action: "rename" },
    onChangePermission: { action: "change permission" },
    onChangePassword: { action: "change password" },
  },
  render: (args) => (
    <div className="w-72 rounded-surface border border-card-border p-3">
      <ProfileActions {...args} />
    </div>
  ),
};

export default meta;

export const Playground = {};

/** Wired up, reporting which action fired. */
export const Interactive = {
  render: function Render() {
    const [last, setLast] = React.useState(null);
    return (
      <div className="w-72">
        <div className="rounded-surface border border-card-border p-3">
          <ProfileActions
            onRename={() => setLast("Rename user")}
            onChangePermission={() => setLast("Change permission")}
            onChangePassword={() => setLast("Change password")}
          />
        </div>
        <p className="mt-3 font-mono text-body-sm text-ink-muted">Last: {last ?? "(none)"}</p>
      </div>
    );
  },
};
