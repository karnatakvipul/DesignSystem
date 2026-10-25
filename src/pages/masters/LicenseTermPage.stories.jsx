import { LicenseTermPage } from "./LicenseTermPage";

/**
 * The licence terms master screen.
 *
 * A thin wrapper over `MasterListPage` supplying the term columns and
 * `LicenseTermFormModal`. `endpointKey` defaults to `"licenseTerms"`.
 */
const meta = {
  title: "Pages/Masters/LicenseTermPage",
  component: LicenseTermPage,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  argTypes: {
    fetcher: { control: false, description: "Server-side page fetcher." },
    serverSide: { control: "boolean" },
    endpointKey: { control: "text", description: 'Defaults to `"licenseTerms"`.' },
    initialData: { control: "object" },
    onCreate: { action: "create" },
    onUpdate: { action: "update" },
    onDelete: { action: "delete" },
    onToast: { action: "toast" },
  },
  render: (args) => (
    <div className="h-[42rem] bg-canvas p-2">
      <LicenseTermPage {...args} />
    </div>
  ),
};

export default meta;

export const Playground = {};

export const WithSuppliedData = {
  args: {
    initialData: [
      { id: 1, name: "Yearly" },
      { id: 2, name: "Half Year" },
      { id: 3, name: "Quarterly" },
      { id: 4, name: "Custom" },
    ],
  },
};

export const EmptyState = { args: { initialData: [] } };

export const Mobile = { parameters: { viewport: { defaultViewport: "mobile1" } } };
