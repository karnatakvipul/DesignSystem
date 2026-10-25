import { UserProfilePage } from "./UserProfilePage";

const USER = {
  name: "Super Admin",
  email: "admin@my Design System.com",
  role: "Super Administrator",
  permissions: ["View Licenses", "Edit Licenses", "Manage Users", "View Reports"],
};

/**
 * The account screen — profile details, permissions, and the rename / change
 * password actions.
 *
 * `user` seeds it and is re-synced whenever it changes, so a host app fetching
 * the profile after mount does not need to key the component to force a reset.
 * With no `user` it falls back to a demo profile.
 *
 * `onUpdateProfile` and `onChangePassword` are where the host app persists —
 * the page manages its own draft state either way.
 */
const meta = {
  title: "Pages/UserProfilePage",
  component: UserProfilePage,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  argTypes: {
    user: { control: "object", description: "`{ name, email, role, permissions }`. Falls back to a demo profile." },
    onUpdateProfile: { action: "update profile" },
    onChangePassword: { action: "change password" },
    onToast: { action: "toast" },
  },
  render: (args) => (
    <div className="h-[42rem] overflow-auto bg-canvas p-2">
      <UserProfilePage {...args} />
    </div>
  ),
};

export default meta;

/** No `user` — the built-in demo profile. */
export const Playground = {};

export const WithSuppliedUser = { args: { user: USER } };

/** A restricted account, to show the permission list driving what is on screen. */
export const LimitedPermissions = {
  args: {
    user: {
      name: "Support Engineer",
      email: "support@my Design System.com",
      role: "Engineer",
      permissions: ["View Licenses"],
    },
  },
};

export const Mobile = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: { user: USER },
};
