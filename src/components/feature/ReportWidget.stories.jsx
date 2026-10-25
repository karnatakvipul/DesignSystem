import { ReportWidget } from "./ReportWidget";
import { BarChart } from "../common/BarChart";
import { DonutChart } from "../common/DonutChart";

/**
 * A titled panel for a dashboard widget, with its own loading, error and
 * toolbar states.
 *
 * The three toolbar buttons are **opt-in**: Filter, Reload and Export each
 * render only when given a handler. A widget with nothing to export should not
 * show a dead export button, so pass only what the widget can actually do.
 *
 * Loading and error take over the body entirely — a spinner beside stale
 * numbers is worse than no numbers, because it is not clear which of the two
 * you are reading.
 */
const meta = {
  title: "Feature/ReportWidget",
  component: ReportWidget,
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text" },
    loading: { control: "boolean" },
    error: { control: "text" },
    onRetry: { action: "retry", description: "Adds the retry button to the error state." },
    onReload: { action: "reload", description: "Omit to hide the reload button." },
    onExport: { action: "export", description: "Omit to hide the export button." },
    onFilter: { action: "filter", description: "Omit to hide the filter button." },
    children: { control: false },
    className: { control: "text" },
  },
  args: { title: "Licences issued" },
  render: (args) => (
    <div className="w-[36rem]">
      <ReportWidget {...args}>
        <BarChart
          height={200}
          series={["Issued"]}
          data={[
            { label: "Apr", values: [12] },
            { label: "May", values: [19] },
            { label: "Jun", values: [7] },
            { label: "Jul", values: [23] },
          ]}
        />
      </ReportWidget>
    </div>
  ),
};

export default meta;

/** All three toolbar buttons, because all three handlers are given. */
export const Playground = {
  args: { onFilter: () => {}, onReload: () => {}, onExport: () => {} },
};

/** No handlers, so no toolbar buttons — nothing dead on screen. */
export const NoToolbarActions = {};

/** Only what this widget can actually do. */
export const ReloadOnly = { args: { onReload: () => {} } };

export const Loading = { args: { loading: true, onReload: () => {} } };

/** With `onRetry` the error state offers a way back. */
export const ErrorState = {
  args: { error: "Could not load this widget.", onRetry: () => {}, onReload: () => {} },
};

/** An error with no retry — for a failure the user cannot resolve themselves. */
export const ErrorWithoutRetry = {
  args: { error: "You do not have access to this report." },
};

/** Composes with any content, not just bar charts. */
export const WithDonutChart = {
  args: { title: "Licences by state", onExport: () => {} },
  render: (args) => (
    <div className="w-[36rem]">
      <ReportWidget {...args}>
        <DonutChart
          height={200}
          centerLabel="Licences"
          centerValue="88"
          data={[
            { label: "Active", value: 42 },
            { label: "Expiring", value: 13 },
            { label: "Expired", value: 27 },
            { label: "Deactivated", value: 6 },
          ]}
        />
      </ReportWidget>
    </div>
  ),
};
