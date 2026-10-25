import { LicenseTypePage } from "./LicenseTypePage";

/**
 * The licence types master screen.
 *
 * A thin wrapper over `MasterListPage`: it supplies the licence-type columns
 * and `LicenseTypeFormModal`, and inherits the table, dialogs and paging.
 *
 * With no `fetcher` it runs in memory from `initialData` (or the demo set);
 * with one it pages from the server. `endpointKey` defaults to
 * `"licenseTypes"` for lookup through a surrounding `ServerDataProvider`.
 */
const meta = {
  title: "Pages/Masters/LicenseTypePage",
  component: LicenseTypePage,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  argTypes: {
    fetcher: { control: false, description: "Server-side page fetcher." },
    serverSide: { control: "boolean" },
    endpointKey: { control: "text", description: 'Defaults to `"licenseTypes"`.' },
    initialData: { control: "object" },
    onCreate: { action: "create" },
    onUpdate: { action: "update" },
    onDelete: { action: "delete" },
    onToast: { action: "toast" },
  },
  render: (args) => (
    <div className="h-[42rem] bg-canvas p-2">
      <LicenseTypePage {...args} />
    </div>
  ),
};

export default meta;

export const Playground = {};

export const WithSuppliedData = {
  args: {
    initialData: [
      { id: 1, name: "EF-1Y-5M-1Y-PR-XX", description: "EnviroFRONT yearly", product: "EnviroFRONT", productType: "Web Application" },
      { id: 2, name: "OC-1Y-5M-1Y-PR-GSPCB", description: "OCEMS yearly", product: "OCEMS", productType: "Web Application" },
    ],
  },
};

export const EmptyState = { args: { initialData: [] } };

export const Mobile = { parameters: { viewport: { defaultViewport: "mobile1" } } };
