import * as React from "react";
import { DeactivateLicenseModal } from "./DeactivateLicenseModal";
import { Button } from "../../common/Button";

/**
 * Confirms deactivating licences.
 *
 * A thin wrapper over `ConfirmDialog` in the danger tone. `count` is folded
 * into the message and pluralised, so the user is told exactly how many rows
 * their click is about to affect — the number is the whole risk in a bulk
 * action.
 */
const meta = {
  title: "Feature/License/DeactivateLicenseModal",
  component: DeactivateLicenseModal,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "closed" },
    onConfirm: { action: "confirmed" },
    count: { control: { type: "number", min: 1 }, description: "How many licences. Pluralises the message." },
  },
  args: { open: true, count: 1 },
};

export default meta;

export const Playground = {};

/** Singular and plural wording. */
export const SingleLicence = { args: { count: 1 } };
export const ManyLicences = { args: { count: 12 } };

export const Interactive = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button variant="danger" onClick={() => setOpen(true)}>
          Deactivate 3 licences
        </Button>
        <DeactivateLicenseModal open={open} count={3} onClose={() => setOpen(false)} onConfirm={() => setOpen(false)} />
      </>
    );
  },
};
