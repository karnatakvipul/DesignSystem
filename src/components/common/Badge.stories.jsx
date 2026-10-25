import { Badge } from "./Badge";

const meta = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    tone: {
      control: "select",
      options: ["neutral", "online", "warn", "offline", "live", "accent"],
    },
    shape: {
      control: "inline-radio",
      options: ["pill", "control"],
    },
  },
  args: {
    tone: "neutral",
    shape: "pill",
    children: "Active",
  },
};

export default meta;

export const Playground = {};

export const AllTones = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge tone="neutral">Neutral</Badge>
      <Badge tone="online">Active</Badge>
      <Badge tone="warn">Expiring soon</Badge>
      <Badge tone="offline">Deactivated</Badge>
      <Badge tone="live">Live</Badge>
      <Badge tone="accent">New</Badge>
    </div>
  ),
};

/**
 * `pill` suits a badge naming a *state* — Active, Expired. `control` is the
 * radius the scale gives buttons, inputs and tags, and suits one carrying a
 * *figure*, where a fully-rounded chip reads softer than the number deserves.
 */
export const Shapes = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-16 text-body-sm text-ink-muted">pill</span>
        <Badge tone="online">Active</Badge>
        <Badge tone="offline">Deactivated</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-16 text-body-sm text-ink-muted">control</span>
        <Badge tone="accent" shape="control" className="px-3 py-1 font-bold">
          PI - ₹2,121.00
        </Badge>
        <Badge tone="warn" shape="control" className="px-3 py-1 font-bold">
          Pending - ₹0.00
        </Badge>
      </div>
    </div>
  ),
};
