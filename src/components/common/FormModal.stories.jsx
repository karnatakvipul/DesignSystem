import * as React from "react";
import { FormModal } from "./FormModal";
import { Button } from "./Button";
import { InputField } from "./InputField";
import { Dropdown } from "./Dropdown";
import { FormGroup } from "./FormGroup";

/**
 * `Modal` with the footer already built: a cancel button and a submit button,
 * wired to `onClose` and `onSubmit`.
 *
 * Every "add / edit a record" dialog in this library is one of these, which is
 * why they all have their buttons in the same order with the same labels. Use
 * `Modal` directly only when the footer genuinely differs.
 *
 * `submitting` puts the submit button in its loading state *and* disables
 * cancel, so a save in flight cannot be abandoned half-way.
 */
const meta = {
  title: "Components/Modals/FormModal",
  component: FormModal,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "closed", description: "Backdrop click, Escape, the X, or the cancel button." },
    onSubmit: { action: "submitted", description: "The submit button." },
    title: { control: "text" },
    size: { control: "select", options: ["sm", "md", "lg", "xl"] },
    submitLabel: { control: "text", description: 'Defaults to "Ok".' },
    cancelLabel: { control: "text", description: 'Defaults to "Close".' },
    submitting: { control: "boolean", description: "Spins the submit button and disables cancel." },
    submitDisabled: { control: "boolean", description: "Blocks submit without spinning it — e.g. failed validation." },
    children: { control: false },
  },
  args: {
    open: true,
    title: "Add License Type",
    size: "md",
    submitLabel: "Ok",
    cancelLabel: "Close",
  },
  render: (args) => (
    <FormModal {...args}>
      <div className="flex flex-col gap-4">
        <FormGroup label="Name" requiredText="(required)">
          <InputField placeholder="EF-1Y-5M-1Y-PR-XX" />
        </FormGroup>
        <FormGroup label="Product" requiredText="(required)">
          <Dropdown
            value="EnviroFRONT"
            onChange={() => {}}
            options={[
              { value: "EnviroFRONT", label: "EnviroFRONT" },
              { value: "OCEMS", label: "OCEMS" },
              { value: "SolarFRONT", label: "SolarFRONT" },
            ]}
          />
        </FormGroup>
        <FormGroup label="Description">
          <InputField placeholder="What this licence type covers" />
        </FormGroup>
      </div>
    </FormModal>
  ),
};

export default meta;

export const Playground = {};

/** Mid-save: the submit button spins and cancel is disabled, so the save cannot be abandoned half-way. */
export const Submitting = {
  args: { submitting: true },
};

/** Blocked by validation — submit is dead but the dialog is still dismissible. */
export const SubmitDisabled = {
  args: { submitDisabled: true },
};

/** Labels are worth setting: "Ok" says nothing about what is about to happen. */
export const CustomLabels = {
  args: { title: "Delete License", submitLabel: "Delete licence", cancelLabel: "Keep it" },
};

export const Sizes = {
  render: function Render() {
    const [size, setSize] = React.useState(null);
    return (
      <div className="flex flex-wrap gap-2">
        {["sm", "md", "lg", "xl"].map((s) => (
          <Button key={s} variant="secondary" size="sm" onClick={() => setSize(s)}>
            Open {s}
          </Button>
        ))}
        <FormModal
          open={!!size}
          size={size ?? "md"}
          title={`Size: ${size ?? ""}`}
          onClose={() => setSize(null)}
          onSubmit={() => setSize(null)}
        >
          <FormGroup label="Name">
            <InputField placeholder="Type something" />
          </FormGroup>
        </FormModal>
      </div>
    );
  },
};

/** Opened from a button, with a simulated save. */
export const Interactive = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    const [busy, setBusy] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Add License Type</Button>
        <FormModal
          open={open}
          title="Add License Type"
          submitting={busy}
          onClose={() => setOpen(false)}
          onSubmit={() => {
            setBusy(true);
            setTimeout(() => {
              setBusy(false);
              setOpen(false);
            }, 1200);
          }}
        >
          <FormGroup label="Name" requiredText="(required)">
            <InputField placeholder="EF-1Y-5M-1Y-PR-XX" />
          </FormGroup>
        </FormModal>
      </>
    );
  },
};
