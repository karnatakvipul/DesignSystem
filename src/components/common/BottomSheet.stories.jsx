import * as React from "react";
import { BottomSheet, useBottomSheet } from "./BottomSheet";
import { Button } from "./Button";
import { InputField } from "./InputField";
import { FormGroup } from "./FormGroup";

/**
 * The panel that slides up from the bottom of a phone screen — the mobile
 * stand-in for a popover or dropdown, used for filters, sort and row actions.
 *
 * It is **mobile only** (`md:hidden`) and renders in a portal, so no
 * `overflow-hidden` ancestor can clip it. While open it locks body scroll, and
 * Escape closes only the top-most sheet when several are stacked.
 *
 * Its body caps at `85dvh` and scrolls, and carries
 * `env(safe-area-inset-bottom)` so the last control clears a home indicator
 * rather than sitting under the gesture bar.
 *
 * View these stories at a narrow viewport — above `md` the sheet does not
 * render at all.
 */
const meta = {
  title: "Components/BottomSheet",
  component: BottomSheet,
  tags: ["autodocs"],
  parameters: { viewport: { defaultViewport: "mobile1" } },
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "closed", description: "Called on backdrop click, Escape, or the header's X." },
    title: { control: "text", description: "Header text. With no title the header and its X are omitted." },
    children: { control: false },
    className: { control: "text" },
  },
  args: { title: "Filter Records" },
};

export default meta;

function Demo({ children, ...args }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="md:hidden">
      <Button onClick={() => setOpen(true)}>Open sheet</Button>
      <BottomSheet {...args} open={open} onClose={() => setOpen(false)}>
        {children}
      </BottomSheet>
      <p className="mt-3 text-body-sm text-ink-muted">
        Mobile only — widen the viewport past <code>md</code> and it will not render.
      </p>
    </div>
  );
}

export const Playground = {
  render: (args) => (
    <Demo {...args}>
      <div className="flex flex-col gap-3 pb-2">
        <FormGroup label="Account">
          <InputField placeholder="Aaxis Nano" />
        </FormGroup>
        <FormGroup label="Site">
          <InputField placeholder="Noida Plant 1" />
        </FormGroup>
      </div>
    </Demo>
  ),
};

/** Content taller than `85dvh` scrolls inside the sheet rather than growing it off-screen. */
export const LongScrollingContent = {
  render: (args) => (
    <Demo {...args} title="Filter Records">
      <div className="flex flex-col gap-3 pb-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <FormGroup key={i} label={`Field ${i + 1}`}>
            <InputField placeholder="All" />
          </FormGroup>
        ))}
      </div>
    </Demo>
  ),
};

/** Without a `title` the header — and its close button — are omitted entirely. */
export const NoHeader = {
  render: (args) => (
    <Demo {...args} title={undefined}>
      <p className="pb-4 text-body-sm text-ink-primary">
        A sheet with no header. Close it by tapping the backdrop or pressing Escape.
      </p>
    </Demo>
  ),
};

/**
 * `useBottomSheet()` lets content inside the sheet dismiss it. A confirm
 * button that leaves the sheet covering the result it just produced is a
 * button that looks like it did nothing.
 */
export const SelfDismissingContent = {
  render: function Render(args) {
    function Actions() {
      const sheet = useBottomSheet();
      return (
        <div className="flex gap-2 pb-2">
          <Button variant="cancel" fullWidth onClick={() => sheet?.close?.()}>
            Cancel
          </Button>
          <Button variant="primary" fullWidth onClick={() => sheet?.close?.()}>
            Apply
          </Button>
        </div>
      );
    }
    return (
      <Demo {...args} title="Sort Records">
        <div className="flex flex-col gap-3">
          <p className="text-body-sm text-ink-primary">
            Both buttons call <code>useBottomSheet().close()</code>.
          </p>
          <Actions />
        </div>
      </Demo>
    );
  },
};
