import { ProfileMenu } from "./ProfileMenu";

/**
 * The avatar in the header, and the menu behind it — who is signed in, a way
 * to their account, and a way out.
 *
 * Identity can come either as a `user` object or as flat `name`/`email`/`role`
 * props, which win over the object when both are given. That is what lets a
 * shell pass its session object straight through while a single screen
 * overrides just one field.
 *
 * With no avatar image it falls back to the initial, so a signed-in user is
 * never represented by a broken image.
 */
const meta = {
  title: "Layout/ProfileMenu",
  component: ProfileMenu,
  tags: ["autodocs"],
  argTypes: {
    user: { control: "object", description: "`{ name, email, role? }`. The flat props below override it." },
    name: { control: "text", description: "Overrides `user.name`." },
    email: { control: "text", description: "Overrides `user.email`." },
    role: { control: "text", description: "Overrides `user.role`." },
    avatarUrl: { control: "text", description: "Avatar image. Falls back to the initial when absent." },
    onManageAccount: { action: "manage account", description: "Omit to hide that item." },
    onSignOut: { action: "sign out" },
    className: { control: "text" },
  },
  args: {
    user: { name: "Super Admin", email: "admin@my Design System.com", role: "Super Administrator" },
  },
  render: (args) => (
    <div className="flex h-64 justify-end rounded-surface border border-card-border bg-chrome p-3">
      <ProfileMenu {...args} />
    </div>
  ),
};

export default meta;

/** Click the avatar to open the menu. */
export const Playground = {};

/** Without a role the menu shows just name and email. */
export const WithoutRole = {
  args: { user: { name: "License Manager", email: "manager@my Design System.com" } },
};

/** Flat props win over the `user` object when both are supplied. */
export const FlatPropsOverrideUser = {
  args: {
    user: { name: "From the object", email: "object@my Design System.com", role: "Object role" },
    name: "From the flat prop",
    role: "Flat role",
  },
};

/** With an image, the initial is replaced by the avatar. */
export const WithAvatarImage = {
  args: {
    user: { name: "Support Engineer", email: "support@my Design System.com", role: "Engineer" },
    avatarUrl:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#0f9b4f"/><text x="32" y="42" font-size="28" text-anchor="middle" fill="white" font-family="sans-serif">SE</text></svg>`
      ),
  },
};

/** Omitting `onManageAccount` leaves sign-out as the only action. */
export const SignOutOnly = {
  args: { onManageAccount: undefined },
};
