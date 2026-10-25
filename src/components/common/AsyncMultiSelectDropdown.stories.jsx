import * as React from "react";
import { AsyncMultiSelectDropdown } from "./AsyncMultiSelectDropdown";

const SITES = [
  "Gmr Airport Hyderabad: Aemb Domestic Tank Terminal",
  "Noida Plant 1",
  "Noida Plant 2",
  "Noida Plant 3",
  "0.5 Mld Toka Stp Ulb: Stp_1_Outlet",
  "Pcc_Borivali",
  "K K Duplex & Paper Mills Pvt. Ltd.",
];

function makeLoader({ delay = 450, fail = false, empty = false } = {}) {
  return (query) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (fail) return reject(new Error("Could not reach the server"));
        if (empty) return resolve([]);
        const q = (query || "").toLowerCase();
        resolve(SITES.filter((s) => s.toLowerCase().includes(q)).map((s) => ({ value: s, label: s })));
      }, delay);
    });
}

/**
 * `AsyncDropdown`'s multi-select sibling — remote options, several selected at
 * once.
 *
 * `value` is an array and `onChange` hands back an array. Selected values stay
 * visible even when the current search does not match them, so narrowing the
 * search cannot silently drop a choice you already made.
 */
const meta = {
  title: "Components/Forms/AsyncMultiSelectDropdown",
  component: AsyncMultiSelectDropdown,
  tags: ["autodocs"],
  argTypes: {
    loadOptions: {
      control: false,
      description: "`(searchQuery) => Promise<{ value, label }[]>`. Also accepts `{ options }` or `{ data }`.",
    },
    value: { control: "object", description: "Array of selected values." },
    onChange: { action: "changed", description: "Receives the full array of selected values." },
    label: { control: "text" },
    placeholder: { control: "text" },
    debounceMs: { control: { type: "number", min: 0, step: 50 } },
    disabled: { control: "boolean" },
    className: { control: "text" },
  },
  args: {
    label: "Site",
    placeholder: "Select items...",
    debounceMs: 300,
  },
  render: function Render(args) {
    const [value, setValue] = React.useState(args.value ?? []);
    return (
      <div className="w-96">
        <AsyncMultiSelectDropdown {...args} value={value} onChange={setValue} />
      </div>
    );
  },
};

export default meta;

export const Playground = {
  args: { loadOptions: makeLoader() },
};

export const WithSelection = {
  args: { loadOptions: makeLoader(), value: ["Noida Plant 1", "Pcc_Borivali"] },
};

export const Loading = {
  args: { loadOptions: makeLoader({ delay: 4000 }), label: "Site (slow server)" },
};

export const NoResults = {
  args: { loadOptions: makeLoader({ empty: true }), label: "Site (no matches)" },
};

export const ErrorState = {
  args: { loadOptions: makeLoader({ fail: true }), label: "Site (server error)" },
};

export const Disabled = {
  args: { loadOptions: makeLoader(), disabled: true, value: ["Noida Plant 1"] },
};
