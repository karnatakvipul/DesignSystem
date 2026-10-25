import { Pencil, Trash2 } from "lucide-react";
import { IconButton } from "./IconButton";

const meta = {
  title: "Components/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["idle", "active", "danger"] },
    size: { control: "select", options: ["xs", "sm", "md"] },
  },
  args: {
    icon: <Pencil size={16} />,
    label: "Edit",
    variant: "idle",
    size: "md",
  },
};

export default meta;

export const Playground = {};

export const AllVariants = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <IconButton {...args} variant="idle" />
      <IconButton {...args} variant="active" />
      <IconButton {...args} icon={<Trash2 size={16} />} label="Delete" variant="danger" />
    </div>
  ),
};

export const Disabled = {
  args: { disabled: true },
};
