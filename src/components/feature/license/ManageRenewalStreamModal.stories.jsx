import * as React from "react";
import { ManageRenewalStreamModal } from "./ManageRenewalStreamModal";
import { Button } from "../../common/Button";

const STREAMS = [
  { label: "Annual subscription", amount: "60475" },
  { label: "Support retainer", amount: "12000" },
  { label: "Hardware AMC", amount: "8500" },
];

/**
 * Edits the set of renewal streams — the named amounts that make up what a
 * licence is re-billed for.
 *
 * A `FormModal` around a `DynamicRowList`, so rows are added and removed
 * inline and the whole set is saved in one go rather than row by row. Given no
 * `streams` it opens on a single blank row, so the add case needs no special
 * handling at the call site.
 *
 * `onSave` receives the full array, including any blank rows — validate before
 * persisting if that matters.
 */
const meta = {
  title: "Feature/License/ManageRenewalStreamModal",
  component: ManageRenewalStreamModal,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "closed" },
    streams: { control: "object", description: "`{ label, amount }[]`. Absent opens one blank row." },
    onSave: { action: "saved", description: "Receives the full array of rows." },
  },
  args: { open: true, streams: STREAMS },
};

export default meta;

export const Playground = {};

/** With no streams it opens on a single blank row, ready to fill in. */
export const EmptyStartsWithOneRow = { args: { streams: undefined } };

export const SingleStream = { args: { streams: [STREAMS[0]] } };

export const Interactive = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    const [saved, setSaved] = React.useState(null);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Manage renewal streams</Button>
        <pre className="mt-3 rounded-control bg-chrome-deep/40 p-3 font-mono text-body-sm text-ink-secondary">
          {saved ? JSON.stringify(saved, null, 2) : "(nothing saved yet)"}
        </pre>
        <ManageRenewalStreamModal
          open={open}
          streams={STREAMS}
          onClose={() => setOpen(false)}
          onSave={(rows) => {
            setSaved(rows);
            setOpen(false);
          }}
        />
      </>
    );
  },
};
