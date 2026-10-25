import { ServerSidePage } from "./ServerSidePage";

/**
 * A live demonstration of the library's server-side data layer, against a
 * simulated REST backend.
 *
 * This is a **documentation page rather than an app screen**: it exposes
 * latency and error toggles so you can watch how `ServerDataTable`,
 * `AsyncDropdown` and `AsyncMultiSelectDropdown` behave under a slow or
 * failing server — the states that are hard to reproduce deliberately against
 * a real one.
 *
 * Turn the latency up and page the table; flip the error switch and watch each
 * component's retry path.
 */
const meta = {
  title: "Pages/ServerSidePage",
  component: ServerSidePage,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  argTypes: {
    onToast: { action: "toast" },
  },
  render: (args) => (
    <div className="h-[42rem] overflow-auto bg-canvas p-2">
      <ServerSidePage {...args} />
    </div>
  ),
};

export default meta;

/** Use the latency slider and error toggle to exercise the async states. */
export const Playground = {};

export const Mobile = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
