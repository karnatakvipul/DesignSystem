import * as React from "react";
import { AsyncDropdown } from "./AsyncDropdown";

const ACCOUNTS = [
  "Aaxis Nano",
  "Abc Industries Pvt Ltd",
  "Deewan Enterprises",
  "Imtb Engineers Pvt Ltd",
  "my Design System - Imtb Engineers Pvt Ltd",
  "Prima Equipment",
];

/** Stands in for a server: filters the list and answers after a short delay. */
function makeLoader({ delay = 450, fail = false, empty = false } = {}) {
  return (query) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (fail) return reject(new Error("Could not reach the server"));
        if (empty) return resolve([]);
        const q = (query || "").toLowerCase();
        resolve(
          ACCOUNTS.filter((a) => a.toLowerCase().includes(q)).map((a) => ({ value: a, label: a }))
        );
      }, delay);
    });
}

/**
 * A single-select dropdown that fetches its options from a server as you
 * type, rather than being handed the whole list up front.
 *
 * Use it wherever the option list is too big to ship to the client — an
 * account picker over thousands of accounts. Typing is debounced
 * (`debounceMs`), and responses that arrive out of order are discarded, so a
 * slow early request can never overwrite a fast later one.
 */
const meta = {
  title: "Components/Forms/AsyncDropdown",
  component: AsyncDropdown,
  tags: ["autodocs"],
  argTypes: {
    loadOptions: {
      control: false,
      description: "`(searchQuery) => Promise<{ value, label }[]>`. Also accepts `{ options }` or `{ data }`.",
    },
    value: { control: "text", description: "Currently selected value." },
    onChange: { action: "changed", description: "`(selectedValue, selectedOption) => void`." },
    label: { control: "text" },
    placeholder: { control: "text" },
    debounceMs: { control: { type: "number", min: 0, step: 50 }, description: "Delay before a keystroke triggers a fetch." },
    disabled: { control: "boolean" },
    className: { control: "text" },
  },
  args: {
    label: "Account",
    placeholder: "Select an option...",
    debounceMs: 300,
  },
  render: function Render(args) {
    const [value, setValue] = React.useState(args.value ?? "");
    return (
      <div className="w-80">
        <AsyncDropdown {...args} value={value} onChange={setValue} />
      </div>
    );
  },
};

export default meta;

/** Open it and type — options arrive after ~450ms. */
export const Playground = {
  args: { loadOptions: makeLoader() },
};

/** A deliberately slow endpoint, to show the in-menu loading state. */
export const Loading = {
  args: { loadOptions: makeLoader({ delay: 4000 }), label: "Account (slow server)" },
};

/** No match for the query — distinct from "still loading". */
export const NoResults = {
  args: { loadOptions: makeLoader({ empty: true }), label: "Account (no matches)" },
};

/** A rejected promise surfaces in the menu instead of failing silently. */
export const ErrorState = {
  args: { loadOptions: makeLoader({ fail: true }), label: "Account (server error)" },
};

export const Disabled = {
  args: { loadOptions: makeLoader(), disabled: true, value: "Prima Equipment" },
};
