import * as React from "react";
import { FilterPanel } from "./FilterPanel";
import { FilterField } from "./FilterField";
import { Dropdown } from "./Dropdown";
import { InputField } from "./InputField";
import { DateRangePicker } from "./DateRangePicker";
import { SearchBox } from "./SearchBox";
import { Button } from "./Button";

const ALL = [
  { value: "", label: "All" },
  { value: "Active", label: "Active" },
  { value: "Expired", label: "Expired" },
  { value: "Deactivated", label: "Deactivated" },
];

/**
 * The floating advanced-search popover, in the shape Gmail made familiar.
 *
 * It closes on outside click and Escape, and holds a draft until Search is
 * pressed — so setting five fields is one query, not five.
 *
 * Two props matter more than the rest:
 *
 * - **`layout`** — `"grid"` puts fields in two columns. `"rows"` gives a single
 *   stacked column, which is what `FilterField` needs: its labels only line up
 *   if every row spans the full width.
 * - **`actionAlign`** — `"start"` keeps Search/Clear on the left; `"end"` moves
 *   them right and reverses them, so the primary action is rightmost, matching
 *   the usual dialog convention.
 *
 * `attached` fuses the panel to the control above it (a `SearchBox` with
 * `filtersOpen`), dropping the shared edge so the two read as one surface.
 */
const meta = {
  title: "Components/Filters/FilterPanel",
  component: FilterPanel,
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    onClose: { action: "closed", description: "Outside click, Escape, or the header's X." },
    onSearch: { action: "search", description: "Apply the draft. The panel renders no Search button without this." },
    onClear: { action: "clear", description: "Reset the draft. Omit to hide the Clear button." },
    activeCount: { control: { type: "number", min: 0 }, description: "Drives the count badge in the header." },
    title: { control: "text" },
    showHeader: { control: "boolean", description: "Defaults to `false` — the header with title, badge and X." },
    position: { control: "text", description: "Positioning classes. Override to anchor it elsewhere." },
    width: { control: "inline-radio", options: ["default", "full"] },
    layout: {
      control: "inline-radio",
      options: ["grid", "rows"],
      description: '`"grid"` = two columns; `"rows"` = one stacked column (required by `FilterField`).',
    },
    actionAlign: {
      control: "inline-radio",
      options: ["start", "end"],
      description: '`"end"` moves the actions right and puts the primary one last.',
    },
    searchLabel: { control: "text" },
    clearLabel: { control: "text" },
    attached: { control: "boolean", description: "Fuses the panel to the control directly above it." },
    className: { control: "text" },
    children: { control: false },
  },
  args: {
    open: true,
    title: "Advanced Search Filter",
    showHeader: true,
    width: "default",
    layout: "rows",
    actionAlign: "end",
    searchLabel: "Search",
    clearLabel: "Clear filters",
    activeCount: 2,
    attached: false,
  },
  render: (args) => (
    <div className="relative h-[30rem] w-[40rem]">
      <FilterPanel {...args} position="absolute top-0 left-0 z-[100] shadow-floating">
        <FilterField label="Product" labelAlign="left">
          <Dropdown options={ALL} value="" onChange={() => {}} />
        </FilterField>
        <FilterField label="License Status" labelAlign="left">
          <Dropdown options={ALL} value="" onChange={() => {}} />
        </FilterField>
        <FilterField label="Performa Invoice" labelAlign="left">
          <InputField placeholder="PIC260316" />
        </FilterField>
        <FilterField label="Upcoming Renewal" labelAlign="left">
          <DateRangePicker />
        </FilterField>
      </FilterPanel>
    </div>
  ),
};

export default meta;

export const Playground = {};

