import { Card } from "./Card";

const meta = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
};

export default meta;

export const Playground = {
  render: (args) => (
    <Card {...args} className="max-w-sm">
      <h3 className="text-title font-semibold text-ink-primary mb-1">Renewal due soon</h3>
      <p className="text-body-sm text-ink-secondary">
        3 licenses expire within 30 days. Review them before they lapse.
      </p>
    </Card>
  ),
};

export const Unpadded = {
  args: { padded: false },
  render: (args) => (
    <Card {...args} className="max-w-sm">
      <div className="p-3 border-b border-card-border text-body-sm font-semibold">Header</div>
      <div className="p-3 text-body-sm text-ink-secondary">
        {"padded={false}"} when a child (like a table) needs to own its own edge spacing.
      </div>
    </Card>
  ),
};
