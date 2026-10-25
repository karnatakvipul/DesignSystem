import * as React from "react";
import { ChangesPreviewModal } from "./ChangesPreviewModal";
import { Button } from "../common/Button";

const FIELDS = [
  { label: "Account", previous: "Abc Industries Pvt Ltd", current: "Prima Equipment" },
  { label: "Site", previous: "Noida Plant 2", current: "Noida Plant 3" },
  { label: "Data rate", previous: "5M", current: "10M" },
  { label: "Status", previous: "Deactivated", current: "Active" },
];

/**
 * A before-and-after table, shown for confirmation before a change is
 * committed.
 *
 * Three columns — field, previous, current — with previous tinted in the
 * offline colour and current in the online one, so the direction of each
 * change is readable without comparing strings character by character.
 *
 * It lists exactly what it is given. Filter out unchanged fields at the call
 * site: a preview padded with rows where both sides match buries the ones that
 * actually differ.
 */
const meta = {
  title: "Feature/ChangesPreviewModal",
  component: ChangesPreviewModal,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "closed" },
    title: { control: "text", description: 'Defaults to "Changes".' },
    fields: { control: "object", description: "`{ label, previous, current }[]`." },
  },
  args: { open: true, fields: FIELDS, title: "Changes" },
};

export default meta;

export const Playground = {};

export const SingleChange = { args: { fields: [FIELDS[0]] } };

export const CustomTitle = {
  args: { title: "Review licence property changes" },
};

/** Nothing changed — the headers stand alone, which is why callers should skip opening it. */
export const NoChanges = { args: { fields: [] } };

/** Empty values on either side are shown as-is rather than hidden. */
export const EmptyValues = {
  args: {
    fields: [
      { label: "Device", previous: "—", current: "680376fa-1a" },
      { label: "Parent licence", previous: "a298070a", current: "—" },
    ],
  },
};

export const Interactive = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Preview changes</Button>
        <ChangesPreviewModal open={open} fields={FIELDS} onClose={() => setOpen(false)} />
      </>
    );
  },
};
