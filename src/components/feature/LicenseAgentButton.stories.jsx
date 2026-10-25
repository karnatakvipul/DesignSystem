import * as React from "react";
import { LicenseAgentButton } from "./LicenseAgentButton";
import { FloatingAddButton } from "../common/FloatingAddButton";

/**
 * The floating AI licence-agent button.
 *
 * It sits **above** `FloatingAddButton` in the same corner (`bottom-20` against
 * that button's `bottom-4`), so the two stack rather than overlap on a screen
 * that has both.
 *
 * Without an `onOpen` it falls back to opening a placeholder window, so the
 * control is never dead in a demo. Pass `onOpen` in a real app — the fallback
 * is a stand-in, not behaviour to ship.
 */
const meta = {
  title: "Feature/LicenseAgentButton",
  component: LicenseAgentButton,
  tags: ["autodocs"],
  argTypes: {
    onOpen: {
      action: "opened",
      description: "Your handler. Without it, a placeholder window is opened instead.",
    },
    className: { control: "text" },
  },
  render: (args) => (
    <div className="relative h-64 rounded-surface border border-dashed border-card-border p-4 text-body-sm text-ink-muted">
      The button is fixed to the preview frame's bottom-right corner.
      <LicenseAgentButton {...args} />
    </div>
  ),
};

export default meta;

export const Playground = {
  args: { onOpen: () => {} },
};

/** With both buttons present they stack rather than overlapping. */
export const StackedWithAddButton = {
  render: () => (
    <div className="relative h-64 rounded-surface border border-dashed border-card-border p-4 text-body-sm text-ink-muted">
      The agent button sits above the + button, in the same corner.
      <LicenseAgentButton onOpen={() => {}} />
      <FloatingAddButton />
    </div>
  ),
};

/** Wired to a handler, reporting the click rather than opening a window. */
export const Interactive = {
  render: function Render() {
    const [count, setCount] = React.useState(0);
    return (
      <div className="relative h-64 rounded-surface border border-dashed border-card-border p-4">
        <p className="text-body-sm text-ink-muted">Opened {count} time(s).</p>
        <LicenseAgentButton onOpen={() => setCount((c) => c + 1)} />
      </div>
    );
  },
};
