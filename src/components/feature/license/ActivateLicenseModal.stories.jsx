import * as React from "react";
import { ActivateLicenseModal } from "./ActivateLicenseModal";
import { Button } from "../../common/Button";

/**
 * Confirms activating one or more licences, optionally back-dating the
 * activation.
 *
 * The date is cleared every time the dialog opens, so a date chosen for one
 * licence can never be carried silently onto the next. `onConfirm` receives
 * the chosen date, or `undefined` when none was picked — meaning "activate
 * from today".
 *
 * In the app this is the first half of a two-step flow: confirming here opens
 * `ValidateTicketModal`, and only then does the change go through.
 */
const meta = {
  title: "Feature/License/ActivateLicenseModal",
  component: ActivateLicenseModal,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "closed" },
    onConfirm: { action: "confirmed", description: "Receives the chosen date, or `undefined` for today." },
  },
  args: { open: true },
};

export default meta;

export const Playground = {};

/** Opened from a button, showing what `onConfirm` hands back. */
export const Interactive = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    const [result, setResult] = React.useState(null);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Activate licence</Button>
        <p className="mt-3 font-mono text-body-sm text-ink-muted">
          Confirmed with: {result === null ? "(nothing yet)" : String(result || "today")}
        </p>
        <ActivateLicenseModal
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={(date) => {
            setResult(date ?? "");
            setOpen(false);
          }}
        />
      </>
    );
  },
};

export const Closed = { args: { open: false } };
