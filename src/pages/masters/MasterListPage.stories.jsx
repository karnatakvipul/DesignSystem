import * as React from "react";
import { MasterListPage } from "./MasterListPage";
import { FormModal } from "../../components/common/FormModal";
import { InputField } from "../../components/common/InputField";
import { FormGroup } from "../../components/common/FormGroup";

const COLUMNS = [
  { key: "name", header: "NAME", sortable: true },
  { key: "description", header: "DESCRIPTION" },
];

const ITEMS = [
  { id: 1, name: "Yearly", description: "12 month term" },
  { id: 2, name: "Half Year", description: "6 month term" },
  { id: 3, name: "Quarterly", description: "3 month term" },
];

/** A minimal add/edit dialog, matching the `FormModal` contract this page expects. */
function DemoFormModal({ open, onClose, item, onSave }) {
  const [name, setName] = React.useState(item?.name ?? "");
  const [description, setDescription] = React.useState(item?.description ?? "");
  React.useEffect(() => {
    setName(item?.name ?? "");
    setDescription(item?.description ?? "");
  }, [item, open]);

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={() => onSave({ name, description })}
      title={item ? "Edit record" : "Add record"}
      size="sm"
      submitDisabled={!name.trim()}
    >
      <div className="flex flex-col gap-4">
        <FormGroup label="Name" requiredText="(required)">
          <InputField value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Yearly" />
        </FormGroup>
        <FormGroup label="Description">
          <InputField value={description} onChange={(e) => setDescription(e.target.value)} />
        </FormGroup>
      </div>
    </FormModal>
  );
}

/**
 * The generic master-data screen — table, add/edit dialog, delete confirmation
 * and optional status toggle.
 *
 * `LicenseTypePage`, `LicenseTermPage` and `ProductTypePage` are all thin
 * wrappers around this: they supply the columns, the form dialog and the
 * endpoint, and inherit the rest. Reach for it directly for a master table
 * this library does not already ship.
 *
 * The one prop worth care is **`FormModal`** — you pass the *component*, and
 * it is rendered with `{ open, onClose, item, onSave }`. That is what lets each
 * master type have completely different fields while sharing this screen.
 */
const meta = {
  title: "Pages/Masters/MasterListPage",
  component: MasterListPage,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  argTypes: {
    title: { control: "text" },
    items: { control: "object", description: "Rows for the in-memory mode." },
    setItems: { control: false, description: "State setter for `items`." },
    columns: { control: "object" },
    FormModal: {
      control: false,
      description: "The add/edit dialog **component**, rendered with `{ open, onClose, item, onSave }`.",
    },
    addLabel: { control: "text" },
    showStatusToggle: { control: "boolean", description: "Adds the per-row active/inactive toggle." },
    fetcher: { control: false, description: "Server-side page fetcher." },
    serverSide: { control: "boolean" },
    endpointKey: { control: "text", description: "Looked up on `ServerDataProvider`." },
    onCreate: { action: "create" },
    onUpdate: { action: "update" },
    onDelete: { action: "delete" },
    onToast: { action: "toast" },
  },
  render: function Render(args) {
    const [items, setItems] = React.useState(args.items ?? ITEMS);
    React.useEffect(() => setItems(args.items ?? ITEMS), [args.items]);
    return (
      <div className="h-[42rem] bg-canvas p-2">
        <MasterListPage {...args} items={items} setItems={setItems} />
      </div>
    );
  },
};

export default meta;

export const Playground = {
  args: {
    title: "License Term",
    columns: COLUMNS,
    items: ITEMS,
    FormModal: DemoFormModal,
    addLabel: "Add License Term",
  },
};

/** With the per-row status toggle enabled. */
export const WithStatusToggle = {
  args: {
    title: "Product Type",
    columns: [{ key: "name", header: "NAME", sortable: true }],
    items: [
      { id: 1, name: "Web Application", status: true },
      { id: 2, name: "Device", status: false },
      { id: 3, name: "Desktop Application", status: true },
    ],
    FormModal: DemoFormModal,
    addLabel: "Add Product Type",
    showStatusToggle: true,
  },
};

export const EmptyState = {
  args: {
    title: "License Term",
    columns: COLUMNS,
    items: [],
    FormModal: DemoFormModal,
    addLabel: "Add License Term",
  },
};

export const Mobile = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: {
    title: "License Term",
    columns: COLUMNS,
    items: ITEMS,
    FormModal: DemoFormModal,
    addLabel: "Add License Term",
  },
};
