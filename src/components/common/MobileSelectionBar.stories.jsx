import * as React from "react";
import { Trash2, Pencil, UserX, Download } from "lucide-react";
import { MobileSelectionBar } from "./MobileSelectionBar";
import { FloatingAddButton } from "./FloatingAddButton";

/**
 * The floating "N selected" pill a mobile table screen shows while rows are
 * checked.
 *
 * It **hugs its content** rather than stretching edge to edge. Stretched with
 * `justify-between`, the count ends up pinned left and the actions pinned
 * right — roughly 280px apart on a phone, reading as two unrelated controls
 * instead of one bar.
 *
 * `max-w-[calc(100vw-6rem)]` keeps it clear of a `FloatingAddButton`; past
 * that width the actions scroll horizontally rather than wrapping the pill to
 * a second line, since a bar that changes height under the thumb also breaks
 * the clearance `MobileCardList` reserves below its last card.
 *
 * Mobile only (`md:hidden`) — view these at a narrow viewport.
 */
const meta = {
  title: "Components/MobileSelectionBar",
  component: MobileSelectionBar,
  tags: ["autodocs"],
  parameters: { viewport: { defaultViewport: "mobile1" } },
  argTypes: {
    count: { control: { type: "number", min: 0 }, description: "Renders nothing at or below zero." },
    onClear: { action: "cleared", description: "The trailing clear action. Omit to render no way out of selection mode." },
    clearLabel: { control: "text", description: 'Label beside the clear X. Defaults to "Deselect".' },
    actions: {
      control: "object",
      description: "`{ key?, label, icon?, onClick?, danger?, requiresSingle? }[]`, rendered before the clear action.",
    },
    className: { control: "text" },
  },
  args: { count: 1, clearLabel: "Deselect" },
  render: (args) => (
    <div className="md:hidden h-56 rounded-surface border border-dashed border-card-border p-3 text-body-sm text-ink-muted">
      The bar is fixed to the preview frame's bottom-left corner.
      <MobileSelectionBar {...args} />
    </div>
  ),
};

export default meta;

export const Playground = {};

/** The License and Report screens: just the count and a way out. */
export const ClearOnly = {
  args: { count: 3 },
};

/** The masters screens: one destructive action, then Deselect. */
export const WithDestructiveAction = {
  args: {
    count: 2,
    actions: [{ label: "Delete", icon: <Trash2 size={14} />, danger: true }],
  },
};

/** The Users screen — the widest set. The actions scroll if they outgrow the cap. */
export const SeveralActions = {
  args: {
    count: 1,
    actions: [
      { label: "Edit", icon: <Pencil size={14} /> },
      { label: "Deactivate", icon: <UserX size={14} />, danger: true },
      { label: "Download", icon: <Download size={14} /> },
    ],
  },
};

/** `requiresSingle` hides an action while more than one row is selected — Edit has no meaning for many. */
export const RequiresSingle = {
  render: function Render() {
    const [count, setCount] = React.useState(1);
    return (
      <div className="md:hidden h-56 rounded-surface border border-dashed border-card-border p-3">
        <button
          type="button"
          onClick={() => setCount((c) => (c === 1 ? 3 : 1))}
          className="rounded-control border border-card-border px-3 py-1 text-body-sm text-ink-primary"
        >
          Toggle selection: {count} selected
        </button>
        <p className="mt-2 text-body-sm text-ink-muted">
          Edit is hidden while more than one row is selected.
        </p>
        <MobileSelectionBar
          count={count}
          onClear={() => {}}
          actions={[
            { label: "Edit", icon: <Pencil size={14} />, requiresSingle: true },
            { label: "Delete", icon: <Trash2 size={14} />, danger: true },
          ]}
        />
      </div>
    );
  },
};

/** Alongside a `FloatingAddButton` — the bar's max width keeps the two from overlapping. */
export const ClearsFloatingAddButton = {
  args: {
    count: 1,
    actions: [
      { label: "Edit", icon: <Pencil size={14} /> },
      { label: "Deactivate", icon: <UserX size={14} />, danger: true },
    ],
  },
  render: (args) => (
    <div className="md:hidden h-56 rounded-surface border border-dashed border-card-border p-3 text-body-sm text-ink-muted">
      The bar stops before the + button rather than sliding under it.
      <MobileSelectionBar {...args} />
      <FloatingAddButton />
    </div>
  ),
};

/** At zero the component renders nothing, so no conditional is needed at the call site. */
export const ZeroRendersNothing = {
  args: { count: 0 },
};
