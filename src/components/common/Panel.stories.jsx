import { Button } from "./Button";
import { Panel } from "./Panel";

const meta = {
  title: "Components/Panel",
  component: Panel,
  tags: ["autodocs"],
  args: {
    title: "Recent activity",
  },
};

export default meta;

export const Playground = {
  render: (args) => (
    <div style={{ height: 220 }}>
      <Panel {...args}>
        <p className="text-body-sm text-ink-secondary p-2">Panel content goes here.</p>
      </Panel>
    </div>
  ),
};

export const WithActions = {
  args: {
    actions: (
      <Button size="sm" variant="ghost">
        View all
      </Button>
    ),
  },
  render: (args) => (
    <div style={{ height: 220 }}>
      <Panel {...args}>
        <p className="text-body-sm text-ink-secondary p-2">
          `actions` sits at the far end of the header — a "View all" link is the
          usual occupant.
        </p>
      </Panel>
    </div>
  ),
};

export const NoTitle = {
  args: { title: undefined },
  render: (args) => (
    <div style={{ height: 160 }}>
      <Panel {...args}>
        <p className="text-body-sm text-ink-secondary p-2">
          Without a title the header bar doesn't render at all.
        </p>
      </Panel>
    </div>
  ),
};
