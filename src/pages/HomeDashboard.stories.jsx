import { HomeDashboard } from "./HomeDashboard";

/**
 * The landing dashboard.
 *
 * Three ways to feed it, in precedence order:
 *
 * 1. **`data`** — a static array. Always wins; the simplest "just render this"
 *    path.
 * 2. **`fetcher`** — a function, switching it to server-side.
 * 3. **`endpointKey`** — resolved through a surrounding `ServerDataProvider`,
 *    so a host app can wire every screen once rather than per page.
 *
 * With none of them it falls back to its own demo data, which is what these
 * stories use.
 */
const meta = {
  title: "Pages/HomeDashboard",
  component: HomeDashboard,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  argTypes: {
    data: { control: "object", description: "Static rows. Takes precedence over `fetcher` and `endpointKey`." },
    fetcher: { control: false, description: "Server-side fetcher." },
    serverSide: { control: "boolean", description: "Overrides the inference." },
    endpointKey: {
      control: "text",
      description: 'Looked up on `ServerDataProvider`. Defaults to `"materials"`.',
    },
    onRetry: { action: "retry" },
  },
  render: (args) => (
    <div className="h-[42rem] overflow-auto bg-canvas p-2">
      <HomeDashboard {...args} />
    </div>
  ),
};

export default meta;

export const Playground = {};

/** A static array wins over every other source. */
export const WithStaticData = {
  args: {
    data: [
      { id: 1, account: "Prima Equipment", licences: 42, expiring: 6 },
      { id: 2, account: "Aaxis Nano", licences: 31, expiring: 2 },
      { id: 3, account: "Abc Industries Pvt Ltd", licences: 27, expiring: 9 },
    ],
  },
};

export const EmptyState = { args: { data: [] } };

export const Mobile = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
