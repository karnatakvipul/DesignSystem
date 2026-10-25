import * as React from "react";
import { DynamicRowList } from "./DynamicRowList";
import { InputField } from "./InputField";
import { Dropdown } from "./Dropdown";

/**
 * A repeating list of rows the user can add to and remove from — reminder
 * days, key/value pairs, contact rows.
 *
 * You own the row's contents: `renderRow(item, index, patch)` draws it, and
 * calling `patch({ … })` merges a change back into that row. The component
 * owns only the add button, the per-row remove button, and the array
 * plumbing.
 *
 * `minRows` disables Remove once the list is down to that many, so a list that
 * must never be empty cannot be emptied.
 */
const meta = {
  title: "Components/Forms/DynamicRowList",
  component: DynamicRowList,
  tags: ["autodocs"],
  argTypes: {
    items: { control: "object", description: "The rows. You hold this array in state." },
    onChange: { action: "changed", description: "Receives the next array after an add, edit or remove." },
    createItem: { control: false, description: "`() => item` — builds the blank row the add button appends." },
    renderRow: { control: false, description: "`(item, index, patch) => node` — draws one row." },
    addLabel: { control: "text", description: 'Text on the add button. Defaults to "Add row".' },
    minRows: {
      control: { type: "number", min: 0 },
      description: "Remove is disabled at or below this count. Defaults to 0.",
    },
    className: { control: "text" },
  },
};

export default meta;

/** A simple list of text rows. */
export const Playground = {
  render: function Render(args) {
    const [items, setItems] = React.useState([{ value: "15" }, { value: "7" }, { value: "1" }]);
    return (
      <div className="w-96">
        <DynamicRowList
          {...args}
          items={items}
          onChange={setItems}
          createItem={() => ({ value: "" })}
          addLabel="Add reminder"
          renderRow={(item, i, patch) => (
            <InputField
              type="number"
              value={item.value}
              placeholder="Days before expiry"
              onChange={(e) => patch({ value: e.target.value })}
            />
          )}
        />
      </div>
    );
  },
};

/** A row can hold several controls — `patch` merges into just that row. */
export const MultiFieldRows = {
  render: function Render() {
    const [items, setItems] = React.useState([{ key: "datarate", value: "10M" }]);
    return (
      <div className="w-[32rem]">
        <DynamicRowList
          items={items}
          onChange={setItems}
          createItem={() => ({ key: "", value: "" })}
          addLabel="Add property"
          renderRow={(item, i, patch) => (
            <div className="flex gap-2">
              <Dropdown
                className="flex-1"
                value={item.key}
                onChange={(key) => patch({ key })}
                options={[
                  { value: "", label: "Select…" },
                  { value: "datarate", label: "Data rate" },
                  { value: "active", label: "Active" },
                  { value: "channels", label: "Channels" },
                ]}
              />
              <InputField
                className="flex-1"
                value={item.value}
                placeholder="Value"
                onChange={(e) => patch({ value: e.target.value })}
              />
            </div>
          )}
        />
        <pre className="mt-4 rounded-control bg-chrome-deep/40 p-3 font-mono text-body-sm text-ink-secondary">
          {JSON.stringify(items, null, 2)}
        </pre>
      </div>
    );
  },
};

/** With `minRows={1}` the last row's Remove is disabled, so the list can never be emptied. */
export const MinimumRows = {
  render: function Render() {
    const [items, setItems] = React.useState([{ value: "15" }]);
    return (
      <div className="w-96">
        <DynamicRowList
          items={items}
          onChange={setItems}
          minRows={1}
          createItem={() => ({ value: "" })}
          addLabel="Add reminder"
          renderRow={(item, i, patch) => (
            <InputField type="number" value={item.value} onChange={(e) => patch({ value: e.target.value })} />
          )}
        />
      </div>
    );
  },
};

/** An empty list still offers its add button. */
export const Empty = {
  render: function Render() {
    const [items, setItems] = React.useState([]);
    return (
      <div className="w-96">
        <DynamicRowList
          items={items}
          onChange={setItems}
          createItem={() => ({ value: "" })}
          addLabel="Add your first reminder"
          renderRow={(item, i, patch) => (
            <InputField value={item.value} onChange={(e) => patch({ value: e.target.value })} />
          )}
        />
      </div>
    );
  },
};
