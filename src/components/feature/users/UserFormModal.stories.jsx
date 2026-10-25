import * as React from "react";
import { UserFormModal } from "./UserFormModal";
import { Button } from "../../common/Button";

const EXISTING = {
  id: 1,
  name: "License Manager",
  email: "manager@my Design System.com",
  role: "Manager",
  products: ["EnviroFRONT", "OCEMS"],
};

/**
 * Add or edit a user — name, email, role, and which products they can reach.
 *
 * Submit stays disabled until both name and email have non-whitespace values,
 * since a user without either cannot be identified or signed in.
 *
 * `products` scopes what the user sees rather than what they may do — role
 * carries the permissions. A user with no products is valid but will find the
 * app empty.
 */
const meta = {
  title: "Feature/Users/UserFormModal",
  component: UserFormModal,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "closed" },
    user: { control: "object", description: "The record to edit. Omit for a blank Add form." },
    onSave: { action: "saved", description: "Receives `{ name, email, role, products }`." },
  },
  args: { open: true },
};

export default meta;

/** Blank Add — Ok is disabled until name and email are both filled. */
export const AddUser = {};

export const EditUser = { args: { user: EXISTING } };

/** A user scoped to no products — valid, but they will find the app empty. */
export const NoProductAccess = {
  args: { user: { ...EXISTING, products: [] } },
};

export const Interactive = {
  render: function Render() {
    const [user, setUser] = React.useState(undefined);
    const [open, setOpen] = React.useState(false);
    const [saved, setSaved] = React.useState(null);
    return (
      <>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setUser(undefined);
              setOpen(true);
            }}
          >
            Add user
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setUser(EXISTING);
              setOpen(true);
            }}
          >
            Edit existing
          </Button>
        </div>
        <pre className="mt-3 rounded-control bg-chrome-deep/40 p-3 font-mono text-body-sm text-ink-secondary">
          {saved ? JSON.stringify(saved, null, 2) : "(nothing saved yet)"}
        </pre>
        <UserFormModal
          open={open}
          user={user}
          onClose={() => setOpen(false)}
          onSave={(values) => {
            setSaved(values);
            setOpen(false);
          }}
        />
      </>
    );
  },
};
