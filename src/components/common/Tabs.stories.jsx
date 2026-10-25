import * as React from "react";
import { Tabs } from "./Tabs";

const ITEMS = [
  { value: "userTypeMap", label: "User Type Map" },
  { value: "reminderTypeMap", label: "Reminder Type Map" },
  { value: "emailNotificationType", label: "Email Notification Type" },
  { value: "licenseCategoryMap", label: "License Category Map" },
  { value: "modelTypeMap", label: "Model Type Map" },
  { value: "dataLoggerIssueMap", label: "Data Logger Issue Map" },
];

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  args: {
    items: ITEMS,
  },
  parameters: { layout: "padded" },
};

export default meta;

/** Narrow the canvas to see the scroll arrows and edge fade this component adds once tabs overflow. */
export const Playground = {
  render: (args) => {
    const [value, setValue] = React.useState(ITEMS[0].value);
    return (
      <div style={{ maxWidth: 420 }}>
        <Tabs {...args} value={value} onChange={setValue} />
      </div>
    );
  },
};

export const FewTabs = {
  args: {
    items: ITEMS.slice(0, 3),
  },
  render: (args) => {
    const [value, setValue] = React.useState(args.items[0].value);
    return <Tabs {...args} value={value} onChange={setValue} />;
  },
};
