import { FloatingAddButton } from "./FloatingAddButton";

/**
 * The circular "add a record" button pinned to the bottom-right of a list
 * screen.
 *
 * It is `position: fixed`, so in Storybook it anchors to the preview frame
 * rather than the story block — scroll the canvas and it stays put, which is
 * the behaviour it has in the app.
 *
 * Its bottom offset carries `env(safe-area-inset-bottom)` so it clears a
 * phone's home indicator; without that the gesture bar swallows the tap and
 * the button reads as simply not working.
 */
const meta = {
  title: "Components/FloatingAddButton",
  component: FloatingAddButton,
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description:
        "Accessible name — used for both `aria-label` and the hover `title`. The button is icon-only, so this is the only name it has.",
    },
    onClick: { action: "clicked" },
    disabled: { control: "boolean" },
    className: { control: "text" },
  },
  args: {
    label: "Add",
  },
  parameters: {
    docs: {
      description: {
        story: "Fixed to the viewport's bottom-right corner — look to the corner of the preview frame.",
      },
    },
  },
};

export default meta;

export const Playground = {
  render: (args) => (
    <div className="relative h-48 rounded-surface border border-dashed border-card-border p-4 text-body-sm text-ink-muted">
      The button is fixed to the preview frame's bottom-right corner, not this box.
      <FloatingAddButton {...args} />
    </div>
  ),
};

/** The label is the button's whole accessible name, so make it name the record being added. */
export const CustomLabel = {
  args: { label: "Add Product Type" },
  render: (args) => (
    <div className="relative h-48 rounded-surface border border-dashed border-card-border p-4 text-body-sm text-ink-muted">
      Hover the button to see its title.
      <FloatingAddButton {...args} />
    </div>
  ),
};
