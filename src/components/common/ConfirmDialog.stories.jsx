import * as React from "react";
import { Button } from "./Button";
import { ConfirmDialog } from "./ConfirmDialog";

const meta = {
  title: "Components/ConfirmDialog",
  component: ConfirmDialog,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;

function Demo(args) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant={args.tone === "danger" ? "danger" : "primary"} onClick={() => setOpen(true)}>
        {args.title}
      </Button>
      <ConfirmDialog {...args} open={open} onClose={() => setOpen(false)} onConfirm={() => setOpen(false)} />
    </>
  );
}

export const Delete = {
  args: {
    title: "Delete license",
    message: "This can't be undone. The license and its history will be permanently removed.",
    confirmLabel: "Delete",
    tone: "danger",
  },
  render: (args) => <Demo {...args} />,
};

export const Default = {
  args: {
    title: "Activate license",
    message: "This will activate the selected license immediately.",
    confirmLabel: "Activate",
  },
  render: (args) => <Demo {...args} />,
};
