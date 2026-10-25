import * as React from "react";
import { Pencil, Trash2, Copy, Eye, Download } from "lucide-react";
import { ContextMenu } from "./ContextMenu";

/**
 * The themed right-click menu, used by `DataTable` for its per-row actions.
 *
 * It renders in a portal, so an `overflow-hidden` ancestor can never clip it,
 * and it flips back inside the viewport when opened near a right or bottom
 * edge. It closes on outside click, scroll, Escape, or after an item runs.
 *
 * `payload` is handed to every item's `onClick`, which is how a table passes
 * the row that was right-clicked without rebuilding the item array per row.
 */
const meta = {
  title: "Components/ContextMenu",
  component: ContextMenu,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    x: { control: "number", description: "Viewport X to anchor at — usually `e.clientX`." },
    y: { control: "number", description: "Viewport Y to anchor at — usually `e.clientY`." },
    items: {
      control: "object",
      description: "`{ label, icon?, danger?, disabled?, onClick? }[]`.",
    },
    payload: { control: false, description: "Forwarded to each item's `onClick(payload)`." },
    onClose: { action: "closed" },
    minWidth: { control: "number", description: "Menu min width in px. Defaults to 160." },
    className: { control: "text" },
  },
  args: { minWidth: 160 },
};

export default meta;

const ITEMS = [
  { label: "View details", icon: <Eye size={15} /> },
  { label: "Edit", icon: <Pencil size={15} /> },
  { label: "Copy key", icon: <Copy size={15} /> },
  { label: "Download", icon: <Download size={15} />, disabled: true },
  { label: "Delete", icon: <Trash2 size={15} />, danger: true },
];

/** Right-click anywhere in the panel to open the menu where you clicked. */
export const Playground = {
  render: function Render(args) {
    const [menu, setMenu] = React.useState(null);
    const [last, setLast] = React.useState(null);

    return (
      <>
        <div
          onContextMenu={(e) => {
            e.preventDefault();
            setMenu({ x: e.clientX, y: e.clientY });
          }}
          className="flex h-56 w-full items-center justify-center rounded-surface border border-dashed border-card-border text-body-sm text-ink-muted"
        >
          Right-click anywhere in this panel
        </div>
        <p className="mt-3 text-body-sm text-ink-muted">
          Last action: <span className="font-mono">{last ?? "(none)"}</span>
        </p>
        <ContextMenu
          {...args}
          open={!!menu}
          x={menu?.x ?? 0}
          y={menu?.y ?? 0}
          items={ITEMS.map((i) => ({ ...i, onClick: () => setLast(i.label) }))}
          onClose={() => setMenu(null)}
        />
      </>
    );
  },
};

/** `danger` tints an item red; `disabled` greys it and stops it firing or closing the menu. */
export const ItemStates = {
  render: () => (
    <div className="relative h-64">
      <ContextMenu
        open
        x={40}
        y={40}
        items={ITEMS}
        onClose={() => {}}
      />
    </div>
  ),
};

/** `payload` is how a table hands the right-clicked row to a shared item array. */
export const WithPayload = {
  render: function Render() {
    const [menu, setMenu] = React.useState(null);
    const [log, setLog] = React.useState(null);
    const rows = ["Aaxis Nano", "Prima Equipment", "Deewan Enterprises"];

    return (
      <>
        <ul className="w-64 divide-y divide-card-border rounded-surface border border-card-border">
          {rows.map((row) => (
            <li
              key={row}
              onContextMenu={(e) => {
                e.preventDefault();
                setMenu({ x: e.clientX, y: e.clientY, row });
              }}
              className="cursor-context-menu px-3 py-2 text-body-sm text-ink-primary hover:bg-accent-muted/40"
            >
              {row}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-body-sm text-ink-muted">
          Result: <span className="font-mono">{log ?? "(right-click a row)"}</span>
        </p>
        <ContextMenu
          open={!!menu}
          x={menu?.x ?? 0}
          y={menu?.y ?? 0}
          payload={menu?.row}
          items={[
            { label: "Edit", icon: <Pencil size={15} />, onClick: (row) => setLog(`Edit → ${row}`) },
            { label: "Delete", icon: <Trash2 size={15} />, danger: true, onClick: (row) => setLog(`Delete → ${row}`) },
          ]}
          onClose={() => setMenu(null)}
        />
      </>
    );
  },
};
