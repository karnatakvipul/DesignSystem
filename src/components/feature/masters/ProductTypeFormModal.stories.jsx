import * as React from "react";
import { ProductTypeFormModal } from "./ProductTypeFormModal";
import { Button } from "../../common/Button";

/**
 * Add or edit a product type — the category a licence type belongs to
 * (Web Application, Device, Desktop Application).
 *
 * The sibling of `LicenseTermFormModal`: one field, and Ok disabled while the
 * name is blank or whitespace, since the name is the record's only identity.
 */
const meta = {
  title: "Feature/Masters/ProductTypeFormModal",
  component: ProductTypeFormModal,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "closed" },
    item: { control: "object", description: "The record to edit. Omit for a blank Add form." },
    onSave: { action: "saved", description: "Receives `{ name }`." },
  },
  args: { open: true },
};

export default meta;

/** Blank Add — Ok is disabled until a name is typed. */
export const AddProductType = {};

export const EditProductType = { args: { item: { id: 1, name: "Web Application" } } };

export const Interactive = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    const [saved, setSaved] = React.useState(null);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Add product type</Button>
        <p className="mt-3 font-mono text-body-sm text-ink-muted">
          {saved ? JSON.stringify(saved) : "(nothing saved yet)"}
        </p>
        <ProductTypeFormModal
          open={open}
          onClose={() => setOpen(false)}
          onSave={(values) => {
            setSaved(values);
            setOpen(false);
          }}
        />
      </>
    );
  },
};
