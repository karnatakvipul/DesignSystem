import * as React from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";

const meta = {
  title: "Components/Modal",
  component: Modal,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg", "xl"] },
  },
  parameters: { layout: "padded" },
};

export default meta;

function Demo(args) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="cancel" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Save
            </Button>
          </>
        }
      >
        <p className="text-body text-ink-secondary">
          Focus moves inside on open and returns to the trigger on close — try
          Tab and Escape.
        </p>
      </Modal>
    </>
  );
}

export const Playground = {
  args: { title: "Edit license", size: "md" },
  render: (args) => <Demo {...args} />,
};

export const Sizes = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {["sm", "md", "lg", "xl"].map((size) => (
        <Demo key={size} title={`${size} modal`} size={size} />
      ))}
    </div>
  ),
};
