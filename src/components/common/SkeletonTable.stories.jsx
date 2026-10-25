import { SkeletonTable } from "./SkeletonTable";

/**
 * The loading placeholder for a `DataTable` — a header row plus however many
 * body rows you are about to show.
 *
 * Match `rows` to your page size and `columns` to the visible column count, so
 * the table does not resize when the real data replaces it.
 */
const meta = {
  title: "Components/Skeletons/SkeletonTable",
  component: SkeletonTable,
  tags: ["autodocs"],
  argTypes: {
    rows: { control: { type: "number", min: 1, max: 25 }, description: "Body rows to draw. Defaults to 5." },
    columns: { control: { type: "number", min: 1, max: 12 }, description: "Columns to draw. Defaults to 4." },
    className: { control: "text" },
  },
  args: { rows: 5, columns: 4 },
};

export default meta;

export const Playground = {};

/** Sized for a wide table mid-load — e.g. the licence list at ten visible columns. */
export const WideTable = {
  args: { rows: 8, columns: 10 },
};

/** A compact table, e.g. a masters list. */
export const Compact = {
  args: { rows: 3, columns: 2 },
};
