import * as React from "react";
import { RowSelectCheckbox } from "./RowSelectCheckbox";

/**
 * The checkbox in a `DataTable`'s selection column.
 *
 * Separate from the general-purpose `Checkbox` because a table's header box
 * needs a third, *indeterminate* state — "some rows on this page are
 * selected" — which a boolean checkbox cannot express. It renders a real
 * `<input type="checkbox">` inside a label, so Space toggles it when focused.
 */
const meta = {
  title: "Components/RowSelectCheckbox",
  component: RowSelectCheckbox,
  tags: ["autodocs"],
  argTypes: {
    checked: { control: "boolean", description: "Selected state." },
    indeterminate: {
      control: "boolean",
      description:
        "Draws the dash rather than the tick. For a header box when only some rows are selected. Wins over `checked` visually.",
    },
    onChange: { action: "changed" },
    label: {
      control: "text",
      description: 'Accessible name. Defaults to "Select row" — override it so a column of boxes does not all read alike.',
    },
  },
  args: {
    checked: false,
    indeterminate: false,
    label: "Select row",
  },
};

export default meta;

export const Playground = {};

/** The three states a selection column can be in. */
export const AllStates = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <RowSelectCheckbox checked={false} label="None selected" />
        <span className="text-body-sm text-ink-muted">unchecked</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <RowSelectCheckbox indeterminate label="Some selected" />
        <span className="text-body-sm text-ink-muted">indeterminate</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <RowSelectCheckbox checked label="All selected" />
        <span className="text-body-sm text-ink-muted">checked</span>
      </div>
    </div>
  ),
};

/** A header box driving three rows — the header goes indeterminate as soon as the rows disagree. */
export const HeaderAndRows = {
  render: function Render() {
    const [rows, setRows] = React.useState([false, false, false]);
    const all = rows.every(Boolean);
    const some = rows.some(Boolean) && !all;

    return (
      <div className="w-64 divide-y divide-card-border rounded-surface border border-card-border">
        <div className="flex items-center gap-3 bg-chrome-deep/40 px-3 py-2">
          <RowSelectCheckbox
            checked={all}
            indeterminate={some}
            label="Select all rows"
            onChange={() => setRows(rows.map(() => !all))}
          />
          <span className="text-body-sm font-semibold text-ink-primary">Account</span>
        </div>
        {rows.map((checked, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2">
            <RowSelectCheckbox
              checked={checked}
              label={`Select row ${i + 1}`}
              onChange={() => setRows(rows.map((r, j) => (i === j ? !r : r)))}
            />
            <span className="text-body-sm text-ink-primary">Row {i + 1}</span>
          </div>
        ))}
      </div>
    );
  },
};
