import * as React from "react";
import { TimelineModal } from "./TimelineModal";
import { Button } from "../../common/Button";

const ENTRIES = [
  {
    date: "03-JUL-26",
    time: "14:16",
    relative: "3 months ago",
    title: "Create License",
    kind: "created",
    description: "Licence issued against PI PIC260316.",
  },
  {
    date: "05-JUL-26",
    time: "09:02",
    relative: "3 months ago",
    title: "Activate License",
    kind: "changed",
    change: { label: "Status", before: "Deactivate", after: "Activate", reason: "TCK-20481" },
  },
  {
    date: "11-AUG-26",
    time: "16:40",
    relative: "1 month ago",
    title: "Update Property",
    kind: "changed",
    changes: [
      { label: "Site", before: "Noida Plant 2", after: "Noida Plant 3" },
      { label: "Data rate", before: "5M", after: "10M" },
    ],
  },
  { date: "02-SEP-26", time: "11:20", relative: "3 weeks ago", title: "Tax Invoice generated", kind: "document" },
];

/**
 * A licence's audit history in a dialog — `Timeline` wrapped in a `Modal` with
 * its own loading and empty states.
 *
 * `subtitle` names which licence is on screen. Without it a history opened
 * from a row is unattributed, which matters because these dialogs are opened
 * one row after another.
 *
 * Note the loading state is *derived* rather than a separate flag: the page
 * tracks which licence the entries were loaded for, and shows the spinner when
 * that is not the licence being asked about. A boolean set at the top of the
 * fetch effect caused an extra render before the request had even started.
 */
const meta = {
  title: "Feature/License/TimelineModal",
  component: TimelineModal,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "closed" },
    entries: { control: "object", description: "Passed straight to `Timeline`." },
    loading: { control: "boolean" },
    subtitle: { control: "text", description: "Which licence this history belongs to." },
  },
  args: {
    open: true,
    entries: ENTRIES,
    subtitle: "Aaxis Nano — Reflashing Issue",
  },
};

export default meta;

export const Playground = {};

export const Loading = { args: { loading: true, entries: [] } };

/** A licence with no recorded history yet. */
export const Empty = { args: { entries: [] } };

/** Without a subtitle the dialog does not say which licence it is showing. */
export const WithoutSubtitle = { args: { subtitle: undefined } };

export const Interactive = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open timeline</Button>
        <TimelineModal
          open={open}
          entries={ENTRIES}
          subtitle="Aaxis Nano — Reflashing Issue"
          onClose={() => setOpen(false)}
        />
      </>
    );
  },
};
