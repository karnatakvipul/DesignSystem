import * as React from "react";
import { SearchBox } from "./SearchBox";

const meta = {
  title: "Components/SearchBox",
  component: SearchBox,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;

/** Ctrl/Cmd+K focuses this input from anywhere on the page by default. */
export const Playground = {
  render: (args) => {
    const [value, setValue] = React.useState("");
    return (
      <div style={{ maxWidth: 320 }}>
        <SearchBox {...args} value={value} onChange={setValue} />
      </div>
    );
  },
};

export const WithFilterButton = {
  render: (args) => {
    const [value, setValue] = React.useState("");
    return (
      <div style={{ maxWidth: 320 }}>
        <SearchBox {...args} value={value} onChange={setValue} onFilterClick={() => {}} />
      </div>
    );
  },
};

export const NoShortcutHint = {
  render: (args) => {
    const [value, setValue] = React.useState("license key");
    return (
      <div style={{ maxWidth: 320 }}>
        <SearchBox {...args} value={value} onChange={setValue} showShortcutKey={false} />
      </div>
    );
  },
};