/** `"rows"` is what `FilterField` needs — in `"grid"` the labels stop lining up. */
export const Layouts = {
  render: () => (
    <div className="flex flex-col gap-8">
      {["rows", "grid"].map((layout) => (
        <div key={layout}>
          <p className="mb-2 text-body-sm text-ink-muted">layout=&quot;{layout}&quot;</p>
          <div className="relative h-72 w-[40rem]">
            <FilterPanel
              open
              layout={layout}
              actionAlign="end"
              onSearch={() => {}}
              onClear={() => {}}
              position="absolute top-0 left-0 z-[100] shadow-floating"
            >
              <FilterField label="Product" labelAlign="left">
                <Dropdown options={ALL} value="" onChange={() => {}} />
              </FilterField>
              <FilterField label="License Status" labelAlign="left">
                <Dropdown options={ALL} value="" onChange={() => {}} />
              </FilterField>
            </FilterPanel>
          </div>
        </div>
      ))}
    </div>
  ),
};

/** `"end"` reverses the row so the primary action is rightmost — the dialog convention. */
export const ActionAlignment = {
  render: () => (
    <div className="flex flex-col gap-8">
      {["start", "end"].map((align) => (
        <div key={align}>
          <p className="mb-2 text-body-sm text-ink-muted">actionAlign=&quot;{align}&quot;</p>
          <div className="relative h-56 w-[40rem]">
            <FilterPanel
              open
              layout="rows"
              actionAlign={align}
              searchLabel="Search"
              clearLabel="Clear filters"
              onSearch={() => {}}
              onClear={() => {}}
              position="absolute top-0 left-0 z-[100] shadow-floating"
            >
              <FilterField label="Product" labelAlign="left">
                <Dropdown options={ALL} value="" onChange={() => {}} />
              </FilterField>
            </FilterPanel>
          </div>
        </div>
      ))}
    </div>
  ),
};

/** With no header the panel is just fields and actions — used when the opening control already names it. */
export const WithoutHeader = {
  args: { showHeader: false },
};

/** `attached` fuses the panel to the `SearchBox` above it, so the two read as one surface. */
export const AttachedToSearchBox = {
  render: function Render() {
    const [open, setOpen] = React.useState(true);
    return (
      <div className="relative w-[40rem]">
        <SearchBox placeholder="Search Data" filtersOpen={open} onFilterClick={() => setOpen((v) => !v)} />
        <FilterPanel
          open={open}
          attached
          width="full"
          layout="rows"
          actionAlign="end"
          searchLabel="Search"
          clearLabel="Clear filters"
          onClose={() => setOpen(false)}
          onSearch={() => setOpen(false)}
          onClear={() => {}}
          position="absolute top-full left-0 right-0 z-[100] mt-0"
        >
          <FilterField label="Product" labelAlign="left">
            <Dropdown options={ALL} value="" onChange={() => {}} />
          </FilterField>
          <FilterField label="License Status" labelAlign="left">
            <Dropdown options={ALL} value="" onChange={() => {}} />
          </FilterField>
        </FilterPanel>
      </div>
    );
  },
};

/** Opened and closed from a button, as it behaves in the app. */
export const Interactive = {
  render: function Render() {
    const [open, setOpen] = React.useState(false);
    const [count, setCount] = React.useState(0);
    return (
      <div className="relative h-96 w-[40rem]">
        <Button onClick={() => setOpen((v) => !v)}>{open ? "Hide" : "Show"} filters</Button>
        <FilterPanel
          open={open}
          showHeader
          activeCount={count}
          layout="rows"
          actionAlign="end"
          onClose={() => setOpen(false)}
          onSearch={() => {
            setCount(2);
            setOpen(false);
          }}
          onClear={() => setCount(0)}
          position="absolute top-12 left-0 z-[100] shadow-floating"
        >
          <FilterField label="Product" labelAlign="left">
            <Dropdown options={ALL} value="" onChange={() => {}} />
          </FilterField>
          <FilterField label="License Status" labelAlign="left">
            <Dropdown options={ALL} value="" onChange={() => {}} />
          </FilterField>
        </FilterPanel>
      </div>
    );
  },
};
