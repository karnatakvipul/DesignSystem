import { ProductTypePage } from "./ProductTypePage";

/**
 * The product types master screen.
 *
 * A thin wrapper over `MasterListPage` supplying the product-type columns and
 * `ProductTypeFormModal`. This is the one master screen that uses the per-row
 * status toggle, since a product type can be retired without being deleted.
 * `endpointKey` defaults to `"productTypes"`.
 */
const meta = {
  title: "Pages/Masters/ProductTypePage",
  component: ProductTypePage,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  argTypes: {
    fetcher: { control: false, description: "Server-side page fetcher." },
    serverSide: { control: "boolean" },
    endpointKey: { control: "text", description: 'Defaults to `"productTypes"`.' },
    initialData: { control: "object" },
    onCreate: { action: "create" },
    onUpdate: { action: "update" },
    onDelete: { action: "delete" },
    onToast: { action: "toast" },
  },
  render: (args) => (
    <div className="h-[42rem] bg-canvas p-2">
      <ProductTypePage {...args} />
    </div>
  ),
};

export default meta;

export const Playground = {};

/** Mixed active and retired product types, showing the status toggle. */
export const WithSuppliedData = {
  args: {
    initialData: [
      { id: 1, name: "Web Application", status: true },
      { id: 2, name: "Device", status: true },
      { id: 3, name: "Desktop Application", status: false },
      { id: 4, name: "One-time DL FTP Configuration", status: true },
    ],
  },
};

export const EmptyState = { args: { initialData: [] } };

export const Mobile = { parameters: { viewport: { defaultViewport: "mobile1" } } };
