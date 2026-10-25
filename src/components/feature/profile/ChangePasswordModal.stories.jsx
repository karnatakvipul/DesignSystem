import * as React from "react";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { Button } from "../../common/Button";

/**
 * The change-password dialog, with a strength meter and a confirmation field.
 *
 * `requireCurrent` decides whether the current password must be re-entered.
 * Turn it on when a user is changing their **own** password — proof the person
 * at the keyboard is the account holder rather than someone at an unlocked
 * desk. Leave it off when an administrator resets someone else's, where they
 * could not supply it anyway.
 *
 * Submit is blocked while the two new entries disagree, and all three fields
 * are cleared on every open so nothing lingers in the DOM between uses.
 */
const meta = {
  title: "Feature/Profile/ChangePasswordModal",
  component: ChangePasswordModal,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "closed" },
    onSave: { action: "saved" },
    requireCurrent: {
      control: "boolean",
      description: "Require the current password. On for self-service, off for an admin reset.",
    },
  },
  args: { open: true, requireCurrent: false },
};

export default meta;

/** An administrator resetting someone else's password — no current password asked for. */
export const AdminReset = {};

/** A user changing their own — the current password is required. */
export const SelfServiceChange = { args: { requireCurrent: true } };

export const Interactive = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    const [done, setDone] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Change password</Button>
        <p className="mt-3 text-body-sm text-ink-muted">{done ? "Password saved." : "(not saved yet)"}</p>
        <ChangePasswordModal
          open={open}
          requireCurrent
          onClose={() => setOpen(false)}
          onSave={() => {
            setDone(true);
            setOpen(false);
          }}
        />
      </>
    );
  },
};
