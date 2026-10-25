import { Timeline } from "./Timeline";

/**
 * The audit history spine — who changed what, and when.
 *
 * `kind` grades each event with an icon and ring colour so a long history can
 * be read down its spine without opening a single entry. Omit it and the node
 * falls back to a plain accent dot.
 *
 * An entry describes its change in one of three ways, in increasing detail:
 * a bare `before`/`after` pair, a single `change` object with a field label,
 * or a `changes` array for an edit that touched several fields at once. A
 * `description` renders prose instead of a diff table.
 */
const meta = {
  title: "Components/Timeline",
  component: Timeline,
  tags: ["autodocs"],
  argTypes: {
    items: {
      control: "object",
      description:
        "`{ date, time, relative?, title, kind?, description?, changes?, change?, before?, after? }[]`.",
    },
    className: { control: "text" },
  },
};

export default meta;

const ITEMS = [
  {
    date: "03-JUL-26",
    time: "14:16",
    relative: "3 months ago",
    title: "Create License",
    kind: "created",
    description: "Licence issued against PI PIC260316 for Aaxis Nano.",
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
      { label: "Device", before: "—", after: "680376fa-1a" },
      { label: "Data rate", before: "5M", after: "10M" },
    ],
  },
  {
    date: "02-SEP-26",
    time: "11:20",
    relative: "3 weeks ago",
    title: "Tax Invoice generated",
    kind: "document",
  },
  {
    date: "18-SEP-26",
    time: "08:15",
    relative: "1 week ago",
    title: "Note added",
    kind: "note",
    description: "Customer asked to defer renewal until the next financial year.",
  },
  {
    date: "24-SEP-26",
    time: "17:55",
    relative: "2 days ago",
    title: "Delete Renewal Stream",
    kind: "deleted",
    before: "datarate = 10M",
    after: "removed",
  },
];

export const Playground = {
  args: { items: ITEMS },
};

/** The five gradings, each with its own icon and ring colour. */
export const AllKinds = {
  args: {
    items: [
      { date: "01-JAN-26", time: "10:00", title: "created", kind: "created", description: "A record came into existence." },
      { date: "02-JAN-26", time: "10:00", title: "changed", kind: "changed", description: "A field was edited." },
      { date: "03-JAN-26", time: "10:00", title: "document", kind: "document", description: "An invoice or PI was produced." },
      { date: "04-JAN-26", time: "10:00", title: "note", kind: "note", description: "A human wrote something down." },
      { date: "05-JAN-26", time: "10:00", title: "deleted", kind: "deleted", description: "A record was removed." },
    ],
  },
};

/** With no `kind`, every node is a plain accent dot — the original look. */
export const WithoutKinds = {
  args: {
    items: [
      { date: "01-JAN-26", time: "10:00", title: "Create License" },
      { date: "02-JAN-26", time: "11:30", title: "Activate License" },
      { date: "03-JAN-26", time: "09:05", title: "Update Property" },
    ],
  },
};

/** The three ways an entry can describe its change. */
export const ChangeShapes = {
  args: {
    items: [
      {
        date: "01-JAN-26",
        time: "10:00",
        title: "Bare before / after",
        kind: "changed",
        before: "Deactivate",
        after: "Activate",
      },
      {
        date: "02-JAN-26",
        time: "10:00",
        title: "Single labelled change",
        kind: "changed",
        change: { label: "Status", before: "Deactivate", after: "Activate", reason: "TCK-20481" },
      },
      {
        date: "03-JAN-26",
        time: "10:00",
        title: "Several fields at once",
        kind: "changed",
        changes: [
          { label: "Site", before: "Noida Plant 2", after: "Noida Plant 3" },
          { label: "Data rate", before: "5M", after: "10M" },
        ],
      },
      {
        date: "04-JAN-26",
        time: "10:00",
        title: "Prose instead of a diff",
        kind: "note",
        description: "Renewal deferred at the customer's request.",
      },
    ],
  },
};

export const Empty = {
  args: { items: [] },
};
