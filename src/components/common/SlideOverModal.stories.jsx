import * as React from "react";
import { SlideOverModal } from "./SlideOverModal";
import { Button } from "./Button";
import { InputField } from "./InputField";
import { FormGroup } from "./FormGroup";
import { Badge } from "./Badge";

/**
 * A panel that slides in from the right edge, full height.
 *
 * Suits detail and edit work that wants more vertical room than a centred
 * dialog, and keeps the list behind it visible — useful when the user is
 * working down a table row by row.
 *
 * Renders in a portal, locks body scroll while open, and Escape closes only
 * the top-most panel when several are stacked. Its body scrolls, so a long
 * form is fine.
 */
const meta = {
  title: "Components/Modals/SlideOverModal",
  component: SlideOverModal,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "closed", description: "Backdrop click, Escape, or the header's X." },
    title: { control: "text" },
    width: { control: "text", description: 'Any CSS width. Defaults to `"480px"`.' },
    children: { control: false },
    className: { control: "text" },
  },
  args: { open: true, title: "License details", width: "480px" },
  render: (args) => (
    <SlideOverModal {...args}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Badge tone="offline">Expired</Badge>
          <span className="font-mono text-body-sm text-ink-muted">EF-1M-5M-3Y-PO-CPCB</span>
        </div>
        <FormGroup label="Account">
          <InputField defaultValue="Aaxis Nano" />
        </FormGroup>
        <FormGroup label="Site">
          <InputField defaultValue="Gmr Airport Hyderabad" />
        </FormGroup>
        <FormGroup label="Expiry">
          <InputField defaultValue="17-Aug-2026" />
        </FormGroup>
      </div>
    </SlideOverModal>
  ),
};

export default meta;

export const Playground = {};

/** `width` takes any CSS width — widen it for a panel holding a table. */
export const Widths = {
  render: function Render() {
    const [width, setWidth] = React.useState(null);
    return (
      <div className="flex flex-wrap gap-2">
        {["360px", "480px", "640px", "50vw"].map((w) => (
          <Button key={w} variant="secondary" size="sm" onClick={() => setWidth(w)}>
            Open {w}
          </Button>
        ))}
        <SlideOverModal open={!!width} width={width ?? "480px"} title={`width: ${width ?? ""}`} onClose={() => setWidth(null)}>
          <p className="text-body-sm text-ink-primary">This panel is {width} wide.</p>
        </SlideOverModal>
      </div>
    );
  },
};

/** A long body scrolls inside the panel rather than pushing the header off. */
export const LongContent = {
  render: (args) => (
    <SlideOverModal {...args} title="Audit history">
      <div className="flex flex-col gap-3">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="rounded-surface border border-card-border p-3">
            <p className="text-body-sm font-semibold text-ink-primary">Event {i + 1}</p>
            <p className="text-body-sm text-ink-muted">Status changed from Deactivate to Activate.</p>
          </div>
        ))}
      </div>
    </SlideOverModal>
  ),
};

/** Opened from a button, as it behaves in the app. */
export const Interactive = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open details</Button>
        <SlideOverModal open={open} onClose={() => setOpen(false)} title="License details">
          <FormGroup label="Account">
            <InputField defaultValue="Aaxis Nano" />
          </FormGroup>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="cancel" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Save
            </Button>
          </div>
        </SlideOverModal>
      </>
    );
  },
};
