import { Plus } from "lucide-react";
import { Button } from "./Button";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "ghost", "danger", "add", "cancel"],
    },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
  args: {
    children: "Save changes",
    variant: "primary",
    size: "md",
  },
};

export default meta;

export const Playground = {};

export const AllVariants = {
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      {["primary", "secondary", "outline", "ghost", "danger", "add", "cancel"].map((variant) => (
        <Button key={variant} {...args} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
};

export const Sizes = {
  render: (args) => (
    <div className="flex items-center gap-3">
      {["sm", "md", "lg"].map((size) => (
        <Button key={size} {...args} size={size}>
          {size}
        </Button>
      ))}
    </div>
  ),
};

export const WithIcon = {
  args: {
    icon: <Plus size={16} />,
    children: "Add license",
  },
};

export const Loading = {
  args: {
    loading: true,
    children: "Saving…",
  },
};

export const Disabled = {
  args: {
    disabled: true,
  },
};

export const FullWidth = {
  args: {
    fullWidth: true,
  },
  parameters: { layout: "padded" },
};
