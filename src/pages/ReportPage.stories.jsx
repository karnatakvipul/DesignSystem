import { ReportPage } from "./ReportPage";

/**
 * The invoice/report screen — summary tiles, filters and the report table.
 *
 * Works from its own demo data with no props at all. Supply a `fetcher` (or an
 * `endpointKey` resolved through `ServerDataProvider`) to drive it from a
 * server instead.
 */
const meta = {
  title: "Pages/ReportPage",
  component: ReportPage,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  argTypes: {
    fetcher: { control: false, description: "Server-side page fetcher." },
    serverSide: { control: "boolean" },
    endpointKey: {
      control: "text",
      description: 'Looked up on `ServerDataProvider` when no `fetcher` is passed. Defaults to `"reports"`.',
    },
    initialData: { control: "object", description: "Rows for the in-memory mode." },
    onToast: { action: "toast" },
  },
  render: (args) => (
    <div className="h-[42rem] bg-canvas p-2">
      <ReportPage {...args} />
    </div>
  ),
};

export default meta;

export const Playground = {};

export const EmptyState = { args: { initialData: [] } };

export const Mobile = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
